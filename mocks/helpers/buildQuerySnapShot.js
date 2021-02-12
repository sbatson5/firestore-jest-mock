const buildDocFromHash = require('./buildDocFromHash');

/**
 * Builds a query result from the given array of record objects.
 *
 * @param {*[]} requestedRecords
 */
module.exports = function buildQuerySnapShot(requestedRecords) {
  const multipleRecords = requestedRecords.filter(rec => !!rec);
  const docs = multipleRecords.map(buildDocFromHash);

  return {
    empty: multipleRecords.length < 1,
    size: multipleRecords.length,
    docs,
    forEach(callback) {
      docs.forEach(callback);
    },
    docChanges() {
      return {
        forEach(callback) {
          // eslint-disable-next-line no-console
          console.info('Firestore jest mock does not currently support tracking changes');
          callback();
        },
      };
    },
  };
};
