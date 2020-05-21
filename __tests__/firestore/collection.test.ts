import { MockDatabase, CollectionData, FakeDocData } from "types";
import {
  jestMocks,
  FakeFirestore,
  FakeCollectionRef,
  FakeDocRef,
  CollectionDataRef,
  FakeQuery,
  FilterType,
  QueryFilter,
  FakeDocSnapshot,
  FakeQuerySnapshot,
  DocDataRef,
  FieldFilter
} from "../import";
import { getObjectRef } from "../utils/helpers";
import { firestoreFakeDatabase } from "../test-database";
import { isEqual } from "lodash";
import { getFieldSegments } from "../utils/helpers";

const fakeCollectionMock = jestMocks.collection;

let fakeDb: MockDatabase;
let fakeCollectionData: CollectionData;
let fakeFirestore: FakeFirestore;

beforeEach(() => {
  // Reset jest before each test
  jest.resetAllMocks();
  fakeDb = getObjectRef(firestoreFakeDatabase);
  fakeCollectionData = getObjectRef(firestoreFakeDatabase.collection_test);

  // Set a new instance of FakeFirestore
  fakeFirestore = new FakeFirestore(fakeDb);
});

// Doc global info
const collectionPath = "collection_test";
const collectionId = collectionPath;

it("should create a instance of FakeCollectionRef in the root of fakedatabase", () => {
  const collection = new FakeCollectionRef(fakeFirestore, collectionPath);

  expect(collection.path).toBe(collectionPath);
  expect(collection.id).toBe(collectionId);
  expect(collection.firestore).toBeInstanceOf(FakeFirestore);
  expect(collection.parent).toBeNull();
  expect(collection.parentPath).toBeNull();

  expect(fakeCollectionMock.constructor.mock.calls.length).toBe(1);
  expect(fakeCollectionMock.constructor.mock.calls[0]).toEqual([fakeFirestore, collectionPath]);
});

it("should create a instance of FakeCollectionRef", () => {
  const subCollectionid = "sub_collection_1";
  const subCollectionPath = `collection_test/doc_1/${subCollectionid}`;
  const collection = new FakeCollectionRef(fakeFirestore, subCollectionPath);

  expect(collection.path).toBe(subCollectionPath);
  expect(collection.id).toBe(subCollectionid);
  expect(collection.firestore).toBeInstanceOf(FakeFirestore);
  expect(collection.parent).toBeInstanceOf(FakeDocRef);
  expect(collection.parentPath).toBe("collection_test/doc_1");

  expect(fakeCollectionMock.constructor.mock.calls.length).toBe(1);
  expect(fakeCollectionMock.constructor.mock.calls[0]).toEqual([fakeFirestore, subCollectionPath]);
});

describe("Test FakeCollectionRef methods", () => {
  let collection: FakeCollectionRef;
  let collectionDataRef: CollectionDataRef;

  beforeEach(() => {
    // Set a new instance of FakeCollectionRef before each test
    collection = new FakeCollectionRef(fakeFirestore, collectionPath);
    collectionDataRef = fakeFirestore.database.get(collectionPath, "collection");
  });

  it("should list all documents in the collection with listDocuments() method", async () => {
    const docs = await collection.listDocuments();

    const isEveryFakeDocRef = docs.every(doc => doc instanceof FakeDocRef);
    const docIds = docs.map(doc => doc.id);
    const expectedDocIds = collectionDataRef.docs.map(doc => doc.id);

    expect(isEveryFakeDocRef).toBeTruthy();
    expect(docIds).toEqual(expectedDocIds);

    expect(fakeCollectionMock.listDocuments.mock.calls.length).toBe(1);
  });

  it("should get a FakeDocRef with doc() method", () => {
    const docId = "doc_1";
    const doc = collection.doc(docId);

    expect(doc).toBeInstanceOf(FakeDocRef);
    expect(doc.id).toBe(docId);

    expect(fakeCollectionMock.doc.mock.calls.length).toBe(1);
    expect(fakeCollectionMock.doc.mock.calls[0][0]).toBe(docId);
  });

  it("should add a new document in the collection with add() method", async () => {
    const newDocData = {
      data: "data for doc",
      arr: [1, 2, 3]
    };

    const newDocRef = await collection.add(newDocData);
    const newDocId = newDocRef.id;

    const newDocDataRef = collectionDataRef.findDoc(newDocId);

    expect(newDocRef).toBeInstanceOf(FakeDocRef);
    expect(newDocDataRef.data).toEqual(newDocData);

    expect(fakeCollectionMock.add.mock.calls.length).toBe(1);
    expect(fakeCollectionMock.add.mock.calls[0][0]).toEqual(newDocData);
  });

  it("should compare two FakeCollectionRef with isEqual() method", () => {
    const otherColelction = new FakeCollectionRef(fakeFirestore, collectionPath);

    expect(collection.isEqual(otherColelction)).toBeTruthy();

    expect(fakeCollectionMock.isEqual.mock.calls.length).toBe(1);
    expect(fakeCollectionMock.isEqual.mock.calls[0][0]).toEqual(otherColelction);
  });
});

it("should create a instance of FakeQuery", () => {
  const query = new FakeQuery(fakeFirestore, collectionPath);

  expect(query.firestore).toBeInstanceOf(FakeFirestore);
  expect(query.path).toBe(collectionPath);
});

// Find the specified in query
const findFilter = (filterName: FilterType, query: FakeQuery, args: any[]): QueryFilter => {
  return query["fieldFilter"].filters.find(
    filter => isEqual(filter.args, args) && filter.type === filterName
  );
};

// Map DocDataRef to it's data
const mapDocData = (doc: DocDataRef): FakeDocData => doc.data;
// Map FakeDocSnapshot to it's data
const mapDocSnapData = (doc: FakeDocSnapshot): FakeDocData => doc.data();

describe("test FieldFilter methods", () => {
  let fieldFilter: FieldFilter;
  let docsToFilter: DocDataRef[];
  const collectionPath = "restaurant_test";

  beforeEach(() => {
    // Set a new instance of FakeCollectionRef before each test
    fieldFilter = new FieldFilter();
    docsToFilter = fakeFirestore.database.get(collectionPath, "collection").docs;
  });

  it("should add a filter in filters array with addFilter() method", () => {
    const args = ["fields", "==", "value"];
    fieldFilter.addFilter(FilterType.where, ...args);
    const expectedFielter: QueryFilter = { type: FilterType.where, args };

    expect(fieldFilter.filters).toEqual([expectedFielter]);
  });

  it("should test where() methods", () => {
    const field = "rate";
    const op: FirebaseFirestore.WhereFilterOp = "==";
    const value = 4.3;

    const filteredData = fieldFilter["where"](docsToFilter, field, op, value).map(mapDocData);
    const expectedData = docsToFilter.filter(doc => doc.data[field] === value).map(mapDocData);

    expect(filteredData).toEqual(expectedData);
  });

  it("should test all possible operations in whereOp() method", () => {
    expect(fieldFilter["whereOp"]("==")(1, 2)).toBeFalsy();
    expect(fieldFilter["whereOp"]("==")({ num: 7 }, { num: 7 })).toBeTruthy();

    expect(fieldFilter["whereOp"]("<")(1, 3)).toBeTruthy();
    expect(fieldFilter["whereOp"]("<=")(3, 3)).toBeTruthy();
    expect(fieldFilter["whereOp"](">")(4, 1)).toBeTruthy();
    expect(fieldFilter["whereOp"](">=")(4, 4)).toBeTruthy();

    expect(fieldFilter["whereOp"]("array-contains")([1, 2, 3], 2)).toBeTruthy();
    expect(
      fieldFilter["whereOp"]("array-contains-any")([{ num: 1 }, { num: 2 }, { num: 3 }], { num: 3 })
    ).toBeTruthy();
    expect(fieldFilter["whereOp"]("in")("b", ["a", "b", "c"])).toBeTruthy();
  });

  it("should test orderBy() method in ascending direction", () => {
    const field = "rate";
    const direction = "asc";

    const orderByData = fieldFilter["orderBy"](docsToFilter, field, direction);
    const expectedData = docsToFilter.sort((a, b) => a.data[field] - b.data[field]);

    expect(orderByData).toEqual(expectedData);
  });

  it("should test orderBy() method in descending direction", () => {
    const field = "rate";
    const direction = "desc";

    const orderByData = fieldFilter["orderBy"](docsToFilter, field, direction);
    const expectedData = docsToFilter.sort((a, b) => b.data[field] - a.data[field]);

    expect(orderByData).toEqual(expectedData);
  });

  it("should test startAt(), startAfter(), endAt() and endBefore() methods", () => {
    const field = "rate";
    const direction = "asc";

    // Add orderby filter
    fieldFilter.addFilter(FilterType.orderBy, field, direction);
    docsToFilter.sort((a, b) => a.data[field] - b.data[field]);

    // Value to use on filters
    const value = 4.5;
    const dataAt: DocDataRef = docsToFilter.find(doc => doc.data[field] === value);
    const docSnap = new FakeDocSnapshot(new FakeDocRef(fakeFirestore, dataAt.path), dataAt.data);

    let recivedValue: DocDataRef[] = [];
    let expectedValue: DocDataRef;

    // Expected startAt first value to be equals dataAt
    expectedValue = dataAt;

    // startAt with data
    recivedValue = fieldFilter["startAt"](docsToFilter, value);
    expect(recivedValue[0]).toEqual(expectedValue);

    // startAt with FakeDocSnapshot
    fieldFilter["startAt"](docsToFilter, docSnap);
    expect(recivedValue[0]).toEqual(expectedValue);

    // Expected startAfter first value to not be equals dataAt

    // startAfter with value
    recivedValue = fieldFilter["startAfter"](docsToFilter, value);
    expect(recivedValue[0]).not.toEqual(expectedValue);

    // startAfter with FakeDocSnapshot
    recivedValue = fieldFilter["startAfter"](docsToFilter, docSnap);
    expect(recivedValue[0]).not.toEqual(expectedValue);

    // Expected endAt last value to be dataAt

    // endAt with value
    recivedValue = fieldFilter["endAt"](docsToFilter, value);
    expect(recivedValue[recivedValue.length - 1]).toEqual(expectedValue);

    // endAt with FakeDocSnapshot
    recivedValue = fieldFilter["endAt"](docsToFilter, docSnap);
    expect(recivedValue[recivedValue.length - 1]).toEqual(expectedValue);

    // Expected endBefore last value to not be dataAt

    // endBefore with value
    recivedValue = fieldFilter["endBefore"](docsToFilter, value);
    expect(recivedValue[recivedValue.length - 1]).not.toEqual(expectedValue);

    // endBefore with FakeDocSnapshot
    recivedValue = fieldFilter["endBefore"](docsToFilter, docSnap);
    expect(recivedValue[recivedValue.length - 1]).not.toEqual(expectedValue);
  });

  it("should get a part of the data with limit() method", () => {
    const limit = 3;
    const limitedData = fieldFilter["limit"](docsToFilter, limit);

    expect(limitedData.length).toBe(limit);
    expect(limitedData).toEqual(docsToFilter.slice(0, 3));
  });

  it("should mask the data with the given fields with select() method", () => {
    const fields = ["rate", "id"];
    const selectMaskData = fieldFilter["select"](docsToFilter, ...fields);

    const isDataMasked = selectMaskData
      .map(doc => doc.data)
      .every(data => isEqual(Object.keys(data), fields));

    expect(isDataMasked).toBeTruthy();
  });
});

describe("test FakeQuery methods", () => {
  let query: FakeQuery;
  let collectionDataRef: CollectionDataRef;
  const queryCollectionPath = "restaurant_test";

  beforeEach(() => {
    // Set a new instance of FakeCollectionRef before each test
    query = new FakeQuery(fakeFirestore, queryCollectionPath);
    collectionDataRef = fakeFirestore.database.get(queryCollectionPath, "collection");
  });

  /**
   * Base test for cursor methods that can be: startAt(), startAfter(), endAt() and endBefore()
   * @param testWithValue If true the test will be made with the fixed value else it will
   * create a new instance of FakeDocSnapshot to make the query
   * @param filterType The filter type that can bem "startAt", "startAfter", "endAt" and "endBefore"
   */
  const testCursor = async (testWithValue: boolean, filterType: FilterType): Promise<void> => {
    // Return if the type is not one of the specified
    if (
      filterType !== FilterType.startAt &&
      filterType !== FilterType.startAfter &&
      filterType !== FilterType.endAt &&
      filterType !== FilterType.endBefore
    )
      return;

    // Indicate if the comparison data will included in the query
    const includeDataAt: boolean =
      filterType === FilterType.endAt || filterType === FilterType.startAt;

    // Indicates if this query is a start type, if false is a end type
    const isStart: boolean =
      filterType === FilterType.startAt || filterType === FilterType.startAfter;

    const field = "rate";
    const direction: FirebaseFirestore.OrderByDirection = "asc";
    const value = 4.5;
    const dataAt: DocDataRef = collectionDataRef.docs.find(doc => doc.data[field] === value);
    const docSnap = new FakeDocSnapshot(new FakeDocRef(fakeFirestore, dataAt.path), dataAt.data);
    const filterArgs = testWithValue ? [value] : [docSnap];

    const cursorQuery = query.orderBy(field, direction)[filterType](filterArgs[0]);
    const cursorFilter = findFilter(filterType, query, filterArgs);

    expect(cursorQuery).toBeInstanceOf(FakeQuery);
    expect(cursorFilter).not.toBeUndefined();
    expect(cursorFilter.args).toEqual(filterArgs);
    expect(cursorFilter.type).toBe(filterType);

    // Value to use on filters
    const querySnap = await query.get();

    expect(querySnap).toBeInstanceOf(FakeQuerySnapshot);

    // Get the first position if the filter is a start type otherwise get the last position for end type
    const dataToCompare = isStart ? querySnap.docs[0] : querySnap.docs[querySnap.docs.length - 1];

    const exp = expect(dataToCompare.data());
    if (includeDataAt) exp.toEqual(dataAt.data);
    else exp.not.toEqual(dataAt.data);

    expect(fakeCollectionMock[filterType].mock.calls.length).toBe(1);
    expect(fakeCollectionMock[filterType].mock.calls[0]).toEqual(filterArgs);
  };

  it("should get all data in the collection with get() method", async () => {
    const querySnap = await query.get();
    const data = collectionDataRef.docs.map(doc => doc.data);

    expect(querySnap).toBeInstanceOf(FakeQuerySnapshot);
    expect(querySnap.query).toBeInstanceOf(FakeQuery);
    expect(querySnap.empty).toBeFalsy();
    expect(querySnap.size).toBe(data.length);

    const isEveryDocSnap = querySnap.docs.every(doc => doc instanceof FakeDocSnapshot);
    expect(isEveryDocSnap).toBeTruthy();

    // Check if all docs a contained in data
    const hasData = data.some(d => querySnap.docs.some(doc => isEqual(d, doc.data())));
    expect(hasData).toBeTruthy();
  });

  it("should create all possible queries with where() method ", async () => {
    let fieldPath = "rate";
    let op: FirebaseFirestore.WhereFilterOp = "==";
    let value: any = 4.5;

    // Get the args that will change in this test
    let args = () => [fieldPath, op, value];
    const whereEqualQuery = query.where(fieldPath, op, value);
    const whereFilter = findFilter(FilterType.where, query, args());

    // Check query instance and filter
    expect(whereEqualQuery).toBeInstanceOf(FakeQuery);

    expect(whereFilter).not.toBeUndefined();
    expect(whereFilter.args).toEqual(args());
    expect(whereFilter.type).toBe(FilterType.where);

    // Get "==" equal query
    let querySnap = await whereEqualQuery.get();
    let expectedData: FakeDocData[] = collectionDataRef.docs
      .filter(doc => isEqual(doc.data[fieldPath], value))
      .map(mapDocData);
    let recivedData: FakeDocData[] = querySnap.docs.map(mapDocSnapData);

    expect(recivedData).toEqual(expectedData);
    expect(fakeCollectionMock.where.mock.calls[0]).toEqual(args());

    const docs = collectionDataRef.docs;

    // Get "<" less than query
    op = "<";
    query = new FakeQuery(fakeFirestore, queryCollectionPath);
    const whereLessThanQuery = query.where(fieldPath, op, value);

    querySnap = await whereLessThanQuery.get();
    expectedData = docs.filter(doc => doc.data[fieldPath] < value).map(mapDocData);
    recivedData = querySnap.docs.map(mapDocSnapData);

    expect(recivedData).toEqual(expectedData);
    expect(fakeCollectionMock.where.mock.calls[1]).toEqual(args());

    // Get "<=" less or equals than query
    op = "<=";
    query = new FakeQuery(fakeFirestore, queryCollectionPath);
    const whereLessOrEqualThanQuery = query.where(fieldPath, op, value);

    querySnap = await whereLessOrEqualThanQuery.get();
    expectedData = docs.filter(doc => doc.data[fieldPath] <= value).map(mapDocData);
    recivedData = querySnap.docs.map(mapDocSnapData);

    expect(recivedData).toEqual(expectedData);
    expect(fakeCollectionMock.where.mock.calls[2]).toEqual(args());

    // Get ">" greater than query
    op = ">";
    query = new FakeQuery(fakeFirestore, queryCollectionPath);
    const whereGreaterThanQuery = query.where(fieldPath, op, value);

    querySnap = await whereGreaterThanQuery.get();
    expectedData = docs.filter(doc => doc.data[fieldPath] > value).map(mapDocData);
    recivedData = querySnap.docs.map(mapDocSnapData);

    expect(recivedData).toEqual(expectedData);
    expect(fakeCollectionMock.where.mock.calls[3]).toEqual(args());

    // Get ">=" greater or equal than query
    op = ">=";
    query = new FakeQuery(fakeFirestore, queryCollectionPath);
    const whereGreaterOrEqualThanQuery = query.where(fieldPath, op, value);

    querySnap = await whereGreaterOrEqualThanQuery.get();
    expectedData = docs.filter(doc => doc.data[fieldPath] >= value).map(mapDocData);
    recivedData = querySnap.docs.map(mapDocSnapData);

    expect(recivedData).toEqual(expectedData);
    expect(fakeCollectionMock.where.mock.calls[4]).toEqual(args());

    // Get "array-contains" query
    fieldPath = "categories";
    op = "array-contains";
    value = "Japonese";

    query = new FakeQuery(fakeFirestore, queryCollectionPath);
    const whereArrayContainsQuery = query.where(fieldPath, op, value);

    querySnap = await whereArrayContainsQuery.get();
    expectedData = docs
      .filter(doc => doc.data[fieldPath].some(d => isEqual(d, value)))
      .map(mapDocData);
    recivedData = querySnap.docs.map(mapDocSnapData);

    expect(recivedData).toEqual(expectedData);
    expect(fakeCollectionMock.where.mock.calls[5]).toEqual(args());

    // Get "in" query
    fieldPath = "address";
    op = "in";
    value = ["Japan Street"];

    query = new FakeQuery(fakeFirestore, queryCollectionPath);
    const whereInQuery = query.where(fieldPath, op, value);

    querySnap = await whereInQuery.get();
    expectedData = docs
      .filter(doc => value.some(v => isEqual(v, doc.data[fieldPath])))
      .map(mapDocData);
    recivedData = querySnap.docs.map(mapDocSnapData);

    expect(recivedData).toEqual(expectedData);
    expect(fakeCollectionMock.where.mock.calls[6]).toEqual(args());

    expect(fakeCollectionMock.where.mock.calls.length).toBe(7);
  });

  it("should create new query with orderBy() method in ascending direction", async () => {
    const fieldPath = "restaurant_name";
    const direction: FirebaseFirestore.OrderByDirection = "asc";

    const orderByAscQuery = query.orderBy(fieldPath, direction);
    const args = [fieldPath, direction];
    const orderByFilter = findFilter(FilterType.orderBy, query, args);

    expect(orderByAscQuery).toBeInstanceOf(FakeQuery);

    expect(orderByFilter).not.toBeUndefined();
    expect(orderByFilter.args).toEqual(args);
    expect(orderByFilter.type).toBe(FilterType.orderBy);

    expect(fakeCollectionMock.orderBy.mock.calls.length).toBe(1);
    expect(fakeCollectionMock.orderBy.mock.calls[0]).toEqual(args);

    const querySnap = await orderByAscQuery.get();
    const expectData = collectionDataRef.docs
      .sort((a, b) =>
        a.data[fieldPath] < b.data[fieldPath] ? -1 : a.data[fieldPath] > b.data[fieldPath] ? 1 : 0
      )
      .map(mapDocData);
    const recivedData: FakeDocData[] = querySnap.docs.map(mapDocSnapData);

    expect(recivedData).toEqual(expectData);
  });

  // startAt
  it("should create new query with startAt() methods with values as parameter", async () => {
    await testCursor(true, FilterType.startAt);
  });

  it("should create new query with startAt() methods with a FakeDocSnapshot as parameter", async () => {
    await testCursor(false, FilterType.startAt);
  });

  // startAfter
  it("should create new query with startAfter() methods with values as parameter", async () => {
    await testCursor(true, FilterType.startAfter);
  });

  it("should create new query with startAfter() methods with a FakeDocSnapshot as parameter", async () => {
    await testCursor(false, FilterType.startAfter);
  });

  // endAt
  it("should create new query with endAt() methods with values as parameter", async () => {
    await testCursor(true, FilterType.endAt);
  });

  it("should create new query with endAt() methods with a FakeDocSnapshot as parameter", async () => {
    await testCursor(false, FilterType.endAt);
  });

  // endBefore
  it("should create new query with endBefore() methods with values as parameter", async () => {
    await testCursor(true, FilterType.endBefore);
  });

  it("should create new query with startAfter() methods with a FakeDocSnapshot as parameter", async () => {
    await testCursor(false, FilterType.endBefore);
  });

  it("should throw an error trying to make a query with a cursor without orderBy", () => {
    expect(() => query.startAt(4.5).get()).rejects.toThrow();
  });

  it("should create a new query that limit the result with limit() method", async () => {
    const limit = 3;
    query.limit(limit);

    const querySnap = await query.get();
    const queryData = querySnap.docs.map(doc => doc.data());
    const expectedData = collectionDataRef.docs.map(doc => doc.data).slice(0, 3);

    expect(querySnap.docs.length).toBe(limit);
    expect(queryData).toEqual(expectedData);

    expect(fakeCollectionMock.limit.mock.calls.length).toBe(1);
    expect(fakeCollectionMock.limit.mock.calls[0][0]).toBe(limit);
  });

  it("should create a new query that apply a mask with select() method", async () => {
    const fields = ["rate", "id", "manager.name", "manager.email"];
    const fieldPaths = fields.map(getFieldSegments);
    query.select(...fields);

    const querySnap = await query.get();

    const isDataMasked: boolean = querySnap.docs.map(mapDocSnapData).every(data => {
      // If hasPaths assume false value break the below loop
      let hasPaths: boolean = true;
      // Get the fields paths string array
      for (const path of fieldPaths) {
        // Iterate throw each path
        let itData: any = data;
        for (const p of path) {
          if (!itData.hasOwnProperty(p)) {
            hasPaths = false;
            break;
          }
          itData = itData[p];
        }
        if (!hasPaths) break;
      }

      return hasPaths;
    });

    expect(isDataMasked).toBeTruthy();

    expect(fakeCollectionMock.select.mock.calls.length).toBe(1);
    expect(fakeCollectionMock.select.mock.calls[0]).toEqual(fields);
  });
});

it("should create a instance of FakeQuerySnapshot", () => {
  const fakeCollectionPath = "random-collection";
  const fakeFirestoreInstance = new FakeFirestore();
  const docs = [
    new FakeDocSnapshot(new FakeDocRef(fakeFirestoreInstance, `${fakeCollectionPath}/a`), {})
  ];
  const fakeQuerySnap = new FakeQuerySnapshot(
    new FakeQuery(fakeFirestoreInstance, fakeCollectionPath),
    docs
  );

  expect(fakeQuerySnap.docs).toEqual(docs);
  expect(fakeQuerySnap.empty).toBeFalsy();
  expect(fakeQuerySnap.size).toBe(docs.length);
  expect(fakeQuerySnap.query).toBeInstanceOf(FakeQuery);

  const cb = jest.fn();
  fakeQuerySnap.forEach(cb);

  expect(cb).toHaveBeenCalledTimes(docs.length);
});
