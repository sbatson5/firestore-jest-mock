const mockInitializeApp = jest.fn();
const mockCert = jest.fn();

const defaultOptions = require('./helpers/defaultMockOptions');

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
  try {
    require.resolve(moduleName);
    jest.doMock(moduleName, () => firebaseStub(overrides, options));
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = {
  firebaseStub,
  mockFirebase,
  mockInitializeApp,
  mockCert,
};
