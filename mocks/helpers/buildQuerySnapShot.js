const buildDocFromHash = require('./buildDocFromHash');

module.exports = function buildQuerySnapShot(requestedRecords, filters) {
  let results = requestedRecords.filter(rec => !!rec);
  if (filters && Array.isArray(filters) && filters.length > 0) {
    // Apply filters
    filters.forEach(({ key, comp, value }) => {
      // comp is '<' | '<=' | '==' | '>=' | '>' | 'array-contains'
      // TODO: Add tests and docs for each of these
      switch (comp) {
        case '<':
          results = results.filter(record => record && record[key] < value);
          break;
        case '<=':
          results = results.filter(record => record && record[key] <= value);
          break;
        case '==':
          results = results.filter(record => record && record[key] === value);
          break;
        case '>=':
          results = results.filter(record => record && record[key] >= value);
          break;
        case '>':
          results = results.filter(record => record && record[key] > value);
          break;
        case 'array-contains':
          results = results.filter(record => record && record[key] && record[key].includes(value));
          break;
      }
    });
  }
  const docs = results.map(buildDocFromHash);

  return {
    empty: results.length < 1,
    size: results.length,
    docs,
    forEach(callback) {
      return docs.forEach(callback);
    },
  };
};
