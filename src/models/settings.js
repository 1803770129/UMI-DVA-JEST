import { request } from '@/utils/http';
import msg from '@/utils/msg';
const emptyArr = [];

export default {

  namespace: 'settings',

  state: {
    STD_SKU_CONFIG: emptyArr
  },

  effects: {
    // 获取标准码config
    *fetchStdskuConfigGet({ payload }, { call, put }) {
      const res = yield call(request, { 
        fnName: 'stdsku_config_get', 
        params: payload
      });
      if(res.code === 0) {
        yield put({
          type: 'updateStdskuConfig',
          payload: res.data
        });
      } else {
        msg(res);
      }
    },
    // 更改标准码config
    *fetchStdskuConfigPost({ payload }, { call, put }) {
      const res = yield call(request, { 
        fnName: 'stdsku_config_post', 
        data: payload
      });
      if(res.code === 0) {
        msg('更新成功');
      } else {
        msg(res);
      }
    }
  },

  reducers: {
    updateStdskuConfig(state, { payload }) {
      return payload ? { ...state, STD_SKU_CONFIG: payload } : { ...state, STD_SKU_CONFIG: emptyArr };
    },
  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname }, action) => {
        // OE列表初始化
        const _pName = pathname.toLowerCase();
        if(_pName.indexOf('/settings') === 0) {
          dispatch({
            type: 'fetchStdskuConfigGet'
          });
        }
      });
    }
  }
};