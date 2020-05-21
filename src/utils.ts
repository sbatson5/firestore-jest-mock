import { FakeFieldPath } from "./firestore/field-path";
import { SegmentType, TypeOf, KeyValue } from "types";

/**
 * Split the firestore paths segments
 * @param path The path to the resource
 * @param refType The resource that can be a `collection` or `doc`
 * @returns An string array with all parts of the path
 */
export function segmentFirestorePath(path: string, refType?: SegmentType): string[] {
  const segment = path.split("/");
  if (segment.some(seg => seg === "")) throw new Error(`invalid path cannot be "" empty string`);
  if (refType === "doc" && segment.length % 2 !== 0)
    throw new Error(`invalid path for document ${this.path} must have a even number of segments`);
  if (refType === "collection" && segment.length % 2 !== 1)
    throw new Error(`invalid path for collection ${this.path} must have a odd number of segments`);

  return segment;
}

/**
 * Verify if the fieldPath is a fake field path
 * @param value Value to test
 * @returns true if the value is a FakeFieldPath
 */
export function isFakeFieldPath(value: any): boolean {
  return value instanceof FakeFieldPath;
}

/**
 * Get the segments from the fieldPath
 * @param fieldPath A string of FakeFieldPath object
 * @returns A string array with the path parts
 */
export function getFieldSegments(fieldPath: string | FakeFieldPath): string[] {
  return isFakeFieldPath(fieldPath)
    ? (fieldPath as FakeFieldPath).segments
    : (fieldPath as string).split(".");
}

/**
 * Auto generate an id
 * @param length The length of the id string
 */
export function autoId(length: number = 20): string {
  // Validate length
  length = length <= 0 ? 20 : length;

  // Alphanumeric characters
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let autoId = "";
  for (let i = 0; i < length; i++) {
    autoId += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return autoId;
}

/**
 * Receives a value and check if it is of the type
 * @param value The value to check the type
 * @param type The type to test
 * @returns A boolean checking if the value is of the received type
 */
export function is(value: any, type: TypeOf): boolean {
  //Logic for null, array and data
  if (type === "array") return Array.isArray(value);
  if (type === "null") return value === null;
  if (type === "date") return value instanceof Date;

  // If type is object check if it's not null, an array or date
  if (type === "object" && (value === null || Array.isArray(value) || value instanceof Date))
    return false;

  //Set all types
  const types: TypeOf[] = [
    "boolean",
    "function",
    "number",
    "string",
    "undefined",
    "bigint",
    "symbol",
    "object"
  ];

  //Remove the selected type from the array
  const typeIndex: number = types.findIndex(t => t === type);
  types.splice(typeIndex, 1);

  //Check if the value is not from any other type
  return types.every((t: TypeOf) => t !== typeof value);
}

/**
 * Receives the data and the object and insert the data values in the object
 * @param data The data to be setted
 * @param obj The object to set the data
 * @param key If data isn't an object data with be setted in this key on `obj`
 * @returns A new object with the data values inserted
 */
export function setDataInObject(data: any, obj: any, key?: string): any {
  if (!is(data, "object")) {
    if (!key) throw new Error("key argument must be provided to set a data that is not a object");
    obj[key] = data;
    return obj;
  }

  Object.entries(data).forEach(([key, value]) => {
    // Check if value is a object
    if (is(value, "object")) {
      // if obj in position key isn't a object set it as an object
      if (!is(obj[key], "object")) obj[key] = {};

      obj[key] = setDataInObject(value, obj[key], key);
    } else {
      obj[key] = value;
    }
  });

  return obj;
}

/**
 * Check if the provided object has any undefined value in nested fields
 * @param obj The object to check
 * @return true if some value is undefined
 */
export function checkUndefined(obj: any): boolean {
  const objValues = Object.values(obj);
  for (const value of objValues) {
    // Set booleans to check undefined
    const valueIsUndefined = is(value, "undefined");
    const valueIsObjectAndHaveUndefined = is(value, "object") && checkUndefined(value);
    const valueIsArrayAndHaveUndefined = is(value, "array") && checkUndefined(value);
    // If some is tru return true
    if (valueIsUndefined || valueIsObjectAndHaveUndefined || valueIsArrayAndHaveUndefined)
      return true;
  }
  return false;
}

/**
 * Iterate throw an object and return the value within the given path
 * @param obj the object that will be iterate
 * @param paths the path for iteration, if a empty string or array is provided
 * just return the value
 */
export function iterateThrowObj<T = any, S = any>(obj: T, paths?: string | string[]): S {
  if (!paths || (!Array.isArray(paths) && typeof paths !== "string") || paths.length === 0)
    return (obj as any) as S;
  // Set a reference to the object
  const assingObj = Object.assign({}, obj);
  // If path is string convert it into an array
  const objPaths = typeof paths === "string" ? paths.split(".") : paths.concat();
  // Get the value inside path
  const value = assingObj[objPaths.shift()];
  if (!value) return value;
  // If the objects path is not empty and the value is a object return a recursive iterateThrowObj
  if (objPaths.length !== 0) return iterateThrowObj(value, objPaths);
  // Else just return the value
  return value;
}

/**
 * receives an object and return an array with every value path
 * @param obj Any object
 *
 * @returns An array with key value of each value in the object
 */
export function getObjectPaths(obj: object): KeyValue[] {
  let returnedValues: KeyValue[];
  let arrayKeyValue: KeyValue[] = [];

  Object.entries(obj).forEach(([key, value]) => {
    if (is(value, "object")) {
      //Check if value is an object
      //Get the returned {key, value} object
      returnedValues = getObjectPaths(value);

      //Map the values as a the key being a string array and the value
      const mapValues = returnedValues.map(
        (kv: KeyValue): KeyValue => ({
          key: [key].concat(kv.key),
          value: kv.value
        })
      );

      //concat every value as a column
      arrayKeyValue.push(...mapValues);
    } else {
      //Else just return return an array of the key
      arrayKeyValue.push({ key: [key], value });
    }
  });
  return arrayKeyValue;
}

/**
 * Create a reference for the given with object coping the data inside it
 * and removing
 * @param obj A object that can have nested objects and arrays
 * @returns A copy of the given object
 */
export function getObjectRef(obj: any): any {
  // If obj is not an array or object return the value
  if (!is(obj, "object") && !is(obj, "array")) return obj;
  // If it's an array return a recurcive map of the values inside
  if (is(obj, "array")) {
    return obj.concat().map(item => getObjectRef(item));
  }
  // If obj is a object create a reference and iterate on each property
  const ref = Object.assign({}, obj);
  Object.entries(ref).forEach(([key, value]) => {
    if (!is(value, "object") && !is(value, "array")) return;
    ref[key] = getObjectRef(value);
  });
  return ref;
}
