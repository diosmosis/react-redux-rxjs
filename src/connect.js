/**
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
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
      // TODO: observble errors should be thrown in render
      const observableProps = mapStoreToProps(this.context.state$, this.context.store.dispatch);

      this.dynamicPropsInited = {};
      this.staticProps = {};
      Object.keys(observableProps).forEach((propName) => {
        const value = observableProps[propName];
        if (value instanceof Observable) {
          value.subscribe(v => {
            this.setState({ [propName]: v });
          });

          this.dynamicPropsInited[propName] = false;
        } else {
          this.staticProps[propName] = value;
        }
      });
    }

    render() {
      return <WrappedComponent {...this.state} {...this.staticProps} />;
    }
  }

  ConnectedComponent.contextTypes = {
    store: storeShape,
    state$: PropTypes.instanceOf(Subject),
  };

  return ConnectedComponent;
};
