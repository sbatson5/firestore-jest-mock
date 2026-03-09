/** Centralized registry of all jest.fn() mocks.
 *  Both the namespaced API surface and the modular API surface import from here
 *  so that assertions work regardless of which API a consumer uses.
 */

// Firestore instance-level mocks
export const mockCollectionGroup = jest.fn();
export const mockBatch = jest.fn();
export const mockRunTransaction = jest.fn();
export const mockRecursiveDelete = jest.fn();
export const mockSettings = jest.fn();
export const mockUseEmulator = jest.fn();
export const mockCollection = jest.fn();
export const mockDoc = jest.fn();
export const mockCreate = jest.fn();
export const mockUpdate = jest.fn();
export const mockSet = jest.fn();
export const mockAdd = jest.fn();
export const mockDelete = jest.fn();
export const mockListDocuments = jest.fn();
export const mockListCollections = jest.fn();
export const mockOnSnapShot = jest.fn();

// Batch mocks
export const mockBatchDelete = jest.fn();
export const mockBatchCommit = jest.fn();
export const mockBatchUpdate = jest.fn();
export const mockBatchSet = jest.fn();
export const mockBatchCreate = jest.fn();

// Query mocks
export const mockGet = jest.fn();
export const mockSelect = jest.fn();
export const mockWhere = jest.fn();
export const mockLimit = jest.fn();
export const mockOrderBy = jest.fn();
export const mockOffset = jest.fn();
export const mockStartAfter = jest.fn();
export const mockStartAt = jest.fn();
export const mockQueryOnSnapshot = jest.fn();
export const mockQueryOnSnapshotUnsubscribe = jest.fn();
export const mockWithConverter = jest.fn();

// Transaction mocks
export const mockGetAll = jest.fn();
export const mockGetAllTransaction = jest.fn();
export const mockGetTransaction = jest.fn();
export const mockSetTransaction = jest.fn();
export const mockUpdateTransaction = jest.fn();
export const mockDeleteTransaction = jest.fn();
export const mockCreateTransaction = jest.fn();

// FieldValue mocks
export const mockArrayUnionFieldValue = jest.fn();
export const mockArrayRemoveFieldValue = jest.fn();
export const mockDeleteFieldValue = jest.fn();
export const mockIncrementFieldValue = jest.fn();
export const mockServerTimestampFieldValue = jest.fn();

// Timestamp mocks
export const mockTimestampToDate = jest.fn();
export const mockTimestampToMillis = jest.fn();
export const mockTimestampFromDate = jest.fn();
export const mockTimestampFromMillis = jest.fn();
export const mockTimestampNow = jest.fn();

// Auth mocks
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
export const mockUseEmulatorAuth = jest.fn();

// Firebase init mocks
export const mockInitializeApp = jest.fn();
export const mockCert = jest.fn();
