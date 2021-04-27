function isDiff(a, b) {
  if (Number.isNaN(a) || Number.isNaN(b)) {
    return !(Number.isNaN(a) && Number.isNaN(b));
  }
  return a !== b;
}

class FormModel {
  constructor(fields = [], config = {}) {
    this.fields = fields;
    this.config = config;

    const {
      initData = {},
        transformGet = this.transformGet,
        transformSet = this.transformSet,
        onFormChange = this.onFormChange,
        isBlank = this.isBlank,
        blankErrInfo = '{{label}}不能为空',
    } = config;

    this.transformGet = transformGet;
    this.transformSet = transformSet;
    this.onFormChange = onFormChange;
    this.isBlank = isBlank;
    this.blankErrInfo = blankErrInfo;

    for (let item of fields) {
      const field = item.field;
      if (this.isBlank(field, {
          createForm: true
        })) {
        throw new Error('must has "field" property');
      }
      this.fieldMap[field] = item;
      this.fieldNames[field];
    }

    this.setFormData(initData, true);
  }

  fields = [];
  fieldMap = {};
  fieldNames = [];

  formData = [{}];
  recordsState = {};

  _initFormState() {
    this.formState = {
      currentIndex: 0,
      selected: new Set(),
      renderedFelids: new Set(),
    };
  }

  transformGet(fieldInfo, value) {
    return value;
  }

  transformSet(fieldInfo, args) {
    return args[0];
  }

  onFormChange() {}

  startRender() {
    this.formState.renderedFelids = new Set();
    return [...this.fieldNames];
  }

  isBlank(value, fieldInfo) {
    return value === undefined || value === null || new String(value).trim() === '';
  }

  _renderBlankTemplate(field, label) {
    return this.blankErrInfo
      .replace(/\{\{field\}\}/g, field)
      .replace(/\{\{label\}\}/g, label);
  }

  _initState(index, field) {
    if (index < 0 || index >= this.formData.length || !this.fieldMap[field]) {
      return;
    }
    const state = this.recordsState[index] = this.recordsState[index] || {
      fields: {},
      error: []
    };

    state.fields[field] = state.fields[field] || {
      isInit: true,
      error: [],
    };

    return state;
  }

  _changeValue(index, field, value, isInit = false) {
    const fieldState = this._getFieldState(index, field);
    if (!fieldState) {
      return;
    }
    const record = this.formData[index];
    if (isDiff([value], record[field])) {
      if (!fieldState.hasOwnProperty('originValue')) {
        fieldState.originValue = record[field];
      }
      fieldState.isInit = isInit || false;
      record[field] = value;
      this.onFormChange();
    }
  }

  async _checkField(field, index) {
    let pass = true;

    const fieldInfo = this.fieldMap[field];
    const record = this.formData[index];
    const fieldState = this._getFieldState(index, field);
    const value = record[field];
    const {
      required = false,
        rule = Function.prototype,
        label,
    } = fieldInfo;

    fieldState.checking = true;
    this.onFormChange();

    if (required && this.isBlank(value, fieldInfo)) {
      fieldState.error.push(this._renderBlankTemplate(field, label));
      pass = false;
    }

    const result = await rule(value, record, index, this.formData);
    if (typeof result === 'string') {
      fieldState.error.push(result);
      pass = false;
    }

    fieldState.checking = false;
    this.onFormChange();

    return pass;
  }

  _getFieldState(index, field) {
    return this._initState(index, field)?.fields[field];
  }

  withField(fieldName, renderExtend = {}, index = 0) {
    if (!this.config.isList) {
      index = 0;
    }

    const fieldInfo = this.fieldMap[fieldName];
    const record = this.formData[index];

    if (!fieldInfo || !record) {
      return {
        props: {
          value: undefined,
          onChange: Function.prototype,
          onFocus: Function.prototype,
        },
        info: {
          field: fieldName,
          notExisted: true,
        }
      };
    }

    this.formState.renderedFelids.add(fieldInfo);

    const {
      field,
      label = '',
      initValue,
      dataType = 'string',
      inputType = 'input',
      required = false,
      autoCheck = false,
      rule = Function.prototype,
      onChange = Function.prototype,
      onFocus = Function.prototype,
    } = fieldInfo;

    const fieldState = this._getFieldState(index, field);
    let value = this.transformGet(fieldInfo, record[field]);
    if (value === undefined && fieldState.isInit) {
      value = this.transformSet(fieldInfo, [initValue, {
        initValue: true
      }]);
      this._changeValue(index, field, value, true);
    }

    return {
      props: {
        value,
        onChange: (...args) => {
          const value = this.transformSet(fieldInfo, args);
          this._changeValue(index, field, value);
          onChange(value, args);
          if (autoCheck) {
            this._checkField(field, index);
          }
        },
        onFocus: (...args) => {
          // 获得焦点的时候清除错误信息
          fieldState.error = [];
          // 设置当前数据
          this.formState.currentIndex = index;
          onFocus(...args);
          this.onFormChange();
        }
      },
      info: {
        label,
        field,
        isInit: fieldState.isInit,
        error: fieldState.error,
        required,
        dataType,
        inputType,
        formExtend: this.config.extend || {},
        fieldExtend: fieldInfo.extend || {},
        renderExtend,
        formInstance: this,
      }
    };
  }

  setFormData(data = {}, _isInit = false) {
    this.recordsState = {};
    this._initFormState();
    this.formData = [].concat(data);
    (!_isInit) && this.onFormChange();
  }

  _indexList() {
    return this.formData.map((a, i) => i);
  }

  resetData(indexList = true, fields = true) {
    if (indexList === true) {
      indexList = this._indexList();
    }
    indexList = [].concat(indexList);

    if (fields === true) {
      fields = this.fields.map(item => item.field);
    }
    fields = [].concat(fields);

    for (let index of indexList) {
      const record = this.formData[record];
      if (!record) {
        continue;
      }
      for (let field of fields) {
        const fieldInfo = this.fieldMap[field];
        if (!record) {
          continue;
        }
        const fieldState = this._getFieldState(index, field);
        if (!fieldState) {
          continue;
        }
        if (fieldState.hasOwnProperty('originValue')) {
          const originValue = fieldState.originValue;
          delete fieldState.originValue;
          fieldState.isInit = true;
          record[field] = originValue;
        }
      }
    }
    this.onFormChange();
  }

  async checkFormData(allFields = false) {
    let pass = true;
    const fields = allFields ? this.fields : this.getRenderedFields();
    const count = this.formData.length;
    for (let index = 0; index < count; index++) {
      for (let fieldInfo of fields) {
        pass = pass && await this._checkField(fieldInfo.field, index);
      }
    }

    return pass;
  }

  getRenderedFields() {
    return Array.from(this.formState.renderedFelids);
  }

  getFormData() {
    if (!this.config.isList) {
      return this.formData[0];
    }
    return this.formData;
  }

  selectRecords(indexList = []) {
    this.formState.selected = new Set([
      ...(Array.from(this.formState.selected)),
      ...([].concat(indexList))
    ]);
    this.onFormChange();
  }

  unSelectRecords(indexList = []) {
    [].concat(indexList).forEach(index => this.formState.selected.delete(index));
    this.onFormChange();
  }

  selectAll() {
    this.selectRecords(this._indexList());
  }

  selectNone() {
    this.unSelectRecords(this._indexList());
  }

  getCurrent(record = false) {
    if (record) {
      return this.formData[this.formState.currentIndex];
    }
    return this.formState.currentIndex;
  }

  setFieldsValue(record = {}, index = 0) {
    if (!this.config.isList) {
      index = 0;
    }
    Object.keys(record).forEach((field, index) => {
      this._changeValue(index, field, record[field]);
    });
  }
}

module.exports = FormModel;
// export default FormModel;
