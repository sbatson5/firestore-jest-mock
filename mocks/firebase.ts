import type { FakeFirestore as Firestore } from './firestore';
import type { FakeAuth as Auth } from './auth';
export const mockInitializeApp = jest.fn();
export const mockCert = jest.fn();

export interface StubOverrides {
  database?: DatabaseCollections;
  currentUser?: User;
}

interface FirebaseMock {
  initializeApp: jest.Mock;
  credential: {
    cert: jest.Mock;
  };
  auth(): Auth;
  firestore(): Firestore;
}

export const firebaseStub = (overrides?: StubOverrides): FirebaseMock => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mockedFirebase = require('firestore-jest-mock') as { FakeFirestore: typeof Firestore; FakeAuth: typeof Auth };
  const FakeFirestore = mockedFirebase.FakeFirestore;
  const FakeAuth = mockedFirebase.FakeAuth;

  // Prepare namespaced class constructor
  interface FirestoreConstructor {
    (): Firestore;
    Query: typeof Firestore.Query;
    CollectionReference: typeof Firestore.CollectionReference;
    DocumentReference: typeof Firestore.DocumentReference;
    FieldValue: typeof Firestore.FieldValue;
    Timestamp: typeof Firestore.Timestamp;
    Transaction: typeof Firestore.Transaction;
  }
  
  const firestoreConstructor: FirestoreConstructor = function firestoreConstructor() {
    return new FakeFirestore(overrides?.database);
  };

  firestoreConstructor.Query = FakeFirestore.Query;
  firestoreConstructor.CollectionReference = FakeFirestore.CollectionReference;
  firestoreConstructor.DocumentReference = FakeFirestore.DocumentReference;
  firestoreConstructor.FieldValue = FakeFirestore.FieldValue;
  firestoreConstructor.Timestamp = FakeFirestore.Timestamp;
  firestoreConstructor.Transaction = FakeFirestore.Transaction;
  

  // The Firebase mock
  return {
    initializeApp: mockInitializeApp,

    credential: {
      cert: mockCert,
    },

    auth(): Auth {
      return new FakeAuth(overrides?.currentUser);
    },

    firestore: firestoreConstructor,
  };
};

export const mockFirebase = (overrides: StubOverrides = {}): void => {
  mockModuleIfFound('firebase', overrides);
  mockModuleIfFound('firebase-admin', overrides);
};

function mockModuleIfFound(moduleName: string, overrides: StubOverrides) {
  try {
    require.resolve(moduleName);
    jest.doMock(moduleName, () => firebaseStub(overrides));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.info(`Module ${moduleName} not found, mocking skipped.`);
  }
}
