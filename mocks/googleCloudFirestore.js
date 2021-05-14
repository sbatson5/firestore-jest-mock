const defaultOptions = require('./helpers/defaultMockOptions');

const firestoreStub = (overrides, options = defaultOptions) => {
  const { FakeFirestore } = require('firestore-jest-mock');

  class Firestore extends FakeFirestore {
    constructor() {
      super(overrides.database, options);
    }
  }
  return {
    Query: FakeFirestore.Query,
    CollectionReference: FakeFirestore.CollectionReference,
    DocumentReference: FakeFirestore.DocumentReference,
    FieldValue: FakeFirestore.FieldValue,
    FieldPath: FakeFirestore.FieldPath,
    Timestamp: FakeFirestore.Timestamp,
    Transaction: FakeFirestore.Transaction,
    /** @type {Firestore.constructor} */
    Firestore,
  };
};

const mockGoogleCloudFirestore = (overrides = {}, options = defaultOptions) => {
  mockModuleIfFound('@google-cloud/firestore', overrides, options);
};

function mockModuleIfFound(moduleName, overrides, options) {
  try {
    require.resolve(moduleName);
    jest.doMock(moduleName, () => firestoreStub(overrides, options));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.info(`Module ${moduleName} not found, mocking skipped.`);
  }
}

module.exports = {
  firestoreStub,
  mockGoogleCloudFirestore,
};
