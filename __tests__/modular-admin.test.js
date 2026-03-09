const { mockModularAdmin } = require('firestore-jest-mock/mocks/modular/admin');
const {
  mockAdminInitializeApp,
  mockAdminGetApp,
  mockAdminCert,
  mockAdminGetFirestore,
  mockAdminGetAuth,
} = require('firestore-jest-mock/mocks/modular/admin');

const {
  mockCollection,
  mockDoc,
  mockGet,
  mockAdd,
  mockSet,
} = require('firestore-jest-mock/mocks/firestore');

const {
  mockVerifyIdToken,
  mockGetUser,
  mockCreateCustomToken,
} = require('firestore-jest-mock/mocks/auth');

describe('Modular firebase-admin SDK', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('firebase-admin/app', () => {
    mockModularAdmin({
      database: {
        users: [{ id: 'abc123', name: 'Homer Simpson' }],
      },
      currentUser: { uid: 'admin-user' },
    });

    const { initializeApp, getApp, cert } = require('firebase-admin/app');

    test('initializeApp', () => {
      initializeApp({ projectId: 'demo-project' });
      expect(mockAdminInitializeApp).toHaveBeenCalledWith({ projectId: 'demo-project' });
    });

    test('getApp', () => {
      getApp();
      expect(mockAdminGetApp).toHaveBeenCalled();
    });

    test('cert', () => {
      cert({ projectId: 'demo' });
      expect(mockAdminCert).toHaveBeenCalledWith({ projectId: 'demo' });
    });
  });

  describe('firebase-admin/firestore', () => {
    mockModularAdmin({
      database: {
        users: [
          { id: 'abc123', name: 'Homer Simpson', age: 39 },
          { id: 'def456', name: 'Marge Simpson', age: 36 },
        ],
      },
    });

    const { getFirestore, Timestamp, FieldValue, FieldPath } = require('firebase-admin/firestore');

    test('getFirestore returns a Firestore instance', () => {
      const db = getFirestore();
      expect(db).toBeDefined();
      expect(mockAdminGetFirestore).toHaveBeenCalled();
    });

    test('Firestore instance supports collection/doc operations', async () => {
      const db = getFirestore();
      const usersRef = db.collection('users');
      const snapshot = await usersRef.get();

      expect(snapshot.empty).toBe(false);
      expect(snapshot.size).toBe(2);
      expect(mockCollection).toHaveBeenCalledWith('users');
      expect(mockGet).toHaveBeenCalled();
    });

    test('Firestore instance supports doc get', async () => {
      const db = getFirestore();
      const docRef = db.doc('users/abc123');
      const docSnap = await docRef.get();

      expect(docSnap.exists).toBe(true);
      expect(docSnap.data().name).toBe('Homer Simpson');
      expect(mockDoc).toHaveBeenCalledWith('users/abc123');
    });

    test('Firestore instance supports add', async () => {
      const db = getFirestore();
      const usersRef = db.collection('users');
      const newDocRef = await usersRef.add({ name: 'Bart' });

      expect(newDocRef).toBeDefined();
      expect(mockAdd).toHaveBeenCalledWith({ name: 'Bart' });
    });

    test('Firestore instance supports set', async () => {
      const db = getFirestore();
      const docRef = db.doc('users/abc123');
      await docRef.set({ name: 'Homer J. Simpson' });

      expect(mockSet).toHaveBeenCalledWith({ name: 'Homer J. Simpson' });
    });

    test('Timestamp is available', () => {
      expect(Timestamp).toBeDefined();
      const ts = Timestamp.now();
      expect(ts.seconds).toBeDefined();
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

  describe('firebase-admin/auth', () => {
    mockModularAdmin({
      database: {},
      currentUser: { uid: 'admin-user', email: 'admin@test.com' },
    });

    const { getAuth } = require('firebase-admin/auth');

    test('getAuth returns an auth instance', () => {
      const auth = getAuth();
      expect(auth).toBeDefined();
      expect(mockAdminGetAuth).toHaveBeenCalled();
    });

    test('auth instance supports verifyIdToken', async () => {
      const auth = getAuth();
      const result = await auth.verifyIdToken('some-token');
      expect(result).toBeDefined();
      expect(mockVerifyIdToken).toHaveBeenCalledWith('some-token');
    });

    test('auth instance supports getUser', async () => {
      const auth = getAuth();
      const result = await auth.getUser('uid-123');
      expect(result).toBeDefined();
      expect(mockGetUser).toHaveBeenCalledWith('uid-123');
    });

    test('auth instance supports createCustomToken', async () => {
      const auth = getAuth();
      const token = await auth.createCustomToken('uid-123');
      expect(token).toBeDefined();
      expect(mockCreateCustomToken).toHaveBeenCalledWith('uid-123');
    });
  });
});
