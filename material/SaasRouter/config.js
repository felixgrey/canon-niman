
/*
路由格式

项目/工地/功能/模块/部分/详情?参数1=值1&...
/:project/:site/:business/:module/:part/:detail?param1=value1&...

空值用复数名词占位
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
    authName: null, // 角色、权限名称
    routes: [ // 子路由
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
        auth: null, // 角色、权限名称
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
        authName: null, // 角色、权限名称
        routes: [  // 子路由
        ]
      },
    ]
  },

];
