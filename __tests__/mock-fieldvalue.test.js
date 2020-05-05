const { FakeFirestore } = require('firestore-jest-mock');
const {
  mockArrayRemoveFieldValue,
  mockArrayUnionFieldValue,
  mockDeleteFieldValue,
  mockIncrementFieldValue,
  mockServerTimestampFieldValue,
} = require('firestore-jest-mock/mocks/firestore');

describe('Single records modified with field sentinels', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  const firestore = FakeFirestore;

  test('it can be distinguished from other field values', () => {
    const incrementBy1 = firestore.FieldValue.increment();
    const unionNothing = firestore.FieldValue.arrayUnion();

    expect(incrementBy1.isEqual(incrementBy1)).toBe(true);
    expect(unionNothing.isEqual(unionNothing)).toBe(true);
    expect(incrementBy1.isEqual(unionNothing)).toBe(false);

    expect(mockIncrementFieldValue).toHaveBeenCalled();
  });

  test('it increments number values', () => {
    const increment = firestore.FieldValue.increment;
    const value = 5;

    expect(increment().updateValue(value)).toBe(6);
    expect(increment(1).updateValue(value)).toBe(6);

    expect(increment(0).updateValue(value)).toBe(value);

    expect(increment(-1).updateValue(value)).toBe(4);
    expect(increment(-8).updateValue(value)).toBe(-3);

    expect(mockIncrementFieldValue).toHaveBeenCalled();
  });

  test('it does not increment non-number values', () => {
    const increment = firestore.FieldValue.increment;

    expect(increment().updateValue('5')).toBe(1);
    expect(increment().updateValue()).toBe(1);

    expect(increment(8).updateValue({})).toBe(8);

    expect(mockIncrementFieldValue).toHaveBeenCalled();
  });

  test('it adds to arrays, but only elements not already present', () => {
    const arrayUnion = firestore.FieldValue.arrayUnion;
    const value = [1, 2, 3];

    expect(arrayUnion([4, 5, 6]).updateValue(value)).toStrictEqual([1, 2, 3, 4, 5, 6]);
    expect(arrayUnion([3, 4, 5]).updateValue(value)).toStrictEqual([1, 2, 3, 4, 5]);

    expect(arrayUnion([4]).updateValue(value)).toStrictEqual([1, 2, 3, 4]);
    expect(arrayUnion(4).updateValue(value)).toStrictEqual([1, 2, 3, 4]);
    expect(arrayUnion([3]).updateValue(value)).toStrictEqual(value);
    expect(arrayUnion(3).updateValue(value)).toStrictEqual(value);
    expect(arrayUnion('3').updateValue(value)).toStrictEqual([1, 2, 3, '3']);

    expect(arrayUnion(value).updateValue(value)).toStrictEqual(value);
    expect(arrayUnion([]).updateValue(value)).toStrictEqual(value);
    expect(arrayUnion().updateValue(value)).toStrictEqual(value);

    const num = 3;
    expect(arrayUnion([3]).updateValue(num)).toStrictEqual([3]);
    expect(arrayUnion([3]).updateValue(undefined)).toStrictEqual([3]);

    // A string should not be treated like a character array
    const str = '3';
    expect(arrayUnion([3]).updateValue(str)).toStrictEqual([3]);

    expect(mockArrayUnionFieldValue).toHaveBeenCalled();
  });

  test('it removes values from arrays', () => {
    const arrayRemove = firestore.FieldValue.arrayRemove;
    const value = [1, 2, 3];

    expect(arrayRemove([4, 5, 6]).updateValue(value)).toStrictEqual(value);
    expect(arrayRemove([3, 4, 5]).updateValue(value)).toStrictEqual([1, 2]);
    expect(arrayRemove('3').updateValue(value)).toStrictEqual(value);

    expect(arrayRemove(value).updateValue(value)).toStrictEqual([]);
    expect(arrayRemove([]).updateValue(value)).toStrictEqual(value);
    expect(arrayRemove().updateValue(value)).toStrictEqual(value);

    const num = 3;
    expect(arrayRemove([3]).updateValue(num)).toStrictEqual(num);
    expect(arrayRemove([3]).updateValue(undefined)).toBeUndefined();

    // A string should not be treated like a character array
    const str = '3';
    expect(arrayRemove([3]).updateValue(str)).toStrictEqual(str);

    expect(mockArrayRemoveFieldValue).toHaveBeenCalled();
  });

  test('it returns a Timestamp object', () => {
    const timestamp = firestore.FieldValue.serverTimestamp().updateValue();
    expect(mockServerTimestampFieldValue).toHaveBeenCalled();
    expect(timestamp).toHaveProperty('seconds');
    expect(timestamp).toHaveProperty('nanoseconds');
  });

  test('it deletes values', () => {
    const deleteValue = firestore.FieldValue.delete;
    const object = {
      some: 'thing',
    };

    expect(deleteValue().updateValue(object.some)).toBeUndefined();
    expect(object.some).toBeDefined();
    object.some = deleteValue().updateValue(object.some);
    expect(object.some).toBeUndefined();

    expect(mockDeleteFieldValue).toHaveBeenCalled();
  });
});
