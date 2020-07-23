const { FakeFirestore } = require('firestore-jest-mock');
const { mockCollection, mockDoc } = require('firestore-jest-mock/mocks/firestore');

describe('Queries', () => {
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
        occupation: 'insurance agent',
        _collections: {
          family: [
            { id: 'violet', name: 'Violet', relation: 'daughter' },
            { id: 'dash', name: 'Dash', relation: 'son' },
            { id: 'jackjack', name: 'Jackjack', relation: 'son' },
            { id: 'helen', name: 'Helen', relation: 'wife' },
          ],
        },
      },
    ],
  });

  describe('Single records versus queries', () => {
    test('it can fetch a single record', async () => {
      expect.assertions(6);
      const record = await db
        .collection('characters')
        .doc('krusty')
        .get();
      expect(mockCollection).toHaveBeenCalledWith('characters');
      expect(mockDoc).toHaveBeenCalledWith('krusty');
      expect(record.exists).toBe(true);
      expect(record.id).toBe('krusty');
      const data = record.data();
      expect(data).toHaveProperty('name', 'Krusty');
      expect(data).toHaveProperty('occupation', 'clown');
    });

    test('it flags records do not exist', async () => {
      expect.assertions(4);
      const record = await db
        .collection('animals')
        .doc('monkey')
        .get();
      expect(mockCollection).toHaveBeenCalledWith('animals');
      expect(mockDoc).toHaveBeenCalledWith('monkey');
      expect(record.id).toBe('monkey');
      expect(record.exists).toBe(false);
    });

    test('it can fetch a single record with a promise', () =>
      db
        .collection('characters')
        .doc('homer')
        .get()
        .then(record => {
          expect(record.exists).toBe(true);
          expect(record.id).toBe('homer');
          const data = record.data();
          expect(mockCollection).toHaveBeenCalledWith('characters');
          expect(data).toHaveProperty('name', 'Homer');
          expect(data).toHaveProperty('occupation', 'technician');
        }));

    test('it can fetch a single record with a promise without a specified collection', () => {
      expect.assertions(6);
      const homerRef = db.doc('characters/homer');
      expect(homerRef).toHaveProperty('firestore', db);

      return homerRef.get().then(record => {
        expect(record.exists).toBe(true);
        expect(record.id).toBe('homer');
        const data = record.data();
        expect(mockCollection).not.toHaveBeenCalled();
        expect(data).toHaveProperty('name', 'Homer');
        expect(data).toHaveProperty('occupation', 'technician');
      });
    });

    test('it throws an error if the document path ends at a collection', () => {
      expect(() => db.doc('characters')).toThrow(Error);
      expect(() => db.doc('characters/bob')).not.toThrow();
      expect(() => db.doc('characters/bob/family')).toThrow(Error);
    });

    test('it can fetch nonexistent documents from a root collection', async () => {
      expect.assertions(2);
      const nope = await db.doc('characters/joe').get();
      expect(nope.exists).toBe(false);
      expect(nope.id).toBe('joe');
    });

    test('it can fetch nonexistent documents from extant subcollections', async () => {
      const nope = await db.doc('characters/bob/family/thing3').get();
      expect(nope.exists).toBe(false);
      expect(nope.id).toBe('thing3');
    });

    test('it can fetch nonexistent documents from nonexistent subcollections', async () => {
      const nope = await db.doc('characters/sam/family/phil').get();
      expect(nope.exists).toBe(false);
      expect(nope.id).toBe('phil');
    });

    test('it can fetch nonexistent documents from nonexistent root collections', async () => {
      const nope = await db.doc('foo/bar/baz/bin').get();
      expect(nope.exists).toBe(false);
      expect(nope.id).toBe('bin');
    });

    test('it can fetch multiple records and returns documents', async () => {
      const records = await db
        .collection('characters')
        .where('name', '==', 'Homer')
        .get();

      expect(records.empty).toBe(false);
      expect(records).toHaveProperty('docs', expect.any(Array));
      expect(records.docs[0]).toHaveProperty('id', 'homer');
      expect(records.docs[0].data()).toHaveProperty('name', 'Homer');
    });

    test('it flags when a collection is empty', async () => {
      expect.assertions(1);
      const records = await db
        .collection('animals')
        .where('type', '==', 'mammal')
        .get();
      expect(records.empty).toBe(true);
    });

    test('it can fetch multiple records as a promise', () =>
      db
        .collection('characters')
        .where('name', '==', 'Homer')
        .get()
        .then(records => {
          expect(records.empty).toBe(false);
          expect(records).toHaveProperty('docs', expect.any(Array));
          expect(records.docs[0]).toHaveProperty('id', 'homer');
          expect(records.docs[0]).toHaveProperty('exists', true);
          expect(records.docs[0].data()).toHaveProperty('name', 'Homer');
        }));

    test('it can return all root records', async () => {
      expect.assertions(4);
      const firstRecord = db.collection('characters').doc('homer');
      const secondRecord = db.collection('characters').doc('krusty');

      const records = await db.getAll(firstRecord, secondRecord);
      expect(records.length).toBe(2);
      expect(records[0]).toHaveProperty('id', 'homer');
      expect(records[0]).toHaveProperty('exists', true);
      expect(records[0].data()).toHaveProperty('name', 'Homer');
    });

    test('it does not fetch subcollections unless we tell it to', async () => {
      expect.assertions(4);
      const record = await db
        .collection('characters')
        .doc('bob')
        .get();
      expect(record.exists).toBe(true);
      expect(record.id).toBe('bob');
      expect(record.data()).toHaveProperty('name', 'Bob');
      expect(record.data()).not.toHaveProperty('_collections');
    });

    test('it can fetch records from subcollections', async () => {
      expect.assertions(7);
      const family = db
        .collection('characters')
        .doc('bob')
        .collection('family');
      expect(family.path).toBe('database/characters/bob/family');

      const allFamilyMembers = await family.get();
      expect(allFamilyMembers.docs.length).toBe(4);
      expect(allFamilyMembers.forEach).toBeTruthy();

      const ref = family.doc('violet');
      expect(ref.path).toBe('database/characters/bob/family/violet');

      const record = await ref.get();
      expect(record.exists).toBe(true);
      expect(record.id).toBe('violet');
      expect(record.data()).toHaveProperty('name', 'Violet');
    });
  });

  describe('Multiple records versus queries', () => {
    test('it fetches all records from a root collection', async () => {
      expect.assertions(4);
      const characters = await db.collection('characters').get();
      expect(characters.empty).toBe(false);
      expect(characters.size).toBe(3);
      expect(Array.isArray(characters.docs)).toBe(true);
      expect(characters.forEach).toBeTruthy();
    });

    test('it fetches no records from nonexistent collection', async () => {
      expect.assertions(4);
      const nope = await db.collection('foo').get();
      expect(nope.empty).toBe(true);
      expect(nope.size).toBe(0);
      expect(Array.isArray(nope.docs)).toBe(true);
      expect(nope.forEach).toBeTruthy();
    });

    test('it fetches all records from subcollection', async () => {
      expect.assertions(4);
      const familyRef = db
        .collection('characters')
        .doc('bob')
        .collection('family');
      const family = await familyRef.get();
      expect(family.empty).toBe(false);
      expect(family.size).toBe(4);
      expect(Array.isArray(family.docs)).toBe(true);
      expect(family.forEach).toBeTruthy();
    });

    test('it fetches no records from nonexistent subcollection', async () => {
      expect.assertions(4);
      const nope = await db
        .collection('characters')
        .doc('bob')
        .collection('not-here')
        .get();
      expect(nope.empty).toBe(true);
      expect(nope.size).toBe(0);
      expect(Array.isArray(nope.docs)).toBe(true);
      expect(nope.forEach).toBeTruthy();
    });

    test('it fetches no records from nonexistent root collection', async () => {
      expect.assertions(4);
      const nope = await db
        .collection('foo')
        .doc('bar')
        .collection('baz')
        .get();
      expect(nope.empty).toBe(true);
      expect(nope.size).toBe(0);
      expect(Array.isArray(nope.docs)).toBe(true);
      expect(nope.forEach).toBeTruthy();
    });
  });
});
