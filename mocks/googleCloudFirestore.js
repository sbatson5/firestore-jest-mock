
const firestoreStub = overrides => {
  const { FakeFirestore } = require('firestore-jest-mock');

  class Firestore extends FakeFirestore {
    constructor() {
      super(overrides.database);
    }
  }
  return {
    Query: FakeFirestore.Query,
    CollectionReference: FakeFirestore.CollectionReference,
    DocumentReference: FakeFirestore.DocumentReference,
    FieldValue: FakeFirestore.FieldValue,
    Timestamp: FakeFirestore.Timestamp,
    Transaction: FakeFirestore.Transaction,
    Firestore,
  };
};

const mockGoogleCloudFirestore = (overrides = {}) => {
  mockModuleIfFound('@google-cloud/firestore', overrides);
};

function mockModuleIfFound(moduleName, overrides) {
  try {
    require.resolve(moduleName);
    jest.doMock(moduleName, () => firestoreStub(overrides));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.info(`Module ${moduleName} not found, mocking skipped.`);
  }
}

module.exports = {
  firestoreStub,
  mockGoogleCloudFirestore,
};
