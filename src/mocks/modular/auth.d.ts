import { Mock } from 'jest-mock';

type JestMock = Mock;

interface MockOverrides {
  currentUser?: Record<string, unknown>;
}

export function mockModularAuth(overrides?: MockOverrides): void;

export const mockGetAuth: JestMock;
export const mockModularCreateUserWithEmailAndPassword: JestMock;
export const mockModularSignInWithEmailAndPassword: JestMock;
export const mockModularSignOut: JestMock;
export const mockModularSendPasswordResetEmail: JestMock;
export const mockModularSendEmailVerification: JestMock;
export const mockOnAuthStateChanged: JestMock;
export const mockConnectAuthEmulator: JestMock;
export const mockModularDeleteUser: JestMock;
export const mockModularUpdateProfile: JestMock;
export const mockModularUpdateEmail: JestMock;
export const mockModularUpdatePassword: JestMock;
