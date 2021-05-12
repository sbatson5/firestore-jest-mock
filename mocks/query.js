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
  constructor(collectionName, firestore) {
    this.collectionName = collectionName;
    this.firestore = firestore;
  }

  get() {
    mockGet(...arguments);
    // Use DFS to find all records in collections that match collectionName
    const requestedRecords = [];

    const st = [this.firestore.database];
    // At each collection list node, get collection in collection list whose id
    // matches this.collectionName
    while (st.length > 0) {
      const subcollections = st.pop();
      const documents = subcollections[this.collectionName];
      if (documents && Array.isArray(documents)) {
        requestedRecords.push(...documents);
      }

      // For each collection in subcollections, get each document's _collections array
      // and push onto st.
      Object.values(subcollections).forEach(collection => {
        const documents = collection.filter(d => !!d._collections);
        st.push(...documents.map(d => d._collections));
      });
    }

    // Make sure we have a 'good enough' document reference
    requestedRecords.forEach(rec => {
      rec._ref = this.firestore.doc('database/'.concat(rec.id));
    });
    return Promise.resolve(buildQuerySnapShot(requestedRecords));
  }

  where() {
    return mockWhere(...arguments) || this;
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
      this.get().then(result => {
        callback(result);
      });
    } catch (e) {
      errorCallback(e);
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
