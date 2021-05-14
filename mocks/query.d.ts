import type { FakeFirestore } from './firestore';
import type { MockedQuerySnapshot } from './helpers/buildQuerySnapShot';

export class Query {
  constructor(collectionName: string, firestore: typeof FakeFirestore);

  get(): Promise<MockedQuerySnapshot>;

  where(): Query;
  offset(): Query;
  limit(): Query;
  orderBy(): Query;
  startAfter(): Query;
  startAt(): Query;
  withConverter(): Query;
  onSnapshot(): () => void;
}

export const mocks: {
  mockGet: jest.Mock,
  mockWhere: jest.Mock,
  mockLimit: jest.Mock,
  mockOrderBy: jest.Mock,
  mockOffset: jest.Mock,
  mockStartAfter: jest.Mock,
  mockStartAt: jest.Mock,
  mockQueryOnSnapshot: jest.Mock,
  mockWithConverter: jest.Mock,
};
