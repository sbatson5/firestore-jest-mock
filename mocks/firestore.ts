export const mockBatch = jest.fn();
export const mockRunTransaction = jest.fn();

export const mockSettings = jest.fn();
export const mockCollection = jest.fn();
export const mockCollectionGroup = jest.fn();
export const mockDoc = jest.fn();
export const mockUpdate = jest.fn();
export const mockSet = jest.fn();
export const mockAdd = jest.fn();
export const mockDelete = jest.fn();

export const mockBatchDelete = jest.fn();
export const mockBatchCommit = jest.fn();
export const mockBatchUpdate = jest.fn();
export const mockBatchSet = jest.fn();

export const mockOnSnapShot = jest.fn();

import * as timestamp from './timestamp';
import * as fieldValue from './fieldValue';
import * as query from './query';
import * as transaction from './transaction';

// Reexport all mock functions individually, since TypeScript doesn't support spread exports.
export const mockGet = query.mocks.mockGet;
export const mockWhere = query.mocks.mockWhere;
export const mockLimit = query.mocks.mockLimit;
export const mockOrderBy = query.mocks.mockOrderBy;
export const mockOffset = query.mocks.mockOffset;
export const mockStartAfter = query.mocks.mockStartAfter;
export const mockStartAt = query.mocks.mockStartAt;
export const mockQueryOnSnapshot = query.mocks.mockQueryOnSnapshot;

export const mockGetAll = transaction.mocks.mockGetAll;
export const mockGetAllTransaction = transaction.mocks.mockGetAllTransaction;
export const mockGetTransaction = transaction.mocks.mockGetTransaction;
export const mockSetTransaction = transaction.mocks.mockSetTransaction;
export const mockUpdateTransaction = transaction.mocks.mockUpdateTransaction;
export const mockDeleteTransaction = transaction.mocks.mockDeleteTransaction;

export const mockArrayUnionFieldValue = fieldValue.mocks.mockArrayUnionFieldValue;
export const mockArrayRemoveFieldValue = fieldValue.mocks.mockArrayRemoveFieldValue;
export const mockDeleteFieldValue = fieldValue.mocks.mockDeleteFieldValue;
export const mockIncrementFieldValue = fieldValue.mocks.mockIncrementFieldValue;
export const mockServerTimestampFieldValue = fieldValue.mocks.mockServerTimestampFieldValue;

export const mockTimestampToDate = timestamp.mocks.mockTimestampToDate;
export const mockTimestampToMillis = timestamp.mocks.mockTimestampToMillis;
export const mockTimestampFromDate = timestamp.mocks.mockTimestampFromDate;
export const mockTimestampFromMillis = timestamp.mocks.mockTimestampFromMillis;
export const mockTimestampNow = timestamp.mocks.mockTimestampNow;

import buildDocFromHash from './helpers/buildDocFromHash';
import buildQuerySnapShot from './helpers/buildQuerySnapShot';

declare global {
  interface FakeFirestoreDocument {
    exists: boolean;
    data: () => FakeFirestoreDocumentData | undefined;
    id: string;
    ref: _DocumentReference;
  }
}

export class FakeFirestore {
  public static Query: typeof query.Query;
  public static FieldValue: typeof fieldValue.FieldValue;
  public static Timestamp: typeof timestamp.Timestamp;
  public static Transaction: typeof transaction.Transaction;
  public static DocumentReference: typeof _DocumentReference;
  public static CollectionReference: typeof _CollectionReference;

  database: DatabaseCollections;
  query: query.Query;

  constructor(stubbedDatabase: DatabaseCollections = {}) {
    this.database = stubbedDatabase;
    this.query = new query.Query('', this);
  }

  set collectionName(collectionName: string) {
    this.query.collectionName = collectionName;
  }

  get collectionName(): string {
    return this.query.collectionName;
  }

  getAll(...refsOrReadOptions: _DocumentReference[]): Promise<FakeFirestoreDocument[]> {
    return Promise.all(
      transaction.mocks.mockGetAll(...refsOrReadOptions) || refsOrReadOptions.map(r => r.get()),
    );
  }

  batch(): FirestoreBatch {
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
        return Promise.resolve();
      },
    };
  }

  settings(): void {
    mockSettings(...arguments);
    return;
  }

  collection(collectionName: string): _CollectionReference {
    mockCollection(...arguments);
    return new FakeFirestore.CollectionReference(collectionName, null, this);
  }

  collectionGroup(collectionName: string): query.Query {
    mockCollectionGroup(...arguments);
    return new FakeFirestore.Query(collectionName, this);
  }

  doc(path: string): _DocumentReference {
    mockDoc(path);

    // Ignore leading slash
    const pathArray = path.replace(/^\/+/, '').split('/');

    // Must not be empty
    if (pathArray.length === 0) {
      throw new Error('The path must not be empty');
    }
    // Must be document-level, so even-numbered elements
    if (pathArray.length % 2) {
      throw new Error('The path must be document-level');
    }

    let doc: _DocumentReference | null = null;
    for (let index = 0; index < pathArray.length; index++) {
      const collectionId = pathArray[index];
      const documentId = pathArray[index + 1];

      const collection: _CollectionReference = new FakeFirestore.CollectionReference(
        collectionId,
        doc,
        this,
      );
      doc = new FakeFirestore.DocumentReference(documentId, collection);

      index++; // skip to next collection
    }

    if (!doc) {
      throw new Error(
        'SANITY ERROR: Document was null after parsing path. This should never happen with a non-empty path array.',
      );
    }
    return doc;
  }

  async runTransaction<T = void>(
    updateFunction:
      | ((arg0: transaction.Transaction) => Promise<T>)
      | ((arg0: transaction.Transaction) => T),
  ): Promise<T> {
    mockRunTransaction(...arguments);
    return updateFunction(new transaction.Transaction());
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

export class _DocumentReference {
  id: string;
  path: string;
  parent: _CollectionReference;
  firestore: FakeFirestore;

  constructor(id: string, parent: _CollectionReference) {
    this.id = id;
    this.parent = parent;
    this.firestore = parent.firestore;
    this.path = parent.path.concat(`/${id}`);
  }

  collection(collectionName: string): _CollectionReference {
    mockCollection(...arguments);
    return new FakeFirestore.CollectionReference(collectionName, this);
  }

  delete(): Promise<void> {
    mockDelete(...arguments);
    return Promise.resolve();
  }

  onSnapshot(
    callback: (result: unknown) => void,
    errorCallback: (error: unknown) => void,
  ): () => void;

  onSnapshot(
    options: unknown,
    callback: (result: unknown) => void,
    errorCallback: (error: unknown) => void,
  ): () => void;

  onSnapshot(): () => void {
    mockOnSnapShot(...arguments);
    let callback: (result: unknown) => void;
    let errorCallback: (error: unknown) => void;
    let options: unknown;

    if (typeof arguments[0] === 'function') {
      [callback, errorCallback] = arguments;
    } else {
      [options, callback, errorCallback] = arguments;
      // eslint-disable-next-line no-console
      console.log('onSnapshot received options', options);
    }

    this.get()
      .then(result => {
        callback(result);
      })
      .catch(e => {
        errorCallback(e);
      });

    // Returns an unsubscribe function
    return () => undefined;
  }

  get(): Promise<FakeFirestoreDocument> {
    query.mocks.mockGet(...arguments);
    // Ignore leading slash
    const pathArray = this.path.replace(/^\/+/, '').split('/');

    pathArray.shift(); // drop 'database'; it's always first
    const firstSegment = pathArray.shift();
    if (!firstSegment) {
      throw new Error(`Path '${this.path}' is too short.`);
    }
    let requestedRecords = this.firestore.database[firstSegment];
    let document: DatabaseDocument | null = null;
    if (requestedRecords) {
      const documentId = pathArray.shift();
      document = requestedRecords.find(record => record.id === documentId) ?? null;
    } else {
      return Promise.resolve({ exists: false, data: () => undefined, id: this.id, ref: this });
    }

    for (let index = 0; index < pathArray.length; index += 2) {
      const collectionId = pathArray[index];
      const documentId = pathArray[index + 1];

      if (!document || !document._collections) {
        return Promise.resolve({ exists: false, data: () => undefined, id: this.id, ref: this });
      }
      requestedRecords = document._collections[collectionId] ?? [];
      if (requestedRecords.length === 0) {
        return Promise.resolve({ exists: false, data: () => undefined, id: this.id, ref: this });
      }

      document = requestedRecords.find(record => record.id === documentId) ?? null;
      if (!document) {
        return Promise.resolve({ exists: false, data: () => undefined, id: this.id, ref: this });
      }

      // +2 skips to next document
    }

    if (document) {
      return Promise.resolve(buildDocFromHash({ ...document, _ref: this }));
    }
    return Promise.resolve({ exists: false, data: () => undefined, id: this.id, ref: this });
  }

  update(object: FakeFirestoreDocumentData): Promise<ReturnType<typeof buildDocFromHash>> {
    mockUpdate(...arguments);
    return Promise.resolve(buildDocFromHash({ ...object, _ref: this }));
  }

  set(
    object: FakeFirestoreDocumentData,
    ...options: unknown[]
  ): Promise<ReturnType<typeof buildDocFromHash>> {
    mockSet(object, ...options);
    return Promise.resolve(buildDocFromHash({ ...object, _ref: this }));
  }

  isEqual(other: unknown): boolean {
    return (
      other instanceof FakeFirestore.DocumentReference &&
      other.firestore === this.firestore &&
      other.path === this.path
    );
  }

  /** @deprecated Call this method on a Query instance instead. */
  orderBy(): never {
    throw new Error('This method does not exist on DocumentReference.');
  }

  /** @deprecated Call this method on a Query instance instead. */
  limit(): never {
    throw new Error('This method does not exist on DocumentReference.');
  }

  /** @deprecated Call this method on a Query instance instead. */
  offset(): never {
    throw new Error('This method does not exist on DocumentReference.');
  }

  /** @deprecated Call this method on a Query instance instead. */
  startAfter(): never {
    throw new Error('This method does not exist on DocumentReference.');
  }

  /** @deprecated Call this method on a Query instance instead. */
  startAt(): never {
    throw new Error('This method does not exist on DocumentReference.');
  }
}

FakeFirestore.DocumentReference = _DocumentReference;

/*
 * ============
 *  Collection Reference
 * ============
 */

class _CollectionReference extends FakeFirestore.Query {
  id: string;
  path: string;
  parent: _DocumentReference | null;

  constructor(id: string, parent: _DocumentReference, firestore?: FakeFirestore);
  constructor(id: string, parent: null, firestore: FakeFirestore);
  constructor(id: string, parent: _DocumentReference | null, firestore: FakeFirestore);

  constructor(id: string, parent: _DocumentReference | null, firestore: FakeFirestore) {
    super(id, firestore ?? parent?.firestore);

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
    return new FakeFirestore.DocumentReference(id, this);
  }

  /**
   * A helper method intended to be used by our `get` mock and other internal implementations
   * to retrieve the list of database records referenced by this CollectionReference.
   *
   * @returns An array of mocked document records.
   */
  private records(): Array<DatabaseDocument> {
    // Ignore leading slash
    const pathArray = this.path.replace(/^\/+/, '').split('/');

    pathArray.shift(); // drop 'database'; it's always first
    const firstSegment = pathArray.shift();
    if (!firstSegment) {
      throw new Error(`Path '${this.path}' is too short.`);
    }
    let requestedRecords = this.firestore.database[firstSegment] ?? [];
    if (pathArray.length === 0) {
      return requestedRecords;
    }

    // Since we're a collection, we can assume that pathArray.length % 2 is always 0

    for (let index = 0; index < pathArray.length; index += 2) {
      const documentId = pathArray[index];
      const collectionId = pathArray[index + 1];

      const document = requestedRecords.find(record => record.id === documentId);
      if (!document || !document._collections) {
        return [];
      }

      requestedRecords = document._collections[collectionId] ?? [];
      if (requestedRecords.length === 0) {
        return [];
      }

      // +2 skips to next collection
    }

    return requestedRecords;
  }

  get(): Promise<ReturnType<typeof buildQuerySnapShot>> {
    query.mocks.mockGet(...arguments);
    // Make sure we have a 'good enough' document reference
    const records = this.records().map(rec => ({
      ...rec,
      _ref: this.doc(rec.id),
    }));
    return Promise.resolve(buildQuerySnapShot(records, this));
  }

  isEqual(other: unknown): boolean {
    return (
      other instanceof FakeFirestore.CollectionReference &&
      other.firestore === this.firestore &&
      other.path === this.path
    );
  }
}

FakeFirestore.CollectionReference = _CollectionReference;
