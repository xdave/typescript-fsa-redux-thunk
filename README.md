# [TypeScript FSA](https://github.com/aikoven/typescript-fsa) utilities for redux-thunk
[![npm (tag)](https://img.shields.io/npm/v/typescript-fsa-redux-thunk/beta.svg)](https://github.com/xdave/typescript-fsa-redux-thunk)
[![npm](https://img.shields.io/npm/l/typescript-fsa-redux-thunk.svg)](https://github.com/xdave/typescript-fsa-redux-thunk/blob/v2/LICENSE.md)
[![GitHub last commit (branch)](https://img.shields.io/github/last-commit/xdave/typescript-fsa-redux-thunk/v2.svg)](https://github.com/xdave/typescript-fsa-redux-thunk)
[![Build Status][travis-image]][travis-url]
[![codecov](https://codecov.io/gh/xdave/typescript-fsa-redux-thunk/branch/v2/graph/badge.svg)](https://codecov.io/gh/xdave/typescript-fsa-redux-thunk)

### NOTE: There's breaking changes from 1.x.  Read on to find out more and check the notes at the bottom for more info.

## Installation

```
npm install --save typescript-fsa-redux-thunk@beta
```

## API

### `isPromise(thing: T | Promise<T>): thing is Promise<T> (boolean)`

This is a type assertion predicate which can be used to cast something to the
proper Promise type (if you think that it might be) or, if negated, will cast
away a possible promise to a non-promise.  Could be useful to you when dealing
with the return type of the thunks -- which could be either.

### `isSuccess(action: Action): action is Action<Success<P, S>> (boolean)`

This is useful to cast the result of the thunk dispatch to a Success Action if
it is one.  This will provide the proper shape for the `payload` key to access
the result.

### `isFailure(action: Action): action is Action<Failure<P, E>> (boolean)`

This is useful to cast the result of the thunk dispatch to a Failure Action if
it is one.  This will provide the proper shape for the `payload` key to access
the error.

### `bindThunkAction(actionCreators: AsyncActionCreators | ThunkActionCreators): ActionCreator`

Creates redux-thunk that wraps the target async actions.
Resulting thunk dispatches `started` action once it is started and
`done`/`failed` upon finish.

**Example:**

```ts
// actions.ts
import actionCreatorFactory from 'typescript-fsa';
import { bindThunkAction, isSuccess, isFailure } from 'typescript-fsa-redux-thunk';

const actionCreator = actionCreatorFactory();

// specify parameters and result shapes as generic type arguments
export const doSomething =
  actionCreator.async<{ foo: string },          // parameter type
                      Promise<{ bar: number }>  // result type
                     >('DO_SOMETHING');

export const doSomethingWorker = bindThunkAction(doSomething,
  async (params /*, dispatch, getState, extraArg */) => {
    // `params` type is `{ foo: string }`
    // The optional arguments `dispatch`, `getState` and `extraArg` are `any`
    const res = await fetch(`/api/foo/${params.foo}`);

    if (res.status >= 400) {
      throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }

    const bar = await res.text() as Promise<number>;
    return { bar };
  });
```
... **somewhere else:**
```ts
// works just like a regular redux-thunk
// EXCEPT that it returns the resulting flux action object
// And you must check the return type
const action = await store.dispatch(doSomethingWorker({ foo: 'blah' }));
if (isSuccess(action)) {
  // do something with action.payload.result ...
}
// or
if (isFailure(action)) {
  // do something with action.payload.error (ie. throw, etc) ...
}
```

You can also specify the type of your redux store's state; however, in this
case, because we augment the type of the `async()` method in the `typescript-fsa`
action creator factory, you need to specify four generic type arguments, for example:

```ts
export const doSomething =
actionCreator.async<{ baz: boolean }          // redux store state type
                    { foo: string },          // parameter type
                    Promise<{ bar: number }>, // result type
                    Error                     // error type
                    >('DO_SOMETHING');

export const doSomethingWorker = bindThunkAction(doSomething,
  async (params, dispatch, getState, extraArg) => {
    // `params` type is `{ foo: string }`
    // `dispatch` type is `Dispatch<{ baz: boolean }>`
    // `getState` type is `() => { baz: boolean }`
    // `extraArg` is always `any` (for now)

    const { baz } = getState();

    if (!dispatch(someOtherAction(baz))) {
      throw new Error('perhaps throw an error here for some reason');
    }

    const res = await fetch(`/api/foo/${params.foo}`);

    if (res.status >= 400) {
      throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }

    const text = await res.text();
    const bar = parseInt(text, 10);

    return { bar };
  });
```

Whereas in version 1.x, the error type was always re-thrown after
the `.failed()` async action creator was called, in version 2.x, it is not.

**You are responsible for checking for the error in the calling code and altering**
**your execution path(s) upon failure.**

Another breaking change from 1.x is the result type is not always assumed to be
a Promise.  If you want the result to be a promise, you must specify the type to
be one.  ie: `Promise<T>`, rather than just `T`.

**If your thunk's Result type is not a Promise, example:**
```ts
import actionCreatorFactory from 'typescript-fsa';
import { bindThunkAction, isPromise, isSuccess } from 'typescript-fsa-redux-thunk';
export const doSomething =
  actionCreator.async<{ baz: boolean } // redux store state type
                      { foo: string }, // parameter type
                      { bar: number }, // result type
                      Error            // error type
                      >('DO_SOMETHING');
export const doSomethingWorker = bindThunkAction(doSomething, params => {
  // do something with params...

  return { bar: 5 };
});
```
... **elsewhere:**
```ts
const action = store.dispatch(doSomething({ foo: 'no promises' }));
if (!isPromise(action) && isSuccess(action)) {
  // do something with action.payload.result ...
}
```

[npm-image]: https://badge.fury.io/js/typescript-fsa-redux-thunk.svg
[npm-url]: https://badge.fury.io/js/typescript-fsa-redux-thunk
[travis-image]: https://travis-ci.org/xdave/typescript-fsa-redux-thunk.svg?branch=master
[travis-url]: https://travis-ci.org/xdave/typescript-fsa-redux-thunk
