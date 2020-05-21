import { MockDatabase, FakeSetOptions } from "types";
import { CollectionDataRef } from "./collection-data-ref";
import { DocDataRef } from "./doc-data-ref";
export declare class FakeFirestoreDatabase {
    /** The fake database data */
    private mockDatabase;
    /** Data contruncted in this db */
    private data;
    constructor(
    /** The fake database data */
    mockDatabase?: MockDatabase);
    /** List the root collections path */
    listRootCollection(): string[];
    get(path: string, segmentType: "doc"): DocDataRef;
    get(path: string, segmentType: "collection"): CollectionDataRef;
    /**
     * Add data to a collection in fake database
     * @param data The data to be added
     * @param collectionPath The collection path to add the document
     * @param docId The document id
     */
    addData<T = any>(data: T, collectionPath: string, docId: string): void;
    /**
     * Change the data in the specified docPath, if the data don't exists create a new doc
     * @param data The data to be setted in the doc
     * @param docPath The document path
     * @param options Change the set data behavior
     */
    setData<T = any>(data: T, docPath: string, options?: FakeSetOptions): void;
    /**
     * Creates a doc data object
     * @param id The doc id
     * @param data The data within the doc
     * @returns A DocData object
     */
    private createNewDocData;
    /**
     * Creates a the collections and docs in the given `path` on fake database
     * @param path The path to be created
     * @param setDocData If the path leads to a doc set this data in the new object
     * @return A object reference to the DocData or CollectionData
     */
    private createPathInDb;
    /**
     * Delete a doc from a collection
     * @param collectionPath The collection which the doc belongs
     * @param docId The doc id to be deleted
     */
    deleteDoc(collectionPath: string, docId: string): void;
}
