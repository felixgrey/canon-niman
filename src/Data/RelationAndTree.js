const defaultConfig = {
  keyField: 'id', // 主键
  parentKeyField: 'parent', // 外键
  childrenField: 'children', // 子节点
  rootField: 'root', // 是否是根
  leafField: 'leaf', // 是否是叶子
  pathField: 'path', // 路径
  rootParentKey: null, // 根节点的父ID值
  beforeSet: a => a, // 格式化后存入数据前
};

function _mixConfig(config = {}) {
  return {
    ...defaultConfig,
    ...config,
  };
}

function _nvl(v) {
  return v === null || v === undefined;
}

function _traceNode(item, config, parentMap = {}, parentPath = [], itemMap = new Map()) {
  const {
    keyField,
    parentKeyField,
    childrenField,
    pathField,
    leafField,
    rootField,
    beforeSet,
    rootParentKey,
  } = config;

  item = Object.assign({}, item);
  const pathItem = Object.assign({}, item);

  delete pathItem[parentKeyField];
  delete pathItem[childrenField];

  const parentKey = (parentPath[parentPath.length - 1] || {
    [keyField]: rootParentKey,
  })[keyField];

  const path = parentPath.concat(pathItem);

  Object.assign(item, {
    [parentKeyField]: parentKey,
    [pathField]: path,
    [rootField]: _nvl(parentKey) || parentKey === rootParentKey,
  });

  beforeSet(item);

  const keyValue = item[keyField];
  const children = parentMap[keyValue] || item[childrenField] || null;
  item[childrenField] = children;
  item[leafField] = !children;

  itemMap.set(keyValue, item);

  if (item[childrenField]) {
    item[childrenField] = item[childrenField].map(item2 => {
      const [, newItem2] = _traceNode(item2, config, parentMap, path, itemMap);
      return newItem2;
    });
  }

  return [itemMap, item];
};

function _infoRelationList(list = [], config) {
  const {
    keyField,
    parentKeyField,
    rootParentKey,
  } = (config = _mixConfig(config));

  const rootNodes = [];
  const parentMap = {};

  for (let item of list) {
    const parentKey = item[parentKeyField];

    if (_nvl(parentKey) || parentKey === rootParentKey) {
      rootNodes.push(item);
    } else {
      (parentMap[parentKey] = parentMap[parentKey] || []).push(item);
    }
  }

  return rootNodes.map(item => {
    return [item[keyField], _traceNode(item, config, parentMap)[0]];
  });
}

function mapToObj(map) {
  const obj = {};
  for (let [key, value] of map) {
    obj[key] = value;
  }
  return obj;
}

function fromList(list = [], config) {
  config = _mixConfig(config);
  const newMap = new Map();
  const newList = [];
  const tree = _infoRelationList(list, config).map(([keyValue, map]) => {
    for (let key of map.keys()) {
      newMap.set(key, map.get(key));
      newList.push(map.get(key));
    }
    return map.get(keyValue);
  });

  return {
    map: newMap,
    list: newList,
    tree,
    object: mapToObj(newMap),
  }
}

function fromTree(tree = {}, config) {
  config = _mixConfig(config);
  if (Array.isArray(tree)) {
    const newMap = new Map();
    const newList = [];
    const newTree = [];
    tree.forEach($tree => {
      const {
        map,
        list,
        tree
      } = fromTree($tree, config);
      for (let [key, value] of map) {
        newMap.set(key, value);
      }
      newList.push(list);
      newTree.push(tree);
    });

    return {
      map: newMap,
      list: newList.flat(),
      tree: newTree,
      object: mapToObj(newMap),
    }
  }

  const map = _traceNode(tree, config)[0];
  const list = Array.from(map.values());
  const newTree = map.get(tree[config.keyField]);

  return {
    map,
    list,
    tree: newTree,
    object: mapToObj(map),
  }
}

// export {
//   fromList,
//   fromTree,
// }

exports.fromList = fromList;
exports.fromTree = fromTree;
