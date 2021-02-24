interface AdditionalUserInfo {
  isNewUser: boolean;
  profile: Record<string, unknown> | null;
  providerId: string;
  username?: string | null;
}

interface AuthCredential {
  providerId: string;
  signInMethod: string;
  toJSON(): string;
  fromJSON(json: string | Record<string, unknown>): AuthCredential | null;
}

interface UserMetadata {
  creationTime?: string;
  lastSignInTime?: string;
}

interface UserInfo {
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  providerId: string;
  uid: string;
}

interface User {
  displayName: string | null;
  email: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: UserMetadata;
  multiFactor: unknown;
  phoneNumber: string | null;
  photoURL: string | null;
  providerData: Array<UserInfo>;
  providerId: string;
  refreshToken: string;
  tenantId: string | null;
  uid: string;
  delete(): Promise<void>;
  sendEmailVerification(): Promise<void>;
}

interface UserCredential {
  additionalUserInfo?: AdditionalUserInfo | null;
  credential: AuthCredential | null;
  operationType: string | null;
  user: User | null;
}

interface AdminUserRecord {
  customClaims?: Record<string, unknown>;
  disabled: boolean;
  displayName?: string;
  email?: string;
  emailVerified: boolean;
  metadata: {
    creationTime: string;
    lastRefreshTime?: string | null;
    lastSignInTime: string;
  };
  multiFactor?: unknown;
  phoneNumber?: string;
  photoURL?: string;
  providerData: Array<UserInfo>;
  tenantId?: string | null;
  tokensValidAfterTime?: string;
  uid: string;
}
