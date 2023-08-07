const buildDocFromHash = require('./buildDocFromHash');

module.exports = function buildQuerySnapShot(
  requestedRecords,
  filters,
  selectFields,
  limit,
  orderBy,
  orderDirection,
  cursor,
  inclusive,
) {
  const definiteRecords = requestedRecords.filter(rec => !!rec);
  const orderedRecords = orderBy
    ? _orderedDocuments(definiteRecords, orderBy, orderDirection)
    : definiteRecords;
  const cursoredRecords = cursor
    ? _cursoredDocuments(orderedRecords, cursor, orderBy, inclusive)
    : orderedRecords;
  const filteredRecords = _filteredDocuments(cursoredRecords, filters);
  const results = _limitDocuments(filteredRecords, limit);
  const docs = results.map(doc => buildDocFromHash(doc, 'abc123', selectFields));

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
  return records.filter(record => record && getValueByPath(record, key) !== undefined);
}

function _recordsWithNonNullKey(records, key) {
  return records.filter(
    record =>
      record && getValueByPath(record, key) !== undefined && getValueByPath(record, key) !== null,
  );
}

function _shouldCompareNumerically(a, b) {
  return typeof a === 'number' && typeof b === 'number';
}

function _shouldCompareStrings(a, b) {
  return typeof a === 'string' && typeof b === 'string';
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
    const recordValue = getValueByPath(record, key);
    if (_shouldCompareNumerically(recordValue, value)) {
      return recordValue < value;
    }
    if (_shouldCompareTimestamp(recordValue, value)) {
      return recordValue.toMillis() < value;
    }
    return String(recordValue) < String(value);
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
    const recordValue = getValueByPath(record, key);
    if (_shouldCompareNumerically(recordValue, value)) {
      return recordValue <= value;
    }
    if (_shouldCompareTimestamp(recordValue, value)) {
      return recordValue.toMillis() <= value;
    }
    return String(recordValue) <= String(value);
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
    const recordValue = getValueByPath(record, key);
    if (_shouldCompareTimestamp(recordValue, value)) {
      //NOTE: for equality, we must compare numbers!
      return recordValue.toMillis() === value.getTime();
    }
    return String(recordValue) === String(value);
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
    const recordValue = getValueByPath(record, key);
    if (_shouldCompareTimestamp(recordValue, value)) {
      //NOTE: for equality, we must compare numbers!
      return recordValue.toMillis() !== value.getTime();
    }
    return String(recordValue) !== String(value);
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
    const recordValue = getValueByPath(record, key);
    if (_shouldCompareNumerically(recordValue, value)) {
      return recordValue >= value;
    }
    if (_shouldCompareTimestamp(recordValue, value)) {
      return recordValue.toMillis() >= value;
    }
    return String(recordValue) >= String(value);
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
    const recordValue = getValueByPath(record, key);
    if (_shouldCompareNumerically(recordValue, value)) {
      return recordValue > value;
    }
    if (_shouldCompareTimestamp(recordValue, value)) {
      return recordValue.toMillis() > value;
    }
    return String(recordValue) > String(value);
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
    record =>
      record &&
      getValueByPath(record, key) &&
      Array.isArray(getValueByPath(record, key)) &&
      getValueByPath(record, key).includes(value),
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
    if (!record || getValueByPath(record, key) === undefined) {
      return false;
    }
    return value && Array.isArray(value) && value.includes(getValueByPath(record, key));
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
    record => value && Array.isArray(value) && !value.includes(getValueByPath(record, key)),
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
      getValueByPath(record, key) &&
      Array.isArray(getValueByPath(record, key)) &&
      value &&
      Array.isArray(value) &&
      getValueByPath(record, key).some(v => value.includes(v)),
  );
}

/**
 * Orders an array of mock document data by a specified field.
 *
 * @param {Array<DocumentHash>} records The array of records to order.
 * @param {string} orderBy The field to order the records after.
 * @param {'asc' | 'desc'} direction The direction to order the records. Deafault `'asc'`.
 *
 * @returns {Array<import('./buildDocFromHash').DocumentHash>} The ordered documents.
 */
function _orderedDocuments(records, orderBy, direction = 'asc') {
  const ordered = [
    ...records.filter(record => {
      // When using the orderBy query, we must filter away the documents that do not have the order-by field defined.
      const value = getValueByPath(record, orderBy);
      return value !== null && typeof value !== 'undefined';
    }),
  ].sort((a, b) => {
    const aVal = getValueByPath(a, orderBy);
    const bVal = getValueByPath(b, orderBy);
    if (!aVal || !bVal) {
      return 0;
    }
    if (_shouldCompareNumerically(aVal, bVal)) {
      return aVal - bVal;
    }
    if (_shouldCompareStrings(aVal, bVal)) {
      return aVal.localeCompare(bVal);
    }

    const cmpTimestamps =
      typeof aVal === 'object' &&
      typeof bVal === 'object' &&
      aVal !== null &&
      bVal !== null &&
      typeof aVal.toMillis === 'function' &&
      typeof bVal.toMillis === 'function';
    if (cmpTimestamps) {
      return aVal.toMillis() - bVal.toMillis();
    }
    return 0;
  });

  return direction === 'asc' ? ordered : ordered.reverse();
}

/**
 * Returns a subsection of records, starting from a cursor, set to a field value.
 *
 * @param {Array<DocumentHash>} records The array of records to get a subsection of. The array should be ordered by the same field specified in the `orderBy` parameter.
 * @param {unknown} cursor The cursor. Either a field value or a document snapshot.
 * @param {string} orderBy The field the records are ordered by.
 * @param {boolean} inclusive Should the record at the cursor be included.
 *
 * @returns {Array<import('./buildDocFromHash').DocumentHash>} The subsection of documents, starting at the `cursor`.
 */
function _cursoredDocuments(records, cursor, orderBy, inclusive) {
  if (_isSnapshot(cursor)) {
    // Place the cursor at a document, based on a snapshot.
    const cursorIndex = records.findIndex(record => record.id === cursor.id);
    if (cursorIndex < 0) {
      return [];
    }
    return records.slice(cursorIndex + (inclusive ? 0 : 1));
  } else {
    // Place the cursor at a field, based on a value.
    const cmpAt = (a, b) => a >= b;
    const cmpAfter = (a, b) => a > b;

    const cmp = inclusive ? cmpAt : cmpAfter;
    return records.filter(record => {
      const v = getValueByPath(record, orderBy);
      if (_shouldCompareNumerically(v, cursor)) {
        return cmp(v, cursor);
      }
      if (_shouldCompareTimestamp(v, cursor)) {
        return cmp(v.toMillis(), cursor.getTime());
      }
      if (typeof v.toMillis === 'function' && typeof cursor.toMillis === 'function') {
        return cmp(v.toMillis(), cursor.toMillis());
      }
      if (_shouldCompareStrings(v, cursor)) {
        return v.localeCompare(cursor);
      }
      // TODO: Compare other values as well.
      return true;
    });
  }
}

function _limitDocuments(records, limit) {
  return records.slice(0, limit);
}

function _isSnapshot(data) {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.ref === 'object' &&
    typeof data.ref.firestore === 'object' &&
    typeof data.id === 'string'
  );
}

function getValueByPath(record, path) {
  const keys = path.split('.');
  return keys.reduce((nestedObject = {}, key) => nestedObject[key], record);
}
