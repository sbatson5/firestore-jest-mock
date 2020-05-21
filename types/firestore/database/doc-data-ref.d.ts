import { DocData, FakeDocData, FakeSetOptions, MockDatabaseData } from "types";
import { CollectionDataRef } from "./collection-data-ref";
export declare class DocDataRef implements DocData {
    private _docData;
    /** A string representing the path of the referenced document */
    path: string;
    /** The data of the   */
    private _data;
    /** Subcollections linked to this doc */
    private _subcollections;
    /** The doc id */
    get id(): string;
    /** Subcollections linked to this doc */
    get subcollections(): MockDatabaseData;
    /** The data of this doc */
    get data(): FakeDocData;
    set data(data: FakeDocData);
    /** The doc data object of this DocDataRef */
    get docData(): DocData;
    constructor(_docData: DocData, 
    /** A string representing the path of the referenced document */
    path: string);
    /**
     * Get a subcollection of the doc
     * @param collectionName The sub collection name
     * @returns The collection data reference, if not found undefined
     */
    getSubcollection(collectionId: string): CollectionDataRef;
    /**
     * Create a new subcollection in doc
     * @param collectionId The new subcollection id
     * @param data Optional data for the new subcollection
     * @returns The collection data reference
     */
    createSubcollection(collectionId: string, data?: DocData[]): CollectionDataRef;
    /**
     * Creates a collection path for this document
     * @param collectionId The collection id
     * @returns A string representing the collection path
     */
    subcollectionPath(collectionId: string): string;
    /**
     * Create the document data with the new
     * @param newData The new data to be setted
     * @param oldData The old data to be changed
     * @param options The options that change the
     */
    setDataInDocData<T = any>(newData: T, options?: FakeSetOptions): FakeDocData;
    /**
     * Based on the paths set the data iterate throw newData creating the paths in oldData
     * @param paths The paths in new data to iterate throw
     * @param newData The new data object to st in the old data
     * @param oldData The data that was in the doc before set
     * @return the data after setting the new properties
     */
    private mergeData;
    /**
     * Recursively validade objects that are not FakeFieldValues instances to change it's data
     * @param newData The new data obj to iterate throw it's properties
     * @param oldData The old data obj that will have the new data proprties
     * @returns The changed old data object
     */
    private validadeAndSetObj;
    /**
     * Set the passed data in the target object, if data is a FakeFieldValue change based on it's type
     * @param targetObj The target object to add the data
     * @param path The path on the object to be changed
     * @param data The data to be added
     */
    private setDataInPath;
    /**
     * Recursive function to get a doc or collection on database
     * @param segments Path segments used to iterate
     * @returns A CollectionDataRef if segments is odd or DocDataRef if it's even
     */
    getCollection(segments: string[]): CollectionDataRef | DocDataRef;
    /**
     * Creates a nested docs and collections with the given segments path
     * @param segments Path parts for the new collection ordoc
     * @param data Optional data for the new doc
     * @returns A CollectionDataRef if segments is odd or DocDataRef if it's even
     */
    createPath(segments: string[], data?: FakeDocData): DocDataRef | CollectionDataRef;
}
