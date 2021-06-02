import React, { Component, useState } from 'react';
import { 
  Input as AntdInput,  // 不改名编译会失败……
  InputNumber as AntdInputNumber, 
  DatePicker as AntdDatePicker,
  Select, 
  Button,
} from 'antd';

import FormModel from './FormModel';
import checkType from './CheckType';
import './FormInput.css';

const { Option } = Select;
const { TextArea: AntdTextArea } = AntdInput;

function isBlank(v) {
  return v === undefined || v === null || new String(v).trim() === '';
}

function createProps(theProps, exceptFields = []) {
  return Object.keys(theProps.theExtend)
    .filter(field => !exceptFields.includes(field))
    .reduce((newProps, field) => (newProps[field] = theProps.theExtend[field], newProps),{
      ...theProps.propsForBind,
      style: theProps.style,
      className: theProps.className,
    });
}

function createSelect(muti = false) {
  
  const setMode = muti ? 
    props => (props.mode = 'multiple') : 
    props => (delete props.mode);
  
  return function(theProps){
    const propsForBind = createProps(theProps,
      ['data', 'labelField', 'valueField', 'valueInLabel']);
    
    const {
      data = [],
      labelField = 'codeName',
      valueField = 'codeValue',
      valueInLabel = false,
    } = theProps.theExtend;

    const getLabel = valueInLabel ? 
      (item) => `(${item[valueField]}) ${item[labelField]}` :
      (item) => item[labelField]; 
    
    return <Select {...propsForBind} >
      {data.map((item, index) => {
        return <Option key={index} value={item[valueField]}>
          {getLabel(item)}
        </Option>
      })}
    </Select>;
  }
}

const inputMap = {
  Input: function (theProps) {
    return <AntdInput {...createProps(theProps)}  />;
  },
  TextArea: function(theProps){
    return <AntdTextArea {...createProps(theProps)} />;
  },
  InputNumber: function(theProps){    
    return <AntdInputNumber {...createProps(theProps)} />;
  },
  SingleSelect: createSelect(false),
  MutiSelect: createSelect(true),
  RadioButton: function(theProps){
    // TODO
    return null;
  },
  SingleModalSelect: function(theProps) {
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
  DecodeLabel:  function(theProps) {
    // TODO
    return null;
  },
  Label: function(theProps) {
    let value = theProps.propsForBind.value;
    const {
      split = ',',
      data,
      labelField = 'label',
      valueField = 'value',
    } = theProps.theExtend;
    
    let map;
    if(Array.isArray(data)) {
      map = data.reduce((map,item) => {
        map[item[valueField]] = item[labelField];
        return map;
      },{})
    }

    if (Array.isArray(value)) {
      if (map) {
        value = value.map(v => {
          if (map.hasOwnProperty(v)) {
            return map[v];
          }
          return v;
        })
      }
      value = value.join(split);
    } else if (map && map.hasOwnProperty(value)) {
      value = map[value];
    }
    
    return <div className="label-input">
      {value}
    </div>;
  },
  Cell: function(theProps) {
    let {
      activeInputType = 'Input',
      activeType = 'click' // click doubleClick row column always
    } = theProps.theExtend;
    
    if (`${activeInputType}`.toLowerCase() === 'cell') {
      activeInputType = 'Label';
    }
    
    delete theProps.theExtend.activeInputType;
    
    const Inputer = inputMap[activeInputType] || inputMap.Label;

    return <Inputer {...theProps} />
  }
};

function registerInput(name, InputComponent) {
  if (inputMap[name]) {
    return;
  }
  inputMap[name] = InputComponent;
}

class FormForAntd extends FormModel {
  
  contextData = {};
  
  bindView(view) {
    this.onFormChange = () => {
      view.forceUpdate();
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
    propsForBind,
    info,
    contextData,
  } = theProps.withField;
  
  const {
    notExisted,
    label,
    inputType,
    dataType,
    theExtend,
    required,
    formInstance,
    error,
    index,
  } = info;

  if (notExisted) {
    return null;
  }
  
  if (theExtend.noneIfBlank && isBlank(propsForBind.value)) {
    return null;
  }

  // 组件按照已定义、自定义、默认次序寻找
  const Inputer = inputMap[inputType] || inputMap.Input;
  
  const formConfig = formInstance.config;
  
  let {
    // 总体样式
    className = theExtend.className || formConfig.className || '',
    style = theExtend.style || formConfig.style || {},
    // 标签样式
    labelClassName = theExtend.labelClassName || formConfig.labelClassName || '',
    labelStyle = theExtend.labelStyle || formConfig.labelStyle || {},
    // 输入组件样式
    inputClassName = theExtend.inputClassName || formConfig.inputClassName ||  '',
    inputStyle = theExtend.inputStyle || formConfig.inputStyle || {},
    // 自定义标签宽度
    labelWidth = theExtend.labelWidth || formConfig.labelWidth || null,
    inputWidth = theExtend.inputWidth || formConfig.inputWidth || null,

  } = theProps;
  
  const inputOuterStyle = {};
 
  // 自定义标签宽度
  if (labelWidth !== null) {
    labelStyle.width = labelWidth;
    inputOuterStyle.width = `calc(100% - ${labelWidth})`;
  }
  
  if (inputWidth !== null) {
    inputStyle.width = inputWidth;
  }

  // 必填 * 记号
  const requiredClassName = required ? "required-field-label " : "";
  
  if (error.length) {
    className = className + ' has-error';
  }
  
  const label2 = typeof label === 'function' ? label(propsForBind.value, index) : label;

  return <div className={'form-item-for-antd ' + className} style={style}>
    {theExtend.noLabel ? null :
      <label className={requiredClassName + labelClassName} style={labelStyle} >
        {label2}
      </label>
    }
    <div className="form-item-input" style={inputOuterStyle}>
      <Inputer
        className={inputClassName} 
        style={inputStyle}
        propsForBind={propsForBind} 
        dataType={dataType}
        contextData={contextData}
        theExtend={theExtend} />
      {error.length ?<div className="ant-form-explain form-item-error" >
        <label className={labelClassName}> </label>
        {error.join(',')}
       </div> : null}
    </div>
  </div>
}

class SubmitButton extends Component {
  
  onEnter = (e) => {
    if (e.key === "Enter" && this.props.onClick) {
      this.props.onClick(e);
    }
  }
  
  componentDidMount() {
    if (!this.props.noEnter) {
      window.addEventListener('keypress', this.onEnter);
    }
  }
  
  componentWillUnmount() {
    window.removeEventListener('keypress',this.onEnter);
  }
  
  render() {
    return <Button type="primary" {...this.props}>
      {this.props.children}
    </Button>
  } 
}

function listenEnter(callback = Function.prototype) {
  return {
    onKeyPress: (e) => {
      e.key === 'Enter' && callback(e);
    }
  }
}

export {
  listenEnter,
  FormItem,
  FormForAntd,
  registerInput,
};


