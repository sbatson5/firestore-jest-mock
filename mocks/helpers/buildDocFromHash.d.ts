import type { FakeFirestore } from '../firestore';

export type DocumentData = { [field: string]: unknown };

export interface DocumentHash extends DocumentData {
  id?: string;
  _collections: unknown; // TODO: FakeFirestore subcollections, to be defined later
  _ref: typeof FakeFirestore.DocumentReference;
}

export interface MockedDocument<T = DocumentData> {
  exists: boolean;
  id: string;
  ref: typeof FakeFirestore.DocumentReference;
  metadata: {
    hasPendingWrites: 'Server';
  };
  data(): T | undefined;
  get(fieldPath: string): unknown;
}

export default function buildDocFromHash(hash?: DocumentHash, id?: string): MockedDocument;
