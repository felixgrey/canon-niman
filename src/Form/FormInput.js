import React, { Component } from 'react'；
import { Input, InputNumber, Select } from 'antd';
import './FormInput.css';

const { Option } = Select;

const inputMap = {
  Input: function(theProps) => {
    const {
      props,
      info,
      labelClassName,
      labelStyle,
      inputClassName,
      inputStyle,
    } = theProps;
    
    const {
      formInstance
    } = info;
    
    const myProps = {
      ...props,
      onChange: function(e) {
        props.onChange(e.value);
      }
    };
   
    // TODO
    
    return null;
  },
  InputNumber: function(theProps) => {
    const {
      props,
      info,
      labelClassName,
      labelStyle,
      inputClassName,
      inputStyle,
    } = theProps;
    
    const myProps = {
      ...props,
      onChange: function(e) {
        props.onChange(e.value);
      }
    }
    
    // TODO
    return null;
  },
  SingleSelect: function(theProps) => {
    const {
      props,
      info,
      labelClassName,
      labelStyle,
      inputClassName,
      inputStyle,
    } = theProps;
    // TODO
    return null;
  },
  MutiSelect: function(theProps) => {
    const {
      props,
      info,
      labelClassName,
      labelStyle,
      inputClassName,
      inputStyle,
    } = theProps;
    // TODO
    return null;
  },
  ModalSelect: function(theProps) => {
    const {
      props,
      info,
      labelClassName,
      labelStyle,
      inputClassName,
      inputStyle,
    } = theProps;
    // TODO
    return null;
  },
  MutiModalSelect: function(theProps) => {
    const {
      props,
      info,
      labelClassName,
      labelStyle,
      inputClassName,
      inputStyle,
    } = theProps;
    // TODO
    return null;
  },
};

export default function() {
  
  return <div>
    
  </div>
}