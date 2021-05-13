const defaultConfig = {
  labelField: 'label',
  valueField: 'value',
  muti: false,
  frequency: 500,
};

class SearchModel {
  constructor(config = {}) {
    this.config = {
      ...defaultConfig,
      ...config,
    };

    this.startSelect([], [], this.config, true);
  }

  onInput(text) {
    clearTimeout(this.searchIndex);
    if (text.trim() === '') {
      return;
    }
    this.searchIndex = setTimeout(() => {
      this.onSearch(text);
    }, this.config.frequency);
  }

  onSelectChange() {};

  onSearch() {};
  onChange() {};

  setValue(value = []) {
    clearTimeout(this.searchIndex);
    value = [].concat(value);
    if (!this.config.muti) {
      this.value = [value[0]];
    } else {
      this.value = [...value];
    }
  }

  getValue() {
    if (!this.config.muti) {
      return this.value[0];
    }
    return [...this.value];
  }

  getItem() {
    const array = this.value.map(v => {
      return {
        ...this.decodeMap[v]
      };
    });
    if (!this.config.muti) {
      return array[0];
    }
    return array;
  }

  changeSelect(value) {
    if (!this.config.muti) {
      this.tempSelected = [value];
    } else {
      const index = this.tempSelected.indexOf(value);
      if (index === -1) {
        this.tempSelected.push(value);
      } else {
        this.tempSelected.splice(index, 1);
      }
    }
    this.onSelectChange();
  }

  getLabels(temp = true) {
    const array = temp ? this.tempSelected : this.value;
    return array.map(v => {
      const item = this.decodeMap[v];
      if (item === undefined) {
        return v;
      }
      return item[this.config.labelField];
    });
  }

  startSelect(value = [], data = [], config = {}, _isInit) {
    this.searchText = '';
    this.setValue(value);
    this.tempSelected = [...this.value];
    this.data = data;
    Object.assign(this.config, config);

    const {
      labelField,
      valueField,
    } = this.config;

    this.decodeMap = data.reduce((map, item) => {
      map[item[valueField]] = item;
      return map;
    }, {});

    !_isInit && this.onSelectChange();
  }

  selectDone() {
    this.setValue(this.tempSelected);
    this.onSelectChange();
    this.onChange(this.getValue());
  }
}

export default SearchModel;
