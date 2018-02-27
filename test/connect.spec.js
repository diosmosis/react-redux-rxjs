/**
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import * as Rx from 'rxjs';
import { createStore, applyMiddleware } from 'redux';
import { expect } from 'chai';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { middleware, connect, Provider } from '../src';

const INITIAL_STATE = {
  counter: 0,
};

function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'increment':
      return Object.assign({}, state, {
        counter: state.counter + 1,
      });
    case 'decrement':
      return Object.assign({}, state, {
        counter: state.counter - 1,
      });
    default:
      return state;
  }
}

describe('connect', function () {
  function Counter({ counter, otherVal, onIncrement }) {
    return (
      <div>
        <span id="counter">{counter}</span>
        <span id="other-val">{otherVal}</span>
        <button id="increment" onClick={onIncrement}>Increment</button>
      </div>
    );
  }

  const ConnectedComponent = connect(Counter, (state$) => {
    return {
      counter: state$.pluck('counter'),
      otherVal: 10,
      onIncrement: () => dispatch({ type: 'increment' }),
    };
  });

  let errorThrown = false;

  const ErrorConnectedComponent = connect(Counter, (state$, dispatch) => {
    return {
      counter: state$.pluck('counter'),
      otherVal: state$.map((state) => {
        if (state.counter % 2 !== 0) {
          errorThrown = true;
          throw new Error('forced error');
        }

        return state.counter + 12;
      }),
      onIncrement: () => dispatch({ type: 'increment' }),
    };
  });

  let store;
  function Application({ component }) {
    store = createStore(
      reducer,
      undefined,
      applyMiddleware(middleware()),
    );

    const Component = component;
    return (
      <Provider store={store}>
        <Component />
      </Provider>
    );
  }

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(document.getElementById('root'));
  });

  it('should automatically send state changes to the component', async () => {
    ReactDOM.render(<Application component={ConnectedComponent} />, document.getElementById('root'));

    expect(document.getElementById('counter').textContent).to.equal('0');
    expect(document.getElementById('other-val').textContent).to.equal('10');

    store.dispatch({ type: 'increment' });
    store.dispatch({ type: 'increment' });

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(document.getElementById('counter').textContent).to.equal('2');

    store.dispatch({ type: 'decrement' });

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(document.getElementById('counter').textContent).to.equal('1');
  });

  it('should not stop sending changes to the component if an exception occurs in an observable', async () => {
    ReactDOM.render(<Application component={ErrorConnectedComponent} />, document.getElementById('root'));

    expect(document.getElementById('counter').textContent).to.equal('0');
    expect(document.getElementById('other-val').textContent).to.equal('12');

    document.getElementById('increment').click();

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(errorThrown).to.be.true;

    expect(document.getElementById('counter').textContent).to.equal('1');
    expect(document.getElementById('other-val').textContent).to.equal('12');

    document.getElementById('increment').click();

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(document.getElementById('counter').textContent).to.equal('2');

    // otherVal won't update, but the rest still should
    expect(document.getElementById('other-val').textContent).to.equal('12');
  });
});
