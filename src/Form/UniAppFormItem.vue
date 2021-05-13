<template>
  <view v-if="!notRender" class="form-item-for-uni-app">
    <view class="form-item-label">{{ label }}</view>
    <view class="form-item-inputer">
      <view v-if="inputType === 'input'"><input type="text" :value="value" @input="onChange" @focus="onFocus" @blur="onBlur" :disabled="disabled" /></view>
      <view v-else-if="inputType === 'inputnumber'"><input type="number" :value="value" @input="onChange" @focus="onFocus" @blur="onBlur" :disabled="disabled" /></view>
      <view v-else-if="inputType === 'label'" class="form-item-value-label">
        <text>{{ value }}</text>
      </view>
      <view v-else-if="component">
        <component :is="component" :theExtend="theExtend" type="text" :value="value" @change="onChange" @focus="onFocus" @blur="onBlur" :disabled="disabled"></component>
      </view>
    </view>
  </view>
</template>

<script>
import Vue from 'vue';
import FormModel from './FormModel.js';

const inputMap = {};

function isBlank(v) {
  return v === undefined || v === null || new String(v).trim() === '';
}

function createProps(theProps, exceptFields = []) {
  return Object.keys(theProps.theExtend)
    .filter(field => !exceptFields.includes(field))
    .reduce((newProps, field) => ((newProps[field] = theProps.theExtend[field]), newProps), {
      ...theProps.propsForBind,
      style: theProps.style,
      className: theProps.className
    });
}

// console.log(Vue.version)

class FormForUniApp extends FormModel {
  contextData = {};

  bindView(view) {
    this.onFormChange = () => {
      view.$forceUpdate();
    };

    return this;
  }

  isBlank(value, fieldInfo) {
    return super.isBlank(value, fieldInfo);
  }

  withField(...args) {
    const data = super.withField(...args);
    data.contextData = this.contextData;
    return data;
  }

  transformSet(fieldInfo, [value]) {
    //uniApp组件 onChange事件参数可能是值也可能是事件
    if (value !== null && typeof value === 'object') {
      const { target, preventDefault, stopPropagation } = value;

      // 通过三个属性判断是否是事件,如果是，取值
      if (target && preventDefault && stopPropagation) {
        value = target.value;
      }
    }

    return value;
  }
}

export { FormForUniApp };
const UniAppFormItem = {
  props: {
    withField: {
      type: Object,
      required: true
    }
  },
  data() {
    const { propsForBind, info, contextData } = this.withField;

    let { notExisted, label, inputType = 'Input', dataType = 'String', theExtend, required, formInstance, error, index } = info;

    inputType = inputType.toLowerCase();

    let notRender = false;
    if (notExisted) {
      inputType = '';
      notRender = true;
    }

    if (theExtend.noneIfBlank && isBlank(propsForBind.value)) {
      inputType = '';
      notRender = true;
    }

    if (theExtend.viewMode) {
      inputType = 'label';
    }

    let component;
    if (!/Input|InputNumber|Label/gi.test(inputType)) {
      component = inputMap[inputType];
    }
    if (theExtend.component) {
      component = theExtend.component;
    }
    if (component) {
      inputType = '';
    }

    return {
      ...propsForBind,
      notRender,
      label,
      inputType,
      dataType: dataType.toLowerCase(),
      hasError: error.length,
      errorMessage: error.join(','),
      theExtend,
      component
    };
  },
  methods: {
    renderComponent() {
      return this.component;
    }
  }
};

export default UniAppFormItem;

Vue.prototype.$$Form = FormForUniApp;
Vue.component('form-item', UniAppFormItem);
Vue.prototype.$$registerInput = function(name, component) {
  inputMap[name.toLocaleLowerCase()] = component;
};
</script>

<style lang="scss">
.form-item-for-uni-app {
  display: flex;
  height: 32px;
  padding: 2px;
  border-bottom: solid 1px $uni-border-color;
  flex-direction: row;

  uni-input {
    height: 32px;
  }

  & > .form-item-label {
    padding: 0 8px;
    line-height: 32px;
    width: 90px;
    flex-direction: row;

    &::after {
      content: ':';
    }
  }

  & > .form-item-inputer {
    flex-direction: row;
    line-height: 32px;
  }
}
</style>
