const mockCollection = jest.fn();
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

const mockBatchDelete = jest.fn();
const mockBatchCommit = jest.fn();

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
      const multipleRecords = requestedRecords.filter(rec => !!rec);
      contentToReturn = {
        empty: multipleRecords.length < 1,
        docs: multipleRecords.map(buildDocFromHash),
      };
    }

    return Promise.resolve(contentToReturn);
  }

  getAll() {
    const requestedRecords = this.database[this.collectionName];

    mockGetAll(...arguments);

    const records = requestedRecords
      .map(record => buildDocFromHash(record))
      .filter(record => !!record.id);

    return Promise.resolve({
      empty: records.length < 1,
      docs: records
    });
  }

  batch() {
    mockBatch(...arguments);
    return {
      delete() {
        mockBatchDelete(...arguments);
      },
      commit() {
        mockBatchCommit(...arguments);
        return Promise.resolve();
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
};

module.exports = {
  FakeFirestore,
  mockAdd,
  mockBatch,
  mockCollection,
  mockDelete,
  mockDoc,
  mockGet,
  mockGetAll,
  mockOrderBy,
  mockSet,
  mockUpdate,
  mockWhere,
  mockBatchDelete,
  mockBatchCommit,
};
