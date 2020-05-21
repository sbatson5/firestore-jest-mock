import { CollectionDataRef } from 'index';

/** Firestore mock database structure */
export interface MockDatabase {
  [collectionName: string]: CollectionData;
}

/** Data contructed insede FakeDatabase object instance */
export interface MockDatabaseData {
  [collectionName: string]: CollectionDataRef;
}

/** Type for mock collection that is array of documente data */
export type CollectionData = {
  docs: DocData[];
};

/** Doc data that can have subcollections */
export interface DocData {
  /** The document id */
  id: string;
  /** Data of the doc */
  data: FakeDocData;
  /** Subcollections of this doc */
  subcollections?: MockDatabase;
}

/** Represents the document data */
export interface FakeDocData {
  [field: string]: any;
}
