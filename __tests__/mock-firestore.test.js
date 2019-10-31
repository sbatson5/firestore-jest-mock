const { FakeFirestore } = require('firestore-jest-mock');

describe('Single records versus queries', () => {
  const db = new FakeFirestore({
    characters: [
      { id: 'homer', name: 'Homer', occupation: 'technician' }, 
      { id: 'krusty', name: 'Krusty', occupation: 'clown' }
    ]
  });

  test('it can fetch a single record', async () => {
    const record = await db.collection('characters').doc('krusty').get();
    expect(record.exists).toBe(true);
    expect(record.id).toBe('krusty');
    const data = record.data();
    expect(data).toHaveProperty('name', 'Krusty');
    expect(data).toHaveProperty('occupation', 'clown');
  });

  test('it flags records do not exist', async () => {
    const record = await db.collection('animals').doc('monkey').get();
    expect(record.exists).toBe(false);
  });

  test('it can fetch a single record with a promise', () => {
    db.collection('characters').doc('homer').get().then((record) => {
      expect(record.exists).toBe(true);
      expect(record.id).toBe('homer');
      const data = record.data();
      expect(data).toHaveProperty('name', 'Homer');
      expect(data).toHaveProperty('occupation', 'technician');
    });
  });

  test('it can fetch multiple records and returns documents', async () => {
    const records = await db.collection('characters').where('name', '==', 'Homer').get();

    expect(records.empty).toBe(false);
    expect(records).toHaveProperty('docs', expect.any(Array))
    expect(records.docs[0]).toHaveProperty('id', 'homer')
    expect(records.docs[0].data()).toHaveProperty('name', 'Homer')
  });

  test('it flags when a collection is empty', async () => {
    const records = await db.collection('animals').where('type', '==', 'mammal').get();
    expect(records.empty).toBe(true);
  });

  test('it can fetch multiple records as a promise', () => {
    db.collection('characters').where('name', '==', 'Homer').get().then((records) => {
      expect(records.empty).toBe(false);
      expect(records).toHaveProperty('docs', expect.any(Array))
      expect(records.docs[0]).toHaveProperty('id', 'homer')
      expect(records.docs[0].data()).toHaveProperty('name', 'Homer')
    });
  });

  test('it can return all records', async () => {
    const firstRecord = db.collection('characters').doc('homer');
    const secondRecord = db.collection('characters').doc('krusty');

    const records = await db.getAll(firstRecord, secondRecord);
    expect(records[0]).toHaveProperty('id', 'homer')
    expect(records[0].data()).toHaveProperty('name', 'Homer')
  });
});