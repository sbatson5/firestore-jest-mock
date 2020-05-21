import { MockDatabase, FakeSetOptions, FakeDocData, MockDatabaseData, SegmentType } from "types";
import { segmentFirestorePath } from "../../utils";
import { CollectionDataRef } from "./collection-data-ref";
import { DocDataRef } from "./doc-data-ref";
import { jestMocks } from "../../jest-fn";

export class FakeFirestoreDatabase {
  /** Data contruncted in this db */
  private data: MockDatabaseData = {};

  constructor(
    /** The fake database data */
    private mockDatabase: MockDatabase = {}
  ) {
    jestMocks.fakeDatabase.database.constructor(mockDatabase);
    // Map the mock database to CollectionDataRef
    Object.entries(this.mockDatabase).forEach(([collectionName, collectionData]) => {
      this.data[collectionName] = new CollectionDataRef(collectionData, collectionName);
    });
  }

  /** List the root collections path */
  public listRootCollection(): string[] {
    jestMocks.fakeDatabase.database.listRootCollection();
    return Object.keys(this.data);
  }

  public get(path: string, segmentType: "doc"): DocDataRef;
  public get(path: string, segmentType: "collection"): CollectionDataRef;
  /**
   * Get that o stubbed database
   * @param path The path to get the data
   * @param segmentType Indicates if the data is a `document` or `collection`
   */
  public get(path: string, segmentType: SegmentType): CollectionDataRef | DocDataRef {
    jestMocks.fakeDatabase.database.get(path, segmentType);
    // Get the segments array which is a array of string with the path parts
    const segments = segmentFirestorePath(path, segmentType);
    // Get the first collection, if the collection don't exists return null
    const collectionId = segments.shift();
    const collection = this.data[collectionId];
    if (!collection) return null;
    // Else check the segments length if it's 0 return the collection
    if (segments.length === 0) return collection;
    // Else get doc data from the collection
    return collection.getDoc(segments);
  }

  /**
   * Add data to a collection in fake database
   * @param data The data to be added
   * @param collectionPath The collection path to add the document
   * @param docId The document id
   */
  public addData<T = any>(data: T, collectionPath: string, docId: string): void {
    jestMocks.fakeDatabase.database.addData(data, collectionPath, docId);
    // Get the collection referece, if it not exists create it path on fake database
    let collectionData: CollectionDataRef = this.get(collectionPath, "collection");
    if (!collectionData) collectionData = this.createPathInDb(collectionPath) as CollectionDataRef;
    collectionData.push(this.createNewDocData(docId, data, collectionData.docPath(docId)));
  }

  /**
   * Change the data in the specified docPath, if the data don't exists create a new doc
   * @param data The data to be setted in the doc
   * @param docPath The document path
   * @param options Change the set data behavior
   */
  public setData<T = any>(data: T, docPath: string, options?: FakeSetOptions): void {
    jestMocks.fakeDatabase.database.setData(data, docPath, options);
    const docData = this.get(docPath, "doc");

    // If docData exists set the new data
    if (docData) docData.setDataInDocData(data, options);
    // If docData is null create the doc in the db
    else this.createPathInDb(docPath, data);
  }

  /**
   * Creates a doc data object
   * @param id The doc id
   * @param data The data within the doc
   * @returns A DocData object
   */
  private createNewDocData<T = any>(
    id: string,
    data: T,
    path: string,
    subcollections = {}
  ): DocDataRef {
    return new DocDataRef({ id, subcollections, data }, path);
  }

  /**
   * Creates a the collections and docs in the given `path` on fake database
   * @param path The path to be created
   * @param setDocData If the path leads to a doc set this data in the new object
   * @return A object reference to the DocData or CollectionData
   */
  private createPathInDb(path: string, docData: FakeDocData = {}): DocDataRef | CollectionDataRef {
    // Set segments array and get the first collection
    const segments = segmentFirestorePath(path);
    const collectionId = segments.shift();
    let collection = this.data[collectionId];
    // If the collection don't exists create a new
    if (!collection) {
      this.data[collectionId] = new CollectionDataRef({ docs: [] }, collectionId);
      collection = this.data[collectionId];
    }
    // If segments is empty return the collection else continue creating the nested collections and docs
    if (segments.length === 0) return collection;
    return collection.createPath(segments, docData);
  }

  /**
   * Delete a doc from a collection
   * @param collectionPath The collection which the doc belongs
   * @param docId The doc id to be deleted
   */
  public deleteDoc(collectionPath: string, docId: string): void {
    jestMocks.fakeDatabase.database.deleteDoc(collectionPath, docId);
    // Get the collection and check if it's exists
    const collection = this.get(collectionPath, "collection");
    if (!collection) return;
    // Remove the doc from the collection
    collection.deleteDoc(docId);
  }
}
