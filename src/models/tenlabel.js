import { request } from '@/utils/http';
import msg from '@/utils/msg';
import router from 'umi/router';
const emptyFields = {
  page: 1,
  pageCount: 10
};
const emptyTenLabelList = {
  count: 0,
  labels: [],
};
export default {
  namespace: 'tenlabel',
  state: {
    TENLABELLIST:emptyTenLabelList,
    TenLabelPages:emptyFields,
    FIELDS:{},

  },
  effects: {
    // 获取商户标签列表
    *fetchTensLabelList({payload},{  put , call }) {
      let params = {
        page: payload.page,
        pageCount: payload.pageCount
      };
      const res = yield call(request, {
        fnName: 'ten_get_labels',
        params:payload
      });

      if (res.code === 0) {
        yield put({
          type: 'updateTenLabelList',
          payload: res.data,
        });
        yield put({ type: 'savePages', payload: params });

      }else{
        msg(res);
        yield put({
          type: 'updateTenLabelList',
        });
      }
    },
    // 添加商户标签
    *fetchTenLabelInsert({data,callback},{call , put , select}){
      const res=yield call(request, {
        fnName: 'ten_label_rel',
        data: data
      });
      if (res.code === 0) {
        const {TenLabelPages,FIELDS} = yield select(state=>state.tenlabel);
        yield put({
          type: 'fetchTensLabelList',
          payload:{...TenLabelPages,...FIELDS}
        });
        msg('添加标签成功!');
      } else {
        msg(res);
      }
    },
    // 批量添加商户标签
    *fetchTenLabelBatchInsert({data},{call , put , select}){
      const res=yield call(request, {
        fnName: 'ten_batch_add_label',
        data: data
      });
      if (res.code === 0) {
        const {TenLabelPages,FIELDS} = yield select(state=>state.tenlabel);
        yield put({
          type: 'fetchTensLabelList',
          payload:{...TenLabelPages,...FIELDS}
        });
        msg('添加标签成功!');
      } else {
        msg(res);
      }
    },

  },

  reducers: {
    updateTenLabelList(state, { payload }) {
      return { ...state, TENLABELLIST: payload  };
    },
    savePages(state, { payload }) {
      return payload ? { ...state, TenLabelPages: payload } : { ...state, TenLabelPages: emptyFields };
    },
    // 保存商户标签搜索条件
    saveFields(state,{payload}){
      return { ...state, FIELDS: payload }
    },

  },
  subscriptions: {

  },
};
