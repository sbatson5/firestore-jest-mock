# Mock Firestore

> Jest Mock for testing Google Cloud Firestore

A simple way to mock calls to Cloud Firestore, allowing you to assert that you are requesting data correctly.

This is _not_ a pseudo-database -- it is only for testing you are interfacing with firebase/firestore the way you expect.

## ⚠️ WARNING ⚠️

This library is **NOT** feature complete with all available methods exposed by Firestore.

Small, easy to grok pull requests are welcome, but please note that there is no official roadmap for making this library fully featured.

## Table of Contents

- [Mock Firestore](#mock-firestore)
  - [⚠️ WARNING ⚠️](#️-warning-️)
  - [Table of Contents](#table-of-contents)
  - [What's in the Box](#whats-in-the-box)
  - [Installation](#installation)
  - [Usage](#usage)
    - [`mockFirebase`](#mockfirebase)
    - [`@google-cloud/firestore` compatibility](#google-cloudfirestore-compatibility)
    - [Subcollections](#subcollections)
    - [What would you want to test?](#what-would-you-want-to-test)
    - [Don't forget to reset your mocks](#dont-forget-to-reset-your-mocks)
      - [I wrote a where clause, but all the records were returned!](#i-wrote-a-where-clause-but-all-the-records-were-returned)
    - [Additional options](#additional-options)
      - [includeIdsInData](#includeidsindata)
      - [mutable](#mutable)
    - [Functions you can test](#functions-you-can-test)
      - [Firestore](#firestore)
      - [Firestore.Query](#firestorequery)
      - [Firestore.FieldValue](#firestorefieldvalue)
      - [Firestore.Timestamp](#firestoretimestamp)
      - [Firestore.Transaction](#firestoretransaction)
      - [Auth](#auth)
  - [Contributing](#contributing)
  - [Code of Conduct](#code-of-conduct)
  - [About Upstatement](#about-upstatement)

## What's in the Box

This library provides an easy to use mocked version of firestore.

## Installation

With [npm](https://www.npmjs.com):

```shell
npm install --save-dev firestore-jest-mock
```

With [yarn](https://yarnpkg.com/):

```shell
yarn add --dev firestore-jest-mock
```

## Usage

### `mockFirebase`

The default method to use is `mockFirebase`, which returns a jest mock, overwriting `firebase` and `firebase-admin`. It accepts an object with two pieces:

- `database` -- A mock of your collections
- `currentUser` -- (optional) overwrites the currently logged in user

Example usage:

```js
const { mockFirebase } = require('firestore-jest-mock');

// Create a fake Firestore with a `users` and `posts` collection
mockFirebase({
  database: {
    users: [
      { id: 'abc123', name: 'Homer Simpson' },
      { id: 'abc456', name: 'Lisa Simpson' },
    ],
    posts: [{ id: '123abc', title: 'Really cool title' }],
  },
});
```

This will populate a fake database with a `users` and `posts` collection.

Now you can write queries or requests for data just as you would with Firestore:

```js
const { mockCollection } = require('firestore-jest-mock/mocks/firestore');

test('testing stuff', () => {
  const firebase = require('firebase'); // or import firebase from 'firebase';
  const db = firebase.firestore();

  return db
    .collection('users')
    .get()
    .then(userDocs => {
      // Assert that a collection ID was referenced
      expect(mockCollection).toHaveBeenCalledWith('users');

      // Write other assertions here
    });
});
```

### `@google-cloud/firestore` compatibility

If you use `@google-cloud/firestore`, use `mockGoogleCloudFirestore` instead of `mockFirebase` in all the documentation.

```js
const { mockGoogleCloudFirestore } = require('firestore-jest-mock');

mockGoogleCloudFirestore({
  database: {
    users: [
      { id: 'abc123', name: 'Homer Simpson' },
      { id: 'abc456', name: 'Lisa Simpson' },
    ],
    posts: [{ id: '123abc', title: 'Really cool title' }],
  },
});

const { mockCollection } = require('firestore-jest-mock/mocks/firestore');

test('testing stuff', () => {
  const { Firestore } = require('@google-cloud/firestore');
  const firestore = new Firestore();

  return firestore
    .collection('users')
    .get()
    .then(userDocs => {
      expect(mockCollection).toHaveBeenCalledWith('users');
      expect(userDocs[0].name).toEqual('Homer Simpson');
    });
});
```

_Note: Authentication with `@google-cloud/firestore` is not handled in the same way as with `firebase`.
The `Auth` module is not available for `@google-cloud/firestore` compatibility._

### Subcollections

A common case in Firestore is to store data in document [subcollections](https://firebase.google.com/docs/firestore/manage-data/structure-data#subcollections). You can model these in firestore-jest-mock like so:

```js
const { mockFirebase } = require('firestore-jest-mock');
// Using our fake Firestore from above:
mockFirebase({
  database: {
    users: [
      {
        id: 'abc123',
        name: 'Homer Simpson',
      },
      {
        id: 'abc456',
        name: 'Lisa Simpson',
        _collections: {
          notes: [
            {
              id: 'note123',
              text: 'This is a document in a subcollection!',
            },
          ],
        },
      },
    ],
    posts: [{ id: '123abc', title: 'Really cool title' }],
  },
});
```

Similar to how the `id` key models a document object, the `_collections` key models a subcollection. You model each subcollection key in the same way that `database` is modeled above: an object keyed by collection IDs and populated with document arrays.

This lets you model and validate more complex document access:

```js
const { mockCollection, mockDoc } = require('firestore-jest-mock/mocks/firestore');

test('testing stuff', () => {
  const firebase = require('firebase');
  const db = firebase.firestore();

  return db
    .collection('users')
    .doc('abc456')
    .collection('notes')
    .get()
    .then(noteDocs => {
      // Assert that a collection or document ID was referenced
      expect(mockCollection).toHaveBeenNthCalledWith(1, 'users');
      expect(mockDoc).toHaveBeenCalledWith('abc456');
      expect(mockCollection).toHaveBeenNthCalledWith(2, 'notes');

      // Write other assertions here
    });
});
```

### What would you want to test?

The job of the this library is not to test Firestore, but to allow you to test your code without hitting firebase.
Take this example:

```js
function maybeGetUsersInState(state) {
  const query = firestore.collection('users');

  if (state) {
    query = query.where('state', '==', state);
  }

  return query.get();
}
```

We have a conditional query here. If you pass `state` to this function, we will query against it; otherwise, we just get all of the users. So, you may want to write a test that ensures you are querying correctly:

```js
const { mockFirebase } = require('firestore-jest-mock');

// Import the mock versions of the functions you expect to be called
const { mockCollection, mockWhere } = require('firestore-jest-mock/mocks/firestore');
describe('we can query', () => {
  mockFirebase({
    database: {
      users: [
        {
          id: 'abc123',
          name: 'Homer Simpson',
          state: 'connecticut',
        },
        {
          id: 'abc456',
          name: 'Lisa Simpson',
          state: 'alabama',
        },
      ],
    },
  });

  test('query with state', async () => {
    await maybeGetUsersInState('alabama');

    // Assert that we call the correct Firestore methods
    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(mockWhere).toHaveBeenCalledWith('state', '==', 'alabama');
  });

  test('no state', async () => {
    await maybeGetUsersInState();

    // Assert that we call the correct Firestore methods
    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(mockWhere).not.toHaveBeenCalled();
  });
});
```

In this test, we don't necessarily care what gets returned from Firestore (it's not our job to test Firestore), but instead we try to assert that we built our query correctly.

> If I pass a state to this function, does it properly query the `users` collection?

That's what we want to answer.

### Don't forget to reset your mocks

In jest, mocks will not reset between test instances unless you specify them to.
This can be an issue if you have two tests that make an asseration against something like `mockCollection`.
If you call it in one test and assert that it was called in another test, you may get a false positive.

Luckily, jest offers a few methods to reset or clear your mocks.

- [clearAllMocks()](https://jestjs.io/docs/en/jest-object#jestclearallmocks) clears all the calls for all of your mocks. It's good to run this in a `beforeEach` to reset between each test

```js
jest.clearAllMocks();
```

- [mockClear()](https://jestjs.io/docs/en/mock-function-api.html#mockfnmockclear) this resets one specific mock function

```js
mockCollection.mockClear();
```

#### I wrote a where clause, but all the records were returned!

The `where` clause in the mocked Firestore will not actually filter the data at all.
We are not recreating Firestore in this mock, just exposing an API that allows us to write assertions.
It is also not the job of the developer (you) to test that Firestore filtered the data appropriately.
Your application doesn't double-check Firestore's response -- it trusts that it's always correct!

### Additional options

The default state of this mock is meant for basic testing that should cover most everyone.  
However, you can pass an `options` object to the mock to overwrite some default behavior.

```js
const options = {
  includeIdsInData: true,
  mutable: true,
};

mockFirebase(database, options);
```

#### includeIdsInData

By default, id's are not returned with the document's data.
Although you can declare an id when setting up your fake database, it will not be returned with `data()` as that is not the default behavior of firebase.
However, a common practice for firestore users is to manually write an `id` property to their documents, allowing them to query `collectionGroup` by id.

#### mutable

_Warning: Thar be dragons_

By default, the mock database you set up is immutable.
This means it doesn't update, even when you call things like `set` or `add`, as the result isn't typically important for your tests.
If you need your tests to update the mock database, you can set `mutable` to true when calling `mockFirebase`.
Calling `.set()` on a document or collection would update the mock database you created.
This can make your tests less predictable, as they may need to be run in the same order.

Use with caution.

_Note: not all APIs that update the database are supported yet. PR's welcome!_

### Functions you can test

#### [Firestore](https://googleapis.dev/nodejs/firestore/latest/Firestore.html)

| Method                | Use                                                                                               | Method in Firestore                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `mockCollection`      | Assert the correct collection is being queried                                                    | [collection](https://googleapis.dev/nodejs/firestore/latest/Firestore.html#collection)                |
| `mockCollectionGroup` | Assert the correct collectionGroup is being queried                                               | [collectionGroup](https://googleapis.dev/nodejs/firestore/latest/Firestore.html#collectionGroup)      |
| `mockDoc`             | Assert the correct record is being fetched by id. Tells the mock you are fetching a single record | [doc](https://googleapis.dev/nodejs/firestore/latest/Firestore.html#doc)                              |
| `mockBatch`           | Assert batch was called                                                                           | [batch](https://googleapis.dev/nodejs/firestore/latest/Firestore.html#batch)                          |
| `mockBatchDelete`     | Assert correct refs are passed                                                                    | [batch delete](https://googleapis.dev/nodejs/firestore/latest/WriteBatch.html#delete)                 |
| `mockBatchCommit`     | Assert commit is called. Returns a promise                                                        | [batch commit](https://googleapis.dev/nodejs/firestore/latest/WriteBatch.html#commit)                 |
| `mockGetAll`          | Assert correct refs are passed. Returns a promise resolving to array of docs.                     | [getAll](https://googleapis.dev/nodejs/firestore/latest/Firestore.html#getAll)                        |
| `mockUpdate`          | Assert correct params are passed to update. Returns a promise                                     | [update](https://googleapis.dev/nodejs/firestore/latest/DocumentReference.html#update)                |
| `mockAdd`             | Assert correct params are passed to add. Returns a promise resolving to the doc with new id       | [add](https://googleapis.dev/nodejs/firestore/latest/CollectionReference.html#add)                    |
| `mockSet`             | Assert correct params are passed to set. Returns a promise                                        | [set](https://googleapis.dev/nodejs/firestore/latest/DocumentReference.html#set)                      |
| `mockDelete`          | Assert delete is called on ref. Returns a promise                                                 | [delete](https://googleapis.dev/nodejs/firestore/latest/DocumentReference.html#delete)                |
| `mockUseEmulator`     | Assert correct host and port are passed                                                           | [useEmulator](https://firebase.google.com/docs/reference/js/firebase.firestore.Firestore#useemulator) |

#### [Firestore.Query](https://googleapis.dev/nodejs/firestore/latest/Query.html)

| Method              | Use                                                                                       | Method in Firestore                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `mockGet`           | Assert get is called. Returns a promise resolving either to a single doc or querySnapshot | [get](https://googleapis.dev/nodejs/firestore/latest/Query.html#get)                                  |
| `mockWhere`         | Assert the correct query is written. Tells the mock you are fetching multiple records     | [where](https://googleapis.dev/nodejs/firestore/latest/Query.html#where)                              |
| `mockLimit`         | Assert limit is set properly                                                              | [limit](https://googleapis.dev/nodejs/firestore/latest/Query.html#limit)                              |
| `mockOrderBy`       | Assert correct field is passed to orderBy                                                 | [orderBy](https://googleapis.dev/nodejs/firestore/latest/Query.html#orderBy)                          |
| `mockOffset`        | Assert offset is set properly                                                             | [offset](https://googleapis.dev/nodejs/firestore/latest/Query.html#offset)                            |
| `mockStartAfter`    | Assert startAfter is called                                                               | [startAfter](https://googleapis.dev/nodejs/firestore/latest/Query.html#startAfter)                    |
| `mockStartAt`       | Assert startAt is called                                                                  | [startAt](https://googleapis.dev/nodejs/firestore/latest/Query.html#startAt)                          |
| `mockWithConverter` | Assert withConverter is called                                                            | [withConverter](https://firebase.google.com/docs/reference/js/firebase.firestore.Query#withconverter) |

#### [Firestore.FieldValue](https://googleapis.dev/nodejs/firestore/latest/FieldValue.html)

| Method                          | Use                                                        | Method in Firestore                                                                                |
| ------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `mockArrayRemoveFieldValue`     | Assert the correct elements are removed from an array      | [arrayRemove](https://googleapis.dev/nodejs/firestore/latest/FieldValue.html#.arrayRemove)         |
| `mockArrayUnionFieldValue`      | Assert the correct elements are added to an array          | [arrayUnion](https://googleapis.dev/nodejs/firestore/latest/FieldValue.html#.arrayUnion)           |
| `mockDeleteFieldValue`          | Assert the correct fields are removed from a document      | [delete](https://googleapis.dev/nodejs/firestore/latest/FieldValue.html#.delete)                   |
| `mockIncrementFieldValue`       | Assert a number field is incremented by the correct amount | [increment](https://googleapis.dev/nodejs/firestore/latest/FieldValue.html#.increment)             |
| `mockServerTimestampFieldValue` | Assert a server Firebase.Timestamp value will be stored    | [serverTimestamp](https://googleapis.dev/nodejs/firestore/latest/FieldValue.html#.serverTimestamp) |

#### [Firestore.Timestamp](https://googleapis.dev/nodejs/firestore/latest/Timestamp.html)

| Method                    | Use                                                                    | Method in Firestore                                                                     |
| ------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `mockTimestampToDate`     | Assert the call and mock the result, or use the default implementation | [toDate](https://googleapis.dev/nodejs/firestore/latest/Timestamp.html#toDate)          |
| `mockTimestampToMillis`   | Assert the call and mock the result, or use the default implementation | [toMillis](https://googleapis.dev/nodejs/firestore/latest/Timestamp.html#toMillis)      |
| `mockTimestampFromDate`   | Assert the call and mock the result, or use the default implementation | [fromDate](https://googleapis.dev/nodejs/firestore/latest/Timestamp.html#.fromDate)     |
| `mockTimestampFromMillis` | Assert the call and mock the result, or use the default implementation | [fromMillis](https://googleapis.dev/nodejs/firestore/latest/Timestamp.html#.fromMillis) |
| `mockTimestampNow`        | Assert the call and mock the result, or use the default implementation | [now](https://googleapis.dev/nodejs/firestore/latest/Timestamp.html#.now)               |

#### [Firestore.Transaction](https://googleapis.dev/nodejs/firestore/latest/Transaction.html)

| Method                  | Use                                                                                     | Method in Firestore                                                              |
| ----------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `mockGetTransaction`    | Assert transaction.get is called with correct params. Returns a promise                 | [get](https://googleapis.dev/nodejs/firestore/latest/Transaction.html#get)       |
| `mockGetAllTransaction` | Assert transaction.getAll is called with correct params. Returns a promise              | [get](https://googleapis.dev/nodejs/firestore/latest/Transaction.html#getAll)    |
| `mockSetTransaction`    | Assert transaction.set is called with correct params. Returns the transaction object    | [set](https://googleapis.dev/nodejs/firestore/latest/Transaction.html#set)       |
| `mockUpdateTransaction` | Assert transaction.update is called with correct params. Returns the transaction object | [update](https://googleapis.dev/nodejs/firestore/latest/Transaction.html#update) |
| `mockDeleteTransaction` | Assert transaction.delete is called with correct params. Returns the transaction object | [delete](https://googleapis.dev/nodejs/firestore/latest/Transaction.html#delete) |

#### [Auth](https://firebase.google.com/docs/reference/js/firebase.auth.Auth)

| Method                               | Use                                                                        | Method in Firebase                                                                                                                     |
| ------------------------------------ | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `mockCreateUserWithEmailAndPassword` | Assert correct email and password are passed. Returns a promise            | [createUserWithEmailAndPassword](https://firebase.google.com/docs/reference/js/firebase.auth.Auth.html#createuserwithemailandpassword) |
| `mockGetUser`                        | Assert correct user IDs are passed. Returns a promise                      | [getUser](https://firebase.google.com/docs/auth/admin/manage-users#retrieve_user_data)                                                 |
| `mockDeleteUser`                     | Assert correct ID is passed to delete method. Returns a promise            | [deleteUser](https://firebase.google.com/docs/auth/admin/manage-users)                                                                 |
| `mockSendVerificationEmail`          | Assert request for verification email was sent. Lives on the `currentUser` | [sendVerificationEmail](https://firebase.google.com/docs/reference/js/firebase.User#send-email-verification)                           |
| `mockSetCustomUserClaims`            | Assert correct user ID and claims are set.                                 | [setCustomUserClaims](https://firebase.google.com/docs/reference/admin/node/admin.auth.Auth?hl=en#setcustomuserclaims)                 |
| `mockSignInWithEmailAndPassword`     | Assert correct email and password were passed. Returns a promise           | [signInWithEmailAndPassword](https://firebase.google.com/docs/reference/js/firebase.auth.Auth.html#signinwithemailandpassword)         |
| `mockSendPasswordResetEmail`         | Assert correct email was passed.                                           | [sendPasswordResetEmail](https://firebase.google.com/docs/reference/js/firebase.auth.Auth.html#send-password-reset-email)              |
| `mockVerifyIdToken`                  | Assert correct token is passed. Returns a promise                          | [verifyIdToken](https://firebase.google.com/docs/reference/admin/node/admin.auth.Auth.html#verifyidtoken)                              |
| `mockUseEmulator`                    | Assert correct emulator url is passed                                      | [useEmulator](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#useemulator)                                            |
| `mockSignOut`                        | Assert sign out is called. Returns a promise                               | [signOut](https://firebase.google.com/docs/reference/js/firebase.auth.Auth.html#signout)                                               |

## Contributing

We welcome all contributions to our projects! Filing bugs, feature requests, code changes, docs changes, or anything else you'd like to contribute are all more than welcome! More information about contributing can be found in the [contributing guidelines](.github/CONTRIBUTING.md).

To get set up, simply clone this repository and `npm install`!

## Code of Conduct

Upstatement strives to provide a welcoming, inclusive environment for all users. To hold ourselves accountable to that mission, we have a strictly-enforced [code of conduct](CODE_OF_CONDUCT.md).

## About Upstatement

[Upstatement](https://www.upstatement.com/) is a digital transformation studio headquartered in Boston, MA that imagines and builds exceptional digital experiences. Make sure to check out our [services](https://www.upstatement.com/services/), [work](https://www.upstatement.com/work/), and [open positions](https://www.upstatement.com/jobs/)!
