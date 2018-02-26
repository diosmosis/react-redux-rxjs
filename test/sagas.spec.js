/**
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { createStore, applyMiddleware } from 'redux';
import { expect } from 'chai';
import * as Rx from 'rxjs';
import { middleware } from '../src';

describe('middleware', () => {
  it('should pipe all saga observable output into the store\'s dispatch function', async () => {
    const capturedActions = [];

    const saga1 = actions => actions
      .filter(action => action.type === 'type-1')
      .map(() => {
        return ({
          type: 'type-2',
        });
      });

    const saga2 = actions => actions
      .filter(action => action.type === 'type-2')
      .map(() => {
        return ({
          type: 'type-3',
        })
      });

    const collector = actions => actions
      .do((action) => {
        capturedActions.push(action);
      })
      .switchMap(() => Rx.Observable.never());

    const sagas = [saga1, saga2, collector];

    const store = createStore(
      state => state,
      undefined,
      applyMiddleware(middleware(...sagas)),
    );

    store.dispatch({ type: 'type-1' });

    await new Promise(resolve => setTimeout(resolve, 500));

    expect(capturedActions).to.deep.equal([
      { type: 'type-1' },
      { type: 'type-2' },
      { type: 'type-3' },
    ]);
  });
});
