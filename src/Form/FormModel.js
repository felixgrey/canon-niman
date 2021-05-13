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
      initData = {},
        transformGet = this.transformGet,
        transformSet = this.transformSet,
        isBlank = this.isBlank,
        onFormChange = Function.prototype,
        blankErrInfo = '请输入{{label}}',
        disabled = false,
        keyField = 'id',
    } = config;
    this.config = config;
    this.transformGet = transformGet;
    this.transformSet = transformSet;
    this.isBlank = isBlank;
    this.onFormChange = onFormChange;
    this.blankErrInfo = blankErrInfo;
    this.keyField = keyField;
    this._initFormState();
    this.setFormFields(fields);
    this.setFormData(initData, true);
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
      return;
    }
    const record = this.formData[index];
    let state = this.recordsState.get(record);
    if (!state) {
      state = {
        fields: {},
        error: [],
        isSelected: false,
      };
      this.recordsState.set(record, state);
    }
    if (field !== undefined) {
      state.fields[field] = state.fields[field] || {
        isInit: true,
        isSelected: false,
        error: [],
      };
    }
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
    fieldState.error = [];
    this.onFormChange();
    if (required && this.isBlank(value, fieldInfo, index)) {
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
    return this._initRecordState(index, field).fields[field];
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
      dataType = 'String',
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
    const disabled = !!(this.formState.isDisabled || fieldInfo.disabled || theExtend.disabled);
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
          onChange(value, args);
        },
        onFocus: (...args) => {
          // 获得焦点的时候清除错误信息
          fieldState.error = [];
          // 设置当前数据
          this.formState.currentIndex = index;
          onFocus(...args);
          this.onFormChange();
        },
        onBlur: (...args) => {
          if (autoCheck) {
            onBlur(...args);
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
        required,
        dataType,
        inputType,
        theExtend,
        formInstance: this,
      }
    };
  }
  setFormData = (data = {}, _isInit = false) => {
    this.recordsState = new WeakMap();
    this._initFormState();
    this.formData = [].concat(data);
    (!_isInit) && this.onFormChange();
  }
  recordIndexList() {
    return this.formData.map((a, i) => i);
  }
  resetData = (indexList, fields) => {
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
        if (!fieldState) {
          continue;
        }
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
      return {
        ...this.formData[0]
      };
    }
    return [...this.formData];
  }
  _changeSelect(indexList = [], flag = true) {
    indexList = [].concat(indexList);
    for (let index of indexList) {
      this._initRecordState(index).isSelected = flag;
    }
    this.onFormChange();
  }
  _changeSelectByKey(keyList = [], flag) {
    const indexList = this.formData
      .map((record, index) => keyList.includes(record[this.keyField]) ? index : null)
      .filter(index => index !== null);
    this._changeSelect(indexList, flag);
  }
  selectRecordsByKey = (keyList) => {
    this._changeSelectByKey(keyList, true);
  }
  unselectRecordsByKey = (keyList) => {
    this._changeSelectByKey(keyList, false);
  }
  selectRecords = (indexList) => {
    this._changeSelect(indexList, true);
  }
  unselectRecords = (indexList = []) => {
    this._changeSelect(indexList, false);
  }
  selectAll = () => {
    this.selectRecords(this.recordIndexList());
  }
  selectNone = () => {
    this.unSelectRecords(this.recordIndexList());
  }
  insert(data = {}, index = this.formData.length) {
    if (!this.config.isList) {
      return;
    }
    this.formData.splice(index, 0, data);
    this.onFormChange();
  }
  remove(index = null) {
    if (!this.config.isList || index === null) {
      return;
    }
    this.formData.splice(index, 1);
    this.onFormChange();
  }
  _getAboutSelected(flag = true) {
    const indexList = [];
    const recordList = this.formData
      .filter((record, index) => {
        if (this._initRecordState(index).isSelected === flag) {
          indexList.push(index);
          return true;
        }
        return false;
      });
    return [indexList, recordList];
  }
  getSelected = (justIndex = false) => {
    const [indexList, recordList] = this._getAboutSelected(true);
    if (justIndex === true) {
      return indexList;
    }
    return recordList;
  }
  getUnselected = (justIndex = false) => {
    const [indexList, recordList] = this._getAboutSelected(false);
    if (justIndex === true) {
      return indexList;
    }
    return recordList;
  }
  getCurrent = (justIndex = false) => {
    const {
      currentIndex
    } = this.formState;

    if (justIndex) {
      return currentIndex;
    }
    return this.formData[currentIndex];
  }
  setFieldsValue = (record = {}, index = 0) => {
    if (!this.config.isList) {
      index = 0;
    }
    Object.keys(record).forEach((field, index) => {
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
}
FormModel.deleteNull = deleteNull;

// module.exports = FormModel;
export default FormModel;
