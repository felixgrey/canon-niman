<template>
  <view class="form-item-for-uni-app">
    <view class="form-item-label">{{ label }}</view>
    <view class="form-item-inputer">
      <view v-if="inputType === 'input'"><input type="text" :value="value" @input="onChange" @focus="onFocus" @blur="onBlur" /></view>
      <view v-if="inputType === 'inputnumber'"><input type="number" :value="value" @input="onChange" @focus="onFocus" @blur="onBlur" /></view>
    </view>
  </view>
</template>

<script>
import Vue from 'vue';
import FormModel from './FormModel.js';

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

  updateFields(newFields = []) {
    const fields = [...this.fields];

    [].concat(newFields).forEach(newFieldInfo => {
      const { field } = newFieldInfo;

      const fieldInfo = this.fieldMap[field];

      if (fieldInfo) {
        Object.assign(fieldInfo, newFieldInfo);
      } else {
        throw new Error(`field ${field} not exist.`);
      }
    });

    this.onFormChange();
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

export default {
  props: {
    withField: {
      type: Object,
      required: true
    }
  },
  data() {
    const { propsForBind, info, contextData } = this.withField;

    let { notExisted, label, inputType = 'Input', dataType = 'String', theExtend, required, formInstance, error, index } = info;

    if (notExisted) {
      inputType = '';
    }

    if (theExtend.noneIfBlank && isBlank(propsForBind.value)) {
      inputType = '';
    }

    return {
      ...propsForBind,
      label,
      inputType: inputType.toLowerCase(),
      dataType: dataType.toLowerCase(),
      hasError: error.length,
      errorMessage: error.join(',')
    };
  },
  methods: {}
};
</script>

<style lang="scss">
.form-item-for-uni-app {
  display: flex;
  height: 32px;
  padding: 2px;
  border-bottom: solid 1px $uni-border-color;

  uni-input {
    height: 32px;
  }

  & > .form-item-label {
    padding: 0 8px;
    line-height: 32px;
    width: 90px;

    &::after {
      content: ':';
    }
  }

  & > .form-item-inputer {
    line-height: 32px;
  }
}
</style>
