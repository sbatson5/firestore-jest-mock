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

export function mockModularAdmin(overrides?: MockOverrides, options?: MockOptions): void;

export const mockAdminInitializeApp: JestMock;
export const mockAdminGetApp: JestMock;
export const mockAdminCert: JestMock;
export const mockAdminGetFirestore: JestMock;
export const mockAdminGetAuth: JestMock;
