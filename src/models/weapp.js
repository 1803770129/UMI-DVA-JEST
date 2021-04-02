import { request } from '@/utils/http';
import msg from '@/utils/msg';
import { isEmpty } from '@/utils/tools';

const emptyWeapps= {
  count: 0,
  list: [],
};

const emptySearch = {
};

export default {
  namespace: 'weapp',
  state: {
    WEAPPS: emptyWeapps,
    TEMPLATE_LIST: [],
    FIELDS: emptySearch,
  },
  effects: {
    * fetchWeapps({ payload, callback }, { call, put }) {
      const res = yield call(request, {
        fnName: 'weapps',
        params: payload,
      });
      if (res.code === 0) {
        yield put({
          type: 'rememberSearchData',
          payload: payload,
        });
        yield put({
          type: 'updateWeapps',
          payload: {count: res.count, list: res.data },
        });
        callback(res.data);
      } else {
        msg(res);
        yield put({
          type: 'updateWeapps',
        });
      }
    },

    * managerMpEditionManage({ payload }, { call, put }) {
      const res = yield call(request, {
        fnName: 'weapp_templates',
      });
      if (res.code === 0) {
        yield put({
          type: 'updateManagerMpEditionData',
          payload: res.data,
        });
      } else {
        msg(res);
        yield put({
          type: 'updateManagerMpEditionData',
        });
      }
    },

    * fetchManagerMpPublishWeapp({ payload, callback }, { call, put }) {
      const res = yield call(request, {
        fnName: 'weapp_audit',
        data: payload,
      });
      if (res.code === 0) {
        const { fail_appids = [] } = res.data;
        if(fail_appids.length > 0) {
          msg('发布出现错误，筛选列表查看状态');
        }else{
          msg('操作成功，稍后查看结果');
        }
        callback(res.data);
      } else {
        msg(res);
      }
    },
    * fetchManagerMpBackWeapp({ data, callback }, { call, put }) {
      const res = yield call(request, {
        fnName: 'weapp_revert',
        data: data,
      });
      if (res.code === 0) {
        const { fail_appids = [] } = res.data;
        if(res.data === '没有匹配的小程序') {
          msg('没有匹配的小程序');
        }else if (fail_appids.length > 0) {
          msg('回退出现错误，筛选列表查看状态');
        } else {
          msg('操作成功');
        }
        callback(res.data);
      } else {
        msg(res);
      }
    },
    * fetchWeappAuditUndo({ payload, callback }, { call, put }) {
      const res = yield call(request, {
        fnName: 'weapp_audit_undo',
        data: payload
      });
      if (res.code === 0) {
        const { fail_appids = [] } = res.data;
        if (fail_appids.length > 0) {
          msg('审核撤回出现错误，筛选列表查看状态');
        } else {
          msg('操作成功');
        }
        callback(res.data);
      } else {
        msg(res);
      }
    },
    * managerSetManagerBrand({ data, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'manager_setManagerBrand',
        params: data,
      });
      if (res.code === 0) {
        msg('操作成功');
      } else {
        msg(res);
      }
      callback();
    },
    // 获取小程序码并预览
    * fetchWeappQrcode({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'weapp_qrcode',
        params: payload
      });
      if (res.code === 0) {
        callback(res.data.qrcode);
      } else {
        msg(res);
      }
    },
    // 获取小程序域名
    * fetchWeappDomain({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'weapp_domain',
        params: payload
      });
      if (res.code === 0) {
        callback(res.data);
      } else {
        msg(res);
        callback([]);
      }
    },
    // 设置小程序域名
    * fetchSetWeappDomain({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'weapp_domain_post',
        data: payload
      });
      if (res.code === 0) {
        callback();
      } else {
        msg(res);
      }
    },

    // 设置基础库版本
    * fetchWeappSupportVersion({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'weapp_support_version',
        data: payload
      });
      if (res.code === 0) {
        msg('基础库版本设置成功');
      } else {
        msg(res);
      }
    },


  },
  reducers: {
    updateWeapps(state, { payload }) {
      return { ...state, WEAPPS: payload || emptyWeapps };
    },
    updateManagerMpEditionData(state, { payload }) {
      return { ...state, TEMPLATE_LIST: payload || [] };
    },
    rememberSearchData(state, { payload }) {
      return {
        ...state,
        FIELDS: payload || emptySearch,
      };
    },
    clearState(state, { payload }) {
      return {
        ...state,
        WEAPPS: emptyWeapps,
        TEMPLATE_LIST: [],
        FIELDS: {},
      };
    },
  },
  subscriptions: {},
};
