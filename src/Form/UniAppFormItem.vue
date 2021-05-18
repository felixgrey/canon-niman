<template>
  <view v-if="!notRender" :class="getFormClass()">
    <view :class="getLabelClass()" :style="getLabelStyle()">{{ label }}</view>
    <view class="form-item-inputer" :style="getInputStyle()">
      <view v-if="inputType === 'input'">
        <uni-easyinput :type="subInputType" :value="theValue" :clearable="false" @input="onChange" @focus="onFocus" @blur="onBlur" :disabled="theDisabled" />
      </view>
      <view v-else-if="inputType === 'label'" class="form-item-value-label">
        <text>{{ renderLabelInput(theValue) }}</text>
      </view>
      <view v-else-if="component">
        <component
          :is="component"
          :dataType="dataType"
          :theExtend="theExtend"
          :value="theValue"
          @change="onChange"
          @focus="onFocus"
          @blur="onBlur"
          :disabled="theDisabled"
        ></component>
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
  bindView(view) {
    this.onFormChange = () => {
      view.$forceUpdate();
    };
    return this;
  }

  isBlank(value, fieldInfo) {
    return super.isBlank(value, fieldInfo);
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
    },
    labelWidth: {
      type: [String, Number],
      default: null
    },
    inputWidth: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    this.contextData = {};
    this.initFormItem();
    return {};
  },
  beforeUpdate() {
    this.initFormItem();
  },
  computed: {
    notRender() {
      const { propsForBind, info } = this.withField;
      if (info.notExisted || info.theExtend.hidden || (info.theExtend.noneIfBlank && isBlank(propsForBind.value))) {
        return true;
      }
      return false;
    },
    theValue() {
      return this.withField.propsForBind.value;
    },
    theDisabled() {
      return this.withField.propsForBind.disabled;
    }
  },
  methods: {
    renderLabelInput(value) {
      if (!this.contextData || !this.withField) {
        return value;
      }

      const {
        theExtend: { data = null, labelField = 'label', valueField = 'value', format },
        field
      } = this.withField.info;

      if (typeof format === 'function') {
        return format(value, this.withField.info);
      }

      // 只有单选有能自动解码
      if (!data || !Array.isArray(data) || Array.isArray(value)) {
        return value;
      }

      const fieldContext = (this.contextData[field] = this.contextData[field] || {});
      let { sourceData, decodeMap } = fieldContext;

      if (sourceData !== data) {
        fieldContext.sourceData = data;
        decodeMap = fieldContext.decodeMap = {};
        for (let item of data) {
          decodeMap[item[valueField]] = item[labelField];
        }
      }

      if (decodeMap.hasOwnProperty(value)) {
        return decodeMap[value];
      }
      return value;
    },
    initFormItem() {
      const { propsForBind, info, contextData } = this.withField;

      let { label, inputType = 'Input', dataType = 'String', theExtend, required, formInstance, index } = info;
      inputType = inputType.toLowerCase();

      const { noneIfBlank, simple } = theExtend;
      const formExtend = formInstance.config;
      const theLabelWidth = this.labelWidth || theExtend.labelWidth || formExtend.labelWidth || null;
      const theInputWidth = this.inputWidth || theExtend.inputWidth || formExtend.inputWidth || null;
      const viewMode = formExtend.viewMode || theExtend.viewMode || formExtend.viewMode || false;

      if (viewMode) {
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
        digit: 'digit'
      };
      let subInputType = inputType === 'input' ? 'text' : null;
      if (subInputTypeMap.hasOwnProperty(inputType)) {
        subInputType = subInputTypeMap[inputType];
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

      const mergeData = {
        ...propsForBind,
        subInputType: subInputType,
        theLabelWidth,
        theInputWidth,
        viewMode,
        simple,
        required,
        label,
        inputType,
        dataType: dataType.toLowerCase(),
        theExtend,
        component
      };
      Object.assign(this, mergeData);
    },
    getLabelStyle() {
      const style = {};
      if (typeof this.theLabelWidth === 'number') {
        style.width = this.theLabelWidth + 'px';
      }
      if (typeof this.theLabelWidth === 'string') {
        style.width = this.theLabelWidth;
      }
      return style;
    },
    getInputStyle() {
      const style = {};
      if (typeof this.theInputWidth === 'number') {
        style.width = this.theInputWidth + 'px';
      }
      if (typeof this.theInputWidth === 'string') {
        style.width = this.theInputWidth;
      }
      return style;
    },
    getError() {
      const error = this.withField.info.error;
      return error.join(',');
    },
    getFormClass() {
      const arr = ['form-item-for-uni-app'];
      if (this.viewMode) {
        arr.push('form-item-view');
      }

      if (this.simple) {
        arr.push('simple-view');
      }

      return arr.join(' ');
    },
    getLabelClass() {
      const arr = ['form-item-label'];
      if (this.withField.info.required) {
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

  &.form-item-view {
    border-bottom: 1px solid #c8c7cc;
    padding-bottom: 4px;

    &.simple-view {
      border-bottom: none;
    }

    & > .form-item-label {
      text-align: right;
      padding-right: 10px;

      &::after {
        content: ':';
        margin-left: 4px;
      }
    }
  }

  .form-item-label,
  .form-item-value-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

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
