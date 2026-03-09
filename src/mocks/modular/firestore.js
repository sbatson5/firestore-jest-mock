/**
 * Modular API mock for `firebase/firestore`.
 *
 * Usage:
 *   const { mockModularFirestore } = require('firestore-jest-mock');
 *   mockModularFirestore({ database: { users: [...] } });
 *   const { getFirestore, collection, getDocs } = require('firebase/firestore');
 */

const defaultOptions = require('../helpers/defaultMockOptions').default;

const mockGetFirestore = jest.fn();
const mockInitializeFirestore = jest.fn();
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockAddDoc = jest.fn();
const mockSetDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockModularCollection = jest.fn();
const mockModularCollectionGroup = jest.fn();
const mockModularDoc = jest.fn();
const mockModularOnSnapshot = jest.fn();
const mockModularQuery = jest.fn();
const mockModularWhere = jest.fn();
const mockModularOrderBy = jest.fn();
const mockModularLimit = jest.fn();
const mockLimitToLast = jest.fn();
const mockModularStartAt = jest.fn();
const mockModularStartAfter = jest.fn();
const mockEndAt = jest.fn();
const mockEndBefore = jest.fn();
const mockModularWriteBatch = jest.fn();
const mockModularRunTransaction = jest.fn();
const mockConnectFirestoreEmulator = jest.fn();
const mockEnableIndexedDbPersistence = jest.fn();
const mockTerminate = jest.fn();

function buildModularFirestoreStub(overrides, options) {
  const { FakeFirestore } = require('firestore-jest-mock');

  let firestoreInstance = null;

  function getOrCreateInstance() {
    if (!firestoreInstance) {
      firestoreInstance = new FakeFirestore(overrides.database, options);
    }
    return firestoreInstance;
  }

  function getFirestore() {
    mockGetFirestore(...arguments);
    return getOrCreateInstance();
  }

  function initializeFirestore() {
    mockInitializeFirestore(...arguments);
    return getOrCreateInstance();
  }

  function collection(firestoreOrRef, ...pathSegments) {
    mockModularCollection(firestoreOrRef, ...pathSegments);
    const path = pathSegments.join('/');
    if (firestoreOrRef instanceof FakeFirestore) {
      return firestoreOrRef.collection(path);
    }
    // firestoreOrRef is a DocumentReference
    return firestoreOrRef.collection(path);
  }

  function collectionGroup(firestore, collectionId) {
    mockModularCollectionGroup(firestore, collectionId);
    return firestore.collectionGroup(collectionId);
  }

  function doc(firestoreOrRef, ...pathSegments) {
    mockModularDoc(firestoreOrRef, ...pathSegments);
    const path = pathSegments.join('/');
    if (firestoreOrRef instanceof FakeFirestore) {
      return firestoreOrRef.doc(path);
    }
    // firestoreOrRef is a CollectionReference
    if (pathSegments.length === 0) {
      return firestoreOrRef.doc();
    }
    return firestoreOrRef.doc(path);
  }

  function getDoc(docRef) {
    mockGetDoc(docRef);
    return docRef.get();
  }

  function getDocs(queryOrCollectionRef) {
    mockGetDocs(queryOrCollectionRef);
    return queryOrCollectionRef.get();
  }

  function addDoc(collectionRef, data) {
    mockAddDoc(collectionRef, data);
    return collectionRef.add(data);
  }

  function setDoc(docRef, data, options) {
    mockSetDoc(docRef, data, options);
    return docRef.set(data, options || {});
  }

  function updateDoc(docRef, data) {
    mockUpdateDoc(docRef, data);
    return docRef.update(data);
  }

  function deleteDoc(docRef) {
    mockDeleteDoc(docRef);
    return docRef.delete();
  }

  function onSnapshot(ref, ...args) {
    mockModularOnSnapshot(ref, ...args);
    return ref.onSnapshot(...args);
  }

  function query(queryRef, ...queryConstraints) {
    mockModularQuery(queryRef, ...queryConstraints);
    let result = queryRef;
    for (const constraint of queryConstraints) {
      if (typeof constraint === 'function') {
        result = constraint(result);
      }
    }
    return result;
  }

  function where(fieldPath, opStr, value) {
    mockModularWhere(fieldPath, opStr, value);
    return (queryRef) => queryRef.where(fieldPath, opStr, value);
  }

  function orderBy(fieldPath, directionStr) {
    mockModularOrderBy(fieldPath, directionStr);
    return (queryRef) => queryRef.orderBy(fieldPath, directionStr);
  }

  function limit(n) {
    mockModularLimit(n);
    return (queryRef) => queryRef.limit(n);
  }

  function limitToLast(n) {
    mockLimitToLast(n);
    return (queryRef) => queryRef.limit(n);
  }

  function startAt(...args) {
    mockModularStartAt(...args);
    return (queryRef) => queryRef.startAt(...args);
  }

  function startAfter(...args) {
    mockModularStartAfter(...args);
    return (queryRef) => queryRef.startAfter(...args);
  }

  function endAt() {
    mockEndAt(...arguments);
    return (queryRef) => queryRef;
  }

  function endBefore() {
    mockEndBefore(...arguments);
    return (queryRef) => queryRef;
  }

  function writeBatch(firestore) {
    mockModularWriteBatch(firestore);
    return firestore.batch();
  }

  function runTransaction(firestore, updateFunction) {
    mockModularRunTransaction(firestore, updateFunction);
    return firestore.runTransaction(updateFunction);
  }

  function connectFirestoreEmulator(firestore, host, port) {
    mockConnectFirestoreEmulator(firestore, host, port);
  }

  function enableIndexedDbPersistence(firestore) {
    mockEnableIndexedDbPersistence(firestore);
    return Promise.resolve();
  }

  function terminate(firestore) {
    mockTerminate(firestore);
    return Promise.resolve();
  }

  return {
    getFirestore,
    initializeFirestore,
    collection,
    collectionGroup,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    limitToLast,
    startAt,
    startAfter,
    endAt,
    endBefore,
    writeBatch,
    runTransaction,
    connectFirestoreEmulator,
    enableIndexedDbPersistence,
    terminate,
    Timestamp: FakeFirestore.Timestamp,
    FieldValue: FakeFirestore.FieldValue,
    FieldPath: FakeFirestore.FieldPath,
  };
}

const mockModularFirestore = (overrides = {}, options = defaultOptions) => {
  const stub = buildModularFirestoreStub(overrides, options);

  // Mock firebase/firestore
  try {
    require.resolve('firebase/firestore');
    jest.doMock('firebase/firestore', () => stub);
  } catch (e) {
    // Module not installed, skip
  }

  // Mock firebase/app
  try {
    require.resolve('firebase/app');
    jest.doMock('firebase/app', () => ({
      initializeApp: jest.fn(),
      getApp: jest.fn(),
      getApps: jest.fn(() => []),
    }));
  } catch (e) {
    // Module not installed, skip
  }
};

module.exports = {
  mockModularFirestore,
  buildModularFirestoreStub,

  // Export mock functions for assertions
  mockGetFirestore,
  mockInitializeFirestore,
  mockGetDoc,
  mockGetDocs,
  mockAddDoc,
  mockSetDoc,
  mockUpdateDoc,
  mockDeleteDoc,
  mockModularCollection,
  mockModularCollectionGroup,
  mockModularDoc,
  mockModularOnSnapshot,
  mockModularQuery,
  mockModularWhere,
  mockModularOrderBy,
  mockModularLimit,
  mockLimitToLast,
  mockModularStartAt,
  mockModularStartAfter,
  mockEndAt,
  mockEndBefore,
  mockModularWriteBatch,
  mockModularRunTransaction,
  mockConnectFirestoreEmulator,
  mockEnableIndexedDbPersistence,
  mockTerminate,
};
