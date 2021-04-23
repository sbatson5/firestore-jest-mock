const { mockGoogleCloudFirestore } = require('firestore-jest-mock');

const flushPromises = () => new Promise(setImmediate);

const {
  mockGet,
  mockAdd,
  mockSet,
  mockUpdate,
  mockWhere,
  mockCollectionGroup,
  mockBatch,
  mockBatchCommit,
  mockBatchDelete,
  mockBatchUpdate,
  mockBatchSet,
  mockSettings,
  mockOnSnapShot,
} = require('../mocks/firestore');

describe('we can start a firestore application', () => {
  mockGoogleCloudFirestore({
    database: {
      users: [
        { id: 'abc123', first: 'Bob', last: 'builder', born: 1998 },
        {
          id: '123abc',
          first: 'Blues',
          last: 'builder',
          born: 1996,
          _collections: {
            cities: [{ id: 'LA', name: 'Los Angeles', state: 'CA', country: 'USA', visited: true }],
          },
        },
      ],
      cities: [
        { id: 'LA', name: 'Los Angeles', state: 'CA', country: 'USA' },
        { id: 'DC', name: 'Disctric of Columbia', state: 'DC', country: 'USA' },
      ],
    },
  });

  beforeEach(() => {
    this.Firestore = require('@google-cloud/firestore').Firestore;
  });

  test('We can start an application', async () => {
    const firestore = new this.Firestore();
    firestore.settings({ ignoreUndefinedProperties: true });
    expect(mockSettings).toHaveBeenCalledWith({ ignoreUndefinedProperties: true });
  });

  describe('Examples from documentation', () => {
    test('add a user', () => {
      const firestore = new this.Firestore();

      return firestore
        .collection('users')
        .add({
          first: 'Ada',
          last: 'Lovelace',
          born: 1815,
        })
        .then(function(docRef) {
          expect(mockAdd).toHaveBeenCalled();
          expect(docRef).toHaveProperty('id', 'abc123');
        });
    });

    test('get all users', () => {
      const firestore = new this.Firestore();

      return firestore
        .collection('users')
        .get()
        .then(querySnapshot => {
          expect(querySnapshot.forEach).toBeTruthy();
          expect(querySnapshot.docs.length).toBe(2);
          expect(querySnapshot.size).toBe(querySnapshot.docs.length);

          querySnapshot.forEach(doc => {
            expect(doc.exists).toBe(true);
            expect(doc.data()).toBeTruthy();
          });
        });
    });

    test('collectionGroup at root', () => {
      const firestore = new this.Firestore();

      return firestore
        .collectionGroup('users')
        .where('last', '==', 'builder')
        .get()
        .then(querySnapshot => {
          expect(mockCollectionGroup).toHaveBeenCalledWith('users');
          expect(mockGet).toHaveBeenCalled();
          expect(mockWhere).toHaveBeenCalledWith('last', '==', 'builder');

          expect(querySnapshot.forEach).toBeTruthy();
          expect(querySnapshot.docs.length).toBe(2);
          expect(querySnapshot.size).toBe(querySnapshot.docs.length);

          querySnapshot.forEach(doc => {
            expect(doc.exists).toBe(true);
            expect(doc.data()).toBeTruthy();
          });
        });
    });

    test('collectionGroup with subcollections', () => {
      const firestore = new this.Firestore();

      return firestore
        .collectionGroup('cities')
        .where('type', '==', 'museum')
        .get()
        .then(querySnapshot => {
          expect(mockCollectionGroup).toHaveBeenCalledWith('cities');
          expect(mockGet).toHaveBeenCalled();
          expect(mockWhere).toHaveBeenCalledWith('type', '==', 'museum');

          expect(querySnapshot.forEach).toBeTruthy();
          expect(querySnapshot.docs.length).toBe(3);
          expect(querySnapshot.size).toBe(querySnapshot.docs.length);

          querySnapshot.forEach(doc => {
            expect(doc.exists).toBe(true);
            expect(doc.data()).toBeTruthy();
          });
        });
    });

    test('set a city', () => {
      const firestore = new this.Firestore();

      return firestore
        .collection('cities')
        .doc('LA')
        .set({
          name: 'Los Angeles',
          state: 'CA',
          country: 'USA',
        })
        .then(function() {
          expect(mockSet).toHaveBeenCalledWith({
            name: 'Los Angeles',
            state: 'CA',
            country: 'USA',
          });
        });
    });

    test('updating a city', () => {
      const firestore = new this.Firestore();

      const washingtonRef = firestore.collection('cities').doc('DC');

      return washingtonRef
        .update({
          capital: true,
        })
        .then(function() {
          expect(mockUpdate).toHaveBeenCalledWith({ capital: true });
        });
    });

    test('batch writes', () => {
      const firestore = new this.Firestore();

      // Get a new write batch
      const batch = firestore.batch();

      // Set the value of 'NYC'
      const nycRef = firestore.collection('cities').doc('NYC');
      batch.set(nycRef, { name: 'New York City' });

      // Update the population of 'SF'
      const sfRef = firestore.collection('cities').doc('SF');
      batch.update(sfRef, { population: 1000000 });

      // Delete the city 'LA'
      const laRef = firestore.collection('cities').doc('LA');
      batch.delete(laRef);

      // Commit the batch
      return batch.commit().then(function() {
        expect(mockBatch).toHaveBeenCalled();
        expect(mockBatchDelete).toHaveBeenCalledWith(laRef);
        expect(mockBatchUpdate).toHaveBeenCalledWith(sfRef, { population: 1000000 });
        expect(mockBatchSet).toHaveBeenCalledWith(nycRef, { name: 'New York City' });
        expect(mockBatchCommit).toHaveBeenCalled();
      });
    });

    test('onSnapshot single doc', async () => {
      const firestore = new this.Firestore();

      firestore
        .collection('cities')
        .doc('LA')
        .onSnapshot(doc => {
          expect(doc).toHaveProperty('data');
          expect(doc.data).toBeInstanceOf(Function);
          expect(doc).toHaveProperty('metadata');
        });

      await flushPromises();

      expect(mockOnSnapShot).toHaveBeenCalled();
    });

    test('onSnapshot can work with options', async () => {
      const firestore = new this.Firestore();

      firestore
        .collection('cities')
        .doc('LA')
        .onSnapshot(
          {
            // Listen for document metadata changes
            includeMetadataChanges: true,
          },
          doc => {
            expect(doc).toHaveProperty('data');
            expect(doc.data).toBeInstanceOf(Function);
            expect(doc).toHaveProperty('metadata');
          },
        );

      await flushPromises();

      expect(mockOnSnapShot).toHaveBeenCalled();
    });

    test('onSnapshot with query', async () => {
      const firestore = new this.Firestore();

      const unsubscribe = firestore
        .collection('cities')
        .where('state', '==', 'CA')
        .onSnapshot(querySnapshot => {
          expect(querySnapshot).toHaveProperty('forEach');
          expect(querySnapshot).toHaveProperty('docChanges');
          expect(querySnapshot).toHaveProperty('docs');

          expect(querySnapshot.forEach).toBeInstanceOf(Function);
          expect(querySnapshot.docChanges).toBeInstanceOf(Function);
          expect(querySnapshot.docs).toBeInstanceOf(Array);

          expect(querySnapshot.docChanges()).toBeInstanceOf(Array);
        });

      await flushPromises();

      expect(unsubscribe).toBeInstanceOf(Function);
      expect(mockWhere).toHaveBeenCalled();
      expect(mockOnSnapShot).toHaveBeenCalled();
    });
  });
});
