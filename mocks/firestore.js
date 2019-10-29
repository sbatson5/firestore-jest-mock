const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockWhere = jest.fn();
const mockBatch = jest.fn();
const mockGetAll = jest.fn();
const mockUpdate = jest.fn();
const mockAdd = jest.fn();
const mockSet = jest.fn();
const mockDelete = jest.fn();
const mockOrderBy = jest.fn();
const mockLimit = jest.fn();

const mockBatchDelete = jest.fn();
const mockBatchCommit = jest.fn();

function buildDocFromHash(hash) {
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

class FakeFirestore {
  constructor(stubbedDatabase = {}) {
    this.isFetchingSingle = false;
    this.database = stubbedDatabase;
  }

  collection(collectionName) {
    this.recordToFetch = null;
    this.isFetchingSingle = false;
    this.collectionName = collectionName;
    mockCollection(...arguments);
    return this;
  }

  where() {
    this.isFetchingSingle = false;
    mockWhere(...arguments);
    return this;
  }

  get() {
    if (this.recordToFetch) {
      return buildDocFromHash(this.recordToFetch);
    }

    const requestedRecords = this.database[this.collectionName] || [];
    if (this.isFetchingSingle) {
      if (requestedRecords.length < 1 || !this.recordToFetch) {
        return { exists: false };
      }
      if (Array.isArray(requestedRecords)) {
        return buildDocFromHash(requestedRecords[0]);
      }
      return buildDocFromHash(requestedRecords);
    } else {
      const multipleRecords = requestedRecords.filter(rec => !!rec);
      return {
        empty: multipleRecords.length < 1,
        docs: multipleRecords.map(buildDocFromHash),
      };
    }
  }

  getAll() {
    const requestedRecords = this.database[this.collectionName];

    mockGetAll(...arguments);

    const records = requestedRecords
      .map(record => buildDocFromHash(record))
      .filter(record => !!record.id);

    return records;
  }

  batch() {
    mockBatch(...arguments);
    return {
      delete() {
        mockBatchDelete(...arguments);
      },
      commit() {
        mockBatchCommit(...arguments);
      },
    };
  }

  doc(id) {
    mockDoc(id);
    this.isFetchingSingle = true;
    const records = this.database[this.collectionName] || [];
    this.recordToFetch = records.find(record => record.id === id);
    return this;
  }

  update() {
    mockUpdate(...arguments);
    return this;
  }

  set() {
    mockSet(...arguments);
    return this;
  }

  add() {
    mockAdd(...arguments);
    return this;
  }

  delete() {
    mockDelete(...arguments);
    return this;
  }

  orderBy() {
    mockOrderBy(...arguments);
    return this;
  }

  limit() {
    mockLimit(...arguments);
    return this;
  }
};

module.exports = {
  FakeFirestore,
  mockAdd,
  mockBatch,
  mockCollection,
  mockDelete,
  mockDoc,
  mockGetAll,
  mockOrderBy,
  mockSet,
  mockUpdate,
  mockWhere,
  mockBatchDelete,
  mockBatchCommit,
};
