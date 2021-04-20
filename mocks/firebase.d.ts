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
  currentUser?: unknown; // TODO: User, to be defined later
}

export interface StubOptions {
  includeIdsInData?: boolean;
}

export interface FirebaseMock {
  initializeApp: jest.Mock;
  credential: {
    cert: jest.Mock;
  };
  auth(): unknown; // TODO: Auth, to be defined later
  firestore(): unknown; // TODO: FakeFirestore, to be defined later
}

export const firebaseStub: (overrides?: StubOverrides, options?: StubOptions) => FirebaseMock;
export const mockFirebase: (overrides?: StubOverrides, options?: StubOptions) => void;
export const mockInitializeApp: jest.Mock;
export const mockCert: jest.Mock;
