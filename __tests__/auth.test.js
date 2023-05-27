import { mockFirebase } from 'firestore-jest-mock';
import { mockInitializeApp } from '../mocks/firebase';
import {
  mockCreateUserWithEmailAndPassword,
  mockSignInWithEmailAndPassword,
  mockSignOut,
  mockSendPasswordResetEmail,
  mockDeleteUser,
  mockVerifyIdToken,
  mockGetUser,
  mockCreateCustomToken,
  mockSetCustomUserClaims,
  mockUseEmulator,
} from '../mocks/auth';

describe('we can start a firebase application', () => {
  let admin, firebase;
  mockFirebase({
    database: {
      users: [
        { id: 'abc123', first: 'Bob', last: 'builder', born: 1998 },
        {
          id: '123abc',
          first: 'Blues',
          last: 'builder',
          born: 1996,
          _collections: {
            cities: [{ id: 'LA', name: 'Los Angeles', state: 'CA', country: 'USA', visited: true }],
          },
        },
      ],
      cities: [
        { id: 'LA', name: 'Los Angeles', state: 'CA', country: 'USA' },
        { id: 'DC', name: 'Disctric of Columbia', state: 'DC', country: 'USA' },
      ],
    },
    currentUser: { uid: 'abc123', displayName: 'Bob' },
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    firebase = await import('firebase');
    admin = await import('firebase-admin');
    firebase.initializeApp({
      apiKey: '### FIREBASE API KEY ###',
      authDomain: '### FIREBASE AUTH DOMAIN ###',
      projectId: '### CLOUD FIRESTORE PROJECT ID ###',
    });
  });

  test('We can start an application', async () => {
    firebase.auth();
    expect(mockInitializeApp).toHaveBeenCalled();
  });

  test('We can use emulator', () => {
    firebase.auth().useEmulator('http://localhost:9099');
    expect(mockUseEmulator).toHaveBeenCalledWith('http://localhost:9099');
  });

  describe('Client Auth Operations', () => {
    describe('Examples from documentation', () => {
      test('add a user', async () => {
        expect.assertions(1);
        await firebase.auth().createUserWithEmailAndPassword('sam', 'hill');
        expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith('sam', 'hill');
      });

      test('sign in', async () => {
        expect.assertions(1);
        await firebase.auth().signInWithEmailAndPassword('sam', 'hill');
        expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith('sam', 'hill');
      });

      test('sign out', async () => {
        expect.assertions(1);
        await firebase.auth().signOut();
        expect(mockSignOut).toHaveBeenCalled();
      });

      test('send password reset email', async () => {
        expect.assertions(1);
        await firebase.auth().sendPasswordResetEmail('sam', null);
        expect(mockSendPasswordResetEmail).toHaveBeenCalledWith('sam', null);
      });
    });
  });

  describe('Admin Auth Operations', () => {
    describe('Examples from documentation', () => {
      test('delete a user', async () => {
        expect.assertions(1);
        await admin.auth().deleteUser('some-uid');
        expect(mockDeleteUser).toHaveBeenCalledWith('some-uid');
      });

      test('verify an ID token', async () => {
        expect.assertions(1);
        await admin.auth().verifyIdToken('token_string', true);
        expect(mockVerifyIdToken).toHaveBeenCalledWith('token_string', true);
      });

      test('get user object', async () => {
        expect.assertions(1);
        await admin.auth().getUser('some-uid');
        expect(mockGetUser).toHaveBeenCalledWith('some-uid');
      });

      test('get currentUser object', async () => {
        expect.assertions(2);
        const currentUser = await admin.auth().currentUser;
        expect(currentUser.uid).toEqual('abc123');
        expect(currentUser.data.displayName).toBe('Bob');
      });

      test('create custom token', async () => {
        expect.assertions(2);
        const claims = {
          custom: true,
        };
        const token = await admin.auth().createCustomToken('some-uid', claims);
        expect(mockCreateCustomToken).toHaveBeenCalledWith('some-uid', claims);
        expect(token).toEqual('');
      });

      test('set custom user claims', async () => {
        expect.assertions(1);
        const claims = {
          do: 'the thing',
        };
        await admin.auth().setCustomUserClaims('some-uid', claims);
        expect(mockSetCustomUserClaims).toHaveBeenCalledWith('some-uid', claims);
      });
    });

    describe('Mocking return values', () => {
      test('mocking the user object', async () => {
        const uid = 'some-uid';
        const userRecord = {
          customClaims: undefined,
          disabled: false,
          email: 'bob@example.com',
          emailVerified: false,
          metadata: {},
          multiFactor: undefined,
          passwordHash: undefined,
          passwordSalt: undefined,
          phoneNumber: '928-555-4321',
          photoURL: undefined,
          providerData: [],
          tenantId: null,
          tokensValidAfterTime: undefined,
          uid,
        };
        mockGetUser.mockReturnValueOnce(userRecord);
        expect.assertions(2);
        const result = await admin.auth().getUser(uid);
        expect(mockGetUser).toHaveBeenCalledWith(uid);
        expect(result).toStrictEqual(userRecord);
      });

      test('mocking verify ID token to throw Error', async () => {
        const error = new Error('test');
        expect.assertions(1);
        mockVerifyIdToken.mockRejectedValueOnce(error);
        const result = await admin
          .auth()
          .verifyIdToken('token_string', true)
          .catch(err => err);
        expect(result).toStrictEqual(error);
      });
    });
  });
});
