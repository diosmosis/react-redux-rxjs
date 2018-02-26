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
  const store = createStore(
    reducer,
    undefined,
    applyMiddleware(middleware()),
  );

  function Counter({ counter }) {
    return <span id="counter">{counter}</span>;
  }

  const ConnectedComponent = connect(Counter, (state$) => {
    return {
      counter: state$.map(state => state.counter), // TODO: add select operator if not exists
    };
  });

  function Application() {
    return (
      <Provider store={store}>
        <ConnectedComponent />
      </Provider>
    );
  }

  it('should automatically send state changes to the component', async () => {
    ReactDOM.render(<Application />, document.getElementById('root'));

    expect(document.getElementById('counter').textContent).to.equal('0');

    store.dispatch({ type: 'increment' });
    store.dispatch({ type: 'increment' });

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(document.getElementById('counter').textContent).to.equal('2');

    store.dispatch({ type: 'decrement' });

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(document.getElementById('counter').textContent).to.equal('1');
  });
});
