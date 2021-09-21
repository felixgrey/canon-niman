const mixObject = {
  isBlank(value) {
    return value === undefined || value === null || `${value}`.trim() === '';
  },
  async asyncSetState(state) {
    return new Promise(resolve => {
      this.setState(state, resolve);
    })
  },
  async asyncForceUpdate(state) {
    return new Promise(resolve => {
      this.forceUpdate(resolve);
    })
  },
  bindField(field, name = 'form', onChange = Function.prototype) {
    this._getFieldsSet(name).add(field);
    return {
      value: this.state[field],
      onChange: async (value) => {
        if (value !== null && typeof value === 'object') {
          const {
            target,
            preventDefault,
            stopPropagation
          } = value;
          if (target && preventDefault && stopPropagation) {
            value = target.value;
          }
        }

        await this.asyncSetState({
          [field]: value,
        });

        onChange(value);
      }
    }
  },
  _getFieldsSet(name = 'form') {
    if (!this[name + '_fields_set']) {
      this[name + '_fields_set'] = new Set();
    }
    return this[name + '_fields_set'];
  },
  getFields(name = 'form') {
    return Array.from(this._getFieldsSet(name));
  },
  getFieldsData(name = 'form') {
    return this.getFields(name).reduce((data, field) => (data[field] = this.state[field], data), {});
  },
  async fetchIt(fun, data = {}, stateName = null, defaultValue = null, errorValue = null) {
    if (stateName) {
      await this.asyncSetState({
        [stateName + '_loading']: true,
      });
    }
    /**********根据实际情况修改****************/
    let hasError = false;
    let response = null;
    try {
      response = await fun(data);
    } catch (e) {
      hasError = true;
      console.error(e);
    }
    // 如果出现异常或逻辑异常
    if (hasError || !response || !response.data || response.data.code !== 1) {
      await this.asyncSetState({
        [stateName + '_loading']: false,
      });
      return errorValue;
    }
    /****************************************/
    const result = response.data.data ?? defaultValue;
    if (stateName) {
      await this.asyncSetState({
        [stateName]: result,
        [stateName + '_loading']: false,
      });
    }
    return result;
  }
}

function readOnlyProp(obj, name, value) {
  Object.defineProperty(obj, name, {
    value,
    writable: false
  });
}

export default function mixIt(view) {
  if (view._$mixed) {
    return view;
  }
  readOnlyProp(view, '_$mixed', true);

  const oldComponentDidMount = view.componentDidMount || Function.prototype;
  view.componentDidMount = function(...args) {
    oldComponentDidMount.bind(this)(...args);
    readOnlyProp(this, 'mounted', true);
  }

  const oldComponentWillUnmount = view.componentWillUnmount || Function.prototype;
  view.componentWillUnmount = function(...args) {
    oldComponentWillUnmount.bind(this)(...args);
    readOnlyProp(this, 'destroyed', true);
  }

  return Object.assign(view, mixObject);
}
