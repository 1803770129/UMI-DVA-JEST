import { request } from 'utils/http';
import msg from '@/utils/msg';
import { originalImage } from '@/utils/tools';
import qs from 'querystringify';
const EMPTY_DATA = {
  data: [],
  api: ''
};

const EMPTY_FIELDS = {
  page: 1,
  perpage: 10,
};

const EMPTY_PARTSKU_FEEDBACKS = {
  count: 0,
  data: [],
};

export default {
  namespace: 'partskufeedback',

  state: {
    CATEGORIES: [],
    PARTSKU_FEEDBACKS: EMPTY_PARTSKU_FEEDBACKS,
    FIELDS: EMPTY_FIELDS,
    FEEDBACK_PROCESS: []
  },

  effects: {
    // 获取产品反馈列表
    *fetchPartskuFeedbacks({ payload }, { call, put, select }) {
      yield put({ type: 'updatePartskuFeedbacks' });
      const res = yield call(request, {
        fnName: 'tenant_feedbacks',
        params: payload
      });
      if (res.code === 0) {
        yield put({ type: 'updatePartskuFeedbacks', payload: { count: res.count, data: res.data } });
        // 缓存参数
        yield put({ type: 'updateFields', payload });
      } else {
        msg(res);
      }
    },

    // 获取品类列表 - 产品属性操作
    *fetchBrandCategoryList({ payload }, { call, put, select }) {
      const { CATEGORIES } = yield select(state => state.partskufeedback);
      if (CATEGORIES.length === 0) {
        yield put({ type: 'updateCategories' });
        // 获取品类列表
        const res = yield call(request, {
          fnName: 'brand_category_list',
          params: payload
        });
        if (res.code === 0) {
          yield put({
            type: 'updateCategories',
            payload: res.data
          });
        } else {
          msg(res);
        }
      }
    },

    // 批量操作
    *fetchFeedbacksOperation({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'tenant_feedback_operation',
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
        fnName: 'tenant_feedbacks_export',
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
      const getOperation = status => {
        // PENDING:未确定， OVER:已确定
        switch (status) {
          case 'PENDING':
            return '未确定';
          default:
            return '已确定';
        }
      };
      if (res.code === 0) {
        const tHeader = ['反馈单号', '品牌', '产品', '产品编码', '反馈内容', '反馈人', '联系电话', '反馈时间', '处理状态', '操作状态', '反馈图片'];
        const tbody = res.data.map(v => {
          return {
            ten_feedback_code: v.ten_feedback_code,
            ten_brand_name: v.ten_brand_name,
            brand_category_name: v.brand_category_name,
            ten_partsku_code: v.ten_partsku_code,
            ten_feedback_content: v.ten_feedback_content,
            person_name: v.person_name,
            ten_feedback_phone: v.ten_feedback_phone,
            ten_feedback_time: v.ten_feedback_time,
            ten_feedback_status: getStatus(v.ten_feedback_status),
            ten_feedback_operation: getOperation(v.ten_feedback_operation),
            ten_feedback_images: v.ten_feedback_images.map(img => originalImage(img.ten_feedback_image_url)),
          };
        });
        callback(tHeader, tbody);
      } else {
        msg(res);
      }
    },
    // 回复列表
    *fetchFeedbackProcess({ payload, callback }, { call, put, select }) {
      // 先清空再获取
      yield put({ type: 'updateFeedbackProcess' });

      const res = yield call(request, {
        fnName: 'tenant_feedback_detailed',
        params: payload
      });
      if (res.code === 0) {
        yield put({
          type: 'updateFeedbackProcess',
          payload: res.data
        });
        callback && callback();
      } else {
        msg(res);
      }
    },

  },

  reducers: {
    updatePartskuFeedbacks(state, { payload }) {
      return payload ? { ...state, PARTSKU_FEEDBACKS: payload } : { ...state, PARTSKU_FEEDBACKS: EMPTY_PARTSKU_FEEDBACKS };
    },
    updateFields(state, { payload }) {
      return payload ? { ...state, FIELDS: payload } : { ...state, FIELDS: EMPTY_FIELDS };
    },
    // 更新品类列表
    updateCategories(state, { payload }) {
      return payload ? { ...state, CATEGORIES: payload } : { ...state, CATEGORIES: [] };
    },
    // 更新回复列表
    updateFeedbackProcess(state, { payload }) {
      return payload ? { ...state, FEEDBACK_PROCESS: payload } : { ...state, FEEDBACK_PROCESS: [] };
    },
  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen((location, action) => {
        const { pathname, query } = location;
        if (pathname.includes('/feedback/partskufeedback')) {
          // 反馈列表
          dispatch({ type: 'fetchPartskuFeedbacks', payload: EMPTY_FIELDS });
          // 初始化获取品类列表
          dispatch({ type: 'fetchBrandCategoryList' });
        }
      });
    }
  },
};
