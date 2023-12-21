import type { FieldValue } from './fieldValue';
import type { Query } from './query';
import type { Timestamp } from './timestamp';
import type { Transaction } from './transaction';
import type { FieldPath } from './path';

import type { MockedDocument, DocumentData } from './helpers/buildDocFromHash';
import type { MockedQuerySnapshot } from './helpers/buildQuerySnapShot';

interface DatabaseDocument extends DocumentData {
  id: string;
  _collections?: DatabaseCollections;
}

interface DatabaseCollections {
  [collectionName: string]: Array<DatabaseDocument> | undefined;
}

interface SetOptions {
  merge?: boolean;
}

interface FirestoreBatch {
  delete(): FirestoreBatch;
  set(doc: DocumentReference, data: DocumentData, options?: SetOptions): FirestoreBatch;
  update(doc: DocumentReference, data: DocumentData): FirestoreBatch;
  commit(): Promise<void>;
}

export type FakeFirestoreDatabase = DatabaseCollections;

export class FakeFirestore {
  static FieldValue: typeof FieldValue;
  static Timestamp: typeof Timestamp
  static Query: typeof Query;
  static Transaction: typeof Transaction;
  static FieldPath: typeof FieldPath;

  static DocumentReference: typeof DocumentReference;
  static CollectionReference: typeof CollectionReference;

  database: FakeFirestoreDatabase;
  options: Record<string, never>;
  query: Query;
  collectionName: string;
  
  constructor(stubbedDatabase?: DatabaseCollections, options?: Record<string, never>);

  getAll(): Array<MockedQuerySnapshot>;
  batch(): FirestoreBatch;
  settings(): void;
  useEmulator(): void;
  collection(collectionName: string): CollectionReference;
  collectionGroup(collectionName: string): Query;
  doc(path: string): DocumentReference;
  runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>): Promise<T>;
}

declare class DocumentReference {
  id: string;
  parent: CollectionReference;
  firestore: FakeFirestore;
  path: string;
  
  constructor(id: string, parent: CollectionReference);

  collection(collectionName: string): CollectionReference;
  delete(): Promise<void>;
  get(): Promise<MockedDocument>;

  update(object: DocumentData): Promise<MockedDocument>;
  set(object: DocumentData): Promise<MockedDocument>;

  isEqual(other: DocumentReference): boolean;

  withConverter(): DocumentReference;

  onSnapshot(callback: () => void, errorCallback: () => void): () => void;
  onSnapshot(options: Record<string, never>, callback: () => void, errorCallback: () => void): () => void;

  /** @deprecated Call the analagous method on a `Query` instance instead. */
  orderBy(): never;

  /** @deprecated Call the analagous method on a `Query` instance instead. */
  limit(): never;

  /** @deprecated Call the analagous method on a `Query` instance instead. */
  offset(): never;

  /** @deprecated Call the analagous method on a `Query` instance instead. */
  startAfter(): never;

  /** @deprecated Call the analagous method on a `Query` instance instead. */
  startAt(): never;
}

declare class CollectionReference extends FakeFirestore.Query {
  id: string;
  parent: DocumentReference;
  path: string;
  
  constructor(id: string, parent: DocumentReference, firestore?: FakeFirestore);

  doc(id?: string): DocumentReference;
  get(): Promise<MockedQuerySnapshot>;
  add(data: DocumentData): Promise<DocumentReference>;
  isEqual(other: CollectionReference): boolean;

  /**
   * An internal method, meant mainly to be used by `get` and other internal objects to retrieve
   * the list of database records referenced by this CollectionReference.
   * @returns An array of mocked document records.
   */
  private _records(): Array<MockedDocument>
}

// Mocks exported from this module
export const mockBatch: jest.Mock;
export const mockRunTransaction: jest.Mock;

export const mockCollection: jest.Mock;
export const mockCollectionGroup: jest.Mock;
export const mockDoc: jest.Mock;
export const mockUpdate: jest.Mock;
export const mockSet: jest.Mock;
export const mockAdd: jest.Mock;
export const mockDelete: jest.Mock;
export const mockSettings: jest.Mock;

// FIXME: We should decide whether this should be exported from auth or firestore
export const mockUseEmulator: jest.Mock;
export const mockListDocuments: jest.Mock;

export const mockBatchDelete: jest.Mock;
export const mockBatchCommit: jest.Mock;
export const mockBatchUpdate: jest.Mock;
export const mockBatchSet: jest.Mock;

export const mockOnSnapShot: jest.Mock;

// Mocks exported from FieldValue
export const mockArrayUnionFieldValue: jest.Mock;
export const mockArrayRemoveFieldValue: jest.Mock;
export const mockDeleteFieldValue: jest.Mock;
export const mockIncrementFieldValue: jest.Mock;
export const mockServerTimestampFieldValue: jest.Mock;

// Mocks exported from Query
export const mockGet: jest.Mock;
export const mockWhere: jest.Mock;
export const mockLimit: jest.Mock;
export const mockOrderBy: jest.Mock;
export const mockOffset: jest.Mock;
export const mockStartAfter: jest.Mock;
export const mockStartAt: jest.Mock;
export const mockQueryOnSnapshot: jest.Mock;
export const mockWithConverter: jest.Mock;

// Mocks exported from Timestamp
export const mockTimestampToDate: jest.Mock;
export const mockTimestampToMillis: jest.Mock;
export const mockTimestampFromDate: jest.Mock;
export const mockTimestampFromMillis: jest.Mock;
export const mockTimestampNow: jest.Mock;

// Mocks exported from Transaction
export const mockGetAll: jest.Mock;
export const mockGetAllTransaction: jest.Mock;
export const mockGetTransaction: jest.Mock;
export const mockSetTransaction: jest.Mock;
export const mockUpdateTransaction: jest.Mock;
export const mockDeleteTransaction: jest.Mock;
export const mockCreateTransaction: jest.Mock;
