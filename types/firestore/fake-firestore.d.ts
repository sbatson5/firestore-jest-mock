import { MockDatabase } from 'types';
import { FakeFirestoreDatabase } from './database/fake-database';
import { FakeCollectionRef, FakeQuerySnapshot, FakeQuery } from './collection';
import { FakeDocRef, FakeDocSnapshot } from './doc';
import { FakeFieldValue } from './field-value';
import { FakeTimestamp } from './timestamp';
import { FakeFieldPath } from './field-path';
/** A Fake class to replaces firestore object */
export declare class FakeFirestore {
    /** The fake database instance */
    database: FakeFirestoreDatabase;
    constructor(stubbedDatabase?: MockDatabase);
    /** Implementation for firestore.setting() */
    settings(...settings: any[]): void;
    /**
     * Gets a `FakeCollectionRef` instance that refers to the collection at the specified path.
     * @param collectionPath A slash-separated path to a collection.
     * @return The `FakeCollectionRef` instance.
     */
    collection(collectionPath: string): FakeCollectionRef;
    /**
     * Gets a `FakeDocRef` instance that refers to the document at the specified path.
     * @param documentPath A slash-separated path to a document.
     * @return The `FakeDocRef` instance.
     */
    doc(documentPath: string): FakeDocRef;
    /**
     * Fetches the root collections that are associated with this Firestore fake database.
     * @returns A Promise that resolves with an array of FakeCollectionRef.
     */
    listCollections(): Promise<FakeCollectionRef[]>;
    /** Implementation for firestore.terminate() */
    terminate(): Promise<void>;
}
export declare const FakeFirestoreModuleRefs: {
    CollectionReference: typeof FakeCollectionRef;
    DocumentReference: typeof FakeDocRef;
    QuerySnapshot: typeof FakeQuerySnapshot;
    Query: typeof FakeQuery;
    DocumentSnapshot: typeof FakeDocSnapshot;
    QueryDocumentSnapshot: typeof FakeDocSnapshot;
    FieldValue: typeof FakeFieldValue;
    Timestamp: typeof FakeTimestamp;
    FieldPath: typeof FakeFieldPath;
    Firestore: typeof FakeFirestore;
};
