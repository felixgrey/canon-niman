const defaultConfig = {
  keyField: 'id', // 主键
  parentKeyField: 'parent', // 外键
  childrenField: 'children', // 子节点
  rootField: 'root', // 是否是根
  leafField: 'leaf', // 是否是叶子
  pathField: 'path', // 路径
  beforSet: a => a, // 格式化后存入数据前
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
    beforSet,
  } = config;

  const pathItem = Object.assign({}, item);

  delete pathItem[parentKeyField];
  delete pathItem[childrenField];

  const parentKey = (parentPath[parentPath.length - 1] || {
    [keyField]: null
  })[keyField];

  const path = parentPath.concat(pathItem);
  const keyValue = item[keyField];
  const children = parentMap[keyValue] || item[childrenField] || null;

  Object.assign(item, {
    [parentKeyField]: parentKey,
    [pathField]: path,
    [leafField]: !!children,
    [rootField]: _nvl(parentKey),
    [childrenField]: children,
  });

  item = beforSet(item);

  itemMap.set(item[keyField], item);

  if (item[childrenField]) {
    item[childrenField] = item[childrenField].map(item2 => {
      const item3 = Object.assign({}, item2);
      _traceNode(item3, config, parentMap, path, itemMap);
      return item3;
    });
  }

  return itemMap;
};

function _infoRelationList(list = [], config) {
  const {
    keyField,
    parentKeyField,
  } = (config = _mixConfig(config));

  const rootNodes = [];
  const parentMap = {};

  for (let item of list) {
    const parentKey = item[parentKeyField];
    const item2 = Object.assign({}, item);

    if (_nvl(parentKey)) {
      rootNodes.push(item2);
    } else {
      (parentMap[parentKey] = parentMap[parentKey] || []).push(item2);
    }
  }

  return rootNodes.map(item => {
    return [item[keyField], _traceNode(item, config, parentMap)];
  });
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
  }
}

function fromTree(tree = {}, config) {
  config = _mixConfig(config);
  if (Array.isArray(tree)) {
    const newMap = new Map;
    const newList = [];
    const newTree = [];
    tree.forEach($tree => {
      const {
        map,
        list,
        tree
      } = fromTree($tree);
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
    }
  }

  const map = _traceNode(Object.assign({}, tree), config);
  const list = Array.from(map.values());
  const newTree = map.get(tree[config.keyField]);

  return {
    map,
    list,
    tree: newTree,
  }
}

// export {
//   fromList,
//   fromTree,
// }

exports.fromList = fromList;
exports.fromTree = fromTree;
