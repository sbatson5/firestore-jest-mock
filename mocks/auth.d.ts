export const mockCreateUserWithEmailAndPassword: jest.Mock;
export const mockDeleteUser: jest.Mock;
export const mockSendVerificationEmail: jest.Mock;
export const mockSignInWithEmailAndPassword: jest.Mock;
export const mockSendPasswordResetEmail: jest.Mock;
export const mockVerifyIdToken: jest.Mock;
export const mockGetUser: jest.Mock;
export const mockSetCustomUserClaims: jest.Mock;
export const mockSignOut: jest.Mock;
export const mockUseEmulator: jest.Mock;

export interface FirebaseUser {}

export class FakeAuth {
  currentUser: Readonly<FirebaseUser>;

  constructor(currentUser?: FirebaseUser);

  createUserWithEmailAndPassword(): Promise<{ user: FirebaseUser }>;
  signInWithEmailAndPassword(): Promise<{ user: FirebaseUser }>;
  deleteUser(): Promise<'👍'>;
  signOut(): Promise<'👍'>;
  sendPasswordResetEmail(): void;
  verifyIdToken(): Promise<FirebaseUser>;
  getUser(): Promise<Record<string, never>>;
  setCustomUserClaims(): Promise<Record<string, never>>;
  useEmulator(): void;
}
