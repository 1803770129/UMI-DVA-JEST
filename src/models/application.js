import { request } from '@/utils/http';
import msg from '@/utils/msg';
import router from 'umi/router';
import {message} from 'antd';
const emptyModal=[]
export default {
  namespace: 'application',
  state: {
    MODALDATA:emptyModal
  },
  effects: {
    // 应用列表
    *fetchAppmanagerList({payload},{  put , call }) {
      let params = {
        page: payload.page,
        pageCount: payload.perpage
      };
      const res = yield call(request, {
        fnName: 'market_get_apps',
        params:payload
      });

      if (res.code === 0) {
        yield put({
          type: 'updateAppmanagerList1',
          payload: res.data,
        });
        yield put({ type: 'savepages', payload: params });

      }else{
        msg(res);
        yield put({
          type: 'updateAppmanagerList1',
        });
      }
    },
  },

  reducers: {
    // 缓存应用配置列表
    updateModalData(state, { payload }) {
      return { ...state, MODALDATA: payload };
    },
    // 清空配置列表缓存
    clearModalData(state) {
      return {
        ...state,
        MODALDATA:[]
      };
    },
    clearCheck(state) {
      return {
        ...state,
        APPMANAGERLIST:{
          count: 0,
          apps: [],
          check:{}
        }
      };
    }
  },
  subscriptions: {

  },
};
