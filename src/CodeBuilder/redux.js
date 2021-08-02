
const SET_TWO_ACTIVE_KEY = "index/SET_TWO_ACTIVE_KEY";
const SET_SHEZHI = "index/SET_SHEZHI";


const modelName ='quanxian';

const defaultStates = {
  twoActiveKey: "1",
  shezhi: true,
};

export function mapModelDispatch(dispatch) => {
  return {
    [modelName + '.' + 'setTwoActiveKey']: (data) => {
      return dispatch({
        type: SET_TWO_ACTIVE_KEY,
        data,
      });
    }
  }
}

const reducer  = (state = defaultStates, action) => {
  switch (action.type) {
    case constants.SET_TWO_ACTIVE_KEY: {
      return {
        ...state,
        twoActiveKey: action.data,
      };
    }
    case constants.SET_SHEZHI: {
      return {
        ...state,
        shezhi: !action.data,
      };
    }
    default:
      return state;
  }
};

