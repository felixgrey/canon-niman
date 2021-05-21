export default class SimpleFormModel {
  constructor(formData = {}, updateHandle = () => {}) {
    // 初始表单数据
    this.formData = formData;
    // 表单数据发生变化时，通知视图刷新的回调函数
    this.updateHandle = updateHandle;
  }

  //react和vue组件的onChange事件参数可能是值也可能是事件
  transformValue(value) {
    if (value !== null && typeof value === 'object') {
      const {
        target,
        preventDefault,
        stopPropagation
      } = value;

      // 通过三个属性判断是否是事件，如果是，取target.value值
      if (target && preventDefault && stopPropagation) {
        value = target.value;
      }
    }
    return value;
  }

  // 绑定给定的字段到表单输入组件
  withField(field) {
    return {
      value: formData[field],
      //input组件一般绑定到oninput事件上，保证每次输入都能响应变化
      onChange: (value) => {
        this.formData[field] = this.transformValue(value);
        this.updateHandle(formData);
      }
    }
  }
}
