const mockRunTransaction = jest.fn();
const mockCollection = jest.fn();
const mockCollectionGroup = jest.fn();
const mockDoc = jest.fn();
const mockBatch = jest.fn();
const mockUpdate = jest.fn();
const mockAdd = jest.fn();
const mockSet = jest.fn();
const mockDelete = jest.fn();

const mockArrayRemoveFieldValue = jest.fn();
const mockArrayUnionFieldValue = jest.fn();
const mockDeleteFieldValue = jest.fn();
const mockIncrementFieldValue = jest.fn();
const mockServerTimestampFieldValue = jest.fn();

const mockBatchDelete = jest.fn();
const mockBatchCommit = jest.fn();
const mockBatchUpdate = jest.fn();
const mockBatchSet = jest.fn();

const mockTimestampToDate = jest.fn();
const mockTimestampToMillis = jest.fn();
const mockTimestampFromDate = jest.fn();
const mockTimestampFromMillis = jest.fn();

const { Query, mocks } = require('./query');
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
    this.query = new Query('', this);
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

  runTransaction(updateFunction) {
    mockRunTransaction(...arguments);
    return updateFunction(new FakeFirestore.Transaction());
  }
}

FakeFirestore.Query = Query;
FakeFirestore.Transaction = transaction.Transaction;

FakeFirestore.FieldValue = class {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }

  isEqual(other) {
    return (
      other instanceof FakeFirestore.FieldValue &&
      other.type === this.type &&
      other.value === this.value
    );
  }

  transform(value) {
    switch (this.type) {
      case 'arrayUnion':
        if (Array.isArray(value)) {
          return value.concat(this.value.filter(v => !value.includes(v)));
        } else {
          return this.value;
        }
      case 'arrayRemove':
        if (Array.isArray(value)) {
          return value.filter(v => !this.value.includes(v));
        } else {
          return value;
        }
      case 'increment': {
        const amount = Number(this.value);
        if (typeof value === 'number') {
          return value + amount;
        } else {
          return amount;
        }
      }
      case 'serverTimestamp': {
        return FakeFirestore.Timestamp.now();
      }
      case 'delete':
        return undefined;
    }
  }

  static arrayUnion(elements = []) {
    mockArrayUnionFieldValue(...arguments);
    if (!Array.isArray(elements)) {
      elements = [elements];
    }
    return new FakeFirestore.FieldValue('arrayUnion', elements);
  }

  static arrayRemove(elements) {
    mockArrayRemoveFieldValue(...arguments);
    if (!Array.isArray(elements)) {
      elements = [elements];
    }
    return new FakeFirestore.FieldValue('arrayRemove', elements);
  }

  static increment(amount = 1) {
    mockIncrementFieldValue(...arguments);
    return new FakeFirestore.FieldValue('increment', amount);
  }

  static serverTimestamp() {
    mockServerTimestampFieldValue(...arguments);
    return new FakeFirestore.FieldValue('serverTimestamp');
  }

  static delete() {
    mockDeleteFieldValue(...arguments);
    return new FakeFirestore.FieldValue('delete');
  }
};

FakeFirestore.Timestamp = class {
  constructor(seconds, nanoseconds) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }

  isEqual(other) {
    return (
      other instanceof FakeFirestore.Timestamp &&
      other.seconds === this.seconds &&
      other.nanoseconds === this.nanoseconds
    );
  }

  toDate() {
    const d = new Date(0);
    d.setTime(this.seconds * 1000);
    d.setMilliseconds(this.nanoseconds / 1000000);
    return mockTimestampToDate(...arguments) || d;
  }

  toMillis() {
    const d = new Date(0);
    d.setSeconds(this.seconds);
    d.setMilliseconds(this.nanoseconds / 1000000);
    return mockTimestampToMillis(...arguments) || d.getMilliseconds();
  }

  valueOf() {
    return JSON.stringify(this.toMillis());
  }

  static fromDate(date) {
    return (
      mockTimestampFromDate(...arguments) ||
      new FakeFirestore.Timestamp(date.getTime() * 0.001, date.getMilliseconds() * 1000000)
    );
  }

  static fromMillis(millis) {
    const d = new Date(0);
    d.setMilliseconds(millis);
    return mockTimestampFromMillis(...arguments) || FakeFirestore.Timestamp.fromDate(d);
  }

  static now() {
    const now = new Date();
    return FakeFirestore.Timestamp.fromDate(now);
  }
};

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
  mockArrayRemoveFieldValue,
  mockArrayUnionFieldValue,
  mockDeleteFieldValue,
  mockIncrementFieldValue,
  mockServerTimestampFieldValue,
  mockBatchDelete,
  mockBatchCommit,
  mockBatchUpdate,
  mockBatchSet,
  mockTimestampToDate,
  mockTimestampToMillis,
  mockTimestampFromDate,
  mockTimestampFromMillis,
  mockGet: mocks.mockGet,
  mockOrderBy: mocks.mockOrderBy,
  mockLimit: mocks.mockLimit,
  mockOffset: mocks.mockOffset,
  mockWhere: mocks.mockWhere,
  ...transaction.mocks,
};
