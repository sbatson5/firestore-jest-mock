import {
  mockArrayUnionFieldValue,
  mockArrayRemoveFieldValue,
  mockDeleteFieldValue,
  mockIncrementFieldValue,
  mockServerTimestampFieldValue,
} from './mockRegistry';

export class FieldValue {
  type: string;
  value: unknown;

  constructor(type: string, value?: unknown) {
    this.type = type;
    this.value = value;
  }

  isEqual(other: FieldValue): boolean {
    return other instanceof FieldValue && other.type === this.type && other.value === this.value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static arrayUnion(elements: any[] | any = []): FieldValue {
    mockArrayUnionFieldValue(elements);
    if (!Array.isArray(elements)) {
      elements = [elements];
    }
    return new FieldValue('arrayUnion', elements);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static arrayRemove(elements: any[] | any): FieldValue {
    mockArrayRemoveFieldValue(elements);
    if (!Array.isArray(elements)) {
      elements = [elements];
    }
    return new FieldValue('arrayRemove', elements);
  }

  static increment(amount = 1): FieldValue {
    mockIncrementFieldValue(amount);
    return new FieldValue('increment', amount);
  }

  static serverTimestamp(): FieldValue {
    mockServerTimestampFieldValue();
    return new FieldValue('serverTimestamp');
  }

  static delete(): FieldValue {
    mockDeleteFieldValue();
    return new FieldValue('delete');
  }
}

export const mocks = {
  mockArrayUnionFieldValue,
  mockArrayRemoveFieldValue,
  mockDeleteFieldValue,
  mockIncrementFieldValue,
  mockServerTimestampFieldValue,
};
