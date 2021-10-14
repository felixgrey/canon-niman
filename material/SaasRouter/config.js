// 占位用组件
import Block from './Block.js';

/*
路由格式

项目/工地/功能/模块/部分/详情?参数1=值1&...
/:project/:site/:business/:module/:part/:detail?param1=value1&...

示例：1442420028786515970项目1442684522007785474工点，安全管理下盾构机监测实时监测左线
http://localhost:8000/#/platform/anquan/dungou/shishi/1442420028786515970/1442684522007785474/left

空值用复数名词占位，参考首页
/projects/sites/businesses/modules/parts/details

*/

export default [
  {
    path: '/',
    redirect: '/platform/main/projects/sites',
  },
  {
    name: '智慧工地系统', // 标题
    path: '/platform', // 路径
    redirect: '/platform/main/projects/sites',
    layout: { // 布局
      hasMenu: false, // 显示导航菜单
      hasHeader: false, // 显示头部信息
    },
    inMenu: true, // 在菜单中展示
    menuCode: null, // 角色、权限名称
    routes: [ // 子路由
      {
        path: './main',
        redirect: '/platform/main/projects/sites',
      },
      {
        name: '首页', // 标题
        path: './main/:project/:site' , // 路径
        redirect: null, // 跳转
        component: import('@/SaasPlatform/pages/main'), // 组件
        layout: { // 布局
          hasMenu: false, // 显示导航菜单
          hasHeader: false, // 显示头部信息
        },
        inMenu: true, // 在菜单中展示
        menuCode: null, // 角色、权限名称
        routes: [
        ]
      },
      {
        name: '项目', // 标题
        path: './project/:project/:site', // 路径
        redirect: null, // 跳转
        component: import('@/SaasPlatform/pages/project'), // 组件
        layout: { // 布局
          hasMenu: false, // 显示导航菜单
          hasHeader: true, // 显示头部信息
        },
        inMenu: true, // 在菜单中展示
        menuCode: null, // 角色、权限名称
        routes: [  // 子路由
        ]
      },
      // 项目概览 人员管理 安全管理 质量管理 文明施工 视频监控 轨行区管理 应急管理
      {
        name: '项目概览',
        path: './gailan/:project/:site',
        layout: {
          hasMenu: false,
          hasHeader: true,
        },
        menuCode: 'gailan',
        component: Block,
      },
      {
        name: '人员管理',
        path: './renyuan/:project/:site',
        layout: {
          hasMenu: false,
          hasHeader: true,
        },
        menuCode: 'renyuan',
        component: Block,
      },
      {
        name: '安全管理',
        path: './anquan',
        layout: {
          hasMenu: false,
          hasHeader: true,
        },
        menuCode: 'anquan',
        component: Block,
        // anquan/dungou/shishi/01/03/left
        routes: [{
          name: '盾构机监测',
          path: './dungou',
          component: Block,
          routes: [
            {
              name: '实时监测',
              path: './shishi/:project/:site',
              component: Block,
              routes: [
                {
                  name: '左右线',
                  path: './:module',
                  component: Block,
                }
              ],
            },
          ],
        }]
      },
      {
        name: '质量管理',
        path: './zhiliang/:project/:site',
        layout: {
          hasMenu: false,
          hasHeader: true,
        },
        menuCode: 'zhiliang',
        component: Block,
      },
      {
        name: '文明施工',
        path: './shigong/:project/:site',
        layout: {
          hasMenu: false,
          hasHeader: true,
        },
        menuCode: 'shigong',
        component: Block,
      },
      {
        name: '视频监控',
        path: './shipin/:project/:site',
        layout: {
          hasMenu: false,
          hasHeader: true,
        },
        menuCode: 'shipin',
        component: Block,
      },
      {
        name: '轨行区管理',
        path: './guixingqu/:project/:site',
        layout: {
          hasMenu: false,
          hasHeader: true,
        },
        menuCode: 'guixingqu',
        component: Block,
      },
      {
        name: '应急管理',
        path: './yingjiguanli/:project/:site',
        layout: {
          hasMenu: false,
          hasHeader: true,
        },
        menuCode: 'yingjiguanli',
        component: Block,
      },
    ]
  },

];
