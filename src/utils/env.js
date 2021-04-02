const { host, hostname } = window.location;
// const protocol = window.location.protocol;
let obj = {
  noPic: './img/nopic.png',
  oemCarmodelOrigin: { SYSTEM: '系统', TENANT: '商户', COLLECTION: '采集' },
  oemCarmodelStatus: { APPROVED: '已审核', PENDING: '待审核' },
  area_prices: [{
    title: '厂商价格',
    dataIndex: 'TENANT',
    key: 'TENANT'
  }, {
    title: '华北区价格',
    dataIndex: 'AREA_NORTH',
    key: 'AREA_NORTH'
  }, {
    title: '东北区价格',
    dataIndex: 'AREA_NORTHEASE',
    key: 'AREA_NORTHEASE'
  }, {
    title: '华东区价格',
    dataIndex: 'AREA_EAST',
    key: 'AREA_EAST'
  }, {
    title: '华南区价格',
    dataIndex: 'AREA_SOUTH',
    key: 'AREA_SOUTH'
  }, {
    title: '西北区价格',
    dataIndex: 'AREA_NORTHWEST',
    key: 'AREA_NORTHWEST'
  }, {
    title: '上海区价格',
    dataIndex: 'AREA_SHANGHAI',
    key: 'AREA_SHANGHAI'
  }],
  ten_category_serv_types: {
    SERV_PRO_PIC: '属性图片数据服务',
    SERV_NEW_CAR: '新车型更新服务',
    SERV_AUTO_MATCH: '自动匹配车型服务',
    SERV_INDUS_PART: '行业配件补充服务',
    SERV_QUERY_OE: '查看OE服务'
  },
  category_types: [{
    key: 'PRODUCT',
    name: '产品'
  }, {
    key: 'KIT',
    name: '套件'
  }, {
    key: 'TOOL',
    name: '工具'
  }, {
    key: 'COMPONENT',
    name: '关键部件'
  }, {
    key: 'GUIDE',
    name: '指导'
  }]

};

switch (hostname) {
  case 'm.sopei.cn':
    obj.userDomain = 'https://u.sopei.cn/#/';
    obj.imgDomain = 'https://img.sopei.cn';
    obj.fileDomain = 'https://file.sopei.cn';
    break;
  case 'release.m.sosoqipei.com':
    obj.userDomain = 'https://release-u.sosoqipei.com/#/';
    obj.imgDomain = 'https://release-img.sosoqipei.com';
    obj.fileDomain = 'https://release-file.sosoqipei.com';
    break;
  default:
    obj.userDomain = 'https://dev-u.sosoqipei.com/#/';
    obj.imgDomain = 'https://dev-img.sosoqipei.com';
    obj.fileDomain = 'https://dev-file.sosoqipei.com';
    break;
}

export default obj;
