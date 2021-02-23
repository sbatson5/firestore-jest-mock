interface DatabaseDocument {
  id: string;
  _collections?: DatabaseCollection;
  [key: string]: unknown;
}

interface DatabaseCollection {
  [collectionName: string]: Array<DatabaseDocument>;
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
