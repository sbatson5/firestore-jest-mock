const {
  mockCollection,
  mockDoc,
  mockGet,
  mockWhere,
  mockOffset,
  FakeFirestore,
} = require('../mocks/firestore');
const { mockFirebase } = require('firestore-jest-mock');

describe('Queries', () => {
  mockFirebase(
    {
      database: {
        animals: [
          {
            id: 'monkey',
            name: 'monkey',
            type: 'mammal',
            legCount: 2,
            food: ['banana', 'mango'],
            foodCount: 1,
            foodEaten: [500, 20],
            createdAt: new FakeFirestore.Timestamp(1628939119, 0),
          },
          {
            id: 'elephant',
            name: 'elephant',
            type: 'mammal',
            legCount: 4,
            food: ['banana', 'peanut'],
            foodCount: 0,
            foodEaten: [0, 500],
            createdAt: new FakeFirestore.Timestamp(1628939129, 0),
          },
          {
            id: 'chicken',
            name: 'chicken',
            type: 'bird',
            legCount: 2,
            food: ['leaf', 'nut', 'ant'],
            foodCount: 4,
            foodEaten: [80, 20, 16],
            createdAt: new FakeFirestore.Timestamp(1628939139, 0),
            _collections: {
              foodSchedule: [
                {
                  id: 'nut',
                  interval: 'whenever',
                },
                {
                  id: 'leaf',
                  interval: 'hourly',
                },
              ],
            },
          },
          {
            id: 'ant',
            name: 'ant',
            type: 'insect',
            legCount: 6,
            food: ['leaf', 'bread'],
            foodCount: 2,
            foodEaten: [80, 12],
            createdAt: new FakeFirestore.Timestamp(1628939149, 0),
            _collections: {
              foodSchedule: [
                {
                  id: 'leaf',
                  interval: 'daily',
                },
                {
                  id: 'peanut',
                  interval: 'weekly',
                },
              ],
            },
          },
          {
            id: 'worm',
            name: 'worm',
            legCount: null,
          },
          {
            id: 'pogo-stick',
            name: 'pogo-stick',
            food: false,
          },
          {
            id: 'cow',
            name: 'cow',
            appearance: {
              color: 'brown',
              size: 'large',
            },
          },
        ],
        foodSchedule: [
          { id: 'ants', interval: 'daily' },
          { id: 'cows', interval: 'twice daily' },
        ],
        nested: [
          {
            id: 'collections',
            _collections: {
              have: [
                {
                  id: 'lots',
                  _collections: {
                    of: [
                      {
                        id: 'applications',
                        _collections: {
                          foodSchedule: [
                            {
                              id: 'layer4_a',
                              interval: 'daily',
                            },
                            {
                              id: 'layer4_b',
                              interval: 'weekly',
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
      currentUser: { uid: 'homer-user' },
    },
    { simulateQueryFilters: true },
  );

  const firebase = require('firebase');
  firebase.initializeApp({
    apiKey: '### FIREBASE API KEY ###',
    authDomain: '### FIREBASE AUTH DOMAIN ###',
    projectId: '### CLOUD FIRESTORE PROJECT ID ###',
  });

  const db = firebase.firestore();

  test('it can query a single document', async () => {
    const monkey = await db
      .collection('animals')
      .doc('monkey')
      .get();

    expect(monkey).toHaveProperty('exists', true);
    expect(mockCollection).toHaveBeenCalledWith('animals');
    expect(mockDoc).toHaveBeenCalledWith('monkey');
    expect(mockGet).toHaveBeenCalled();
  });

  test('it can query null values', async () => {
    const noLegs = await db
      .collection('animals')
      .where('legCount', '==', null)
      .get();

    expect(noLegs).toHaveProperty('size', 1);
    const worm = noLegs.docs[0];
    expect(worm).toBeDefined();
    expect(worm).toHaveProperty('id', 'worm');
  });

  test('it can query false values', async () => {
    const noFood = await db
      .collection('animals')
      .where('food', '==', false)
      .get();

    expect(noFood).toHaveProperty('size', 1);
    const pogoStick = noFood.docs[0];
    expect(pogoStick).toBeDefined();
    expect(pogoStick).toHaveProperty('id', 'pogo-stick');
  });

  test('it can query nested values', async () => {
    const brownColor = await db
      .collection('animals')
      .where('appearance.color', '==', 'brown')
      .get();

    expect(brownColor).toHaveProperty('size', 1);
    const cow = brownColor.docs[0];
    expect(cow).toBeDefined();
    expect(cow).toHaveProperty('id', 'cow');
  });

  test('it can query date values for equality', async () => {
    const elephant = await db
      .collection('animals')
      .where('createdAt', '==', new Date(1628939129 * 1000))
      .get();

    expect(elephant).toHaveProperty('size', 1);
    expect(elephant.docs[0].id).toEqual('elephant');
  });

  test('it can query date values for greater than condition', async () => {
    const res = await db
      .collection('animals')
      .where('createdAt', '>', new Date(1628939129 * 1000))
      .get();

    expect(res).toHaveProperty('size', 2);
    expect(res.docs[0].id).toEqual('chicken');
    expect(res.docs[1].id).toEqual('ant');
  });

  test('it can query multiple documents', async () => {
    expect.assertions(9);
    const animals = await db
      .collection('animals')
      .where('type', '==', 'mammal')
      .get();

    expect(animals).toHaveProperty('docs', expect.any(Array));
    expect(mockCollection).toHaveBeenCalledWith('animals');

    // Make sure that the filter behaves appropriately
    expect(animals.docs.length).toBe(2);

    // Make sure that forEach works properly
    expect(animals).toHaveProperty('forEach', expect.any(Function));
    animals.forEach(doc => {
      // this should run 4 times, as asserted by `expect.assertions` above
      expect(doc).toHaveProperty('exists', true);
    });

    expect(mockWhere).toHaveBeenCalledWith('type', '==', 'mammal');
    expect(mockGet).toHaveBeenCalled();
    expect(animals).toHaveProperty('size', 2); // Returns 2 of 4 documents
  });

  test('it can filter firestore equality queries in subcollections', async () => {
    const antSchedule = await db
      .collection('animals')
      .doc('ant')
      .collection('foodSchedule')
      .where('interval', '==', 'daily')
      .get();

    expect(mockCollection).toHaveBeenCalledWith('animals');
    expect(mockCollection).toHaveBeenCalledWith('foodSchedule');
    expect(mockWhere).toHaveBeenCalledWith('interval', '==', 'daily');
    expect(mockGet).toHaveBeenCalled();
    expect(antSchedule).toHaveProperty('docs', expect.any(Array));
    expect(antSchedule).toHaveProperty('size', 1); // Returns 1 of 2 documents
  });

  test('in a transaction, it can filter firestore equality queries in subcollections', async () => {
    mockGet.mockReset();

    const antSchedule = db
      .collection('animals')
      .doc('ant')
      .collection('foodSchedule')
      .where('interval', '==', 'daily');

    expect.assertions(6);
    await db.runTransaction(async transaction => {
      const scheduleItems = await transaction.get(antSchedule);
      expect(mockCollection).toHaveBeenCalledWith('animals');
      expect(mockCollection).toHaveBeenCalledWith('foodSchedule');
      expect(mockWhere).toHaveBeenCalledWith('interval', '==', 'daily');
      expect(mockGet).not.toHaveBeenCalled();
      expect(scheduleItems).toHaveProperty('docs', expect.any(Array));
      expect(scheduleItems).toHaveProperty('size', 1); // Returns 1 of 2 documents
    });
  });

  test('it can filter firestore comparison queries in subcollections', async () => {
    const chickenSchedule = db
      .collection('animals')
      .doc('chicken')
      .collection('foodSchedule')
      .where('interval', '<=', 'hourly'); // should have 1 result

    const scheduleItems = await chickenSchedule.get();
    expect(scheduleItems).toHaveProperty('docs', expect.any(Array));
    expect(scheduleItems).toHaveProperty('size', 1); // Returns 1 document
    expect(scheduleItems.docs[0]).toHaveProperty(
      'ref',
      expect.any(FakeFirestore.DocumentReference),
    );
    expect(scheduleItems.docs[0]).toHaveProperty('id', 'leaf');
    expect(scheduleItems.docs[0].data()).toHaveProperty('interval', 'hourly');
    expect(scheduleItems.docs[0].ref).toHaveProperty('path', 'animals/chicken/foodSchedule/leaf');
  });

  test('in a transaction, it can filter firestore comparison queries in subcollections', async () => {
    const chickenSchedule = db
      .collection('animals')
      .doc('chicken')
      .collection('foodSchedule')
      .where('interval', '<=', 'hourly'); // should have 1 result

    expect.assertions(6);
    await db.runTransaction(async transaction => {
      const scheduleItems = await transaction.get(chickenSchedule);
      expect(scheduleItems).toHaveProperty('docs', expect.any(Array));
      expect(scheduleItems).toHaveProperty('size', 1); // Returns 1 document
      expect(scheduleItems.docs[0]).toHaveProperty(
        'ref',
        expect.any(FakeFirestore.DocumentReference),
      );
      expect(scheduleItems.docs[0]).toHaveProperty('id', 'leaf');
      expect(scheduleItems.docs[0].data()).toHaveProperty('interval', 'hourly');
      expect(scheduleItems.docs[0].ref).toHaveProperty('path', 'animals/chicken/foodSchedule/leaf');
    });
  });

  test('it can query collection groups', async () => {
    const allSchedules = await db.collectionGroup('foodSchedule').get();

    expect(allSchedules).toHaveProperty('size', 8); // Returns all 8
    const paths = allSchedules.docs.map(doc => doc.ref.path).sort();
    const expectedPaths = [
      'nested/collections/have/lots/of/applications/foodSchedule/layer4_a',
      'nested/collections/have/lots/of/applications/foodSchedule/layer4_b',
      'animals/ant/foodSchedule/leaf',
      'animals/ant/foodSchedule/peanut',
      'animals/chicken/foodSchedule/leaf',
      'animals/chicken/foodSchedule/nut',
      'foodSchedule/ants',
      'foodSchedule/cows',
    ].sort();
    expect(paths).toStrictEqual(expectedPaths);
  });

  test('it returns the same instance from query methods', () => {
    const ref = db.collection('animals');
    const notThisRef = db.collection('elsewise');
    expect(ref.where('type', '==', 'mammal')).toBe(ref);
    expect(ref.where('type', '==', 'mammal')).not.toBe(notThisRef);
    expect(ref.limit(1)).toBe(ref);
    expect(ref.limit(1)).not.toBe(notThisRef);
    expect(ref.orderBy('type')).toBe(ref);
    expect(ref.orderBy('type')).not.toBe(notThisRef);
    expect(ref.startAfter(null)).toBe(ref);
    expect(ref.startAfter(null)).not.toBe(notThisRef);
    expect(ref.startAt(null)).toBe(ref);
    expect(ref.startAt(null)).not.toBe(notThisRef);
  });

  test('it returns a Query from query methods', () => {
    const ref = db.collection('animals');
    expect(ref.where('type', '==', 'mammal')).toBeInstanceOf(FakeFirestore.Query);
    expect(ref.limit(1)).toBeInstanceOf(FakeFirestore.Query);
    expect(ref.orderBy('type')).toBeInstanceOf(FakeFirestore.Query);
    expect(ref.startAfter(null)).toBeInstanceOf(FakeFirestore.Query);
    expect(ref.startAt(null)).toBeInstanceOf(FakeFirestore.Query);
  });

  test('it throws an error when comparing to null', () => {
    expect(() => db.collection('animals').where('legCount', '>', null)).toThrow();
    expect(() => db.collection('animals').where('legCount', '>=', null)).toThrow();
    expect(() => db.collection('animals').where('legCount', '<', null)).toThrow();
    expect(() => db.collection('animals').where('legCount', '<=', null)).toThrow();
    expect(() => db.collection('animals').where('legCount', 'array-contains', null)).toThrow();
    expect(() => db.collection('animals').where('legCount', 'array-contains-any', null)).toThrow();
    expect(() => db.collection('animals').where('legCount', 'in', null)).toThrow();
    expect(() => db.collection('animals').where('legCount', 'not-in', null)).toThrow();
  });

  test('it allows equality comparisons with null', () => {
    expect(() => db.collection('animals').where('legCount', '==', null)).not.toThrow();
    expect(() => db.collection('animals').where('legCount', '!=', null)).not.toThrow();
  });

  test('it permits mocking the results of a where clause', async () => {
    expect.assertions(2);
    const ref = db.collection('animals');

    let result = await ref.where('type', '==', 'mammal').get();
    expect(result.docs.length).toBe(2);

    // There's got to be a better way to mock like this, but at least it works.
    mockWhere.mockReturnValueOnce({
      get() {
        return Promise.resolve({
          docs: [
            { id: 'monkey', name: 'monkey', type: 'mammal' },
            { id: 'elephant', name: 'elephant', type: 'mammal' },
          ],
        });
      },
    });
    result = await ref.where('type', '==', 'mammal').get();
    expect(result.docs.length).toBe(2);
  });

  test('it can offset query', async () => {
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

  describe('Query Operations', () => {
    test.each`
      comp        | value     | count
      ${'=='}     | ${2}      | ${2}
      ${'=='}     | ${4}      | ${1}
      ${'=='}     | ${6}      | ${1}
      ${'=='}     | ${7}      | ${0}
      ${'!='}     | ${7}      | ${5}
      ${'!='}     | ${4}      | ${4}
      ${'>'}      | ${1000}   | ${0}
      ${'>'}      | ${1}      | ${4}
      ${'>'}      | ${6}      | ${0}
      ${'>='}     | ${1000}   | ${0}
      ${'>='}     | ${6}      | ${1}
      ${'>='}     | ${0}      | ${4}
      ${'<'}      | ${-10000} | ${0}
      ${'<'}      | ${10000}  | ${4}
      ${'<'}      | ${2}      | ${0}
      ${'<'}      | ${6}      | ${3}
      ${'<='}     | ${-10000} | ${0}
      ${'<='}     | ${10000}  | ${4}
      ${'<='}     | ${2}      | ${2}
      ${'<='}     | ${6}      | ${4}
      ${'in'}     | ${[6, 2]} | ${3}
      ${'not-in'} | ${[6, 2]} | ${2}
      ${'not-in'} | ${[4]}    | ${4}
      ${'not-in'} | ${[7]}    | ${5}
    `(
      // eslint-disable-next-line quotes
      "it performs '$comp' queries on number values ($count doc(s) where legCount $comp $value)",
      async ({ comp, value, count }) => {
        const results = await db
          .collection('animals')
          .where('legCount', comp, value)
          .get();
        expect(results.size).toBe(count);
      },
    );

    test.each`
      comp        | value     | count
      ${'=='}     | ${0}      | ${1}
      ${'=='}     | ${1}      | ${1}
      ${'=='}     | ${2}      | ${1}
      ${'=='}     | ${4}      | ${1}
      ${'=='}     | ${6}      | ${0}
      ${'>'}      | ${-1}     | ${4}
      ${'>'}      | ${0}      | ${3}
      ${'>'}      | ${1}      | ${2}
      ${'>'}      | ${4}      | ${0}
      ${'>='}     | ${6}      | ${0}
      ${'>='}     | ${4}      | ${1}
      ${'>='}     | ${0}      | ${4}
      ${'<'}      | ${2}      | ${2}
      ${'<'}      | ${6}      | ${4}
      ${'<='}     | ${2}      | ${3}
      ${'<='}     | ${6}      | ${4}
      ${'in'}     | ${[2, 0]} | ${2}
      ${'not-in'} | ${[2, 0]} | ${2}
    `(
      // eslint-disable-next-line quotes
      "it performs '$comp' queries on number values that may be zero ($count doc(s) where foodCount $comp $value)",
      async ({ comp, value, count }) => {
        const results = await db
          .collection('animals')
          .where('foodCount', comp, value)
          .get();
        expect(results.size).toBe(count);
      },
    );

    test.each`
      comp        | value                      | count
      ${'=='}     | ${'mammal'}                | ${2}
      ${'=='}     | ${'bird'}                  | ${1}
      ${'=='}     | ${'fish'}                  | ${0}
      ${'!='}     | ${'bird'}                  | ${3}
      ${'!='}     | ${'fish'}                  | ${4}
      ${'>'}      | ${'insect'}                | ${2}
      ${'>'}      | ${'z'}                     | ${0}
      ${'>='}     | ${'mammal'}                | ${2}
      ${'>='}     | ${'insect'}                | ${3}
      ${'<'}      | ${'bird'}                  | ${0}
      ${'<'}      | ${'mammal'}                | ${2}
      ${'<='}     | ${'mammal'}                | ${4}
      ${'<='}     | ${'bird'}                  | ${1}
      ${'<='}     | ${'a'}                     | ${0}
      ${'in'}     | ${['a', 'bird', 'mammal']} | ${3}
      ${'not-in'} | ${['a', 'bird', 'mammal']} | ${1}
    `(
      // eslint-disable-next-line quotes
      "it performs '$comp' queries on string values ($count doc(s) where type $comp '$value')",
      async ({ comp, value, count }) => {
        const results = await db
          .collection('animals')
          .where('type', comp, value)
          .get();
        expect(results.size).toBe(count);
      },
    );

    test.each`
      comp                    | value                            | count
      ${'=='}                 | ${['banana', 'mango']}           | ${1}
      ${'=='}                 | ${['mango', 'banana']}           | ${0}
      ${'=='}                 | ${['banana', 'peanut']}          | ${1}
      ${'!='}                 | ${['banana', 'peanut']}          | ${4}
      ${'array-contains'}     | ${'banana'}                      | ${2}
      ${'array-contains'}     | ${'leaf'}                        | ${2}
      ${'array-contains'}     | ${'bread'}                       | ${1}
      ${'array-contains-any'} | ${['banana', 'mango', 'peanut']} | ${2}
    `(
      // eslint-disable-next-line quotes
      "it performs '$comp' queries on array values ($count doc(s) where food $comp '$value')",
      async ({ comp, value, count }) => {
        const results = await db
          .collection('animals')
          .where('food', comp, value)
          .get();
        expect(results.size).toBe(count);
      },
    );

    test.each`
      comp                    | value           | count
      ${'=='}                 | ${[500, 20]}    | ${1}
      ${'=='}                 | ${[20, 500]}    | ${0}
      ${'=='}                 | ${[0, 500]}     | ${1}
      ${'!='}                 | ${[20, 500]}    | ${4}
      ${'array-contains'}     | ${500}          | ${2}
      ${'array-contains'}     | ${80}           | ${2}
      ${'array-contains'}     | ${12}           | ${1}
      ${'array-contains'}     | ${0}            | ${1}
      ${'array-contains-any'} | ${[0, 11, 500]} | ${2}
    `(
      // eslint-disable-next-line quotes
      "it performs '$comp' queries on array values that may be zero ($count doc(s) where foodEaten $comp '$value')",
      async ({ comp, value, count }) => {
        const results = await db
          .collection('animals')
          .where('foodEaten', comp, value)
          .get();
        expect(results.size).toBe(count);
      },
    );
  });

  test('it limits response to 1 document', async () => {
    const animals = db.collection('animals');
    const q = animals.limit(1);
    const animalsSnaps = await q.get();
    expect(animalsSnaps.size).toBe(1);
  });

  test('it limits response to 3 document', async () => {
    const animals = db.collection('animals');
    const q = animals.limit(3);
    const animalsSnaps = await q.get();
    expect(animalsSnaps.size).toBe(3);
  });

  test('it should throw when limit is not a number', async () => {
    const animals = db.collection('animals');
    expect(() => animals.limit('3')).toThrow(TypeError);
  });

  test('it orders animals by name', async () => {
    const animals = db.collection('animals');
    const q = animals.orderBy('name');
    const animalSnaps = await q.get();
    const animalIds = animalSnaps.docs.map(doc => doc.id);
    expect(animalIds).toMatchObject([
      'ant',
      'chicken',
      'cow',
      'elephant',
      'monkey',
      'pogo-stick',
      'worm',
    ]);
  });

  test('it orders animals by name descending', async () => {
    const animals = db.collection('animals');
    const q = animals.orderBy('name', 'desc');
    const animalSnaps = await q.get();
    const animalIds = animalSnaps.docs.map(doc => doc.id);
    expect(animalIds).toMatchObject([
      'worm',
      'pogo-stick',
      'monkey',
      'elephant',
      'cow',
      'chicken',
      'ant',
    ]);
  });

  test('it orders by nested fields', async () => {
    const animals = db.collection('animals');
    const q = animals.orderBy('appearance.color');
    const animalSnaps = await q.get();
    const animalIds = animalSnaps.docs.map(doc => doc.id);
    expect(animalIds).toMatchObject(['cow']);
  });

  test('it should throw when using invalid direction', async () => {
    const animals = db.collection('animals');
    expect(() => animals.orderBy('name', 'invalidDirection')).toThrow();
  });

  test('it orders animals by legCount', async () => {
    const animals = db.collection('animals');
    const q = animals.orderBy('legCount');
    const animalSnaps = await q.get();
    const animalIds = animalSnaps.docs.map(doc => doc.id);
    expect(animalIds).toMatchObject(['monkey', 'chicken', 'elephant', 'ant']);
  });

  test('it returns ordered animals, with more than 2 legs', async () => {
    const animals = db.collection('animals');
    const q = animals.orderBy('legCount').startAfter(2);
    const animalSnaps = await q.get();
    const animalIds = animalSnaps.docs.map(doc => doc.id);
    expect(animalIds).toMatchObject(['elephant', 'ant']);
  });

  test('it returns animals ordered by legCount, after elephant', async () => {
    const elephant = db.doc('animals/elephant');
    const elephantSnap = await elephant.get();

    const animals = db.collection('animals');
    const q = animals.orderBy('legCount').startAfter(elephantSnap);
    const animalSnaps = await q.get();
    const animalIds = animalSnaps.docs.map(doc => doc.id);
    expect(animalIds).toMatchObject(['ant']);
  });

  test('it returns ordered animals, with 4 or more legs', async () => {
    const animals = db.collection('animals');
    const q = animals.orderBy('legCount').startAt(4);
    const animalSnaps = await q.get();
    const animalIds = animalSnaps.docs.map(doc => doc.id);
    expect(animalIds).toMatchObject(['elephant', 'ant']);
  });

  test('it returns animals ordered by legCount, starting at elephant', async () => {
    const elephant = db.doc('animals/elephant');
    const elephantSnap = await elephant.get();

    const animals = db.collection('animals');
    const q = animals.orderBy('legCount').startAt(elephantSnap);
    const animalSnaps = await q.get();
    const animalIds = animalSnaps.docs.map(doc => doc.id);
    expect(animalIds).toMatchObject(['elephant', 'ant']);
  });

  test('it returns animals ordered by legCount, starting at chicken', async () => {
    const chicken = db.doc('animals/chicken');
    const chickenSnap = await chicken.get();

    const animals = db.collection('animals');
    const q = animals.orderBy('legCount').startAt(chickenSnap);
    const animalSnaps = await q.get();
    const animalIds = animalSnaps.docs.map(doc => doc.id);
    expect(animalIds).toMatchObject(['chicken', 'elephant', 'ant']);
  });

  test('it returns animals ordered by name, starting after cow', async () => {
    const cow = db.doc('animals/cow');
    const cowSnap = await cow.get();

    const animals = db.collection('animals');
    const q = animals.orderBy('name').startAfter(cowSnap);
    const animalSnaps = await q.get();
    const animalIds = animalSnaps.docs.map(doc => doc.id);
    expect(animalIds).toMatchObject(['elephant', 'monkey', 'pogo-stick', 'worm']);
  });

  test('it returns no documents when snapshot given to startAt does not exist', async () => {
    const invalid = db.doc('animals/invalid');
    const invalidSnap = await invalid.get();
    expect(invalidSnap.exists).toBe(false);

    const animals = db.collection('animals');
    const q = animals.orderBy('name').startAt(invalidSnap);
    const animalSnaps = await q.get();
    const animalIds = animalSnaps.docs.map(doc => doc.id);
    expect(animalIds).toMatchObject([]);
  });

  test('it returns no documents when snapshot given is the last document', async () => {
    const worm = db.doc('animals/worm');
    const wormSnap = await worm.get();
    expect(wormSnap.exists).toBe(true);

    const animals = db.collection('animals');
    const q = animals.orderBy('name').startAfter(wormSnap);
    const animalSnaps = await q.get();
    const animalIds = animalSnaps.docs.map(doc => doc.id);
    expect(animalIds).toMatchObject([]);
  });
});
