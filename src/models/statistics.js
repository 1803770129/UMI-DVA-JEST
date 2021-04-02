import { request } from '@/utils/http';
import msg from '@/utils/msg';
// import router from 'umi/router';
const emptyFields = {
  page: 1,
  pageCount: 10
};
const emptyBrandList = {
  count: 0,
  tenBrands: [],
};
const emptyPartList=[];
export default {
  namespace: 'statistics',
  state: {
    SBRANDLIST:emptyBrandList, // 商户品牌数据列表
    PARTLIST:emptyPartList, //端口列表
    SBRANDPAGE:emptyFields, // 商户品牌数据列表分页
    PERIODLIST:[], // 流量数据列表
    STRENDlIST:[], //品牌详细数据列表
    LASTTRENDLIST:[]  // 端口趋势列表
  },
  effects: {
    // 获取端口列表
    *fetchPartList({payload},{put,call}){
      const res=yield call(request,{
        fnName:'statistics_overall',
        params:payload
      });
      if(res.code===0){
        yield put ({
          type:'updatePartList',
          payload:res.data
        });
      }else{
        msg(res);
        yield put({
          type:'updatePartList'
        });
      }
    },
    // 获取商户数据列表
    *fetchSBrandList({payload},{  put , call }) {
      let params = {
        page: payload.page,
        pageCount: payload.pageCount
      };
      const res = yield call(request, {
        fnName: 'statistics_ten_brand',
        params:payload
      });

      if (res.code === 0) {
        yield put({
          type: 'updateSbrandList',
          payload: res.data,
        });
        yield put({ type: 'savePages', payload: params });

      }else{
        msg(res);
        yield put({
          type: 'updateSbrandList',
        });
      }
    },
    // 获取流量列表
    // statistics_last_period
    *fetchLastPeriod({payload},{put,call}){
      const res=yield call(request,{
        fnName:'statistics_last_period',
        params:payload
      });
      if(res.code===0){
        yield put ({
          type:'updatehLastPeriod',
          payload:res.data
        });
      }else{
        msg(res);
        yield put({
          type:'updatehLastPeriod'
        });
      }
    },
    // 获取品牌详细数据列表
    *fetchBrandTrend({payload},{put,call}){
      const res=yield call(request,{
        fnName:'statistics_brand_trend',
        params:payload
      });
      if(res.code===0){
        yield put ({
          type:'updateBrandTrend',
          payload:res.data
        });
      }else{
        msg(res);
        yield put({
          type:'updateBrandTrend'
        });
      }
    },
    // statistics_last_trend 获取端口趋势数据
    *fetchLastTrendList({payload},{put,call}){
      const res=yield call(request,{
        fnName:'statistics_last_trend',
        params:payload
      });
      if(res.code===0){
        yield put ({
          type:'updateLastTrend',
          payload:res.data
        });
      }else{
        msg(res);
        yield put({
          type:'updateLastTrend'
        });
      }
    },
  },

  reducers: {
    updateSbrandList(state, { payload }) {
      return { ...state, SBRANDLIST: payload || emptyBrandList };
    },
    updatePartList(state, { payload }) {
      return { ...state, PARTLIST: payload || emptyPartList };
    },
    updatehLastPeriod(state, { payload }) {
      return { ...state, PERIODLIST: payload || [] };
    },
    updateBrandTrend(state, { payload }) {
      return { ...state, STRENDlIST: payload || [] };
    },
    updateLastTrend(state, { payload }) {
      return { ...state, LASTTRENDLIST: payload || [] };
    },
    savePages(state, { payload }) {
      return payload ? { ...state, SBRANDPAGE: payload } : { ...state, SBRANDPAGE: emptyFields };
    },
    clearState(state) {
      return {
        ...state,
        CHECKLABELLIST:[]
      };
    }
  },
  subscriptions: {

  },
};
