const { mockModularAuth } = require('firestore-jest-mock/mocks/modular/auth');
const {
  mockGetAuth,
  mockModularCreateUserWithEmailAndPassword,
  mockModularSignInWithEmailAndPassword,
  mockModularSignOut,
  mockModularSendPasswordResetEmail,
  mockModularSendEmailVerification,
  mockOnAuthStateChanged,
  mockConnectAuthEmulator,
  mockModularDeleteUser,
  mockModularUpdateProfile,
  mockModularUpdateEmail,
  mockModularUpdatePassword,
} = require('firestore-jest-mock/mocks/modular/auth');

const {
  mockCreateUserWithEmailAndPassword,
  mockSignInWithEmailAndPassword,
  mockSignOut,
  mockSendPasswordResetEmail,
} = require('firestore-jest-mock/mocks/auth');

describe('Modular Auth API', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('Authentication operations', () => {
    mockModularAuth({
      currentUser: { uid: 'user-123', email: 'homer@springfield.com' },
    });

    const {
      getAuth,
      createUserWithEmailAndPassword,
      signInWithEmailAndPassword,
      signOut,
      sendPasswordResetEmail,
      sendEmailVerification,
      onAuthStateChanged,
      connectAuthEmulator,
      deleteUser,
      updateProfile,
      updateEmail,
      updatePassword,
    } = require('firebase/auth');

    test('getAuth returns an auth instance', () => {
      const auth = getAuth();
      expect(auth).toBeDefined();
      expect(mockGetAuth).toHaveBeenCalled();
    });

    test('createUserWithEmailAndPassword', async () => {
      const auth = getAuth();
      const result = await createUserWithEmailAndPassword(
        auth,
        'bart@springfield.com',
        'password123',
      );

      expect(result.user).toBeDefined();
      expect(mockModularCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'bart@springfield.com',
        'password123',
      );
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        'bart@springfield.com',
        'password123',
      );
    });

    test('signInWithEmailAndPassword', async () => {
      const auth = getAuth();
      const result = await signInWithEmailAndPassword(
        auth,
        'homer@springfield.com',
        'donut',
      );

      expect(result.user).toBeDefined();
      expect(mockModularSignInWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'homer@springfield.com',
        'donut',
      );
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        'homer@springfield.com',
        'donut',
      );
    });

    test('signOut', async () => {
      const auth = getAuth();
      await signOut(auth);

      expect(mockModularSignOut).toHaveBeenCalledWith(auth);
      expect(mockSignOut).toHaveBeenCalled();
    });

    test('sendPasswordResetEmail', async () => {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, 'homer@springfield.com');

      expect(mockModularSendPasswordResetEmail).toHaveBeenCalledWith(
        auth,
        'homer@springfield.com',
      );
      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith('homer@springfield.com');
    });

    test('sendEmailVerification', async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      await sendEmailVerification(user);

      expect(mockModularSendEmailVerification).toHaveBeenCalled();
    });

    test('onAuthStateChanged calls callback with current user', () => {
      const auth = getAuth();
      const callback = jest.fn();
      const unsubscribe = onAuthStateChanged(auth, callback);

      expect(mockOnAuthStateChanged).toHaveBeenCalledWith(auth, callback);
      expect(callback).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    test('connectAuthEmulator', () => {
      const auth = getAuth();
      connectAuthEmulator(auth, 'http://localhost:9099');

      expect(mockConnectAuthEmulator).toHaveBeenCalledWith(
        auth,
        'http://localhost:9099',
      );
    });

    test('deleteUser', async () => {
      const auth = getAuth();
      await deleteUser(auth.currentUser);

      expect(mockModularDeleteUser).toHaveBeenCalled();
    });

    test('updateProfile', async () => {
      const auth = getAuth();
      await updateProfile(auth.currentUser, { displayName: 'Homer' });

      expect(mockModularUpdateProfile).toHaveBeenCalled();
    });

    test('updateEmail', async () => {
      const auth = getAuth();
      await updateEmail(auth.currentUser, 'homer.j@springfield.com');

      expect(mockModularUpdateEmail).toHaveBeenCalled();
    });

    test('updatePassword', async () => {
      const auth = getAuth();
      await updatePassword(auth.currentUser, 'newpassword');

      expect(mockModularUpdatePassword).toHaveBeenCalled();
    });
  });
});
