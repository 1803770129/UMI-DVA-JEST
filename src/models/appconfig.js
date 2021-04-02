import { request } from '@/utils/http';
import msg from '@/utils/msg';
export default {
  namespace: 'appconfig',
  state: {

    CONFIGDATA:[]
  },
  effects: {
    // 
    *fetchAppconfig({payload},{call,put}){
      const res= yield call(request, {
        fnName: 'market_app_config',
        params:payload
      });
      if (res.code === 0) {
        yield put({
          type: 'updateAppconfig',
          payload: res.data,
        });
      }else{
        msg(res);
        yield put({
          type: 'updateAppconfig',
        });
      }
    }
    
  },
  reducers: {

    updateAppconfig(state, { payload }) {
      return { ...state, CONFIGDATA: payload };
    },
  
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
