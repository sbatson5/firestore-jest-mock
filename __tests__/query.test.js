const { mockCollection, mockGet, mockWhere, mockOffset } = require('../mocks/firestore');

const { mockFirebase } = require('firestore-jest-mock');

describe('test', () => {
  test('It can query firestore', async () => {
    mockFirebase({
      database: {
        animals: [
          { name: 'monkey', type: 'mammal' },
          { name: 'elephant', type: 'mammal' },
        ],
      },
      currentUser: { uid: 'homer-user' },
    });
    const firebase = require('firebase');
    firebase.initializeApp({
      apiKey: '### FIREBASE API KEY ###',
      authDomain: '### FIREBASE AUTH DOMAIN ###',
      projectId: '### CLOUD FIRESTORE PROJECT ID ###',
    });

    const db = firebase.firestore();

    const animals = await db
      .collection('animals')
      .where('type', '==', 'mammal')
      .get();

    expect(animals).toHaveProperty('docs', expect.any(Array));
    expect(mockWhere).toHaveBeenCalledWith('type', '==', 'mammal');
    expect(mockCollection).toHaveBeenCalledWith('animals');
    expect(mockGet).toHaveBeenCalled();
  });

  test('It can offset query', async () => {
    mockFirebase({
      database: {
        animals: [
          { name: 'monkey', type: 'mammal' },
          { name: 'elephant', type: 'mammal' },
          { name: 'lion', type: 'mammal' },
        ],
      },
    });
    const firebase = require('firebase');
    firebase.initializeApp({
      apiKey: '### FIREBASE API KEY ###',
      authDomain: '### FIREBASE AUTH DOMAIN ###',
      projectId: '### CLOUD FIRESTORE PROJECT ID ###',
    });

    const db = firebase.firestore();
    const firstTwoMammals = await db
      .collection('animals')
      .where('type', '==', 'mammal')
      .offset(2)
      .get();

    expect(firstTwoMammals).toHaveProperty('docs', expect.any(Array));
    expect(mockWhere).toHaveBeenCalledWith('type', '==', 'mammal');
    expect(mockCollection).toHaveBeenCalledWith('animals');
    expect(mockGet).toHaveBeenCalled();
    expect(mockOffset).toHaveBeenCalledWith(2);
  });
});
