function checkType(dataType) {
  const result = {
    dataType: 'string',
    isArray: false,
  };
  result.dataType = dataType.trim().toLowerCase();
  if (/\[\]$/.test(dataType)) {
    result.isArray = true;
  }
  result.dataType = result.dataType.replace('[]', '');
  return result;
}

function isDiff(a, b) {
  if (Number.isNaN(a) || Number.isNaN(b)) {
    return !(Number.isNaN(a) && Number.isNaN(b));
  }
  return a !== b;
}

function deleteValue(data, value) {
  Object.keys(data).forEach(key => {
    if (data[key] === value) {
      Reflect.deleteProperty(data, key);
    }
  });
}

function deleteNull(data) {
  deleteValue(data, null);
}

class FormModel {
  constructor(fields = [], config = {}) {
    const {
      initFormData,
      initData = {}, // 过时属性，用initFormData替代
      transformGet = this.transformGet,
      transformSet = this.transformSet,
      isBlank = this.isBlank,
      onFormChange = Function.prototype,
      blankErrInfo = '请输入{{label}}',
      disabled = false,
      keyField = 'id',
    } = config;
    config.extend = config.extend || {};
    this.config = config;
    this.transformGet = transformGet;
    this.transformSet = transformSet;
    this.isBlank = isBlank;
    this.onFormChange = onFormChange;
    this.blankErrInfo = blankErrInfo;
    this.keyField = keyField;
    this._initFormState();
    this.setFormFields(fields);
    this.setFormData(initFormData || initData, true);
    this.setDisabled(disabled, true);
  }
  recordsState = new WeakMap();
  setFormFields = (fields = [], _isInit = false) => {
    this.fields = fields;
    this.fieldMap = {};
    this.fieldNames = [];
    this.formState.renderedFelids = new Set();
    for (let item of fields) {
      const field = item.field;
      if (this.isBlank(field, {
          createForm: true
        })) {
        throw new Error('must has "field" property');
      }
      this.fieldMap[field] = item;
      this.fieldNames.push(field);
    }
    (!_isInit) && this.onFormChange();
  }
  _initFormState() {
    this.formState = {
      currentIndex: 0,
      isDisabled: false,
      renderedFelids: new Set(),
    };
  }
  setDisabled = (flag = true, _isInit) => {
    if (this.formState.isDisabled === flag) {
      return;
    }
    this.formState.isDisabled = flag;
    (!_isInit) && this.onFormChange();
  }
  isDisabled = () => this.formState.isDisabled;
  transformGet(fieldInfo, value) {
    return value;
  }
  transformSet(fieldInfo, args) {
    return args[0];
  }
  startRender = () => {
    this.formState.renderedFelids = new Set();
    if (!this.config.isList) {
      return [...this.fieldNames];
    }
    return this.recordIndexList().map(i => {
      return this.fieldNames.map((field, j) => [field, i, j === 0]);
    }).flat(1);
  }
  isBlank(value, fieldInfo) {
    return value === undefined || value === null || new String(value).trim() === '';
  }
  _renderBlankTemplate(field, label, index) {
    if (typeof this.blankErrInfo === 'function') {
      return this.blankErrInfo(field, label, index);
    }
    return this.blankErrInfo
      .replace(/\{\{field\}\}/g, field)
      .replace(/\{\{label\}\}/g, label);
  }
  _initRecordState(index, field) {
    if (index < 0 || index >= this.formData.length || !this.fieldMap[field]) {
      console.error(`error index or field, index=${index},field=${field}`);
      return {
        fields: [],
      };
    }
    const record = this.formData[index];
    let state = this.recordsState.get(record);
    if (!state) {
      state = {
        fields: {},
        error: [],
      };
      this.recordsState.set(record, state);
    }
    if (field !== undefined) {
      state.fields[field] = state.fields[field] || {
        isInit: true,
        error: [],
      };
    }
    return state;
  }
  _changeValue(index, field, value, isInit = false) {
    const fieldState = this._getFieldState(index, field);
    const record = this.formData[index];
    if (!record) {
      return;
    }
    if (isDiff([value], record[field])) {
      if (!fieldState.hasOwnProperty('originValue')) {
        fieldState.originValue = record[field];
      }
      fieldState.isInit = isInit || false;
      fieldState.error = [];
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
    fieldState.error = [];
    this.onFormChange();
    const theRequired = (typeof required === 'function') ?
      required(value, record, index, this.formData) : required;
    if (theRequired && this.isBlank(value, fieldInfo, index)) {
      fieldState.error.push(this._renderBlankTemplate(field, label, index));
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
    return this._initRecordState(index, field).fields[field] || {};
  }
  withField = (fieldName, renderExtend = {}, index = 0) => {
    if (typeof renderExtend === 'number') {
      index = renderExtend;
      renderExtend = {};
    }
    if (!this.config.isList) {
      index = 0;
    }
    const fieldInfo = this.fieldMap[fieldName];
    const record = this.formData[index];

    if (!fieldInfo || !record) {
      return {
        propsForBind: {
          disabled: true,
          value: undefined,
          onChange: Function.prototype,
          onFocus: Function.prototype,
          onBlur: Function.prototype,
        },
        info: {
          field: fieldName,
          notExisted: true,
          error: [],
          theExtend: {},
          formInstance: this,
        }
      };
    }
    this.formState.renderedFelids.add(fieldInfo);
    const {
      field,
      label = '',
      initValue,
      defaultValue,
      dataType = 'string',
      valueType = dataType,
      inputType = 'Input',
      required = false,
      autoCheck = false,
      rule = Function.prototype,
    } = fieldInfo;
    const fieldState = this._getFieldState(index, field);
    let value = this.transformGet(fieldInfo, record[field]);
    if (value === undefined && defaultValue !== undefined) {
      value = this.transformSet(fieldInfo, [defaultValue, {
        defaultValue: true
      }]);
      this._changeValue(index, field, value, true);
    }
    if (initValue !== undefined && fieldState.isInit) {
      value = this.transformSet(fieldInfo, [initValue, {
        initValue: true
      }]);
      this._changeValue(index, field, value, true);
    }
    const theExtend = {
      ...this.config.extend,
      ...fieldInfo.extend,
      ...renderExtend,
    };
    const {
      onChange = renderExtend.onChange || Function.prototype,
        onFocus = renderExtend.onFocus || Function.prototype,
        onBlur = renderExtend.onBlur || Function.prototype,
    } = fieldInfo;
    const theRequired = (typeof required === 'function') ?
      required(value, record, index, this.formData) : required;
    const fieldDisabled = (typeof fieldInfo.disabled === 'function') ?
      fieldInfo.disabled(value, record, index, this.formData) : fieldInfo.disabled;
    const disabled = this.formState.isDisabled || fieldDisabled;

    const checkedDataType = checkType(dataType);

    return {
      propsForBind: {
        disabled,
        value,
        onChange: (...args) => {
          if (this.formState.isDisabled) {
            return;
          }
          const value = this.transformSet(fieldInfo, args);
          this._changeValue(index, field, value);
          onChange(value, index, args);
        },
        onFocus: (...args) => {
          // 获得焦点的时候清除错误信息
          fieldState.error = [];
          // 设置当前数据
          this.formState.currentIndex = index;
          onFocus(index, args);
          this.onFormChange();
        },
        onBlur: (...args) => {
          if (autoCheck) {
            onBlur(index, args);
            this._checkField(field, index);
          }
        }
      },
      info: {
        label,
        field,
        index,
        isInit: fieldState.isInit,
        error: fieldState.error,
        required: theRequired,
        dataType: checkedDataType.dataType,
        valueIsArray: checkedDataType.isArray,
        inputType,
        theExtend,
        formInstance: this,
      }
    };
  }
  setFormData = (data = {}, _isInit = false) => {
    this.recordsState = new WeakMap();
    this._initFormState();
    this.formData = [].concat(data).map(item => Object.assign({}, item));
    (!_isInit) && this.onFormChange();
  }
  recordIndexList() {
    return this.formData.map((a, i) => i);
  }
  resetData = (...args) => {
    console.error('resetData has deprecated , plase use resetFormData instead of resetData');
    return this.resetFormData(...args)
  }
  resetFormData = (indexList, fields) => {
    if (!Array.isArray(indexList)) {
      indexList = this.recordIndexList();
    }
    indexList = [].concat(indexList);

    if (!Array.isArray(fields)) {
      fields = this.fields.map(item => item.field);
    }
    fields = [].concat(fields);
    for (let index of indexList) {
      const record = this.formData[index];
      if (!record) {
        continue;
      }
      for (let field of fields) {
        const fieldInfo = this.fieldMap[field];
        if (!fieldInfo) {
          continue;
        }
        const fieldState = this._getFieldState(index, field);
        if (fieldState.hasOwnProperty('originValue')) {
          const originValue = fieldState.originValue;
          Reflect.deleteProperty(fieldState, 'originValue');
          fieldState.isInit = true;
          record[field] = originValue;
          deleteValue(record);
        }
      }
    }
    this.onFormChange();
  }
  checkFormData = async (allFields = false) => {
    let pass = true;
    const fields = allFields ? this.fields : this.getRenderedFields();
    const count = this.formData.length;
    for (let index = 0; index < count; index++) {
      for (let fieldInfo of fields) {
        pass = await this._checkField(fieldInfo.field, index) && pass;
      }
    }
    return pass;
  }
  getRenderedFields = () => {
    return Array.from(this.formState.renderedFelids);
  }
  getFormData = () => {
    if (!this.config.isList) {
      return this.formData[0];
    }
    return this.formData;
  }
  _isNew(record) {
    return (this.recordsState.get(record) || {}).isNew;
  }
  checkChange = (record = this.formData[0], _index) => {
    if (_index === undefined) {
      _index = this.formData.indexOf(record);
    }
    if (_index === -1) {
      return false
    }
    if (this._isNew(record)) {
      return true;
    }
    for (let item of this.fields) {
      const fieldState = this._getFieldState(index, item.field);
      if (fieldState.hasOwnProperty('originValue')) {
        return true;
      }
    }
    return false;
  }
  getChangedData = (includeNew = true) => {
    let changedData = this.formData.filter(this.checkChange);
    if (!includeNew) {
      changedData = changedData.filter(record => !this._isNew(record));
    }
    if (!this.config.isList) {
      return changedData[0] || null;
    }
    return changedData;
  }
  insert(data = {}, index = this.formData.length) {
    if (!this.config.isList) {
      return;
    }
    this.formData.splice(index, 0, data);
    this._initRecordState(index).isNew = true;
    this.onFormChange();
  }
  remove(index = null) {
    if (!this.config.isList || index === null) {
      return;
    }
    this.formData.splice(index, 1);
    this.onFormChange();
  }
  getCurrent = () => {
    return this.formData[this.formState.currentIndex];
  }
  setFieldsValue = (record = {}, index = 0) => {
    if (!this.config.isList) {
      index = 0;
    }
    Object.keys(record).forEach(field => {
      this._changeValue(index, field, record[field]);
    });
  }
  updateFields(newFields = []) {
    const fields = [...this.fields];
    [].concat(newFields).forEach(newFieldInfo => {
      const {
        field
      } = newFieldInfo;
      const fieldInfo = this.fieldMap[field];
      if (fieldInfo) {
        Object.assign(fieldInfo, newFieldInfo);
      } else {
        throw new Error(`field ${field} not exist.`);
      }
    });
    this.onFormChange();
  }
  updateExtend(extend = {}) {
    Object.assign(this.config.extend, extend);
    this.onFormChange();
  }
  clearError(field, index = 0) {
    const recordState = this._initRecordState(index, field);
    recordState && (recordState.fields[field].error = []) && this.onFormChange();
  }
}
FormModel.deleteNull = deleteNull;

// module.exports = FormModel;
export default FormModel;
