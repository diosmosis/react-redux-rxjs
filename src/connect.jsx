/**
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/operators/switchMap';
import 'rxjs/operators/map';
import 'rxjs/operators/merge';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import storeShape from './store-shape';

export default function connect(WrappedComponent, mapStoreToProps) {
  class ConnectedComponent extends Component {
    constructor(props, context) {
      super(props, context);
      this.state = {};
    }

    componentDidMount() {
      const observableProps = mapStoreToProps(this.context.state$, this.context.store.dispatch);

      const flattenedProps = Object.keys(observableProps).map((propName) => {
        let result;

        const value = observableProps[propName];
        if (value instanceof Observable) {
          result = value;
        } else {
          result = Observable.of(value);
        }

        return result.catch((e) => {
          // eslint-disable-next-line no-console
          console.log(
            `Error caught in ${propName} observable for connected ${WrappedComponent.name}:`,
            e.stack || e.message || e,
          );

          return Observable.empty();
        }).map(v => [propName, v]);
      });

      this.subscription = Observable.merge(...flattenedProps).subscribe((pair) => {
        const [propName, v] = pair;
        this.setState({ [propName]: v });
      });
    }

    componentWillUnmount() {
      this.subscription.unsubscribe();
    }

    render() {
      return <WrappedComponent {...this.state} />;
    }
  }

  ConnectedComponent.contextTypes = {
    store: storeShape,
    state$: PropTypes.instanceOf(Subject),
  };

  return ConnectedComponent;
}
