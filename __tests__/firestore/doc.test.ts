import {
  FakeDocRef,
  FakeFirestore,
  FakeCollectionRef,
  jestMocks,
  DocDataRef,
  CollectionDataRef,
  FakeDocSnapshot,
  FakeFieldPath,
  FakeFieldValue,
  FakeTimestamp
} from "../import";
import { MockDatabase, DocData } from "types";
import { getObjectRef } from "../utils/helpers";
import { firestoreFakeDatabase } from "../test-database";

const fakeDocMock = jestMocks.doc;

let fakeDb: MockDatabase;
let fakeDocData: DocData;
let fakeFirestore: FakeFirestore;

beforeEach(() => {
  // Reset jest before each test
  jest.resetAllMocks();
  fakeDb = getObjectRef(firestoreFakeDatabase);
  fakeDocData = getObjectRef(firestoreFakeDatabase.collection_test.docs[0]);

  // Set a new instance of FakeFirestore
  fakeFirestore = new FakeFirestore(fakeDb);
});

// Doc global info
const collectionPath = "collection_test";
const docId = "doc_1";
const docPath = `${collectionPath}/${docId}`;

it("should create a instance of FakeDocRef", () => {
  const doc = new FakeDocRef(fakeFirestore, docPath);

  // Check doc properties
  expect(doc.firestore).toBeInstanceOf(FakeFirestore);
  expect(doc.id).toBe(docId);
  expect(doc.path).toBe(docPath);
  expect(doc.parentPath).toBe(collectionPath);
  expect(doc.parent).toBeInstanceOf(FakeCollectionRef);

  // Check constructor calls
  expect(fakeDocMock.constructor.mock.calls.length).toBe(1);
  expect(fakeDocMock.constructor.mock.calls[0]).toEqual([fakeFirestore, docPath]);
});

describe("Test FakeDocRef methods", () => {
  let doc: FakeDocRef;
  let docDataRef: DocDataRef;
  let collectionDataRef: CollectionDataRef;

  beforeEach(() => {
    // Set a new instance of DocDataRef before each test
    doc = new FakeDocRef(fakeFirestore, docPath);
    docDataRef = fakeFirestore.database.get(docPath, "doc");

    collectionDataRef = fakeFirestore.database.get(collectionPath, "collection");
  });

  it("should get a FakeCollectionRef from doc.collection()", () => {
    const subcollectionPath = "sub_collection_1";
    const collection = doc.collection(subcollectionPath);

    // Check collection instance and path
    expect(collection).toBeInstanceOf(FakeCollectionRef);
    expect(collection.id).toBe(subcollectionPath);

    // Check collection method calls
    expect(fakeDocMock.collection.mock.calls.length).toBe(1);
    expect(fakeDocMock.collection.mock.calls[0][0]).toBe(subcollectionPath);
  });

  it("should list all subcollections of this document with listCollections()", async () => {
    const subcollections: FakeCollectionRef[] = await doc.listCollections();

    const isEveryFakeCollectionRef = subcollections.every(sub => sub instanceof FakeCollectionRef);
    const subCollectionNames = subcollections.map(sub => sub.id);
    const expectedSubcollectionNames = Object.keys(fakeDocData.subcollections);

    expect(isEveryFakeCollectionRef).toBeTruthy();
    expect(subCollectionNames).toEqual(expectedSubcollectionNames);

    expect(fakeDocMock.listCollections.mock.calls.length).toBe(1);
  });

  it("should create a new doc with create()", async () => {
    const id = "new-doc-id";
    const path = `${collectionPath}/${id}`;
    const data = { new: "data" };
    const newDoc = new FakeDocRef(fakeFirestore, path);

    await newDoc.create(data);

    const expextedData = fakeFirestore.database.get(path, "doc");
    expect(data).toEqual(expextedData.docData.data);

    expect(fakeDocMock.create.mock.calls.length).toBe(1);
    expect(fakeDocMock.create.mock.calls[0][0]).toEqual(data);
  });

  it("should throw an error trying to create new doc with create() methods", async () => {
    expect(() => doc.create({})).rejects.toThrow();

    expect(fakeDocMock.create.mock.calls.length).toBe(1);
    expect(fakeDocMock.create.mock.calls[0][0]).toEqual({});
  });

  it("should call set() method without options", async () => {
    const setData = { new: "data" };
    const setOtherData = { new: "new data" };

    await doc.set(setData);
    expect(docDataRef.data).toEqual(setData);

    await doc.set(setOtherData, {});
    expect(docDataRef.data).toEqual(setOtherData);

    // Check set calls
    expect(fakeDocMock.set.mock.calls.length).toBe(2);
    expect(fakeDocMock.set.mock.calls[0][0]).toEqual(setData);
    expect(fakeDocMock.set.mock.calls[1][0]).toEqual(setOtherData);
  });

  it("should call set() method whith merge option", async () => {
    const setData = { new: "data" };
    const dataBefore = getObjectRef(docDataRef.data);

    // Merge data
    const mergedData = { ...dataBefore, ...setData };
    await doc.set(setData, { merge: true });
    expect(docDataRef.docData.data).toEqual(mergedData);

    // Merge overwriting a field
    const newSetData = { new: "another data", random: "and another one" };
    const newMergedData = { ...docDataRef.data, ...newSetData };
    await doc.set(newSetData, { merge: true });
    expect(docDataRef.docData.data).toEqual(newMergedData);

    // Check set calls
    expect(fakeDocMock.set.mock.calls.length).toBe(2);
    expect(fakeDocMock.set.mock.calls[0][0]).toEqual(setData);
    expect(fakeDocMock.set.mock.calls[1]).toEqual([newSetData, { merge: true }]);
  });

  it("should call set() method whith mergeFields option", async () => {
    const setData = { data: { data_1: "data", data_2: "another data" } };
    const mergePaths = ["data.data_1", "data.data_2"];
    const dataBefore = getObjectRef(docDataRef.docData.data);

    await doc.set(setData, { mergeFields: mergePaths });

    const mergedData = { ...dataBefore, ...setData };
    expect(docDataRef.docData.data).toEqual(mergedData);

    // Merge overwriting a field
    const newSetData = { data: { data_1: "new data", data_3: "data data" }, data_amounts: 3 };
    const newMergedPaths = ["data.data_1", "data.data_3", "data_amounts"];
    // Set new merged data value
    const newMergedData = { ...docDataRef.data };
    newMergedData.data.data_1 = newSetData.data.data_1;
    newMergedData.data.data_3 = newSetData.data.data_3;
    newMergedData.data_amounts = newSetData.data_amounts;

    await doc.set(newSetData, { mergeFields: newMergedPaths });
    expect(docDataRef.data).toEqual(newMergedData);

    // Check set calls
    expect(fakeDocMock.set.mock.calls.length).toBe(2);
    expect(fakeDocMock.set.mock.calls[0]).toEqual([setData, { mergeFields: mergePaths }]);
    expect(fakeDocMock.set.mock.calls[1]).toEqual([newSetData, { mergeFields: newMergedPaths }]);
  });

  it("should thow errors for set() method", () => {
    const setData = { new: "data" };

    // Should throw because both merge and mergeFields is specified
    expect(() => doc.set(setData, { merge: true, mergeFields: [] })).rejects.toThrow();

    // Should throw because data is undefined
    const dataWithUndefined = { new: undefined };
    expect(() => doc.set(dataWithUndefined)).rejects.toThrow();

    // Check set calls
    expect(fakeDocMock.set.mock.calls.length).toBe(2);
    expect(fakeDocMock.set.mock.calls[0]).toEqual([setData, { merge: true, mergeFields: [] }]);
    expect(fakeDocMock.set.mock.calls[1][0]).toEqual(dataWithUndefined);
  });

  it("should set data with FakeFieldValues with set() method", () => {
    const newData = {
      timestamp: FakeFieldValue.serverTimestamp()
    };

    doc.set(newData, { merge: true });

    expect(docDataRef.data.timestamp).toBeInstanceOf(FakeTimestamp);

    // Check set calls
    expect(fakeDocMock.set.mock.calls.length).toBe(1);
    expect(fakeDocMock.set.mock.calls[0]).toEqual([newData, { merge: true }]);
  });

  it("should update the fields in doc data with update() method", async () => {
    const data = { foo: "new bar", bar: { baz: "new foo" } };

    await doc.update(data);

    expect(docDataRef.docData.data).toEqual(data);

    // Check set calls
    expect(fakeDocMock.update.mock.calls.length).toBe(1);
    expect(fakeDocMock.update.mock.calls[0][0]).toEqual(data);
  });

  it("should update the fields doc data with values with field values on update() method", async () => {
    const data_1 = { foo: "new bar" };
    const path_1 = new FakeFieldPath("foo");

    const data_2 = { baz: "new foo" };
    const path_2 = "baz";

    const data_3 = { obj: { foo: { bar: { baz: "data" } } } };
    const path_3 = "obj.foo.bar.baz";

    const newData = { ...data_1, ...data_2, ...data_3 };
    await doc.update(path_1, data_1, path_2, data_2, path_3, data_3);

    expect(docDataRef.docData.data).toEqual(newData);

    // Check set calls
    expect(fakeDocMock.update.mock.calls.length).toBe(1);
    const args: any[] = [path_1, data_1, path_2, data_2, path_3, data_3];
    expect(fakeDocMock.update.mock.calls[0]).toEqual(args);
  });

  it("should throw an error when trying to update a non existing doc with update()", () => {
    const path = `non_existing_collection/non_existing_doc`;
    const newDoc = new FakeDocRef(fakeFirestore, path);

    expect(() => newDoc.update({})).rejects.toThrow();

    expect(fakeDocMock.update.mock.calls.length).toBe(1);
  });

  it("should delete the doc on database with delete() method", () => {
    doc.delete();

    const searchDoc = collectionDataRef.findDoc(doc.id);
    expect(searchDoc).toBeUndefined();
    expect(fakeDocMock.delete.mock.calls.length).toBe(1);
  });

  it("should get the doc data with get() method", async () => {
    const docSnap = await doc.get();

    expect(docSnap).toBeInstanceOf(FakeDocSnapshot);
    expect(docSnap.id).toBe(doc.id);
    expect(docSnap.data()).toEqual(docDataRef.data);

    expect(fakeDocMock.get.mock.calls.length).toBe(1);
  });

  it("should get a non exisiting docwith get() method", async () => {
    const path = `non_existing_collection/${docId}`;
    const newDoc = new FakeDocRef(fakeFirestore, path);
    const docSnap = await newDoc.get();

    expect(docSnap).toBeInstanceOf(FakeDocSnapshot);
    expect(docSnap.id).toBe(newDoc.id);
    expect(docSnap.data()).toEqual({});

    expect(fakeDocMock.get.mock.calls.length).toBe(1);
  });
});

it("should create a instance of FakeDocSnapshot", () => {
  const docData = { data: "random data" };
  const docId = "doc";
  const docPath = `collection/${docId}`;

  const doc = new FakeDocRef(fakeFirestore, docPath);
  const docSnap = new FakeDocSnapshot(doc, docData);

  expect(docSnap.data()).toEqual(docData);
  expect(docSnap.id).toBe("doc");
});
