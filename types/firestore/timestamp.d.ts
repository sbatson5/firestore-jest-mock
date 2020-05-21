export declare class FakeTimestamp {
    private readonly _seconds;
    private readonly _nanoseconds;
    constructor(seconds: number, nanoseconds: number);
    /**
     * Creates a new timestamp with the current date, with millisecond precision.
     * @return A new `FakeTimestamp` representing the current date.
     */
    static now(): FakeTimestamp;
    /**
     * Creates a new fake timestamp from the given date.
     * @param date The date to initialize the `FakeTimestamp` from.
     * @return A new `FakeTimestamp` representing the same point in time
     * as the given date.
     */
    static fromDate(date: Date): FakeTimestamp;
    /**
     * Creates a new timestamp from the given number of milliseconds.
     * @param milliseconds Number of milliseconds since Unix epoch
     * @return A new `FakeTimestamp` representing the same point in time
     * as the given number of milliseconds.
     */
    static fromMillis(milliseconds: number): FakeTimestamp;
    /** The number of seconds of UTC time since Unix epoch 1970-01-01T00:00:00Z. */
    get seconds(): number;
    /** The non-negative fractions of a second at nanosecond resolution. */
    get nanoseconds(): number;
    /**
     * Returns a new `Date` corresponding to this timestamp. This may lose
     * precision.
     * @return JavaScript `Date` object representing the same point in time
     * as this `FakeTimestamp`, with millisecond precision.
     */
    toDate(): Date;
    /**
     * Returns the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
     * @return The point in time corresponding to this timestamp, represented as
     * the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
     */
    toMillis(): number;
    /**
     * Returns true if this `FakeTimestamp` is equal to the provided one.
     * @param other The `FakeTimestamp` to compare against.
     * @return true if this `FakeTimestamp` is equal to the provided one.
     */
    isEqual(other: FakeTimestamp): boolean;
}
