import { MockDatabase } from 'types';
import { FakeFirestoreDatabase } from './database/fake-database';
import { FakeCollectionRef, FakeQuerySnapshot, FakeQuery } from './collection';
import { FakeDocRef, FakeDocSnapshot } from './doc';
import { FakeFieldValue } from './field-value';
import { FakeTimestamp } from './timestamp';
import { FakeFieldPath } from './field-path';
import { jestMocks } from '../jest-fn';

/** A Fake class to replaces firestore object */
export class FakeFirestore {
  /** The fake database instance */
  public database: FakeFirestoreDatabase;

  constructor(stubbedDatabase: MockDatabase = {}) {
    this.database = new FakeFirestoreDatabase(stubbedDatabase);
  }

  /** Implementation for firestore.setting() */
  public settings(...settings: any[]): void {
    jestMocks.firestore.setting(...settings);
  }

  /**
   * Gets a `FakeCollectionRef` instance that refers to the collection at the specified path.
   * @param collectionPath A slash-separated path to a collection.
   * @return The `FakeCollectionRef` instance.
   */
  public collection(collectionPath: string): FakeCollectionRef {
    jestMocks.firestore.collection(collectionPath);
    return new FakeCollectionRef(this, collectionPath);
  }

  /**
   * Gets a `FakeDocRef` instance that refers to the document at the specified path.
   * @param documentPath A slash-separated path to a document.
   * @return The `FakeDocRef` instance.
   */
  public doc(documentPath: string): FakeDocRef {
    jestMocks.firestore.doc(documentPath);
    return new FakeDocRef(this, documentPath);
  }

  // /**
  //  * Creates and returns a new Query that includes all documents in the
  //  * database that are contained in a collection or subcollection with the
  //  * given collectionId.
  //  *
  //  * @param collectionId Identifies the collections to query over. Every
  //  * collection or subcollection with this ID as the last segment of its path
  //  * will be included. Cannot contain a slash.
  //  * @return The created Query.
  //  */
  // public collectionGroup(collectionId: string): FakeQuery {

  //   return new FakeCollectionRef(this, "");
  // }

  // /**
  //  * Retrieves multiple documents from Firestore.
  //  * The first argument is required and must be of type `FakeDocRef`
  //  * followed by any additional `FakeDocRef` documents. If used, the
  //  * optional `ReadOptions` must be the last argument.
  //  * @param documentRefsOrReadOptions The `FakeDocRef` to receive, followed
  //  * by an optional field mask.
  //  * @return A Promise that resolves with an array of resulting fake document
  //  * snapshots.
  //  */
  // public async getAll(
  //   ...documentRefsOrReadOptions: (FakeDocRef | FakeReadOptions)[]
  // ): Promise<FakeDocSnapshot[]> {
  //   const lastPosition = documentRefsOrReadOptions.pop();
  //   if (!is(lastPosition, "object") && !is((lastPosition as FakeReadOptions).fieldMask, "array"))
  //     documentRefsOrReadOptions.push(lastPosition);

  //   const docs: FakeDocRef[] = documentRefsOrReadOptions.concat() as FakeDocRef[];

  //   const docsSnaps = await Promise.all(docs.map(doc => doc.get()))

  //   docsSnaps.map(docSnap => docSnap)
  // }

  /**
   * Fetches the root collections that are associated with this Firestore fake database.
   * @returns A Promise that resolves with an array of FakeCollectionRef.
   */
  public async listCollections(): Promise<FakeCollectionRef[]> {
    jestMocks.firestore.listCollections();
    return this.database
      .listRootCollection()
      .map(collectionName => this.collection(collectionName));
  }

  /** Implementation for firestore.terminate() */
  public async terminate(): Promise<void> {
    jestMocks.firestore.terminate();
  }

  // /**
  //  * Executes the given updateFunction and commits the changes applied within
  //  * the transaction.
  //  *
  //  * You can use the transaction object passed to 'updateFunction' to read and
  //  * modify Firestore documents under lock. Transactions are committed once
  //  * 'updateFunction' resolves and attempted up to five times on failure.
  //  *
  //  * @param updateFunction The function to execute within the transaction
  //  * context.
  //  * @param {object=} transactionOptions Transaction options.
  //  * @param {number=} transactionOptions.maxAttempts The maximum number of
  //  * attempts for this transaction.
  //  * @return If the transaction completed successfully or was explicitly
  //  * aborted (by the updateFunction returning a failed Promise), the Promise
  //  * returned by the updateFunction will be returned here. Else if the
  //  * transaction failed, a rejected Promise with the corresponding failure
  //  * error will be returned.
  //  */
  // runTransaction<T>(
  //   updateFunction: (transaction: Transaction) => Promise<T>,
  //   transactionOptions?: { maxAttempts?: number }
  // ): Promise<T>;

  // /**
  //  * Creates a write batch, used for performing multiple writes as a single
  //  * atomic operation.
  //  */
  // batch(): WriteBatch;
}

export const FakeFirestoreModuleRefs = {
  CollectionReference: FakeCollectionRef,
  DocumentReference: FakeDocRef,
  QuerySnapshot: FakeQuerySnapshot,
  Query: FakeQuery,
  DocumentSnapshot: FakeDocSnapshot,
  QueryDocumentSnapshot: FakeDocSnapshot,
  FieldValue: FakeFieldValue,
  Timestamp: FakeTimestamp,
  FieldPath: FakeFieldPath,
  Firestore: FakeFirestore,
  // WriteBatch: ,
  // WriteResult: ,
  // Transaction: ,
  // DocumentChange: ,
};
