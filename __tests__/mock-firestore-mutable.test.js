const { FakeFirestore } = require('firestore-jest-mock');
const { mockCollection, mockDoc } = require('firestore-jest-mock/mocks/firestore');

describe('database mutations', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  // db is a fn, instead a shared variable to enforce sandboxing data on each test.
  const db = () =>
    new FakeFirestore(
      {
        characters: [
          {
            id: 'homer',
            name: 'Homer',
            occupation: 'technician',
            address: { street: '742 Evergreen Terrace' },
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
      { mutable: true },
    );

  test('it can set simple record data', async () => {
    const mdb = db();
    await mdb
      .collection('animals')
      .doc('fantasy')
      .collection('dragons')
      .doc('whisperingDeath')
      .set({
        age: 15,
        food: 'omnivore',
        special: 'tunneling',
      });
    expect(mockCollection).toHaveBeenCalledWith('dragons');
    expect(mockDoc).toHaveBeenCalledWith('whisperingDeath');

    const doc = await mdb.doc('animals/fantasy/dragons/whisperingDeath').get();
    expect(doc.exists).toBe(true);
    expect(doc.id).toBe('whisperingDeath');
  });

  test('it correctly merges data on update', async () => {
    const mdb = db();
    const homer = mdb.collection('characters').doc('homer');
    await homer.set({ occupation: 'Astronaut' }, { merge: true });
    const doc = await homer.get();
    expect(doc.data().name).toEqual('Homer');
    expect(doc.data().occupation).toEqual('Astronaut');
  });

  test('it correctly overwrites data on set', async () => {
    const mdb = db();
    const homer = mdb.collection('characters').doc('homer');
    await homer.set({ occupation: 'Astronaut' });
    const doc = await homer.get();
    expect(doc.data().name).toBeUndefined();
    expect(doc.data().occupation).toEqual('Astronaut');
  });

  test('it can batch appropriately', async () => {
    const mdb = db();
    const homer = mdb.collection('characters').doc('homer');
    const krusty = mdb.collection('characters').doc('krusty');
    await mdb
      .batch()
      .update(homer, { drink: 'duff' })
      .set(krusty, { causeOfDeath: 'Simian homicide' })
      .commit();

    const homerData = (await homer.get()).data();
    expect(homerData.name).toEqual('Homer');
    expect(homerData.drink).toEqual('duff');
    const krustyData = (await krusty.get()).data();
    expect(krustyData.name).toBeUndefined();
    expect(krustyData.causeOfDeath).toEqual('Simian homicide');
  });

  test('it can add to collection', async () => {
    const col = db().collection('characters');
    const newDoc1 = await col.add({
      name: 'Lisa',
      occupation: 'President-in-waiting',
      address: { street: '742 Evergreen Terrace' },
    });

    const test = await newDoc1.get();
    expect(test.exists).toBe(true);

    const newDoc2 = await col.add({
      name: 'Lisa',
      occupation: 'President-in-waiting',
      address: { street: '742 Evergreen Terrace' },
    });
    expect(newDoc2.id).not.toEqual(newDoc1.id);
  });
});
