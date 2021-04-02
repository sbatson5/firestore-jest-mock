const mockCollectionGroup = jest.fn();
const mockBatch = jest.fn();
const mockRunTransaction = jest.fn();

const mockSettings = jest.fn();
const mockUseEmulator = jest.fn();
const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockUpdate = jest.fn();
const mockSet = jest.fn();
const mockAdd = jest.fn();
const mockDelete = jest.fn();

const mockBatchDelete = jest.fn();
const mockBatchCommit = jest.fn();
const mockBatchUpdate = jest.fn();
const mockBatchSet = jest.fn();

const mockOnSnapShot = jest.fn();

const timestamp = require('./timestamp');
const fieldValue = require('./fieldValue');
const query = require('./query');
const transaction = require('./transaction');

const buildDocFromHash = require('./helpers/buildDocFromHash');
const buildQuerySnapShot = require('./helpers/buildQuerySnapShot');

class FakeFirestore {
  constructor(stubbedDatabase = {}, options = {}) {
    this.database = stubbedDatabase;
    this.query = new query.Query('', this);
    this.options = options;
  }

  set collectionName(collectionName) {
    this.query.collectionName = collectionName;
    this.recordToFetch = null;
  }

  get collectionName() {
    return this.query.collectionName;
  }

  getAll() {
    return Promise.all(
      transaction.mocks.mockGetAll(...arguments) || [...arguments].map(r => r.get()),
    );
  }

  batch() {
    mockBatch(...arguments);
    return {
      delete() {
        mockBatchDelete(...arguments);
        return this;
      },
      set() {
        mockBatchSet(...arguments);
        return this;
      },
      update() {
        mockBatchUpdate(...arguments);
        return this;
      },
      commit() {
        mockBatchCommit(...arguments);
        return Promise.resolve([]);
      },
    };
  }

  settings() {
    mockSettings(...arguments);
    return;
  }

  useEmulator() {
    mockUseEmulator(...arguments);
  }

  collection(collectionName) {
    mockCollection(...arguments);
    return new FakeFirestore.CollectionReference(collectionName, null, this);
  }

  collectionGroup(collectionName) {
    mockCollectionGroup(...arguments);
    return new FakeFirestore.Query(collectionName, this);
  }

  doc(path) {
    mockDoc(path);

    // Ignore leading slash
    const pathArray = path.replace(/^\/+/, '').split('/');
    // Must be document-level, so even-numbered elements
    if (pathArray.length % 2) {
      throw new Error('The path array must be document-level');
    }

    let doc = null;
    for (let index = 0; index < pathArray.length; index++) {
      const collectionId = pathArray[index];
      const documentId = pathArray[index + 1];

      const collection = new FakeFirestore.CollectionReference(collectionId, doc, this);
      doc = new FakeFirestore.DocumentReference(documentId, collection);

      index++; // skip to next collection
    }
    return doc;
  }

  runTransaction(updateFunction) {
    mockRunTransaction(...arguments);
    return updateFunction(new FakeFirestore.Transaction());
  }
}

FakeFirestore.Query = query.Query;
FakeFirestore.FieldValue = fieldValue.FieldValue;
FakeFirestore.Timestamp = timestamp.Timestamp;
FakeFirestore.Transaction = transaction.Transaction;

/*
 * ============
 *  Document Reference
 * ============
 */

FakeFirestore.DocumentReference = class {
  constructor(id, parent) {
    this.id = id;
    this.parent = parent;
    this.firestore = parent.firestore;
    this.path = parent.path.concat(`/${id}`);
  }

  collection(collectionName) {
    mockCollection(...arguments);
    return new FakeFirestore.CollectionReference(collectionName, this);
  }

  delete() {
    mockDelete(...arguments);
    return Promise.resolve();
  }

  onSnapshot() {
    mockOnSnapShot(...arguments);
    let callback;
    let errorCallback;
    // eslint-disable-next-line
    let options;

    try {
      if (typeof arguments[0] === 'function') {
        [callback, errorCallback] = arguments;
      } else {
        [options, callback, errorCallback] = arguments;
      }

      this.get()
        .then(result => {
          callback(result);
        })
        .catch(e => {
          throw e;
        });
    } catch (e) {
      errorCallback(e);
    }

    // Returns an unsubscribe function
    return () => {};
  }

  get() {
    query.mocks.mockGet(...arguments);
    // Ignore leading slash
    const pathArray = this.path.replace(/^\/+/, '').split('/');

    pathArray.shift(); // drop 'database'; it's always first
    let requestedRecords = this.firestore.database[pathArray.shift()];
    let document = null;
    if (requestedRecords) {
      const documentId = pathArray.shift();
      document = requestedRecords.find(record => record.id === documentId);
    } else {
      return Promise.resolve({ exists: false, data: () => undefined, id: this.id });
    }

    for (let index = 0; index < pathArray.length; index += 2) {
      const collectionId = pathArray[index];
      const documentId = pathArray[index + 1];

      if (!document || !document._collections) {
        return Promise.resolve({ exists: false, data: () => undefined, id: this.id });
      }
      requestedRecords = document._collections[collectionId] || [];
      if (requestedRecords.length === 0) {
        return Promise.resolve({ exists: false, data: () => undefined, id: this.id });
      }

      document = requestedRecords.find(record => record.id === documentId);
      if (!document) {
        return Promise.resolve({ exists: false, data: () => undefined, id: this.id });
      }

      // +2 skips to next document
    }

    if (!!document || false) {
      document._ref = this;
      return Promise.resolve(buildDocFromHash(document));
    }
    return Promise.resolve({ exists: false, data: () => undefined, id: this.id, ref: this });
  }

  update(object) {
    mockUpdate(...arguments);
    return Promise.resolve(buildDocFromHash({ ...object, _ref: this }));
  }

  set(object) {
    mockSet(...arguments);
    return Promise.resolve(buildDocFromHash({ ...object, _ref: this }));
  }

  isEqual(other) {
    return (
      other instanceof FakeFirestore.DocumentReference &&
      other.firestore === this.firestore &&
      other.path === this.path
    );
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

  withConverter() {
    query.mocks.mockWithConverter(...arguments);
    return this;
  }
};

/*
 * ============
 *  Collection Reference
 * ============
 */

FakeFirestore.CollectionReference = class extends FakeFirestore.Query {
  constructor(id, parent, firestore) {
    super(id, firestore || parent.firestore);

    this.id = id;
    this.parent = parent;
    if (parent) {
      this.path = parent.path.concat(`/${id}`);
    } else {
      this.path = `database/${id}`;
    }
  }

  add() {
    mockAdd(...arguments);
    return Promise.resolve(new FakeFirestore.DocumentReference('abc123', this));
  }

  doc(id = 'abc123') {
    mockDoc(id);
    return new FakeFirestore.DocumentReference(id, this, this.firestore);
  }

  /**
   * @function records
   * A private method, meant mainly to be used by `get` and other internal objects to retrieve
   * the list of database records referenced by this CollectionReference.
   * @returns {Object[]} An array of mocked document records.
   */
  records() {
    // Ignore leading slash
    const pathArray = this.path.replace(/^\/+/, '').split('/');

    pathArray.shift(); // drop 'database'; it's always first
    let requestedRecords = this.firestore.database[pathArray.shift()];
    if (pathArray.length === 0) {
      return requestedRecords || [];
    }

    // Since we're a collection, we can assume that pathArray.length % 2 is always 0

    for (let index = 0; index < pathArray.length; index += 2) {
      const documentId = pathArray[index];
      const collectionId = pathArray[index + 1];

      if (!requestedRecords) {
        return [];
      }
      const document = requestedRecords.find(record => record.id === documentId);
      if (!document || !document._collections) {
        return [];
      }

      requestedRecords = document._collections[collectionId] || [];
      if (requestedRecords.length === 0) {
        return [];
      }

      // +2 skips to next collection
    }

    return requestedRecords;
  }

  get() {
    query.mocks.mockGet(...arguments);
    // Make sure we have a 'good enough' document reference
    const records = this.records();
    records.forEach(rec => {
      rec._ref = this.doc(rec.id);
    });
    return Promise.resolve(buildQuerySnapShot(records));
  }

  isEqual(other) {
    return (
      other instanceof FakeFirestore.CollectionReference &&
      other.firestore === this.firestore &&
      other.path === this.path
    );
  }
};

module.exports = {
  FakeFirestore,
  mockBatch,
  mockRunTransaction,
  mockCollection,
  mockCollectionGroup,
  mockDoc,
  mockAdd,
  mockDelete,
  mockUpdate,
  mockSet,
  mockSettings,
  mockUseEmulator,
  mockBatchDelete,
  mockBatchCommit,
  mockBatchUpdate,
  mockBatchSet,
  mockOnSnapShot,
  ...query.mocks,
  ...transaction.mocks,
  ...fieldValue.mocks,
  ...timestamp.mocks,
};
