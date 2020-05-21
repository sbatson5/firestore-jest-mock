/** Types for a fake field value */
export declare enum FieldValueType {
    serverTimestamp = "serverTimestamp",
    delete = "delete",
    increment = "increment",
    arrayUnion = "arrayUnion",
    arrayRemove = "arrayRemove"
}
/**
 * Sentinel values that can be used when writing document fields with set(),
 * create() or update().
 */
export declare class FakeFieldValue {
    /** Field value type */
    type: FieldValueType;
    /** Field argument data */
    _data: any[];
    constructor();
    /**
     * Returns a sentinel used with set(), create() or update() to include a
     * generated timestamp in the written data.
     * @return The FakeFieldValue sentinel for use in a call to set(), create() or update().
     */
    static serverTimestamp(): FakeFieldValue;
    /**
     * Returns a sentinel for use with update() or set() with {merge:true} to
     * mark a field for deletion.
     * @return The FakeFieldValue sentinel for use in a call to set() or update().
     */
    static delete(): FakeFieldValue;
    /**
     * Returns a special value that can be used with set(), create() or update()
     * that tells the fake database to increment the field's current value by the given
     * value.
     * If the current field value is not of type 'number', or if the field does
     * not yet exist, the transformation will set the field to the given value.
     * @param n The value to increment by.
     * @return The FakeFieldValue sentinel for use in a call to set(), create() or
     * update().
     */
    static increment(n: number): FakeFieldValue;
    /**
     * Returns a special value that can be used with set(), create() or update()
     * that tells the fake database to union the given elements with any array value
     * that already exists on the fake database. Each specified element that doesn't
     * already exist in the array will be added to the end. If the field being
     * modified is not already an array it will be overwritten with an array
     * containing exactly the specified elements.
     * @param elements The elements to union into the array.
     * @return The FakeFieldValue sentinel for use in a call to set(), create() or update().
     */
    static arrayUnion(...elements: any[]): FakeFieldValue;
    /**
     * Returns a special value that can be used with set(), create() or update()
     * that tells the fake database to remove the given elements from any array value
     * that already exists on the fake database. All instances of each element
     * specified will be removed from the array. If the field being modified is
     * not already an array it will be overwritten with an empty array.
     * @param elements The elements to remove from the array.
     * @return The FakeFieldValue sentinel for use in a call to set(), create() or
     * update().
     */
    static arrayRemove(...elements: any[]): FakeFieldValue;
    /**
     * Returns true if this `FakeFieldValue` is equal to the provided one.
     * @param other The `FakeFieldValue` to compare against.
     * @return true if this `FakeFieldValue` is equal to the provided one.
     */
    isEqual(other: FakeFieldValue): boolean;
}
/**
 * Creates a FakeFieldValue for the static methods
 * @param type The FakeFieldValue type
 * @param args The FakeFieldValue data arguments
 * @return A FakeFieldValue instance
 */
export declare function getFakeFieldValue(type: FieldValueType, ...args: any[]): FakeFieldValue;
