import { request } from '@/utils/http';
import msg from '@/utils/msg';
// import router from 'umi/router';
const emptyFields = {
  page: 1,
  pageCount: 10
};
const emptyUserIpBlockList = {
  count: 0,
  ipList: [],
  selectors:[]
};
const emptyUserFields = {
  page: 1,
  pageCount: 10
};
const emptyUserBlockList = {
  count: 0,
  userList: [],
  selectors:[]
};
export default {
  namespace: 'usermanager',
  state: {
    USERIPBLOCKLIST:emptyUserIpBlockList, // 被封禁IP列表
    IPBLOCKPAGE:emptyFields, // 被封禁IP列表分页
    SELECTORS:[],
    USERBLOCKLIST:emptyUserBlockList, // 被封禁用户列表
    USERBLOCKPAGE:emptyUserFields, // 被封禁用户列表分页
    USERSELECTORS:[]
  },
  effects: {
    // 获取商户数据列表
    *fetchUserIpBlockSelector({payload},{  put , call }) {
      // let params = {
      //   page: payload.page,
      //   pageCount: payload.pageCount
      // };
      const res = yield call(request, {
        fnName: 'user_ip_block_list',
        params:payload
      });

      if (res.code === 0) {
        yield put({
          type: 'updateUserIpBlockSelectors',
          payload: res.data.selectors,
        });
        // yield put({ type: 'savePages', payload: params });

      }else{
        msg(res);
        yield put({
          type: 'updateUserIpBlockSelectors',
        });
      }
    },
    *fetchUserIpBlockList({payload},{  put , call }) {
      let params = {
        page: payload.page,
        pageCount: payload.pageCount
      };
      const res = yield call(request, {
        fnName: 'user_ip_block_list',
        params:payload
      });

      if (res.code === 0) {
        yield put({
          type: 'updateUserIpBlockList',
          payload: res.data,
        });
        yield put({ type: 'savePages', payload: params });

      }else{
        msg(res);
        yield put({
          type: 'updateUserIpBlockList',
        });
      }
    },
    *fetchUserIpUnlock({data},{  put , call ,select}) {
      const res = yield call(request, {
        fnName: 'user_ip_unblock',
        data:data
      });

      if (res.code === 0) {
        const {IPBLOCKPAGE} = yield select(state=>state.usermanager);
        yield put({
          type: 'fetchUserIpBlockList',
          payload:{...IPBLOCKPAGE}
        });
        msg('解封成功');
      }else{
        msg(res);

      }
    },
    // 用户
    *fetchUserBlockSelector({payload},{  put , call }) {
      // let params = {
      //   page: payload.page,
      //   pageCount: payload.pageCount
      // };
      const res = yield call(request, {
        fnName: 'user_plugin_block_list',
        params:payload
      });

      if (res.code === 0) {
        yield put({
          type: 'updateUserSelectors',
          payload: res.data.selectors,
        });
        // yield put({ type: 'savePages', payload: params });

      }else{
        msg(res);
        yield put({
          type: 'updateUserSelectors',
        });
      }
    },
    *fetchUserBlockList({payload},{  put , call }) {
      let params = {
        page: payload.page,
        pageCount: payload.pageCount
      };
      const res = yield call(request, {
        fnName: 'user_plugin_block_list',
        params:payload
      });

      if (res.code === 0) {
        yield put({
          type: 'updateUserBlockList',
          payload: res.data,
        });
        yield put({ type: 'saveUserPages', payload: params });

      }else{
        msg(res);
        yield put({
          type: 'updateUserBlockList',
        });
      }
    },
    *fetchUserUnlock({data},{  put , call ,select}) {
      const res = yield call(request, {
        fnName: 'user_plugin_unblock',
        data:data
      });

      if (res.code === 0) {
        const {USERBLOCKPAGE} = yield select(state=>state.usermanager);
        yield put({
          type: 'fetchUserBlockList',
          payload:{...USERBLOCKPAGE}
        });
        msg('解封成功');
      }else{
        msg(res);

      }
    },

  },

  reducers: {
    updateUserIpBlockList(state, { payload }) {
      return { ...state, USERIPBLOCKLIST: payload || emptyUserIpBlockList };
    },
    updateUserIpBlockSelectors(state, { payload }) {
      return { ...state, SELECTORS: payload || [] };
    },
    savePages(state, { payload }) {
      return payload ? { ...state, IPBLOCKPAGE: payload } : { ...state, IPBLOCKPAGE: emptyFields };
    },
    updateUserBlockList(state, { payload }) {
      return { ...state, USERBLOCKLIST: payload || emptyUserBlockList };
    },
    updateUserSelectors(state, { payload }) {
      return { ...state, USERSELECTORS: payload || [] };
    },
    savePsaveUserPagesages(state, { payload }) {
      return payload ? { ...state, USERBLOCKPAGE: payload } : { ...state, IPBLOCKPAGE: emptyFields };
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
