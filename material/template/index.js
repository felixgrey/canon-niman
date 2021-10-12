/*
  按照商业组件-项目组件-页面组件次序引入
*/

// 商业组件
import React, { Component } from "react";
import classnames from 'classnames';
import { Row, Col, Button} from 'antd';
import { CheckOutlined } from "@ant-design/icons";

// 项目组件
import { mergeMapFuns, withRouterConnect} from '@/SaasPlatform/utils/WithRedux';
import mixIt from '@/SaasPlatform/utils/mixIt'; // 增强React组件功能

// 页面组件
import { projectConnect } from './service.js';
import './index.less';

/*
  需要在site-management/src/main/ui/src/SaasPlatform/SaasRouter/config.js中注册路由
*/

class Project extends Component {

  constructor(...args) {
    super(...args);
    mixIt(this);
  }

  state = {
    data: null,
  }

  async getData(){
    //TODO
  }
  /*
    不要用
    shouldComponentUpdate、
    componentDidMount、
    componentDidUpdate、
    componentWillUnmount。
    之外的生命周期函数，因为已经被React标记为过时。
  */

  // shouldComponentUpdate () {
  //   return true;
  // }

  componentDidMount() {
    this.getData();
  }

  componentDidUpdate(prevProps, prevState) {

  }

  componentWillUnmount() {
  }

  render() {
    const {
      data
    } = this.state;

    return <div className="app-page">
      {data}
    </div>
  }
}

export default projectConnect()(Project);
