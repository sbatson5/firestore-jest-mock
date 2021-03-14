const { mockFirebase } = require('firestore-jest-mock');
const { mockInitializeApp } = require('../mocks/firebase');
const {
  mockCreateUserWithEmailAndPassword,
  mockSignInWithEmailAndPassword,
  mockSignOut,
  mockSendPasswordResetEmail,
  mockDeleteUser,
  mockVerifyIdToken,
  mockGetUser,
  mockSetCustomUserClaims,
  mockUseEmulator,
} = require('../mocks/auth');

describe('we can start a firebase application', () => {
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
  });

  beforeEach(() => {
    jest.clearAllMocks();
    this.firebase = require('firebase');
    this.admin = require('firebase-admin');
    this.firebase.initializeApp({
      apiKey: '### FIREBASE API KEY ###',
      authDomain: '### FIREBASE AUTH DOMAIN ###',
      projectId: '### CLOUD FIRESTORE PROJECT ID ###',
    });
  });

  test('We can start an application', async () => {
    this.firebase.auth();
    expect(mockInitializeApp).toHaveBeenCalled();
  });

  test('We can use emulator', () => {
    this.firebase.auth().useEmulator('http://localhost:9099');
    expect(mockUseEmulator).toHaveBeenCalledWith('http://localhost:9099');
  });

  describe('Client Auth Operations', () => {
    describe('Examples from documentation', () => {
      test('add a user', async () => {
        expect.assertions(1);
        await this.firebase.auth().createUserWithEmailAndPassword('sam', 'hill');
        expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith('sam', 'hill');
      });

      test('sign in', async () => {
        expect.assertions(1);
        await this.firebase.auth().signInWithEmailAndPassword('sam', 'hill');
        expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith('sam', 'hill');
      });

      test('sign out', async () => {
        expect.assertions(1);
        await this.firebase.auth().signOut();
        expect(mockSignOut).toHaveBeenCalled();
      });

      test('send password reset email', async () => {
        expect.assertions(1);
        await this.firebase.auth().sendPasswordResetEmail('sam', null);
        expect(mockSendPasswordResetEmail).toHaveBeenCalledWith('sam', null);
      });
    });
  });

  describe('Admin Auth Operations', () => {
    describe('Examples from documentation', () => {
      test('delete a user', async () => {
        expect.assertions(1);
        await this.admin.auth().deleteUser('some-uid');
        expect(mockDeleteUser).toHaveBeenCalledWith('some-uid');
      });

      test('verify an ID token', async () => {
        expect.assertions(1);
        await this.admin.auth().verifyIdToken('token_string', true);
        expect(mockVerifyIdToken).toHaveBeenCalledWith('token_string', true);
      });

      test('get user object', async () => {
        expect.assertions(1);
        await this.admin.auth().getUser('some-uid');
        expect(mockGetUser).toHaveBeenCalledWith('some-uid');
      });

      test('set custom user claims', async () => {
        expect.assertions(1);
        const claims = {
          do: 'the thing',
        };
        await this.admin.auth().setCustomUserClaims('some-uid', claims);
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
        const result = await this.admin.auth().getUser(uid);
        expect(mockGetUser).toHaveBeenCalledWith(uid);
        expect(result).toStrictEqual(userRecord);
      });
    });
  });
});
