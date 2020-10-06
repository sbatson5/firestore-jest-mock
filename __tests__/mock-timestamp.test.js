const { FakeFirestore } = require('firestore-jest-mock');
const {
  mockTimestampToDate,
  mockTimestampToMillis,
  mockTimestampNow,
} = require('firestore-jest-mock/mocks/firestore');

describe('Timestamp mock', () => {
  test('it is equal to itself', () => {
    const timestamp = new FakeFirestore.Timestamp(500, 20);
    expect(timestamp.isEqual(timestamp)).toBe(true);
  });

  test('it is equal to a separate instance', () => {
    const timestamp = new FakeFirestore.Timestamp(500, 20);
    const other = new FakeFirestore.Timestamp(500, 20);
    expect(timestamp.isEqual(other)).toBe(true);
  });

  test('it is not equal to an instance whose properties differ', () => {
    const timestamp = new FakeFirestore.Timestamp(500, 20);
    const diffSeconds = new FakeFirestore.Timestamp(550, 20);
    const diffNano = new FakeFirestore.Timestamp(500, 40);
    const diffAll = new FakeFirestore.Timestamp(550, 40);
    expect(timestamp.isEqual(diffSeconds)).toBe(false);
    expect(timestamp.isEqual(diffNano)).toBe(false);
    expect(timestamp.isEqual(diffAll)).toBe(false);
  });

  test('it converts itself roughly to a Date representation', () => {
    // Since this is a mock (and I'm bad with time maths) we don't expect nanosecond accuracy
    const timestamp = new FakeFirestore.Timestamp(40, 0);
    expect(timestamp.toDate()).toBeInstanceOf(Date);
    expect(timestamp.toDate().getSeconds()).toBe(40);
    expect(mockTimestampToDate).toHaveBeenCalled();
  });

  test('it allows clients to override the Date representation', () => {
    const timestamp = new FakeFirestore.Timestamp(40, 0);
    const now = new Date();
    mockTimestampToDate.mockReturnValueOnce(now);
    expect(timestamp.toDate()).toBe(now);
    expect(timestamp.toDate().getSeconds()).toBe(40); // second call should be the original
  });

  test('it converts itself roughly to millisecond representation', () => {
    // The mock only returns 0, but it calls mockTimestampToMillis first, returning its result if defined
    const timestamp = new FakeFirestore.Timestamp(40, 80);
    const now = new Date();
    mockTimestampToMillis.mockReturnValueOnce(now.getMilliseconds());
    expect(timestamp.toMillis()).toBe(now.getMilliseconds());
    expect(timestamp.toMillis()).toBe(0); // second call should be the original
    expect(mockTimestampToMillis).toHaveBeenCalledTimes(2);
  });

  test('it creates an instance roughly from a Date representation', () => {
    const now = new Date();
    const timestamp = FakeFirestore.Timestamp.fromDate(now);
    expect(timestamp).toBeDefined();
    expect(timestamp).toBeInstanceOf(FakeFirestore.Timestamp);
    expect(timestamp.toDate().getTime()).toBe(now.getTime());
  });

  test('it creates an instance roughly from a millisecond representation', () => {
    const date = new Date(0);
    date.setMilliseconds(54000);
    const timestamp = FakeFirestore.Timestamp.fromMillis(54000);
    expect(timestamp).toBeDefined();
    expect(timestamp).toBeInstanceOf(FakeFirestore.Timestamp);
    expect(timestamp.seconds).toBe(date.getSeconds());
  });

  test('Timestamp.now reports calls to mockTimestampNow', () => {
    expect(mockTimestampNow).not.toHaveBeenCalled();
    const timestamp = FakeFirestore.Timestamp.now();
    expect(timestamp).toBeInstanceOf(FakeFirestore.Timestamp);
    expect(mockTimestampNow).toHaveBeenCalled();
  });

  test('Timestamp.now can be mocked', () => {
    mockTimestampNow.mockReturnValueOnce('Success!');
    const timestamp = FakeFirestore.Timestamp.now();
    expect(timestamp).toBe('Success!');
  });
});
