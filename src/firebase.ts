import { FakeFirestore, FakeFirestoreModuleRefs } from "./firestore/fake-firestore";
import { FirebaseStub, MockFirebase } from "types";
import { jestMocks } from "./jest-fn";

/**
 * Create a stub version o firebase with firestore
 * @param overrides Override data for the firebase stub
 * @returns The stub firebase version
 */
export function firebaseStub(overrides: FirebaseStub): MockFirebase {
  const mockFirebase: MockFirebase = {
    SDK_VERSION: "test-version",
    apps: [],
    app(name?: string) {
      jestMocks.firebase.app(name);
      return this.apps[0];
    },
    name: "[DEFAULT]",
    initializeApp: jestMocks.firebase.initializeApp,
    credential: {
      cert: jestMocks.firebase.cert
    },
    /** Get a reference to Fake firestore */
    get firestore(): () => FakeFirestore {
      let firestore = () => new FakeFirestore(overrides.firestore);
      // Assing FakeFirestoreModuleRefs object in the function
      firestore = Object.assign(firestore, FakeFirestoreModuleRefs);
      return firestore;
    }
  };
  mockFirebase.apps.push(mockFirebase);
  return mockFirebase;
}

/**
 * Create a mock of `firebase` and `firebase-admin` usinf jest.mock()
 * @param overrides Overrides used for the stub
 * @returns A mock of firebase instance
 */
export function mockFirebase(overrides: FirebaseStub): MockFirebase {
  const stub = firebaseStub(overrides);
  const tryMockLib = (libName: string) => {
    try {
      jest.mock(libName, () => stub);
    } catch (err) {
      /* istanbul ignore next */
      console.log(`"${libName}" dependencie not founded`);
    }
  };
  tryMockLib("firebase");
  tryMockLib("firebase-admin");

  return stub;
}
