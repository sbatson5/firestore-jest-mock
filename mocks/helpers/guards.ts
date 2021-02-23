/**
 * Returns the provided value if it is a `number`. Otherwise, returns `undefined`.
 * @param value The value to check.
 */
export function valueIfNumber(value: unknown): number | undefined {
  if (value !== null && value !== undefined && typeof value === 'number') {
    return value;
  }
  return undefined;
}

/**
 * Returns the provided value if it is an instance of the given class. Otherwise, returns `undefined`.
 * @param value The value to check.
 * @param c The type of value to check against.
 */
export function valueIfInstance<T>(value: unknown, c: Class<T>): T | undefined {
  if (value !== null && value !== undefined && value instanceof c) {
    return value;
  }
  return undefined;
}

/**
 * Returns the provided value if it is an instance of the `Date` class. Otherwise, returns `undefined`.
 * @param value The value to check.
 */
export function valueIfDate(value: unknown): Date | undefined {
  return valueIfInstance(value, Date);
}
