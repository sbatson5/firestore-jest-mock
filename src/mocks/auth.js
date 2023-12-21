const mockCreateUserWithEmailAndPassword = jest.fn();
const mockDeleteUser = jest.fn();
const mockSendVerificationEmail = jest.fn();
const mockSignInWithEmailAndPassword = jest.fn();
const mockSendPasswordResetEmail = jest.fn();
const mockVerifyIdToken = jest.fn();
const mockGetUser = jest.fn();
const mockCreateCustomToken = jest.fn();
const mockSetCustomUserClaims = jest.fn();
const mockSignOut = jest.fn();
const mockUseEmulator = jest.fn();

class FakeAuth {
  constructor(currentUser = {}) {
    currentUser.sendEmailVerification = mockSendVerificationEmail;
    this.currentUserRecord = currentUser;
  }

  createUserWithEmailAndPassword() {
    mockCreateUserWithEmailAndPassword(...arguments);
    return Promise.resolve({ user: this.currentUserRecord });
  }

  deleteUser() {
    mockDeleteUser(...arguments);
    return Promise.resolve('👍');
  }

  signInWithEmailAndPassword() {
    mockSignInWithEmailAndPassword(...arguments);
    return Promise.resolve({ user: this.currentUserRecord });
  }

  signOut() {
    mockSignOut();
    return Promise.resolve('👍');
  }

  sendPasswordResetEmail() {
    mockSendPasswordResetEmail(...arguments);
  }

  verifyIdToken() {
    return Promise.resolve(mockVerifyIdToken(...arguments) || this.currentUserRecord);
  }

  getUser() {
    return Promise.resolve(mockGetUser(...arguments) || {});
  }

  createCustomToken() {
    return Promise.resolve(mockCreateCustomToken(...arguments) || '');
  }

  setCustomUserClaims() {
    return Promise.resolve(mockSetCustomUserClaims(...arguments) || {});
  }

  useEmulator() {
    mockUseEmulator(...arguments);
  }

  get currentUser() {
    const { uid, ...data } = this.currentUserRecord;
    return { uid, data };
  }
}

module.exports = {
  FakeAuth,
  mockCreateUserWithEmailAndPassword,
  mockDeleteUser,
  mockSendPasswordResetEmail,
  mockSendVerificationEmail,
  mockSignInWithEmailAndPassword,
  mockSignOut,
  mockVerifyIdToken,
  mockGetUser,
  mockCreateCustomToken,
  mockSetCustomUserClaims,
  mockUseEmulator,
};
