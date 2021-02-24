import type { FakeFirestore } from './firestore';
import buildQuerySnapShot from './helpers/buildQuerySnapShot';

const mockGet = jest.fn();
const mockWhere = jest.fn();
const mockLimit = jest.fn();
const mockOrderBy = jest.fn();
const mockOffset = jest.fn();
const mockStartAfter = jest.fn();
const mockStartAt = jest.fn();
const mockQueryOnSnapshot = jest.fn();

export const mocks = {
  mockGet,
  mockWhere,
  mockLimit,
  mockOrderBy,
  mockOffset,
  mockStartAfter,
  mockStartAt,
  mockQueryOnSnapshot,
};

export class Query {
  collectionName: string;
  firestore: FakeFirestore;

  constructor(collectionName: string, firestore: FakeFirestore) {
    this.collectionName = collectionName;
    this.firestore = firestore;
  }

  get(): Promise<ReturnType<typeof buildQuerySnapShot>> {
    mockGet(...arguments);
    // Use DFS to find all records in collections that match collectionName
    const requestedRecords = [];

    const st = [this.firestore.database];
    // At each collection list node, get collection in collection list whose id
    // matches this.collectionName
    while (st.length > 0) {
      const subcollections = st.pop() ?? {};
      const documents = subcollections[this.collectionName];
      if (documents && Array.isArray(documents)) {
        requestedRecords.push(...documents);
      }

      // For each collection in subcollections, get each document's _collections array
      // and push onto st.
      Object.values(subcollections).forEach(collection => {
        const documents = collection?.filter(d => !!d._collections) ?? [];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        st.push(...documents.map(d => d._collections!)); // This is definitely non-null b/c we filtered for it
      });
    }

    // Make sure we have a 'good enough' document reference
    const hashes = requestedRecords.map(rec => ({
      ...rec,
      _ref: this.firestore.doc('database/'.concat(rec.id)),
    }));
    return Promise.resolve(buildQuerySnapShot(hashes, this));
  }

  where(): Query {
    return (mockWhere(...arguments) as Query | undefined) ?? this;
  }

  offset(): Query {
    return (mockOffset(...arguments) as Query | undefined) ?? this;
  }

  limit(): Query {
    return (mockLimit(...arguments) as Query | undefined) ?? this;
  }

  orderBy(): Query {
    return (mockOrderBy(...arguments) as Query | undefined) ?? this;
  }

  startAfter(): Query {
    return (mockStartAfter(...arguments) as Query | undefined) ?? this;
  }

  startAt(): Query {
    return (mockStartAt(...arguments) as Query | undefined) ?? this;
  }

  onSnapshot(
    callback: (arg0: ReturnType<typeof buildQuerySnapShot>) => void,
    errorCallback: (error: unknown) => void,
  ): () => void {
    mockQueryOnSnapshot(...arguments);
    try {
      void this.get().then(result => {
        callback(result);
      });
    } catch (e) {
      errorCallback(e);
    }

    // Returns an unsubscribe function
    return () => undefined;
  }
}
