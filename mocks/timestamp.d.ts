export class Timestamp {
  constructor(seconds: number, nanoseconds: number);

  isEqual(other: Timestamp): boolean;
  toDate(): Date;
  toMillis(): number;
  valueOf(): string;

  static fromDate(date: Date): Timestamp;
  static fromMillis(millis: number): Timestamp;
  static now(): Timestamp;
}

export const mocks: {
  mockTimestampToDate: jest.Mock;
  mockTimestampToMillis: jest.Mock;
  mockTimestampFromDate: jest.Mock;
  mockTimestampFromMillis: jest.Mock;
  mockTimestampNow: jest.Mock;
};
