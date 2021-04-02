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
  namespace: 'label',
  state: {
    LABELLIST:emptyLabelList,
    CHECKLABELLIST:emptyCheckLabelList,
    LABELPAGES:emptyFields,
    TENPAGES:emptyFields,
    LABELEDIT:[],
    ALLTENANTLIST:[],
    ALLAPPLIST:[],
    CTHECKTENLIST:emptyCheckTenList,
    CHECK:{},
    FIELDS:{}
  },
  effects: {
    // 获取标签列表
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
    // 创建标签
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
    // 检查标签名称是否重复
    *fetchLabelCheck({payload},{ put , call }) {
      const res = yield call(request, {
        fnName: 'ten_label_check',
        params:payload
      });
      if (res.code === 0) {
        yield put({
          type:'updateCheck',
          payload:res.data
        });
      }else{
        msg(res);
        yield put({
          type:'updateCheck'
        });
      }
    },
    // 给商户添加标签
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
    // 编辑标签
    *fetchLabelEdit({data},{  put , call }) {
      const res = yield call(request, {
        fnName: 'ten_update_label',
        data:data
      });
      if (res.code === 0) {
        yield put({
          type: 'updateLabelList',
        });
        msg('修改成功');
        router.push('/tenant/label');
      }else{
        msg(res);
      }
    },
    // 删除标签
    *fetchLabelDel({data},{  put , call , select }) {
      const res = yield call(request, {
        fnName: 'ten_delete_label',
        data:data
      });
      if (res.code === 0) {
        const {LABELPAGES,LABELLIST} = yield select(state=>state.label);
        console.log(LABELLIST.count);
        if(Number(LABELLIST.count)-1==LABELPAGES.pageCount){
          yield put({
            type: 'fetchLabelList',
            payload:{...LABELPAGES,page:1}
          });
        }else{
          yield put({
            type: 'fetchLabelList',
            payload:LABELPAGES
          });
        }
        msg('删除成功');
      }else{
        msg(res);
      }
    },
    // 更新标签
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
    // 获取所有商户
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
    // 获取所有应用
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
    // 删除商户应用权限
    *fetchDelCheckTen({payload},{ call ,put ,select  }){
      const res = yield call(request, {
        fnName: 'del_whitelist_ten',
        params:payload
      });
      if (res.code === 0) {
        msg('操作成功');
        const {TENPAGES, FIELDS} = yield select(state=>state.label);
        yield put({
          type: 'fetchCheckTenantList',
          payload:{...TENPAGES,market_app_id:payload.market_app_id, ...FIELDS}
        });
      }else{
        msg(res);
      }
    },
    // 添加商户应用权限
    *fetchAddCheckTen({payload},{ call ,put ,select }){
      const res = yield call(request, {
        fnName: 'add_whitelist_tens',
        params:payload
      });
      if (res.code === 0) {
        msg('操作成功');
        const {TENPAGES , FIELDS} = yield select(state=>state.label);
        yield put({
          type: 'fetchCheckTenantList',
          payload:{...TENPAGES,market_app_id:payload.market_app_id,...FIELDS}
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
    updateCheck(state, { payload }) {
      return { ...state, CHECK: payload  };
    },
    updateTENFields(state, { payload }) {
      return payload?{ ...state, FIELDS: payload  } : { ...state, FIELDS: {}  };
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
