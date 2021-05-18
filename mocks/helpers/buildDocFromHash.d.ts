import type { FakeFirestore, FakeFirestoreDatabase } from '../firestore';

type DocumentData = { [field: string]: unknown };

interface DocumentHash extends DocumentData {
  id?: string;
  _collections: FakeFirestoreDatabase;
  _ref: typeof FakeFirestore.DocumentReference;
}

interface MockedDocument<T = DocumentData> {
  exists: boolean;
  id: string;
  ref: typeof FakeFirestore.DocumentReference;
  metadata: {
    hasPendingWrites: 'Server';
  };
  data(): T | undefined;
  get(fieldPath: string): unknown;
}

declare function buildDocFromHash(hash?: DocumentHash, id?: string): MockedDocument;

// Export in the way that Node require() expects
declare module 'buildDocFromHash' {
  export { DocumentData, DocumentHash, MockedDocument };
  export = buildDocFromHash;
}
