import { request } from '@/utils/http';
import msg from '@/utils/msg';
import router from 'umi/router';
const emptyColor = {};
const emptyFields = {
  page: 1,
  pageCount: 10
};
export default {
  namespace: 'personal',
  state: {
    COLORLIST:emptyColor,
    COLORPAGES:emptyFields
  },
  effects: {
    // 获取所有颜色 app_theme_colors
    *fetchThemeColors({payload},{  put , call }) {
      let params = {
        page: payload.page,
        pageCount: payload.pageCount
      };
      const res = yield call(request, {
        fnName: 'app_theme_colors',
        params:payload
      });

      if (res.code === 0) {
        yield put({
          type: 'updateColorList',
          payload: res.data,
        });
        yield put({ type: 'savePages', payload: params });
      }else{
        msg(res);
        yield put({
          type: 'updateColorList',
        });
      }
    },
    *fetchColorDownload({payload,callback},{  put , call }) {
      const res = yield call(request, {
        fnName: 'market_color_download',
      });
      if (res.code === 0) {
        callback(res);
      }else{
        msg(res);
      }
    },
    // 新建颜色
    *fetchAddThemeColor({data},{call,put,select}){
      const res = yield call(request, {
        fnName: 'market_add_theme_color',
        data: data
      });
      if (res.code === 0) {
        msg('操作成功');
        router.push('/application/personal/usercolor');
      } else {
        msg(res);
      }
    },
    // 编辑颜色
    *fetchUpdateThemeColor({data},{call,put,select}){
      const res = yield call(request, {
        fnName: 'update_app_theme_color',
        data: data
      });
      if (res.code === 0) {
        msg('操作成功');
        router.push('/application/personal/usercolor');
      } else {
        msg(res);
      }
    },
    *fetchdeleteThemeColor({data},{call,put,select}){
      const res = yield call(request, {
        fnName: 'delete_app_theme_color',
        data: data
      });
      if (res.code === 0) {
        const {COLORPAGES} = yield select(state=>state.personal);
        yield put({
          type: 'fetchThemeColors',
          payload:COLORPAGES
        });
        msg('删除成功');

      } else {
        msg(res);
      }
    },

  },

  reducers: {
    updateColorList(state, { payload }) {
      return { ...state, COLORLIST: payload || emptyColor};
    },
    savePages(state, { payload }) {
      return payload ? { ...state, COLORPAGES: payload } : { ...state, COLORPAGES: emptyFields };
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
