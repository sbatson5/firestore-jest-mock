/// <reference types="jest" />
import { JestFnObject } from "types";
/**
 * Object with jest.fn() mock function that are called in the
 * stub implemetation with the arguments required in the functions.
 * It's useful for checking the calls and arguments in this functions
 *
 * @example
 * it("should create a doc in db", async () => {
 * const data = { foo: "bar" };
 * await firestore()
 *   .doc("collection/doc")
 *   .set(data);
 *
 * expect(jestMocks.doc.set.mock.calls.length).toBe(1);
 * expect(jestMocks.doc.set.mock.calls[0][0]).toBe(data);
 * });
 */
export declare const jestMocks: {
    /** Jest functions for firestore fake database classes */
    fakeDatabase: {
        /** Mock functions for calls in `FakeFirestoreDatabase` */
        database: {
            constructor: jest.Mock<any, any>;
            listRootCollection: jest.Mock<any, any>;
            get: jest.Mock<any, any>;
            addData: jest.Mock<any, any>;
            setData: jest.Mock<any, any>;
            deleteDoc: jest.Mock<any, any>;
        };
        /** Mock functions for calls in `DocDataRef` */
        doc: {
            id: jest.Mock<any, any>;
            subcollections: jest.Mock<any, any>;
            data: jest.Mock<any, any>;
            constructor: jest.Mock<any, any>;
            getSubcollection: jest.Mock<any, any>;
            createSubcollection: jest.Mock<any, any>;
            subcollectionPath: jest.Mock<any, any>;
            setDataInDocData: jest.Mock<any, any>;
            getCollection: jest.Mock<any, any>;
            createPath: jest.Mock<any, any>;
        };
        /** Mock functions for calls in `CollectionDataRef` */
        collection: {
            constructor: jest.Mock<any, any>;
            docs: jest.Mock<any, any>;
            id: jest.Mock<any, any>;
            docPath: jest.Mock<any, any>;
            push: jest.Mock<any, any>;
            findDoc: jest.Mock<any, any>;
            getDoc: jest.Mock<any, any>;
            createDoc: jest.Mock<any, any>;
            createPath: jest.Mock<any, any>;
            deleteDoc: jest.Mock<any, any>;
        };
    };
    /** Mock functions for firebase import */
    firebase: {
        app: jest.Mock<any, any>;
        initializeApp: jest.Mock<any, any>;
        cert: jest.Mock<any, any>;
    };
    /** Mock functions for `CollectionReference` or `Query` classes */
    collection: {
        id: jest.Mock<any, any>;
        parent: jest.Mock<any, any>;
        path: jest.Mock<any, any>;
        constructor: jest.Mock<any, any>;
        listDocuments: jest.Mock<any, any>;
        doc: jest.Mock<any, any>;
        add: jest.Mock<any, any>;
        isEqual: jest.Mock<any, any>;
        get: jest.Mock<any, any>;
        firestore: jest.Mock<any, any>;
        where: jest.Mock<any, any>;
        orderBy: jest.Mock<any, any>;
        limit: jest.Mock<any, any>;
        select: jest.Mock<any, any>;
        startAt: jest.Mock<any, any>;
        startAfter: jest.Mock<any, any>;
        endBefore: jest.Mock<any, any>;
        endAt: jest.Mock<any, any>;
    };
    /** Mock functions for `DocumentReference` class */
    doc: {
        firestore: jest.Mock<any, any>;
        parent: jest.Mock<any, any>;
        id: jest.Mock<any, any>;
        constructor: jest.Mock<any, any>;
        collection: jest.Mock<any, any>;
        listCollections: jest.Mock<any, any>;
        create: jest.Mock<any, any>;
        set: jest.Mock<any, any>;
        update: jest.Mock<any, any>;
        delete: jest.Mock<any, any>;
        get: jest.Mock<any, any>;
    };
    /** Mock functions for `Firestore` object */
    firestore: {
        setting: jest.Mock<any, any>;
        collection: jest.Mock<any, any>;
        doc: jest.Mock<any, any>;
        terminate: jest.Mock<any, any>;
        listCollections: jest.Mock<any, any>;
    };
    /** Mock functions for `Timestamp` class */
    timestamp: {
        now: jest.Mock<any, any>;
        fromDate: jest.Mock<any, any>;
        fromMillis: jest.Mock<any, any>;
        seconds: jest.Mock<any, any>;
        nanoseconds: jest.Mock<any, any>;
        toDate: jest.Mock<any, any>;
        toMillis: jest.Mock<any, any>;
        isEqual: jest.Mock<any, any>;
    };
    /** Mock functions for `FieldValue` class */
    fieldValue: {
        serverTimestamp: jest.Mock<any, any>;
        delete: jest.Mock<any, any>;
        increment: jest.Mock<any, any>;
        arrayUnion: jest.Mock<any, any>;
        arrayRemove: jest.Mock<any, any>;
        isEqual: jest.Mock<any, any>;
    };
};
/**
 * Reset all information in a jest function objects by calling mockReset()
 * @param jestFnObj The object reference
 */
export declare function resetJestFnObj(jestFnObj: JestFnObject): void;
