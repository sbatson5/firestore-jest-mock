import type { _DocumentReference } from 'mocks/firestore';

export interface DocHash extends Omit<DatabaseDocument, 'id'> {
  id?: string;
  _ref: _DocumentReference;
}

export interface SnapshotMetadata {
  fromCache: boolean;
  hasPendingWrites: boolean;
}

export interface DocumentSnapshot {
  exists: boolean;
  id: string;
  metadata: SnapshotMetadata;
  ref: _DocumentReference;
  data(): FakeFirestoreDocumentData | undefined;
}

export default function buildDocFromHash(hash: DocHash, id = 'abc123'): DocumentSnapshot {
  const exists = !!hash || false;
  return {
    exists,
    id: hash.id || id,
    ref: hash._ref,
    metadata: {
      hasPendingWrites: false,
      fromCache: false,
    },
    data() {
      if (!exists) {
        // From Firestore docs: "Returns 'undefined' if the document doesn't exist."
        // See https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentSnapshot#data
        return undefined;
      }
      const copy: FakeFirestoreDocumentData = { ...hash };
      delete copy.id;
      delete copy._collections;
      delete copy._ref;
      return copy;
    },
  };
}
