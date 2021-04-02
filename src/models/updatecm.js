import { request } from '@/utils/http';
import msg from '@/utils/msg';
import { Modal } from 'antd';
const { confirm } = Modal;
const emptyBatch = [];
const emptyBatchOrigin = [];

export default {
  namespace: 'updatecm',
  state: {
    BATCH:emptyBatch,
    BATCHOrigin:emptyBatchOrigin,
    DATAMSG:''
  },
  effects: {
    // 查询批量修改标准车型数据,指定修改值
    *fetchBatch({data},{  put , call }) {
      const res = yield call(request, {
        fnName: 'carmodel_batch_update_column_bykey_get',
        data:data
      });
      if (res.code === 0) {
        yield put({
          type: 'updateBatch',
          data: res.data,
        });
      }else{
        msg(res);
        yield put({
          type: 'updateBatch',
        });
      }
    },
    // 批量修改标准车型数据,指定修改值
    *fetchBatchInsert({data},{call}){
      const res = yield call(request, {
        fnName: 'carmodel_batch_update_column_bykey',
        data: data
      });
      if (res.code === 0) {
        data.cb(res);
        msg('操作成功');
      }else if(res.code === 1001){
        // yield put({
        //   type: 'updatedatamsg',
        //   data: res.data,
        // });
        confirm({
          title: '操作成功,但是新品牌不存在，请通知研发人员进行数据维护！',
          onOk() {
          },
          onCancel() {
          },
        });
      }else{
        msg(res);
        //  yield put({
        //   type: 'updatedatamsg'
        // });
      }
    },
    // 查询批量修改标准车型数据,根据源车型是否与标准车型一致
    *fetchBatchOrigin({payload},{  put , call }) {
      const res = yield call(request, {
        fnName: 'carmodel_batch_update_column_byOrigin_get',
        params:payload
      });
      if (res.code === 0) {
        yield put({
          type: 'updateBatchOrigin',
          data: res.data,
        });
      }else{
        msg(res);
        yield put({
          type: 'updateBatchOrigin',
        });
      }
    },
    // 批量修改标准车型数据,根据源车型是否与标准车型一致
    *fetchBatchOriginInsert({data},{call}){
      const res= yield call(request, {
        fnName: 'carmodel_batch_update_column_byOrigin',
        data: data
      });
      if (res.code === 0) {
        msg('操作成功');
      }else{
        msg(res);

      }
    },
  },
  reducers: {
    updateBatch(state, { data }) {
      return { ...state, BATCH: data  || emptyBatch};
    },
    updateBatchOrigin(state, { payload }) {
      return { ...state, BATCHOrigin: payload  || emptyBatchOrigin};
    },
    updatedatamsg(state, { payload }) {
      return { ...state, DATAMSG: payload };
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
