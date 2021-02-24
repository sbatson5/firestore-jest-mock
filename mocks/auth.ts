export const mockApplyActionCode = jest.fn();
export const mockCreateUserWithEmailAndPassword = jest.fn();
export const mockDeleteUser = jest.fn();
export const mockSendVerificationEmail = jest.fn();
export const mockSignInWithEmailAndPassword = jest.fn();
export const mockSendPasswordResetEmail = jest.fn();
export const mockVerifyIdToken = jest.fn();
export const mockGetUser = jest.fn();
export const mockSetCustomUserClaims = jest.fn();

const defaultUser = (): User => ({
  displayName: 'Homer Simpson',
  email: 'simp@example.com',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  multiFactor: {},
  phoneNumber: null,
  photoURL: null,
  providerData: [
    {
      displayName: 'Homer Simpson',
      email: 'simp@example.com',
      phoneNumber: null,
      photoURL: null,
      providerId: 'password',
      uid: 'abc123',
    },
  ],
  providerId: 'password',
  refreshToken: 'abc123Token',
  tenantId: null,
  uid: 'abc123',
  delete() {
    mockDeleteUser(...arguments);
    return Promise.resolve();
  },
  sendEmailVerification: mockSendVerificationEmail,
});

export class FakeAuth {
  currentUserRecord: User | null;

  constructor(currentUser: User | null = defaultUser()) {
    if (currentUser) {
      currentUser.sendEmailVerification = mockSendVerificationEmail;
    }
    this.currentUserRecord = currentUser;
  }

  get currentUser(): User | null {
    return this.currentUserRecord;
  }

  applyActionCode(): Promise<void> {
    mockApplyActionCode(...arguments);
    return Promise.resolve();
  }

  createUserWithEmailAndPassword(): Promise<{ user: User }> {
    const newUser = mockCreateUserWithEmailAndPassword(...arguments) as User | undefined;
    return Promise.resolve({ user: newUser ?? defaultUser() });
  }

  deleteUser(): Promise<void> {
    mockDeleteUser(...arguments);
    return Promise.resolve();
  }

  signInWithEmailAndPassword(): Promise<{ user: User }> {
    const newUser = mockSignInWithEmailAndPassword(...arguments) as User | undefined;
    return Promise.resolve({ user: newUser ?? defaultUser() });
  }

  sendPasswordResetEmail(): Promise<void> {
    mockSendPasswordResetEmail(...arguments);
    return Promise.resolve();
  }

  // Firebase Admin Auth

  verifyIdToken(): Promise<User> {
    mockVerifyIdToken(...arguments);
    return Promise.resolve(this.currentUserRecord ?? defaultUser());
  }

  getUser(): Promise<AdminUserRecord> {
    // Construct a full AdminUserRecord from the stored UserRecord
    const userRecord = this.currentUserRecord;
    const record = (mockGetUser(...arguments) as AdminUserRecord | undefined) ?? {
      disabled: false,
      displayName: userRecord?.displayName ?? undefined,
      phoneNumber: userRecord?.phoneNumber ?? undefined,
      photoURL: userRecord?.photoURL ?? undefined,
      email: userRecord?.email ?? undefined,
      emailVerified: userRecord?.emailVerified ?? false,
      metadata: {
        ...userRecord?.metadata,
        creationTime: userRecord?.metadata.creationTime ?? '',
        lastSignInTime: userRecord?.metadata.lastSignInTime ?? '',
      },
      providerData: userRecord?.providerData ?? [],
      uid: userRecord?.uid ?? '',
    };
    return Promise.resolve(record);
  }

  setCustomUserClaims(): Promise<void> {
    mockSetCustomUserClaims(...arguments);
    return Promise.resolve();
  }
}
