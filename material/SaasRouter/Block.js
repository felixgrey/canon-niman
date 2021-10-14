import React, { Component } from "react";

import './index.less';

export default function (props) {

  return <div className="block-page">
    <div>
      {props.routerConfig.name}施工中
    </div>
    <div className="sub-page">
      {props.children}
    </div>
  </div>
}
