# Mock Firestore

> Jest Mock for testing Google Cloud Firestore

A simple way to mock calls to Cloud Firestore, allowing you to assert that you are requesting data correctly.

This is _not_ a pseudo-database -- it is only for testing you are interfacing with firebase/firestore the way you expect.

## Table of Contents

- [Mock Firestore](#mock-firestore)
- [Table of Contents](#table-of-contents)
- [What's in the Box](#whats-in-the-box)
- [Installation](#installation)
- [Usage](#usage)
  - [`mockFirebase`](#mockfirebase)
  - [What would you want to test?](#what-would-you-want-to-test)
    - [I wrote a where clause, but all the records were returned!](#i-wrote-a-where-clause-but-all-the-records-were-returned)
  - [Functions you can test](#functions-you-can-test)
    - [Firestore](#firestore)
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
// Create a fake firestore with a `users` and `posts` collection
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

Now you can write queries or requests for data just as you would with firestore:

```js
test('testing stuff', () => {
  const firebase = require('firebase'); // or import firebase from 'firebase';
  const db = firebase.firestore();

  db.collection('users')
    .get()
    .then(userDocs => {
      // write assertions here
    });
});
```

### What would you want to test?

The job of the this library is not to test firestore, but to allow you to test your code without hitting firebase.
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
        { id: 'abc123', name: 'Homer Simpson' },
        { id: 'abc456', name: 'Lisa Simpson' },
      ],
    },
  });

  test('query with state', async () => {
    await maybeGetUsersInState('alabama');

    // Assert that we call the correct firestore methods
    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(mockWhere).toHaveBeenCalledWith('state', '==', 'alabama');
  });

  test('no state', async () => {
    await maybeGetUsersInState();

    // Assert that we call the correct firestore methods
    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(mockWhere).not.toHaveBeenCalled();
  });
});
```

In this test, we don't necessarily care what gets returned from firestore (it's not our job to test firestore), but instead we try to assert that we built our query correctly.

> If I pass a state to this function, does it properly query the `users` collection?

That's what we want to answer.

#### I wrote a where clause, but all the records were returned!

The `where` clause in the mocked firestore will not actually filter the data at all.
We are not recreating firestore in this mock, just exposing an API that allows us to write assertions.
It is also not the job of the developer (you) to test that firestore filtered the data appropriately.
Your application doesn't double-check firestore's response -- it trusts that it's always correct!

### Functions you can test

#### Firestore

| Method          | Use                                                                                               | Method in Firestore                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| mockCollection  | Assert the correct collection is being queried                                                    | [collection](https://googleapis.dev/nodejs/firestore/latest/Firestore.html#collection) |
| mockDoc         | Assert the correct record is being fetched by id. Tells the mock you are fetching a single record | [doc](https://googleapis.dev/nodejs/firestore/latest/Firestore.html#doc)               |
| mockWhere       | Assert the correct query is written. Tells the mock you are fetching multiple records             | [where](https://googleapis.dev/nodejs/firestore/latest/Query.html#where)               |
| mockBatch       | Assert batch was called                                                                           | [batch](https://googleapis.dev/nodejs/firestore/latest/Firestore.html#batch)           |
| mockBatchDelete | Assert correct refs are passed                                                                    | [batch delete](https://googleapis.dev/nodejs/firestore/latest/WriteBatch.html#delete)  |
| mockBatchCommit | Assert commit is called. Returns a promise                                                        | [batch commit](https://googleapis.dev/nodejs/firestore/latest/WriteBatch.html#commit)  |
| mockGet         | Assert get is called. Returns a promise resolving either to a single doc or querySnapshot         | [get](https://googleapis.dev/nodejs/firestore/latest/Query.html#get)                   |
| mockGetAll      | Assert correct refs are passed. Returns a promise resolving to array of docs.                     | [getAll](https://googleapis.dev/nodejs/firestore/latest/Firestore.html#getAll)         |
| mockUpdate      | Assert correct params are passed to update. Returns a promise                                     | [update](https://googleapis.dev/nodejs/firestore/latest/DocumentReference.html#update) |
| mockAdd         | Assert correct params are passed to add. Returns a promise resolving to the doc with new id       | [add](https://googleapis.dev/nodejs/firestore/latest/CollectionReference.html#add)     |
| mockSet         | Assert correct params are passed to set. Returns a promise                                        | [set](https://googleapis.dev/nodejs/firestore/latest/DocumentReference.html#set)       |
| mockDelete      | Assert delete is called on ref. Returns a promise                                                 | [delete](https://googleapis.dev/nodejs/firestore/latest/DocumentReference.html#delete) |
| mockOrderBy     | Assert correct field is passed to orderBy                                                         | [orderBy](https://googleapis.dev/nodejs/firestore/latest/Query.html#orderBy)           |
| mockLimit       | Assert limit is set properly                                                                      | [limit](https://googleapis.dev/nodejs/firestore/latest/Query.html#limit)               |

#### Auth

| Method                             | Use                                                                        | Method in Firebase                                                                                                                     |
| ---------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| mockCreateUserWithEmailAndPassword | Assert correct email and password are passed. Returns a promise            | [createUserWithEmailAndPassword](https://firebase.google.com/docs/reference/js/firebase.auth.Auth.html#createuserwithemailandpassword) |
| mockDeleteUser                     | Assert correct id is passed to delete method. Returns a promise            | [deleteUser](https://firebase.google.com/docs/auth/admin/manage-users)                                                                 |
| mockSendVerificationEmail          | Assert request for verification email was sent. Lives on the `currentUser` | [sendVerificationEmail](https://firebase.google.com/docs/reference/js/firebase.User#send-email-verification)                           |
| mockSignInWithEmailAndPassword     | Assert correct email and password were passed. Returns a promise           | [signInWithEmailAndPassword](https://firebase.google.com/docs/reference/js/firebase.auth.Auth.html#signinwithemailandpassword)         |
| mockSendPasswordResetEmail         | Assert correct email was passed.                                           | [sendPasswordResetEmail](https://firebase.google.com/docs/reference/js/firebase.auth.Auth.html#send-password-reset-email)              |
| mockVerifyIdToken                  | Assert correct token is passed. Returns a promise                          | [verifyIdToken](https://firebase.google.com/docs/reference/admin/node/admin.auth.Auth.html#verifyidtoken)                              |

## Contributing

We welcome all contributions to our projects! Filing bugs, feature requests, code changes, docs changes, or anything else you'd like to contribute are all more than welcome! More information about contributing can be found in the [contributing guidelines](.github/CONTRIBUTING.md).

To get set up, simply clone this repository and `npm install`!

## Code of Conduct

Upstatement strives to provide a welcoming, inclusive environment for all users. To hold ourselves accountable to that mission, we have a strictly-enforced [code of conduct](CODE_OF_CONDUCT.md).

## About Upstatement

[Upstatement](https://www.upstatement.com/) is a digital transformation studio headquartered in Boston, MA that imagines and builds exceptional digital experiences. Make sure to check out our [services](https://www.upstatement.com/services/), [work](https://www.upstatement.com/work/), and [open positions](https://www.upstatement.com/jobs/)!
