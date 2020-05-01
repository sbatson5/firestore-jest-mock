import { FakeFirestore } from './firestore';
import { FakeAuth } from './auth';

const mockInitializeApp = jest.fn();
const mockCert = jest.fn();

interface Overrides {
  currentUser?: any;
  database?: any;
}

const firebaseStub = (overrides: Overrides) => ({
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
});

const mockFirebase = (overrides: Overrides = {}) => {
  jest.mock('firebase', () => firebaseStub(overrides)) &&
    jest.mock('firebase-admin', () => firebaseStub(overrides));
};

module.exports = {
  firebaseStub,
  mockFirebase,
  mockInitializeApp,
  mockCert,
};
