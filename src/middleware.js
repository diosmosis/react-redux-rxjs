/**
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export default function middleware(...sagas) {
  return (store) => {
    // the subject that we broadcast each action to.
    const actionSubject = new Subject();

    // TODO: should try to detect recursion during development
    // invoke the sagas and subscribe to the saga observable, dispatching anything
    // that comes through.
    const inner = sagas.map(saga => saga(actionSubject));
    Observable.merge(...inner).subscribe((nextAction) => {
      if (!nextAction) {
        return undefined;
      }

      return store.dispatch(nextAction);
    });

    return next => (action) => {
      const result = next(action);

      Promise.resolve().then(() => actionSubject.next(action));

      return result;
    };
  };
}
