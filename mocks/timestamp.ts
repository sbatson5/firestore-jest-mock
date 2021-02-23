const mockTimestampToDate = jest.fn();
const mockTimestampToMillis = jest.fn();
const mockTimestampFromDate = jest.fn();
const mockTimestampFromMillis = jest.fn();
const mockTimestampNow = jest.fn();

export const mocks = {
  mockTimestampToDate,
  mockTimestampToMillis,
  mockTimestampFromDate,
  mockTimestampFromMillis,
  mockTimestampNow,
};

export class Timestamp {
  seconds: number;
  nanoseconds: number;

  constructor(seconds: number, nanoseconds: number) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }

  isEqual(other: unknown): boolean {
    return (
      other instanceof Timestamp &&
      other.seconds === this.seconds &&
      other.nanoseconds === this.nanoseconds
    );
  }

  toDate(): Date {
    const d = new Date(0);
    d.setTime(this.seconds * 1000);
    d.setMilliseconds(this.nanoseconds / 1000000);
    return (mockTimestampToDate(...arguments) as Date | undefined) ?? d;
  }

  toMillis(): number {
    const d = new Date(0);
    d.setSeconds(this.seconds);
    d.setMilliseconds(this.nanoseconds / 1000000);
    return (mockTimestampToMillis(...arguments) as number | undefined) ?? d.getMilliseconds();
  }

  valueOf(): string {
    return JSON.stringify(this.toMillis());
  }

  static fromDate(date: Date): Timestamp {
    return (
      (mockTimestampFromDate(...arguments) as Timestamp | undefined) ??
      new Timestamp(date.getTime() * 0.001, date.getMilliseconds() * 1000000)
    );
  }

  static fromMillis(millis: number): Timestamp {
    const d = new Date(0);
    d.setMilliseconds(millis);
    return (
      (mockTimestampFromMillis(...arguments) as Timestamp | undefined) ?? Timestamp.fromDate(d)
    );
  }

  static now(): Timestamp {
    const now = new Date();
    return (mockTimestampNow(...arguments) as Timestamp | undefined) ?? Timestamp.fromDate(now);
  }
}
