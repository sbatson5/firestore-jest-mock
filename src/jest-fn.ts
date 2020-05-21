import { JestFnObject } from "types";

/**
 * Object with jest.fn() mock function that are called in the
 * stub implemetation with the arguments required in the functions.
 * It's useful for checking the calls and arguments in this functions
 *
 * @example
 * it("should create a doc in db", async () => {
 * const data = { foo: "bar" };
 * await firestore()
 *   .doc("collection/doc")
 *   .set(data);
 *
 * expect(jestMocks.doc.set.mock.calls.length).toBe(1);
 * expect(jestMocks.doc.set.mock.calls[0][0]).toBe(data);
 * });
 */
export const jestMocks = {
  /** Jest functions for firestore fake database classes */
  fakeDatabase: {
    /** Mock functions for calls in `FakeFirestoreDatabase` */
    database: {
      constructor: jest.fn(),
      listRootCollection: jest.fn(),
      get: jest.fn(),
      addData: jest.fn(),
      setData: jest.fn(),
      deleteDoc: jest.fn()
    },
    /** Mock functions for calls in `DocDataRef` */
    doc: {
      id: jest.fn(),
      subcollections: jest.fn(),
      data: jest.fn(),
      constructor: jest.fn(),
      getSubcollection: jest.fn(),
      createSubcollection: jest.fn(),
      subcollectionPath: jest.fn(),
      setDataInDocData: jest.fn(),
      getCollection: jest.fn(),
      createPath: jest.fn()
    },
    /** Mock functions for calls in `CollectionDataRef` */
    collection: {
      constructor: jest.fn(),
      docs: jest.fn(),
      id: jest.fn(),
      docPath: jest.fn(),
      push: jest.fn(),
      findDoc: jest.fn(),
      getDoc: jest.fn(),
      createDoc: jest.fn(),
      createPath: jest.fn(),
      deleteDoc: jest.fn()
    }
  },
  /** Mock functions for firebase import */
  firebase: {
    app: jest.fn(),
    initializeApp: jest.fn(),
    cert: jest.fn()
  },
  /** Mock functions for `CollectionReference` or `Query` classes */
  collection: {
    id: jest.fn(),
    parent: jest.fn(),
    path: jest.fn(),
    constructor: jest.fn(),
    listDocuments: jest.fn(),
    doc: jest.fn(),
    add: jest.fn(),
    isEqual: jest.fn(),
    get: jest.fn(),
    firestore: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    select: jest.fn(),
    startAt: jest.fn(),
    startAfter: jest.fn(),
    endBefore: jest.fn(),
    endAt: jest.fn()
  },
  /** Mock functions for `DocumentReference` class */
  doc: {
    firestore: jest.fn(),
    parent: jest.fn(),
    id: jest.fn(),
    constructor: jest.fn(),
    collection: jest.fn(),
    listCollections: jest.fn(),
    create: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    get: jest.fn()
  },
  /** Mock functions for `Firestore` object */
  firestore: {
    setting: jest.fn(),
    collection: jest.fn(),
    doc: jest.fn(),
    terminate: jest.fn(),
    listCollections: jest.fn()
  },
  /** Mock functions for `Timestamp` class */
  timestamp: {
    now: jest.fn(),
    fromDate: jest.fn(),
    fromMillis: jest.fn(),
    seconds: jest.fn(),
    nanoseconds: jest.fn(),
    toDate: jest.fn(),
    toMillis: jest.fn(),
    isEqual: jest.fn()
  },
  /** Mock functions for `FieldValue` class */
  fieldValue: {
    serverTimestamp: jest.fn(),
    delete: jest.fn(),
    increment: jest.fn(),
    arrayUnion: jest.fn(),
    arrayRemove: jest.fn(),
    isEqual: jest.fn()
  }
};

/**
 * Reset all information in a jest function objects by calling mockReset()
 * @param jestFnObj The object reference
 */
export function resetJestFnObj(jestFnObj: JestFnObject): void {
  Object.values(jestFnObj).forEach(jestFn => jestFn.mockReset());
}
