import type { _DocumentReference } from './firestore';

const mockGetAll = jest.fn();
const mockGetAllTransaction = jest.fn();
const mockGetTransaction = jest.fn();
const mockSetTransaction = jest.fn();
const mockUpdateTransaction = jest.fn();
const mockDeleteTransaction = jest.fn();

export const mocks = {
  mockGetAll,
  mockGetAllTransaction,
  mockGetTransaction,
  mockSetTransaction,
  mockUpdateTransaction,
  mockDeleteTransaction,
};

export class Transaction {
  getAll(...refsOrReadOptions: _DocumentReference[]): Promise<FakeFirestoreDocument[]> {
    mockGetAll(...arguments);
    mockGetAllTransaction(...arguments);
    // TODO: Assert that read options, if provided, are the last argument
    // Filter out the read options before calling .get()
    return Promise.all(refsOrReadOptions.filter(ref => !!ref.get).map(ref => ref.get()));
  }

  get(ref: _DocumentReference): Promise<FakeFirestoreDocument> {
    mockGetTransaction(...arguments);
    return ref.get();
  }

  set(ref: _DocumentReference, data: FakeFirestoreDocumentData, ...options: unknown[]): Transaction {
    mockSetTransaction(...arguments);
    void ref.set(data, ...options);
    return this;
  }

  update(ref: _DocumentReference, data: FakeFirestoreDocumentData): Transaction {
    mockUpdateTransaction(...arguments);
    void ref.update(data);
    return this;
  }

  delete(ref: _DocumentReference): Transaction {
    mockDeleteTransaction(...arguments);
    void ref.delete();
    return this;
  }
}
