import { jestMocks } from "../jest-fn";

/** Number of nanoseconds in a millisecond. */
const MS_TO_NANOS = 1000000;

export class FakeTimestamp {
  private readonly _seconds: number;
  private readonly _nanoseconds: number;

  constructor(seconds: number, nanoseconds: number) {
    this._seconds = seconds;
    this._nanoseconds = nanoseconds;
  }

  /**
   * Creates a new timestamp with the current date, with millisecond precision.
   * @return A new `FakeTimestamp` representing the current date.
   */
  static now(): FakeTimestamp {
    jestMocks.timestamp.now();
    return FakeTimestamp.fromMillis(Date.now());
  }

  /**
   * Creates a new fake timestamp from the given date.
   * @param date The date to initialize the `FakeTimestamp` from.
   * @return A new `FakeTimestamp` representing the same point in time
   * as the given date.
   */
  static fromDate(date: Date): FakeTimestamp {
    jestMocks.timestamp.fromDate(date);
    return FakeTimestamp.fromMillis(date.getTime());
  }

  /**
   * Creates a new timestamp from the given number of milliseconds.
   * @param milliseconds Number of milliseconds since Unix epoch
   * @return A new `FakeTimestamp` representing the same point in time
   * as the given number of milliseconds.
   */
  static fromMillis(milliseconds: number): FakeTimestamp {
    jestMocks.timestamp.fromMillis(milliseconds);
    const seconds = Math.floor(milliseconds / 1000);
    const nanos = (milliseconds - seconds * 1000) * MS_TO_NANOS;
    return new FakeTimestamp(seconds, nanos);
  }

  /** The number of seconds of UTC time since Unix epoch 1970-01-01T00:00:00Z. */
  get seconds(): number {
    jestMocks.timestamp.seconds();
    return this._seconds;
  }

  /** The non-negative fractions of a second at nanosecond resolution. */
  get nanoseconds() {
    jestMocks.timestamp.nanoseconds();
    return this._nanoseconds;
  }

  /**
   * Returns a new `Date` corresponding to this timestamp. This may lose
   * precision.
   * @return JavaScript `Date` object representing the same point in time
   * as this `FakeTimestamp`, with millisecond precision.
   */
  public toDate(): Date {
    jestMocks.timestamp.toDate();
    return new Date(this._seconds * 1000 + Math.round(this._nanoseconds / MS_TO_NANOS));
  }

  /**
   * Returns the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
   * @return The point in time corresponding to this timestamp, represented as
   * the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
   */
  public toMillis(): number {
    jestMocks.timestamp.toMillis();
    return this._seconds * 1000 + Math.floor(this._nanoseconds / MS_TO_NANOS);
  }

  /**
   * Returns true if this `FakeTimestamp` is equal to the provided one.
   * @param other The `FakeTimestamp` to compare against.
   * @return true if this `FakeTimestamp` is equal to the provided one.
   */
  public isEqual(other: FakeTimestamp): boolean {
    jestMocks.timestamp.isEqual(other);
    return (
      this === other ||
      (other instanceof FakeTimestamp &&
        this._seconds === other.seconds &&
        this._nanoseconds === other.nanoseconds)
    );
  }
}
