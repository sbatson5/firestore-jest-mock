import type { Query } from 'mocks/query';
import buildDocFromHash, { DocHash, DocumentSnapshot, SnapshotMetadata } from './buildDocFromHash';

export interface SnapshotListenOptions {
  includeMetadataChanges: boolean;
}

export interface DocumentChange {
  doc: DocumentSnapshot;
  newIndex: number;
  oldIndex: number;
  type: 'added' | 'removed' | 'modified';
}

export interface QuerySnapshot {
  docs: Array<DocumentSnapshot>;
  empty: boolean;
  metadata: SnapshotMetadata;
  query: Query;
  size: number;
  docChanges(options?: SnapshotListenOptions): Array<DocumentChange>;
  forEach(callback: (result: DocumentSnapshot) => void): void;
}

/**
 * Builds a query result from the given array of record objects.
 */
export default function buildQuerySnapShot(requestedRecords: Array<DocHash & { id: string }>, query: Query): QuerySnapshot {
  const multipleRecords = requestedRecords.filter(rec => !!rec);
  const docs = multipleRecords.map(hash => buildDocFromHash(hash, hash.id));

  return {
    query,
    docs,
    metadata: {
      fromCache: false,
      hasPendingWrites: false,
    },
    size: multipleRecords.length,
    empty: multipleRecords.length < 1,
    forEach(callback) {
      docs.forEach(callback);
    },
    docChanges() {
      // eslint-disable-next-line no-console
      console.info('Firestore jest mock does not currently support tracking changes');
      return docs.map((doc, index) => ({
        doc,
        newIndex: index,
        oldIndex: index,
        type: 'added',
      }));
    },
  };
}
