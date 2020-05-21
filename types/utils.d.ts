import { FakeFieldPath } from "./firestore/field-path";
import { SegmentType, TypeOf, KeyValue } from "types";
/**
 * Split the firestore paths segments
 * @param path The path to the resource
 * @param refType The resource that can be a `collection` or `doc`
 * @returns An string array with all parts of the path
 */
export declare function segmentFirestorePath(path: string, refType?: SegmentType): string[];
/**
 * Verify if the fieldPath is a fake field path
 * @param value Value to test
 * @returns true if the value is a FakeFieldPath
 */
export declare function isFakeFieldPath(value: any): boolean;
/**
 * Get the segments from the fieldPath
 * @param fieldPath A string of FakeFieldPath object
 * @returns A string array with the path parts
 */
export declare function getFieldSegments(fieldPath: string | FakeFieldPath): string[];
/**
 * Auto generate an id
 * @param length The length of the id string
 */
export declare function autoId(length?: number): string;
/**
 * Receives a value and check if it is of the type
 * @param value The value to check the type
 * @param type The type to test
 * @returns A boolean checking if the value is of the received type
 */
export declare function is(value: any, type: TypeOf): boolean;
/**
 * Receives the data and the object and insert the data values in the object
 * @param data The data to be setted
 * @param obj The object to set the data
 * @param key If data isn't an object data with be setted in this key on `obj`
 * @returns A new object with the data values inserted
 */
export declare function setDataInObject(data: any, obj: any, key?: string): any;
/**
 * Check if the provided object has any undefined value in nested fields
 * @param obj The object to check
 * @return true if some value is undefined
 */
export declare function checkUndefined(obj: any): boolean;
/**
 * Iterate throw an object and return the value within the given path
 * @param obj the object that will be iterate
 * @param paths the path for iteration, if a empty string or array is provided
 * just return the value
 */
export declare function iterateThrowObj<T = any, S = any>(obj: T, paths?: string | string[]): S;
/**
 * receives an object and return an array with every value path
 * @param obj Any object
 *
 * @returns An array with key value of each value in the object
 */
export declare function getObjectPaths(obj: object): KeyValue[];
/**
 * Create a reference for the given with object coping the data inside it
 * and removing
 * @param obj A object that can have nested objects and arrays
 * @returns A copy of the given object
 */
export declare function getObjectRef(obj: any): any;
