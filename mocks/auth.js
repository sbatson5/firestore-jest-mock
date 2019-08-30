const mockCreateUserWithEmailAndPassword = jest.fn();
const mockDeleteUser = jest.fn();
const mockSendVerificationEmail = jest.fn();
const mockSignInWithEmailAndPassword = jest.fn();
const mockSendPasswordResetEmail = jest.fn();
const mockVerifyIdToken = jest.fn();

class FakeAuth {
  constructor(currentUser) {
    currentUser.sendEmailVerification = mockSendVerificationEmail;
    this.currentUserRecord = currentUser;
  }

  createUserWithEmailAndPassword() {
    mockCreateUserWithEmailAndPassword(...arguments);
    return { user: this.currentUserRecord };
  }

  deleteUser() {
    mockDeleteUser(...arguments);
    return Promise.resolve('👍');
  }

  signInWithEmailAndPassword() {
    mockSignInWithEmailAndPassword(...arguments);
    return { user: this.currentUserRecord };
  }

  sendPasswordResetEmail() {
    mockSendPasswordResetEmail(...arguments);
  }

  verifyIdToken() {
    mockVerifyIdToken(...arguments);
    return this.currentUserRecord;
  }

  get currentUser() {
    return {
      uid: this.currentUserRecord.uid,
      data: this.currentUserRecord,
    };
  }
};

module.exports = {
  FakeAuth,
  mockCreateUserWithEmailAndPassword,
  mockDeleteUser,
  mockSendPasswordResetEmail,
  mockSendVerificationEmail,
  mockSignInWithEmailAndPassword,
  mockVerifyIdToken,
};