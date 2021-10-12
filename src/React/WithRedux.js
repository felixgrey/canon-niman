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

export function upperCaseFirst(text = '') {
  return `${text}`.replace(/^(\w)/, (a, b) => b.toUpperCase());
}

export function waitTime(time = 20) {
  return new Promise(r => setTimeout(r, time));
}

export default function createFunction(config = {}) {
  const {
    name = null,
      defaultState = {},
      reducer = {},
      action = {},
      payloadField = 'payload',
  } = config;
  if (name === null || name === '') {
    throw new Error('model must has name.');
  }
  let lastState = defaultState;
  const $defaultState = JSON.parse(JSON.stringify(defaultState));
  const $name = upperCaseFirst(name);
  const updateAction = name + 'Update';
  const resetAction = name + 'Reset';
  const loadingMap = new Map;

  function getLastState() {
    return lastState;
  }

  function theReducer(state = defaultState, action) {
    if (reducer[action.type]) {
      const result = reducer[action.type](state, action);
      lastState = {
        ...state,
        ...result,
      };
    } else if (action.type === updateAction) {
      lastState = {
        ...state,
        ...action[payloadField],
      };
    } else if (action.type === resetAction) {
      lastState = {
        ...$defaultState,
        ...action[payloadField],
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
        type: updateAction,
        [payloadField]: data,
      });
    };

    function clearLoadingData(name) {
      return loadingMap.delete(name);
    }

    async function loadOnce(name, callback) {
      if (loadingMap.has(name)) {
        return loadingMap.get(name);
      }
      const loadingName = name + 'Loading';
      update({
        [loadingName]: true,
      });
      const loadingPromise = new Promise((resolve, reject) => {
        const $update = async function(data) {
          update({
            ...data,
            [loadingName]: false,
          });
          await waitTime();
          resolve(data);
        }
        callback({
          $update,
          getLastState,
          clearLoadingData,
        });
      });

      loadingMap.set(name, loadingPromise);
      return loadingPromise;
    }

    const newAction = {};
    for (let key in action) {
      const $key = upperCaseFirst(key);
      newAction[name + $key] = (...args) => {
        return action[key]({
          args,
          update,
          dispatch,
          state: lastState,
          getLastState,
          waitTime,
          loadOnce,
          clearLoadingData,
        });
      }
    }
    return {
      dispatch,
      [updateAction]: update,
      [resetAction]: (data = {}) => {
        return dispatch({
          type: resetAction,
          [payloadField]: data,
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
