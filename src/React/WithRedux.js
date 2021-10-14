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

export function waitTime(t = 0) {
  return new Promise(r => setTimeout(r, t));
}

export function upperCaseFirst(text = '') {
  return `${text}`.replace(/^(\w)/, (a, b) => b.toUpperCase());
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
  const namedState = name + 'State';
  const loadingMap = new Map();

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
      [namedState]: state[namedState],
    }
  };

  function theMapDispatch(dispatch) {
    function update(data = {}) {
      return dispatch({
        type: updateAction,
        [payloadField]: data,
      });
    };

    function deleteLoadedData(...names) {
      const deleted = names.map(name => {
        if (loadingMap.has(name)) {
          loadingMap.get(name).cancelResolve();
        }
        loadingMap.delete(name)
      });
      if (names.length <= 1) {
        return deleted[0];
      }
      return deleted;
    }

    async function loadOnce(name, callback) {
      if (loadingMap.has(name)) {
        return loadingMap.get(name);
      }
      const loadingName = name + 'Loading';
      update({
        [loadingName]: true,
      });
      let onCancel = Function.prototype;
      let cancelResolve;
      let loadingPromise;
      let done = false;
      loadingPromise = new Promise((resolve, reject) => {
        cancelResolve = () => {
          resolve(onCancel());
        };
        const $update = async function(data) {
          if (done || loadingPromise !== loadingMap.get(name)) {
            return;
          }
          done = true;
          onCancel = Function.prototype;
          update({
            ...data,
            [loadingName]: false,
          });
          resolve(data);
        }
        callback({
          $update,
          getLastState,
          deleteLoadedData,
          setOnCancel: (callback) => {
            onCancel = callback;
          },
          waitTime,
        });
      });
      loadingPromise.cancelResolve = cancelResolve;
      loadingMap.set(name, loadingPromise);
      return loadingPromise;
    }

    const newAction = {};
    const myAction = {};
    for (let key in action) {
      const $key = upperCaseFirst(key);
      myAction[key] = newAction[name + $key] = (...args) => {
        return action[key]({
          args,
          update,
          dispatch,
          state: lastState,
          getLastState,
          loadOnce,
          deleteLoadedData,
          waitTime,
          myAction,
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

  theReducer.$name = namedState;

  return {
    [name + 'Connect']: theConnect,
    [name + 'MapState']: theMapState,
    [name + 'MapDispatch']: theMapDispatch,
    [name + 'Reducer']: theReducer,
  };
}
