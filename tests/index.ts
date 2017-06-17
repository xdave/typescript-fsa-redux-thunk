import * as test from "tape";
import { Test } from "tape";
import { Action } from "redux";
import thunk from "redux-thunk";
import configureStore from "redux-mock-store";
import actionCreatorFactory from "typescript-fsa";
import { bindThunkAction } from '../src';

type State = { foo: string };
type Params = Test;
type Result = string;

const initial: State = { foo: 'test' };

const middleware = [thunk];
const mockStore = configureStore(middleware);
const store = mockStore(initial);

const createAction = actionCreatorFactory('test');

const testActionAsync =
  createAction.async<State, Params, Result, Error>('test');
const testAction = bindThunkAction(testActionAsync,
  async (assert, dispatch, getState, extra) => {
    assert.equal(typeof dispatch, 'function');
    assert.equal(typeof getState, 'function');
    assert.deepEqual(getState(), initial);
    assert.equal(typeof extra, 'undefined');
    return 'some result';
  });

function async(fn: (assert: Test) => Promise<any>) {
  return (assert: Test) => {
    fn(assert).then(
      () => assert.end(),
      error => assert.fail(error),
    );
  };
}

test('bindThunkAction', ({ test }: Test) => {
  test('started action', async(async (assert) => {
    const action = testActionAsync.started(assert);
    assert.deepEqual(action, {
      type: 'test/test_STARTED',
      payload: assert,
    });
  }));
  test('failed action', async(async (assert) => {
    const action = testActionAsync.failed({
      params: assert,
      error: undefined as any,
    });
    assert.deepEqual(action, {
      type: 'test/test_FAILED',
      error: true,
      payload: {
        params: assert,
        error: undefined,
      },
    });
  }));
  test('done action', async(async (assert) => {
    const action = testActionAsync.done({
      params: assert,
      result: 'some result',
    });
    assert.deepEqual(action, {
      type: 'test/test_DONE',
      payload: {
        params: assert,
        result: 'some result',
      },
    });
  }));
  test('redux thunk', async(async (assert) => {
    const result = await store.dispatch(testAction(assert));
    assert.deepEqual(result, 'some result');

    const dispatched = store.getActions().slice();

    assert.deepEqual(dispatched, [
      testActionAsync.started(assert),
      testActionAsync.done({
        params: assert,
        result: 'some result',
      }),
    ]);
  }));
});
