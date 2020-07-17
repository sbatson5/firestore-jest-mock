const mockCollection = jest.fn();
const mockCollectionGroup = jest.fn();
const mockDoc = jest.fn();
const mockWhere = jest.fn();
const mockBatch = jest.fn();
const mockGet = jest.fn();
const mockGetAll = jest.fn();
const mockUpdate = jest.fn();
const mockAdd = jest.fn();
const mockSet = jest.fn();
const mockDelete = jest.fn();
const mockOrderBy = jest.fn();
const mockLimit = jest.fn();
const mockOffset = jest.fn();

const mockArrayRemoveFieldValue = jest.fn();
const mockArrayUnionFieldValue = jest.fn();
const mockDeleteFieldValue = jest.fn();
const mockIncrementFieldValue = jest.fn();
const mockServerTimestampFieldValue = jest.fn();

const mockBatchDelete = jest.fn();
const mockBatchCommit = jest.fn();
const mockBatchUpdate = jest.fn();
const mockBatchSet = jest.fn();

function buildDocFromHash(hash = {}) {
  return {
    exists: !!hash || false,
    id: hash.id || 'abc123',
    data() {
      const copy = { ...hash };
      delete copy.id;
      return copy;
    },
  };
}

function idHasCollectionName(id) {
  return id.match('/');
}

function buildQuerySnapShot(requestedRecords) {
  const multipleRecords = requestedRecords.filter(rec => !!rec);
  const docs = multipleRecords.map(buildDocFromHash);

  return {
    empty: multipleRecords.length < 1,
    docs,
    forEach(callback) {
      return docs.forEach(callback);
    },
  };
}

class FakeFirestore {
  constructor(stubbedDatabase = {}) {
    this.isFetchingSingle = false;
    this.database = stubbedDatabase;
  }

  set collectionName(collectionName) {
    this._collectionName = collectionName;
    this.recordToFetch = null;
  }

  get collectionName() {
    return this._collectionName;
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

  where() {
    this.isFetchingSingle = false;
    mockWhere(...arguments);
    return this;
  }

  get() {
    mockGet(...arguments);

    if (this.recordToFetch) {
      return Promise.resolve(buildDocFromHash(this.recordToFetch));
    }
    let contentToReturn;
    const requestedRecords = this.database[this.collectionName] || [];
    if (this.isFetchingSingle) {
      if (requestedRecords.length < 1 || !this.recordToFetch) {
        contentToReturn = { exists: false };
      } else if (Array.isArray(requestedRecords)) {
        contentToReturn = buildDocFromHash(requestedRecords[0]);
      } else {
        contentToReturn = buildDocFromHash(requestedRecords);
      }
    } else {
      contentToReturn = buildQuerySnapShot(requestedRecords);
    }

    return Promise.resolve(contentToReturn);
  }

  getAll() {
    const requestedRecords = this.database[this.collectionName];

    mockGetAll(...arguments);

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
    this.recordToFetch = records.find(record => record.id === id);
    return this;
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
    mockOrderBy(...arguments);
    return this;
  }

  limit() {
    mockLimit(...arguments);
    return this;
  }

  offset() {
    mockOffset(...arguments);
    return this;
  }
}

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

  static now() {
    const now = Date.now();
    return new FakeFirestore.Timestamp(now / 1000, 0);
  }

  isEqual(other) {
    return (
      other instanceof FakeFirestore.FieldValue.Timestamp &&
      other.seconds === this.seconds &&
      other.nanoseconds === this.nanoseconds
    );
  }
};

module.exports = {
  FakeFirestore,
  mockAdd,
  mockBatch,
  mockCollection,
  mockCollectionGroup,
  mockDelete,
  mockDoc,
  mockGet,
  mockGetAll,
  mockOrderBy,
  mockOffset,
  mockSet,
  mockUpdate,
  mockWhere,
  mockArrayRemoveFieldValue,
  mockArrayUnionFieldValue,
  mockDeleteFieldValue,
  mockIncrementFieldValue,
  mockServerTimestampFieldValue,
  mockBatchDelete,
  mockBatchCommit,
  mockBatchUpdate,
  mockBatchSet,
};
