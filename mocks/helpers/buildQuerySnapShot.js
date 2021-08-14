const buildDocFromHash = require('./buildDocFromHash');

module.exports = function buildQuerySnapShot(requestedRecords, filters) {
  const definiteRecords = requestedRecords.filter(rec => !!rec);
  const results = _filteredDocuments(definiteRecords, filters);
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

/**
 * @typedef DocumentHash
 * @type {import('./buildDocFromHash').DocumentHash}
 */

/**
 * @typedef Comparator
 * @type {import('./buildQuerySnapShot').Comparator}
 */

/**
 * Applies query filters to an array of mock document data.
 *
 * @param {Array<DocumentHash>} records The array of records to filter.
 * @param {Array<{ key: string; comp: Comparator; value: unknown }>=} filters The filters to apply.
 * If no filters are provided, then the records array is returned as-is.
 *
 * @returns {Array<import('./buildDocFromHash').DocumentHash>} The filtered documents.
 */
function _filteredDocuments(records, filters) {
  if (!filters || !Array.isArray(filters) || filters.length === 0) {
    return records;
  }

  filters.forEach(({ key, comp, value }) => {
    // https://firebase.google.com/docs/reference/js/firebase.firestore#wherefilterop
    // Convert values to string to make Array comparisons work
    // See https://jsbin.com/bibawaf/edit?js,console

    switch (comp) {
      // https://firebase.google.com/docs/firestore/query-data/queries#query_operators
      case '<':
        records = _recordsLessThanValue(records, key, value);
        break;

      case '<=':
        records = _recordsLessThanOrEqualToValue(records, key, value);
        break;

      case '==':
        records = _recordsEqualToValue(records, key, value);
        break;

      case '!=':
        records = _recordsNotEqualToValue(records, key, value);
        break;

      case '>=':
        records = _recordsGreaterThanOrEqualToValue(records, key, value);
        break;

      case '>':
        records = _recordsGreaterThanValue(records, key, value);
        break;

      case 'array-contains':
        records = _recordsArrayContainsValue(records, key, value);
        break;

      case 'in':
        records = _recordsWithValueInList(records, key, value);
        break;

      case 'not-in':
        records = _recordsWithValueNotInList(records, key, value);
        break;

      case 'array-contains-any':
        records = _recordsWithOneOfValues(records, key, value);
        break;
    }
  });

  return records;
}

function _recordsWithKey(records, key) {
  return records.filter(record => record && record[key] !== undefined);
}

function _recordsWithNonNullKey(records, key) {
  return records.filter(record => record && record[key] !== undefined && record[key] !== null);
}

function _shouldCompareNumerically(a, b) {
  return typeof a === 'number' && typeof b === 'number';
}

function _shouldCompareTimestamp(a, b) {
  //We check whether toMillis method exists to support both Timestamp mock and Firestore Timestamp object
  //B is expected to be Date, not Timestamp, just like Firestore does
  return (
    typeof a === 'object' && a !== null && typeof a.toMillis === 'function' && b instanceof Date
  );
}

/**
 * @param {Array<DocumentHash>} records
 * @param {string} key
 * @param {unknown} value
 * @returns {Array<DocumentHash>}
 */
function _recordsLessThanValue(records, key, value) {
  return _recordsWithNonNullKey(records, key).filter(record => {
    if (_shouldCompareNumerically(record[key], value)) {
      return record[key] < value;
    }
    if (_shouldCompareTimestamp(record[key], value)) {
      return record[key].toMillis() < value;
    }
    return String(record[key]) < String(value);
  });
}

/**
 * @param {Array<DocumentHash>} records
 * @param {string} key
 * @param {unknown} value
 * @returns {Array<DocumentHash>}
 */
function _recordsLessThanOrEqualToValue(records, key, value) {
  return _recordsWithNonNullKey(records, key).filter(record => {
    if (_shouldCompareNumerically(record[key], value)) {
      return record[key] <= value;
    }
    if (_shouldCompareTimestamp(record[key], value)) {
      return record[key].toMillis() <= value;
    }
    return String(record[key]) <= String(value);
  });
}

/**
 * @param {Array<DocumentHash>} records
 * @param {string} key
 * @param {unknown} value
 * @returns {Array<DocumentHash>}
 */
function _recordsEqualToValue(records, key, value) {
  return _recordsWithKey(records, key).filter(record => {
    if (_shouldCompareTimestamp(record[key], value)) {
      //NOTE: for equality, we must compare numbers!
      return record[key].toMillis() === value.getTime();
    }
    return String(record[key]) === String(value);
  });
}

/**
 * @param {Array<DocumentHash>} records
 * @param {string} key
 * @param {unknown} value
 * @returns {Array<DocumentHash>}
 */
function _recordsNotEqualToValue(records, key, value) {
  return _recordsWithKey(records, key).filter(record => {
    if (_shouldCompareTimestamp(record[key], value)) {
      //NOTE: for equality, we must compare numbers!
      return record[key].toMillis() !== value.getTime();
    }
    return String(record[key]) !== String(value);
  });
}

/**
 * @param {Array<DocumentHash>} records
 * @param {string} key
 * @param {unknown} value
 * @returns {Array<DocumentHash>}
 */
function _recordsGreaterThanOrEqualToValue(records, key, value) {
  return _recordsWithNonNullKey(records, key).filter(record => {
    if (_shouldCompareNumerically(record[key], value)) {
      return record[key] >= value;
    }
    if (_shouldCompareTimestamp(record[key], value)) {
      return record[key].toMillis() >= value;
    }
    return String(record[key]) >= String(value);
  });
}

/**
 * @param {Array<DocumentHash>} records
 * @param {string} key
 * @param {unknown} value
 * @returns {Array<DocumentHash>}
 */
function _recordsGreaterThanValue(records, key, value) {
  return _recordsWithNonNullKey(records, key).filter(record => {
    if (_shouldCompareNumerically(record[key], value)) {
      return record[key] > value;
    }
    if (_shouldCompareTimestamp(record[key], value)) {
      return record[key].toMillis() > value;
    }
    return String(record[key]) > String(value);
  });
}

/**
 * @see https://firebase.google.com/docs/firestore/query-data/queries#array_membership
 *
 * @param {Array<DocumentHash>} records
 * @param {string} key
 * @param {unknown} value
 * @returns {Array<DocumentHash>}
 */
function _recordsArrayContainsValue(records, key, value) {
  return records.filter(
    record => record && record[key] && Array.isArray(record[key]) && record[key].includes(value),
  );
}

/**
 * @see https://firebase.google.com/docs/firestore/query-data/queries#in_not-in_and_array-contains-any
 *
 * @param {Array<DocumentHash>} records
 * @param {string} key
 * @param {unknown} value
 * @returns {Array<DocumentHash>}
 */
function _recordsWithValueInList(records, key, value) {
  // TODO: Throw an error when a value is passed that contains more than 10 values
  return records.filter(record => {
    if (!record || record[key] === undefined) {
      return false;
    }
    return value && Array.isArray(value) && value.includes(record[key]);
  });
}

/**
 * @see https://firebase.google.com/docs/firestore/query-data/queries#not-in
 *
 * @param {Array<DocumentHash>} records
 * @param {string} key
 * @param {unknown} value
 * @returns {Array<DocumentHash>}
 */
function _recordsWithValueNotInList(records, key, value) {
  // TODO: Throw an error when a value is passed that contains more than 10 values
  return _recordsWithKey(records, key).filter(
    record => value && Array.isArray(value) && !value.includes(record[key]),
  );
}

/**
 * @see https://firebase.google.com/docs/firestore/query-data/queries#in_not-in_and_array-contains-any
 *
 * @param {Array<DocumentHash>} records
 * @param {string} key
 * @param {unknown} value
 * @returns {Array<DocumentHash>}
 */
function _recordsWithOneOfValues(records, key, value) {
  // TODO: Throw an error when a value is passed that contains more than 10 values
  return records.filter(
    record =>
      record &&
      record[key] &&
      Array.isArray(record[key]) &&
      value &&
      Array.isArray(value) &&
      record[key].some(v => value.includes(v)),
  );
}
