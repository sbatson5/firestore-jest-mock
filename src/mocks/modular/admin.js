/**
 * Modular API mock for firebase-admin v10+ entry points:
 *   - firebase-admin/app
 *   - firebase-admin/firestore
 *   - firebase-admin/auth
 *
 * Usage:
 *   const { mockModularAdmin } = require('firestore-jest-mock/mocks/modular/admin');
 *   mockModularAdmin({ database: { users: [...] }, currentUser: { uid: '...' } });
 *   const { initializeApp } = require('firebase-admin/app');
 *   const { getFirestore } = require('firebase-admin/firestore');
 *   const { getAuth } = require('firebase-admin/auth');
 */

const defaultOptions = require('../helpers/defaultMockOptions').default;

const mockAdminInitializeApp = jest.fn();
const mockAdminGetApp = jest.fn();
const mockAdminCert = jest.fn();
const mockAdminGetFirestore = jest.fn();
const mockAdminGetAuth = jest.fn();

function mockModularAdmin(overrides = {}, options = defaultOptions) {
  const { FakeFirestore, FakeAuth } = require('firestore-jest-mock');

  let firestoreInstance = null;
  let authInstance = null;

  function getOrCreateFirestore() {
    if (!firestoreInstance) {
      firestoreInstance = new FakeFirestore(overrides.database, options);
    }
    return firestoreInstance;
  }

  function getOrCreateAuth() {
    if (!authInstance) {
      authInstance = new FakeAuth(overrides.currentUser);
    }
    return authInstance;
  }

  const mockOpts = { virtual: true };

  // Mock firebase-admin/app
  jest.doMock('firebase-admin/app', () => ({
    initializeApp(...args) {
      mockAdminInitializeApp(...args);
      return {};
    },
    getApp(...args) {
      mockAdminGetApp(...args);
      return {};
    },
    cert(...args) {
      mockAdminCert(...args);
      return {};
    },
  }), mockOpts);

  // Mock firebase-admin/firestore
  jest.doMock('firebase-admin/firestore', () => {
    function getFirestore() {
      mockAdminGetFirestore(...arguments);
      return getOrCreateFirestore();
    }

    return {
      getFirestore,
      Timestamp: FakeFirestore.Timestamp,
      FieldValue: FakeFirestore.FieldValue,
      FieldPath: FakeFirestore.FieldPath,
    };
  }, mockOpts);

  // Mock firebase-admin/auth
  jest.doMock('firebase-admin/auth', () => {
    function getAuth() {
      mockAdminGetAuth(...arguments);
      return getOrCreateAuth();
    }

    return { getAuth };
  }, mockOpts);
}

module.exports = {
  mockModularAdmin,

  mockAdminInitializeApp,
  mockAdminGetApp,
  mockAdminCert,
  mockAdminGetFirestore,
  mockAdminGetAuth,
};
