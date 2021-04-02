// import { isUrl } from '../utils/tools';

// const menuData = [
//   {
//     name: '欢迎搜配',
//     icon: 'home',
//     path: 'home',
//   },
//   {
//     name: '标准车型',
//     icon: 'appstore',
//     path: 'baseorigin',
//     children: [
//       {
//         name: '标准车型',
//         path: 'list'
//       },
//       {
//         name: '批量任务',
//         path: 'update'
//       },
//       {
//         name: '车型品牌',
//         path: 'carmodelbrand'
//       }
//     ]
//   },
//   {
//     name: '品类产品',
//     icon: 'schedule',
//     path: 'category',
//     children: [
//       {
//         name: '零件树',
//         path: 'parts'
//       },
//       {
//         name: '品牌件',
//         path: 'brandparts'
//       }
//     ]
//   },
//   {
//     name: 'OE管理',
//     icon: 'api',
//     path: 'oe',
//     children: [
//       {
//         name: 'OE管理',
//         path: 'list'
//       }, {
//         name: '待归类OE',
//         path: 'tmp'
//       }, {
//         name: '车型覆盖',
//         path: 'cmcover/-1'
//       }
//     ]
//   },
//   {
//     name: '标准码管理',
//     icon: 'table',
//     path: 'standardcode',
//     children: [
//       {
//         name: '标准码列表',
//         path: 'list'
//       }, {
//         name: '通用权重设置',
//         path: 'weight'
//       }
//     ]
//   },
//   {
//     name: '大厂码管理',
//     icon: 'table',
//     path: 'factorycode',
//     children: [
//       {
//         name: '大厂管理',
//         path: 'factory'
//       }, {
//         name: '品类管理',
//         path: 'category'
//       }, {
//         name: '产品管理',
//         path: 'part'
//       }
//     ]
//   },
//   {
//     name: '行业码管理',
//     icon: 'table',
//     path: 'industrycode',
//     children: [
//       {
//         name: '行业协会',
//         path: 'industry'
//       }, {
//         name: '品类管理',
//         path: 'category'
//       }, {
//         name: '产品管理',
//         path: 'part'
//       }
//     ]
//   },
//   {
//     name: '商户管理',
//     icon: 'team',
//     path: 'clientmanage'
//   },
//   {
//     name: '商户服务',
//     icon: 'customer-service',
//     path: 'clientservice',
//     children: [
//       {
//         name: '数据查询服务',
//         path: 'data'
//       }, {
//         name: 'api接口服务',
//         path: 'api'
//       }
//     ]
//   },
//   // {
//   //   name: '用户管理',
//   //   icon: 'user',
//   //   path: 'usermanage'
//   // },
//   {
//     name: '反馈管理',
//     icon: 'form',
//     path: 'feedback',
//     children: [
//       {
//         name: '车型反馈',
//         path: 'carmodelfeedback'
//       }, {
//         name: '功能反馈',
//         path: 'systemfeedback'
//       }, {
//         name: '产品反馈',
//         path: 'partskufeedback'
//       }
//     ]
//   },
//   // {
//   //   name: '系统管理',
//   //   icon: 'setting',
//   //   path: 'systemmanage',
//   //   children: [
//   //     {
//   //       name: '服务通知',
//   //       path: 'notice'
//   //     }
//   //   ]
//   // },
//   {
//     name: '消息中心',
//     icon: 'message',
//     path: 'message'
//   },
//   {
//     name: '数据导入',
//     icon: 'export',
//     path: 'dataimport'
//   },
//   {
//     name: '平台设置',
//     icon: 'setting',
//     path: 'settings'
//   },
//   {
//     name: 'VIN缓存清理',
//     icon: 'delete',
//     path: 'vinClean'
//   }
// ];

// function formatter(data, parentPath = '/', parentAuthority) {
//   return data.map(item => {
//     let { path } = item;
//     if (!isUrl(path)) {
//       path = parentPath + item.path;
//     }
//     const result = {
//       ...item,
//       path
//     };
//     if (item.children) {
//       result.children = formatter(
//         item.children,
//         `${parentPath}${item.path}/`
//       );
//     }
//     return result;
//   });
// }

// export const getMenuData = () => formatter(menuData);

// export const rawMenu = [...menuData];
