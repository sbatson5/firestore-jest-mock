const buildQuerySnapShot = require('./helpers/buildQuerySnapShot');

const mockGet = jest.fn();
const mockWhere = jest.fn();
const mockLimit = jest.fn();
const mockOrderBy = jest.fn();
const mockOffset = jest.fn();
const mockStartAfter = jest.fn();
const mockStartAt = jest.fn();
const mockQueryOnSnapshot = jest.fn();
const mockWithConverter = jest.fn();

class Query {
  constructor(collectionName, firestore, isGroupQuery = false) {
    this.collectionName = collectionName;
    this.firestore = firestore;
    this.filters = [];
    this.isGroupQuery = isGroupQuery;
  }

  get() {
    mockGet(...arguments);
    return Promise.resolve(this._get());
  }

  _get() {
    // Simulate collectionGroup query

    // Get Firestore collections whose name match `this.collectionName`; return their documents
    const requestedRecords = [];

    const queue = [
      {
        lastParent: '',
        collections: this.firestore.database,
      },
    ];

    while (queue.length > 0) {
      // Get a collection
      const { lastParent, collections } = queue.shift();

      Object.entries(collections).forEach(([collectionPath, docs]) => {
        const prefix = lastParent ? `${lastParent}/` : '';

        const newLastParent = `${prefix}${collectionPath}`;
        const lastPathComponent = collectionPath.split('/').pop();

        // If this is a matching collection, grep its documents
        if (lastPathComponent === this.collectionName) {
          const docHashes = docs.map(doc => {
            // Fetch the document from the mock db
            const path = `${newLastParent}/${doc.id}`;
            return {
              ...doc,
              _ref: this.firestore._doc(path),
            };
          });
          requestedRecords.push(...docHashes);
        }

        // Enqueue adjacent collections for next run
        docs.forEach(doc => {
          if (doc._collections) {
            queue.push({
              lastParent: `${prefix}${collectionPath}/${doc.id}`,
              collections: doc._collections,
            });
          }
        });
      });
    }

    // Return the requested documents
    const isFilteringEnabled = this.firestore.options.simulateQueryFilters;
    return buildQuerySnapShot(requestedRecords, isFilteringEnabled ? this.filters : undefined);
  }

  where(key, comp, value) {
    const result = mockWhere(...arguments);
    if (result) {
      return result;
    }

    // Firestore has been tested to throw an error at this point when trying to compare null as a quantity
    if (value === null && !['==', '!='].includes(comp)) {
      throw new Error(
        `FakeFirebaseError: Invalid query. Null only supports '==' and '!=' comparisons.`,
      );
    }
    this.filters.push({ key, comp, value });
    return result || this;
  }

  offset() {
    return mockOffset(...arguments) || this;
  }

  limit() {
    return mockLimit(...arguments) || this;
  }

  orderBy() {
    return mockOrderBy(...arguments) || this;
  }

  startAfter() {
    return mockStartAfter(...arguments) || this;
  }

  startAt() {
    return mockStartAt(...arguments) || this;
  }

  withConverter() {
    return mockWithConverter(...arguments) || this;
  }

  onSnapshot() {
    mockQueryOnSnapshot(...arguments);
    const [callback, errorCallback] = arguments;
    try {
      callback(this._get());
    } catch (e) {
      if (errorCallback) {
        errorCallback(e);
      } else {
        throw e;
      }
    }

    // Returns an unsubscribe function
    return () => {};
  }
}

module.exports = {
  Query,
  mocks: {
    mockGet,
    mockWhere,
    mockLimit,
    mockOrderBy,
    mockOffset,
    mockStartAfter,
    mockStartAt,
    mockQueryOnSnapshot,
    mockWithConverter,
  },
};
