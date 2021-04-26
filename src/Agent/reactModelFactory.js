const modelMap = {};
const modelDestroyMap = {};
const hasProxyed = Symbol('hasProxyed');

function destroyModel(name) {
  modelDestroyMap[name] && modelDestroyMap[name](modelMap[name]);
  delete modelMap[name];
  delete modelDestroyMap[name];
}

function createModel(config = {}) {

  const {
    view, // React对象
    name, // 业务模型名称
    state = {}, // 初始状态
    methods = {}, // 业务方法
    autoDestroy = true,
    onDestroy = Function.prototype,
  } = config;

  if (name === undefined || name === null) {
    throw new Error('model must has name');
  }
  if (modelMap[name]) {
    throw new Error(`model ${name} has existed.`);
  }

  // 设置初始状态
  view.setState({
    ...state
  });

  if (autoDestroy && !view.componentWillUnmount[hasProxyed]) {
    const oldComponentWillUnmount = view.componentWillUnmount;
    view.componentWillUnmount = function(...args) {
      oldComponentWillUnmount && oldComponentWillUnmount.bind(this)(...args);
      destroyModel(name);
    }
    view.componentWillUnmount[hasProxyed] = true;
  }

  // 更新状态
  const setState = function(newState, callback) {
    // 同步模式
    if (callback) {
      return view.setState(newState, callback);
    }
    // 异步模式
    return new Promise((resolve) => {
      view.setState(newState, resolve);
    })
  }

  // 获得状态
  const getState = async function(newState) {
    return view.state;
  }

  const destroy = () => {
    destroyModel(name);
  }

  // 包含状态和业务方法的模型
  const model = {
    setState,
    getState,
    destroy,
  };

  // 注入自定义业务方法
  for (let key in methods) {
    model[key] = (...args) => {
      return methods[key].bind(model)(...args);
    }
  }

  // 注册并返回
  modelDestroyMap[name] = onDestroy;
  return modelMap[name] = model;
}

function getModel(name) {
  if (name === undefined || name === null) {
    throw new Error('model must has name');
  }
  if (!modelMap[name]) {
    throw new Error(`model ${name} not existed.`);
  }
  return modelMap[name];
}

export {
  createModel,
  getModel,
  destroyModel,
};
