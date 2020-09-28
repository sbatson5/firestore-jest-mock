const mockRunTransaction = jest.fn();
const mockCollection = jest.fn();
const mockCollectionGroup = jest.fn();
const mockDoc = jest.fn();
const mockBatch = jest.fn();
const mockUpdate = jest.fn();
const mockAdd = jest.fn();
const mockSet = jest.fn();
const mockDelete = jest.fn();

const mockBatchDelete = jest.fn();
const mockBatchCommit = jest.fn();
const mockBatchUpdate = jest.fn();
const mockBatchSet = jest.fn();

const timestamp = require('./timestamp');
const fieldValue = require('./fieldValue');
const query = require('./query');
const transaction = require('./transaction');

const buildDocFromHash = require('./helpers/buildDocFromHash');
const buildQuerySnapShot = require('./helpers/buildQuerySnapShot');

function idHasCollectionName(id) {
  return id.match('/');
}

class FakeFirestore {
  constructor(stubbedDatabase = {}) {
    this.isFetchingSingle = false;
    this.database = stubbedDatabase;
    this.query = new query.Query('', this);
  }

  set collectionName(collectionName) {
    this.query.collectionName = collectionName;
    this.recordToFetch = null;
  }

  get collectionName() {
    return this.query.collectionName;
  }

  collection(collectionName) {
    this.isFetchingSingle = false;
    this.collectionName = collectionName;
    mockCollection(...arguments);
    return this;
  }

  collectionGroup(collectionName) {
    this.isFetchingSingle = false;
    this.collectionName = collectionName;
    mockCollectionGroup(...arguments);
    return this;
  }

  get() {
    mocks.mockGet(...arguments);

    if (this.recordToFetch && this.recordToFetch.exists !== false) {
      return Promise.resolve(buildDocFromHash(this.recordToFetch));
    }
    let result;
    const requestedRecords = this.database[this.collectionName] || [];
    if (this.isFetchingSingle) {
      if (requestedRecords.length < 1 || this.recordToFetch.exists === false) {
        result = buildDocFromHash(null, this.recordToFetch.id);
      } else if (Array.isArray(requestedRecords)) {
        result = buildDocFromHash(requestedRecords[0]);
      } else {
        result = buildDocFromHash(requestedRecords);
      }
    } else {
      result = buildQuerySnapShot(requestedRecords);
    }

    return Promise.resolve(result);
  }

  getAll() {
    const requestedRecords = this.database[this.collectionName];

    transaction.mocks.mockGetAll(...arguments);

    const records = requestedRecords
      .map(record => buildDocFromHash(record))
      .filter(record => !!record.id);

    return Promise.resolve(records);
  }

  batch() {
    mockBatch(...arguments);
    return {
      delete() {
        mockBatchDelete(...arguments);
      },
      set() {
        mockBatchSet(...arguments);
      },
      update() {
        mockBatchUpdate(...arguments);
      },
      commit() {
        mockBatchCommit(...arguments);
        return Promise.resolve();
      },
    };
  }

  doc(id) {
    if (idHasCollectionName(id)) {
      const pathArray = id.split('/');
      id = pathArray.pop();
      this.collectionName = pathArray.join('/');
    }

    mockDoc(id);
    this.isFetchingSingle = true;
    const records = this.database[this.collectionName] || [];
    this.recordToFetch = records.find(record => record.id === id) || { id, exists: false };
    return this;
  }

  where() {
    this.isFetchingSingle = false;
    return this.query.where(...arguments);
  }

  update(object) {
    mockUpdate(...arguments);
    return Promise.resolve(buildDocFromHash(object));
  }

  set(object) {
    mockSet(...arguments);
    return Promise.resolve(buildDocFromHash(object));
  }

  add(object) {
    mockAdd(...arguments);
    return Promise.resolve(buildDocFromHash(object));
  }

  delete() {
    mockDelete(...arguments);
    return Promise.resolve();
  }

  orderBy() {
    return this.query.orderBy(...arguments);
  }

  limit() {
    return this.query.limit(...arguments);
  }

  offset() {
    return this.query.offset(...arguments);
  }

  startAfter() {
    return this.query.startAfter(...arguments);
  }

  startAt() {
    return this.query.startAt(...arguments);
  }

  async runTransaction(updateFunction) {
    mockRunTransaction(...arguments);
    return await updateFunction(new FakeFirestore.Transaction());
  }
}

FakeFirestore.Query = query.Query;
FakeFirestore.Transaction = transaction.Transaction;
FakeFirestore.FieldValue = fieldValue.FieldValue;
FakeFirestore.Timestamp = timestamp.Timestamp;

module.exports = {
  FakeFirestore,
  mockAdd,
  mockBatch,
  mockRunTransaction,
  mockCollection,
  mockCollectionGroup,
  mockDelete,
  mockDoc,
  mockSet,
  mockUpdate,
  mockBatchDelete,
  mockBatchCommit,
  mockBatchUpdate,
  mockBatchSet,
  ...query.mocks,
  ...transaction.mocks,
  ...transaction.mocks,
  ...fieldValue.mocks,
  ...timestamp.mocks,
};
