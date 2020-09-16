const { FakeFirestore } = require('firestore-jest-mock');
const { mockCollection } = require('firestore-jest-mock/mocks/firestore');

describe('Single records versus queries', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  const db = new FakeFirestore({
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
        _collections: {
          family: [
            {
              id: 'marge',
              name: 'Marge',
            },
            {
              id: 'bart',
              name: 'Bart',
            },
            {
              id: 'lisa',
              name: 'Lisa',
            },
            {
              id: 'maggie',
              name: 'Maggie',
            },
          ],
        },
      },
      { id: 'krusty', name: 'Krusty', occupation: 'clown' },
    ],
  });

  test('it can fetch a single record', async () => {
    const record = await db
      .collection('characters')
      .doc('krusty')
      .get();
    expect(record.exists).toBe(true);
    expect(record.id).toBe('krusty');
    const data = record.data();
    expect(record).toHaveProperty('exists', true);
    expect(data).toBeDefined();
    expect(data).toHaveProperty('name', 'Krusty');
    expect(data).toHaveProperty('occupation', 'clown');
  });

  test('it flags records do not exist', async () => {
    const record = await db
      .collection('animals')
      .doc('monkey')
      .get();
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
        expect(mockCollection).toHaveBeenCalledWith('characters');
        const data = record.data();
        expect(record).toHaveProperty('exists', true);
        expect(data).toBeDefined();
        expect(data).toHaveProperty('name', 'Homer');
        expect(data).toHaveProperty('occupation', 'technician');

        expect(record.get('name')).toEqual('Homer');
        expect(record.get('address.street')).toEqual('742 Evergreen Terrace');
      }));

  test('it can fetch a nested record', () =>
    db
      .doc('characters/homer/family/marge')
      .get()
      .then(record => {
        expect(record.exists).toBe(true);
        expect(record.id).toBe('marge');
        const data = record.data();
        expect(data.name).toBe('Marge');
      }));

  test('it can fetch a nested collection', () =>
    db
      .collection('characters/homer/family')
      .getAll()
      .then(records => {
        expect(records.length).toBe(4);
        const record = records[0];
        expect(record.exists).toBe(true);
        expect(record).toHaveProperty('id', 'marge');
        expect(record.get('name')).toBe('Marge');
      }));

  test('it properly converts timestamps', () =>
    db
      .doc('characters/homer')
      .get()
      .then(record => {
        expect(record.id).toEqual('homer');
        const data = record.data();
        expect(typeof data.birthdate.toDate).toEqual('function');
      }));

  test('it can fetch a single record with a promise without a specified collection', () =>
    db
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
    const records = await db
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

  test('it flags when a collection is empty', async () => {
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
        expect(records.docs[0].data()).toHaveProperty('name', 'Homer');
      }));

  test('it can return all records', async () => {
    const firstRecord = db.collection('characters').doc('homer');
    const secondRecord = db.collection('characters').doc('krusty');

    const records = await db.getAll(firstRecord, secondRecord);
    expect(records[0]).toHaveProperty('id', 'homer');
    expect(records[0]).toHaveProperty('exists', true);
    expect(records[0].data()).toBeDefined();
    expect(records[0].data()).toHaveProperty('name', 'Homer');
  });
});
