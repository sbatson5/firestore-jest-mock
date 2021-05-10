const { mockFirebase } = require('firestore-jest-mock');
mockFirebase({ database: {} });
const firebase = require('firebase');

describe('Single values transformed by field sentinels', () => {
  test('isEqual', () => {
    const path1 = new firebase.firestore.FieldPath('collection', 'doc1');
    const path2 = new firebase.firestore.FieldPath('collection', 'doc2');
    expect(path1.isEqual(path1)).toBe(true);
    expect(path2.isEqual(path2)).toBe(true);
    expect(path1.isEqual(path2)).toBe(false);
  });

  test('documentId', () => {
    const path = firebase.firestore.FieldPath.documentId();
    expect(path === firebase.firestore.FieldPath.documentId()).toBe(true);
  });
});
