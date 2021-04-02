import { request } from '@/utils/http';
import msg from '@/utils/msg';
const emptyOrderfromList = {
  count: 0,
  jobs: [],
};
const emptyOrderFields = {
  page: 1,
  pageCount: 10
};
const emptyJobfromList = {
  count: 0,
  orders: [],
};
const emptyJobFields = {
  page: 1,
  pageCount: 10
};
export default {
  namespace: 'orderform',
  state: {
    ORDERFORMLIST: emptyOrderfromList,
    ORDERFORMPAGES:emptyOrderFields,
    BRANDSARR:[],
    CATEGORYARR:[],
    JOBPAGES:emptyJobFields,
    JOBLIST:emptyJobfromList
  },
  effects: {
    *fetchOrderformList({payload},{  put , call }) {
      const res = yield call(request, {
        fnName: 'market_get_jobs',
        params:payload
      });

      if (res.code === 0) {
        yield put({
          type: 'updateOrderform',
          payload: res.data,
        });
        yield put({ type: 'savePages', payload });
        // callback(res.data);
      }else{
        msg(res);
        yield put({
          type: 'updateOrderform',
        });
      }
    },
    *fetchJobList({payload},{  put , call }) {
      let params = {
        page: payload.page,
        pageCount: payload.pageCount
      };
      const res = yield call(request, {
        fnName: 'market_get_orders',
        params:payload
      });

      if (res.code === 0) {
        yield put({
          type: 'updateJobform',
          payload: res.data,
        });
        yield put({ type: 'savejobpages', payload: params });
      }else{
        msg(res);
        yield put({
          type: 'updateJobform',
        });
      }
    },
    *fetchOrderformBrands({payload},{call,put}){
      const res= yield call(request, {
        fnName: 'market_get_brands',
        params:payload
      });
      if (res.code === 0) {
        yield put({
          type: 'updatebrands',
          payload: res.data,
        });
      }else{
        msg(res);
        yield put({
          type: 'updatebrands',
        });
      }
    },
    *fetchOrderformCategory({payload},{call,put}){
      const res= yield call(request, {
        fnName: 'market_get_ten_categories',
        params:payload
      });
      if (res.code === 0) {
        yield put({
          type: 'updatecategories',
          payload: res.data,
        });
      }else{
        msg(res);
        yield put({
          type: 'updatecategories',
        });
      }
    },
    *fetchOrderfromAccept({data},{call,put,select}){
      const res=yield call(request, {
        fnName: 'market_handjob',
        data: data
      });
      if (res.code === 0) {
        const {ORDERFORMPAGES} = yield select(state=>state.orderform);
        yield put({
          type: 'fetchOrderformList',
          payload:ORDERFORMPAGES
        });
        msg('开通成功');

      } else {
        msg(res);
      }
    },
    *fetchOrderfromDisaccept({payload},{call,put,select}){
      const res=yield call(request, {
        fnName: 'market_handjob_status',
        params: payload
      });
      if (res.code === 0) {
        msg('操作成功');
        const {ORDERFORMPAGES} = yield select(state=>state.orderform);
        yield put({
          type: 'fetchOrderformList',
          payload:ORDERFORMPAGES
        });

      } else {
        msg(res);
      }
    },
    *fetchUserRecorListInsert({data},{call}){
      yield call(request, {
        fnName: 'userRecord',
        data: data
      });
    },
  },
  reducers: {
    updateOrderform(state, { payload }) {
      return { ...state, ORDERFORMLIST: payload  || emptyOrderfromList};
    },
    updateJobform(state, { payload }) {
      return { ...state, JOBLIST: payload  || emptyJobfromList};
    },
    savePages(state, { payload }) {
      return payload ? { ...state, ORDERFORMPAGES: payload } : { ...state, ORDERFORMPAGES: emptyOrderFields };
    },
    savejobpages(state, { payload }) {
      return payload ? { ...state, JOBPAGES : payload } : { ...state, JOBPAGES:emptyJobFields, };
    },
    updatebrands(state, { payload }) {
      return { ...state, BRANDSARR: payload };
    },
    updatecategories(state, { payload }) {
      return { ...state, CATEGORYARR: payload };
    },
    clearState(state) {
      return {
        ...state,
        BRANDSARR:[]
      };
    }
  },
  subscriptions: {
    // setup({ dispatch, history }) {
    //   history.listen(({ pathname }) => {
    //     if (pathname === '/manager/record') {
    //       dispatch({
    //         type: 'fetchUserRecorList',
    //         // payload:{page:1,perpage:10}
    //       });
    //     }
    //   });
    // }
  },
};
