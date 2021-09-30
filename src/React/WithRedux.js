import {
  connect
} from 'react-redux';
import {
  withRouter
} from "react-router-dom";

export default function createModel(config = {}) {
  const {
    name = '',
      defaultState = {},
      reducer = {},
      action = {},
  } = config;
  let lastState = defaultState;
  const $defaultState = JSON.parse(JSON.stringify(defaultState));
  const $name = name.replace(/^(\w)/, (a, b) => b.toLocaleUpperCase());
  const setStateAction = 'set' + $name + 'State';
  const resetStateAction = 'reset' + $name + 'State';

  function theReducer(state = defaultState, action) {
    if (reducer[action.type]) {
      const result = reducer[action.type](state, action);
      lastState = {
        ...state,
        ...result,
      };
    }
    if (action.type === setStateAction) {
      lastState = {
        ...state,
        ...action.data,
      };
    }
    if (action.type === resetStateAction) {
      lastState = {
        ...$defaultState,
        ...action.data,
      };
    }
    lastState = state;
    return lastState;
  }

  function theMapState(state) {
    return {
      [name + 'State']: state[name],
    }
  };

  function theMapDispatch(dispatch) {
    const setState = (data = {}) => {
      return dispatch({
        type: setStateAction,
        data,
      });
    };
    const newAction = {};
    for (let key in action) {
      const $key = key.replace(/^(\w)/, (a, b) => b.toLocaleUpperCase());
      newAction[name + $key] = (...args) => {
        return action[key]({
          args,
          setState,
          dispatch,
          state: lastState,
        });
      }
    }
    return {
      dispatch,
      [setStateAction]: setState,
      [resetStateAction]: (data = {}) => {
        return dispatch({
          type: resetStateAction,
          data,
        });
      },
      ...newAction,
    }
  }

  function theConnect(mapState = a => a, mapDispatch = a => ({})) {
    return function(Class) {
      return withRouter(connect((state) => {
        return {
          ...theMapState(state),
          ...mapState(state),
        }
      }, (dispatch) => {
        return {
          ...theMapDispatch(dispatch),
          ...mapDispatch(dispatch),
        }
      })(Class));
    }
  }

  theConnect.name = name;
  theMapState.name = name
  theMapDispatch.name = name;
  theReducer.name = name;

  return {
    [name + 'Connect']: theConnect,
    [name + 'MapState']: theMapState,
    [name + 'MapDispatch']: theMapDispatch,
    [name + 'Reducer']: theReducer,
  };
}
