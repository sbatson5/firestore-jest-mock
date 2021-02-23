const mockArrayUnionFieldValue = jest.fn();
const mockArrayRemoveFieldValue = jest.fn();
const mockDeleteFieldValue = jest.fn();
const mockIncrementFieldValue = jest.fn();
const mockServerTimestampFieldValue = jest.fn();

export const mocks = {
  mockArrayUnionFieldValue,
  mockArrayRemoveFieldValue,
  mockDeleteFieldValue,
  mockIncrementFieldValue,
  mockServerTimestampFieldValue,
};

type FieldValueType = 'arrayUnion' | 'arrayRemove' | 'increment' | 'serverTimestamp' | 'delete';

export class FieldValue {
  type: FieldValueType;
  value: string | number | unknown[] | undefined;

  constructor(type: FieldValueType, value?: string | number | unknown[]) {
    this.type = type;
    this.value = value;
  }

  isEqual(other: unknown): boolean {
    return other instanceof FieldValue && other.type === this.type && other.value === this.value;
  }

  static arrayUnion(elements: unknown[] = []): FieldValue {
    mockArrayUnionFieldValue(...arguments);
    if (!Array.isArray(elements)) {
      elements = [elements];
    }
    return new FieldValue('arrayUnion', elements);
  }

  static arrayRemove(elements: unknown[] = []): FieldValue {
    mockArrayRemoveFieldValue(...arguments);
    if (!Array.isArray(elements)) {
      elements = [elements];
    }
    return new FieldValue('arrayRemove', elements);
  }

  static increment(amount = 1): FieldValue {
    mockIncrementFieldValue(...arguments);
    return new FieldValue('increment', amount);
  }

  static serverTimestamp(): FieldValue {
    mockServerTimestampFieldValue(...arguments);
    return new FieldValue('serverTimestamp');
  }

  static delete(): FieldValue {
    mockDeleteFieldValue(...arguments);
    return new FieldValue('delete');
  }
}
