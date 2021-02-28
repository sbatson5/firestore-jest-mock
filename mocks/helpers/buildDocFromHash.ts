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
  get(fieldPath: string): unknown;
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
    data(): FakeFirestoreDocumentData | undefined {
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
    get(fieldPath: string): unknown {
      // The field path can be compound: from the firestore docs
      //  fieldPath The path (e.g. 'foo' or 'foo.bar') to a specific field.
      const parts = fieldPath.split('.');
      const data = this.data();

      return parts.reduce((acc, part) => {
        if (acc === undefined) {
          /**
           * See https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentSnapshot#get
           *  "Returns `undefined` if the document or field doesn't exist."
           * 
           * We only get `undefined` here if the previous iteration (or the initial `data()`
           * call) returned `undefined`.
           */
          return undefined;
        }

        // return a value, another object, or `undefined`
        return acc[part] as Record<string, unknown> | undefined;
      }, data);
    },
  };
}
