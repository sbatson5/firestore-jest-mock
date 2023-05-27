export const mockCreateUserWithEmailAndPassword = jest.fn();
export const mockDeleteUser = jest.fn();
export const mockSendVerificationEmail = jest.fn();
export const mockSignInWithEmailAndPassword = jest.fn();
export const mockSendPasswordResetEmail = jest.fn();
export const mockVerifyIdToken = jest.fn();
export const mockGetUser = jest.fn();
export const mockCreateCustomToken = jest.fn();
export const mockSetCustomUserClaims = jest.fn();
export const mockSignOut = jest.fn();
export const mockUseEmulator = jest.fn();

export class FakeAuth {
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
