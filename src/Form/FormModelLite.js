export default class FormModelLite {
  constructor(fields = [], ext = {}) {
    const {
      initFormData = {}
    } = ext;
    this.fields = fields;
    this.fieldsMap = fields.reduce((map, item) => (map[item.field] = item, map), {});
    this.formData = initFormData;
  }
  updateHandle = Function.prototype;
  bindView(view) {
    view && view.forceUpdate ? this.updateHandle = () => view.forceUpdate() :
      view && view.$forceUpdate ? this.updateHandle = () => view.$forceUpdate() :
      this.updateHandle = Function.prototype;
    return this;
  }
  transformGet(fieldInfo, value) {
    return value;
  }
  transformSet(fieldInfo, value) {
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
    return value;
  }
  setFieldsValue(obj = {}) {
    Object.assign(this.formData, obj);
    this.updateHandle(this.formData);
  }
  getFormData() {
    return {
      ...this.formData
    };
  }
  withField(field, ext = {}) {
    const fieldInfo = this.fieldsMap[field] || {};
    return {
      value: this.transformGet(fieldInfo, this.formData[field]),
      //原生input组件一般绑定到oninput事件上，保证每次输入都能响应变化，其余绑定到onchange上
      onChange: (...args) => {
        this.formData[field] = this.transformSet(this.fieldsMap[field] || {}, args[0]);
        this.updateHandle(this.formData);
        ext.onChange && ext.onChange(this.formData[field], this.formData, args);
      }
    }
  }
}
