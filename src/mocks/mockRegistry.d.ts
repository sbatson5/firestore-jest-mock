import { Mock } from 'jest-mock';

type JestMock = Mock;

// Firestore
export const mockCollectionGroup: JestMock;
export const mockBatch: JestMock;
export const mockRunTransaction: JestMock;
export const mockRecursiveDelete: JestMock;
export const mockSettings: JestMock;
export const mockUseEmulator: JestMock;
export const mockCollection: JestMock;
export const mockDoc: JestMock;
export const mockCreate: JestMock;
export const mockUpdate: JestMock;
export const mockSet: JestMock;
export const mockAdd: JestMock;
export const mockDelete: JestMock;
export const mockListDocuments: JestMock;
export const mockListCollections: JestMock;
export const mockOnSnapShot: JestMock;

// Batch
export const mockBatchDelete: JestMock;
export const mockBatchCommit: JestMock;
export const mockBatchUpdate: JestMock;
export const mockBatchSet: JestMock;
export const mockBatchCreate: JestMock;

// Query
export const mockGet: JestMock;
export const mockSelect: JestMock;
export const mockWhere: JestMock;
export const mockLimit: JestMock;
export const mockOrderBy: JestMock;
export const mockOffset: JestMock;
export const mockStartAfter: JestMock;
export const mockStartAt: JestMock;
export const mockQueryOnSnapshot: JestMock;
export const mockQueryOnSnapshotUnsubscribe: JestMock;
export const mockWithConverter: JestMock;

// Transaction
export const mockGetAll: JestMock;
export const mockGetAllTransaction: JestMock;
export const mockGetTransaction: JestMock;
export const mockSetTransaction: JestMock;
export const mockUpdateTransaction: JestMock;
export const mockDeleteTransaction: JestMock;
export const mockCreateTransaction: JestMock;

// FieldValue
export const mockArrayUnionFieldValue: JestMock;
export const mockArrayRemoveFieldValue: JestMock;
export const mockDeleteFieldValue: JestMock;
export const mockIncrementFieldValue: JestMock;
export const mockServerTimestampFieldValue: JestMock;

// Timestamp
export const mockTimestampToDate: JestMock;
export const mockTimestampToMillis: JestMock;
export const mockTimestampFromDate: JestMock;
export const mockTimestampFromMillis: JestMock;
export const mockTimestampNow: JestMock;

// Auth
export const mockCreateUserWithEmailAndPassword: JestMock;
export const mockDeleteUser: JestMock;
export const mockSendVerificationEmail: JestMock;
export const mockSignInWithEmailAndPassword: JestMock;
export const mockSendPasswordResetEmail: JestMock;
export const mockVerifyIdToken: JestMock;
export const mockGetUser: JestMock;
export const mockCreateCustomToken: JestMock;
export const mockSetCustomUserClaims: JestMock;
export const mockSignOut: JestMock;
export const mockUseEmulatorAuth: JestMock;

// Firebase init
export const mockInitializeApp: JestMock;
export const mockCert: JestMock;
