let defaultConfig = {
  keyField = 'id',
  valueField = null,
  indexField = 'index',
  parentKeyField = 'parent',
  childrenField = 'children',
  rootField = 'root',
  leafField = 'leaf',
  emptyChildren = false,
};

function setDefaultConfig(config) {
  defaultConfig = config;
}

function _mixConfig(config = {}) {
  return {
    ...defaultConfig,
    ...config
  };
}

function _nvl(v) {
  return v === null || v === undefined;
}



function treeToRelationList(tree = {}, config) {
  const {
    keyField,
    parentKeyField,
    childrenField
  } = _mixConfig(config);
}

function listToDecodeMap(list = [], config) {
  const {
    keyField,
    valueField = null
  } = _mixConfig(config);
}

export {
  setDefaultConfig,
  relationListToTree,
  treeToRelationList,
  listToDecodeMap,
}
