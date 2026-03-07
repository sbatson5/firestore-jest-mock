import { Mock } from 'jest-mock';

type JestMock = Mock;

interface MockOptions {
  includeIdsInData?: boolean;
  mutable?: boolean;
  simulateQueryFilters?: boolean;
}

interface MockOverrides {
  database?: Record<string, unknown[]>;
  currentUser?: Record<string, unknown>;
}

export function mockModularFirestore(overrides?: MockOverrides, options?: MockOptions): void;

export const mockGetFirestore: JestMock;
export const mockInitializeFirestore: JestMock;
export const mockGetDoc: JestMock;
export const mockGetDocs: JestMock;
export const mockAddDoc: JestMock;
export const mockSetDoc: JestMock;
export const mockUpdateDoc: JestMock;
export const mockDeleteDoc: JestMock;
export const mockModularCollection: JestMock;
export const mockModularCollectionGroup: JestMock;
export const mockModularDoc: JestMock;
export const mockModularOnSnapshot: JestMock;
export const mockModularQuery: JestMock;
export const mockModularWhere: JestMock;
export const mockModularOrderBy: JestMock;
export const mockModularLimit: JestMock;
export const mockLimitToLast: JestMock;
export const mockModularStartAt: JestMock;
export const mockModularStartAfter: JestMock;
export const mockEndAt: JestMock;
export const mockEndBefore: JestMock;
export const mockModularWriteBatch: JestMock;
export const mockModularRunTransaction: JestMock;
export const mockConnectFirestoreEmulator: JestMock;
export const mockEnableIndexedDbPersistence: JestMock;
export const mockTerminate: JestMock;
