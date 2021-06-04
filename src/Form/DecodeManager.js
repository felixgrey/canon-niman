function listToMap(decodeList, decodeMap = {}) {
  return decodeList.reduce((map, item) => {
    map[item.value] = map[item.label];
    map[item.label] = map[item.value];
    return map;
  }, decodeMap);
}

export default class DecodeManager {
  constructor() {
    this.decodeList = {};
    this.decodeMap = {};
  }

  onGetDecodeList(name, value, list) {
    throw new Error('must override Decoder.onGetDecodeList .');
  }

  getDecodeList = (name, merge = false) => {
    let list = this.decodeList[name] || [];
    if (Array.isArray(this.decodeList[name]) && !merge) {
      return list;
    }

    let result = this.onGetDecodeList(name, merge, list);

    const operateResult = (result) => {
      if (!Array.isArray(result)) {
        return list;
      }

      const temp = new Map();
      list.concat(result).forEach(item => {
        if (!temp.has(item.value)) {
          temp.set(item.value, item);
        }
      });
      list = Array.from(temp.values());

      return this.decodeList[name] = list;
    }

    if (result instanceof Promise) {
      return result.then(operateResult);
    }
    return operateResult(result);
  }

  decode = (name, value, query = true) => {
    const getValue = value === undefined ?
      () => this.decodeMap[name] :
      () => this.decodeMap[name][value];

    if (this.decodeMap[name]) {
      if (value === undefined || !query) {
        return getValue();
      }
      if (value !== undefined && this.decodeMap[name].hasOwnProperty(value)) {
        return getValue();
      }
    }

    const list = this.getDecodeList(name, query);

    if (list instanceof Promise) {
      return list.then(list => {
        this.decodeMap[name] = listToMap(list);
        return getValue();
      });
    }

    this.decodeMap[name] = listToMap(list);
    return getValue();
  }
}
