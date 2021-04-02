import { request } from '@/utils/http';
import msg from '@/utils/msg';
import router from 'umi/router';
import {message} from 'antd';
const emptyList = [];
const emptyFields = {
  page: 1,
  pageCount: 10
};
const emptyAppanageruserList = {
  count: 0,
  apps: [],
  check:{}
};
const emptyEditorState = {data: {}, html: '', imgs: []};
const emptyModal=[];
const str='';
export default {
  namespace: 'appmanager_id',
  state: {
    APPMANAGEREDITLIST: emptyList,
    APPMANAGERLIST:emptyAppanageruserList,
    APPPAGES:emptyFields,
    APP_EDITOR_STATE: emptyEditorState,//富文本
    MODALDATA:emptyModal, // 应用配置列表,
    FEATHER:[],
    RANGENUM:str
  },
  effects: {
    // 应用列表
    *fetchAppmanagerList({payload},{  put , call }) {
      let params = {
        page: payload.page,
        pageCount: payload.perpage
      };
      const res = yield call(request, {
        fnName: 'market_get_apps',
        params:payload
      });

      if (res.code === 0) {
        yield put({
          type: 'updateAppmanagerList1',
          payload: res.data,
        });
        yield put({ type: 'savepages', payload: params });

      }else{
        msg(res);
        yield put({
          type: 'updateAppmanagerList1',
        });
      }
    },
    // 检测应用名称/code是否相同
    *fetchMarketCheck({payload},{ put , call }) {
      const res = yield call(request, {
        fnName: 'market_app_check',
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
    // 创建应用
    *fetchAppmanagerListInsert({data},{call}){
      const res=yield call(request, {
        fnName: 'market_insert',
        data: data
      });
      if (res.code === 0) {
        msg('操作成功!');
        router.push('/application/appmanager');
      } else {
        message.warning('请检查应用信息填写是否有误');
      }
    },
    // 获取应用编辑信息
    *fetchAppmanagerEditList({payload,callback},{  put , call }) {
      const res = yield call(request, {
        fnName: 'market_get_apps',
        params:payload
      });
      if (res.code === 0) {
        callback&&callback(res.data);
        yield put({
          type: 'updateAppmanagerList',
          payload: res.data,
        });
        // 获取应用配置，并赋值给MODALDATA
        yield put({
          type:'updateModalData',
          payload:res.data[0].market_app_cfg
        });
        // 富文本
        yield put({
          type: 'updateEditorState',
          // payload: {...emptyEditorState, data: {}, html: oem_partsku_desc, imgs: partsku_desc_imgs}
        });
      }else{
        msg(res);
      }
    },
    // 编辑应用,更新应用信息
    *fetchAppmanagerUpdateList({data},{call,put,select}){
      const res = yield call(request, {
        fnName: 'market_update',
        data: data
      });
      if (res.code === 0) {
        router.push('/application/appmanager');
        const {APPPAGES} = yield select(state=>state.appmanager_id);
        yield put({
          type: 'fetchAppmanagerList',
          payload:APPPAGES
        });
        yield put({
          type: 'updateAppmanagerList',
        });
        // message.success('编辑成功');

      } else {
        msg(res);
        message.warning('请检查应用信息填写是否有误');
      }
    },
    //
    *fetchRangeNum({payload,callback},{  put , call }) {
      const res = yield call(request, {
        fnName: 'market_open_range_num',
        params:payload
      });
      if (res.code === 0) {
        yield put({
          type: 'updateRangeNum',
          payload: res.data.toString(),
        });
      }else{
        yield put({
          type: 'updateRangeNum',
        });
        msg(res);
      }
    },
    // 富文本
    *fetchEditorUpload({ payload }, { call, put, select }) {
      const { file } = payload;
      // const { APPMANAGEREDITLIST } = yield select(state => state.appmanager_id);
      // const { market_app_id } = APPMANAGEREDITLIST[0];
      let fd = new FormData();
      // if(PAGE_TYPE === 'edit') {
      //   fd.append('market_app_id', market_app_id);
      // }
      fd.append('image', file);
      return yield call(request, { fnName: 'market_image_upload', data: fd });
    },
  },

  reducers: {
    updateCheck(state, { payload }) {
      return { ...state, check: payload  };
    },
    updateRangeNum(state, { payload }) {
      return payload?{ ...state, RANGENUM: payload  }:{...state,RANGNUM:str};
    },
    updateAppmanagerList(state, { payload }) {
      return { ...state, APPMANAGEREDITLIST: payload || emptyList };
    },
    updateAppmanagerList1(state, { payload }) {
      return { ...state, APPMANAGERLIST: payload || emptyAppanageruserList };
    },
    savePages(state, { payload }) {
      return payload ? { ...state, APPPAGES: payload } : { ...state, APPPAGES: emptyFields };
    },
    // 富文本
    updateEditorState(state, { payload }) {
      return payload ? { ...state, APP_EDITOR_STATE: {...state.APP_EDITOR_STATE, ...payload} } : { ...state, APP_EDITOR_STATE: emptyEditorState };
    },
    clearState(state) {
      return {
        ...state,
        APPMANAGEREDITLIST:[]
      };
    },
    // 配置列表缓存
    updateModalData(state, { payload }) {
      return { ...state, MODALDATA: payload };
    },
    // 缓存应用特点
    updateAppFeather(state, { payload }) {
      return { ...state, FEATHER: payload };
    },
    clearAppFeather(state, { payload }) {
      return { ...state, FEATHER: [payload] };
    },
    // 清空配置列表缓存
    clearModalData(state) {
      return {
        ...state,
        MODALDATA:[]
      };
    },
    clearCheck(state) {
      return {
        ...state,
        check:{}
      };
    }
  },
  subscriptions: {

  },
};
