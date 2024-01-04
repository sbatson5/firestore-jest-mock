import type { StubOverrides, StubOptions } from './firebase';
import type { FakeFirestore } from './firestore';

declare class Firestore extends FakeFirestore {
  constructor();
}

interface GCloudFirestoreMock {
  Firestore: typeof Firestore;
  Query: typeof Firestore.Query;
  CollectionReference: typeof Firestore.CollectionReference;
  DocumentReference: typeof Firestore.DocumentReference;
  FieldValue: typeof Firestore.FieldValue;
  FieldPath: typeof Firestore.FieldPath;
  Timestamp: typeof Firestore.Timestamp;
  Transaction: typeof Firestore.Transaction;
}

export const firestoreStub: (overrides: StubOverrides, options?: StubOptions) => GCloudFirestoreMock;
export const mockReactNativeFirestore: (overrides: StubOverrides, options?: StubOptions) => void;
