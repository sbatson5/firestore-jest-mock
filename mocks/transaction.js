const mockGetAll = jest.fn();
const mockGetAllTransaction = jest.fn();
const mockGetTransaction = jest.fn();
const mockSetTransaction = jest.fn();
const mockUpdateTransaction = jest.fn();
const mockDeleteTransaction = jest.fn();
const mockCreateTransaction = jest.fn();

class Transaction {
  getAll(...refsOrReadOptions) {
    mockGetAll(...arguments);
    mockGetAllTransaction(...arguments);
    // TODO: Assert that read options, if provided, are the last argument
    // Filter out the read options before calling .get()
    return Promise.all(refsOrReadOptions.filter(ref => !!ref.get).map(ref => ref.get()));
  }

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

  create(ref, options) {
    mockCreateTransaction(...arguments);
    ref.set(options);
    return this;
  }
}

module.exports = {
  Transaction,
  mocks: {
    mockGetAll,
    mockGetAllTransaction,
    mockGetTransaction,
    mockSetTransaction,
    mockUpdateTransaction,
    mockDeleteTransaction,
    mockCreateTransaction,
  },
};
