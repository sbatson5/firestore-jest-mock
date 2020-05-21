import {
  FakeCollectionRef,
  FakeQuery,
  FakeDocRef,
  FakeDocSnapshot,
  FakeFieldPath,
  FakeFieldValue,
  FakeTimestamp,
  FakeFirestore,
  jestMocks,
  FakeFirestoreDatabase,
  mockFirebase
} from "../import";
import { Settings } from "@google-cloud/firestore";
import { firestoreFakeDatabase } from "../test-database";

mockFirebase({
  firestore: firestoreFakeDatabase
});

import { firestore } from "firebase-admin";

/** Reference to firestore mock functions */
const firestoreMocks = jestMocks.firestore;

const rootCollectionsNames = Object.keys(firestoreFakeDatabase);

beforeEach(() => {
  jest.resetAllMocks();
});

it("should create a intance of fakeFirestore", () => {
  const fakeFirestore = new FakeFirestore();
  expect(fakeFirestore.database).toBeInstanceOf(FakeFirestoreDatabase);
});

it("should test firestore class contructors to match the fake ones", () => {
  expect(firestore.CollectionReference).toEqual(FakeCollectionRef);
  expect(firestore.Query).toEqual(FakeQuery);
  expect(firestore.DocumentReference).toEqual(FakeDocRef);
  expect(firestore.DocumentSnapshot).toEqual(FakeDocSnapshot);
  expect(firestore.QueryDocumentSnapshot).toEqual(FakeDocSnapshot);
  expect(firestore.FieldPath).toEqual(FakeFieldPath);
  expect(firestore.FieldValue).toEqual(FakeFieldValue);
  expect(firestore.Timestamp).toEqual(FakeTimestamp);
});

describe("Test firestore methods", () => {
  // Set db for the tests
  let db: firestore.Firestore;

  beforeEach(() => {
    // Reassing a new instance of fakeFirestore
    db = firestore();
  });

  it("should call firestore setting", () => {
    const fakeSetting: Settings = {};
    db.settings(fakeSetting);

    expect(firestoreMocks.setting.mock.calls.length).toBe(1);
    expect(firestoreMocks.setting.mock.calls[0][0]).toEqual(fakeSetting);
  });

  it("should create FakeDocRef instance", () => {
    const id = "doc1";
    const path = `collection1/${id}`;
    const docRef = db.doc(path);

    expect(docRef).toBeInstanceOf(FakeDocRef);
    expect(docRef.id).toBe(id);
    expect(docRef.path).toBe(path);
    expect(docRef.firestore).toEqual(db);
    expect(docRef.parent).toBeInstanceOf(FakeCollectionRef);
  });

  it("should create FakeCollectionRef instance", () => {
    const path = `collection1`;
    const collectionRef = db.collection(path);

    expect(collectionRef).toBeInstanceOf(FakeCollectionRef);
    expect(collectionRef.id).toBe(path);
    expect(collectionRef.path).toBe(path);
    expect(collectionRef.firestore).toEqual(db);
    expect(collectionRef.parent).toBe(null);
  });

  it("should get all root collections listCollections() method", async () => {
    const rootCollections = await db.listCollections();
    const names = rootCollections.map(c => c.path);

    expect(rootCollections.length).toBe(rootCollectionsNames.length);
    expect(names).toEqual(rootCollectionsNames);
  });

  it("should test terminate database connection with terminate() method", async () => {
    db.terminate();

    expect(firestoreMocks.terminate.mock.calls.length).toBe(1);
  });
});
