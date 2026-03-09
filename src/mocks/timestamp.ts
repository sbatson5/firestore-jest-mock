import {
  mockTimestampToDate,
  mockTimestampToMillis,
  mockTimestampFromDate,
  mockTimestampFromMillis,
  mockTimestampNow,
} from './mockRegistry';

export class Timestamp {
  seconds: number;
  nanoseconds: number;

  constructor(seconds: number, nanoseconds: number) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }

  isEqual(other: Timestamp): boolean {
    return (
      other instanceof Timestamp &&
      other.seconds === this.seconds &&
      other.nanoseconds === this.nanoseconds
    );
  }

  toDate(): Date {
    return mockTimestampToDate() || new Date(this._toMillis());
  }

  toMillis(): number {
    return mockTimestampToMillis() || this._toMillis();
  }

  valueOf(): string {
    return JSON.stringify(this.toMillis());
  }

  static fromDate(date: Date): Timestamp {
    return mockTimestampFromDate(date) || Timestamp._fromMillis(date.getTime());
  }

  static fromMillis(millis: number): Timestamp {
    return mockTimestampFromMillis(millis) || Timestamp._fromMillis(millis);
  }

  static _fromMillis(millis: number): Timestamp {
    const seconds = Math.floor(millis / 1000);
    const nanoseconds = 1000000 * (millis - seconds * 1000);
    return new Timestamp(seconds, nanoseconds);
  }

  _toMillis(): number {
    return this.seconds * 1000 + Math.round(this.nanoseconds / 1000000);
  }

  static now(): Timestamp {
    const now = new Date();
    return mockTimestampNow() || Timestamp.fromDate(now);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertTimestamps(data: any, path: any[] = []): any {
  if (!data) {
    return data;
  }
  if (path.includes(data)) {
    return;
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (
      keys.length === 2 &&
      keys.find(k => k === 'seconds') &&
      keys.find(k => k === 'nanoseconds')
    ) {
      return new Timestamp(data.seconds, data.nanoseconds);
    } else {
      path.push(data);
      keys.forEach(k => {
        data[k] = convertTimestamps(data[k], path);
      });
      path.pop();
    }
  }
  return data;
}

export const mocks = {
  mockTimestampToDate,
  mockTimestampToMillis,
  mockTimestampFromDate,
  mockTimestampFromMillis,
  mockTimestampNow,
};
