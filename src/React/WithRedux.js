import {
  connect
} from 'react-redux';
import {
  withRouter
} from "react-router-dom";

export default function createModel(config = {}) {
  const {
    nameSpace = '',
      defaultState = {},
      reducer = {},
      action = {},
  } = config;

  const $defaultState = JSON.parse(JSON.stringify(defaultState));
  const $nameSpace = nameSpace.replace(/^(\w)/, (a, b) => b.toLocaleUpperCase());
  const setStateAction = 'set' + $nameSpace + 'State';
  const resetStateAction = 'reset' + $nameSpace + 'State';

  function theReducer(state = defaultState, action) {
    if (reducer[action.type]) {
      const result = reducer[action.type](state, action);
      return {
        ...state,
        ...result,
      };
    }
    if (action.type === setStateAction) {
      return {
        ...state,
        ...action.data,
      };
    }
    if (action.type === resetStateAction) {
      return {
        ...$defaultState,
        ...action.data,
      };
    }
    return state;
  }

  function theMapState(state) {
    return {
      [nameSpace + 'State']: state[nameSpace],
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
      newAction[nameSpace + $key] = (...args) => {
        return action[key]({
          args,
          setState,
          dispatch
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

  theConnect.nameSpace = nameSpace;
  theMapState.nameSpace = nameSpace
  theMapDispatch.nameSpace = nameSpace;
  theReducer.nameSpace = nameSpace;

  return {
    [nameSpace + 'Connect']: theConnect,
    [nameSpace + 'MapState']: theMapState,
    [nameSpace + 'MapDispatch']: theMapDispatch,
    [nameSpace + 'Reducer']: theReducer,
  };
}
