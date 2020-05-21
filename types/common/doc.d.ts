import { FakeFieldPath } from '../index';
/** Fake SetOptions interface for doc set() method */
export interface FakeSetOptions {
    merge?: boolean;
    mergeFields?: (string | FakeFieldPath)[];
}
/**
 * An options object that can be used to configure the behavior of `getAll()`
 * calls. By providing a `fieldMask`, these calls can be configured to only
 * return a subset of fields.
 */
export interface FakeReadOptions {
    readonly fieldMask?: (string | FakeFieldPath)[];
}
