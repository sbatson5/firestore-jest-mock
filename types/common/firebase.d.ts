/// <reference types="jest" />
import { MockDatabase } from './database';
import { FakeFirestore } from '../index';
/** Object for stub firebase */
export interface FirebaseStub {
    /** The firestore */
    firestore: MockDatabase;
}
export interface MockFirebase {
    SDK_VERSION: string;
    apps: MockFirebase[];
    app: (name?: string) => MockFirebase;
    name: string;
    initializeApp: jest.Mock;
    credential: {
        cert: jest.Mock;
    };
    firestore: () => FakeFirestore;
}
