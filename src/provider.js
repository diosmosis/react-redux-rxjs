/**
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import { Component, Children } from 'react';
import PropTypes from 'prop-types';
import storeShape from './store-shape';

const REPLAY_BUFFER_SIZE = 1;

export default class Provider extends Component {
  constructor(props, context) {
    super(props, context);

    this.store = props.store;

    this.state$ = new ReplaySubject(REPLAY_BUFFER_SIZE);
    this.state$.next(this.store.getState());

    this.unsubscribe = this.store.subscribe(() => {
      this.state$.next(this.store.getState());
    });
  }

  getChildContext() {
    return { store: this.store, state$: this.state$ };
  }

  componentWillUnmount() {
    this.unsubscribe();

    delete this.store;
    delete this.state$;
  }

  render() {
    return Children.only(this.props.children);
  }
}

Provider.propTypes = {
  store: storeShape.isRequired,
  children: PropTypes.element.isRequired,
};

Provider.childContextTypes = {
  state$: PropTypes.instanceOf(Subject).isRequired,
  store: storeShape.isRequired,
};

Provider.displayName = 'Provider';
