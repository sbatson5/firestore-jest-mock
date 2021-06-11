import type { FirebaseUser, FakeAuth } from './auth';
import type { FakeFirestore } from './firestore';

export interface DatabaseDocument {
  id: string;
  _collections?: DatabaseCollections;
  [key: string]: unknown;
}

export interface DatabaseCollections {
  [collectionName: string]: Array<DatabaseDocument> | undefined;
}

export type FakeFirestoreDocumentData = Record<string, unknown>;

export interface StubOverrides {
  database?: DatabaseCollections;
  currentUser?: FirebaseUser;
}

type DefaultOptions = typeof import('./helpers/defaultMockOptions');
export interface StubOptions extends Partial<DefaultOptions> {}

export interface FirebaseMock {
  initializeApp: jest.Mock;
  credential: {
    cert: jest.Mock;
  };
  auth(): FakeAuth;
  firestore(): FakeFirestore;
}

export const firebaseStub: (overrides?: StubOverrides, options?: StubOptions) => FirebaseMock;
export const mockFirebase: (overrides?: StubOverrides, options?: StubOptions) => void;
export const mockInitializeApp: jest.Mock;
export const mockCert: jest.Mock;
