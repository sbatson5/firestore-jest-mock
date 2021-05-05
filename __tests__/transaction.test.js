const { mockFirebase, FakeFirestore } = require('firestore-jest-mock');
const {
  mockRunTransaction,
  mockDelete,
  mockDeleteTransaction,
  mockUpdate,
  mockUpdateTransaction,
  mockSet,
  mockSetTransaction,
  mockGet,
  mockGetTransaction,
  mockGetAll,
  mockGetAllTransaction,
  mockCreateTransaction,
} = require('firestore-jest-mock/mocks/firestore');

describe('Transactions', () => {
  mockFirebase({
    database: {},
  });
  const firebase = require('firebase');
  firebase.initializeApp({
    apiKey: '### FIREBASE API KEY ###',
    authDomain: '### FIREBASE AUTH DOMAIN ###',
    projectId: '### CLOUD FIRESTORE PROJECT ID ###',
  });
  const db = firebase.firestore();

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('it returns a Promise', () => {
    const result = db.runTransaction(async () => {});

    expect(result).toBeInstanceOf(Promise);
    expect(mockRunTransaction).toHaveBeenCalled();
  });

  test('it returns the same value returned by the transaction callback', async () => {
    const result = await db.runTransaction(() => 'Success!');
    expect(result).toBe('Success!');
  });

  test('it provides a Transaction object', () => {
    const runner = jest.fn().mockReturnValue(Promise.resolve());
    const result = db.runTransaction(runner);

    expect(result).toBeInstanceOf(Promise);
    expect(runner).toHaveBeenCalled();
    expect(runner.mock.calls[0][0]).toBeInstanceOf(FakeFirestore.Transaction);
  });

  test('mockGet is accessible', async () => {
    expect.assertions(7);
    expect(mockGetTransaction).not.toHaveBeenCalled();
    const ref = db.collection('some').doc('body');

    await db.runTransaction(async transaction => {
      // `get` should return a promise
      const result = transaction.get(ref);
      expect(result).toBeInstanceOf(Promise);
      const doc = await result;

      // Calling `get` on transaction also calls `get` on `ref`
      expect(mockGet).toHaveBeenCalled();
      expect(doc).toHaveProperty('id', 'body');
      expect(doc).toHaveProperty('exists', false);
      expect(doc.data()).toBeUndefined();
    });
    expect(mockGetTransaction).toHaveBeenCalled();
  });

  test('mockSet is accessible', async () => {
    expect.assertions(4);
    expect(mockSetTransaction).not.toHaveBeenCalled();
    const ref = db.collection('some').doc('body');

    await db.runTransaction(transaction => {
      const newData = { foo: 'bar' };
      const options = { merge: true };
      const result = transaction.set(ref, newData, options);

      expect(result).toBeInstanceOf(FakeFirestore.Transaction);
      expect(mockSet).toHaveBeenCalledWith(newData, options);
    });
    expect(mockSetTransaction).toHaveBeenCalled();
  });

  test('mockUpdate is accessible', async () => {
    expect.assertions(4);
    expect(mockUpdateTransaction).not.toHaveBeenCalled();
    const ref = db.collection('some').doc('body');

    await db.runTransaction(transaction => {
      const newData = { foo: 'bar' };
      const result = transaction.update(ref, newData);

      expect(result).toBeInstanceOf(FakeFirestore.Transaction);
      expect(mockUpdate).toHaveBeenCalledWith(newData);
    });
    expect(mockUpdateTransaction).toHaveBeenCalled();
  });

  test('mockDelete is accessible', async () => {
    expect.assertions(4);
    expect(mockDeleteTransaction).not.toHaveBeenCalled();
    const ref = db.collection('some').doc('body');

    await db.runTransaction(async transaction => {
      const result = transaction.delete(ref);

      expect(result).toBeInstanceOf(FakeFirestore.Transaction);
      expect(mockDelete).toHaveBeenCalled();
    });
    expect(mockDeleteTransaction).toHaveBeenCalled();
  });

  test('mockGetAll is accessible', async () => {
    expect.assertions(4);
    expect(mockGetAllTransaction).not.toHaveBeenCalled();
    const ref1 = db.collection('some').doc('body');
    const ref2 = ref1.collection('once').doc('told');

    await db.runTransaction(async transaction => {
      // FIXME: getAll is not defined on the client library, so this is a shot in the dark
      const result = await transaction.getAll(ref1, ref2);

      expect(result).toBeInstanceOf(Array);
      expect(mockGetAll).toHaveBeenCalled();
    });
    expect(mockGetAllTransaction).toHaveBeenCalled();
  });

  test('mockCreateTransaction is accessible', async () => {
    expect.assertions(2);
    expect(mockCreateTransaction).not.toHaveBeenCalled();
    // Example from documentation
    // https://googleapis.dev/nodejs/firestore/latest/Transaction.html#create-examples

    await db.runTransaction(async transaction => {
      const documentRef = db.doc('col/doc');
      return transaction.get(documentRef).then(doc => {
        if (!doc.exists) {
          transaction.create(documentRef, { foo: 'bar' });
        }
      });
    });

    expect(mockCreateTransaction).toHaveBeenCalled();
  });
});
