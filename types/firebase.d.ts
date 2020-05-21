import { FirebaseStub, MockFirebase } from "types";
/**
 * Create a stub version o firebase with firestore
 * @param overrides Override data for the firebase stub
 * @returns The stub firebase version
 */
export declare function firebaseStub(overrides: FirebaseStub): MockFirebase;
/**
 * Create a mock of `firebase` and `firebase-admin` usinf jest.mock()
 * @param overrides Overrides used for the stub
 * @returns A mock of firebase instance
 */
export declare function mockFirebase(overrides: FirebaseStub): MockFirebase;
