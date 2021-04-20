import type { MockedDocument, DocumentHash } from './buildDocFromHash';

export interface MockedQuerySnapshot<Doc = MockedDocument> {
  empty: boolean;
  size: number;
  docs: Array<Doc>;
  forEach(callbackfn: (value: Doc, index: number, array: Doc[]) => void): void;
  docChanges(): {
    forEach(callbackfn: () => void): void
  };
}

/**
 * Builds a query result from the given array of record objects.
 *
 * @param requestedRecords
 */
export default function buildQuerySnapShot(requestedRecords: Array<DocumentHash>): MockedQuerySnapshot;
