import { FakeFieldPath, FakeFieldValue, FakeTimestamp, jestMocks, FieldValueType } from "../import";
import { is } from "../utils/helpers";

beforeEach(() => {
  // Reset jest before each test
  jest.resetAllMocks();
});

it("should create a instance of FakeFieldPath", () => {
  const path = ["a", "b", "c"];
  const fieldPath = new FakeFieldPath(...path);

  expect(fieldPath.segments).toEqual(path);
});

describe("Test FakeFieldValue methods", () => {
  const fieldValueMocks = jestMocks.fieldValue;

  it("should create serverTimestamp FakeFieldValue", () => {
    const fieldValue = FakeFieldValue.serverTimestamp();

    expect(fieldValue._data).toEqual([]);
    expect(fieldValue.type).toBe(FieldValueType.serverTimestamp);

    expect(fieldValueMocks.serverTimestamp.mock.calls.length).toBe(1);
  });

  it("should create delete FakeFieldValue", () => {
    const fieldValue = FakeFieldValue.delete();

    expect(fieldValue._data).toEqual([]);
    expect(fieldValue.type).toBe(FieldValueType.delete);

    expect(fieldValueMocks.delete.mock.calls.length).toBe(1);
  });

  it("should create increment FakeFieldValue", () => {
    const increment = 5;
    const fieldValue = FakeFieldValue.increment(increment);

    expect(fieldValue._data).toEqual([increment]);
    expect(fieldValue.type).toBe(FieldValueType.increment);

    expect(fieldValueMocks.increment.mock.calls.length).toBe(1);
    expect(fieldValueMocks.increment.mock.calls[0][0]).toBe(increment);
  });

  it("should create arrayUnion FakeFieldValue", () => {
    const arr = [1, 2, 3];
    const fieldValue = FakeFieldValue.arrayUnion(...arr);

    expect(fieldValue._data).toEqual(arr);
    expect(fieldValue.type).toBe(FieldValueType.arrayUnion);

    expect(fieldValueMocks.arrayUnion.mock.calls.length).toBe(1);
    expect(fieldValueMocks.arrayUnion.mock.calls[0]).toEqual(arr);
  });

  it("should create arrayRemove FakeFieldValue", () => {
    const arr = [1, 2, 3];
    const fieldValue = FakeFieldValue.arrayRemove(...arr);

    expect(fieldValue._data).toEqual(arr);
    expect(fieldValue.type).toBe(FieldValueType.arrayRemove);

    expect(fieldValueMocks.arrayRemove.mock.calls.length).toBe(1);
    expect(fieldValueMocks.arrayRemove.mock.calls[0]).toEqual(arr);
  });

  it('should compare two FakeFieldValue instances', () => {
    const fieldValue_1 = FakeFieldValue.increment(2)
    const fieldValue_2 = FakeFieldValue.increment(2)

    expect(fieldValue_1.isEqual(fieldValue_2)).toBeTruthy()

    expect(fieldValueMocks.isEqual.mock.calls.length).toBe(1)
    expect(fieldValueMocks.isEqual.mock.calls[0][0]).toEqual(fieldValue_2)
  });
});

describe("Test FakeTimestamp methods", () => {
  const timestampMock = jestMocks.timestamp;

  it("should create a FakeTimestamp with now() static method", () => {
    const timestamp = FakeTimestamp.now();

    expect(is(timestamp.nanoseconds, "number")).toBeTruthy();
    expect(is(timestamp.seconds, "number")).toBeTruthy();

    expect(timestampMock.now.mock.calls.length).toBe(1);
  });

  it("should create a FakeTimestamp with fromDate() static method and get the milliseconds with toDate()", () => {
    const date = new Date();
    const timestamp = FakeTimestamp.fromDate(date);

    expect(timestamp.toDate()).toEqual(date);

    expect(timestampMock.fromDate.mock.calls.length).toBe(1);
    expect(timestampMock.fromDate.mock.calls[0][0]).toEqual(date);

    expect(timestampMock.toDate.mock.calls.length).toBe(1);
  });

  it("should create a FakeTimestamp with fromMillis() static method and get the milliseconds with toMillis()", () => {
    const now = Date.now();
    const timestamp = FakeTimestamp.fromMillis(now);

    expect(timestamp.toMillis()).toEqual(now);

    expect(timestampMock.fromMillis.mock.calls.length).toBe(1);
    expect(timestampMock.fromMillis.mock.calls[0][0]).toBe(now);

    expect(timestampMock.toMillis.mock.calls.length).toBe(1);
  });

  it("should compare two FakeTimestamp instances", () => {
    const date = new Date();
    const timestamp_1 = FakeTimestamp.fromDate(date);
    const timestamp_2 = FakeTimestamp.fromMillis(date.valueOf());

    expect(timestamp_1.isEqual(timestamp_2)).toBeTruthy();

    expect(timestampMock.isEqual.mock.calls.length).toBe(1);
    expect(timestampMock.isEqual.mock.calls[0][0]).toEqual(timestamp_2);
  });
});
