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

function createProps(theProps, exceptFields = []) {
  return Object.keys(theProps.theExtend)
    .filter(field => !exceptFields.includes(field))
    .reduce((newProps, field) => (newProps[field] = theProps.theExtend[field], newProps),{
      ...theProps.propsForBind
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
    
    setMode(propsForBind);

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
  if (inputMap[name]) {
    return;
  }
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
    propsForBind,
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
      propsForBind={propsForBind} 
      theExtend={theExtend} />
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


