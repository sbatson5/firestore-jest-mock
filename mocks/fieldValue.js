/*
 * ============
 *  Timestamp
 * ============
 */

const mockTimestampToDate = jest.fn();
const mockTimestampToMillis = jest.fn();
const mockTimestampFromDate = jest.fn();
const mockTimestampFromMillis = jest.fn();

class Timestamp {
  constructor(seconds, nanoseconds) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }

  isEqual(other) {
    return (
      other instanceof Timestamp &&
      other.seconds === this.seconds &&
      other.nanoseconds === this.nanoseconds
    );
  }

  toDate() {
    const d = new Date(0);
    d.setSeconds(this.seconds);
    d.setMilliseconds(this.nanoseconds / 1000000);
    return mockTimestampToDate(...arguments) || d;
  }

  toMillis() {
    const d = new Date(0);
    d.setSeconds(this.seconds);
    d.setMilliseconds(this.nanoseconds / 1000000);
    return mockTimestampToMillis(...arguments) || d.getMilliseconds();
  }

  valueOf() {
    return JSON.stringify(this.toMillis());
  }

  static fromDate(date) {
    return (
      mockTimestampFromDate(...arguments) ||
      new Timestamp(date.getSeconds(), date.getMilliseconds() * 1000000)
    );
  }

  static fromMillis(millis) {
    const d = new Date(0);
    d.setMilliseconds(millis);
    return mockTimestampFromMillis(...arguments) || Timestamp.fromDate(d);
  }

  static now() {
    const now = new Date();
    return Timestamp.fromDate(now);
  }
}

/*
 * ============
 *  FieldValue
 * ============
 */

const mockArrayUnionFieldValue = jest.fn();
const mockArrayRemoveFieldValue = jest.fn();
const mockDeleteFieldValue = jest.fn();
const mockIncrementFieldValue = jest.fn();
const mockServerTimestampFieldValue = jest.fn();

class FieldValue {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }

  isEqual(other) {
    return other instanceof FieldValue && other.type === this.type && other.value === this.value;
  }

  transform(value) {
    switch (this.type) {
      case 'arrayUnion':
        if (Array.isArray(value)) {
          return value.concat(this.value.filter(v => !value.includes(v)));
        } else {
          return this.value;
        }
      case 'arrayRemove':
        if (Array.isArray(value)) {
          return value.filter(v => !this.value.includes(v));
        } else {
          return value;
        }
      case 'increment': {
        const amount = Number(this.value);
        if (typeof value === 'number') {
          return value + amount;
        } else {
          return amount;
        }
      }
      case 'serverTimestamp': {
        return Timestamp.now();
      }
      case 'delete':
        return undefined;
    }
  }

  static arrayUnion(elements = []) {
    mockArrayUnionFieldValue(...arguments);
    if (!Array.isArray(elements)) {
      elements = [elements];
    }
    return new FieldValue('arrayUnion', elements);
  }

  static arrayRemove(elements) {
    mockArrayRemoveFieldValue(...arguments);
    if (!Array.isArray(elements)) {
      elements = [elements];
    }
    return new FieldValue('arrayRemove', elements);
  }

  static increment(amount = 1) {
    mockIncrementFieldValue(...arguments);
    return new FieldValue('increment', amount);
  }

  static serverTimestamp() {
    mockServerTimestampFieldValue(...arguments);
    return new FieldValue('serverTimestamp');
  }

  static delete() {
    mockDeleteFieldValue(...arguments);
    return new FieldValue('delete');
  }
}

module.exports = {
  Timestamp,
  FieldValue,
  mocks: {
    mockArrayUnionFieldValue,
    mockArrayRemoveFieldValue,
    mockDeleteFieldValue,
    mockIncrementFieldValue,
    mockServerTimestampFieldValue,
    mockTimestampToDate,
    mockTimestampToMillis,
    mockTimestampFromDate,
    mockTimestampFromMillis,
  },
};
