# Mock Firestore

> Jest Mock for testing Google Cloud Firestore

A simple way to mock calls to Cloud Firestore.

## Table of Contents

- [Mock Firestore](#mock-firestore)
  - [Table of Contents](#table-of-contents)
  - [What's in the Box](#whats-in-the-box)
  - [System Requirements](#system-requirements)
  - [Installation](#installation)
  - [Getting Started](#getting-started)
  - [Contributing](#contributing)
  - [Code of Conduct](#code-of-conduct)
  - [About Upstatement](#about-upstatement)

## What's in the Box

This library provides an easy to use mocked version of firestore.

Example usage:

```js
const { FakeFirestore } = require('firestore-jest-mock');

const fakeDataBase = {
  users: [
    { id: 'abc123', name: 'Homer Simpson'}, 
    { id: 'abc456', name: 'Lisa Simpson' }
  ],
  posts: [
    { id: '123abc', title: 'Really cool title' }
  ]
}

jest.mock('firebase', () => {
  return {
    firestore: new FakeFirestore(fakeDataBase)
  };
})
```

This will populate a fake database with a `users` and `posts` collection.

TODO: add example of testing that certain methods are called

Note that this is not a substitute for Firestore and will *not* run actual queries against this collection.
This is just meant to assert that your methods call the appropriate ones against firestore.

## System Requirements


## Installation

1. Clone this repository

   ```bash
   git@github.com:Upstatement/firestore-jest-mock.git && cd <firestore-jest-mock>
   ```

2. Install dependencies

   ```bash
   npm install
   ```

## Getting Started

1. To start up the project run

   ```bash
   npm start
   ```

1. Visit [insert URL here](/) to view your project

Also add something about development workflow if applicable

## Contributing

We welcome all contributions to our projects! Filing bugs, feature requests, code changes, docs changes, or anything else you'd like to contribute are all more than welcome! More information about contributing can be found in the [contributing guidelines](.github/CONTRIBUTING.md).

## Code of Conduct

Upstatement strives to provide a welcoming, inclusive environment for all users. To hold ourselves accountable to that mission, we have a strictly-enforced [code of conduct](CODE_OF_CONDUCT.md).

## About Upstatement

[Upstatement](https://www.upstatement.com/) is a digital transformation studio headquartered in Boston, MA that imagines and builds exceptional digital experiences. Make sure to check out our [services](https://www.upstatement.com/services/), [work](https://www.upstatement.com/work/), and [open positions](https://www.upstatement.com/jobs/)!