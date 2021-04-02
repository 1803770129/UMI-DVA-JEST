import { request } from '@/utils/http';
import msg from '@/utils/msg';
const emptyArr = [];
const emptyFields = {
  page: 1,
  perpage: 10
};
const emptyCommercialList = {
  count: 0,
  models: [],
};
const emptyArray = [];
export default {
  namespace: 'commercial',
  state:{
    BRAND_FAC_MOD_APPROVED_LIST: emptyArr,
    carmodelList: emptyArray,
    COMMPAGES:emptyFields,
    COMMERCIALLIST:emptyCommercialList
  },
  effects:{
    // 获取商用车品牌主机厂
    *fetchBrandFacModList({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'liyang_cms_total_commercial_brand_fac_mod' });
      if(res.code === 0) {
        yield put({ type: 'savebrandfacmodlist', payload: res.data });
      } else {
        msg(res);
      }
    },
    // 力洋商用车数据数据进入待标准化表
    *fetchToReviewList({data},{call,put,select}){
      const res = yield call(request, {
        fnName: 'liyang_cms_total_commercial_format',
        data: data
      });
      if (res.code === 0) {
        const {COMMPAGES} = yield select(state=>state.commercial);
        yield put({
          type: 'fetchCommercialList',
          payload:COMMPAGES
        });
        yield put({
          type: 'updateCommercialList'
        });
      } else {
        msg(res);
      }
    },
    // 获取liyang商用车型数据
    *fetchCommercialList({payload},{  put , call }) {
      let params = {
        page: payload.page,
        perpage: payload.perpage
      };
      const res = yield call(request, {
        fnName: 'liyang_cms_commercial',
        params:payload
      });

      if (res.code === 0) {
        yield put({
          type: 'updateCommercialList',
          payload: res.data,
        });
        yield put({ type: 'savePages', payload: params });

      }else{
        msg(res);
        yield put({
          type: 'updateCommercialList',
        });
      }
    },
  },
  reducers:{
    savebrandfacmodlist(state, { payload }) {
      // 增加label字段
      const loop = list => {
        return list.map(item => {
          return item.c ? {...item, label: item.v, c: loop(item.c)} : {...item, label: item.v};
        });
      };
      return { ...state, carmodelList: loop(payload) };
    },
    updateCommercialList(state, { payload }) {
      return { ...state, COMMERCIALLIST: payload || emptyCommercialList };
    },
    savePages(state, { payload }) {
      return payload ? { ...state, COMMPAGES: payload } : { ...state, COMMPAGES: emptyFields };
    },
    updateState(state, action) {
      let props = action.payload;
      return {
        ...state,
        ...props
      };
    },
  }
};
