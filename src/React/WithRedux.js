import {
  connect
} from 'react-redux';
import {
  withRouter
} from "react-router-dom";

export function mergeMapFuns(...funs) {
  return (...args) => {
    const result = {};
    for (let fun of funs) {
      Object.assign(result, fun(...args));
    }
    return result;
  };
}

export function withRouterConnect(mapState = a => a, mapDispatch = a => ({})) {
  return function(Class) {
    return withRouter(connect(mapState, mapDispatch)(Class));
  }
}

export default function createFunction(config = {}) {
  const {
    name = null,
      defaultState = {},
      reducer = {},
      action = {},
  } = config;
  if (name === null || name === '') {
    throw new Error('model must has name.');
  }
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
    } else if (action.type === setStateAction) {
      lastState = {
        ...state,
        ...action.data,
      };
    } else if (action.type === resetStateAction) {
      lastState = {
        ...$defaultState,
        ...action.data,
      };
    } else {
      lastState = state;
    }
    return lastState;
  }

  function theMapState(state) {
    return {
      [name + 'State']: state[name],
    }
  };

  function theMapDispatch(dispatch) {
    function update(data = {}) {
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
          update,
          dispatch,
          state: lastState,
        });
      }
    }
    return {
      dispatch,
      [setStateAction]: update,
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
    return withRouterConnect(
      mergeMapFuns(theMapState, mapState),
      mergeMapFuns(theMapDispatch, mapDispatch));
  }

  theConnect.$name = name;
  theMapState.$name = name
  theMapDispatch.$name = name;
  theReducer.$name = name;

  return {
    [name + 'Connect']: theConnect,
    [name + 'MapState']: theMapState,
    [name + 'MapDispatch']: theMapDispatch,
    [name + 'Reducer']: theReducer,
  };
}
