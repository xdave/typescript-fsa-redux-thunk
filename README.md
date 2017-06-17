# [TypeScript FSA](https://github.com/aikoven/typescript-fsa) utilities for redux-thunk
[![Build Status](https://travis-ci.org/xdave/typescript-fsa-redux-thunk.png)](https://travis-ci.org/xdave/typescript-fsa-redux-thunk)

## Installation

```
npm install --save xdave/typescript-fsa-redux-thunk
```

## API

### `bindThunkAction(actionCreators: AsyncActionCreators | ThunkActionCreators): ThunkAction`

Creates redux-thunk that wraps the target async actions.
Resulting thunk dispatches `started` action once started and `done`/`failed`
upon finish.

**Example:**

```ts
// actions.ts
import actionCreatorFactory from 'typescript-fsa';
import { bindThunkAction } from 'typescript-fsa-redux-thunk';

const actionCreator = actionCreatorFactory();

// specify parameters and result shapes as generic type arguments
export const doSomething =
  actionCreator.async<{ foo: string },   // parameter type
                      { bar: number }    // result type
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

// somewhere else
...
  // works just like a regular redux-thunk
  const result = await store.dispatch(doSomethingWorker({ foo: 'blah' }));

...
```

You can also specify the type of your redux store's state; however, in this
case, because we augment the type of the `async()` method in the `typescript-fsa`
action creator factory, you need to specify four generic type arguments, for example:

```ts
export const doSomething =
actionCreator.async<{ baz: boolean }   // redux store state type
                    { foo: string },   // parameter type
                    { bar: number },   // result type
                    Error              // error type
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

    const bar = await res.text() as Promise<number>;
    return { bar };
  });
```

The error type is always a `throw`-able error.  It's always re-thrown after
the `.failed()` async action creator is called so you can do what you will with it.
