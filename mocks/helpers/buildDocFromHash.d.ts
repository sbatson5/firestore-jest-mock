import type { FakeFirestore, FakeFirestoreDatabase } from '../firestore';

export type DocumentData = { [field: string]: unknown };

export interface DocumentHash extends DocumentData {
  id?: string;
  _collections: FakeFirestoreDatabase;
  _createTime?: typeof FakeFirestore.Timestamp;
  _readTime?: typeof FakeFirestore.Timestamp;
  _ref: typeof FakeFirestore.DocumentReference;
  _updateTime?: typeof FakeFirestore.Timestamp;
}

export interface MockedDocument<T = DocumentData> {
  createTime: typeof FakeFirestore.Timestamp;
  exists: boolean;
  id: string;
  readTime: typeof FakeFirestore.Timestamp;
  ref: typeof FakeFirestore.DocumentReference;
  metadata: {
    hasPendingWrites: 'Server';
  };
  updateTime: typeof FakeFirestore.Timestamp;
  data(): T | undefined;
  get(fieldPath: string): unknown;
}

export default function buildDocFromHash(hash?: DocumentHash, id?: string): MockedDocument;
