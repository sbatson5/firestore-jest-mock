import { DocData, FakeDocData, FakeSetOptions, MockDatabaseData } from "types";
import { is, getFieldSegments, getObjectRef } from "../../utils";
import { CollectionDataRef } from "./collection-data-ref";
import { jestMocks } from "../../jest-fn";
import { FakeFieldPath } from "../firestore";
import { FakeFieldValue, FieldValueType } from "../field-value";
import { isEqual } from "lodash";
import { FakeTimestamp } from "../timestamp";

export class DocDataRef implements DocData {
  /** The data of the   */
  private _data: FakeDocData = {};
  /** Subcollections linked to this doc */
  private _subcollections: MockDatabaseData = {};

  /** The doc id */
  public get id(): string {
    jestMocks.fakeDatabase.doc.id();
    return this._docData.id;
  }

  /** Subcollections linked to this doc */
  public get subcollections(): MockDatabaseData {
    jestMocks.fakeDatabase.doc.subcollections();
    return this._subcollections;
  }

  /** The data of this doc */
  public get data(): FakeDocData {
    jestMocks.fakeDatabase.doc.data();
    return this._data;
  }
  public set data(data: FakeDocData) {
    jestMocks.fakeDatabase.doc.data(data);

    this._data = data;
    this._docData.data = this._data;
  }

  /** The doc data object of this DocDataRef */
  public get docData(): DocData {
    return this._docData;
  }

  constructor(
    private _docData: DocData,
    /** A string representing the path of the referenced document */
    public path: string
  ) {
    jestMocks.fakeDatabase.doc.constructor(_docData, path);
    this._data = this._docData.data;
    if (this._docData.subcollections && is(this._docData.subcollections, "object"))
      Object.entries(this._docData.subcollections).forEach(
        ([subcollectionName, subcollectionData]) => {
          this._subcollections[subcollectionName] = new CollectionDataRef(
            subcollectionData,
            this.subcollectionPath(subcollectionName)
          );
        }
      );
    else this._docData.subcollections = {};
  }

  /**
   * Get a subcollection of the doc
   * @param collectionName The sub collection name
   * @returns The collection data reference, if not found undefined
   */
  public getSubcollection(collectionId: string): CollectionDataRef {
    jestMocks.fakeDatabase.doc.getSubcollection(collectionId);
    return this.subcollections[collectionId] as CollectionDataRef;
  }

  /**
   * Create a new subcollection in doc
   * @param collectionId The new subcollection id
   * @param data Optional data for the new subcollection
   * @returns The collection data reference
   */
  public createSubcollection(collectionId: string, data: DocData[] = []): CollectionDataRef {
    data = data.concat();
    jestMocks.fakeDatabase.doc.createSubcollection(collectionId, data);
    const collectionData = { docs: data };
    this._docData.subcollections[collectionId] = collectionData;
    return (this.subcollections[collectionId] = new CollectionDataRef(
      collectionData,
      this.subcollectionPath(collectionId)
    ));
  }

  /**
   * Creates a collection path for this document
   * @param collectionId The collection id
   * @returns A string representing the collection path
   */
  public subcollectionPath(collectionId: string): string {
    jestMocks.fakeDatabase.doc.subcollectionPath(collectionId);
    return `${this.path}/${collectionId}`;
  }

  /**
   * Create the document data with the new
   * @param newData The new data to be setted
   * @param oldData The old data to be changed
   * @param options The options that change the
   */
  public setDataInDocData<T = any>(newData: T, options?: FakeSetOptions): FakeDocData {
    // Todo change data for FakeFieldValue
    jestMocks.fakeDatabase.doc.setDataInDocData(newData, options);
    const oldData = getObjectRef(this._data);

    // If no options was specified set the new data without using the old data
    if (!options) {
      this.data = this.validadeAndSetObj(newData, {});
      return this.data;
    }
    // If merge is true set each field in the newData i the oldData
    else if (options.merge) {
      const paths = Object.keys(newData);

      // Object.entries(newData).forEach(([key, value]) => (oldData[key] = value));
      this.data = this.mergeData(paths, newData, oldData);
      return oldData;
    }

    // Get mergefields paths and set each path in data
    this.data = this.mergeData(options.mergeFields, newData, oldData);
    this.data = oldData;

    return oldData;
  }

  /**
   * Based on the paths set the data iterate throw newData creating the paths in oldData
   * @param paths The paths in new data to iterate throw
   * @param newData The new data object to st in the old data
   * @param oldData The data that was in the doc before set
   * @return the data after setting the new properties
   */
  private mergeData(paths: (string | FakeFieldPath)[], newData: any, oldData: any): any {
    // Set varible that will only contain the especified paths
    let newFieldsData = {};

    paths.forEach(fieldPath => {
      // Get the string segments array and the last path
      const objPath = getFieldSegments(fieldPath);
      const lastPath = objPath.pop();

      // Create the variables that will iterate with objPath in newData and oldData
      let itData = newFieldsData;
      let itNewData = newData;
      let itOldData = oldData;
      objPath.forEach(path => {
        if (!is(itOldData[path], "object")) itOldData[path] = {};
        itOldData = itOldData[path];
        if (!is(itNewData[path], "object")) itNewData[path] = {};
        itNewData = itNewData[path];

        if (!is(itData[path], "object")) itData[path] = {};

        itData = itData[path];
      });

      // Set the last path value
      itData[lastPath] = itNewData[lastPath];
    });

    return this.validadeAndSetObj(newFieldsData, oldData);
  }

  /**
   * Recursively validade objects that are not FakeFieldValues instances to change it's data
   * @param newData The new data obj to iterate throw it's properties
   * @param oldData The old data obj that will have the new data proprties
   * @returns The changed old data object
   */
  private validadeAndSetObj(newData: any, oldData: any): any {
    Object.entries(newData).forEach(([key, value]) => {
      if (is(value, "object") && !(value instanceof FakeFieldValue)) {
        if (!oldData[key]) oldData[key] = {};
        this.validadeAndSetObj(value, oldData[key]);
      } else {
        this.setDataInPath(oldData, key, value);
      }
    });
    return oldData;
  }

  /**
   * Set the passed data in the target object, if data is a FakeFieldValue change based on it's type
   * @param targetObj The target object to add the data
   * @param path The path on the object to be changed
   * @param data The data to be added
   */
  private setDataInPath(targetObj: object, path: string, data: any | FakeFieldValue): void {
    if (!(data instanceof FakeFieldValue)) {
      if (is(data, "date")) data = FakeTimestamp.fromDate(data);
      targetObj[path] = data;
      return;
    }
    const fieldValue = data as FakeFieldValue;

    switch (fieldValue.type) {
      case FieldValueType.serverTimestamp:
        targetObj[path] = FakeTimestamp.fromDate(new Date());
        break;
      case FieldValueType.delete:
        delete targetObj[path];
        break;
      case FieldValueType.increment:
        targetObj[path] = is(targetObj[path], "number")
          ? targetObj[path] + fieldValue._data[0]
          : fieldValue._data[0];
        break;
      case FieldValueType.arrayUnion:
        if (!is(targetObj[path], "array")) targetObj[path] = [];
        targetObj[path].push(...fieldValue._data);
        break;
      case FieldValueType.arrayRemove:
        if (!is(targetObj[path], "array")) targetObj[path] = [];
        else
          fieldValue._data.forEach(itemToRemove => {
            const index = targetObj[path].findIndex(item => isEqual(item, itemToRemove));
            if (index !== -1) targetObj[path].splice(index, 1);
          });
        break;
    }
  }

  /**
   * Recursive function to get a doc or collection on database
   * @param segments Path segments used to iterate
   * @returns A CollectionDataRef if segments is odd or DocDataRef if it's even
   */
  public getCollection(segments: string[]): CollectionDataRef | DocDataRef {
    segments = segments.concat();
    jestMocks.fakeDatabase.doc.getCollection(segments.concat());
    const collectionId = segments.shift();
    const collection = this.getSubcollection(collectionId);
    if (!collection) return null;
    if (segments.length === 0) return collection;
    return collection.getDoc(segments);
  }

  /**
   * Creates a nested docs and collections with the given segments path
   * @param segments Path parts for the new collection ordoc
   * @param data Optional data for the new doc
   * @returns A CollectionDataRef if segments is odd or DocDataRef if it's even
   */
  public createPath(segments: string[], data: FakeDocData = {}): DocDataRef | CollectionDataRef {
    segments = segments.concat();
    jestMocks.fakeDatabase.doc.createPath(segments.concat(), data);
    // Get the collection id from segments and get the collection data ref from the subcollections
    const collectionId = segments.shift();
    let collection = this.getSubcollection(collectionId);
    // If the collection don't exists create a new one
    if (!collection) collection = this.createSubcollection(collectionId);
    // If segments is empty return the collection else continue creating the nested collections and docs
    if (segments.length === 0) return collection;
    return collection.createPath(segments, data);
  }
}
