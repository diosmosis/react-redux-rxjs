/**
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { Subject } from 'rxjs/Subject';

export const notdoneyet = 1;

export function middleware(...sagas) {
  return (store) => {
    // the subject that we broadcast each action to.
    const actionSubject = new Subject();

    // TODO: should try to detect recursion
    // invoke the sagas and subscribe to the saga observable, dispatching anything
    // that comes through.
    sagas.map(saga => saga(actionSubject)).forEach((observable) => {
      observable.subscribe({
        next: (nextAction) => {
          if (!nextAction) {
            return;
          }

          return store.dispatch(nextAction);
        },
      });
    });

    return next => (action) => {
      const result = next(action);

      Promise.resolve().then(() => actionSubject.next(action));

      return result;
    };
  };
}
