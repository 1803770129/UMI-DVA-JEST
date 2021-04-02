import { request } from '@/utils/http';

export default {
  namespace: 'main',

  state: {
    collapsed: false
  },

  effects: {
    *loginOut({ payload }, { call, put }) {
      yield call(request, { fnName: 'loginOut'});
    }
  },

  reducers: {
    changeMainLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload
      };
    }
  },

  subscriptions: {

  }
};
