import { FakeFirestore } from './firestore';
import { FakeAuth } from './auth';

export const mockInitializeApp = jest.fn();
export const mockCert = jest.fn();

import defaultOptions from './helpers/defaultMockOptions';

export const firebaseStub = (overrides, options = defaultOptions) => {

  // Prepare namespaced classes
  function firestoreConstructor() {
    return new FakeFirestore(overrides.database, options);
  }

  firestoreConstructor.Query = FakeFirestore.Query;
  firestoreConstructor.CollectionReference = FakeFirestore.CollectionReference;
  firestoreConstructor.DocumentReference = FakeFirestore.DocumentReference;
  firestoreConstructor.FieldValue = FakeFirestore.FieldValue;
  firestoreConstructor.Timestamp = FakeFirestore.Timestamp;
  firestoreConstructor.Transaction = FakeFirestore.Transaction;
  firestoreConstructor.FieldPath = FakeFirestore.FieldPath;

  //Remove methods which do not exist in Firebase
  delete firestoreConstructor.DocumentReference.prototype.listCollections;

  // The Firebase mock
  return {
    initializeApp: mockInitializeApp,

    credential: {
      cert: mockCert,
    },

    auth() {
      return new FakeAuth(overrides.currentUser);
    },

    firestore: firestoreConstructor,
  };
};

function mockModuleIfFound(moduleName, overrides, options) {
  try {
    require.resolve(moduleName);
    jest.doMock(moduleName, () => firebaseStub(overrides, options));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.info(`Module ${moduleName} not found, mocking skipped.`);
  }
}

export const mockFirebase = (overrides = {}, options = defaultOptions) => {
  mockModuleIfFound('firebase', overrides, options);
  mockModuleIfFound('firebase-admin', overrides, options);
};
