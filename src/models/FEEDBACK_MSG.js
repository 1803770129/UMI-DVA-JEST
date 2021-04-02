import { request } from 'utils/http';
import msg from '@/utils/msg';
import simplePages from '@/common/simplePages';
const emptyArr= [];

const EMPTY_MSG_RECORDS = {
  page: 1,
  perpage: 20,
};
export default {
  namespace: 'FEEDBACK_MSG',

  state: {
    MSG_RECORDS: EMPTY_MSG_RECORDS,
    MESSAGES: emptyArr
  },

  effects: {
    // 获取消息记录列表
    *FEATCH_MESSAGES({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'MESSAGES'
      });
      if (res.code === 0) {
        // 反馈：FEEDBACK 通知：NOTICE
        const config ={
          NOTICE: '服务通知',
          FEEDBACK : '客户反馈',
        };
        yield put({
          type: 'UPDATE_MESSAGES',
          payload: (res.data && res.data.length > 0) ? res.data.map(item => ({
            ...item,
            msg_title: config[item.msg_type_identification]
          })) : emptyArr
        });

      } else {
        msg(res);
      }
    },
    // 获取消息记录列表
    *FEATCH_MSG_RECORDS({ payload }, { call, put, select }) {

      const res = yield call(request, {
        fnName: 'MSG_RECORDS',
        params: payload
      });
      if (res.code === 0) {
        const ids = res.data.filter(item => item.msg_read_flag === 1).map(item => item.msg_system_record_id);
        // 已读标识
        if(ids.length > 0) {
          yield put({ type: 'FEATCH_MSG_RECORD', payload: { msg_system_record_ids:  ids} });
        }
        yield put({ type: 'UPDATE_MSG_RECORDS', payload: {list: res.data, count: res.count, page: payload.page, perpage: payload.perpage} });
      } else {
        msg(res);
      }
    },
    // 消息读取
    *FEATCH_MSG_RECORD({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'MSG_RECORD',
        data: payload
      });
      // 更新消息状态
      yield put({type: 'FEATCH_MESSAGES'});
      if (res.code !== 0) {
        msg(res);
      }
    }
  },

  reducers: {
    UPDATE_MSG_RECORDS(state, { payload }) {
      return { ...state, MSG_RECORDS: payload || EMPTY_MSG_RECORDS };
    },
    UPDATE_MESSAGES(state, { payload }) {
      return { ...state, MESSAGES: payload || emptyArr  };
    }
  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen((location, action) => {
        const { pathname, query } = location;
        if(pathname.indexOf('/message') === 0) {
          const params = query.active !== 'ALL' && query.active !== undefined ? {...EMPTY_MSG_RECORDS, msg_type_identification: query.active } : {...EMPTY_MSG_RECORDS};
          // 获取消息记录列表
          dispatch({ type: 'FEATCH_MSG_RECORDS', payload: params});
        }
        if(!simplePages.includes(location.pathname) && location.pathname !== '/') {
          dispatch({
            type: 'FEATCH_MESSAGES'
          });
        }
      });
    }
  },
};
