/*
 * ============
 *  Transactions
 * ============
 */

const mockGetTransaction = jest.fn();
const mockSetTransaction = jest.fn();
const mockUpdateTransaction = jest.fn();
const mockDeleteTransaction = jest.fn();

class Transaction {
  get(ref) {
    mockGetTransaction(...arguments);
    return ref.get();
  }

  set(ref) {
    mockSetTransaction(...arguments);
    const args = [...arguments];
    args.shift();
    ref.set(...args);
    return this;
  }

  update(ref) {
    mockUpdateTransaction(...arguments);
    const args = [...arguments];
    args.shift();
    ref.update(...args);
    return this;
  }

  delete(ref) {
    mockDeleteTransaction(...arguments);
    ref.delete();
    return this;
  }
}

module.exports = {
  Transaction,
  mocks: {
    mockGetTransaction,
    mockSetTransaction,
    mockUpdateTransaction,
    mockDeleteTransaction,
  },
};
