const { FakeFirestore } = require('./mocks/firestore');
const { FakeAuth } = require('./mocks/auth');
const { mockFirebase } = require('./mocks/firebase');
const { mockGoogleCloudFirestore } = require('./mocks/googleCloudFirestore');

module.exports = {
  mockGoogleCloudFirestore,
  mockFirebase,
  FakeFirestore,
  FakeAuth,
};
