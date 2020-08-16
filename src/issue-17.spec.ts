import actionCreatorFactory from 'typescript-fsa';
import {
  reducerWithoutInitialState,
  reducerWithInitialState,
} from 'typescript-fsa-reducers';
import { asyncFactory } from '.';

interface TestState {
  foo: string;
}

describe(`issue #17`, () => {
  it(`should be able to return nothing (PromiseLike<void>)`, () => {
    const create = actionCreatorFactory();
    const createAsync = asyncFactory(create);

    const example = createAsync('example', Promise.resolve);

    reducerWithoutInitialState().case(example.async.done, () => void 0);
  });

  it(`should be able to return nothing (non-promise void)`, () => {
    const create = actionCreatorFactory();
    const createAsync = asyncFactory(create);

    const example = createAsync('example', () => {
      /* noop */
    });

    reducerWithoutInitialState().case(example.async.done, () => void 0);
  });

  it(`should be able to run normally (returning PromiseLike<string>)`, () => {
    const create = actionCreatorFactory();
    const createAsync = asyncFactory<TestState>(create);

    const example = createAsync(
      'example',
      async (bar: string, dispatch, getState) => {
        return `${getState().foo} ${bar}`;
      },
    );

    reducerWithInitialState({ foo: 'foo' }).case(
      example.async.done,
      (state, { result }) => ({ foo: result }),
    );
  });

  it(`should be able to run normally (returning non-promise string)`, () => {
    const create = actionCreatorFactory();
    const createAsync = asyncFactory<TestState>(create);

    const example = createAsync(
      'example',
      (bar: string, dispatch, getState) => {
        return `${getState().foo} ${bar}`;
      },
    );

    reducerWithoutInitialState().case(
      example.async.done,
      (state, { result }) => ({ foo: result }),
    );
  });
});
