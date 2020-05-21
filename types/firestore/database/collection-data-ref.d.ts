import { CollectionData, DocData, FakeDocData } from "types";
import { DocDataRef } from "./doc-data-ref";
export declare class CollectionDataRef implements CollectionData {
    private _data;
    /** A string representing the path of the referenced collection */
    path: string;
    private _docs;
    /** DocDataRef array of this collection */
    get docs(): DocDataRef[];
    /** The identifier of the collection. */
    get id(): string;
    constructor(_data: CollectionData, 
    /** A string representing the path of the referenced collection */
    path: string);
    /**
     * Creates a document path for this collection
     * @param docId The doc id
     * @returns A string representing the doc path
     */
    docPath(docId: string): string;
    /**
     * Add the doc in the collections doc
     * @param doc The new doc ref
     * @returns The doc data reference
     */
    push(doc: DocDataRef | DocData): DocDataRef;
    /**
     * Search for a doc in the collection data
     * @param docId The doc id to search
     * @returns The doc data reference, if not found undefined
     */
    findDoc(docId: string): DocDataRef;
    /**
     * Create a new subcollection in doc
     * @param docId The new subcollection id
     * @param data Optional data for the new subcollection
     * @param subcollections Optional data for the new subcollection
     * @returns The collection data reference
     */
    private createDoc;
    /**
     * Removes a doc from this collection
     * @param docId The doc id to remove
     */
    deleteDoc(docId: string): void;
    /**
     * Recursive function to get a doc or collection on database
     * @param segments Path segments used to iterate
     * @returns A CollectionDataRef if segments is odd or DocDataRef if it's even
     */
    getDoc(segments: string[]): CollectionDataRef | DocDataRef;
    /**
     * Creates a nested docs and collections with the given segments path
     * @param segments Path parts for the new collection ordoc
     * @param data Optional data for the new doc
     * @returns A CollectionDataRef if segments is odd or DocDataRef if it's even
     */
    createPath(segments: string[], data?: FakeDocData): CollectionDataRef | DocDataRef;
}
