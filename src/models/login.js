import { request } from '@/utils/http';
import msg from '@/utils/msg';
import router from 'umi/router';

export default {
  namespace: 'login',

  state: {

  },

  effects: {
    *fetchLogin({ payload: data }, { call, put }) {
      return yield call(request, { fnName: 'login', data });
    },
    /** 修改密码 */
    *fetchUpdatePassword({ payload: data }, { call, put }) {
      const res = yield call(request, { fnName: 'manager_updatePassword', data });
      if(res.code === 0) {
        msg('密码修改成功');
        localStorage.clear();
        window.location.replace('/#/login');
      }else{
        msg(res.msg);
      }
    }
  },

  reducers: {

  },

  subscriptions: {

  }
};
