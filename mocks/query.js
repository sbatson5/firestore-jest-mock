/*
 * ============
 *  Queries
 * ============
 */

const buildQuerySnapShot = require('./helpers/buildQuerySnapShot');

const mockWhere = jest.fn();
const mockLimit = jest.fn();
const mockOrderBy = jest.fn();
const mockOffset = jest.fn();
const mockStartAfter = jest.fn();
const mockStartAt = jest.fn();

class Query {
  constructor(collectionName, firestore) {
    this.collectionName = collectionName;
    this.firestore = firestore;
  }

  get() {
    // Return all records in collections matching collectionName (use DFS)
    const requestedRecords = [];
    // requestedRecords.push(...this.firestore.database[this.collectionName]);

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
}

module.exports = {
  Query,
  mocks: {
    mockWhere,
    mockLimit,
    mockOrderBy,
    mockOffset,
    mockStartAfter,
    mockStartAt,
  },
};
