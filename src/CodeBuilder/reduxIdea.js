/*#import#*/

let setModelState;
let modelName = ''; 
let initState = {};
let modelAction = {};
let modelReducer = {};

/************************************************/

/*@model@*/

/*eg:*/
// 自定义名字
modelName = 'name';

// 自定义状态
initState = {
  
};

// 自定义方法
modelAction = {
  
};

// 自定义reducer
modelReducer = {
  
}
/*:eg*/

/************************************************/

const reducer = (state = initState, action) => {
  if (action.type === `${modelName}.setState`) {
    return {
      ...state,
      ...action.data,
    }
  }
  return state;
}

const mappingDispatch = (dispatch) => {
  setModelState = (data, dispatch) => {
    dispatch({
      type: `${modelName}.setState`,
      data,
    })
  };
  
  const map = {};
  return map;
}

export {
  mappingDispatch,
  reducer,
}
 