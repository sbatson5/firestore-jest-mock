import {
  mockGetAll,
  mockGetAllTransaction,
  mockGetTransaction,
  mockSetTransaction,
  mockUpdateTransaction,
  mockDeleteTransaction,
  mockCreateTransaction,
} from './mockRegistry';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class Transaction {
  getAll(...refsOrReadOptions: any[]): Promise<any[]> {
    mockGetAll(...refsOrReadOptions);
    mockGetAllTransaction(...refsOrReadOptions);
    return Promise.all(refsOrReadOptions.filter(ref => !!ref.get).map(ref => ref.get()));
  }

  get(ref: any): Promise<any> {
    mockGetTransaction(ref);
    return Promise.resolve(ref._get());
  }

  set(ref: any, ...args: any[]): this {
    mockSetTransaction(ref, ...args);
    ref.set(...args);
    return this;
  }

  update(ref: any, ...args: any[]): this {
    mockUpdateTransaction(ref, ...args);
    ref.update(...args);
    return this;
  }

  delete(ref: any): this {
    mockDeleteTransaction(ref);
    ref.delete();
    return this;
  }

  create(ref: any, options: any): this {
    mockCreateTransaction(ref, options);
    ref.set(options);
    return this;
  }
}

/* eslint-enable @typescript-eslint/no-explicit-any */

export const mocks = {
  mockGetAll,
  mockGetAllTransaction,
  mockGetTransaction,
  mockSetTransaction,
  mockUpdateTransaction,
  mockDeleteTransaction,
  mockCreateTransaction,
};
