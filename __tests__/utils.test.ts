import { resetJestFnObj, FakeFieldPath } from "./import";
import {
  segmentFirestorePath,
  isFakeFieldPath,
  getFieldSegments,
  autoId,
  is,
  setDataInObject,
  checkUndefined,
  iterateThrowObj,
  getObjectPaths,
  getObjectRef
} from "./utils/helpers";
import { isEqual } from "lodash";

it("should reset all jest mock functions of an object", () => {
  const jestFnObj = {
    a: jest.fn(),
    b: jest.fn(),
    c: jest.fn()
  };

  Object.values(jestFnObj).forEach(fn => fn(Math.random()));

  resetJestFnObj(jestFnObj);

  const isEveryFnReseted = Object.values(jestFnObj).every(fn => fn.mock.calls.length === 0);
  expect(isEveryFnReseted).toBeTruthy();
});

it("should get a string array from segmentFirestorePath()", () => {
  const stringPath = "collection/doc/collection/doc";

  const expectedResult = ["collection", "doc", "collection", "doc"];
  expect(segmentFirestorePath(stringPath)).toEqual(expectedResult);

  // Expect errors
  expect(() => segmentFirestorePath("")).toThrow();
  expect(() => segmentFirestorePath("invalid_doc_path", "doc")).toThrow();
  expect(() => segmentFirestorePath("invalid/collection_path", "collection")).toThrow();
});

it("should test is the input is a FakeFieldPath with isFakeFieldPath()", () => {
  expect(isFakeFieldPath(new FakeFieldPath())).toBeTruthy();
  expect(isFakeFieldPath({})).toBeFalsy();
});

it("should get a string array from a object string or FakeFieldPath with getFieldSegments()", () => {
  const expectedResult = ["a", "b", "c"];
  expect(getFieldSegments("a.b.c")).toEqual(expectedResult);
  expect(getFieldSegments(new FakeFieldPath("a", "b", "c"))).toEqual(expectedResult);
});

it("should generate an id with autoId()", () => {
  expect(autoId().length).toBe(20);
  expect(autoId(-10).length).toBe(20);
  expect(autoId(100).length).toBe(100);
});

it("should to indicate if a value is the given type with is()", () => {
  expect(is(true, "boolean")).toBeTruthy();
  expect(is(false, "boolean")).toBeTruthy();
  expect(is(() => {}, "function")).toBeTruthy();
  expect(is(7, "number")).toBeTruthy();
  expect(is("", "string")).toBeTruthy();
  expect(is("str", "string")).toBeTruthy();
  expect(is(undefined, "undefined")).toBeTruthy();
  // expect(is(1000n, "bigint")).toBeTruthy();
  expect(is(BigInt(1000), "bigint")).toBeTruthy();
  expect(is(Symbol(), "symbol")).toBeTruthy();
  expect(is({}, "object")).toBeTruthy();
  expect(is(null, "null")).toBeTruthy();
  expect(is([], "array")).toBeTruthy();
  expect(is(new Date(), "date")).toBeTruthy();

  let invalidValue = {};
  expect(is(invalidValue, "boolean")).toBeFalsy();
  expect(is(invalidValue, "function")).toBeFalsy();
  expect(is(invalidValue, "number")).toBeFalsy();
  expect(is(invalidValue, "string")).toBeFalsy();
  expect(is(invalidValue, "string")).toBeFalsy();
  expect(is(invalidValue, "undefined")).toBeFalsy();
  expect(is(invalidValue, "bigint")).toBeFalsy();
  expect(is(invalidValue, "symbol")).toBeFalsy();
  expect(is(invalidValue, "null")).toBeFalsy();
  expect(is(invalidValue, "array")).toBeFalsy();
  expect(is(invalidValue, "date")).toBeFalsy();

  invalidValue = undefined;
  expect(is(invalidValue, "object")).toBeFalsy();
});

it("should set the input data in the object with setDataInObject()", () => {
  const targetObj = {
    a: {
      b: {
        c: 1
      },
      d: 2
    },
    e: 3,
    f: {
      g: 4
    },
    i: 6
  };

  const data = {
    a: {
      b: {
        c: 4,
        h: 5
      }
    },
    i: {
      j: 7
    }
  };

  expect(setDataInObject(data, targetObj)).toEqual({
    a: {
      b: {
        c: 4,
        h: 5
      },
      d: 2
    },
    e: 3,
    f: {
      g: 4
    },
    i: {
      j: 7
    }
  });

  expect(setDataInObject("value", { path: "data" }, "path")).toEqual({ path: "value" });

  expect(() => setDataInObject("data", {})).toThrow();
});

it("should deeply check if an object has a undefined in it's value with checkUndefined()", () => {
  const objWitUndefined_1 = { a: { b: { c: undefined }, d: null, e: { f: 0 } } };
  const objWitUndefined_2 = { g: null, h: { i: [undefined] } };
  const objectWithoutUndefined = { j: { k: "" }, l: 0, m: [1, 2, 3] };

  expect(checkUndefined(objWitUndefined_1)).toBeTruthy();
  expect(checkUndefined(objWitUndefined_2)).toBeTruthy();
  expect(checkUndefined(objectWithoutUndefined)).toBeFalsy();
});

it("should get a data on an object with iterateThrowObj()", () => {
  const obj = {
    data: {
      arr: [1, 2, 3]
    },
    deeply: {
      nested: {
        value: "value"
      }
    },
    num: 7
  };

  expect(iterateThrowObj(obj, ["data", "arr"])).toEqual(obj.data.arr);
  expect(iterateThrowObj(obj, "deeply.nested.value")).toEqual(obj.deeply.nested.value);
  expect(iterateThrowObj(obj, "num")).toEqual(obj.num);
  expect(iterateThrowObj(obj)).toEqual(obj);

  expect(iterateThrowObj({ a: 1 }, "a.b.c.d")).toBeUndefined();
});

it("should ", () => {
  const obj = {
    data: {
      rating: "10/10"
    },
    deeply: {
      nested: {
        data: "value"
      }
    },
    root_prop: "data"
  };

  const paths = getObjectPaths(obj);

  expect(paths.some(p => isEqual(p, { key: ["data", "rating"], value: "10/10" }))).toBeTruthy();
  expect(
    paths.some(p => isEqual(p, { key: ["deeply", "nested", "data"], value: "value" }))
  ).toBeTruthy();
  expect(paths.some(p => isEqual(p, { key: ["root_prop"], value: "data" }))).toBeTruthy();
});

it("should create a copy of the input object without object references with getObjectRef()", () => {
  const obj = {
    arr: [1, 2, 3],
    obj_arr: [{ obj: 1 }, { obj: 2 }, { obj: 3 }],
    nested_obj: {
      value: "data"
    },
    prop: 1
  };
  const objCopy = getObjectRef(obj);

  expect(objCopy === obj).toBeFalsy();
  expect(objCopy).toEqual(obj);
});
