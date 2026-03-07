/**
 * Modular API mock for `firebase/auth`.
 *
 * Usage:
 *   const { mockModularAuth } = require('firestore-jest-mock/mocks/modular/auth');
 *   mockModularAuth({ currentUser: { uid: '123', email: 'test@test.com' } });
 *   const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
 */

const { FakeAuth } = require('../auth');

const mockGetAuth = jest.fn();
const mockModularCreateUserWithEmailAndPassword = jest.fn();
const mockModularSignInWithEmailAndPassword = jest.fn();
const mockModularSignOut = jest.fn();
const mockModularSendPasswordResetEmail = jest.fn();
const mockModularSendEmailVerification = jest.fn();
const mockOnAuthStateChanged = jest.fn();
const mockConnectAuthEmulator = jest.fn();
const mockModularDeleteUser = jest.fn();
const mockModularUpdateProfile = jest.fn();
const mockModularUpdateEmail = jest.fn();
const mockModularUpdatePassword = jest.fn();

function buildModularAuthStub(overrides) {
  let authInstance = null;

  function getOrCreateInstance() {
    if (!authInstance) {
      authInstance = new FakeAuth(overrides.currentUser);
    }
    return authInstance;
  }

  function getAuth() {
    mockGetAuth(...arguments);
    return getOrCreateInstance();
  }

  function createUserWithEmailAndPassword(auth, email, password) {
    mockModularCreateUserWithEmailAndPassword(auth, email, password);
    return auth.createUserWithEmailAndPassword(email, password);
  }

  function signInWithEmailAndPassword(auth, email, password) {
    mockModularSignInWithEmailAndPassword(auth, email, password);
    return auth.signInWithEmailAndPassword(email, password);
  }

  function signOut(auth) {
    mockModularSignOut(auth);
    return auth.signOut();
  }

  function sendPasswordResetEmail(auth, email) {
    mockModularSendPasswordResetEmail(auth, email);
    return Promise.resolve(auth.sendPasswordResetEmail(email));
  }

  function sendEmailVerification(user) {
    mockModularSendEmailVerification(user);
    if (user && user.sendEmailVerification) {
      return Promise.resolve(user.sendEmailVerification());
    }
    return Promise.resolve();
  }

  function onAuthStateChanged(auth, callback) {
    mockOnAuthStateChanged(auth, callback);
    if (typeof callback === 'function') {
      callback(auth.currentUser);
    }
    return () => {};
  }

  function connectAuthEmulator(auth, url) {
    mockConnectAuthEmulator(auth, url);
  }

  function deleteUser(user) {
    mockModularDeleteUser(user);
    return Promise.resolve();
  }

  function updateProfile(user, profile) {
    mockModularUpdateProfile(user, profile);
    return Promise.resolve();
  }

  function updateEmail(user, email) {
    mockModularUpdateEmail(user, email);
    return Promise.resolve();
  }

  function updatePassword(user, password) {
    mockModularUpdatePassword(user, password);
    return Promise.resolve();
  }

  return {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    onAuthStateChanged,
    connectAuthEmulator,
    deleteUser,
    updateProfile,
    updateEmail,
    updatePassword,
  };
}

const mockModularAuth = (overrides = {}) => {
  const stub = buildModularAuthStub(overrides);

  try {
    require.resolve('firebase/auth');
    jest.doMock('firebase/auth', () => stub);
  } catch (e) {
    // Module not installed, skip
  }
};

module.exports = {
  mockModularAuth,
  buildModularAuthStub,

  mockGetAuth,
  mockModularCreateUserWithEmailAndPassword,
  mockModularSignInWithEmailAndPassword,
  mockModularSignOut,
  mockModularSendPasswordResetEmail,
  mockModularSendEmailVerification,
  mockOnAuthStateChanged,
  mockConnectAuthEmulator,
  mockModularDeleteUser,
  mockModularUpdateProfile,
  mockModularUpdateEmail,
  mockModularUpdatePassword,
};
