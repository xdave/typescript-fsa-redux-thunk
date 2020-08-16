import { expect } from 'chai';
import { AnyAction, applyMiddleware, createStore } from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { asyncFactory } from './index';

/** Let this represent the thing we want as the extraArgument */
const FAKE_THING = { fake: 'thing' };

/** Initial application state */
const initialState = {
  someTest: {
    value: '',
  },
};
type State = typeof initialState;

const create = actionCreatorFactory('test');
const createAsync = asyncFactory<State, typeof FAKE_THING>(create);

const setStuff = createAsync(
  'set stuff',
  async (params, dispatch, getState, extraArgument) => extraArgument,
);

const reducer = reducerWithInitialState(initialState)
  .case(setStuff.async.done, (state, { result }) => ({
    ...state,
    someTest: {
      value: result.fake,
    },
  }))
  .build();

describe(`issue #22`, () => {
  it(`should be able to pass the extraArgument from middleware`, async () => {
    /**
     * You need to cast the type here, as the overload for withExtraArgument
     * is completely useless.
     */
    const middleware: ThunkMiddleware<
      State,
      AnyAction,
      typeof FAKE_THING
    > = thunk.withExtraArgument(FAKE_THING);

    const store = createStore(reducer, applyMiddleware(middleware));

    expect(store.getState()).to.eql(initialState);

    await store.dispatch(setStuff());

    /** Verify that the extra arg was passed to the thunk */
    expect(store.getState()).to.eql({
      ...initialState,
      someTest: {
        value: FAKE_THING.fake,
      },
    });
  });
});
