import React, { Component } from "react";
import '@/SaasPlatform/theme/index.less';
import AppContext from './appContext';

import Header from '@/SaasPlatform/components/Header';
import checkLogin from '@/SaasPlatform/utils/checkLogin';

import BlankLayout from './BlankLayout';

export default class AsyncComponent extends Component{

  constructor(props,context,...args) {
    super(props,context,...args);
    checkLogin();

    Promise.resolve(props.component).then(module => {

      let Component = BlankLayout;
      if (module && typeof module === 'object') {
        Component = module.default;
      } else if (typeof module === 'function') {
        Component = module;
      }

      this.setState({
        Component
      });
    })
  }

  state = {
    Component: null
  }

  componentDidMount() {

  }

  render() {

    return <AppContext.Consumer>
    {(context) => {
      const {
        tree
      } = this.props;

      // console.log(context);

      const {
        hasMenu = false, // 显示导航菜单
        hasHeader = false,
      } = tree.layout || {};

      let TheMenu = a => null;
      let TheHeader = a => null;

      if (hasMenu) {
        TheMenu = a => null // TODO
      }

      if (hasHeader) {
        TheHeader = a => <div className="app-header">
          <Header></Header>
        </div>;
      }

      const {
        Component
      } = this.state;

      // 加载中
      if (Component === null) {
        return <div className="app-saas-platform">
          <TheHeader></TheHeader>
        </div>
      }

      // 加载完成
      return (<div className="app-saas-platform">
        <TheHeader></TheHeader>
        <div className="app-page-container">
          <Component {...this.props} routerConfig={tree} >
            {this.props.children}
          </Component>
        </div>
      </div>);
    }}
    </AppContext.Consumer>;
  }
}
