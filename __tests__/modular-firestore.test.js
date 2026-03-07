const { mockModularFirestore } = require('firestore-jest-mock');
const {
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
  mockModularStartAt,
  mockModularStartAfter,
  mockModularWriteBatch,
  mockModularRunTransaction,
  mockConnectFirestoreEmulator,
  mockGetFirestore,
} = require('firestore-jest-mock/mocks/modular/firestore');

const {
  mockCollection,
  mockDoc,
  mockGet,
  mockAdd,
  mockSet,
  mockUpdate,
  mockDelete,
} = require('firestore-jest-mock/mocks/firestore');

describe('Modular Firestore API', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('Basic CRUD operations', () => {
    mockModularFirestore({
      database: {
        users: [
          { id: 'abc123', name: 'Homer Simpson', age: 39 },
          { id: 'def456', name: 'Marge Simpson', age: 36 },
        ],
        cities: [
          { id: 'la', name: 'Los Angeles', state: 'CA', population: 3900000 },
          { id: 'sf', name: 'San Francisco', state: 'CA', population: 860000 },
        ],
      },
    });

    const {
      getFirestore,
      collection,
      doc,
      getDoc,
      getDocs,
      addDoc,
      setDoc,
      updateDoc,
      deleteDoc,
      query,
      where,
      orderBy,
      limit,
      startAt,
      startAfter,
      onSnapshot,
      writeBatch,
      runTransaction,
      connectFirestoreEmulator,
      collectionGroup,
      Timestamp,
      FieldValue,
      FieldPath,
    } = require('firebase/firestore');

    test('getFirestore returns a Firestore instance', () => {
      const db = getFirestore();
      expect(db).toBeDefined();
      expect(mockGetFirestore).toHaveBeenCalled();
    });

    test('getDocs retrieves collection documents', async () => {
      const db = getFirestore();
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);

      expect(snapshot.empty).toBe(false);
      expect(snapshot.size).toBe(2);
      expect(mockModularCollection).toHaveBeenCalledWith(db, 'users');
      expect(mockGetDocs).toHaveBeenCalled();
      expect(mockCollection).toHaveBeenCalledWith('users');
      expect(mockGet).toHaveBeenCalled();
    });

    test('getDoc retrieves a single document', async () => {
      const db = getFirestore();
      const docRef = doc(db, 'users/abc123');
      const docSnap = await getDoc(docRef);

      expect(docSnap.exists).toBe(true);
      expect(docSnap.data().name).toBe('Homer Simpson');
      expect(mockModularDoc).toHaveBeenCalledWith(db, 'users/abc123');
      expect(mockGetDoc).toHaveBeenCalled();
    });

    test('addDoc adds a new document', async () => {
      const db = getFirestore();
      const usersRef = collection(db, 'users');
      const newDocRef = await addDoc(usersRef, {
        name: 'Bart Simpson',
        age: 10,
      });

      expect(newDocRef).toBeDefined();
      expect(newDocRef.id).toBeDefined();
      expect(mockAddDoc).toHaveBeenCalled();
      expect(mockAdd).toHaveBeenCalledWith({ name: 'Bart Simpson', age: 10 });
    });

    test('setDoc sets document data', async () => {
      const db = getFirestore();
      const docRef = doc(db, 'users/abc123');
      await setDoc(docRef, { name: 'Homer J. Simpson', age: 40 });

      expect(mockSetDoc).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith(
        { name: 'Homer J. Simpson', age: 40 },
        {},
      );
    });

    test('setDoc with merge option', async () => {
      const db = getFirestore();
      const docRef = doc(db, 'users/abc123');
      await setDoc(docRef, { age: 40 }, { merge: true });

      expect(mockSetDoc).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith(
        { age: 40 },
        { merge: true },
      );
    });

    test('updateDoc updates document data', async () => {
      const db = getFirestore();
      const docRef = doc(db, 'users/abc123');
      await updateDoc(docRef, { age: 40 });

      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalledWith({ age: 40 });
    });

    test('deleteDoc deletes a document', async () => {
      const db = getFirestore();
      const docRef = doc(db, 'users/abc123');
      await deleteDoc(docRef);

      expect(mockDeleteDoc).toHaveBeenCalled();
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe('Query operations', () => {
    mockModularFirestore({
      database: {
        cities: [
          { id: 'la', name: 'Los Angeles', state: 'CA', population: 3900000 },
          { id: 'sf', name: 'San Francisco', state: 'CA', population: 860000 },
          { id: 'dc', name: 'Washington', state: 'DC', population: 680000 },
        ],
      },
    }, { simulateQueryFilters: true });

    const {
      getFirestore,
      collection,
      getDocs,
      query,
      where,
      orderBy,
      limit,
      startAt,
      startAfter,
      collectionGroup,
    } = require('firebase/firestore');

    test('query with where clause', async () => {
      const db = getFirestore();
      const citiesRef = collection(db, 'cities');
      const q = query(citiesRef, where('state', '==', 'CA'));

      const snapshot = await getDocs(q);
      expect(snapshot.size).toBe(2);
      expect(mockModularQuery).toHaveBeenCalled();
      expect(mockModularWhere).toHaveBeenCalledWith('state', '==', 'CA');
    });

    test('query with orderBy', async () => {
      const db = getFirestore();
      const citiesRef = collection(db, 'cities');
      const q = query(citiesRef, orderBy('name'));

      await getDocs(q);
      expect(mockModularOrderBy).toHaveBeenCalledWith('name', undefined);
    });

    test('query with limit', async () => {
      const db = getFirestore();
      const citiesRef = collection(db, 'cities');
      const q = query(citiesRef, limit(2));

      await getDocs(q);
      expect(mockModularLimit).toHaveBeenCalledWith(2);
    });

    test('query with startAt', () => {
      const db = getFirestore();
      const citiesRef = collection(db, 'cities');
      query(citiesRef, startAt('a'));

      expect(mockModularStartAt).toHaveBeenCalledWith('a');
    });

    test('query with startAfter', () => {
      const db = getFirestore();
      const citiesRef = collection(db, 'cities');
      query(citiesRef, startAfter('z'));

      expect(mockModularStartAfter).toHaveBeenCalledWith('z');
    });

    test('collectionGroup query', async () => {
      const db = getFirestore();
      const group = collectionGroup(db, 'cities');
      expect(mockModularCollectionGroup).toHaveBeenCalledWith(db, 'cities');
      expect(group).toBeDefined();
    });
  });

  describe('onSnapshot', () => {
    mockModularFirestore({
      database: {
        users: [
          { id: 'abc123', name: 'Homer Simpson' },
        ],
      },
    });

    const {
      getFirestore,
      collection,
      doc,
      onSnapshot,
    } = require('firebase/firestore');

    test('onSnapshot on a document', () => {
      const db = getFirestore();
      const docRef = doc(db, 'users/abc123');
      const callback = jest.fn();
      const unsubscribe = onSnapshot(docRef, callback);

      expect(mockModularOnSnapshot).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    test('onSnapshot on a collection', () => {
      const db = getFirestore();
      const usersRef = collection(db, 'users');
      const callback = jest.fn();

      onSnapshot(usersRef, callback);
      expect(mockModularOnSnapshot).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('Batch writes', () => {
    mockModularFirestore({
      database: {
        users: [
          { id: 'abc123', name: 'Homer Simpson' },
        ],
      },
    });

    const {
      getFirestore,
      doc,
      writeBatch,
    } = require('firebase/firestore');

    test('writeBatch creates a batch', async () => {
      const db = getFirestore();
      const batch = writeBatch(db);

      expect(mockModularWriteBatch).toHaveBeenCalledWith(db);
      expect(batch).toBeDefined();
      expect(typeof batch.commit).toBe('function');
      expect(typeof batch.set).toBe('function');
      expect(typeof batch.update).toBe('function');
      expect(typeof batch.delete).toBe('function');

      await batch.commit();
    });
  });

  describe('Transactions', () => {
    mockModularFirestore({
      database: {
        users: [
          { id: 'abc123', name: 'Homer Simpson' },
        ],
      },
    });

    const {
      getFirestore,
      doc,
      runTransaction,
    } = require('firebase/firestore');

    test('runTransaction executes a transaction', async () => {
      const db = getFirestore();
      await runTransaction(db, async (transaction) => {
        expect(transaction).toBeDefined();
        const docRef = doc(db, 'users/abc123');
        const docSnap = await transaction.get(docRef);
        expect(docSnap.exists).toBe(true);
      });

      expect(mockModularRunTransaction).toHaveBeenCalled();
    });
  });

  describe('Static types', () => {
    mockModularFirestore({ database: {} });

    const {
      Timestamp,
      FieldValue,
      FieldPath,
    } = require('firebase/firestore');

    test('Timestamp is available', () => {
      expect(Timestamp).toBeDefined();
      const ts = Timestamp.now();
      expect(ts.seconds).toBeDefined();
      expect(ts.nanoseconds).toBeDefined();
    });

    test('FieldValue is available', () => {
      expect(FieldValue).toBeDefined();
      const sv = FieldValue.serverTimestamp();
      expect(sv).toBeDefined();
    });

    test('FieldPath is available', () => {
      expect(FieldPath).toBeDefined();
      const docId = FieldPath.documentId();
      expect(docId).toBeDefined();
    });
  });

  describe('Emulator connection', () => {
    mockModularFirestore({ database: {} });

    const {
      getFirestore,
      connectFirestoreEmulator,
    } = require('firebase/firestore');

    test('connectFirestoreEmulator records the call', () => {
      const db = getFirestore();
      connectFirestoreEmulator(db, 'localhost', 8080);
      expect(mockConnectFirestoreEmulator).toHaveBeenCalledWith(db, 'localhost', 8080);
    });
  });

  describe('doc() with collection reference', () => {
    mockModularFirestore({
      database: {
        users: [
          { id: 'abc123', name: 'Homer Simpson' },
        ],
      },
    });

    const {
      getFirestore,
      collection,
      doc,
      getDoc,
    } = require('firebase/firestore');

    test('doc() on a collection reference creates a doc ref', async () => {
      const db = getFirestore();
      const usersRef = collection(db, 'users');
      const docRef = doc(usersRef, 'abc123');
      const docSnap = await getDoc(docRef);

      expect(docSnap.exists).toBe(true);
      expect(docSnap.data().name).toBe('Homer Simpson');
    });

    test('doc() without id auto-generates one', () => {
      const db = getFirestore();
      const usersRef = collection(db, 'users');
      const docRef = doc(usersRef);

      expect(docRef).toBeDefined();
      expect(docRef.id).toBeDefined();
    });
  });
});
