const {
  mockCollection,
  mockGet,
  mockWhere,
} = require('../mocks/firestore');

const { mockFirebase } = require('firestore-jest-mock');

describe('test', () => {
  test('It can query firestore', async () => {
    mockFirebase({
      database: {
        animals: [{ name: 'monkey', type: 'mammal' }, { name: 'elephant', type: 'mammal' }]
      },
      currentUser: { uid: 'homer-user' }
    });
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
});