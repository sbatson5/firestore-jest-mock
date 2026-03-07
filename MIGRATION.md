# Migration Guide: Namespaced to Modular API

This guide helps you migrate your test mocks from the Firebase v8 namespaced API to the v9+ modular API.

## Overview

The Firebase v9+ modular API uses free-standing functions instead of method chaining on class instances. This library provides separate mock setup functions for each API style:

| API Style | Setup Function | Mock Import Path |
|-----------|---------------|------------------|
| Namespaced (v8) | `mockFirebase` | `firestore-jest-mock/mocks/firestore` |
| Modular Firestore (v9+) | `mockModularFirestore` | `firestore-jest-mock/mocks/modular/firestore` |
| Modular Auth (v9+) | `mockModularAuth` | `firestore-jest-mock/mocks/modular/auth` |
| Admin modular (v10+) | `mockModularAdmin` | `firestore-jest-mock/mocks/modular/admin` |

## Step-by-step Migration

### 1. Update Mock Setup

**Before (namespaced):**

```js
const { mockFirebase } = require('firestore-jest-mock');

mockFirebase({
  database: { users: [{ id: 'abc123', name: 'Homer' }] },
});
```

**After (modular):**

```js
const { mockModularFirestore } = require('firestore-jest-mock');

mockModularFirestore({
  database: { users: [{ id: 'abc123', name: 'Homer' }] },
});
```

### 2. Update Mock Imports for Assertions

**Before (namespaced):**

```js
const { mockCollection, mockDoc, mockGet } = require('firestore-jest-mock/mocks/firestore');
```

**After (modular):**

```js
const {
  mockGetDoc,
  mockGetDocs,
  mockModularCollection,
  mockModularDoc,
} = require('firestore-jest-mock/mocks/modular/firestore');
```

### 3. Update Firebase Imports in Your Code Under Test

**Before (namespaced):**

```js
const firebase = require('firebase');
firebase.initializeApp({ /* ... */ });
const db = firebase.firestore();
db.collection('users').doc('abc123').get();
```

**After (modular):**

```js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc } from 'firebase/firestore';

initializeApp({ /* ... */ });
const db = getFirestore();
const docSnap = await getDoc(doc(db, 'users', 'abc123'));
```

### 4. Update Test Assertions

**Before (namespaced):**

```js
expect(mockCollection).toHaveBeenCalledWith('users');
expect(mockDoc).toHaveBeenCalledWith('abc123');
expect(mockGet).toHaveBeenCalled();
```

**After (modular):**

```js
expect(mockModularDoc).toHaveBeenCalledWith(db, 'users/abc123');
expect(mockGetDoc).toHaveBeenCalled();
```

## Mock Function Mapping

### Firestore Operations

| Namespaced Mock | Modular Mock | Modular Function |
|----------------|-------------|-----------------|
| `mockCollection` | `mockModularCollection` | `collection()` |
| `mockCollectionGroup` | `mockModularCollectionGroup` | `collectionGroup()` |
| `mockDoc` | `mockModularDoc` | `doc()` |
| `mockGet` | `mockGetDoc` / `mockGetDocs` | `getDoc()` / `getDocs()` |
| `mockAdd` | `mockAddDoc` | `addDoc()` |
| `mockSet` | `mockSetDoc` | `setDoc()` |
| `mockUpdate` | `mockUpdateDoc` | `updateDoc()` |
| `mockDelete` | `mockDeleteDoc` | `deleteDoc()` |
| `mockWhere` | `mockModularWhere` | `where()` |
| `mockOrderBy` | `mockModularOrderBy` | `orderBy()` |
| `mockLimit` | `mockModularLimit` | `limit()` |
| `mockStartAt` | `mockModularStartAt` | `startAt()` |
| `mockStartAfter` | `mockModularStartAfter` | `startAfter()` |
| `mockOnSnapShot` | `mockModularOnSnapshot` | `onSnapshot()` |
| `mockBatch` | `mockModularWriteBatch` | `writeBatch()` |
| `mockRunTransaction` | `mockModularRunTransaction` | `runTransaction()` |

### Auth Operations

| Namespaced Mock | Modular Mock | Modular Function |
|----------------|-------------|-----------------|
| `mockCreateUserWithEmailAndPassword` | `mockModularCreateUserWithEmailAndPassword` | `createUserWithEmailAndPassword()` |
| `mockSignInWithEmailAndPassword` | `mockModularSignInWithEmailAndPassword` | `signInWithEmailAndPassword()` |
| `mockSignOut` | `mockModularSignOut` | `signOut()` |
| `mockSendPasswordResetEmail` | `mockModularSendPasswordResetEmail` | `sendPasswordResetEmail()` |
| N/A | `mockOnAuthStateChanged` | `onAuthStateChanged()` |
| N/A | `mockConnectAuthEmulator` | `connectAuthEmulator()` |

## Dual API Support

Both modular and namespaced mocks share the same underlying `FakeFirestore` and `FakeAuth` classes. This means that when you use a modular function like `getDocs()`, both the modular mock (`mockGetDocs`) **and** the underlying namespaced mock (`mockGet`) are called. This allows incremental migration without breaking existing assertions.

## Node.js Requirements

This library now requires Node.js >= 18.
