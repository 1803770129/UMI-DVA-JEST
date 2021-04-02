import { request } from '@/utils/http';
import { isEmpty, clearState } from '@/utils/tools';
import msg from '@/utils/msg';
import qs from 'querystringify';
import shallowequal from 'shallowequal';

const emptyData = {
  api: '',
  data: []
};
const emptyCarmodels = {
  api: '',
  data: [],
  count: 0
};

const emptyFields = {
  page: 1,
  perpage: 10
};


const emptyArr = [];
const emptySArr = [];
const emptyObj = {};

export default {
  namespace: 'oe_cmcover',

  state: {
    BRAND_FAC_MOD_APPROVED_LIST: emptyArr,
    CATEGORY_TREE: emptyArr,
    CARMODEL_PRO_LIST: emptyArr,
    OEM_COVER: emptyData,
    OEM_COVER_CARMODELS: emptyCarmodels,
    FIELDS: emptyFields,
    CURRENT_CM_BRAND: emptyObj,
    OEM_COVER_PARTSKUS: emptyArr,
    OEM_COVER_PARTSKUS_SEARCH: emptyArr,
    CARMODEL_PROPERTIES: emptyArr,
    CATEGORY_PROS: emptyArr,
    CACHE_CATEGORY_ID: '-1',
    SELECTLIST:emptySArr
  },

  effects: {
    // 获取品牌主机厂车型（审核通过）
    *fetchBrandFacModListApproved({ payload }, { call, put, select }) {
      const data = yield select(state => state.oe_cmcover.BRAND_FAC_MOD_APPROVED_LIST);
      if (data.length === 0) {
        const res = yield call(request, { fnName: 'carmodel_brand_fac_mod_list_approved' });
        if (res.code === 0) {
          // 增加label字段
          const loop = list => {
            return list.map(item => {
              return item.c ? { ...item, l: item.v, c: loop(item.c) } : { ...item, l: item.v };
            });
          };
          yield put({ type: 'updateBrandfacmodapprovedlist', payload: loop(res.data) });
        } else {
          msg(res);
          yield put({ type: 'updateBrandfacmodapprovedlist' });
        }
      }
    },

    // 零件数-根据品类名称获取品类树
    *fetchCategoryTree({ payload }, { call, put, select }) {
      const data = yield select(state => state.oe_cmcover.CATEGORY_TREE);
      if (data.length === 0) {
        const res = yield call(request, {
          fnName: 'category_tree',
          params: payload
        });
        if (res.code === 0) {
          yield put({
            type: 'updateCategoryTree',
            payload: res.data
          });
        } else {
          msg(res);
          yield put({ type: 'updateCategoryTree' });
        }
      }
    },

    // OE&车型品牌覆盖率
    *fetchOemCover({ payload, isInit }, { call, put, select }) {
      const { FIELDS } = yield select(state => state.oe_cmcover);
      const data = yield select(state => state.oe_cmcover.OEM_COVER);
      const api = qs.stringify(payload);
      let params = { ...payload };
      if (data.api !== api || isInit) {
        if (isInit) {
          if (FIELDS.category_id) {
            params.category_id = FIELDS.category_id;
          }
        } else {
          // 非排序状态，需要重置数据
          if (isEmpty(payload.order_flag)) {
            // 清空车型列表
            yield put({
              type: 'updateOemCoverCarmodels'
            });
            // 清空表单数据
            yield put({
              type: 'updateFields'
            });
          }
        }
        if (params.category_id === '-1' || !params.category_id) {
          return false;
        }

        // 当前页面选择产品，需要重置分页为第一页
        // if(payload.category_id !== '-1' && payload.category_id !== undefined) {
        //   params.category_id = payload.category_id;
        // }

        const res = yield call(request, {
          fnName: 'oem_cover',
          params
        });
        if (res.code === 0) {
          yield put({
            type: 'updateOemCover',
            payload: { api, data: res.data }
          });
          // yield put({
          //   type: 'fetchCarmodelProperties',
          //   payload: { category_id: params.category_id }
          // });
          // yield put({
          //   type: 'fetchCategoryPros',
          //   payload: { category_id: params.category_id }
          // });
        } else {
          msg(res);
          yield put({ type: 'updateOemCover' });
        }
      }
    },
    *fetchOemCoverChange({ payload, isInit }, { call, put, select }) {
      const { FIELDS } = yield select(state => state.oe_cmcover);
      const data = yield select(state => state.oe_cmcover.OEM_COVER);
      const api = qs.stringify(payload);
      let params = { ...payload };
      if (data.api !== api || isInit) {
        if (isInit) {
          if (FIELDS.category_id) {
            params.category_id = FIELDS.category_id;
          }
        } else {
          // 非排序状态，需要重置数据
          if (isEmpty(payload.order_flag)) {
            // 清空车型列表
            yield put({
              type: 'updateOemCoverCarmodels'
            });
            // 清空表单数据
            // yield put({
            //   type: 'updateFields'
            // });
          }
        }
        if (params.category_id === '-1' || !params.category_id) {
          return false;
        }

        // 当前页面选择产品，需要重置分页为第一页
        if(payload.category_id !== '-1' && payload.category_id !== undefined) {
          params.category_id = payload.category_id;
        }

        const res = yield call(request, {
          fnName: 'oem_cover',
          params
        });
        if (res.code === 0) {
          yield put({
            type: 'updateOemCover',
            payload: { api, data: res.data }
          });
          yield put({
            type: 'fetchCarmodelProperties',
            payload: { category_id: params.category_id }
          });
          yield put({
            type: 'fetchCategoryPros',
            payload: { category_id: params.category_id }
          });
        } else {
          msg(res);
          yield put({ type: 'updateOemCover' });
        }
      }
    },
    *fetchOemCoverFromCategory({ payload, isInit ,callback }, { call, put, select }) {
      const { FIELDS } = yield select(state => state.oe_cmcover);
      const data = yield select(state => state.oe_cmcover.OEM_COVER);
      const api = qs.stringify(payload);
      let params = { ...payload };
      if (data.api !== api || isInit) {
        if (isInit) {
          if (FIELDS.category_id) {
            params.category_id = FIELDS.category_id;
          }
        } else {
          // 非排序状态，需要重置数据
          if (isEmpty(payload.order_flag)) {
            // 清空车型列表
            yield put({
              type: 'updateOemCoverCarmodels'
            });
            // 清空表单数据
            // yield put({
            //   type: 'updateFields'
            // });
          }
        }
        if (params.category_id === '-1' || !params.category_id) {
          return false;
        }

        // 当前页面选择产品，需要重置分页为第一页
        if(payload.category_id !== '-1' && payload.category_id !== undefined) {
          params.category_id = payload.category_id;
        }

        const res = yield call(request, {
          fnName: 'oem_cover',
          params
        });
        if (res.code === 0) {
          callback(res.data)
          yield put({
            type: 'updateOemCover',
            payload: { api, data: res.data }
          });
          yield put({
            type: 'fetchCarmodelProperties',
            payload: { category_id: params.category_id }
          });
          yield put({
            type: 'fetchCategoryPros',
            payload: { category_id: params.category_id }
          });
        } else {
          msg(res);
          yield put({ type: 'updateOemCover' });
        }
      }
    },

    // OE覆盖车型列表
    *fetchOemCoverCarmodels({ payload = {}, isInit }, { call, put, select }) {
      const { FIELDS } = yield select(state => state.oe_cmcover);
      // payload如果没有传递params，取缓存参数
      const { params = {}, currentCmBrand = {} } = payload;
      const data = yield select(state => state.oe_cmcover.OEM_COVER);
      const api = qs.stringify(payload);
      let _params = { ...params };
      if (data.api !== api || isInit) {
        let fields = {};
        if (isInit) {
          _params = { ..._params, ...FIELDS };
          // 当前页面选择产品，需要重置分页为第一页
          // if(params.category_id !== '-1' && params.category_id !== undefined) {
          //   _params = { ..._params, ...emptyFields, category_id: params.category_id};
          // }
        }
        for (const key in _params) {
          const el = _params[key];
          const excludes = ['brand_fac_mod'];
          if (!excludes.includes(key) && !isEmpty(el)) {
            fields[key] = el;
          }
        }
        const { brand_fac_mod = [] } = _params;
        if (brand_fac_mod[1]) {
          fields.cm_factory = brand_fac_mod[1];
        }
        if (brand_fac_mod[2]) {
          fields.cm_model = brand_fac_mod[2];
        }
        if (fields.category_id === '-1' || !fields.category_id) {
          return false;
        }
        const res = yield call(request, {
          fnName: 'oem_cover_carmodels',
          params: fields
        });
        if (res.code === 0) {
          yield put({
            type: 'updateOemCoverCarmodels',
            payload: { api, data: res.data, count: res.count }
          });
          // 缓存表单数据
          yield put({
            type: 'updateFields',
            payload: _params
          });
          // 获取当前选择品牌
          const { CURRENT_CM_BRAND } = yield select(state => state.oe_cmcover);
          yield put({
            type: 'updateCurrentCmBrand',
            payload: { ...CURRENT_CM_BRAND, ...currentCmBrand }
          });
        } else {
          msg(res);
          yield put({ type: 'updateOemCoverCarmodels' });
        }
      }
    },
    // 获取车型关键属性
    *fetchCarmodelProperties({ payload }, { call, put, select }) {
      const res = yield call(request, { fnName: 'carmodel_properties', params: payload });
      if (res.code === 0) {
        yield put({
          type: 'updateCarmodelProperties',
          payload: res.data
        });
      } else {
        yield put({ type: 'updateCarmodelProperties' });
        msg(res);
      }
    },

    // 品类属性
    *fetchCategoryPros({ payload }, { call, put, select }) {
      const res = yield call(request, { fnName: 'category_pros', params: payload });
      if (res.code === 0) {
        yield put({
          type: 'updateCategoryPros',
          payload: res.data
        });
      } else {
        yield put({ type: 'updateCategoryPros' });
        msg(res);
      }
    },

    // 车型匹配OE列表
    *fetchOemCoverPartskus({ payload }, { call, put, select }) {
      const res = yield call(request, { fnName: 'oem_cover_partskus', params: payload });
      if (res.code === 0) {
        const { CATEGORY_PROS } = yield select(state => state.oe_cmcover);
        yield put({
          type: 'updateOemCoverPartskus',
          payload: res.data.map(v => {
            return {
              ...v,
              oem_partsku_values: formatOemPartskuValues(v, CATEGORY_PROS)
            };
          })
        });
      } else {
        yield put({ type: 'updateOemCoverPartskus' });
        msg(res);
      }
    },
    // 编码关键字搜索OE配件
    *fetchOemCoverPartskusSearch({ payload }, { call, put, select }) {
      const res = yield call(request, { fnName: 'oem_cover_partskus_search', params: payload });
      if (res.code === 0) {
        const { CATEGORY_PROS, OEM_COVER_PARTSKUS } = yield select(state => state.oe_cmcover);
        yield put({
          type: 'updateOemCoverPartskusSearch',
          payload: res.data.map(v => {
            return {
              ...v,
              isDis: OEM_COVER_PARTSKUS.some(p => p.oem_partsku_id === v.oem_partsku_id),
              oem_partsku_values: formatOemPartskuValues(v, CATEGORY_PROS)
            };
          })
        });
      } else {
        yield put({ type: 'updateOemCoverPartskusSearch' });
        msg(res);
      }
    },
    // 修改车型关联OE
    *fetchOemCoverPartskusPost({ payload, callback }, { call, put, select }) {
      const res = yield call(request, { fnName: 'oem_cover_partskus_post', data: payload });
      if (res.code === 0) {
        callback();
      } else {
        msg(res);
      }
    }



  },

  reducers: {
    updateOemCover(state, { payload }) {
      return payload ? { ...state, OEM_COVER: payload } : { ...state, OEM_COVER: emptyData };
    },
    updateOemCoverCarmodels(state, { payload }) {
      return payload ? { ...state, OEM_COVER_CARMODELS: payload } : { ...state, OEM_COVER_CARMODELS: emptyCarmodels };
    },
    updateBrandfacmodapprovedlist(state, { payload }) {
      return payload ? { ...state, BRAND_FAC_MOD_APPROVED_LIST: payload } : { ...state, BRAND_FAC_MOD_APPROVED_LIST: emptyArr };
    },
    updateCategoryTree(state, { payload }) {
      return payload ? { ...state, CATEGORY_TREE: payload } : { ...state, CATEGORY_TREE: emptyArr };
    },
    updateFields(state, { payload }) {
      return payload ? { ...state, FIELDS: payload } : { ...state, FIELDS: emptyFields };
    },
    updateCurrentCmBrand(state, { payload }) {
      return payload ? { ...state, CURRENT_CM_BRAND: payload } : { ...state, CURRENT_CM_BRAND: emptyObj };
    },
    updateOemCoverPartskus(state, { payload }) {
      return payload ? { ...state, OEM_COVER_PARTSKUS: payload } : { ...state, OEM_COVER_PARTSKUS: emptyArr };
    },
    updateOemCoverPartskusSearch(state, { payload }) {
      return payload ? { ...state, OEM_COVER_PARTSKUS_SEARCH: payload } : { ...state, OEM_COVER_PARTSKUS_SEARCH: emptyArr };
    },
    updateCarmodelProperties(state, { payload }) {
      return payload ? { ...state, CARMODEL_PROPERTIES: payload } : { ...state, CARMODEL_PROPERTIES: emptyArr };
    },
    updateCategoryPros(state, { payload }) {
      return payload ? { ...state, CATEGORY_PROS: payload } : { ...state, CATEGORY_PROS: emptyArr };
    },
    updateCacheCategoryId(state, { payload }) {
      return { ...state, CACHE_CATEGORY_ID: payload || '-1' };
    },
    updateSelect(state,{payload}){
      return {...state ,SELECTLIST:payload || emptySArr };

    },
  },

  subscriptions: {
    // setup({ history, dispatch }) {
    //   return history.listen((location, action) => {
    //     const clearFn = (excludes = []) => {
    //       let _excludes = [...excludes, 'updateFields'];
    //       let reducers = {};
    //       for (let i = 0; i < window.g_app._models.length; i++) {
    //         const el = window.g_app._models[i];
    //         if (el.namespace === 'oe_cmcover') {
    //           reducers = el.reducers;
    //           break;
    //         }
    //       }
    //       const types = Object.keys(reducers).map(v => v.replace('oe_cmcover/', '')).filter(v => !_excludes.includes(v));
    //       // 清空model
    //       for (let i = 0; i < types.length; i++) {
    //         const type = types[i];
    //         dispatch({ type });
    //       }
    //     };
    //     const { pathname } = location;
    //     // 初始化
    //     if (pathname.indexOf('/oe/cmcover') > -1) {
    //       const arr = pathname.split('/');
    //       let category_id = arr[arr.length - 1];
    //       if(category_id === '-1') {
    //         category_id = window.g_app._store.getState().oe_cmcover.CACHE_CATEGORY_ID;
    //       }
    //       const types = [{
    //         type: 'fetchCategoryTree',
    //         payload: 'norequire'
    //       }, {
    //         type: 'fetchBrandFacModListApproved',
    //         payload: 'norequire'
    //       }];
    //       for (let i = 0; i < types.length; i++) {
    //         const type = types[i];
    //         dispatch(type);
    //       }
    //       if (category_id === '-1' || !category_id) {
    //         // 如果返回-1，只保留产品品类树数据
    //         clearFn(['updateCategoryTree']);
    //       };
    //       dispatch({
    //         type: 'fetchOemCover',
    //         payload: { category_id },
    //         isInit: true
    //       });
    //       dispatch({
    //         type: 'fetchOemCoverCarmodels',
    //         payload: {
    //           params: {
    //             category_id,
    //             ...emptyFields
    //           }
    //         },
    //         isInit: true
    //       });
    //     } else {
    //       clearFn();
    //     }
    //   });
    // }
  }
};

function formatOemPartskuValues(item, CATEGORY_PROS) {
  return item.oem_partsku_values.map(v => {
    const addVal = CATEGORY_PROS.filter(fil => fil.category_pro_id === v.category_pro_id);
    const obj = addVal.length > 0 ? { ...addVal[0], ...v } : v;
    return obj;
  });
}
