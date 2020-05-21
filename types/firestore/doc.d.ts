import { FakeFirestore } from "./fake-firestore";
import { FakeDocData, FakeSetOptions } from "types";
import { FakeCollectionRef } from "./collection";
import { FakeFieldPath } from "./field-path";
/** FakeDocRef is the equivalent to firestore `DocumentRefernece` */
export declare class FakeDocRef<T = FakeDocData> {
    /** A reference to FakeFirestore */
    private _fakeFirestore;
    /** A string representing the path of the referenced document (relative to the root of the database). */
    path: string;
    /** Sequence of parts of the path */
    private segments;
    /** Parent collection path */
    get parentPath(): string;
    /** The `FakeFirestore` for the Firestore database (useful for performing transactions, etc.). */
    get firestore(): FakeFirestore;
    /** A reference to the Collection to which this FakeDocRef belongs. */
    get parent(): FakeCollectionRef<T>;
    /** The identifier of the collection. */
    get id(): string;
    constructor(
    /** A reference to FakeFirestore */
    _fakeFirestore: FakeFirestore, 
    /** A string representing the path of the referenced document (relative to the root of the database). */
    path: string);
    /**
     * Get a subcollection path of this doc
     * @param collectionId The subcollection id
     * @returns A string representing the subcollection path
     */
    private getCollectionPath;
    /** Firestore Methods **/
    /**
     * Gets a `FakeCollectionRef` instance that refers to the collection at the specified path.
     * @param collectionPath A slash-separated path to a collection.
     * @return The `FakeCollectionRef` instance.
     */
    collection(collectionPath: string): FakeCollectionRef;
    /**
     * Fetches the subcollections that are direct children of this document on fake database.
     * @returns A Promise that resolves with an array of CollectionReferences.
     */
    listCollections(): Promise<FakeCollectionRef[]>;
    /**
     * Creates a document referred to by this `FakeDoc` with the
     * provided object values. The write fails if the document already exists
     * @param data The object data to serialize as the document.
     * @return A Promise resolved with the write time of this create.
     */
    create(data: T): Promise<void>;
    /**
     * Writes to the document referred to by this `DocumentReference`. If the
     * document does not yet exist, it will be created. If you pass
     * `SetOptions`, the provided data can be merged into an existing document.
     * @param data A map of the fields and values for the document.
     * @param options An object to configure the set behavior.
     * @return A Promise resolved with the write time of this set.
     */
    set(data: T, options?: FakeSetOptions): Promise<void>;
    update(data: T): Promise<void>;
    update(field: string | FakeFieldPath, value: any, ...moreFieldsOrPrecondition: any[]): Promise<void>;
    private updateDocWithField;
    /**
     * Deletes the document referred to by this `FakeDocRef`.
     * @return A Promise resolved with the write time of this delete.
     */
    delete(): Promise<void>;
    /**
     * Reads the document referred to by this `FakeDocRef`.
     * @return A Promise resolved with a FakeDocSnapshot containing the
     * current document data.
     */
    get(): Promise<FakeDocSnapshot>;
}
/** FakeDocSnapshot is the equivalent to firestore `DocumentSnapshot` */
export declare class FakeDocSnapshot<T = FakeDocData> {
    /** Reference of the `FakeDocRef`. */
    ref: FakeDocRef<T>;
    /** Fake doc snapshot data */
    private readonly _data;
    /** True if the document exists. */
    readonly exists: boolean;
    /**  The ID of the document for which this `FakeDocSnapshot` contains data. */
    get id(): string;
    constructor(
    /** Reference of the `FakeDocRef`. */
    ref: FakeDocRef<T>, 
    /** Fake doc snapshot data */
    _data: T);
    /** Gets the snapshot doc data */
    data(): T;
}
