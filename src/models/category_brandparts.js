import { request, get } from '@/utils/http';
import * as api from '@/services/apiUrl';
import msg from '@/utils/msg';

const emptyFields = {
  brand_category_id: '',
  category_name: ''
};

export default {
  namespace: 'category_brandparts',

  state: {
    brand_category_id: '',                  // 筛选项 - 选择的品牌件id
    category_name: '',                      // 筛选项 - 填写的产品名称
    page: 1,
    perpage: 1,
    brandCategoryList: [],                  // 筛选项 - 品牌件列表数据
    brandCategoryProductList: {             // 品牌件列表结果数据
      list: [],
      count: 0
    },
    fields: emptyFields
  },

  effects: {
    // 初始化
    *fetchListInitFn({ payload }, { call, put }) {
      const promises = [];
      // 获取品牌件品类列表【下拉框】
      promises.push(get(`${api.brand_category_list}`));
      // 获取品牌件列表【表格】
      promises.push(get(`${api.brand_category_product_list}?brand_category_id=${payload.brand_category_id}&category_name=${payload.category_name}&page=${payload.page}&perpage=${payload.perpage}`));
      const ret = yield Promise.all(promises);
      if(ret[0].code === 0) { 
        yield put({ type: 'updateBrandCategoryList', payload:  ret[0].data });
      } else {
        msg(ret[0].msg);
      }
      if(ret[1].code === 0) { 
        yield put({ type: 'updateBrandCategoryProductList', payload: ret[1].data });
      } else {
        msg(ret[1].msg);
      }
      yield put({ type: 'updateBrandCategoryId', payload: payload.brand_category_id });
      yield put({ type: 'updateCategoryName', payload: payload.category_name });
      payload.cb && payload.cb();
    },
    // 获取品牌件产品列表
    *fetchBrandCategoryProductList({ payload }, { call, put }) {
      const res = yield call(request, {
        fnName: 'brand_category_product_list', 
        params: { 
          brand_category_id: payload.brand_category_id,
          category_name: payload.category_name,
          page: payload.page,
          perpage: payload.perpage
        }  
      });
      if(res.code == 0) {
        yield put({ type: 'updateBrandCategoryProductList', payload: res.data });
        yield put({ type: 'updateBrandCategoryId', payload: payload.brand_category_id });
        yield put({ type: 'updateCategoryName', payload: payload.category_name });
        yield put({ type: 'updatePage', payload: { page: payload.page, perpage: payload.perpage } });
      } else {
        msg(res.msg);
      }
      payload.cb && payload.cb();
    },
    // 品牌件状态修改
    *updateBrandCategoryStatus({ payload }, { call, put }) {
      const res = yield call(request, { 
        fnName: 'brand_product_update', 
        data: { 
          brand_category_id: payload.brand_category_id, 
          brand_category_status: payload.brand_category_status 
        }
      });
      payload.cb && payload.cb(res);
    },
    // 品牌件品类删除
    *deleteBrandCategory({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'brand_category_delete', data: payload });
      if(res.code === 0) {
        msg('删除成功');
        payload.cb && payload.cb();
        yield put({ type: 'updateBrandCategoryId', payload: '' });
        yield put({ type: 'updateCategoryName', payload: '' });
      } else {
        msg(res);
      }
    },
  },

  reducers: {
    // 更新品牌件品类列表
    updateBrandCategoryList(state, { payload }) { return { ...state, brandCategoryList: payload }; },
    // 更新品牌件产品列表
    updateBrandCategoryProductList(state, { payload }) { return { ...state, brandCategoryProductList: payload }; },
    // 更新brand_category_id
    updateBrandCategoryId(state, { payload }) { return { ...state, brand_category_id: payload }; },
    // 更新category_name
    updateCategoryName(state, { payload }) { return { ...state, category_name: payload }; },
    // 更新当前页，每页数量
    updatePage(state, { payload }) { return { ...state, page: payload.page, perpage: payload.perpage }; },
    // 更新搜索表单参数
    updateFields(state, { payload }) { return payload ? { ...state, fields: payload } : { ...state, fields: emptyFields }; },
    clearState(state) {
      return {
        ...state,
        brand_category_id: '',
        category_name: '',
        page: 1,
        perpage: 1,
        brandCategoryList: [],
        brandCategoryProductList: {
          list: [],
          count: 0
        },
        fields: emptyFields
      };
    }
  },

  subscriptions: {

  }
};