const {
  mockAdd,
  mockBatch,
  mockCollection,
  mockGet,
  mockUpdate,
  mockWhere,
} = require('../mocks/firestore');

const { FakeFirestore, FakeAuth } = require('firestore-jest-mock');

describe('test', () => {
  const mockFirebase = () => jest.mock('firebase', () => ({
    initializeApp() { },
    credential: {
      cert() { },
    },
    auth() {
      return new FakeAuth({ uid: 'homer-user' });
    },
    firestore() {
      return new FakeFirestore({
        animals: [{ name: 'monkey', type: 'mammal' }, { name: 'elephant', type: 'mammal' }]
      });
    },
  }));

  test('It can query firestore', async () => {
    mockFirebase();
    const firebase = require('firebase');
    firebase.initializeApp({
      apiKey: '### FIREBASE API KEY ###',
      authDomain: '### FIREBASE AUTH DOMAIN ###',
      projectId: '### CLOUD FIRESTORE PROJECT ID ###'
    });

    const db = firebase.firestore();

    const animals = await db.collection('animals')
      .where('type', '==', 'mammal')
      .get();

    expect(mockWhere).toHaveBeenCalledWith('type', '==', 'mammal');
    expect(mockCollection).toHaveBeenCalledWith('animals');
    expect(mockGet).toHaveBeenCalled();
  });
})