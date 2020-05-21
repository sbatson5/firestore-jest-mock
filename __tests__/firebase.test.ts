import { FakeFirestore, jestMocks, mockFirebase } from "./import";
import { firestoreFakeDatabase } from "./test-database";

mockFirebase({
  firestore: firestoreFakeDatabase
});

import * as admin from "firebase-admin";

const firebaseMock = jestMocks.firebase;

beforeEach(() => {
  jest.resetAllMocks();
});

test("should test the firebase stub ", () => {
  expect(admin.SDK_VERSION).toBe("test-version");
  expect(admin.apps.length).toBe(1);
  expect(admin.firestore()).toBeInstanceOf(FakeFirestore);
  expect(admin.app().name).toBe("[DEFAULT]");
  expect(firebaseMock.app.call.length).toBe(1);
});

test("should make the admin sdk calls to initialize the app", () => {
  const fakeServiceaccount = {
    projectId: "test-project",
    clientEmail: "test@email.com",
    privateKey: "key"
  };
  const fakeAppOptions: admin.AppOptions = {
    credential: admin.credential.cert(fakeServiceaccount),
    databaseURL: "db.url.com",
    storageBucket: "test-bucket"
  };

  admin.initializeApp(fakeAppOptions);

  expect(firebaseMock.cert.mock.calls.length).toBe(1);
  expect(firebaseMock.cert.mock.calls[0][0]).toEqual(fakeServiceaccount);
  expect(firebaseMock.initializeApp.mock.calls.length).toBe(1);
  expect(firebaseMock.initializeApp.mock.calls[0][0]).toEqual(fakeAppOptions);
});
