import { request } from '@/utils/http';
import msg from '@/utils/msg';
import {message} from 'antd';
export default {
  namespace: 'batchtask',

  state: {
    page: 1,                                        // 更新历史记录 - page
    perpage: 10,                                    // 更新历史记录 - perpage
    carmodelBatchHisList: { list: [], count: 0 }    // 更新历史记录列表
  },

  effects: {
    // 获取batch执行状态
    *fetchCarmodelBatchStatus({ payload }, { call, put }) {
      const res = yield call(request, {
        fnName: 'carmodel_batch_status',
        params: payload
      });
      if (res.code == 0) {
        payload.cb(res);
      } else {
        msg(res);
      }
    },
    *fetchCarmodelBatchApproveStatus({ payload , callback }, { call, put }) {
      const res = yield call(request, {
        fnName: 'carmodel_batch_approve_status',
        params: payload
      });
      if (res.code == 0) {
        callback && callback(res)
        // if(res.data[0].job_record_status==='FAIL'){
        //   message.error('本次批量任务执行失败')
        // }

        payload.cb(res);
      } else {
        msg(res);
      }
    },

    // 批量任务
    *fetchCarmodelBatch({ payload }, { call, put }) {
      const res = yield call(request, {
        fnName: 'carmodel_batch_format',
        data: payload
      });
      if (res.code == 0) {
        // msg('批量任务执行中');
        payload.cb(res);
      } else {
        msg(res);
      }
    },
    *fetchCarmodelBatchApprove({ payload }, { call, put }) {
      const res = yield call(request, {
        fnName: 'carmodel_batch_approve_format',
        data: payload
      });
      if (res.code == 0) {
        msg('批量任务执行中');
        payload.cb(res);
      } else {
        msg(res);
      }
    },

    // --------------------------------------------------

    // 获取batch执行历史
    *fetchCarmodelBatchHisList({ payload }, { call, put }) {
      const res = yield call(request, {
        fnName: 'carmodel_batch_his_list',
        params: payload
      });
      if(res.code == 0) {
        payload.cb(res);
      } else {
        msg(res);
      }
    },

    // 执行车型批量审核
    *fetchCarmodelFromatApprove({ payload }, { call, put }) {
      const res = yield call(request, {
        fnName: 'carmodel_fromat_approve',
        data: payload
      });
      if(res.code === 0) {
        msg('执行成功');
      } else {
        msg(res);
      }
    }


  },

  reducers: {
    // 更新state状态
    updateState(state, action) {
      let props = action.payload;
      return {
        ...state,
        ...props
      };
    },

    // 离开时清空缓存
    clearState(state) {
      return {
        page: 1,
        perpage: 10,
        carmodelBatchHisList: { list: [], count: 0 }
      };
    }
  },

  subscriptions: {}
};
