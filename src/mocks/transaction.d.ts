import type { Query } from './query';
import type { MockedQuerySnapshot } from './helpers/buildQuerySnapShot';

export class Transaction {
  getAll(...refsOrReadOptions: Array<Query | Record<string, never>>): Promise<Array<MockedQuerySnapshot>>;
  get(ref: Query): Promise<MockedQuerySnapshot>;
  set(ref: Query): Transaction;
  update(ref: Query): Transaction;
  delete(ref: Query): Transaction;
  create(ref: Query, options: unknown): Transaction;
}

export const mocks: {
  mockGetAll: jest.Mock;
  mockGetAllTransaction: jest.Mock;
  mockGetTransaction: jest.Mock;
  mockSetTransaction: jest.Mock;
  mockUpdateTransaction: jest.Mock;
  mockDeleteTransaction: jest.Mock;
  mockCreateTransaction: jest.Mock;
};
