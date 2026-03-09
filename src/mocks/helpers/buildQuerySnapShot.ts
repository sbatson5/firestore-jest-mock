import buildDocFromHash, { DocumentSnapshot } from './buildDocFromHash';

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Comparator = '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in' | 'not-in' | 'array-contains-any';

export interface QueryFilter {
  key: string;
  comp: Comparator;
  value: any;
}

export interface QuerySnapshot {
  empty: boolean;
  size: number;
  docs: DocumentSnapshot[];
  forEach(callback: (doc: DocumentSnapshot) => void): void;
  docChanges(): any[];
}

export default function buildQuerySnapShot(
  requestedRecords: any[],
  filters?: QueryFilter[],
  selectFields?: string[],
): QuerySnapshot {
  const definiteRecords = requestedRecords.filter(rec => !!rec);
  const results = _filteredDocuments(definiteRecords, filters);
  const docs = results.map(doc => buildDocFromHash(doc, 'abc123', selectFields));

  return {
    empty: results.length < 1,
    size: results.length,
    docs,
    forEach(callback: (doc: DocumentSnapshot) => void) {
      docs.forEach(callback);
    },
    docChanges() {
      return [];
    },
  };
}

function _filteredDocuments(records: any[], filters?: QueryFilter[]): any[] {
  if (!filters || !Array.isArray(filters) || filters.length === 0) {
    return records;
  }

  filters.forEach(({ key, comp, value }) => {
    switch (comp) {
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

function _recordsWithKey(records: any[], key: string): any[] {
  return records.filter(record => record && getValueByPath(record, key) !== undefined);
}

function _recordsWithNonNullKey(records: any[], key: string): any[] {
  return records.filter(
    record =>
      record && getValueByPath(record, key) !== undefined && getValueByPath(record, key) !== null,
  );
}

function _shouldCompareNumerically(a: any, b: any): boolean {
  return typeof a === 'number' && typeof b === 'number';
}

function _shouldCompareTimestamp(a: any, b: any): boolean {
  return (
    typeof a === 'object' && a !== null && typeof a.toMillis === 'function' && b instanceof Date
  );
}

function _recordsLessThanValue(records: any[], key: string, value: any): any[] {
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

function _recordsLessThanOrEqualToValue(records: any[], key: string, value: any): any[] {
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

function _recordsEqualToValue(records: any[], key: string, value: any): any[] {
  return _recordsWithKey(records, key).filter(record => {
    const recordValue = getValueByPath(record, key);
    if (_shouldCompareTimestamp(recordValue, value)) {
      return recordValue.toMillis() === value.getTime();
    }
    return String(recordValue) === String(value);
  });
}

function _recordsNotEqualToValue(records: any[], key: string, value: any): any[] {
  return _recordsWithKey(records, key).filter(record => {
    const recordValue = getValueByPath(record, key);
    if (_shouldCompareTimestamp(recordValue, value)) {
      return recordValue.toMillis() !== value.getTime();
    }
    return String(recordValue) !== String(value);
  });
}

function _recordsGreaterThanOrEqualToValue(records: any[], key: string, value: any): any[] {
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

function _recordsGreaterThanValue(records: any[], key: string, value: any): any[] {
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

function _recordsArrayContainsValue(records: any[], key: string, value: any): any[] {
  return records.filter(
    record =>
      record &&
      getValueByPath(record, key) &&
      Array.isArray(getValueByPath(record, key)) &&
      getValueByPath(record, key).includes(value),
  );
}

function _recordsWithValueInList(records: any[], key: string, value: any): any[] {
  return records.filter(record => {
    if (!record || getValueByPath(record, key) === undefined) {
      return false;
    }
    return value && Array.isArray(value) && value.includes(getValueByPath(record, key));
  });
}

function _recordsWithValueNotInList(records: any[], key: string, value: any): any[] {
  return _recordsWithKey(records, key).filter(
    record => value && Array.isArray(value) && !value.includes(getValueByPath(record, key)),
  );
}

function _recordsWithOneOfValues(records: any[], key: string, value: any): any[] {
  return records.filter(
    record =>
      record &&
      getValueByPath(record, key) &&
      Array.isArray(getValueByPath(record, key)) &&
      value &&
      Array.isArray(value) &&
      getValueByPath(record, key).some((v: any) => value.includes(v)),
  );
}

function getValueByPath(record: any, path: string): any {
  const keys = path.split('.');
  return keys.reduce((nestedObject: any = {}, key: string) => nestedObject[key], record);
}

/* eslint-enable @typescript-eslint/no-explicit-any */
