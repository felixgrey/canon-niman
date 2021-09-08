const mixPrototype = {
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
  bindField(field, name = 'form') {
    this._getFieldsSet(name).add(field);
    return {
      value: this.state[field],
      onChange: (value) => {
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

        this.setState({
          [field]: value,
        });
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
  }
}

export default function mixIt(view) {
  if (typeof view === 'function') {
    Object.assign(view.prototype, mixPrototype);
  } else {
    Object.assign(view, mixPrototype);
  }
}
