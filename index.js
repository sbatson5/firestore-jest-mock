const { FakeFirestore } = require('./mocks/firestore');
const { FakeAuth } = require('./mocks/auth');
const { mockFirebase } = require('./mocks/firebase');
const { mockGoogleCloudFirestore } = require('./mocks/googleCloudFirestore');
const { mockReactNativeFirestore } = require('./mocks/reactNativeFirebaseFirestore');

module.exports = {
  mockGoogleCloudFirestore,
  mockFirebase,
  mockReactNativeFirestore,
  FakeFirestore,
  FakeAuth,
};
