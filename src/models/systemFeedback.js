import { request } from '@/utils/http';
import msg from '@/utils/msg';
import { isEmpty, originalImage } from '@/utils/tools';

const EMPTY_DATA = {
  data: [],
  api: ''
};

const EMPTY_FIELDS = {
  page: 1,
  perpage: 10,
};

const EMPTY_FEEDBACK_SYSTEMS = {
  count: 0,
  data: [],
};

export default {

  namespace: 'systemFeedback',

  state: {
    FEEDBACK_SYSTEMS: EMPTY_FEEDBACK_SYSTEMS,
    FIELDS: EMPTY_FIELDS,
    FEEDBACK_SYSTEM_PROCESS: []
  },

  effects: {
    // 获取功能反馈列表
    *fetchFeedbackSystems({ payload }, { call, put, select }) {
      const params = isEmpty(payload) ? EMPTY_FIELDS : payload;
      const res = yield call(request, {
        fnName: 'feedback_systems',
        params
      });
      if (res.code === 0) {
        yield put({ type: 'updateFeedbackSystems', payload: { count: res.count, data: res.data } });
        // 缓存参数
        yield put({ type: 'updateFields', payload: params });
      } else {
        yield put({ type: 'updateFeedbackSystems' });
        msg(res);
      }
    },
    // 功能反馈回复列表
    *fetchFeedbackSystemProcess({ payload, callback }, { call, put, select }) {
      yield put({ type: 'updateFeedbackSystemProcess' });
      const res = yield call(request, {
        fnName: 'feedback_system_detailed',
        params: payload
      });
      if (res.code === 0) {
        yield put({ type: 'updateFeedbackSystemProcess', payload: res.data });
        callback && callback();
      } else {
        msg(res);
      }
    },

    // 回复图片上传
    *fetchFeedbackImages({ payload, callback }, { call, put, select }) {
      const { file } = payload;
      const fd = new FormData();
      fd.append('images', file);
      const res = yield call(request, {
        fnName: 'feedback_system_uploadImg',
        data: fd
      });
      if (res.code === 0) {
        callback(res.data.files.map(v => ({ ...v, uid: v.sys_feedback_image_id, url: v.filePath })));
      } else {
        msg(res);
      }
    },
    // 功能反馈回复
    *fetchFeedbackReply({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'feedback_system_reply',
        data: payload
      });
      if (res.code === 0) {
        callback();
      } else {
        msg(res);
      }
    },
    // 功能反馈批量处理
    *fetchFeedbackProcess({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'feedback_system_batchProcess',
        data: payload
      });
      if (res.code === 0) {
        callback();
      } else {
        msg(res);
      }
    },
    // 功能反馈更新反馈状态
    *fetchFeedbackStatus({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'feedback_system_status',
        data: payload
      });
      if (res.code === 0) {
        callback();
      } else {
        msg(res);
      }
    },
    // 导出反馈
    *fetchFeedbackXls({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'feedback_systems_export',
        params: payload
      });
      const getStatus = status => {
        // PENDING:待处理， PROCESSING:处理中，OVER:已处理）
        switch (status) {
          case 'PENDING':
            return '待处理';
          case 'PROCESSING':
            return '处理中';
          default:
            return '已处理';
        }
      };
      if (res.code === 0) {
        const tHeader = ['反馈单号', '反馈对象', '问题描述', '反馈人', '联系电话', '反馈时间', '处理状态', '反馈图片'];
        const tbody = res.data.map(v => {
          return {
            sys_feedback_code: v.sys_feedback_code,
            app_name: v.app_name,
            sys_feedback_content: v.sys_feedback_content,
            person_name: v.person_name,
            sys_feedback_phone: v.sys_feedback_phone,
            sys_feedback_time: v.sys_feedback_time,
            sys_feedback_status: getStatus(v.sys_feedback_status),
            sys_feedback_images: v.sys_feedback_images.map(img => originalImage(img.sys_feedback_image_url)),
          };
        });
        callback(tHeader, tbody);
      } else {
        msg.notice(res.code);
      }
    },

  },

  reducers: {
    updateFeedbackSystems(state, { payload }) {
      return payload ? { ...state, FEEDBACK_SYSTEMS: payload } : { ...state, FEEDBACK_SYSTEMS: EMPTY_FEEDBACK_SYSTEMS };
    },
    updateFields(state, { payload }) {
      return payload ? { ...state, FIELDS: payload } : { ...state, FIELDS: EMPTY_FIELDS };
    },
    updateFeedbackSystemProcess(state, { payload }) {
      return payload ? { ...state, FEEDBACK_SYSTEM_PROCESS: payload } : { ...state, FEEDBACK_SYSTEM_PROCESS: [] };
    },

  },

  subscriptions: {

  }
};