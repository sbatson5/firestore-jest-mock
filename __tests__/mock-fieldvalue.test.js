const { mockFirebase } = require('firestore-jest-mock');
mockFirebase({ database: {} });
const firebase = require('firebase');

const {
  mockArrayRemoveFieldValue,
  mockArrayUnionFieldValue,
  mockDeleteFieldValue,
  mockIncrementFieldValue,
  mockServerTimestampFieldValue,
} = require('../mocks/firestore');

describe('Single values transformed by field sentinels', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('it is distinct from other field value instances', () => {
    const incrementBy1 = firebase.firestore.FieldValue.increment();
    const unionNothing = firebase.firestore.FieldValue.arrayUnion();

    expect(incrementBy1.isEqual(incrementBy1)).toBe(true);
    expect(unionNothing.isEqual(unionNothing)).toBe(true);
    expect(incrementBy1.isEqual(unionNothing)).toBe(false);

    expect(mockIncrementFieldValue).toHaveBeenCalled();
  });

  test('mockArrayRemoveFieldValue is accessible', () => {
    const fieldValue = firebase.firestore.FieldValue.arrayRemove('val');
    expect(fieldValue).toMatchObject({ type: 'arrayRemove', value: ['val'] });
    expect(mockArrayRemoveFieldValue).toHaveBeenCalledTimes(1);
  });

  test('mockArrayUnionFieldValue is accessible', () => {
    const fieldValue = firebase.firestore.FieldValue.arrayUnion('val');
    expect(fieldValue).toMatchObject({ type: 'arrayUnion', value: ['val'] });
    expect(mockArrayUnionFieldValue).toHaveBeenCalledTimes(1);
  });

  test('mockDeleteFieldValue is accessible', () => {
    const fieldValue = firebase.firestore.FieldValue.delete();
    expect(fieldValue).toMatchObject({ type: 'delete', value: undefined });
    expect(mockDeleteFieldValue).toHaveBeenCalledTimes(1);
  });

  test('mockServerTimestampFieldValue is accessible', () => {
    const fieldValue = firebase.firestore.FieldValue.serverTimestamp();
    expect(fieldValue).toMatchObject({ type: 'serverTimestamp', value: undefined });
    expect(mockServerTimestampFieldValue).toHaveBeenCalledTimes(1);
  });
});
