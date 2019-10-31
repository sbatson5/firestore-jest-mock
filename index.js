const { FakeFirestore } = require('./mocks/firestore');
const { FakeAuth } = require('./mocks/auth');
const { mockFirebase } = require('./mocks/firebase');

module.exports = {
  mockFirebase,
  FakeFirestore,
  FakeAuth
};