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

module.exports = {
  Timestamp,
  mocks: {
    mockTimestampToDate,
    mockTimestampToMillis,
    mockTimestampFromDate,
    mockTimestampFromMillis,
  },
};
