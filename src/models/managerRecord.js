import { request } from '@/utils/http';
import msg from '@/utils/msg';
const emptyManageruserRecorList = {
  count: 0,
  recorList: [],
};
const emptyFields = {
  page: 1,
  perpage: 10
};
export default {
  namespace: 'managerRecord',
  state: {
    MANAGER_USERRECORLIST: emptyManageruserRecorList,
    PAGES:emptyFields,
    ALLUSERLIST:[]
  },
  effects: {
    // 操作日志列表
    *fetchUserRecorList({payload},{  put , call }) {
      let params = {
        page: payload.page,
        perpage: payload.perpage
      };
      let list = {
        start_time:payload.start_time,
        end_time:payload.end_time,
        user_id:payload.user_id
      };
      const res = yield call(request, {
        fnName: 'userRecorList',
        params:payload
      });

      if (res.code === 0) {
        yield put({
          type: 'updateUserRecorList',
          payload: res.data,
        });
        yield put({ type: 'savepages', payload: params });
        yield put({ type: 'saveSearchFields', payload: list });
        // callback(res.data);
      }else{
        msg(res);
        yield put({
          type: 'updateUserRecorList',
        });
      }
    },
    // 插入操作日志
    *fetchUserRecorListInsert({data},{call}){
      yield call(request, {
        fnName: 'userRecord',
        data: data
      });
    },
    // 获取查询人列表
    *fetchUserRecorListAlluser({payload},{call,put}){
      const res= yield call(request, {
        fnName: 'manager_alluser',
      });
      if (res.code === 0) {
        yield put({
          type: 'updateAlluser',
          payload: res.data,
        });
      }else{
        msg(res);
        yield put({
          type: 'updateAlluser',
        });
      }
    }

  },
  reducers: {
    updateUserRecorList(state, { payload }) {
      return { ...state, MANAGER_USERRECORLIST: payload  || emptyManageruserRecorList};
    },
    updateAlluser(state, { payload }) {
      return { ...state, ALLUSERLIST: payload };
    },
    savePages(state, { payload }) {
      return payload ? { ...state, PAGES: payload } : { ...state, PAGES: emptyFields };
    },
    saveSearchFields(state, { payload }) {
      return payload ? { ...state, searchFields: payload } : { ...state, searchFields: emptyFields };
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
