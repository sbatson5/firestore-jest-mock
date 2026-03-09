const { mockInitializeApp, mockCert } = require('./mockRegistry');
const defaultOptions = require('./helpers/defaultMockOptions').default;

const firebaseStub = (overrides, options = defaultOptions) => {
  const { FakeFirestore, FakeAuth } = require('firestore-jest-mock');

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

const mockFirebase = (overrides = {}, options = defaultOptions) => {
  const moduleFound = 
    mockModuleIfFound('firebase', overrides, options) |
    mockModuleIfFound('firebase-admin', overrides, options);
  
  if (!moduleFound) {
    console.info(`Neither 'firebase' nor 'firebase-admin' modules found, mocking skipped.`);
  }
};

function mockModuleIfFound(moduleName, overrides, options) {
  const factory = () => firebaseStub(overrides, options);
  try {
    require.resolve(moduleName);
    jest.doMock(moduleName, factory);
    return true;
  } catch (e) {
    // Firebase v11+ removed the bare 'firebase' entry point.
    // Use virtual mock so `require('firebase')` still works in tests.
    if (moduleName === 'firebase' || moduleName === 'firebase-admin') {
      jest.doMock(moduleName, factory, { virtual: true });
      return true;
    }
    return false;
  }
}

module.exports = {
  firebaseStub,
  mockFirebase,
  mockInitializeApp,
  mockCert,
};
