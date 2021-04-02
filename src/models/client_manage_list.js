import { request } from '@/utils/http';
import msg from '@/utils/msg';

const emptyFields = {
  company_type: '',                       // 类型定义： TENANT 厂家 ， MEMBER 会员
  tenant_status: '',                      // 服务状态： ENABLE 服务中 ， DISABLE 已禁止
  province_city_country: [],              // 省市区
  app_channel: '',                        // 已开通的服务
  tenant_level: '',                       // 商户等级
  company_evaluate: '',                   // 星级：5 4 3 2 1 
  evaluate_operator: '',                  // 星级： eq 等于  gt 大于  lt 小于
  search_key: '',                         // 关键字搜索 - 输入框的key
  search_val: '',                         // 关键字搜索 - 输入框的值
  page: 1,
  perpage: 10,
};
const emptyObjectList = {
  list: [],
  count: 0
};
const emptyObject = {};

export default {
  namespace: 'client_manage_list',

  state: {
    searchFields: emptyFields,                              // 查询客户列表参数                 
    customerList: emptyObjectList,                          // 客户列表
    customerInfo: emptyObject                               // 客户详情详情
  },
  effects: {
    // 列表 - 获取列表数据
    *fetchCustomerList({ payload }, { call, put, select }) {
      // 处理省市区
      let pcc = [];
      if(payload.province_city_country && payload.province_city_country.length !== 0) {
        pcc = payload.province_city_country;
      } else {
        payload.province_id = '';
        payload.city_id = '';
        payload.county_id = '';
      }
      let params = {
        company_type: payload.company_type, 
        tenant_status: payload.tenant_status,
        province_id: pcc[0] || '',
        city_id: pcc[1] || '',
        county_id: pcc[2] || '',
        company_evaluate: payload.company_evaluate,
        evaluate_operator: payload.evaluate_operator,
        app_channel: payload.app_channel,
        tenant_level: payload.tenant_level,
        page: payload.page,
        perpage: payload.perpage
      };
      // 处理关键字搜索
      if(payload.search_key) {
        params[payload.search_key] = payload.search_val;
      }
      const { serviceList, addressList } = yield select(state => state.global);
      const res_1 = yield call(request, { fnName: 'customer_list', params });
      if(serviceList.length === 0) {
        yield put({ type: 'global/fetchServices' });
      }
      if(addressList.length === 0) {
        yield put({ type: 'global/fetchAddress' });
      }
      if(res_1.code === 0) {
        yield put({ type: 'saveCustomerList', payload: res_1.data });
        yield put({ type: 'saveSearchFields', payload: { ...params, province_city_country: payload.province_city_country } });
      } else {
        msg(res_1);
      }
    },
    // 更新客户信息
    *updateCustomerInfo({ payload }, { call, put }) {
      const res = yield call(request, {
        fnName: 'customer_info',
        data: {
          tenant_id: payload.tenant_id,
          company_id: payload.company_id,
          company_type: payload.company_type,
          tenant_status: payload.tenant_status,
          tenant_level: payload.tenant_level,
          company_evaluate: parseInt(payload.company_evaluate, 10),
          company_desc: payload.company_desc,
        }
      });
      if(res.code === 0) {
        msg('修改成功');
        payload.cb && payload.cb();
      } else {
        msg(res);
      }
    }
  },
  reducers: {
    // 保存客户列表
    saveCustomerList(state, { payload }) {
      return payload ? { ...state, customerList: payload } : { ...state, customerList: emptyObjectList };
    },
    // 保存筛选条件参数
    saveSearchFields(state, { payload }) {
      return payload ? { ...state, searchFields: payload } : { ...state, searchFields: emptyFields };
    },
    // 保存客户信息
    saveCustomerInfo(state, { payload }) {
      return payload ? { ...state, customerInfo: payload } : { ...state, customerInfo: emptyObject };
    }
  },
  subscriptions: {

  }
};