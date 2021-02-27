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
      if (!data) {
        return undefined;
      }
      return parts.reduce((acc, part, index) => {
        const value = acc[part];
        // if no key is found
        if (value === undefined) {
          // return null if we are on the last item in parts
          // otherwise, return an empty object, so we can continue to iterate
          return parts.length - 1 === index ? null : {};
        }

        // if there is a value, return it
        return value;
      }, data);
    },
  };
}
