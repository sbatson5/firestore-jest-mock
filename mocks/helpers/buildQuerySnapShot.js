const buildDocFromHash = require('./buildDocFromHash');

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
      return [];
    },
  };
};
