import createFunction from '@/SaasPlatform/utils/WithRedux';
import fetchData from "@/SaasPlatform/utils/fetchData";

/*
  模拟数据
*/
// import mock1 from './mock1.js';

const {
  /*
    返回值命名规则 name + Connect，下同
    可以通过批量替换操作改名
  */
  xxxConnect,
  xxxMapState,
  xxxMapDispatch,
  xxxReducer,
} = createFunction({
  name: 'xxx', // 模块名
  defaultState: {}, // 初始状态
  action: { // 自定义action
    doSomething({update, args, state}) {
      console.log(args); // 所有参数
      console.log(state); // 当前状态
      update({}); // 更新状态
    }
  },
  reducer: {}, // 自定义reducer
});

/*
  需要在site-management/src/main/ui/src/store/reducer.js中注册reducer
*/

export {
  xxxConnect,
  xxxMapState,
  xxxMapDispatch,
  xxxReducer,
}
