import {
  segmentFirestorePath,
  checkUndefined,
  is,
  isFakeFieldPath,
  getFieldSegments,
  getObjectPaths
} from "../utils";
import { FakeFirestore } from "./fake-firestore";
import { FakeDocData, FakeSetOptions } from "types";
import { FakeCollectionRef } from "./collection";
import { FakeFieldPath } from "./field-path";
import { jestMocks } from "../jest-fn";

/** FakeDocRef is the equivalent to firestore `DocumentRefernece` */
export class FakeDocRef<T = FakeDocData> {
  /** Sequence of parts of the path */
  private segments: string[];

  /** Parent collection path */
  public get parentPath(): string {
    const path = this.segments.concat();
    path.pop();
    return path.join("/");
  }

  /** The `FakeFirestore` for the Firestore database (useful for performing transactions, etc.). */
  public get firestore(): FakeFirestore {
    jestMocks.doc.firestore();
    return this._fakeFirestore;
  }

  /** A reference to the Collection to which this FakeDocRef belongs. */
  public get parent(): FakeCollectionRef<T> {
    jestMocks.doc.parent();
    return new FakeCollectionRef(this._fakeFirestore, this.parentPath);
  }

  /** The identifier of the collection. */
  public get id(): string {
    jestMocks.doc.id();
    return this.segments[this.segments.length - 1];
  }

  constructor(
    /** A reference to FakeFirestore */
    private _fakeFirestore: FakeFirestore,
    /** A string representing the path of the referenced document (relative to the root of the database). */
    public path: string
  ) {
    jestMocks.doc.constructor(_fakeFirestore, path);
    this.segments = segmentFirestorePath(this.path, "doc");
  }

  /**
   * Get a subcollection path of this doc
   * @param collectionId The subcollection id
   * @returns A string representing the subcollection path
   */
  private getCollectionPath(collectionId: string): string {
    return `${this.path}/${collectionId}`;
  }

  /** Firestore Methods **/

  /**
   * Gets a `FakeCollectionRef` instance that refers to the collection at the specified path.
   * @param collectionPath A slash-separated path to a collection.
   * @return The `FakeCollectionRef` instance.
   */
  public collection(collectionPath: string): FakeCollectionRef {
    jestMocks.doc.collection(collectionPath);
    return new FakeCollectionRef(this._fakeFirestore, this.getCollectionPath(collectionPath));
  }

  /**
   * Fetches the subcollections that are direct children of this document on fake database.
   * @returns A Promise that resolves with an array of CollectionReferences.
   */
  public async listCollections(): Promise<FakeCollectionRef[]> {
    jestMocks.doc.listCollections();
    const subCollections = this._fakeFirestore.database.get(this.path, "doc").subcollections;
    return Object.entries(subCollections).map(([subCollectionId]) =>
      this.collection(subCollectionId)
    );
  }

  /**
   * Creates a document referred to by this `FakeDoc` with the
   * provided object values. The write fails if the document already exists
   * @param data The object data to serialize as the document.
   * @return A Promise resolved with the write time of this create.
   */
  public async create(data: T): Promise<void> {
    jestMocks.doc.create(data);
    if (this._fakeFirestore.database.get(this.path, "doc"))
      throw new Error("Document already exists on database");
    this._fakeFirestore.database.addData(data, this.parentPath, this.id);
  }

  /**
   * Writes to the document referred to by this `DocumentReference`. If the
   * document does not yet exist, it will be created. If you pass
   * `SetOptions`, the provided data can be merged into an existing document.
   * @param data A map of the fields and values for the document.
   * @param options An object to configure the set behavior.
   * @return A Promise resolved with the write time of this set.
   */
  public async set(data: T, options?: FakeSetOptions): Promise<void> {
    jestMocks.doc.set(data, options);
    // Check id data have undefined value, if true throw an error
    if (checkUndefined(data)) throw new Error("data cannot have undefined field value");
    if (options) {
      // Throw error if merge and mergeFields are both especified
      if (options.merge && options.mergeFields)
        throw new Error(
          `Value for argument "options" is not a valid set() options argument. You cannot specify both "merge" and "mergeFields".`
        );
      // Set options as null if none of merge and mergeFields was specified
      if (!options.merge && !options.mergeFields) options = null;
    }
    this._fakeFirestore.database.setData(data, this.path, options);
  }

  public async update(data: T): Promise<void>;
  public async update(
    field: string | FakeFieldPath,
    value: any,
    ...moreFieldsOrPrecondition: any[]
  ): Promise<void>;
  /**
   * Updates fields in the document referred to by this `FakeDocReference`.
   * The update will fail if applied to a document that does not exist.
   * Nested fields can be updated by providing dot-separated field path
   * strings.
   * @param dataOrField An object containing the fields and values with which to
   * update the documentor the fields to update in the doc
   * @param value An object with the fields to update in the doc
   * @param moreFields alternating list of field paths and values to update
   */
  public async update(
    dataOrField: T | string | FakeFieldPath,
    value?: any,
    ...moreFields: (T | string | FakeFieldPath)[]
  ): Promise<void> {
    jestMocks.doc.update(dataOrField, value, ...moreFields);

    // Throw error if the document was not founded in fake database
    if (!this._fakeFirestore.database.get(this.path, "doc")) {
      const errorMesage = `No document to update: projects/{project-id}/databases/(default)/documents/${this.path}`;
      throw new Error(errorMesage);
    }

    // Check if dataOrField is fields
    const isFields = typeof dataOrField === "string" || (isFakeFieldPath(dataOrField) && value);

    // Set the data and options
    if (isFields) {
      this.updateDocWithField(dataOrField as string | FakeFieldPath, value, ...moreFields);
      return;
    }
    const data = dataOrField as T;
    // Get the paths in the data
    const paths = getObjectPaths(data as any).map(({ key }) => key.join("."));

    // Reuse database.setData to update the existing doc data
    this._fakeFirestore.database.setData(data, this.path, { mergeFields: paths });
  }

  private updateDocWithField(...fieldsOrValues: (T | string | FakeFieldPath)[]) {
    const len = fieldsOrValues.length;
    for (let index = 0; index < len; index += 2) {
      const path = fieldsOrValues[index] as string | FakeFieldPath;
      const data = fieldsOrValues[index + 1] as T;
      this._fakeFirestore.database.setData(data, this.path, { mergeFields: [path] });
    }
  }

  /**
   * Deletes the document referred to by this `FakeDocRef`.
   * @return A Promise resolved with the write time of this delete.
   */
  public async delete(): Promise<void> {
    jestMocks.doc.delete();
    this._fakeFirestore.database.deleteDoc(this.parentPath, this.id);
  }

  /**
   * Reads the document referred to by this `FakeDocRef`.
   * @return A Promise resolved with a FakeDocSnapshot containing the
   * current document data.
   */
  public async get(): Promise<FakeDocSnapshot> {
    jestMocks.doc.get();
    const docData = this._fakeFirestore.database.get(this.path, "doc");
    const data = docData ? docData.data : undefined;
    return new FakeDocSnapshot(this, data);
  }
}

/** FakeDocSnapshot is the equivalent to firestore `DocumentSnapshot` */
export class FakeDocSnapshot<T = FakeDocData> {
  /** True if the document exists. */
  public readonly exists: boolean;
  /**  The ID of the document for which this `FakeDocSnapshot` contains data. */
  public get id(): string {
    return this.ref.id;
  }

  constructor(
    /** Reference of the `FakeDocRef`. */
    public ref: FakeDocRef<T>,
    /** Fake doc snapshot data */
    private readonly _data: T
  ) {
    this.exists = this._data ? true : false;
  }

  /** Gets the snapshot doc data */
  public data(): T {
    if (!this.exists) return {} as T;
    const copy = { ...this._data };
    return copy;
  }
}
