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

    firestore: class extends FakeFirestore {
      constructor() {
        super(overrides.database);
      }
    },
  };
};

const mockFirebase = (overrides = {}) => {
  jest.mock('firebase', () => firebaseStub(overrides)) &&
    jest.mock('firebase-admin', () => firebaseStub(overrides));
};

module.exports = {
  firebaseStub,
  mockFirebase,
  mockInitializeApp,
  mockCert,
};
