const homeConfig = ['首页', '/home'];
// 面包屑配置
const breadcrumb = [
  {
    regexp:/^\/baseorigin\/list$/,
    list: [
      homeConfig,
      ['标准车型', '/baseorigin/list']
    ],
  },
  {
    regexp:/^\/baseorigin\/list\/[0-9]+$/,
    list: [
      homeConfig,
      ['标准车型', '/baseorigin/list'],
      ['标准车型 编辑/审核', '']
    ],
  },
  {
    regexp:/^\/baseorigin\/update$/,
    list: [
      homeConfig,
      ['批量任务', '']
    ],
  },
  {
    regexp:/^\/baseorigin\/carmodelbrand$/,
    list: [
      homeConfig,
      ['车型品牌', '']
    ],
  },
  {
    regexp:/^\/baseorigin\/history$/,
    list: [
      homeConfig,
      ['标准车型', '/baseorigin/list'],
      ['批量任务', '/baseorigin/update'],
      ['更新历史记录', '']
    ],
  },
  {
    regexp:/^\/baseorigin\/approve$/,
    list: [
      homeConfig,
      ['标准车型', ''],
      ['源车型审核', '/baseorigin/approve'],
    ],
  },
  {
    regexp:/^\/baseorigin\/approve\/.+$/,
    list: [
      homeConfig,
      ['标准车型', ''],
      ['源车型审核', '/baseorigin/approve'],
      ['详情', '']
    ],
  },

  {
    regexp:/^\/baseorigin\/commercial$/,
    list: [
      homeConfig,
      ['标准车型', ''],
      ['商用车标准化', '/baseorigin/commercial'],
    ],
  },
  {
    regexp:/^\/category\/parts$/,
    list: [
      homeConfig,
      ['品类产品', '/category/parts'],
      ['零件树', '']
    ],
  },
  {
    regexp:/^\/category\/brandparts$/,
    list: [
      homeConfig,
      ['品类产品', '/category/brandparts'],
      ['品牌件', '']
    ],
  },
  {
    regexp:/^\/category\/brandparts\/[-1-9]+$/,
    list: [
      homeConfig,
      ['品类产品', '/category/brandparts'],
      ['品牌件', '/category/brandparts'],
      ['管理', '']
    ],
  },

  {
    regexp:/^\/oe\/list$/,
    list: [
      homeConfig,
      ['OE管理', '/oe/list']
    ],
  },
  {
    regexp:/^\/oe\/list\/[0-9]+$/,
    list: [
      homeConfig,
      ['OE管理', '/oe/list'],
      ['创建/编辑', '']
    ],
  },
  {
    regexp:/^\/oe\/list\/[-1]+$/,
    list: [
      homeConfig,
      ['OE管理', '/oe/list'],
      ['创建OE', '']
    ],
  },
  {
    regexp:/^\/oe\/tmp$/,
    list: [
      homeConfig,
      ['OE管理', '/oe/list'],
      ['待归类OE', '']
    ],
  },
  {
    regexp:/^\/oe\/cmcover\/[-10-9]+$/,
    list: [
      homeConfig,
      ['OE管理', '/oe/list'],
      ['车型覆盖', '']
    ],
  },
  {
    regexp:/^\/standardcode\/list$/,
    list: [
      homeConfig,
      ['标准码管理', '/standardcode/list'],
      ['标准码列表', '']
    ],
  },
  {
    regexp:/^\/standardcode\/list\/[0-9]+$/,
    list: [
      homeConfig,
      ['标准码管理', '/standardcode/list'],
      ['标准码列表', '/standardcode/list'],
      ['标准码编辑', '']
    ],
  },
  {
    regexp:/^\/standardcode\/weight$/,
    list: [
      homeConfig,
      ['标准码管理', '/standardcode/list'],
      ['通用权重设置', '']
    ],
  },
  {
    regexp:/^\/factorycode\/factory$/,
    list: [
      homeConfig,
      ['大厂码管理', '/factorycode/factory'],
      ['大厂管理', '']
    ],
  },
  {
    regexp:/^\/factorycode\/factory\/.+$/,
    list: [
      homeConfig,
      ['大厂码管理', '/factorycode/factory'],
      ['大厂管理', '/factorycode/factory'],
      ['创建 / 编辑', '']
    ],
  },
  {
    regexp:/^\/factorycode\/category$/,
    list: [
      homeConfig,
      ['大厂码管理', '/factorycode/factory'],
      ['品类管理', '']
    ],
  },
  {
    regexp:/^\/factorycode\/part$/,
    list: [
      homeConfig,
      ['大厂码管理', ''],
      ['产品管理', '']
    ],
  },
  {
    regexp:/^\/factorycode\/part\/.+$/,
    list: [
      homeConfig,
      ['大厂码管理', ''],
      ['产品管理', '/factorycode/part']
    ],
  },

  {
    regexp:/^\/industrycode\/industry$/,
    list: [
      homeConfig,
      ['行业码管理', '/industrycode/industry'],
      ['行业协会', '']
    ],
  },
  {
    regexp:/^\/industrycode\/list\/.+$/,
    list: [
      homeConfig,
      ['行业码管理', '/industrycode/industry'],
      ['行业协会', '/industrycode/industry'],
      ['创建 / 编辑', '']
    ],
  },
  {
    regexp:/^\/industrycode\/category$/,
    list: [
      homeConfig,
      ['行业码管理', '/industrycode/industry'],
      ['品类管理', '']
    ],
  },
  {
    regexp:/^\/industrycode\/category\/.+$/,
    list: [
      homeConfig,
      ['行业码管理', '/industrycode/industry'],
      ['品类管理', '/industrycode/category'],
      ['产品管理', '']
    ],
  },
  {
    regexp:/^\/industrycode\/part$/,
    list: [
      homeConfig,
      ['行业码管理', ''],
      ['产品管理', '']
    ],
  },
  {
    regexp:/^\/industrycode\/part\/.+$/,
    list: [
      homeConfig,
      ['行业码管理', ''],
      ['产品管理', '/industrycode/part']
    ],
  },
  {
    regexp:/^\/tenant\/clientmanage$/,
    list: [
      homeConfig,
      ['商户管理', ''],
      ['商户管理', '/tenant/clientmanage'],
    ],
  },
  {
    regexp:/^\/tenant\/label$/,
    list: [
      homeConfig,
      ['商户管理', ''],
      ['标签管理', '/tenant/label']
    ],
  },
  {
    regexp:/^\/tenant\/label\/-1$/,    list: [
      homeConfig,
      ['商户管理', ''],
      ['标签管理', '/tenant/label'],
      ['创建标签', ''],
    ],
  },
  {
    regexp:/^\/tenant\/label\/[0-9]+$/,    list: [
      homeConfig,
      ['商户管理', ''],
      ['标签管理', '/tenant/label'],
      ['编辑标签', ''],
    ],
  },
  {
    regexp:/^\/tenant\/labels$/,
    list: [
      homeConfig,
      ['商户管理', ''],
      ['商户标签', '/tenant/labels']
    ],
  },
  {
    regexp:/^\/tenant\/labels\/-1$/,    list: [
      homeConfig,
      ['商户管理', ''],
      ['商户标签', '/tenant/labels'],
      ['创建标签', ''],
    ],
  },
  {
    regexp:/^\/tenant\/labels\/[0-9]+$/,    list: [
      homeConfig,
      ['商户管理', ''],
      ['商户标签', '/tenant/labels'],
      ['编辑标签', ''],
    ],
  },
  {
    regexp:/^\/clientmanage\/[0-9]+$/,
    list: [
      homeConfig,
      ['商户管理', '/clientmanage'],
      ['商户编辑', '']
    ],
  },
  {
    regexp:/^\/clientservice\/data$/,
    list: [
      homeConfig,
      ['商户服务', '/clientservice/data'],
      ['数据查询服务', '']
    ],
  },
  {
    regexp:/^\/clientservice\/data\/[0-9]+$/,
    list: [
      homeConfig,
      ['商户服务', '/clientservice/data'],
      ['数据查询服务', '']
    ],
  },
  {
    regexp:/^\/clientservice\/api$/,
    list: [
      homeConfig,
      ['商户服务', '/clientservice/api'],
      ['api接口服务', '']
    ],
  },
  // {
  //     regexp:/^\/standardcode\/weight$/,
  //     list: [
  //         homeConfig,
  //         ['商户服务', '/standardcode/list'],
  //         ['通用权重设置', '']
  //     ],
  // },
  {
    regexp:/^\/dataimport$/,
    list: [
      homeConfig,
      ['数据导入', '']
    ],
  },
  {
    regexp:/^\/settings$/,
    list: [
      homeConfig,
      ['平台设置', '']
    ],
  },
  {
    regexp:/^\/vin\/vinClean$/,
    list: [
      homeConfig,
      ['VIN缓存清理', '']
    ],
  },
  {
    regexp:/^\/vin\/vinQuery$/,
    list: [
      homeConfig,
      ['VIN查询', '']
    ],
  },
  {
    regexp:/^\/feedback\/carmodelfeedback$/,
    list: [
      homeConfig,
      ['反馈管理', ''],
      ['车型反馈', '']
    ],
  },
  {
    regexp:/^\/feedback\/systemfeedback$/,
    list: [
      homeConfig,
      ['反馈管理', ''],
      ['功能反馈', '']
    ],
  },
  {
    regexp:/^\/feedback\/partskufeedback$/,
    list: [
      homeConfig,
      ['反馈管理', ''],
      ['产品反馈', '']
    ],
  },
  // {
  //   regexp:/^\/systemmanage\/notice$/,
  //   list: [
  //     homeConfig,
  //     ['系统管理', '/systemmanage/notice'],
  //     ['服务通知', '']
  //   ]
  // },
  {
    regexp: /^\/login$/,
    title: '登录'
  },
  {
    regexp:/^\/message$/,
    list: [
      homeConfig,
      ['消息中心', '']
    ],
  },
  {
    regexp:/^\/updatepassword$/,
    list: [
      homeConfig,
      ['修改密码', '']
    ],
  },
  {
    regexp:/^\/weapp$/,
    list: [
      homeConfig,
      ['小程序管理', '']
    ],
  },
  {
    regexp:/^\/manager\/userList$/,
    list: [
      homeConfig,
      ['账号中心', ''],
      ['账号管理', '']
    ],
  },
  {
    regexp:/^\/manager\/userList\/-1$/,    list: [
      homeConfig,
      ['账号管理', '/manager/userList'],
      ['创建账号', ''],
    ],
  },
  {
    regexp:/^\/manager\/userList\/[0-9]+$/,    list: [
      homeConfig,
      ['账号管理', '/manager/userList'],
      ['编辑账号', ''],
    ],
  },
  {
    regexp:/^\/manager\/record$/,
    list: [
      homeConfig,
      ['账号中心', ''],
      ['操作日志', '']
    ],
  },
  // smy-start
  {
    regexp:/^\/statistics\/spart$/,
    list: [
      homeConfig,
      ['数据统计',''],
      ['端口统计', '/statistics/spart']
    ],
  },
  {
    regexp:/^\/statistics\/spart\/stenlist\/[0-9]+$/,
    list: [
      homeConfig,
      ['数据统计', ''],
      ['端口统计', '/statistics/spart'],
      ['端口数据详情',''],
    ],
  },
  {
    regexp:/^\/statistics\/spart\/parttrend\/[0-9]+$/,
    list: [
      homeConfig,
      ['数据统计', ''],
      ['端口统计', '/statistics/spart'],
      ['端口数据趋势',''],
    ],
  },
  {
    regexp:/^\/statistics\/spart\/steninfo\/[0-9]+$/,
    list: [
      homeConfig,
      ['数据统计', ''],
      ['端口统计', '/statistics/spart'],
      ['品牌详细数据',''],
    ],
  },
  {
    regexp:/^\/usermanager\/account$/,
    list: [
      homeConfig,
      ['用户管理',''],
      ['账户管理', '/usermanager/account']
    ],
  },
  {
    regexp:/^\/usermanager\/account\/ipunlock$/,
    list: [
      homeConfig,
      ['用户管理',''],
      ['账户管理', '/usermanager/account'],
      ['IP解封', '/usermanager/account/ipunlock']

    ],
  },
  {
    regexp:/^\/application\/appmanager$/,
    list: [
      homeConfig,
      ['应用市场', '/application/appmanager'],
      ['应用管理', '']
    ],
  },
  {
    regexp:/^\/application\/orderform$/,
    list: [
      homeConfig,
      ['应用市场', '/application/orderform'],
      ['订单管理', '']
    ],
  },
  {
    regexp:/^\/application\/personal$/,
    list: [
      homeConfig,
      ['应用市场', '/application/personal'],
      ['用户个性管理', '']
    ],
  },
  {
    regexp:/^\/application\/personal\/usercolor$/,
    list: [
      homeConfig,
      ['应用市场', ''],
      ['用户个性管理', '/application/personal'],
      ['个性端口-用户自定义颜色', '']
    ],
  },
  {
    regexp:/^\/application\/personal\/usercolor\/-1$/,    list: [
      homeConfig,
      ['应用市场', ''],
      ['用户个性管理', '/application/personal'],
      ['个性端口-用户自定义颜色', '/application/personal/usercolor'],
      ['创建颜色', ''],
    ],
  },
  {
    regexp:/^\/application\/personal\/usercolor\/[0-9]+$/,    list: [
      homeConfig,
      ['应用市场', ''],
      ['用户个性管理', '/application/personal'],
      ['个性端口-用户自定义颜色', '/application/personal/usercolor'],
      ['编辑颜色', ''],
    ],
  },
  // smy-end
  {
    regexp:/^\/application\/appmanager\/-1$/,    list: [
      homeConfig,
      ['应用市场', ''],
      ['应用管理', '/application/appmanager'],
      ['创建应用', ''],
    ],
  },
  {
    regexp:/^\/application\/appmanager\/[0-9]+$/,    list: [
      homeConfig,
      ['应用市场', ''],
      ['应用管理', '/application/appmanager'],
      ['编辑应用', ''],
    ],
  },
  {
    regexp:/^\/application\/checktenant\/[0-9]+$/,    list: [
      homeConfig,
      ['应用市场', ''],
      ['应用管理', '/application/appmanager'],
      ['编辑应用', ''],
      ['应用开放范围 : 选择商户范围', ''],
    ],
  },
  {
    regexp:/^\/application\/checklabel\/[0-9]+$/,    list: [
      homeConfig,
      ['应用市场', ''],
      ['应用管理', ''],
      ['编辑应用', ''],
      ['应用开放范围 : 选择标签范围', ''],
    ],
  },
  {
    regexp:/^\/application\/openingapp$/,
    list: [
      homeConfig,
      ['应用市场', '/application/openingapp'],
      ['已开通应用', ''],
    ],
  },
  {
    regexp:/^\/manager\/role$/,
    list: [
      homeConfig,
      ['角色管理', '']
    ],
  },
  {
    regexp:/^\/manager\/role\/-1$/,
    list: [
      homeConfig,
      ['角色管理', '/manager/role'],
      ['创建角色', '']
    ],
  },
  {
    regexp:/^\/manager\/role\/[0-9]+$/,
    list: [
      homeConfig,
      ['角色管理', '/manager/role'],
      ['编辑角色', '']
    ],
  },
];
export default breadcrumb;
