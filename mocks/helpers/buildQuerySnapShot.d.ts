import type { MockedDocument, DocumentHash } from './buildDocFromHash';

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
 */
export default function buildQuerySnapShot(requestedRecords: Array<DocumentHash>): MockedQuerySnapshot;
