const buildDocFromHash = require('./buildDocFromHash');

module.exports = function buildQuerySnapShot(requestedRecords, filters) {
  let results = requestedRecords.filter(rec => !!rec);

  if (filters && Array.isArray(filters) && filters.length > 0) {
    // Apply filters
    filters.forEach(({ key, comp, value }) => {
      // https://firebase.google.com/docs/reference/js/firebase.firestore#wherefilterop
      // Convert values to string to make Array comparisons work
      // See https://jsbin.com/bibawaf/edit?js,console
      // TODO: Experiment, figure out how Firestore reacts to `null` and other weird values

      switch (comp) {
        // https://firebase.google.com/docs/firestore/query-data/queries#query_operators
        case '<':
          results = results.filter(record => {
            if (!record || record[key] === undefined) {
              return false;
            }
            return String(record[key]) < String(value);
          });
          break;
        case '<=':
          results = results.filter(record => {
            if (!record || record[key] === undefined) {
              return false;
            }
            // Possibly useful
            // if (typeof record[key] === 'number' && typeof value === 'number') {
            //   return record[key] <= value;
            // }
            // if (typeof record[key] === 'string' && typeof value === 'string') {
            //   const comparison = record[key].localeCompare(value);
            //   return comparison <= 0;
            // }
            return String(record[key]) <= String(value);
          });
          break;
        case '==':
          results = results.filter(record => {
            if (!record || record[key] === undefined) {
              return false;
            }
            return String(record[key]) === String(value);
          });
          break;
        case '>=':
          results = results.filter(record => {
            if (!record || record[key] === undefined) {
              return false;
            }
            return String(record[key]) >= String(value);
          });
          break;
        case '>':
          results = results.filter(record => {
            if (!record || record[key] === undefined) {
              return false;
            }
            return String(record[key]) > String(value);
          });
          break;

        // https://firebase.google.com/docs/firestore/query-data/queries#array_membership
        case 'array-contains':
          results = results.filter(
            record =>
              record && record[key] && Array.isArray(record[key]) && record[key].includes(value),
          );
          break;

        // https://firebase.google.com/docs/firestore/query-data/queries#in_and_array-contains-any
        // TODO: Throw an error when a value is passed that contains more than 10 values
        case 'in':
          results = results.filter(record => {
            if (!record || record[key] === undefined) {
              return false;
            }
            return value && Array.isArray(value) && value.includes(record[key]);
          });
          break;

        case 'array-contains-any':
          results = results.filter(
            record =>
              record &&
              record[key] &&
              Array.isArray(record[key]) &&
              value &&
              Array.isArray(value) &&
              record[key].some(v => value.includes(v)),
          );
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
      docs.forEach(callback);
    },
    docChanges() {
      return [];
    },
  };
};
