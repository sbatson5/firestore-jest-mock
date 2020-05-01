import { User } from 'firebase';

const mockCreateUserWithEmailAndPassword = jest.fn();
const mockDeleteUser = jest.fn();
const mockSendVerificationEmail = jest.fn();
const mockSignInWithEmailAndPassword = jest.fn();
const mockSendPasswordResetEmail = jest.fn();
const mockVerifyIdToken = jest.fn();

class FakeAuth {
  private currentUserRecord: User;

  constructor(currentUser: User) {
    currentUser.sendEmailVerification = mockSendVerificationEmail;
    this.currentUserRecord = currentUser;
  }

  createUserWithEmailAndPassword(...args) {
    mockCreateUserWithEmailAndPassword(...args);
    return Promise.resolve({ user: this.currentUserRecord });
  }

  deleteUser(...args) {
    mockDeleteUser(...args);
    return Promise.resolve('👍');
  }

  signInWithEmailAndPassword(...args) {
    mockSignInWithEmailAndPassword(...args);
    return Promise.resolve({ user: this.currentUserRecord });
  }

  sendPasswordResetEmail(...args) {
    mockSendPasswordResetEmail(...args);
  }

  verifyIdToken(...args) {
    mockVerifyIdToken(...args);
    return Promise.resolve(this.currentUserRecord);
  }

  get currentUser() {
    const { uid, ...data } = this.currentUserRecord;
    return { uid, data };
  }
}

export {
  FakeAuth,
  mockCreateUserWithEmailAndPassword,
  mockDeleteUser,
  mockSendPasswordResetEmail,
  mockSendVerificationEmail,
  mockSignInWithEmailAndPassword,
  mockVerifyIdToken,
};
