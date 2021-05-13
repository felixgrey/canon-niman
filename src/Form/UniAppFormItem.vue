<template>
  <view v-if="!notRender" class="form-item-for-uni-app">
    <view :class="getLabelClass()">{{ label }}</view>
    <view class="form-item-inputer">
      <view v-if="inputType === 'input'">
        <uni-easyinput :type="subInputType" :value="value" :clearable="false"
          @input="onChange" @focus="onFocus" @blur="onBlur" :disabled="disabled" /></view>
      <view v-else-if="inputType === 'label'" class="form-item-value-label">
        <text>{{ value }}</text>
      </view>
      <view v-else-if="component">
        <component :is="component" :theExtend="theExtend" :value="value" @change="onChange" @focus="onFocus" @blur="onBlur" :disabled="disabled"></component>
      </view>
      <view class="form-item-error">{{ getError() }}</view>
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

    let { notExisted, label, inputType = 'Input', dataType = 'String', theExtend, required, formInstance, index } = info;

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

    /*
     * @property {String } 	type 							输入框的类型（默认text） password/text/textarea/..
     * 	@value text				文本输入键盘
     * 	@value textarea 	多行文本输入键盘
     * 	@value password 	密码输入键盘
     * 	@value number			数字输入键盘，注意iOS上app-vue弹出的数字键盘并非9宫格方式
     * 	@value idcard			身份证输入键盘，信、支付宝、百度、QQ小程序
     * 	@value digit			带小数点的数字键盘	，App的nvue页面、微信、支付宝、百度、头条、QQ小程序支持
     */
    const subInputTypeMap = {
      inputnumber: 'number', // 兼容antd风格
      textarea: 'textarea',
      password: 'password',
      number: 'number',
      idcard: 'idcard',
      digit: 'digit',
    };
    let subInputType = inputType === 'input' ? 'text' : null;
    if (subInputTypeMap.hasOwnProperty(inputType)) {
      subInputType = subInputTypeMap[inputType]
      inputType = 'input';
    }
    let component;
    if (!/^input$|^label$/g.test(inputType)) {
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
      subInputType: subInputType,
      required,
      notRender,
      label,
      inputType,
      dataType: dataType.toLowerCase(),
      theExtend,
      component
    };
  },
  methods: {
    getError() {
      const error = this.withField.info.error;
      return error.join(',');
    },
    getLabelClass() {
      const arr = ['form-item-label'];
      if (this.required) {
        arr.push('form-item-required');
      }
      return arr.join(' ');
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
  padding-bottom: 22px;

  .form-item-error {
    position: absolute;
    bottom: -22px;
    height: 22px;
    left: 0;
    line-height: 22px;
    color: #dd524d;
    font-size: 12px;
  }

  uni-input {
    height: 32px;
  }

  & > .form-item-label {
    line-height: 32px;
    width: 90px;
    flex-direction: row;

    &.form-item-required::after {
      content: '*';
      color: #dd524d;
      font-size: 14;
    }
  }

  & > .form-item-inputer {
    position: relative;
    line-height: 32px;
    flex-grow: 1;
  }
}
</style>
