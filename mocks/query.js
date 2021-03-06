const buildQuerySnapShot = require('./helpers/buildQuerySnapShot');

const mockGet = jest.fn();
const mockWhere = jest.fn();
const mockLimit = jest.fn();
const mockOrderBy = jest.fn();
const mockOffset = jest.fn();
const mockStartAfter = jest.fn();
const mockStartAt = jest.fn();
const mockQueryOnSnapshot = jest.fn();

class Query {
  constructor(collectionName, firestore, isGroupQuery = false) {
    this.collectionName = collectionName;
    this.firestore = firestore;
    this.filters = [];
    this.isGroupQuery = isGroupQuery;
  }

  get() {
    mockGet(...arguments);

    // Use BFS to find all records in collections that match collectionName
    const requestedRecords = [];

    const queue = [['', this.firestore.database]];

    while (queue.length > 0) {
      const node = queue.shift();

      let lastParent = node[0];
      Object.entries(node[1]).forEach(([collectionPath, docs]) => {
        const prefix = node[0] ? `${node[0]}/` : '';
        lastParent = `${prefix}${collectionPath}`;
        const lastPathComponent = collectionPath.split('/').pop();
        if (lastPathComponent === this.collectionName) {
          const docHashes = docs.map(doc => {
            // Construct the document's path
            const path = `${lastParent}/${doc.id}`;
            return {
              ...doc,
              _ref: this.firestore.doc(path),
            };
          });
          requestedRecords.push(...docHashes);
        }
        // Enqueue adjacent nodes
        docs.forEach(doc => {
          if (doc._collections) {
            queue.push([`${prefix}${collectionPath}/${doc.id}`, doc._collections]);
          }
        });
      });
    }

    return Promise.resolve(buildQuerySnapShot(requestedRecords, this.filters));
  }

  where(key, comp, value) {
    this.filters.push({ key, comp, value });
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
  },
};
