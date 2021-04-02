import { request } from '@/utils/http';
import msg from '@/utils/msg';

const emptyFields = {
  ten_brand_type: 'FACTORY', // FACTORY/DEALER
  ten_category_approved: 'ALL',
  brand_category_id: 'ALL',
  ten_brand_status: 'ALL',
  page: 1,
  perpage: 10
};
const emptyArray = [];
const emptyObjectList = {
  list: [],
  count: 0
};
const emptyObject = {};

export default {
  namespace: 'client_service_data_list',

  state: {
    searchFields: emptyFields,                              // 数据查询服务列表参数
    serviceDataList: emptyObjectList,                       // 数据查询服务列表
    serviceDataInfo: emptyObject,                           // 客户详情详情
    brandCategoryDropList: emptyArray,                      // 品类下拉列表
  },
  effects: {
    // 列表 - 获取列表数据
    *fetchServiceDataList({ payload }, { call, put, select }) {
      let params = {};
      for(let key in payload) {
        const val = payload[key];
        if(val && val !== 'ALL') {
          params[key] = val;
        }
      }
      const { brandCategoryDropList } = yield select(state => state.client_service_data_list);
      const { serviceList } = yield select(state => state.global);
      // 1、获取列表数据
      const res_1 = yield call(request, { fnName: 'tenant_brands', params });
      if(brandCategoryDropList.length === 0) {
        // 2、获取品类下拉列表
        const res = yield call(request, { fnName: 'brand_category_list' });
        if(res.code === 0) {
          yield put({ type: 'saveBrandCategoryDropList', payload: res.data });
        } else {
          msg(res);
        }
      }
      if(serviceList.length === 0) {
        yield put({ type: 'global/fetchServices' });
      }
      if(res_1.code === 0) {
        yield put({ type: 'saveServiceDataList', payload: {list: res_1.data, count: res_1.count }});
        yield put({ type: 'saveSearchFields', payload });
      } else {
        msg(res_1);
      }
    },
    // 更新数据服务品牌信息
    *updateBrandInfo({ payload, cb }, { call, put }) {
      const res = yield call(request, {
        fnName: 'service_brand_update',
        data: payload
      });
      if(res.code === 0) {
        msg('修改成功');
        cb && cb();
      } else {
        msg(res);
      }
    },
    // 更新数据服务品类信息
    *updateCategoryInfo({ payload }, { call, put }) {
      const res = yield call(request, {
        fnName: 'service_category_update',
        data: {
          tenant_id: payload.tenant_id,
          ten_brand_id: payload.ten_brand_id,
          brand_category_id: payload.brand_category_id,
          ten_category_id: payload.ten_category_id,
          ten_category_approved: payload.ten_category_approved
        }
      });
      if(res.code === 0) {
        msg('修改成功');
        payload.cb && payload.cb();
      } else {
        msg(res);
      }
    },
    // 获取品牌下的品类数据
    *fetchTenantCategories({ payload }, { call, put, select }) {
      const res = yield call(request, { fnName: 'tenant_categories', params: payload });
      const { serviceDataInfo } = yield select(state => state.client_service_data_list);
      if(res.code === 0) {
        yield put({
          type: 'saveServiceInfo',
          payload: {
            ...serviceDataInfo,
            ten_brand_categories: res.data
          }
        });
      } else {
        msg(res);
      }
    },
    *fetchTenantDealerCategories({ payload }, { call, put, select }) {
      const res = yield call(request, { fnName: 'tenant_dealer_categories', params: payload });
      const { serviceDataInfo, brandCategoryDropList } = yield select(state => state.client_service_data_list);
      if(res.code === 0) {
        yield put({
          type: 'saveServiceInfo',
          payload: {
            ...serviceDataInfo,
            ten_brand_categories: res.data.map(v => {
              const find = brandCategoryDropList.find(s => s.brand_category_id === v.brand_category_id) || {};
              return {
                brand_category_name: find.brand_category_name,
                ...v,
              };
            })
          }
        });
      } else {
        msg(res);
      }
    },

    // 更新增值服务
    *fetchTenantCategoryServiceUpdate({ payload }, { call, put, select }) {
      const { data, callback} = payload;
      const res = yield call(request, { fnName: 'tenant_category_service_update', data });
      if(res.code === 0) {
        callback();
      } else {
        msg(res);
      }
    },

    // 更新商户行业码补充服务的品牌
    *fetchTenantCategoryServiceIndus({ payload, cate, serv }, { call, put, select }) {
      const { serviceDataInfo } = yield select(state => state.client_service_data_list);
      const res = yield call(request, { fnName: 'tenant_category_service_indus', data: payload });
      if (res.code === 0) {
        // 更新状态
        yield put({
          type: 'saveServiceInfo',
          payload: {
            ...serviceDataInfo,
            ten_brand_categories: serviceDataInfo.ten_brand_categories.map(_cate => {
              return _cate.brand_category_id === cate.brand_category_id ? {
                ..._cate, ten_category_services: _cate.ten_category_services.map(_serv => {
                  return serv.ten_category_serv_id === _serv.ten_category_serv_id ? {
                    ..._serv,
                    category_serv_extend: _serv.category_serv_extend.map(_indus_brand => {
                      return _indus_brand.indus_brand_id === payload.indus_brand_id ? { ..._indus_brand, selected: payload.selected } : _indus_brand;
                    })
                  } : _serv;
                })
              } : _cate;
            })
          }
        });
      } else {
        msg(res);
      }
    },

    // 数据服务品类编辑（代理经销）
    *fetchDealerCategoryUpdate({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'dealer_category_update',
        data: payload
      });
      if(res.code === 0) {
        callback();
      } else {
        msg(res);
      }
    },

  },
  reducers: {
    // 保存数据查询服务列表
    saveServiceDataList(state, { payload }) {
      return payload ? { ...state, serviceDataList: payload } : { ...state, serviceDataList: emptyObjectList };
    },
    // 保存筛选条件参数
    saveSearchFields(state, { payload }) {
      return payload ? { ...state, searchFields: payload } : { ...state, searchFields: emptyFields };
    },
    // 保存数据查询服务信息
    saveServiceInfo(state, { payload }) {
      return payload ? { ...state, serviceDataInfo: payload } : { ...state, serviceDataInfo: emptyObject };
    },
    // 保存品牌件品类列表【开通品类下拉】
    saveBrandCategoryDropList(state, { payload }) {
      return payload ? { ...state, brandCategoryDropList: payload } : { ...state, brandCategoryDropList: emptyArray };
    }
  },
  subscriptions: {

  }
};
