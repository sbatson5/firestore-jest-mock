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
    return mockTimestampToDate(...arguments) || new Date(this._toMillis());
  }

  toMillis() {
    return mockTimestampToMillis(...arguments) || this._toMillis();
  }

  // Dates only return whole-number millis
  _toMillis() {
    return this.seconds * 1000 + Math.round(this.nanoseconds / 1000000);
  }

  valueOf() {
    return JSON.stringify(this.toMillis());
  }

  static fromDate(date) {
    return mockTimestampFromDate(...arguments) || Timestamp._fromMillis(date.getTime());
  }

  static fromMillis(millis) {
    return mockTimestampFromMillis(...arguments) || Timestamp._fromMillis(millis);
  }

  static _fromMillis(millis) {
    const seconds = Math.floor(millis / 1000);
    const nanoseconds = 1000000 * (millis % 1000);
    return new Timestamp(seconds, nanoseconds);
  }

  static now() {
    const now = new Date();
    return Timestamp.fromDate(now);
  }
}

module.exports = {
  Timestamp,
  mocks: {
    mockTimestampToDate,
    mockTimestampToMillis,
    mockTimestampFromDate,
    mockTimestampFromMillis,
  },
};
