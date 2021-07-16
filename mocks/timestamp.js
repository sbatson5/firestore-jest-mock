const mockTimestampToDate = jest.fn();
const mockTimestampToMillis = jest.fn();
const mockTimestampFromDate = jest.fn();
const mockTimestampFromMillis = jest.fn();
const mockTimestampNow = jest.fn();

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
    const nanoseconds = 1000000 * (millis - seconds * 1000);
    return new Timestamp(seconds, nanoseconds);
  }

  // Dates only return whole-number millis
  _toMillis() {
    return this.seconds * 1000 + Math.round(this.nanoseconds / 1000000);
  }

  static now() {
    const now = new Date();
    return mockTimestampNow(...arguments) || Timestamp.fromDate(now);
  }
}

//
// Search data for possible timestamps and convert to class.
function convertTimestamps(data, path = []) {
  if (!data) {
    return data;
  }
  // we need to avoid self-referencing DB's (can happen on db.get)
  // Check we have not looped.  If we have, backout
  if (path.includes(data)) {
    return;
  }

  // Check if this object is or contains a timestamp
  if (typeof data === 'object') {
    const keys = Object.keys(data);
    // if it is a timestamp, convert to the appropriate class
    if (
      keys.length === 2 &&
      keys.find(k => k === 'seconds') &&
      keys.find(k => k === 'nanoseconds')
    ) {
      return new Timestamp(data.seconds, data.nanoseconds);
    } else {
      // Search recursively for any timestamps in this data
      // Keep track of the path taken, so we can avoid self-referencing loops
      // Note: running full-setup.test.js will fail without this check
      // add console.log(`${path} => ${k}`); to see how this class is added as a property
      path.push(data);
      keys.forEach(k => {
        data[k] = convertTimestamps(data[k], path);
      });
      path.pop();
    }
  }
  return data;
}

module.exports = {
  Timestamp,
  convertTimestamps,
  mocks: {
    mockTimestampToDate,
    mockTimestampToMillis,
    mockTimestampFromDate,
    mockTimestampFromMillis,
    mockTimestampNow,
  },
};
