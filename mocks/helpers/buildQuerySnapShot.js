const buildDocFromHash = require('./buildDocFromHash');

/**
 * @typedef Filter
 *
 * @property {String} key
 * @property {'<'|'<='|'=='|'>='|'>'|'array-contains'|'in'|'array-contains-any'} comp
 * @property {String} value
 */

/**
 * Builds a query result from the given array of record objects.
 *
 * @param {*[]} requestedRecords
 * @param {Filter[]} filters
 */
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
            if (!record || (!record[key] && record[key] !== 0)) {
              return false;
            }
            return String(record[key]) < String(value);
          });
          break;
        case '<=':
          results = results.filter(record => {
            if (!record || (!record[key] && record[key] !== 0)) {
              return false;
            }
            return String(record[key]) <= String(value);
          });
          break;
        case '==':
          results = results.filter(record => {
            if (!record || (!record[key] && record[key] !== 0)) {
              return false;
            }
            return String(record[key]) === String(value);
          });
          break;
        case '>=':
          results = results.filter(record => {
            if (!record || (!record[key] && record[key] !== 0)) {
              return false;
            }
            return String(record[key]) >= String(value);
          });
          break;
        case '>':
          results = results.filter(record => {
            if (!record || (!record[key] && record[key] !== 0)) {
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
            if (!record || (!record[key] && record[key] !== 0)) {
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
