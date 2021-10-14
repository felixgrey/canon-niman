import React, { Component } from "react";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import {fromTree} from '@/SaasPlatform/utils/RelationAndTree';
import routrConfig from './config.js';
import AsyncComponent from './AsyncComponent';

import AppContext from './appContext';

const config = {
  keyField: 'navTo', // 主键
  parentKeyField: 'parent', // 外键
  childrenField: 'routes', // 子节点
  rootField: 'root', // 是否是根
  leafField: 'leaf', // 是否是叶子
  pathField: 'navPath', // 路径
  beforeSet: (item) => {
    if (item.navTo) {
      return;
    }
    let thePath = item.path;
    item.navPath.forEach(item => {
      if (/^\//.test(item.path)) {
        thePath = item.path;
      } else {
        thePath = thePath + '/'+ (item.path.replace(/^(\.\/)/, a => ""));
      }
    });
    item.navTo = thePath;
  }
};

function RouteTree(props, context) {
  const {
    path,
    component,
    routes,
    redirect,
    navPath,
    leaf,
    navTo,
  } = props.tree;

  return <React.Fragment>
    {redirect ? <Route exact path={navTo}>
      <Redirect to={redirect} />
    </Route> : null}
    <Route exact={leaf} path={navTo}>
      <AsyncComponent component={component} {...props}>
        {(routes || []).map(tree => <RouteTree key={"route_" + tree.path} tree={tree}></RouteTree>)}
      </AsyncComponent>
    </Route>
  </React.Fragment>
}

export default class SaasRouter extends Component {

  state = {
    theContext: {}
  }

  static contextType = AppContext;

  render() {

    const routerList = routrConfig.map((node, index) => {
      node.navTo = node.path;
      return fromTree(node, config)
    });
    // const routerList =    fromTree(routrConfig, config);
    console.log(routerList);

    return <AppContext.Provider value={routerList}>
        <React.Fragment>
          {routerList.map(({tree}, index) => {
            return <RouteTree key={"route_" + tree.path} tree={tree}></RouteTree>
          })}
        </React.Fragment>
      </AppContext.Provider>
  }
}
