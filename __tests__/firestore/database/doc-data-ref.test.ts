import {
  DocDataRef,
  CollectionDataRef,
  FakeFieldPath,
  jestMocks,
  FakeFieldValue,
  FakeTimestamp
} from "../../import";
import { firestoreFakeDatabase } from "../../test-database";
import { DocData, FakeSetOptions } from "types";
import { getObjectRef } from "../../utils/helpers";

// Jest mock functions of fakedatabase
const docMock = jestMocks.fakeDatabase.doc;
// Get the test doc data
let fakeDocData = getObjectRef(firestoreFakeDatabase.collection_test.docs[0]);
const fakeDocPath = `collection_test/${fakeDocData.id}`;

beforeEach(() => {
  // Reset jest before each test
  jest.resetAllMocks();
  fakeDocData = getObjectRef(firestoreFakeDatabase.collection_test.docs[0]);
});

it("should create an instance of DocDataRef with subcollections", () => {
  const doc = new DocDataRef(fakeDocData, fakeDocPath);

  // Check if all subcollections are instance of CollectionDataRef
  const isAllCollectionDataRef = Object.values<CollectionDataRef>(doc.subcollections).every(
    sub => sub instanceof CollectionDataRef
  );

  // Check doc properties
  expect(doc.docData).toEqual(fakeDocData);
  expect(doc.data).toEqual(fakeDocData.data);
  expect(doc.path).toBe(fakeDocPath);
  expect(doc.id).toBe(fakeDocData.id);
  expect(isAllCollectionDataRef).toBeTruthy();
  // Check constructor calls
  expect(docMock.constructor.mock.calls.length).toBeGreaterThanOrEqual(1);
  expect(docMock.constructor.mock.calls[0]).toEqual([fakeDocData, fakeDocPath]);
});

it("should create an instance of DocDataRef with no subcollections", () => {
  const path = "collection_test/doc";
  const docData: DocData = {
    id: "doc",
    data: { foo: "bar" }
  };
  const doc = new DocDataRef(docData, path);

  // Check doc subcollecions
  expect(doc.subcollections).toEqual({});
  // Check constructor calls
  expect(docMock.constructor.mock.calls.length).toBe(1);
  expect(docMock.constructor.mock.calls[0][0]).toEqual(docData);
});

it("should change the doc data", () => {
  const path = "collection_test/doc";
  const docData: DocData = {
    id: "doc",
    data: { foo: "bar" }
  };
  const doc = new DocDataRef(docData, path);
  const newData = {
    new: "data"
  };

  doc.data = newData;

  expect(docMock.data.mock.calls.length).toBe(1);
  expect(docMock.data.mock.calls[0][0]).toEqual(newData);
});

describe("Test DocDataRef methods", () => {
  let doc: DocDataRef;

  beforeEach(() => {
    // Set a new instance of DocDataRef before each test
    doc = new DocDataRef(fakeDocData, fakeDocPath);
  });

  it("should get a subcollection in the doc", () => {
    const subcollectionPath = Object.keys(fakeDocData.subcollections)[0];
    const subcollection = doc.getSubcollection(subcollectionPath);

    // Check subcollection
    expect(subcollection).toBeInstanceOf(CollectionDataRef);
    expect(subcollection).toEqual(doc.subcollections[subcollectionPath]);
    // Check getCollection calls
    expect(docMock.getSubcollection.mock.calls.length).toBe(1);
    expect(docMock.getSubcollection.mock.calls[0][0]).toBe(subcollectionPath);
  });

  it("should create one subcollection with data and one without", () => {
    const subcollecionId1 = "sub_collection_2";
    const data = [{ id: "doc_1_1", data: { bar: "foo" } }];
    const subcollecionId2 = "sub_collection_3";

    const subcollection1 = doc.createSubcollection(subcollecionId1, data);
    const subcollection2 = doc.createSubcollection(subcollecionId2);

    // Check subcollections
    expect(subcollection1).toBeInstanceOf(CollectionDataRef);
    expect(subcollection2).toBeInstanceOf(CollectionDataRef);
    expect(subcollection1).toEqual(doc.getSubcollection(subcollecionId1));
    expect(subcollection2).toEqual(doc.getSubcollection(subcollecionId2));
    // Check getCollection calls
    expect(docMock.createSubcollection.mock.calls.length).toBe(2);
    expect(docMock.createSubcollection.mock.calls[0]).toEqual([subcollecionId1, data]);
    expect(docMock.createSubcollection.mock.calls[1][0]).toBe(subcollecionId2);
  });

  it("should create a subcollection path", () => {
    const subcollecionId = "sub_collection_2";
    const subCollectionPath = doc.subcollectionPath(subcollecionId);

    expect(subCollectionPath).toBe(`${doc.path}/${subcollecionId}`);
    // Check subcollectionPath calls
    expect(docMock.subcollectionPath.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it("should just change the doc data in the doc", () => {
    const oldData = Object.assign({}, doc.data);
    const newData = { new: "data", nested: { data: "another data" } };

    doc.setDataInDocData(newData);

    expect(doc.data).toEqual(newData);
    expect(doc.data).not.toEqual(oldData);

    expect(docMock.setDataInDocData.mock.calls.length).toBe(1);
    expect(docMock.setDataInDocData.mock.calls[0][0]).toEqual(newData);
  });

  it("should change the doc data by adding a new field with merge option", () => {
    const oldData = Object.assign({}, doc.data);
    const newData = { new: "data" };
    const targetData = { ...oldData, ...newData };
    const options: FakeSetOptions = { merge: true };

    doc.setDataInDocData(newData, options);

    expect(doc.data).toEqual(targetData);
    expect(doc.data).not.toEqual(oldData);

    expect(docMock.setDataInDocData.mock.calls.length).toBe(1);
    expect(docMock.setDataInDocData.mock.calls[0][0]).toEqual(newData);
  });

  it("should change the doc data by adding whith the fields provided in mergeField options", () => {
    // Create a new doc for this test
    const newDocData: DocData = {
      data: {
        foo: {
          bar: {
            test: 1
          },
          baz: {
            test: 2
          }
        },
        random: {
          data: "object"
        }
      },
      id: "random-id"
    };
    const newDoc = new DocDataRef(newDocData, `random-collection/${newDocData.id}`);

    // Set arguments for change with string
    const newDataForStringPath = {
      foo: {
        bar: {
          test: 3
        }
      },
      non: {
        existing: {
          data: "before"
        }
      }
    };
    const stringPath = ["foo.bar.test", "non.existing.data", "wrong.path"];
    const stringPathOptions: FakeSetOptions = { mergeFields: stringPath };

    newDoc.setDataInDocData(newDataForStringPath, stringPathOptions);
    // Expect the new data to be placed
    expect(newDoc.data.foo.bar.test).toEqual(newDataForStringPath.foo.bar.test);
    expect(docMock.setDataInDocData.mock.calls[0]).toEqual([
      newDataForStringPath,
      stringPathOptions
    ]);

    // Set arguments for change with FakeFieldPath
    const newDataForFieldPath = { random: { data: "other object" } };
    const fieldPath = new FakeFieldPath("random", "data");
    const fieldPathOptions: FakeSetOptions = { mergeFields: [fieldPath] };

    newDoc.setDataInDocData(newDataForFieldPath, fieldPathOptions);
    // Expect the new data to be placed
    expect(newDoc.data.random.data).toEqual(newDataForFieldPath.random.data);
    expect(docMock.setDataInDocData.mock.calls[1]).toEqual([newDataForFieldPath, fieldPathOptions]);
    // Expect just 2 calls
    expect(docMock.setDataInDocData.mock.calls.length).toBe(2);
  });

  it("should set a data with FakeFieldValue", () => {
    // Create a new doc for this test
    const newDocData: DocData = {
      data: {
        foo: "bar",
        number_1: 5,
        number_2: 3,
        num_arr: [1, 2, 3],
        obj_arr: [{ obj: 1 }, { obj: 2 }]
      },
      id: "random-id"
    };
    const newDoc = new DocDataRef(newDocData, `random-collection/${newDocData.id}`);

    // Set all cases to test FakeFieldValue
    const newData = {
      serverTimestamp: FakeFieldValue.serverTimestamp(),
      foo: FakeFieldValue.delete(),
      number_1: FakeFieldValue.increment(10),
      number_2: FakeFieldValue.increment(-2),
      number_3: FakeFieldValue.increment(7),
      num_arr: FakeFieldValue.arrayUnion(4, 5, 6),
      obj_arr: FakeFieldValue.arrayRemove({ obj: 2 }, { obj: 3 }),
      non_existing_str_arr: FakeFieldValue.arrayUnion("a", "b", "c"),
      non_existing_arr: FakeFieldValue.arrayRemove("random value", "another random value")
    };

    newDoc.setDataInDocData(newData, { merge: true });

    expect(newDoc.data.serverTimestamp).toBeInstanceOf(FakeTimestamp);
    expect(newDoc.data.foo).toBeUndefined();

    expect(newDoc.data.number_1).toBe(15);
    expect(newDoc.data.number_2).toBe(1);
    expect(newDoc.data.number_3).toBe(7);

    expect(newDoc.data.num_arr).toEqual([1, 2, 3, 4, 5, 6]);
    expect(newDoc.data.obj_arr).toEqual([{ obj: 1 }]);

    expect(newDoc.data.non_existing_str_arr).toEqual(["a", "b", "c"]);
    expect(newDoc.data.non_existing_arr).toEqual([]);

    expect(docMock.setDataInDocData.mock.calls.length).toBe(1);
    expect(docMock.setDataInDocData.mock.calls[0]).toEqual([newData, { merge: true }]);
  });

  it("should set a date value as FakeTimestamp", () => {
    const date = new Date();
    const newData = { date };

    doc.setDataInDocData(newData);

    expect(doc.data.date).toBeInstanceOf(FakeTimestamp);

    expect(docMock.setDataInDocData.mock.calls.length).toBe(1);
    expect(docMock.setDataInDocData.mock.calls[0][0]).toEqual(newData);
  });

  it("should get a subcollection, nested subcollection and a non existing subcollection", () => {
    const subcollectionPath: string = Object.keys(fakeDocData.subcollections)[0];
    const subcollectionData = fakeDocData.subcollections[subcollectionPath].docs;

    const nestedDoc = fakeDocData.subcollections[subcollectionPath].docs[0];
    const nestedSubcollectionId = Object.keys(nestedDoc.subcollections)[0];
    const nestedSubcollectionPath: string[] = [
      subcollectionPath,
      nestedDoc.id,
      nestedSubcollectionId
    ];
    const nestedSubcollectionData = nestedDoc.subcollections[nestedSubcollectionId].docs;

    const subcollection = doc.getCollection([subcollectionPath]) as CollectionDataRef;
    const nestedSubcollection = doc.getCollection(nestedSubcollectionPath) as CollectionDataRef;
    const noExistinSubcollection = doc.getCollection([]) as CollectionDataRef;

    // Expect the subcollection to be instance of CollectionDataRef
    expect(subcollection).toBeInstanceOf(CollectionDataRef);
    expect(nestedSubcollection).toBeInstanceOf(CollectionDataRef);

    // Check the docData in docs array
    expect(subcollection.docs.map(doc => doc.docData)).toEqual(subcollectionData);
    expect(nestedSubcollection.docs.map(doc => doc.docData)).toEqual(nestedSubcollectionData);
    expect(noExistinSubcollection).toBeNull();

    // Check get doc calls
    expect(docMock.getCollection.mock.calls.length).toBe(4);
    expect(docMock.getCollection.mock.calls[0][0]).toEqual([subcollectionPath]);
    expect(docMock.getCollection.mock.calls[1][0]).toEqual(nestedSubcollectionPath);
    expect(docMock.getCollection.mock.calls[2][0]).toEqual([nestedSubcollectionPath[2]]);
    expect(docMock.getCollection.mock.calls[3][0]).toEqual([]);
  });

  it("should create a path of of a new subcollection, a new nested subcollection and nested subcollection", () => {
    const newSubcollectionPath = ["sub_collection_2"];
    const newNestedSubCollectionPath = ["sub_collection_3", "doc_1_1", "sub_collection_3_1"];
    const nestedSubCollectionPath = ["sub_collection_1", "doc_1_1", "sub_collection_1_2"];

    const newSubcollection = doc.createPath(newSubcollectionPath) as CollectionDataRef;
    const newNestedSubCollection = doc.createPath(newNestedSubCollectionPath) as CollectionDataRef;
    const nestedSubCollection = doc.createPath(nestedSubCollectionPath) as CollectionDataRef;

    // Exprect the subcollections to be a instance of CollectionDataRef
    expect(newSubcollection).toBeInstanceOf(CollectionDataRef);
    expect(newNestedSubCollection).toBeInstanceOf(CollectionDataRef);
    expect(nestedSubCollection).toBeInstanceOf(CollectionDataRef);

    // Check value to be an empty array
    expect(newSubcollection.docs).toEqual([]);
    expect(newNestedSubCollection.docs).toEqual([]);
    expect(nestedSubCollection.docs).toEqual([]);

    expect(docMock.createPath.mock.calls.length).toBeGreaterThanOrEqual(3);
  });
});
