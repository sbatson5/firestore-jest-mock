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

const mockBatchDelete = jest.fn();
const mockBatchCommit = jest.fn();
const mockBatchUpdate = jest.fn();
const mockBatchSet = jest.fn();

type DocRecord = Record<string, any>;

class Doc<T extends DocRecord> {
  public readonly exists: boolean;
  public readonly id: string;

  private readonly _data: T;

  constructor(data?: T) {
    this.exists = !!data || false;
    this.id = data?.id || 'abc123';
    this._data = data || ({} as T);
  }

  public data(): Omit<T, 'id'> {
    const copy = { ...this._data };
    delete copy.id;
    return copy;
  }
}

class QuerySnapshot<T extends DocRecord> {
  public readonly empty: boolean;
  public readonly docs: Doc<T>[];

  constructor(empty: boolean, docs: Doc<T>[]) {
    this.empty = empty;
    this.docs = docs;
  }

  public forEach(callback: (doc: Doc<T>) => any) {
    return this.docs.forEach(callback);
  }
}

function buildDocFromHash<T extends DocRecord>(hash?: T) {
  return new Doc(hash);
}

function idHasCollectionName(id: string) {
  return !!id.match('/');
}

function buildQuerySnapShot<T>(requestedRecords: Doc<T>[]) {
  const multipleRecords = requestedRecords.filter(rec => !!rec);
  const docs = multipleRecords.map(buildDocFromHash);

  return new QuerySnapshot(multipleRecords.length < 1, docs);
}

type T = FirebaseFirestore.DocumentReference;

class FakeFirestore {
  private isFetchingSingle: boolean;
  private database: Record<string, any>;

  private _collectionName: string;
  private recordToFetch: DocRecord;

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

  collection(collectionName: string, ...args) {
    this.isFetchingSingle = false;
    this.collectionName = collectionName;
    mockCollection(collectionName, ...args);
    return this;
  }

  collectionGroup(collectionName: string, ...args) {
    this.isFetchingSingle = false;
    this.collectionName = collectionName;
    mockCollectionGroup(collectionName, ...args);
    return this;
  }

  where(...args) {
    this.isFetchingSingle = false;
    mockWhere(...args);
    return this;
  }

  get(...args) {
    mockGet(...args);

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

  getAll(...args) {
    const requestedRecords = this.database[this.collectionName];

    mockGetAll(...args);

    const records = requestedRecords
      .map(record => buildDocFromHash(record))
      .filter(record => !!record.id);

    return Promise.resolve(records);
  }

  batch(...args) {
    mockBatch(...args);
    return {
      delete() {
        mockBatchDelete(...args);
      },
      set() {
        mockBatchSet(...args);
      },
      update() {
        mockBatchUpdate(...args);
      },
      commit() {
        mockBatchCommit(...args);
        return Promise.resolve();
      },
    };
  }

  doc(id: string) {
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

  update(object, ...args) {
    mockUpdate(object, ...args);
    return Promise.resolve(buildDocFromHash(object));
  }

  set(object, ...args) {
    mockSet(object, ...args);
    return Promise.resolve(buildDocFromHash(object));
  }

  add(object, ...args) {
    mockAdd(object, ...args);
    return Promise.resolve(buildDocFromHash(object));
  }

  delete(...args) {
    mockDelete(...args);
    return Promise.resolve();
  }

  orderBy(...args) {
    mockOrderBy(...args);
    return this;
  }

  limit(...args) {
    mockLimit(...args);
    return this;
  }
}

export {
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
  mockSet,
  mockUpdate,
  mockWhere,
  mockBatchDelete,
  mockBatchCommit,
  mockBatchUpdate,
  mockBatchSet,
};
