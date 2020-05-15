const mockInitializeApp = jest.fn();
const mockCert = jest.fn();

const firebaseStub = overrides => {
  const { FakeFirestore, FakeAuth } = require('firestore-jest-mock');
  return {
    initializeApp: mockInitializeApp,

    credential: {
      cert: mockCert,
    },

    auth() {
      return new FakeAuth(overrides.currentUser);
    },

    firestore() {
      return new FakeFirestore(overrides.database);
    },
  };
};

const mockFirebase = (overrides = {}) => {
  mockModuleIfFound('firebase', overrides);
  mockModuleIfFound('firebase-admin', overrides);
};

function mockModuleIfFound(moduleName, overrides) {
  try {
    require.resolve(moduleName);
    jest.doMock(moduleName, () => firebaseStub(overrides));
  } catch (e) {
    // module ${moduleName} not found, skipping
  }
}

module.exports = {
  firebaseStub,
  mockFirebase,
  mockInitializeApp,
  mockCert,
};
