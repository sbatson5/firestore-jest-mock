const { mockCollection, mockGet, mockWhere, mockOffset } = require('../mocks/firestore');
const { mockFirebase } = require('firestore-jest-mock');

describe('test', () => {
  mockFirebase({
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
        },
        {
          id: 'elephant',
          name: 'elephant',
          type: 'mammal',
          legCount: 4,
          food: ['banana', 'peanut'],
          foodCount: 0,
          foodEaten: [0, 500],
        },
        {
          id: 'chicken',
          name: 'chicken',
          type: 'bird',
          legCount: 2,
          food: ['leaf', 'nut', 'ant'],
          foodCount: 4,
          foodEaten: [80, 20, 16],
        },
        {
          id: 'ant',
          name: 'ant',
          type: 'insect',
          legCount: 6,
          food: ['leaf', 'bread'],
          foodCount: 2,
          foodEaten: [80, 12],
        },
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

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('it can filter firestore queries', async () => {
    const animals = await db
      .collection('animals')
      .where('type', '==', 'mammal')
      .get();

    expect(animals).toHaveProperty('docs', expect.any(Array));
    expect(mockCollection).toHaveBeenCalledWith('animals');
    expect(mockWhere).toHaveBeenCalledWith('type', '==', 'mammal');
    expect(mockGet).toHaveBeenCalled();
    expect(animals).toHaveProperty('size', 2); // Returns 2/4 documents
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

  /* eslint-disable indent */
  test.each`
    comp    | value     | count
    ${'=='} | ${2}      | ${2}
    ${'=='} | ${4}      | ${1}
    ${'=='} | ${6}      | ${1}
    ${'=='} | ${7}      | ${0}
    ${'>'}  | ${1}      | ${4}
    ${'>'}  | ${6}      | ${0}
    ${'>='} | ${6}      | ${1}
    ${'>='} | ${0}      | ${4}
    ${'<'}  | ${2}      | ${0}
    ${'<'}  | ${6}      | ${3}
    ${'<='} | ${2}      | ${2}
    ${'<='} | ${6}      | ${4}
    ${'in'} | ${[6, 2]} | ${3}
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
    comp    | value     | count
    ${'=='} | ${0}      | ${1}
    ${'=='} | ${1}      | ${1}
    ${'=='} | ${2}      | ${1}
    ${'=='} | ${4}      | ${1}
    ${'=='} | ${6}      | ${0}
    ${'>'}  | ${-1}     | ${4}
    ${'>'}  | ${0}      | ${3}
    ${'>'}  | ${1}      | ${2}
    ${'>'}  | ${4}      | ${0}
    ${'>='} | ${6}      | ${0}
    ${'>='} | ${4}      | ${1}
    ${'>='} | ${0}      | ${4}
    ${'<'}  | ${2}      | ${2}
    ${'<'}  | ${6}      | ${4}
    ${'<='} | ${2}      | ${3}
    ${'<='} | ${6}      | ${4}
    ${'in'} | ${[2, 0]} | ${2}
  `(
    // eslint-disable-next-line quotes
    "it performs '$comp' queries on possibly-zero number values ($count doc(s) where foodCount $comp $value)",
    async ({ comp, value, count }) => {
      const results = await db
        .collection('animals')
        .where('foodCount', comp, value)
        .get();
      expect(results.size).toBe(count);
    },
  );

  test.each`
    comp    | value                      | count
    ${'=='} | ${'mammal'}                | ${2}
    ${'=='} | ${'bird'}                  | ${1}
    ${'=='} | ${'fish'}                  | ${0}
    ${'>'}  | ${'insect'}                | ${2}
    ${'>'}  | ${'z'}                     | ${0}
    ${'>='} | ${'mammal'}                | ${2}
    ${'>='} | ${'insect'}                | ${3}
    ${'<'}  | ${'bird'}                  | ${0}
    ${'<'}  | ${'mammal'}                | ${2}
    ${'<='} | ${'mammal'}                | ${4}
    ${'<='} | ${'bird'}                  | ${1}
    ${'<='} | ${'a'}                     | ${0}
    ${'in'} | ${['a', 'bird', 'mammal']} | ${3}
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
    ${'array-contains'}     | ${500}          | ${2}
    ${'array-contains'}     | ${80}           | ${2}
    ${'array-contains'}     | ${12}           | ${1}
    ${'array-contains'}     | ${0}            | ${1}
    ${'array-contains-any'} | ${[0, 11, 500]} | ${2}
  `(
    // eslint-disable-next-line quotes
    "it performs '$comp' queries on possibly-zero array values ($count doc(s) where foodEaten $comp '$value')",
    async ({ comp, value, count }) => {
      const results = await db
        .collection('animals')
        .where('foodEaten', comp, value)
        .get();
      expect(results.size).toBe(count);
    },
  );
  /* eslint-enable indent */
});
