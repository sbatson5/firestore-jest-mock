import { FakeFirestore } from "./fake-firestore";
import { FakeDocRef, FakeDocSnapshot } from "./doc";
import { FakeDocData } from "types";
import { WhereFilterOp, OrderByDirection } from "@google-cloud/firestore";
import { DocDataRef } from "./database/doc-data-ref";
import { FakeFieldPath } from "./field-path";
/** Type of filters that can be applied to a query */
export declare enum FilterType {
    where = "where",
    orderBy = "orderBy",
    startAt = "startAt",
    startAfter = "startAfter",
    endBefore = "endBefore",
    endAt = "endAt",
    limit = "limit",
    select = "select"
}
export interface QueryFilter {
    type: FilterType;
    args: QueryFilterArgTypes;
}
export declare type QueryFilterArgTypes = WhereQueryArgs | OrderByQueryArgs | CursorQueryArgs | LimitQueryArgs | SelectQueryArgs;
export declare type WhereQueryArgs = [string, WhereFilterOp, any];
export declare type OrderByQueryArgs = [string | FakeFieldPath, OrderByDirection];
export declare type CursorQueryArgs = [FakeDocSnapshot | any, ...any[]];
export declare type LimitQueryArgs = [number];
export declare type SelectQueryArgs = [...(string | FakeFieldPath)[]];
export declare type ScliceType = "startAt" | "startAfter" | "endAt" | "endBefore";
export declare class FieldFilter {
    filters: QueryFilter[];
    private filtersOrder;
    constructor();
    /**
     * Filter the collection data based on this class filters
     * @param collectionData The collection data to be filtered
     */
    filterData(collectionData: DocDataRef[]): DocDataRef[];
    /**
     * Add a filter in the filters array
     * @param type The filter type
     * @param args The args of type
     */
    addFilter(type: FilterType, ...args: QueryFilterArgTypes): void;
    /** Sort the filters array */
    private sortFilterArray;
    /**
     * Query where function that filter the collection data
     * @param collectionData The collection data to be filtered
     * @param fieldPath The field path in fake database object
     * @param opStr The firestore where operation for this
     * @param value The value for the comparation
     * @returns The filtered collectionData
     */
    private where;
    /**
     * Get the operation where function
     * @param opStr A string representing the operation of the query
     * @returns A function where the first argument is the fake database data that will
     * be compared with the second argument that is the value passed in the where
     */
    private whereOp;
    /**
     * Sort the collection data based on the fields
     * @param collectionData
     * @param orderByFields
     * @param directionStr
     */
    private orderBy;
    /** Get the the orderBys filters */
    private getOrderBys;
    /**
     * Get a slice of the collection data array
     * @param collectionData Array of DocDataRef
     * @param sliceType The filter slice type
     * @param dataOrDocSnap Data that could be a instance of FakeDocSnapshot or a data to compare
     * @param fieldValues Other values for comparison
     * @returns A array of DocDataRef
     */
    private cursorSlice;
    /**
     * Filter the collection data array including the starting position
     * @param collectionData Array of DocDataRef
     * @param dataOrDocSnap Data that could be a instance of FakeDocSnapshot or a data to compare
     * @param fieldValues Other values for comparison
     * @returns A array of DocDataRef
     */
    private startAt;
    /**
     * Filter the collection data array excluding the starting position
     * @param collectionData Array of DocDataRef
     * @param dataOrDocSnap Data that could be a instance of FakeDocSnapshot or a data to compare
     * @param fieldValues Other values for comparison
     * @returns A array of DocDataRef
     */
    private startAfter;
    /**
     * Filter the collection data array including the ending position
     * @param collectionData Array of DocDataRef
     * @param dataOrDocSnap Data that could be a instance of FakeDocSnapshot or a data to compare
     * @param fieldValues Other values for comparison
     * @returns A array of DocDataRef
     */
    private endAt;
    /**
     * Filter the collection data array excluding the ending position
     * @param collectionData Array of DocDataRef
     * @param dataOrDocSnap Data that could be a instance of FakeDocSnapshot or a data to compare
     * @param fieldValues Other values for comparison
     * @returns A array of DocDataRef
     */
    private endBefore;
    /**
     * Limit filter that slice the data within the limit
     * @param collectionData Array of DocDataRef
     * @param limit The position to include in the return
     */
    private limit;
    /**
     *
     * @param collectionData
     * @param fields
     */
    private select;
}
export declare class FakeQuery<T = FakeDocData> {
    /** A reference to FakeFirestore */
    protected _fakeFirestore: FakeFirestore;
    /** A string representing the path of the referenced collection (relative to the root of the database). */
    path: string;
    private fieldFilter;
    /** The `FakeFirestore` for the Firestore database */
    get firestore(): FakeFirestore;
    constructor(
    /** A reference to FakeFirestore */
    _fakeFirestore: FakeFirestore, 
    /** A string representing the path of the referenced collection (relative to the root of the database). */
    path: string);
    /**
     * Creates and returns a new FakeQuery with the additional filter that documents
     * must contain the specified field and that its value should satisfy the
     * relation constraint provided.
     * @param fieldPath The path to compare
     * @param opStr The operation string (e.g "<", "<=", "==", ">", ">=").
     * @param value The value for comparison
     * @return The created FakeQuery.
     */
    where(fieldPath: string | FakeFieldPath, opStr: WhereFilterOp, value: any): FakeQuery<T>;
    /**
     * Creates and returns a FakeQuery that's additionally sorted by the
     * specified field, optionally in descending order instead of ascending.
     * @param fieldPath The field to sort by.
     * @param directionStr Optional direction to sort by ('asc' or 'desc'). If
     * not specified, order will be ascending.
     * @return The created FakeQuery.
     */
    orderBy(fieldPath: string | FakeFieldPath, directionStr?: OrderByDirection): FakeQuery<T>;
    startAt(docSnap: FakeDocSnapshot): FakeQuery<T>;
    startAt(...fieldValues: any[]): FakeQuery<T>;
    startAfter(docSnap: FakeDocSnapshot): FakeQuery<T>;
    startAfter(...fieldValues: any[]): FakeQuery<T>;
    endBefore(docSnap: FakeDocSnapshot): FakeQuery<T>;
    endBefore(...fieldValues: any[]): FakeQuery<T>;
    endAt(docSnap: FakeDocSnapshot): FakeQuery<T>;
    endAt(...fieldValues: any[]): FakeQuery<T>;
    /**
     * Creates and returns a FakeQuery that's additionally limited to only
     * return up to the specified number of documents.
     * @param limit The maximum number of items to return.
     * @return The created Query.
     */
    limit(limit: number): FakeQuery<T>;
    /**
     * Creates and returns a FakeQuery instance that applies a field mask to
     * the result and returns only the specified subset of fields. You can
     * specify a list of field paths to return.
     * @param fields The field paths to return.
     * @return The created FakeQuery.
     */
    select(...fields: (string | FakeFieldPath)[]): FakeQuery<T>;
    /**
     * Executes the query and returns the results as a `FakeQuerySnapshot`.
     * @return A Promise that will be resolved with the results of the Query.
     */
    get(): Promise<FakeQuerySnapshot>;
}
export declare class FakeCollectionRef<T = FakeDocData> extends FakeQuery<T> {
    /** Sequence of parts of the path */
    private segments;
    /** The identifier of the collection. */
    get id(): string;
    /** Parente doc path, null if the collection is on root */
    get parentPath(): string | null;
    /** A reference to the containing Document if this is a subcollection, else null. */
    get parent(): FakeDocRef | null;
    /** Indicates if the collection is in the root */
    private get isRoot();
    constructor(_fakeFirestore: FakeFirestore, path: string);
    /**
     * Get a formatted document path in this collection
     * @param docId The document Id
     */
    private getDocPath;
    /** Firestore Methods **/
    /** Retrieves the list of documents in this collection. */
    listDocuments(): Promise<FakeDocRef<T>[]>;
    /**
     * Get a `FakeDocRef` for the document within the collection at the specified path.
     * @param documentPath A slash-separated path to a document.
     * @return The `DocumentReference` instance.
     */
    doc(documentPath: string): FakeDocRef<T>;
    /**
     * Add a new document to this collection with the specified data, assigning
     * it a document ID automatically.
     * @param data An Object containing the data for the new document.
     * @return A Promise resolved with a `FakeDocRef` pointing to the
     * newly created document after it has been written to the backend.
     */
    add(data: any): Promise<FakeDocRef<T>>;
    /**
     * Returns true if this `FakeCollectionRef` is equal to the provided one.
     * @param other The `CollectionReference` to compare against.
     * @return true if this `CollectionReference` is equal to the provided one.
     */
    isEqual(other: FakeCollectionRef<T>): boolean;
}
export declare class FakeQuerySnapshot<T = FakeDocData> {
    private _query;
    docs: FakeDocSnapshot<T>[];
    /** The number of documents in the QuerySnapshot. */
    get size(): number;
    /** True if there are no documents in the QuerySnapshot. */
    get empty(): boolean;
    /** The query on which you called `get` in order to get this `QuerySnapshot`. */
    get query(): FakeQuery;
    constructor(_query: FakeQuery, docs: FakeDocSnapshot<T>[]);
    /**
     * Iterate throw all docs in this collection
     * @param callback Callback function in for each
     */
    forEach(callback: (doc: FakeDocSnapshot<T>) => any): void;
}
