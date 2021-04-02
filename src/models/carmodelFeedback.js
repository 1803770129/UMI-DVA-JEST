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

const EMPTY_FEEDBACK_CARMODELS = {
  count: 0,
  data: [],
};

export default {

  namespace: 'carmodelFeedback',

  state: {
    FEEDBACK_CARMODELS: EMPTY_FEEDBACK_CARMODELS,
    FIELDS: EMPTY_FIELDS,
    FEEDBACK_CARMODEL_PROCESS: []
  },

  effects: {
    // 获取车型反馈列表
    *fetchFeedbackCarmodels({ payload }, { call, put, select }) {
      const params = isEmpty(payload) ? EMPTY_FIELDS : payload;
      const res = yield call(request, {
        fnName: 'feedback_carmodels',
        params
      });
      if (res.code === 0) {
        yield put({ type: 'updateFeedbackCarmodels', payload: { count: res.count, data: res.data } });
        // 缓存参数
        yield put({ type: 'updateFields', payload: params });
      } else {
        yield put({ type: 'updateFeedbackCarmodels' });
        msg(res);
      }
    },
    // 车型反馈回复列表
    *fetchFeedbackCarmodelProcess({ payload, callback }, { call, put, select }) {
      yield put({ type: 'updateFeedbackCarmodelProcess' });
      const res = yield call(request, {
        fnName: 'feedback_carmodel_detailed',
        params: payload
      });
      if (res.code === 0) {
        yield put({ type: 'updateFeedbackCarmodelProcess', payload: res.data });
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
        fnName: 'feedback_carmodel_uploadImg',
        data: fd
      });
      if (res.code === 0) {
        callback(res.data.files.map(v => ({ ...v, uid: v.feedback_cm_image_id, url: v.filePath })));
      } else {
        msg(res);
      }
    },
    // 车型反馈回复
    *fetchFeedbackReply({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'feedback_carmodel_reply',
        data: payload
      });
      if (res.code === 0) {
        callback();
      } else {
        msg(res);
      }
    },
    // 车型反馈批量处理
    *fetchFeedbackProcess({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'feedback_carmodels_process',
        data: payload
      });
      if (res.code === 0) {
        callback();
      } else {
        msg(res);
      }
    },
    // 车型反馈更新反馈状态
    *fetchFeedbackStatus({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'feedback_carmodel_status',
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
        fnName: 'feedback_carmodels_export',
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
        const tHeader = ['反馈单号', '反馈车型', '问题描述', '反馈人', '联系电话', '反馈时间', '处理状态', '负责人', '反馈图片'];
        const tbody = res.data.map(v => {
          return {
            feedback_cm_code: v.feedback_cm_code,
            feedback_cm_car: v.feedback_cm_car,
            feedback_cm_content: v.feedback_cm_content,
            person_name: v.person_name,
            feedback_cm_phone: v.feedback_cm_phone,
            feedback_cm_time: v.feedback_cm_time,
            feedback_cm_status: getStatus(v.feedback_cm_status),
            feedback_cm_staff: v.feedback_cm_staff,
            feedback_cm_images: v.feedback_cm_images.map(img => originalImage(img.feedback_cm_image_url)),
          };
        });
        callback(tHeader, tbody);
      } else {
        msg.notice(res.code);
      }
    },


  },

  reducers: {
    updateFeedbackCarmodels(state, { payload }) {
      return payload ? { ...state, FEEDBACK_CARMODELS: payload } : { ...state, FEEDBACK_CARMODELS: EMPTY_FEEDBACK_CARMODELS };
    },
    updateFields(state, { payload }) {
      return payload ? { ...state, FIELDS: payload } : { ...state, FIELDS: EMPTY_FIELDS };
    },
    updateFeedbackCarmodelProcess(state, { payload }) {
      return payload ? { ...state, FEEDBACK_CARMODEL_PROCESS: payload } : { ...state, FEEDBACK_CARMODEL_PROCESS: [] };
    },

  },

  subscriptions: {

  }
};