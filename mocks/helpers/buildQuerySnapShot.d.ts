import type { MockedDocument, DocumentHash } from './buildDocFromHash';

type Comparator = '<' | '<=' | '==' | '>=' | '>' | 'array-contains' | 'in' | 'array-contains-any';

interface QueryFilter {
  key: string;
  comp: Comparator;
  value: string;
}

interface MockedQuerySnapshot<Doc = MockedDocument> {
  empty: boolean;
  size: number;
  docs: Array<Doc>;
  forEach(callbackfn: (value: Doc, index: number, array: Array<Doc>) => void): void;
  docChanges(): Array<never>;
}

/**
 * Builds a query result from the given array of record objects.
 *
 * @param requestedRecords
 * @param filters
 */
declare function buildQuerySnapShot(
  requestedRecords: Array<DocumentHash>,
  filters?: Array<QueryFilter>
): MockedQuerySnapshot;

// Export in the way that Node require() expects
declare module 'buildQuerySnapShot' {
  export { Comparator, QueryFilter, MockedQuerySnapshot };
  export = buildQuerySnapShot;
}
