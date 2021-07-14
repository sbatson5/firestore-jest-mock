const { FakeFirestore } = require('firestore-jest-mock');
const { mockCollection, mockDoc } = require('firestore-jest-mock/mocks/firestore');

describe('Queries', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  const db = (simulateQueryFilters = false) =>
    new FakeFirestore(
      {
        characters: [
          {
            id: 'homer',
            name: 'Homer',
            occupation: 'technician',
            address: { street: '742 Evergreen Terrace' },
            // May 12, 1956.  Conveniently, a negative number
            birthdate: {
              seconds: -430444800,
              nanoseconds: 0,
            },
            // Test a pre-constructed Timestamp
            timestamp: new FakeFirestore.Timestamp(123, 456),
          },
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
      },
      { simulateQueryFilters },
    );

  describe('Single records versus queries', () => {
    test('it can fetch a single record', async () => {
      expect.assertions(6);
      const record = await db()
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
      const record = await db()
        .collection('animals')
        .doc('monkey')
        .get();
      expect(mockCollection).toHaveBeenCalledWith('animals');
      expect(mockDoc).toHaveBeenCalledWith('monkey');
      expect(record.id).toBe('monkey');
      expect(record.exists).toBe(false);
    });

    test('it can fetch a single record with a promise', () =>
      db()
        .collection('characters')
        .doc('homer')
        .get()
        .then(record => {
          expect(record.exists).toBe(true);
          expect(record.id).toBe('homer');
          expect(mockCollection).toHaveBeenCalledWith('characters');
          const data = record.data();
          expect(record).toHaveProperty('exists', true);
          expect(data).toBeDefined();
          expect(data).toHaveProperty('name', 'Homer');
          expect(data).toHaveProperty('occupation', 'technician');

          expect(record.get('name')).toEqual('Homer');
          expect(record.get('address.street')).toEqual('742 Evergreen Terrace');
          expect(record.get('address.street.doesntExist')).toBeNull();
        }));

    test('it can fetch a single record with a promise without a specified collection', () =>
      db()
        .doc('characters/homer')
        .get()
        .then(record => {
          expect(record.exists).toBe(true);
          expect(record.id).toBe('homer');
          expect(mockCollection).not.toHaveBeenCalled();
          const data = record.data();
          expect(record).toHaveProperty('exists', true);
          expect(data).toBeDefined();
          expect(data).toHaveProperty('name', 'Homer');
          expect(data).toHaveProperty('occupation', 'technician');
        }));

    test('it can fetch multiple records and returns documents', async () => {
      const records = await db()
        .collection('characters')
        .where('name', '==', 'Homer')
        .get();

      expect(records.empty).toBe(false);
      expect(records).toHaveProperty('docs', expect.any(Array));
      const doc = records.docs[0];
      expect(doc).toHaveProperty('id', 'homer');
      expect(doc).toHaveProperty('exists', true);
      const data = doc.data();
      expect(data).toBeDefined();
      expect(data).toHaveProperty('name', 'Homer');
    });

    test('it throws an error if the collection path ends at a document', () => {
      expect(() => db().collection('')).toThrow(Error);
      expect(db().collection('foo')).toBeInstanceOf(FakeFirestore.CollectionReference);
      expect(() => db().collection('foo/bar')).toThrow(Error);
      expect(db().collection('foo/bar/baz')).toBeInstanceOf(FakeFirestore.CollectionReference);
    });

    test('it throws an error if the document path ends at a collection', () => {
      expect(() => db().doc('')).toThrow(Error);
      expect(() => db().doc('characters')).toThrow(Error);
      expect(db().doc('characters/bob')).toBeInstanceOf(FakeFirestore.DocumentReference);
      expect(() => db().doc('characters/bob/family')).toThrow(Error);
    });

    test('it can fetch nonexistent documents from a root collection', async () => {
      const nope = await db()
        .doc('characters/joe')
        .get();
      expect(nope).toHaveProperty('exists', false);
      expect(nope).toHaveProperty('id', 'joe');
      expect(nope).toHaveProperty('ref');
      expect(nope.ref).toHaveProperty('path', 'characters/joe');
    });

    test('it can fetch nonexistent documents from extant subcollections', async () => {
      const nope = await db()
        .doc('characters/bob/family/thing3')
        .get();
      expect(nope).toHaveProperty('exists', false);
      expect(nope).toHaveProperty('id', 'thing3');
      expect(nope).toHaveProperty('ref');
      expect(nope.ref).toHaveProperty('path', 'characters/bob/family/thing3');
    });

    test('it can fetch nonexistent documents from nonexistent subcollections', async () => {
      const nope = await db()
        .doc('characters/sam/family/phil')
        .get();
      expect(nope).toHaveProperty('exists', false);
      expect(nope).toHaveProperty('id', 'phil');
      expect(nope).toHaveProperty('ref');
      expect(nope.ref).toHaveProperty('path', 'characters/sam/family/phil');
    });

    test('it can fetch nonexistent documents from nonexistent root collections', async () => {
      const nope = await db()
        .doc('foo/bar/baz/bin')
        .get();
      expect(nope).toHaveProperty('exists', false);
      expect(nope).toHaveProperty('id', 'bin');
      expect(nope).toHaveProperty('ref');
      expect(nope.ref).toHaveProperty('path', 'foo/bar/baz/bin');
    });

    test('it flags when a collection is empty', async () => {
      expect.assertions(1);
      const records = await db()
        .collection('animals')
        .where('type', '==', 'mammal')
        .get();
      expect(records).toHaveProperty('empty', true);
    });

    test.each`
      simulateQueryFilters | expectedSize
      ${true}              | ${1}
      ${false}             | ${3}
    `('it can fetch multiple records as a promise', ({ simulateQueryFilters, expectedSize }) =>
      db(simulateQueryFilters)
        .collection('characters')
        .where('name', '==', 'Homer')
        .get()
        .then(records => {
          expect(records).toHaveProperty('empty', false);
          expect(records).toHaveProperty('docs', expect.any(Array));
          expect(records).toHaveProperty('size', expectedSize);
          expect(records.docs[0]).toHaveProperty('id', 'homer');
          expect(records.docs[0]).toHaveProperty('exists', true);
          expect(records.docs[0].data()).toHaveProperty('name', 'Homer');
        }),
    );

    test('it can return all root records', async () => {
      expect.assertions(4);
      const firstRecord = db()
        .collection('characters')
        .doc('homer');
      const secondRecord = db()
        .collection('characters')
        .doc('krusty');

      const records = await db().getAll(firstRecord, secondRecord);
      expect(records.length).toBe(2);
      expect(records[0]).toHaveProperty('id', 'homer');
      expect(records[0]).toHaveProperty('exists', true);
      expect(records[0].data()).toHaveProperty('name', 'Homer');
    });

    test('it does not fetch subcollections unless we tell it to', async () => {
      expect.assertions(4);
      const record = await db()
        .collection('characters')
        .doc('bob')
        .get();
      expect(record.exists).toBe(true);
      expect(record.id).toBe('bob');
      expect(record.data()).toHaveProperty('name', 'Bob');
      expect(record.data()).not.toHaveProperty('_collections');
    });

    test('it can fetch records from subcollections', async () => {
      expect.assertions(8);
      const family = db()
        .collection('characters')
        .doc('bob')
        .collection('family');
      expect(family.path).toBe('characters/bob/family');

      const allFamilyMembers = await family.get();
      expect(allFamilyMembers.docs.length).toBe(4);
      expect(allFamilyMembers.forEach).toBeTruthy();

      const ref = family.doc('violet');
      expect(ref).toHaveProperty('path', 'characters/bob/family/violet');

      const record = await ref.get();
      expect(record).toHaveProperty('exists', true);
      expect(record).toHaveProperty('id', 'violet');
      expect(record).toHaveProperty('data');
      expect(record.data()).toHaveProperty('name', 'Violet');
    });

    test.each`
      simulateQueryFilters | expectedSize
      ${true}              | ${2}
      ${false}             | ${4}
    `(
      'it can fetch records from subcollections with query parameters',
      async ({ simulateQueryFilters, expectedSize }) => {
        const family = db(simulateQueryFilters)
          .collection('characters')
          .doc('bob')
          .collection('family')
          .where('relation', '==', 'son'); // should return only sons
        expect(family).toHaveProperty('path', 'characters/bob/family');

        const docs = await family.get();
        expect(docs).toHaveProperty('size', expectedSize);
      },
    );
  });

  describe('Multiple records versus queries', () => {
    test('it fetches all records from a root collection', async () => {
      expect.assertions(4);
      const characters = await db()
        .collection('characters')
        .get();
      expect(characters).toHaveProperty('empty', false);
      expect(characters).toHaveProperty('size', 3);
      expect(Array.isArray(characters.docs)).toBe(true);
      expect(characters.forEach).toBeTruthy();
    });

    test('it fetches no records from nonexistent collection', async () => {
      expect.assertions(4);
      const nope = await db()
        .collection('foo')
        .get();
      expect(nope).toHaveProperty('empty', true);
      expect(nope).toHaveProperty('size', 0);
      expect(Array.isArray(nope.docs)).toBe(true);
      expect(nope.forEach).toBeTruthy();
    });

    test('it fetches all records from subcollection', async () => {
      expect.assertions(4);
      const familyRef = db()
        .collection('characters')
        .doc('bob')
        .collection('family');
      const family = await familyRef.get();
      expect(family).toHaveProperty('empty', false);
      expect(family).toHaveProperty('size', 4);
      expect(Array.isArray(family.docs)).toBe(true);
      expect(family.forEach).toBeTruthy();
    });

    test('it fetches no records from nonexistent subcollection', async () => {
      expect.assertions(4);
      const nope = await db()
        .collection('characters')
        .doc('bob')
        .collection('not-here')
        .get();
      expect(nope).toHaveProperty('empty', true);
      expect(nope).toHaveProperty('size', 0);
      expect(Array.isArray(nope.docs)).toBe(true);
      expect(nope.forEach).toBeTruthy();
    });

    test('it fetches no records from nonexistent root collection', async () => {
      expect.assertions(4);
      const nope = await db()
        .collection('foo')
        .doc('bar')
        .collection('baz')
        .get();
      expect(nope).toHaveProperty('empty', true);
      expect(nope).toHaveProperty('size', 0);
      expect(Array.isArray(nope.docs)).toBe(true);
      expect(nope.forEach).toBeTruthy();
    });
  });

  test('New documents with random ID', async () => {
    expect.assertions(2);
    // See https://firebase.google.com/docs/reference/js/firebase.firestore.CollectionReference#doc
    // "If no path is specified, an automatically-generated unique ID will be used for the returned DocumentReference."
    const col = db().collection('foo');
    const newDoc = col.doc();
    const otherIds = col._records().map(doc => doc.id);
    expect(otherIds).not.toContainEqual(newDoc.id);
    expect(newDoc).toHaveProperty('path', `foo/${newDoc.id}`);
  });

  test('it properly converts timestamps', () =>
    db()
      .doc('characters/homer')
      .get()
      .then(record => {
        expect(record.id).toEqual('homer');
        const data = record.data();
        expect(typeof data.birthdate.toDate).toEqual('function');
      }));
});
