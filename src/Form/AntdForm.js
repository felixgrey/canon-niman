import React, { Component, useState } from 'react';
import { 
  Input as AntdInput,  // 不改名编译会失败……
  InputNumber as AntdInputNumber, 
  DatePicker as AntdDatePicker,
  Select, 
} from 'antd';

import FormModel from './FormModel';
import checkType from './CheckType';
import './FormInput.css';

const { Option } = Select;
const { TextArea: AntdTextArea } = AntdInput;

const inputMap = {
  Input: function (theProps) {
    return <AntdInput {...theProps.props}  />;
  },
  TextArea: function(theProps){
    return <AntdTextArea {...theProps.props} />;
  },
  InputNumber: function(theProps){
    return <AntdInputNumber />;
  },
  SingleSelect: function(theProps){
    
    const {
      data = [],
      labelField = 'codeName',
      valueField = 'codeValue',
      valueInLabel = false,
    } = theProps.theExtend;
    
    const getLabel = valueInLabel ? 
      (item) => `(${item[valueField]}) ${item[labelField]}` :
      (item) => item[labelField]; 
    
    return <Select {...theProps.props} >
      {data.map((item, index) => {
        return <Option key={index} value={item[valueField]}>
          {getLabel(item)}
        </Option>
      })}
    </Select>;
  },
  RadioButton: function(theProps){
    // TODO
    return null;
  },
  MutiSelect: function(theProps){
    // TODO
    return null;
  },
  MutiModalSelect: function(theProps) {
    // TODO
    return null;
  },
  DatePicker: function(theProps) {
    // TODO
    return null;
  },
  InputView: function(theProps) {
    // TODO
    return null;
  },
  SelectView: function(theProps) {
    // TODO
    return null;
  },
};

function registerInput(name, InputComponent) {
  inputMap[name] = InputComponent;
}

class FormForAntd extends FormModel {
  
  bindView(view) {
    this.onFormChange = () => {
      view.forceUpdate();
    };
    
    return this;
  }
  
  isBlank(value, fieldInfo) {
    return super.isBlank(value, fieldInfo);
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
        fields.push(newFieldInfo)
      }
    });
    
    this.onFormChange();
  }
  
  transformSet(fieldInfo, [value]) {
    //antd组件 onChange事件参数可能是值也可能是事件
    if (value !== null && typeof value === 'object') {
      const {
        target,
        preventDefault,
        stopPropagation,
      } = value;
      
      // 通过三个属性判断是否是事件,如果是，取值
      if (target && preventDefault && stopPropagation) {
        value = target.value;
      }
    }
    
    return value;
  }
}

function FormItem(theProps) {
  const {
    // 总体样式
    className = '',
    style = {},
    // 标签样式
    labelClassName = '',
    labelStyle = {},
    // 输入组件样式
    inputClassName = '',
    inputStyle = {},
    // 自定义标签宽度
    labelWidth = null,

    // Field渲染信息对象
    withField,
  } = theProps;
  
  const {
    props,
    info,
  } = withField;
  
  const {
    notExisted,
    label,
    inputType,
    theExtend,
    required,
  } = info;

  if (notExisted) {
    return null;
  }
  
  // 组件按照已定义、自定义、默认次序寻找
  const Inputer = inputMap[inputType] || inputMap.Input;
 
  // 自定义标签宽度
  if (labelWidth !== null) {
    labelStyle.width = labelWidth;
    inputStyle.width = `calc(100% - ${labelWidth})`;
  }
  
  // 必填 * 记号
  const requiredClassName = required ? "required-field-label " : "";

  return <div className={'form-item-for-antd ' + className} style={style}>
    {theExtend.noLabel ? null :
      <label className={requiredClassName + labelClassName} style={labelStyle} >
        {label}
      </label>
    }
    <Inputer 
      className={inputClassName} 
      style={inputStyle}
      props={props} 
      theExtend={theExtend} />
  </div>
}

export {
  FormItem,
  FormForAntd,
  registerInput,
};


