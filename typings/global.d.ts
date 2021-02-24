interface DatabaseDocument {
  id: string;
  _collections?: DatabaseCollections;
  [key: string]: unknown;
}

interface DatabaseCollections {
  [collectionName: string]: Array<DatabaseDocument> | undefined;
}

type FakeFirestoreDocumentData = Record<string, unknown>;

interface FirestoreBatch {
  delete(): FirestoreBatch;
  set(): FirestoreBatch;
  update(): FirestoreBatch;
  commit(): Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Class<T> = { new (...args: any[]): T } | { new (): T };
