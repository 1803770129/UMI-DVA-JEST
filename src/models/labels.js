import { request } from '@/utils/http';
import msg from '@/utils/msg';
import router from 'umi/router';
const emptyFields = {
  page: 1,
  pageCount: 10
};
const emptyLabelList = {
  count: 0,
  labels: [],
};
const emptyCheckLabelList = {
  count: 0,
  labels: [],
};
const emptyCheckTenList = {
  count: 0,
  tentans: [],
};
export default {
  namespace: 'labels',
  state: {
    LABELLIST:emptyLabelList,
    CHECKLABELLIST:emptyCheckLabelList,
    LABELPAGES:emptyFields,
    TENPAGES:emptyFields,
    LABELEDIT:[],
    ALLTENANTLIST:[],
    ALLAPPLIST:[],
    CTHECKTENLIST:emptyCheckTenList
  },
  effects: {
    *fetchLabelList({payload},{  put , call }) {
      let params = {
        page: payload.page,
        pageCount: payload.pageCount
      };
      const res = yield call(request, {
        fnName: 'ten_label',
        params:payload
      });

      if (res.code === 0) {
        yield put({
          type: 'updatelabelList1',
          payload: res.data,
        });
        yield put({ type: 'savePages', payload: params });

      }else{
        msg(res);
        yield put({
          type: 'updatelabelList1',
        });
      }
    },
    *fetchCheckLabelList({payload},{  put , call }) {
      const res = yield call(request, {
        fnName: 'get_market_whitelist_label',
        params:payload
      });

      if (res.code === 0) {
        yield put({
          type: 'updateChecklabelList1',
          payload: res.data,
        });

      }else{
        msg(res);
        yield put({
          type: 'updateChecklabelList1',
        });
      }
    },
    *fetchLabelInsert({payload},{call}){
      const res=yield call(request, {
        fnName: 'ten_add_label',
        params: payload
      });
      if (res.code === 0) {
        msg('创建成功!');
        router.push('/tenant/label');
      } else {
        msg(res);
      }
    },
    *fetchTenLabelInsert({data},{call}){
      const res=yield call(request, {
        fnName: 'ten_label_rel',
        data: data
      });
      if (res.code === 0) {
        msg('添加标签成功!');
      } else {
        msg(res);
      }
    },
    *fetchCheckLabelInsert({data},{call}){
      const res=yield call(request, {
        fnName: 'add_whitelist_label',
        data: data
      });
      if (res.code === 0) {
        msg('添加标签成功!');
      } else {
        msg(res);
      }
    },
    *fetchLabelEdit({payload},{  put , call }) {
      const res = yield call(request, {
        fnName: 'ten_label',
        params:payload
      });
      if (res.code === 0) {
        yield put({
          type: 'updateLabelList',
          payload: res.data,
        });
      }else{
        msg(res);
      }
    },
    *fetchAppmanagerUpdateList({data},{call,put,select}){
      const res = yield call(request, {
        fnName: 'market_update',
        data: data
      });
      if (res.code === 0) {
        const {APPPAGES} = yield select(state=>state.appmanager_id);
        yield put({
          type: 'fetchAppmanagerList',
          payload:APPPAGES
        });
        yield put({
          type: 'updateAppmanagerList',

        });

        router.push('/application/appmanager');
      } else {
        msg(res);
      }
    },
    *fetchAllTenant({payload},{call,put}){
      const res= yield call(request, {
        fnName: 'ten_get_labels',
      });
      if (res.code === 0) {
        yield put({
          type: 'updateAllTenant',
          payload: res.data,
        });
      }else{
        msg(res);
        yield put({
          type: 'updateAllTenant',
        });
      }
    },
    *fetchAllApp({payload},{call,put}){
      const res= yield call(request, {
        fnName: 'get_markers_by_type',
        params:payload
      });
      if (res.code === 0) {
        yield put({
          type: 'updateAllApp',
          payload: res.data,
        });
      }else{
        msg(res);
        yield put({
          type: 'updateAllApp',
        });
      }
    },
    *fetchCheckTenantList({payload},{  put , call }) {
      let params = {
        page: payload.page,
        pageCount: payload.pageCount
      };
      const res = yield call(request, {
        fnName: 'get_whitelist_tens',
        params:payload
      });

      if (res.code === 0) {
        yield put({
          type: 'updateTenList1',
          payload: res.data,
        });
        yield put({ type: 'savePages1', payload: params });
        yield put({ type: 'saveSearchFields', payload: {company_name:payload.company_name} });

      }else{
        msg(res);
        yield put({
          type: 'updateTenList1',
        });
      }
    },
    *fetchDelCheckTen({payload},{ call ,put ,select  }){
      const res = yield call(request, {
        fnName: 'del_whitelist_ten',
        params:payload
      });
      if (res.code === 0) {
        msg('操作成功');
        const {TENPAGES} = yield select(state=>state.label);
        yield put({
          type: 'fetchCheckTenantList',
          payload:{...TENPAGES,market_app_id:payload.market_app_id}
        });
      }else{
        msg(res);
      }
    },
    *fetchAddCheckTen({payload},{ call ,put ,select }){
      const res = yield call(request, {
        fnName: 'add_whitelist_tens',
        params:payload
      });
      if (res.code === 0) {
        msg('操作成功');
        const {TENPAGES} = yield select(state=>state.label);
        yield put({
          type: 'fetchCheckTenantList',
          payload:{...TENPAGES,market_app_id:payload.market_app_id}
        });
      }else{
        msg(res);
      }
    },
  },

  reducers: {
    updateLabelList(state, { payload }) {
      return { ...state, LABELEDIT: payload };
    },
    updatelabelList1(state, { payload }) {
      return { ...state, LABELLIST: payload || emptyLabelList };
    },
    saveSearchFields(state, { payload }) {
      return payload ? { ...state, searchFields: payload } : { ...state, searchFields: emptyFields };
    },
    updateTenList1(state, { payload }) {
      return { ...state, CTHECKTENLIST: payload || emptyCheckTenList };
    },
    updateChecklabelList1(state, { payload }) {
      return { ...state, CHECKLABELLIST: payload || emptyLabelList };
    },
    savePages(state, { payload }) {
      return payload ? { ...state, LABELPAGES: payload } : { ...state, LABELPAGES: emptyFields };
    },
    savePages1(state, { payload }) {
      return payload ? { ...state, TENPAGES: payload } : { ...state, TENPAGES: emptyFields };
    },
    updateAllTenant(state, { payload }) {
      return { ...state, ALLTENANTLIST: payload };
    },
    updateAllApp(state, { payload }) {
      return { ...state, ALLAPPLIST: payload };
    },
    clearState(state) {
      return {
        ...state,
        CHECKLABELLIST:[]
      };
    }
  },
  subscriptions: {

  },
};
