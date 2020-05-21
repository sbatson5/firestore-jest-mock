import { FakeFirestore } from "./fake-firestore";
import { FakeDocRef, FakeDocSnapshot } from "./doc";
import { segmentFirestorePath, autoId, is, iterateThrowObj, getFieldSegments } from "../utils";
import { FakeDocData } from "types";
import { WhereFilterOp, OrderByDirection } from "@google-cloud/firestore";
import { DocDataRef } from "./database/doc-data-ref";
import { FakeFieldPath } from "./field-path";
import { jestMocks } from "../jest-fn";
import { isEqual } from "lodash";

/** Type of filters that can be applied to a query */
export enum FilterType {
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

export type QueryFilterArgTypes =
  | WhereQueryArgs
  | OrderByQueryArgs
  | CursorQueryArgs
  | LimitQueryArgs
  | SelectQueryArgs;

export type WhereQueryArgs = [string, WhereFilterOp, any];
export type OrderByQueryArgs = [string | FakeFieldPath, OrderByDirection];
export type CursorQueryArgs = [FakeDocSnapshot | any, ...any[]];
export type LimitQueryArgs = [number];
export type SelectQueryArgs = [...(string | FakeFieldPath)[]];

export type ScliceType = "startAt" | "startAfter" | "endAt" | "endBefore";

export class FieldFilter {
  public filters: QueryFilter[] = [];

  private filtersOrder: FilterType[] = [
    FilterType.where,
    FilterType.orderBy,
    FilterType.startAt,
    FilterType.startAfter,
    FilterType.endBefore,
    FilterType.endAt,
    FilterType.limit,
    FilterType.select
  ];

  constructor() {}

  /**
   * Filter the collection data based on this class filters
   * @param collectionData The collection data to be filtered
   */
  public filterData(collectionData: DocDataRef[]): DocDataRef[] {
    this.sortFilterArray();
    let filteredData: DocDataRef[] = collectionData.concat();
    this.filters.forEach(filter => {
      // Get the filter type and call it function
      switch (filter.type) {
        case FilterType.where:
          filteredData = this.where(filteredData, ...(filter.args as WhereQueryArgs));
          break;
        case FilterType.orderBy:
          filteredData = this.orderBy(filteredData, ...(filter.args as OrderByQueryArgs));
          break;
        case FilterType.startAt:
          filteredData = this.startAt(filteredData, ...(filter.args as CursorQueryArgs));
          break;
        case FilterType.startAfter:
          filteredData = this.startAfter(filteredData, ...(filter.args as CursorQueryArgs));
          break;
        case FilterType.endAt:
          filteredData = this.endAt(filteredData, ...(filter.args as CursorQueryArgs));
          break;
        case FilterType.endBefore:
          filteredData = this.endBefore(filteredData, ...(filter.args as CursorQueryArgs));
          break;
        case FilterType.limit:
          filteredData = this.limit(filteredData, ...(filter.args as LimitQueryArgs));
          break;
        case FilterType.select:
          filteredData = this.select(filteredData, ...(filter.args as SelectQueryArgs));
          break;
      }
    });
    return filteredData;
  }

  /**
   * Add a filter in the filters array
   * @param type The filter type
   * @param args The args of type
   */
  public addFilter(type: FilterType, ...args: QueryFilterArgTypes): void {
    this.filters.push({ type, args });
  }

  /** Sort the filters array */
  private sortFilterArray(): void {
    this.filters.sort((a, b) => {
      // Get the index for a and b in filtersOrder
      let aTypeIndex: number;
      let bTypeIndex: number;
      this.filtersOrder.forEach((type, index) => {
        if (a.type === type) aTypeIndex = index;
        if (b.type === type) bTypeIndex = index;
      });
      return aTypeIndex - bTypeIndex;
    });
  }

  /**
   * Query where function that filter the collection data
   * @param collectionData The collection data to be filtered
   * @param fieldPath The field path in fake database object
   * @param opStr The firestore where operation for this
   * @param value The value for the comparation
   * @returns The filtered collectionData
   */
  private where(
    collectionData: DocDataRef[],
    fieldPath: string | FakeFieldPath,
    opStr: WhereFilterOp,
    value: any
  ): DocDataRef[] {
    const paths: string[] = getFieldSegments(fieldPath);

    return collectionData.filter(data => {
      const dataToCompare = iterateThrowObj(data.data, paths);
      return this.whereOp(opStr)(dataToCompare, value);
    });
  }

  /**
   * Get the operation where function
   * @param opStr A string representing the operation of the query
   * @returns A function where the first argument is the fake database data that will
   * be compared with the second argument that is the value passed in the where
   */
  private whereOp(opStr: WhereFilterOp): (data: any, value: any) => boolean {
    switch (opStr) {
      case "<":
        return (data: any, value: any) => data < value;
      case "<=":
        return (data: any, value: any) => data <= value;
      case "==":
        return (data: any, value: any) => isEqual(data, value);
      case ">":
        return (data: any, value: any) => data > value;
      case ">=":
        return (data: any, value: any) => data >= value;
      case "array-contains":
      case "array-contains-any":
        return (data: any[], value: any) => data.some(d => isEqual(d, value));
      case "in":
        return (data: any, value: any[]) => value.some(v => isEqual(data, v));
    }
  }

  /**
   * Sort the collection data based on the fields
   * @param collectionData
   * @param orderByFields
   * @param directionStr
   */
  private orderBy(
    collectionData: DocDataRef[],
    orderByFields: string | FakeFieldPath,
    directionStr?: OrderByDirection
  ): DocDataRef[] {
    const paths = getFieldSegments(orderByFields);
    return collectionData.sort((a, b) => {
      const aVal = iterateThrowObj(a.data, paths);
      const bVal = iterateThrowObj(b.data, paths);

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return directionStr === "asc" ? comparison : comparison * -1;
    });
  }

  /** Get the the orderBys filters */
  private getOrderBys() {
    return this.filters.filter(filter => filter.type === FilterType.orderBy);
  }

  /**
   * Get a slice of the collection data array
   * @param collectionData Array of DocDataRef
   * @param sliceType The filter slice type
   * @param dataOrDocSnap Data that could be a instance of FakeDocSnapshot or a data to compare
   * @param fieldValues Other values for comparison
   * @returns A array of DocDataRef
   */
  private cursorSlice(
    collectionData: DocDataRef[],
    sliceType: ScliceType,
    dataOrDocSnap: FakeDocSnapshot | any,
    ...fieldValues: any[]
  ): DocDataRef[] {
    // Indicates if the dataOrDocSnap is instance of FakeDocSnapshot
    const isFakeDocSnap: boolean = dataOrDocSnap instanceof FakeDocSnapshot;

    // Function to find the index in de doc data ref array
    const findIndex = (path: string, valueToCompare: any) => (doc: DocDataRef) => {
      // if the dataOrDocSnap is a FakeDocSnapshot compare the value with the doc id
      if (isFakeDocSnap) return doc.id === (dataOrDocSnap as FakeDocSnapshot).id;
      return iterateThrowObj(doc.data, path) === valueToCompare;
    };

    // Get the start position for the slice
    const start = (docArr: DocDataRef[], path?: string, valueToCompare?: any): number => {
      // If the slice type is "end" return 0
      const isEnd: boolean = sliceType.startsWith("end");
      if (isEnd) return 0;
      // Find the starting index for "start" slice type
      const startIndex = docArr.findIndex(findIndex(path, valueToCompare));
      if (sliceType === "startAt") return startIndex;
      // For "startAfter" exclude the index value
      return startIndex + 1;
    };

    // Get the end position for the slice
    const end = (arr: any[], path?: string, valueToCompare?: any): number => {
      // If the slice type is "start" return the array last index
      const isStart: boolean = sliceType.startsWith("start");
      if (isStart) return arr.length - 1;
      // Find the ending index for "end" value
      const endIndex = arr.reverse().findIndex(findIndex(path, valueToCompare));
      if (sliceType === "endAt") return endIndex + 1;
      // For "endBefore" exclude ending index
      return endIndex;
    };

    // Return the slice FakeDocSnapshot instance
    if (dataOrDocSnap instanceof FakeDocSnapshot)
      return collectionData.slice(start(collectionData), end(collectionData));

    // Get the orderBys filters and set the data array to compare
    const orderBys = this.getOrderBys();
    const dataToCompare = [dataOrDocSnap, ...fieldValues].concat();

    // Throw error if the data to compare is greatter than the orderBys
    if (dataToCompare.length > orderBys.length) {
      const errorMessage =
        "Too many cursor values specified." +
        "The specified values must match the orderBy() constraints of the query.";
      throw new Error(errorMessage);
    }

    // Set the returning data
    let docs: DocDataRef[] = collectionData.concat();
    // Get each orderBy filter and index
    orderBys.forEach((orderBy, index) => {
      // Get the orderby path
      const [path] = orderBy.args;

      // Slice the docs with the start and end functions
      docs = docs.slice(
        start(docs, path, dataToCompare[index]),
        end(docs, path, dataToCompare[index])
      );
    });
    // Return the sliced data
    return docs;
  }

  /**
   * Filter the collection data array including the starting position
   * @param collectionData Array of DocDataRef
   * @param dataOrDocSnap Data that could be a instance of FakeDocSnapshot or a data to compare
   * @param fieldValues Other values for comparison
   * @returns A array of DocDataRef
   */
  private startAt(
    collectionData: DocDataRef[],
    dataOrDocSnap: FakeDocSnapshot | any,
    ...fieldValues: any[]
  ): DocDataRef[] {
    return this.cursorSlice(collectionData, "startAt", dataOrDocSnap, ...fieldValues);
  }

  /**
   * Filter the collection data array excluding the starting position
   * @param collectionData Array of DocDataRef
   * @param dataOrDocSnap Data that could be a instance of FakeDocSnapshot or a data to compare
   * @param fieldValues Other values for comparison
   * @returns A array of DocDataRef
   */
  private startAfter(
    collectionData: DocDataRef[],
    dataOrDocSnap: FakeDocSnapshot | any,
    ...fieldValues: any[]
  ): DocDataRef[] {
    return this.cursorSlice(collectionData, "startAfter", dataOrDocSnap, ...fieldValues);
  }

  /**
   * Filter the collection data array including the ending position
   * @param collectionData Array of DocDataRef
   * @param dataOrDocSnap Data that could be a instance of FakeDocSnapshot or a data to compare
   * @param fieldValues Other values for comparison
   * @returns A array of DocDataRef
   */
  private endAt(
    collectionData: DocDataRef[],
    dataOrDocSnap: FakeDocSnapshot | any,
    ...fieldValues: any[]
  ): DocDataRef[] {
    return this.cursorSlice(collectionData, "endAt", dataOrDocSnap, ...fieldValues);
  }

  /**
   * Filter the collection data array excluding the ending position
   * @param collectionData Array of DocDataRef
   * @param dataOrDocSnap Data that could be a instance of FakeDocSnapshot or a data to compare
   * @param fieldValues Other values for comparison
   * @returns A array of DocDataRef
   */
  private endBefore(
    collectionData: DocDataRef[],
    dataOrDocSnap: FakeDocSnapshot | any,
    ...fieldValues: any[]
  ): DocDataRef[] {
    return this.cursorSlice(collectionData, "endBefore", dataOrDocSnap, ...fieldValues);
  }

  /**
   * Limit filter that slice the data within the limit
   * @param collectionData Array of DocDataRef
   * @param limit The position to include in the return
   */
  private limit(collectionData: DocDataRef[], limit: number): DocDataRef[] {
    return collectionData.slice(0, limit);
  }

  /**
   *
   * @param collectionData
   * @param fields
   */
  private select(
    collectionData: DocDataRef[],
    ...fields: (string | FakeFieldPath)[]
  ): DocDataRef[] {
    // Get the provide paths for the select mask
    const maskPaths: string[][] = [];
    fields.forEach(field => {
      maskPaths.push(getFieldSegments(field));
    });

    // Map the doc data ref
    return collectionData.map(doc => {
      // Set a new object of the doc data
      const docData = doc.data;
      let selectData: any = {};

      // Create the objects based on the paths mask
      maskPaths.forEach(paths => {
        // Data to assign in the last path
        const lastData = iterateThrowObj(docData, paths);
        const lastIndex = paths.length - 1;

        // Set object that will iterate with the paths to create the mask
        let iterateObj: any = selectData;
        paths.forEach((path, index) => {
          // Assing the data in the last path
          if (index === lastIndex) iterateObj[path] = lastData;
          // If the data is not an object create a new object in the path,
          // else just assing the existing object for iteration
          else if (!is(iterateObj[path], "object")) {
            iterateObj[path] = {};
            iterateObj = iterateObj[path];
          } else {
            iterateObj = iterateObj[path];
          }
        });
      });
      const newDocData = doc.docData;
      newDocData.data = selectData;
      // Return a new instance of DocDataRef with the masked data
      return new DocDataRef(newDocData, doc.path);
    });
  }
}

export class FakeQuery<T = FakeDocData> {
  private fieldFilter = new FieldFilter();

  /** The `FakeFirestore` for the Firestore database */
  public get firestore(): FakeFirestore {
    jestMocks.collection.firestore();
    return this._fakeFirestore;
  }

  constructor(
    /** A reference to FakeFirestore */
    protected _fakeFirestore: FakeFirestore,
    /** A string representing the path of the referenced collection (relative to the root of the database). */
    public path: string
  ) {}

  /**
   * Creates and returns a new FakeQuery with the additional filter that documents
   * must contain the specified field and that its value should satisfy the
   * relation constraint provided.
   * @param fieldPath The path to compare
   * @param opStr The operation string (e.g "<", "<=", "==", ">", ">=").
   * @param value The value for comparison
   * @return The created FakeQuery.
   */
  public where(fieldPath: string | FakeFieldPath, opStr: WhereFilterOp, value: any): FakeQuery<T> {
    jestMocks.collection.where(fieldPath, opStr, value);
    this.fieldFilter.addFilter(FilterType.where, fieldPath, opStr, value);
    return this;
  }

  /**
   * Creates and returns a FakeQuery that's additionally sorted by the
   * specified field, optionally in descending order instead of ascending.
   * @param fieldPath The field to sort by.
   * @param directionStr Optional direction to sort by ('asc' or 'desc'). If
   * not specified, order will be ascending.
   * @return The created FakeQuery.
   */
  public orderBy(fieldPath: string | FakeFieldPath, directionStr?: OrderByDirection): FakeQuery<T> {
    jestMocks.collection.orderBy(fieldPath, directionStr);
    this.fieldFilter.addFilter(FilterType.orderBy, fieldPath, directionStr);
    return this;
  }

  public startAt(docSnap: FakeDocSnapshot): FakeQuery<T>;
  public startAt(...fieldValues: any[]): FakeQuery<T>;
  /**
   * Creates and returns a new FakeQuery that starts at the provided document or field
   * (inclusive). The starting position is relative to the order of the query.
   * The document must contain all of the fields provided in the orderBy of this query.
   * @param snapshot The snapshot of the document to start after.
   * @param fieldValues The field values to start this query at, in order of the query's order by.
   * @return The created FakeQuery.
   */
  public startAt(dataOrDocSnap: FakeDocSnapshot | any, ...fieldValues: any[]): FakeQuery<T> {
    jestMocks.collection.startAt(dataOrDocSnap, ...fieldValues);
    this.fieldFilter.addFilter(FilterType.startAt, dataOrDocSnap, ...fieldValues);
    return this;
  }

  public startAfter(docSnap: FakeDocSnapshot): FakeQuery<T>;
  public startAfter(...fieldValues: any[]): FakeQuery<T>;
  /**
   * Creates and returns a new FakeQuery that starts after the provided document or fields
   * (exclusive). The starting position is relative to the order of the query.
   * The document must contain all of the fields provided in the orderBy of
   * this query.
   * @param snapshot The snapshot of the document to start after.
   * @param fieldValues The field values to start this query at, in order of the query's order by.
   * @return The created FakeQuery.
   */
  public startAfter(dataOrDocSnap: FakeDocSnapshot | any, ...fieldValues: any[]): FakeQuery<T> {
    jestMocks.collection.startAfter(dataOrDocSnap, ...fieldValues);
    this.fieldFilter.addFilter(FilterType.startAfter, dataOrDocSnap, ...fieldValues);
    return this;
  }

  public endBefore(docSnap: FakeDocSnapshot): FakeQuery<T>;
  public endBefore(...fieldValues: any[]): FakeQuery<T>;
  /**
   * Creates and returns a new FakeQuery that ends before the provided document or fields
   * (exclusive). The end position is relative to the order of the query. The
   * document must contain all of the fields provided in the orderBy of this
   * query.
   * @param snapshot The snapshot of the document to end before.
   * @param fieldValues The field values to start this query at, in order of the query's order by.
   * @return The created FakeQuery.
   */
  public endBefore(dataOrDocSnap: FakeDocSnapshot | any, ...fieldValues: any[]): FakeQuery<T> {
    jestMocks.collection.endBefore(dataOrDocSnap, ...fieldValues);
    this.fieldFilter.addFilter(FilterType.endBefore, dataOrDocSnap, ...fieldValues);
    return this;
  }

  public endAt(docSnap: FakeDocSnapshot): FakeQuery<T>;
  public endAt(...fieldValues: any[]): FakeQuery<T>;
  /**
   * Creates and returns a new FakeQuery that ends at the provided document or fields
   * (inclusive). The end position is relative to the order of the query. The
   * document must contain all of the fields provided in the orderBy of this
   * query.
   * @param snapshot The snapshot of the document to end at.
   * @param fieldValues The field values to start this query at, in order of the query's order by.
   * @return The created FakeQuery.
   */
  public endAt(dataOrDocSnap: FakeDocSnapshot | any, ...fieldValues: any[]): FakeQuery<T> {
    jestMocks.collection.endAt(dataOrDocSnap, ...fieldValues);
    this.fieldFilter.addFilter(FilterType.endAt, dataOrDocSnap, ...fieldValues);
    return this;
  }

  /**
   * Creates and returns a FakeQuery that's additionally limited to only
   * return up to the specified number of documents.
   * @param limit The maximum number of items to return.
   * @return The created Query.
   */
  public limit(limit: number): FakeQuery<T> {
    jestMocks.collection.limit(limit);
    this.fieldFilter.addFilter(FilterType.limit, limit);
    return this;
  }

  /**
   * Creates and returns a FakeQuery instance that applies a field mask to
   * the result and returns only the specified subset of fields. You can
   * specify a list of field paths to return.
   * @param fields The field paths to return.
   * @return The created FakeQuery.
   */
  public select(...fields: (string | FakeFieldPath)[]): FakeQuery<T> {
    jestMocks.collection.select(...fields);
    this.fieldFilter.addFilter(FilterType.select, ...fields);
    return this;
  }

  /**
   * Executes the query and returns the results as a `FakeQuerySnapshot`.
   * @return A Promise that will be resolved with the results of the Query.
   */
  public async get(): Promise<FakeQuerySnapshot> {
    jestMocks.collection.get();
    // Get the collection data, filter it adn return a
    const collectionData = this._fakeFirestore.database.get(this.path, "collection").docs;
    const docSnaps = this.fieldFilter
      .filterData(collectionData)
      .map(doc => new FakeDocSnapshot(new FakeDocRef(this._fakeFirestore, doc.path), doc.data));
    return new FakeQuerySnapshot(this, docSnaps);
  }
}

export class FakeCollectionRef<T = FakeDocData> extends FakeQuery<T> {
  /** Sequence of parts of the path */
  private segments: string[];

  /** The identifier of the collection. */
  public get id(): string {
    jestMocks.collection.id();
    return this.segments[this.segments.length - 1];
  }

  /** Parente doc path, null if the collection is on root */
  public get parentPath(): string | null {
    const path = this.segments.concat();
    path.pop();
    return path.length === 0 ? null : path.join("/");
  }

  /** A reference to the containing Document if this is a subcollection, else null. */
  public get parent(): FakeDocRef | null {
    jestMocks.collection.parent();
    if (this.isRoot) return null;
    return new FakeDocRef(this._fakeFirestore, this.parentPath);
  }

  /** Indicates if the collection is in the root */
  private get isRoot(): boolean {
    return this.segments.length === 1;
  }

  constructor(_fakeFirestore: FakeFirestore, path: string) {
    super(_fakeFirestore, path);
    jestMocks.collection.constructor(_fakeFirestore, path);
    this.segments = segmentFirestorePath(this.path, "collection");
  }

  /**
   * Get a formatted document path in this collection
   * @param docId The document Id
   */
  private getDocPath(docId: string): string {
    return `${this.path}/${docId}`;
  }

  /** Firestore Methods **/

  /** Retrieves the list of documents in this collection. */
  public async listDocuments(): Promise<FakeDocRef<T>[]> {
    jestMocks.collection.listDocuments();
    return this._fakeFirestore.database
      .get(this.path, "collection")
      .docs.map(docData => this.doc(docData.id));
  }

  /**
   * Get a `FakeDocRef` for the document within the collection at the specified path.
   * @param documentPath A slash-separated path to a document.
   * @return The `DocumentReference` instance.
   */
  public doc(documentPath: string): FakeDocRef<T> {
    jestMocks.collection.doc(documentPath);
    return new FakeDocRef(this._fakeFirestore, this.getDocPath(documentPath));
  }

  /**
   * Add a new document to this collection with the specified data, assigning
   * it a document ID automatically.
   * @param data An Object containing the data for the new document.
   * @return A Promise resolved with a `FakeDocRef` pointing to the
   * newly created document after it has been written to the backend.
   */
  public async add(data: any): Promise<FakeDocRef<T>> {
    jestMocks.collection.add(data);
    const docId = autoId();
    this._fakeFirestore.database.addData(data, this.path, docId);

    return this.doc(docId);
  }

  /**
   * Returns true if this `FakeCollectionRef` is equal to the provided one.
   * @param other The `CollectionReference` to compare against.
   * @return true if this `CollectionReference` is equal to the provided one.
   */
  public isEqual(other: FakeCollectionRef<T>): boolean {
    jestMocks.collection.isEqual(other);
    return other.path === this.path;
  }
}

export class FakeQuerySnapshot<T = FakeDocData> {
  /** The number of documents in the QuerySnapshot. */
  public get size(): number {
    return this.docs.length;
  }
  /** True if there are no documents in the QuerySnapshot. */
  public get empty(): boolean {
    return this.docs.length === 0;
  }
  /** The query on which you called `get` in order to get this `QuerySnapshot`. */
  public get query(): FakeQuery {
    return this._query;
  }

  constructor(private _query: FakeQuery, public docs: FakeDocSnapshot<T>[]) {}

  /**
   * Iterate throw all docs in this collection
   * @param callback Callback function in for each
   */
  public forEach(callback: (doc: FakeDocSnapshot<T>) => any) {
    return this.docs.forEach(callback);
  }
}
