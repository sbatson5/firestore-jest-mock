/** Centralized registry of all jest.fn() mocks.
 *  Both the namespaced API surface and the modular API surface import from here
 *  so that assertions work regardless of which API a consumer uses.
 */

// Firestore instance-level mocks
const mockCollectionGroup = jest.fn();
const mockBatch = jest.fn();
const mockRunTransaction = jest.fn();
const mockRecursiveDelete = jest.fn();
const mockSettings = jest.fn();
const mockUseEmulator = jest.fn();
const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockSet = jest.fn();
const mockAdd = jest.fn();
const mockDelete = jest.fn();
const mockListDocuments = jest.fn();
const mockListCollections = jest.fn();
const mockOnSnapShot = jest.fn();

// Batch mocks
const mockBatchDelete = jest.fn();
const mockBatchCommit = jest.fn();
const mockBatchUpdate = jest.fn();
const mockBatchSet = jest.fn();
const mockBatchCreate = jest.fn();

// Query mocks
const mockGet = jest.fn();
const mockSelect = jest.fn();
const mockWhere = jest.fn();
const mockLimit = jest.fn();
const mockOrderBy = jest.fn();
const mockOffset = jest.fn();
const mockStartAfter = jest.fn();
const mockStartAt = jest.fn();
const mockQueryOnSnapshot = jest.fn();
const mockQueryOnSnapshotUnsubscribe = jest.fn();
const mockWithConverter = jest.fn();

// Transaction mocks
const mockGetAll = jest.fn();
const mockGetAllTransaction = jest.fn();
const mockGetTransaction = jest.fn();
const mockSetTransaction = jest.fn();
const mockUpdateTransaction = jest.fn();
const mockDeleteTransaction = jest.fn();
const mockCreateTransaction = jest.fn();

// FieldValue mocks
const mockArrayUnionFieldValue = jest.fn();
const mockArrayRemoveFieldValue = jest.fn();
const mockDeleteFieldValue = jest.fn();
const mockIncrementFieldValue = jest.fn();
const mockServerTimestampFieldValue = jest.fn();

// Timestamp mocks
const mockTimestampToDate = jest.fn();
const mockTimestampToMillis = jest.fn();
const mockTimestampFromDate = jest.fn();
const mockTimestampFromMillis = jest.fn();
const mockTimestampNow = jest.fn();

// Auth mocks
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
const mockUseEmulatorAuth = jest.fn();

// Firebase init mocks
const mockInitializeApp = jest.fn();
const mockCert = jest.fn();

module.exports = {
  // Firestore
  mockCollectionGroup,
  mockBatch,
  mockRunTransaction,
  mockRecursiveDelete,
  mockSettings,
  mockUseEmulator,
  mockCollection,
  mockDoc,
  mockCreate,
  mockUpdate,
  mockSet,
  mockAdd,
  mockDelete,
  mockListDocuments,
  mockListCollections,
  mockOnSnapShot,

  // Batch
  mockBatchDelete,
  mockBatchCommit,
  mockBatchUpdate,
  mockBatchSet,
  mockBatchCreate,

  // Query
  mockGet,
  mockSelect,
  mockWhere,
  mockLimit,
  mockOrderBy,
  mockOffset,
  mockStartAfter,
  mockStartAt,
  mockQueryOnSnapshot,
  mockQueryOnSnapshotUnsubscribe,
  mockWithConverter,

  // Transaction
  mockGetAll,
  mockGetAllTransaction,
  mockGetTransaction,
  mockSetTransaction,
  mockUpdateTransaction,
  mockDeleteTransaction,
  mockCreateTransaction,

  // FieldValue
  mockArrayUnionFieldValue,
  mockArrayRemoveFieldValue,
  mockDeleteFieldValue,
  mockIncrementFieldValue,
  mockServerTimestampFieldValue,

  // Timestamp
  mockTimestampToDate,
  mockTimestampToMillis,
  mockTimestampFromDate,
  mockTimestampFromMillis,
  mockTimestampNow,

  // Auth
  mockCreateUserWithEmailAndPassword,
  mockDeleteUser,
  mockSendVerificationEmail,
  mockSignInWithEmailAndPassword,
  mockSendPasswordResetEmail,
  mockVerifyIdToken,
  mockGetUser,
  mockCreateCustomToken,
  mockSetCustomUserClaims,
  mockSignOut,
  mockUseEmulatorAuth,

  // Firebase init
  mockInitializeApp,
  mockCert,
};
