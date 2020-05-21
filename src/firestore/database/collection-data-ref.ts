import { CollectionData, DocData, FakeDocData } from "types";
import { DocDataRef } from "./doc-data-ref";
import { jestMocks } from "../../jest-fn";

export class CollectionDataRef implements CollectionData {
  private _docs: DocDataRef[] = [];

  /** DocDataRef array of this collection */
  public get docs(): DocDataRef[] {
    jestMocks.fakeDatabase.collection.docs();
    return this._docs as DocDataRef[];
  }

  /** The identifier of the collection. */
  public get id(): string {
    jestMocks.fakeDatabase.collection.id();
    const path = this.path.split("/");
    return path[path.length - 1];
  }

  constructor(
    private _data: CollectionData,
    /** A string representing the path of the referenced collection */
    public path: string
  ) {
    jestMocks.fakeDatabase.collection.constructor(_data, path);
    this._docs = this._data.docs.map(docData => {
      const data = docData instanceof DocDataRef ? docData.docData : docData;
      return new DocDataRef(data, this.docPath(docData.id));
    });
  }

  /**
   * Creates a document path for this collection
   * @param docId The doc id
   * @returns A string representing the doc path
   */
  public docPath(docId: string): string {
    jestMocks.fakeDatabase.collection.docPath(docId);
    return `${this.path}/${docId}`;
  }

  /**
   * Add the doc in the collections doc
   * @param doc The new doc ref
   * @returns The doc data reference
   */
  public push(doc: DocDataRef | DocData): DocDataRef {
    jestMocks.fakeDatabase.collection.push(doc);
    if (!(doc instanceof DocDataRef)) doc = new DocDataRef(doc, this.docPath(doc.id));
    this.docs.push(doc as DocDataRef);
    return doc as DocDataRef;
  }

  /**
   * Search for a doc in the collection data
   * @param docId The doc id to search
   * @returns The doc data reference, if not found undefined
   */
  public findDoc(docId: string): DocDataRef {
    jestMocks.fakeDatabase.collection.findDoc(docId);
    return this.docs.find(doc => doc.id === docId);
  }

  /**
   * Create a new subcollection in doc
   * @param docId The new subcollection id
   * @param data Optional data for the new subcollection
   * @param subcollections Optional data for the new subcollection
   * @returns The collection data reference
   */
  private createDoc(docId: string, data: FakeDocData = {}, subcollections = {}): DocDataRef {
    jestMocks.fakeDatabase.collection.createDoc(
      docId,
      Object.assign({}, data),
      Object.assign({}, subcollections)
    );
    const doc = new DocDataRef({ id: docId, subcollections, data }, this.docPath(docId));
    this.push(doc);
    return doc;
  }

  /**
   * Removes a doc from this collection
   * @param docId The doc id to remove
   */
  public deleteDoc(docId: string): void {
    jestMocks.fakeDatabase.collection.deleteDoc(docId);
    // Find the doc index in collection,
    // if it's -1 then return else use splice to remove the doc from collection array
    const docIndex = this.docs.findIndex(docData => docData.id === docId);
    if (docIndex === -1) return;
    this.docs.splice(docIndex, 1);
  }

  /**
   * Recursive function to get a doc or collection on database
   * @param segments Path segments used to iterate
   * @returns A CollectionDataRef if segments is odd or DocDataRef if it's even
   */
  public getDoc(segments: string[]): CollectionDataRef | DocDataRef {
    segments = segments.concat();
    jestMocks.fakeDatabase.collection.getDoc(segments.concat());
    // Get the doc id from the segments
    const docId = segments.shift();
    const doc = this.findDoc(docId);
    if (!doc) return null;
    if (segments.length === 0) return doc;
    return doc.getCollection(segments);
  }

  /**
   * Creates a nested docs and collections with the given segments path
   * @param segments Path parts for the new collection ordoc
   * @param data Optional data for the new doc
   * @returns A CollectionDataRef if segments is odd or DocDataRef if it's even
   */
  public createPath(segments: string[], data?: FakeDocData): CollectionDataRef | DocDataRef {
    segments = segments.concat();
    jestMocks.fakeDatabase.collection.createPath(segments.concat(), data);
    // Get the doc id from segments and search the doc in collection
    const docId = segments.shift();
    let doc = this.findDoc(docId);
    // If the doc don't exists create a new one and set it on this collection
    if (!doc) doc = this.createDoc(docId, data);
    if (data) doc.data = data;
    // If segments is empty return the doc, else continue creating the nested collections and docs
    if (segments.length === 0) return doc;
    return doc.createPath(segments, data);
  }
}
