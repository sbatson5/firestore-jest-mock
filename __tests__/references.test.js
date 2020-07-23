const { FakeFirestore } = require('firestore-jest-mock');
const {
  mockCollection,
  mockDoc,
  mockDelete,
  mockWhere,
  mockLimit,
  mockOrderBy,
  mockStartAfter,
  mockStartAt,
} = require('firestore-jest-mock/mocks/firestore');

describe('Reference Sentinels', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  const db = new FakeFirestore({
    characters: [
      { id: 'homer', name: 'Homer', occupation: 'technician' },
      { id: 'krusty', name: 'Krusty', occupation: 'clown' },
      {
        id: 'bob',
        name: 'Bob',
        occupation: 'repairman',
        _collections: {
          family: [
            { id: 'thing1', name: 'Thing 1', relation: 'pet' },
            { id: 'thing2', name: 'Thing 2', relation: 'pet' },
            { id: 'deborah', name: 'Deborah', relation: 'wife' },
          ],
        },
      },
    ],
  });

  describe('Collection Reference', () => {
    test('it returns a collection reference', () => {
      const charactersRef = db.collection('characters');
      expect(charactersRef).toBeInstanceOf(FakeFirestore.CollectionReference);
      expect(charactersRef.parent).toBeNull();
      expect(mockCollection).toHaveBeenCalledWith('characters');

      expect(db.collection('non-existent')).toBeInstanceOf(FakeFirestore.CollectionReference);
      expect(mockCollection).toHaveBeenCalledWith('non-existent');
    });

    test('it compares collection references', () => {
      const collectionRef = db.collection('characters');
      expect(collectionRef.firestore).toBe(db);
      expect(collectionRef.id).toBe('characters');
      expect(collectionRef.path).toBe('database/characters');

      const other = db.collection('characters');
      expect(collectionRef.isEqual(collectionRef)).toBe(true);
      expect(collectionRef.isEqual(other)).toBe(true);
      expect(collectionRef.isEqual({})).toBe(false);
    });

    const collectionRef = db.collection('characters');

    test('it calls mockWhere', () => {
      collectionRef.where('occupation', '==', 'technician');
      expect(mockWhere).toHaveBeenCalledWith('occupation', '==', 'technician');
    });

    test('it calls mockLimit', () => {
      collectionRef.limit(2);
      expect(mockLimit).toHaveBeenCalledWith(2);
    });

    test('it calls mockOrderBy', () => {
      collectionRef.orderBy('name');
      expect(mockOrderBy).toHaveBeenCalledWith('name');
    });

    test('it calls mockStartAfter', () => {
      collectionRef.startAfter(null);
      expect(mockStartAfter).toHaveBeenCalledWith(null);
    });

    test('it calls mockStartAt', () => {
      collectionRef.startAt(null);
      expect(mockStartAt).toHaveBeenCalledWith(null);
    });
  });

  describe('Document Reference', () => {
    test('it returns a document reference', () => {
      const homerRef = db.collection('characters').doc('homer');
      expect(homerRef).toBeInstanceOf(FakeFirestore.DocumentReference);
      expect(homerRef.parent).toBeInstanceOf(FakeFirestore.CollectionReference);
      expect(mockCollection).toHaveBeenCalledWith('characters');
      expect(mockDoc).toHaveBeenCalledWith('homer');

      expect(db.collection('non-existent').doc('need-I-say-more')).toBeInstanceOf(
        FakeFirestore.DocumentReference,
      );
      expect(mockCollection).toHaveBeenCalledWith('non-existent');
      expect(mockDoc).toHaveBeenCalledWith('need-I-say-more');
    });

    test('it compares document references', () => {
      const docRef = db.collection('characters').doc('homer');
      expect(docRef.firestore).toBe(db);
      expect(docRef.id).toBe('homer');
      expect(docRef.path).toBe('database/characters/homer');

      const other = db.collection('characters').doc('homer');
      expect(docRef.isEqual(docRef)).toBe(true);
      expect(docRef.isEqual(other)).toBe(true);
      expect(docRef.isEqual({})).toBe(false);
    });

    test('it calls delete() mock', () => {
      const docRef = db.collection('characters').doc('homer');
      docRef.delete();
      expect(mockDelete).toHaveBeenCalled();
    });
  });
});
