/// <reference types="jest" />
/** Representation of a jest object */
export interface JestFnObject {
    [prop: string]: jest.Mock;
}
/** Type of this firestore segment that can be a `collection` or `doc` */
export declare type SegmentType = 'collection' | 'doc';
/** Every javascript primitive type and aditional instance types */
export declare type TypeOf = 'boolean' | 'function' | 'number' | 'string' | 'undefined' | 'bigint' | 'symbol' | 'object' | 'null' | 'array' | 'date';
/** Key value object */
export interface KeyValue {
    key: string[];
    value: any;
}
