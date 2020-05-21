import { firestoreFakeDatabase } from "../../test-database";
import { FakeFirestoreDatabase, DocDataRef, CollectionDataRef, jestMocks } from "../../import";
import { getAllCollectionNames, getObjectRef, getDocIds } from "../../utils/helpers";
import { MockDatabase, FakeSetOptions, FakeDocData } from "types";

const databaseMock = jestMocks.fakeDatabase;

let fakeDb: MockDatabase = getObjectRef(firestoreFakeDatabase);

beforeEach(() => {
  // Reset jest before each test
  jest.resetAllMocks();
  fakeDb = getObjectRef(firestoreFakeDatabase);
});

it("should create a instance of FakeFirestoreDatabase", () => {
  const db = new FakeFirestoreDatabase(fakeDb);

  const allCollectionNames: string[] = getAllCollectionNames(firestoreFakeDatabase);
  const allDocIds: string[] = getDocIds(firestoreFakeDatabase);

  const testCollectionNames = databaseMock.collection.constructor.mock.calls.some(params =>
    allCollectionNames.includes(params[1])
  );

  expect(testCollectionNames).toBeTruthy();
  expect(db["mockDatabase"]).toEqual(fakeDb);
  expect(databaseMock.doc.constructor.mock.calls.length).toBe(allDocIds.length);
  expect(databaseMock.collection.constructor.mock.calls.length).toBe(allCollectionNames.length);

  expect(databaseMock.database.constructor.mock.calls.length).toBe(1);
  expect(databaseMock.database.constructor.mock.calls[0][0]).toEqual(fakeDb);
});

it("should create a instance of an empty fake database", () => {
  const db = new FakeFirestoreDatabase();

  expect(db["mockDatabase"]).toEqual({});
  expect(databaseMock.database.constructor.mock.calls.length).toBe(1);
  expect(databaseMock.database.constructor.mock.calls[0][0]).toEqual({});
});

describe("Test FakeFirestoreDatabase methods", () => {
  let db: FakeFirestoreDatabase;

  beforeEach(() => {
    db = new FakeFirestoreDatabase(fakeDb);
  });

  it("should get all the root collection names", () => {
    expect(db.listRootCollection()).toEqual(Object.keys(fakeDb));
  });

  it("should get docs and collections in the db", () => {
    const collectionPath = `collection_test`;
    const docPath = `${collectionPath}/doc_1`;
    const nestedCollectionPath = `${docPath}/sub_collection_1`;
    const nestedocPath = `${nestedCollectionPath}/doc_1_1`;

    const doc = db.get(docPath, "doc");
    const nestedDoc = db.get(nestedocPath, "doc");

    const collection = db.get(collectionPath, "collection");
    const nestedCollection = db.get(nestedCollectionPath, "collection");

    expect(doc).toBeInstanceOf(DocDataRef);
    expect(nestedDoc).toBeInstanceOf(DocDataRef);
    expect(collection).toBeInstanceOf(CollectionDataRef);
    expect(nestedCollection).toBeInstanceOf(CollectionDataRef);

    expect(databaseMock.database.get.mock.calls.length).toBe(4);
    expect(databaseMock.database.get.mock.calls[0][0]).toBe(docPath);
    expect(databaseMock.database.get.mock.calls[1][0]).toBe(nestedocPath);
    expect(databaseMock.database.get.mock.calls[2][0]).toBe(collectionPath);
    expect(databaseMock.database.get.mock.calls[3][0]).toBe(nestedCollectionPath);
  });

  it("should add a new doc in a existing collection and nested collection", () => {
    const data = { random: "data" };

    const collectionPath = "collection_test";
    const docId = "random-id";

    const nestedCollectionPath = "collection_test/doc_1/sub_collection_1";
    const nestedDocId = "random-nested-id";

    db.addData(data, collectionPath, docId);
    db.addData(data, nestedCollectionPath, nestedDocId);

    expect(databaseMock.database.get.mock.calls.length).toBe(2);
    expect(databaseMock.database.addData.mock.calls.length).toBe(2);
    expect(databaseMock.database.addData.mock.calls[0]).toEqual([data, collectionPath, docId]);
    expect(databaseMock.database.addData.mock.calls[1]).toEqual([
      data,
      nestedCollectionPath,
      nestedDocId
    ]);

    const docPath = `${collectionPath}/${docId}`;
    const nestedDocPath = `${nestedCollectionPath}/${nestedDocId}`;
    const docRef = db.get(docPath, "doc");
    const nestedDocRef = db.get(nestedDocPath, "doc");

    expect(docRef).toBeInstanceOf(DocDataRef);
    expect(nestedDocRef).toBeInstanceOf(DocDataRef);
  });

  it("should add a doc on an non existing collection", () => {
    const data = { random: "data" };
    const collectionPath = "non_existing";
    const docId = "random-id";

    db.addData(data, collectionPath, docId);
    expect(databaseMock.database.get.mock.calls.length).toBe(1);
    expect(databaseMock.database.addData.mock.calls.length).toBe(1);
    expect(databaseMock.database.addData.mock.calls[0]).toEqual([data, collectionPath, docId]);
  });

  it("should set data on a doc in the database", () => {
    const data = { new: "data" };
    const newData = { ...fakeDb.collection_test.docs[0].data, ...data };
    const docPath = "collection_test/doc_1";
    const options: FakeSetOptions = { mergeFields: ["new"] };

    db.setData(data, docPath, options);
    const doc = db.get(docPath, "doc");

    expect(doc).toBeInstanceOf(DocDataRef);
    expect(doc.data).toEqual(newData);
  });

  it("should set data on a no existing doc in the database", () => {
    const data = { new: { random: "data" } };
    const docPath = "non_existing_collection/non_existing_doc";
    const options: FakeSetOptions = { mergeFields: ["new.random"] };

    db.setData(data, docPath, options);
    const doc = db.get(docPath, "doc");

    expect(doc).toBeInstanceOf(DocDataRef);
    expect(doc.data).toEqual(data);

    expect(databaseMock.database.setData.mock.calls.length).toBe(1);
    expect(databaseMock.database.setData.mock.calls[0]).toEqual([data, docPath, options]);
  });

  it("should create a doc on an existing collection", () => {
    const docPath = "collection_test/doc_1";
    const docData: FakeDocData = { data: "value" };

    const doc = db["createPathInDb"](docPath, docData) as DocDataRef;

    expect(doc).toBeInstanceOf(DocDataRef);
  });

  it("should delete a exisiting doc on db", () => {
    const collectionPath = "non_existing_collection";
    const docId = "non_existing_doc";

    db.deleteDoc(collectionPath, docId);

    expect(databaseMock.database.deleteDoc.mock.calls.length).toBe(1);
    expect(databaseMock.database.deleteDoc.mock.calls[0]).toEqual([collectionPath, docId]);
  });

  it("should try to delete a doc on a non existing collection", () => {
    const collectionPath = "collection_test";
    const docId = "radom";

    db.deleteDoc(collectionPath, docId);

    expect(databaseMock.database.deleteDoc.mock.calls.length).toBe(1);
    expect(databaseMock.database.deleteDoc.mock.calls[0]).toEqual([collectionPath, docId]);
  });
});
