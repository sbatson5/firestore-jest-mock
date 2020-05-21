import { firestoreFakeDatabase } from "../../test-database";
import { CollectionDataRef, DocDataRef, jestMocks } from "../../import";
import { DocData } from "types";

// Jest mock functions of fakedatabase
const collectionMock = jestMocks.fakeDatabase.collection;
// Get the test collection data
let collectionData = Object.assign({}, firestoreFakeDatabase.collection_test);
const collectionPath = "collection_test";
// Get an array with the docs data
const collectionFakeDocsData = collectionData.docs.map(doc => doc.data);

beforeEach(() => {
  // Reset jest before each test
  jest.resetAllMocks();
  collectionData = Object.assign({}, firestoreFakeDatabase.collection_test);
});

it("should create a instance of CollectionDataRef with a DocData object", () => {
  // Create a instance of CollectionDataRef
  const collectionDataRef = new CollectionDataRef(collectionData, collectionPath);

  // Check if every doc in docs array is a DocDataRef
  const isEveryDocDataRef = collectionDataRef.docs.every(doc => doc instanceof DocDataRef);
  // Map the docs FakeDocData
  const docData = collectionDataRef.docs.map(doc => doc.data);

  expect(collectionMock.constructor.mock.calls.length).toBeGreaterThanOrEqual(1);
  expect(isEveryDocDataRef).toBeTruthy();
  expect(docData).toEqual(collectionFakeDocsData);
  expect(collectionDataRef.id).toBe(collectionPath);
});

it("should create a instance of CollectionDataRef with a DocDataRef instance", () => {
  // Create a instance of CollectionDataRef
  const collectionPath = "collection_test";
  const data = { docs: collectionData.docs.map(docData => new DocDataRef(docData, "")) };
  const collectionDataRef = new CollectionDataRef(data, collectionPath);

  // Check if every doc in docs array is a DocDataRef
  const isEveryDocDataRef = collectionDataRef.docs.every(doc => doc instanceof DocDataRef);
  // Map the docs FakeDocData
  const docData = collectionDataRef.docs.map(doc => doc.data);

  expect(collectionMock.constructor.mock.calls.length).toBeGreaterThanOrEqual(1);
  expect(docData).toEqual(collectionFakeDocsData);
  expect(collectionDataRef.id).toBe(collectionPath);
});

describe("Test CollectionDataRef methods", () => {
  let collectionDataRef: CollectionDataRef;

  beforeEach(() => {
    // Set a new instance of CollectionDataRef before each test
    collectionDataRef = new CollectionDataRef(collectionData, collectionPath);
    // reset jest after instanciate CollectionDataRef
    jest.resetAllMocks();
  });

  it("should create a string with the new doc path", () => {
    const docId: string = "fake-doc-id";
    const docPath = collectionDataRef.docPath(docId);

    expect(docPath).toBe(`${collectionDataRef.path}/${docId}`);
    // Check docPath calls
    expect(collectionMock.docPath.mock.calls.length).toBe(1);
    expect(collectionMock.docPath.mock.calls[0][0]).toBe(docId);
  });

  it("should add a new doc to the end of docs array", () => {
    const fakeDocData: DocData = {
      subcollections: {
        col: {
          docs: []
        }
      },
      id: "random-id",
      data: {
        data: "data"
      }
    };

    collectionDataRef.push(fakeDocData);

    const docIndex: number = collectionDataRef.docs.findIndex(doc => doc.id === fakeDocData.id);
    const docData: DocData = collectionDataRef.docs[docIndex].docData;
    const docsLastIndex: number = collectionDataRef.docs.length - 1;

    // Expect the to be equal the objects
    expect(docData).toEqual(fakeDocData);
    expect(docIndex).toBe(docsLastIndex);
    // CollectionDataRef push call
    expect(collectionMock.push.mock.calls.length).toBe(1);
    expect(collectionMock.push.mock.calls[0][0]).toEqual(docData);
  });

  it("should find a doc in collectionDataRef", () => {
    const docData = collectionData.docs[0];
    const docId = docData.id;
    const doc = collectionDataRef.findDoc(docId);

    expect(doc.data).toBe(docData.data);
    // CollectionDataRef findDoc calls
    expect(collectionMock.findDoc.mock.calls.length).toBe(1);
    expect(collectionMock.findDoc.mock.calls[0][0]).toBe(docId);
  });

  it("should delete a doc from collectionDataRef", () => {
    // Delete an existing doc
    const id = collectionData.docs[0].id;
    collectionDataRef.deleteDoc(id);
    const doc = collectionDataRef.findDoc(id);

    // Delete a non existing doc
    const nonExistingId = "";
    collectionDataRef.deleteDoc(nonExistingId);

    expect(doc).toBeUndefined();
    // CollectionDataRef deleteDoc calls
    expect(collectionMock.deleteDoc.mock.calls.length).toBe(2);
    expect(collectionMock.deleteDoc.mock.calls[0][0]).toBe(id);
    expect(collectionMock.deleteDoc.mock.calls[1][0]).toBe(nonExistingId);
  });

  it("should get a doc, a nested doc and a non existing don in collectionDataRef", () => {
    // Get a doc path and data
    const docPath = collectionData.docs[0].id;
    const docData = collectionData.docs[0];

    // Get a nested doc path and data
    const subCollectionName = Object.keys(collectionData.docs[0].subcollections)[0];
    const nestedDocId = collectionData.docs[0].subcollections[subCollectionName].docs[0].id;
    const nestedPath = [docPath, subCollectionName, nestedDocId];
    const nestedDocData = collectionData.docs[0].subcollections.sub_collection_1.docs[0];

    // Get the docs reference
    const doc: DocDataRef = collectionDataRef.getDoc([docPath]) as DocDataRef;
    const nestedDoc: DocDataRef = collectionDataRef.getDoc(nestedPath) as DocDataRef;
    const notExistingDoc = collectionDataRef.getDoc([]);

    // Expected doc and nestedDoc to be DocDataRef
    expect(doc).toBeInstanceOf(DocDataRef);
    expect(nestedDoc).toBeInstanceOf(DocDataRef);

    // Check docs data
    expect(doc.data).toEqual(docData.data);
    expect(nestedDoc.data).toEqual(nestedDocData.data);
    expect(notExistingDoc).toBeNull();

    // Check getDoc calls
    expect(collectionMock.getDoc.mock.calls.length).toBe(4);
    expect(collectionMock.getDoc.mock.calls[0][0]).toEqual([docPath]);
    expect(collectionMock.getDoc.mock.calls[1][0]).toEqual(nestedPath);
    expect(collectionMock.getDoc.mock.calls[2][0]).toEqual([nestedPath[2]]);
    expect(collectionMock.getDoc.mock.calls[3][0]).toEqual([]);
  });

  it("should create two docs and one nested doc in the collection", () => {
    // Set the id and data for the docs creation
    const docPath1 = ["doc_3"];
    const docData = {
      data: "docData"
    };
    const docPath2 = ["doc_4"];
    const nestedDocPath = ["doc_5", "sub_collection_1", "doc_5_1"];
    const nestedDocData = {
      data: "nestedData"
    };

    // Create a doc, a nested doc and a doc with no data
    const createdDoc1 = collectionDataRef.createPath(docPath1, docData) as DocDataRef;
    const createdDoc2 = collectionDataRef.createPath(docPath2) as DocDataRef;
    const createdNestedDoc = collectionDataRef.createPath(
      nestedDocPath,
      nestedDocData
    ) as DocDataRef;

    // Check the objects instance
    expect(createdDoc1).toBeInstanceOf(DocDataRef);
    expect(createdDoc2).toBeInstanceOf(DocDataRef);
    expect(createdNestedDoc).toBeInstanceOf(DocDataRef);
    // Expect the docs data to be equal the data
    expect(createdDoc1.data).toEqual(docData);
    expect(createdDoc2.data).toEqual({});
    expect(createdNestedDoc.data).toEqual(nestedDocData);

    // Check the create path calls
    expect(collectionMock.createPath.mock.calls.length).toBe(4);
    expect(collectionMock.createPath.mock.calls[0]).toEqual([docPath1, docData]);
    expect(collectionMock.createPath.mock.calls[1]).toEqual([docPath2, undefined]);
    expect(collectionMock.createPath.mock.calls[2]).toEqual([nestedDocPath, nestedDocData]);
    expect(collectionMock.createPath.mock.calls[3]).toEqual([[nestedDocPath[2]], nestedDocData]);
  });

  it("should create a path with a existing doc in the collection", () => {
    // Set the id and data for the docs creation
    const existingDoc = collectionDataRef.docs[0];
    const existingDocPath = existingDoc.id;
    const docNewData = { new: "data for existing doc" };

    // Create a doc, a nested doc and a doc with no data
    const createdDoc = collectionDataRef.createPath([existingDocPath], docNewData) as DocDataRef;

    // Check the doc instance
    expect(createdDoc).toBeInstanceOf(DocDataRef);
    // Expect the doc data to be equal the data
    expect(createdDoc.data).toEqual(docNewData);

    // Check the create path calls
    expect(collectionMock.createPath.mock.calls.length).toBe(1);
    expect(collectionMock.createPath.mock.calls[0]).toEqual([[existingDocPath], docNewData]);
  });
});
