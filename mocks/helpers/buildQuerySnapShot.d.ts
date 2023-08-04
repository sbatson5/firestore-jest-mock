import type { MockedDocument, DocumentHash } from './buildDocFromHash';

export type Comparator = '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in' | 'not-in' | 'array-contains-any';

export interface QueryFilter {
  key: string;
  comp: Comparator;
  value: string;
}

export interface MockedQuerySnapshot<Doc = MockedDocument> {
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
export default function buildQuerySnapShot(
  requestedRecords: Array<DocumentHash>,
  filters?: Array<QueryFilter>,
  selectFields?: string[],
  limit?: number,
  orderBy?: string,
  orderDirection?: 'asc' | 'desc',
  cursor?: unknown,
  inclusive?: boolean,
): MockedQuerySnapshot;
