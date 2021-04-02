import { request } from '@/utils/http';
import msg from '@/utils/msg';

const emptyFmsCategoriesList = {
  list: [],
  count: 0
};
const emptyArray = [];
const emptyFields = {
  page: 1,
  perpage: 10,
  fms_brand_id: undefined,
  fms_category_id: undefined
};

export default {
  namespace: 'fms_category_list',

  state: {
    cachedIndexFlag: false,                                     // 是否已完成初始化标识
    fmsBrandsDropList: emptyArray,                              // 品牌下拉列表数据
    fmsCategoriesDropList: emptyArray,                          // 品类下拉列表数据
    fmsCategoriesList: emptyFmsCategoriesList,                  // 品类列表数据
    searchFields: emptyFields                                   // 品类列表查询参数
  },

  effects: {
    // 页面初始化
    *fetchPageInit({ payload }, { call, put, select }) {
      // 1、获取大厂品牌下拉列表
      const res = yield call(request, { fnName: 'fms_brands' });
      if(res.data.list.length === 0) return;
      // 1.1、保存大厂品牌下拉列表数据
      yield put({ type: 'saveFmsBrandsDropList', payload: res.data.list });
      const { searchFields } = yield select(state => state.fms_category_list);
      // 2、获取大厂品类列表数据
      yield put({ type: 'fetchFmsCategoriesList', payload: searchFields });
      // 3、标识已完成初始化
      yield put({ type: 'updateCachedIndexFlag', payload: true });
    },
    // 获取大厂品类列表数据
    *fetchFmsCategoriesList({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'fms_categories',
        params: {
          page: payload.page,
          perpage: payload.perpage,
          fms_brand_id: payload.fms_brand_id,
          fms_category_id: payload.fms_category_id
        }
      });

      if(res.code === 0) {
        yield put({ type: 'saveFmsCategoriesList', payload: res.data });
        const { searchFields } = yield select(state => state.fms_category_list);
        yield put({
          type: 'saveFmsCategoriesParamsFn',
          payload: {
            ...searchFields,
            page: payload.page,
            perpage: payload.perpage,
            fms_brand_id: payload.fms_brand_id,
            fms_category_id: payload.fms_category_id
          }
        });
      } else {
        msg(res);
      }
    },
    // 获取大厂品牌下拉列表
    *fetchFmsBrandsDropList({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'fms_brands' });
      if(res.code === 0) {
        yield put({ type: 'saveFmsBrandsDropList', payload: res.data.list });
        yield put({ type: 'fetchFmsCategoriesDropList', payload: { fms_brand_id: res.data.list[0].fms_brand_id } });
      } else {
        msg(res);
      }
    },
    // 获取大厂品类下拉列表
    *fetchFmsCategoriesDropList({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'fms_categories',
        params: { fms_brand_id: payload.fms_brand_id }
      });
      if(res.code === 0) {
        yield put({ type: 'saveFmsCategoriesDropList', payload: res.data.list });
        // 抓取成功后，更新model值
        const { searchFields } = yield select(state => state.fms_category_list);
        yield put({ type: 'saveFmsCategoriesParamsFn', payload: {...searchFields, fms_brand_id: payload.fms_brand_id} });
      } else {
        msg(res);
      }
    },
    // 更新大厂品类状态
    *updateCategoryStatus({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'fms_categories_update',
        data: {
          fms_category_id: payload.fms_category_id,
          fms_category_status: payload.fms_category_status
        }
      });
      if(res.code === 0) {
        msg('更新成功');
        const { fmsCategoriesList } = yield select(state => state.fms_category_list);
        // 手动更新列表状态
        let newList = fmsCategoriesList.list.map(item => {
          let status = '';
          let newParts = [];
          if(item.fms_category_id == payload.fms_category_id) {
            status = payload.fms_category_status;
            newParts = [...item.parts];
            newParts.forEach(itm => {
              itm.fms_part_status = payload.fms_category_status;
            });
          }
          return status ? {...item, fms_category_status: status, parts: newParts} : item;
        });
        yield put({ type: 'saveFmsCategoriesList', payload: {...fmsCategoriesList, list: newList} });
      } else {
        msg(res);
      }
    },
    // 更新大厂产品状态
    *updatePartStatus({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'fms_parts_update',
        data: {
          fms_part_id: payload.fms_part_id,
          fms_part_status: payload.fms_part_status
        }
      });
      if(res.code === 0) {
        msg('更新成功');
        const { fmsCategoriesList } = yield select(state => state.fms_category_list);
        // 手动更新列表状态
        let newList = fmsCategoriesList.list.map(item => {
          let newParts = [...item.parts];
          if(item.fms_category_id == payload.fms_category_id) {
            for(let i = 0; i < item.parts.length; i++) {
              if(item.parts[i].fms_part_id == payload.fms_part_id) {
                newParts[i].fms_part_status = payload.fms_part_status;
                break;
              }
            }
          }
          return {...item, parts: newParts};
        });
        yield put({ type: 'saveFmsCategoriesList', payload: {...fmsCategoriesList, list: newList} });
      } else {
        msg(res);
      }
    }
  },

  reducers: {
    // 保存品类列表数据
    saveFmsCategoriesList(state, { payload }) {
      return payload ? { ...state, fmsCategoriesList: payload } : { ...state, fmsCategoriesList: emptyFmsCategoriesList };
    },
    // 保存大厂品牌下拉列表数据
    saveFmsBrandsDropList(state, { payload }) {
      return payload ? { ...state, fmsBrandsDropList: payload } : { ...state, fmsBrandsDropList: emptyArray };
    },
    // 保存大厂品类下拉列表数据
    saveFmsCategoriesDropList(state, { payload }) {
      return payload ? { ...state, fmsCategoriesDropList: payload } : { ...state, fmsCategoriesDropList: emptyArray };
    },
    // 保存品类列表查询参数
    saveFmsCategoriesParamsFn(state, { payload }) {
      return payload ? { ...state, searchFields: payload } : { ...state, searchFields: emptyFields };
    },
    // 更新首页接口缓存标识
    updateCachedIndexFlag(state, { payload }) {
      return { ...state, cachedIndexFlag: payload };
    }
  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname }, action) => {
        // 离开页面，清空缓存
        if(pathname.indexOf('factorycode/part') == -1 && pathname.indexOf('factorycode/category') == -1) {
          const types = [
            'saveFmsCategoriesList',
            'saveFmsBrandsDropList',
            'saveFmsCategoriesDropList',
            'saveFmsCategoriesParamsFn',
            'updateCachedIndexFlag'
          ];
          types.forEach(type => dispatch({type: type}));
        }
      });
    }
  }
};
