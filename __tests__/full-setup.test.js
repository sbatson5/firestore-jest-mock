const { mockFirebase } = require('firestore-jest-mock');
const { mockInitializeApp } = require('../mocks/firebase');

const {
  mockAdd,
  mockSet,
  mockUpdate,
  mockBatch,
  mockBatchCommit,
  mockBatchDelete,
  mockBatchUpdate,
  mockBatchSet
} = require('../mocks/firestore');

let firebase;

describe('we can start a firebase application', () => {
  mockFirebase({
    database: {
      users: [
        { id: 'abc123', first: 'Bob', last: 'builder', born: 1998 },
        { id: '123abc', first: 'Blues', last: 'builder', born: 1996 }
      ],
      cities: [
        { id: 'LA', name: 'Los Angeles', state: 'CA', country: 'USA' },
        { id: 'DC', name: 'Disctric of Columbia', state: 'DC', country: 'USA' }
      ]
    }
  });

  beforeEach(() => {
    firebase = require('firebase');
    firebase.initializeApp({
      apiKey: '### FIREBASE API KEY ###',
      authDomain: '### FIREBASE AUTH DOMAIN ###',
      projectId: '### CLOUD FIRESTORE PROJECT ID ###'
    });
  });

  test('We can start an application', async () => {
    firebase.firestore();
    expect(mockInitializeApp).toHaveBeenCalled();
  });

  describe('Examples from documentation', () => {
    test('add a user', () => {
      const db = firebase.firestore();

      // Example from documentation:
      // https://firebase.google.com/docs/firestore/quickstart#add_data
  
      db.collection('users').add({
        first: 'Ada',
        last: 'Lovelace',
        born: 1815
      }).then(function (docRef) {
        expect(mockAdd).toHaveBeenCalled();
        expect(docRef).toHaveProperty('id', 'abc123');
        expect(docRef.data()).toHaveProperty('first', 'Ada');
      });
    });

    test('get all users', () => {
      const db = firebase.firestore();
      // Example from documentation:
      // https://firebase.google.com/docs/firestore/quickstart#read_data
  
      db.collection('users').get().then((querySnapshot) => {
        expect(querySnapshot.forEach).toBeTruthy();
        expect(querySnapshot.docs.length).toBe(2);

        querySnapshot.forEach((doc) => {
          expect(doc.exists).toBe(true);
          expect(doc.data()).toBeTruthy();
        });
      });
    });

    test('set a city', () => {
      const db = firebase.firestore();
      // Example from documentation:
      // https://firebase.google.com/docs/firestore/manage-data/add-data#set_a_document\
  
      db.collection('cities').doc('LA').set({
        name: 'Los Angeles',
        state: 'CA',
        country: 'USA'
      }).then(function () {
        expect(mockSet).toHaveBeenCalledWith({ name: 'Los Angeles', state: 'CA', country: 'USA' });
      });
    });

    test('updating a city', () => {
      const db = firebase.firestore();
      // Example from documentation:
      // https://firebase.google.com/docs/firestore/manage-data/add-data#update-data
      const washingtonRef = db.collection("cities").doc("DC");

      // Set the "capital" field of the city 'DC'
      return washingtonRef.update({
        capital: true
      }).then(function () {
        expect(mockUpdate).toHaveBeenCalledWith({ capital: true });
      });
    });
    
    test('batch writes', () => {
      const db = firebase.firestore();
      // Example from documentation:
      // https://cloud.google.com/firestore/docs/manage-data/transactions

      // Get a new write batch
      const batch = db.batch();

      // Set the value of 'NYC'
      const nycRef = db.collection('cities').doc('NYC');
      batch.set(nycRef, { name: 'New York City' });

      // Update the population of 'SF'
      const sfRef = db.collection('cities').doc('SF');
      batch.update(sfRef, { 'population': 1000000 });

      // Delete the city 'LA'
      const laRef = db.collection('cities').doc('LA');
      batch.delete(laRef);

      // Commit the batch
      batch.commit().then(function () {
        expect(mockBatch).toHaveBeenCalled();
        expect(mockBatchDelete).toHaveBeenCalledWith(laRef);
        expect(mockBatchUpdate).toHaveBeenCalledWith(sfRef, { 'population': 1000000 });
        expect(mockBatchSet).toHaveBeenCalledWith(nycRef, { name: 'New York City' });
        expect(mockBatchCommit).toHaveBeenCalled();
      });
    });
  });
});