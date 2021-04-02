import { request } from '@/utils/http';
import { isEmpty, clearState } from '@/utils/tools';
import msg from '@/utils/msg';
import qs from 'querystringify';
import shallowequal from 'shallowequal';

const emptyData = {
  api: '',
  data: []
};

const emptyOemTmpCmvalues = {
  api: '',
  data: [],
  pros: []
};
const emptyOemTmpList = {
  api: '',
  data: [],
  count: 0
};

const emptyFields = {
  page: 1,
  perpage: 10
};


const emptyArr = [];
const emptyObj = {};

export default {
  namespace: 'oe_tmp',
  state: {
    FIELDS: emptyFields,
    OEM_TMP_LIST: emptyOemTmpList,
    OEM_TMP_CMVALUES: emptyOemTmpCmvalues,
    OEM_TMP_PRICE: emptyData,
    OEM_TMP_PARTNAME: emptyArr,
    OEM_TMP_CMBRAND: emptyArr,
    CATEGORY_TREE: emptyArr,
    CATEGORY_INFO: emptyObj
  },

  effects: {
    // 获取临时OE列表
    *fetchOemTmpList({ payload, isInit }, { call, put, select }) {
      const { FIELDS, OEM_TMP_LIST } = yield select(state => state.oe_tmp);
      const api = qs.stringify(payload);
      if (OEM_TMP_LIST.api !== api || isInit) {
        let params = { ...payload };
        if (isEmpty(payload.page)) {
          params = { ...emptyFields, ...params };
        }
        const res = yield call(request, { fnName: 'OEM_TMP_LIST', params });
        if (res.code === 0) {
          yield put({ type: 'updateOemTmpList', payload: { api, data: res.data.list, count: res.data.count } });
          yield put({ type: 'updateFields', payload: params });
        } else {
          msg(res);
          yield put({ type: 'updateOemTmpList' });
        }
      }
    },
    // 展示OE适配车型关键属性
    *fetchOemTmpCmvalues({ payload }, { call, put, select }) {
      const { OEM_TMP_CMVALUES } = yield select(state => state.oe_tmp);
      const api = qs.stringify(payload);
      if (OEM_TMP_CMVALUES.api !== api) {
        // 先清空缓存
        yield put({ type: 'updateOemTmpCmvalues' });
        const res = yield call(request, { fnName: 'OEM_TMP_CMVALUES', params: payload });
        if (res.code === 0) {
          yield put({ type: 'updateOemTmpCmvalues', payload: { api, data: res.data.values, pros: res.data.pros } });
        } else {
          msg(res);
          yield put({ type: 'updateOemTmpCmvalues' });
        }
      }
    },
    // 获取临时OE价格
    *fetchOemTmpPrice({ payload }, { call, put, select }) {
      const { OEM_TMP_PRICE } = yield select(state => state.oe_tmp);
      const api = qs.stringify(payload);
      if (OEM_TMP_PRICE.api !== api) {
        // 先清空缓存
        yield put({ type: 'updateOemTmpPrice' });
        const res = yield call(request, { fnName: 'OEM_TMP_PRICE', params: payload });
        if (res.code === 0) {
          yield put({ type: 'updateOemTmpPrice', payload: {api, data: res.data} });
        } else {
          msg(res);
          yield put({ type: 'updateOemTmpPrice' });
        }
      }
    },
    // 临时OE表中distinct 产品名
    *fetchOemTmpPartname({ payload , isInit }, { call, put, select }) {
      const { OEM_TMP_PARTNAME } = yield select(state => state.oe_tmp);
      if (OEM_TMP_PARTNAME.length === 0 || isInit) {
        const res = yield call(request, { fnName: 'OEM_TMP_PARTNAME', params: payload });
        if (res.code === 0) {
          yield put({ type: 'updateOemTmpPartname', payload: res.data });
        } else {
          msg(res);
          yield put({ type: 'updateOemTmpPartname' });
        }
      }
    },
    // 临时OE表中distinct 所属车型品牌名
    *fetchOemTmpCmbrand({ payload, isInit }, { call, put, select }) {
      const { OEM_TMP_CMBRAND } = yield select(state => state.oe_tmp);
      if (OEM_TMP_CMBRAND.length === 0 || isInit) {
        const res = yield call(request, { fnName: 'OEM_TMP_CMBRAND', params: payload });
        if (res.code === 0) {
          yield put({ type: 'updateOemTmpCmbrand', payload: res.data });
        } else {
          msg(res);
          yield put({ type: 'updateOemTmpCmbrand' });
        }
      }
    },
    // 删除临时OE相关数据
    *fetchOemTmpDel({ payload, callback }, { call }) {
      const res = yield call(request, { fnName: 'OEM_TMP_DEL', data: payload });
      if (res.code === 0) {
        callback();
      } else {
        msg(res);
      }
    },
    // 归类临时OE相关数据
    *fetchOemTmpMark({ payload, callback }, { call }) {
      const res = yield call(request, { fnName: 'OEM_TMP_MARK', data: payload });
      if (res.code === 0) {
        callback();
      } else {
        msg(res);
      }
    },
    // 零件品类树
    *fetchCategoryTree({ payload }, { call, put, select }) {
      const { CATEGORY_TREE } = yield select(state => state.oe_tmp);
      if (CATEGORY_TREE.length === 0) {
        const res = yield call(request, {
          fnName: 'category_tree',
          params: payload
        });
        if (res.code === 0) {
          // 生成树数据keys
          const list = [...res.data];
          const loopKeys = (data, init = '0') => {
            let count = 0;
            for (let i = 0; i < data.length; i++) {
              const it = data[i];
              it.keys = init + '-' + count++;
              if (it.children) {
                loopKeys(it.children, it.keys);
              }
            }
          };
          loopKeys(list);
          yield put({
            type: 'updateCategoryTree',
            payload: list
          });
        } else {
          msg(res);
          yield put({ type: 'updateCategoryTree' });
        }
      }

    },
    // 获取品类信息
    *fetchCategoryInfo({ payload }, { call, put, select }) {
      const res = yield call(request, { fnName: 'category_info', params: payload });
      if (res.code == 0) {
        yield put({
          type: 'updateCategoryInfo',
          payload: res.data
        });
      } else {
        msg(res);
        yield put({ type: 'updateCategoryInfo' });
      }
    },
  },

  reducers: {
    updateOemTmpList(state, { payload }) {
      return payload ? { ...state, OEM_TMP_LIST: payload } : { ...state, OEM_TMP_LIST: emptyOemTmpList };
    },
    updateFields(state, { payload }) {
      return payload ? { ...state, FIELDS: payload } : { ...state, FIELDS: emptyFields };
    },
    updateOemTmpCmvalues(state, { payload }) {
      return payload ? { ...state, OEM_TMP_CMVALUES: payload } : { ...state, OEM_TMP_CMVALUES: emptyOemTmpCmvalues };
    },
    updateOemTmpPrice(state, { payload }) {
      return payload ? { ...state, OEM_TMP_PRICE: payload } : { ...state, OEM_TMP_PRICE: emptyData };
    },
    updateOemTmpPartname(state, { payload }) {
      return payload ? { ...state, OEM_TMP_PARTNAME: payload } : { ...state, OEM_TMP_PARTNAME: emptyArr };
    },
    updateOemTmpCmbrand(state, { payload }) {
      return payload ? { ...state, OEM_TMP_CMBRAND: payload } : { ...state, OEM_TMP_CMBRAND: emptyArr };
    },
    updateCategoryTree(state, { payload }) {
      return payload ? { ...state, CATEGORY_TREE: payload } : { ...state, CATEGORY_TREE: emptyArr };
    },
    updateCategoryInfo(state, { payload }) {
      return payload ? { ...state, CATEGORY_INFO: payload } : { ...state, CATEGORY_INFO: emptyObj };
    },
  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen((location, action) => {
        const { pathname } = location;
        // 初始化
        if (pathname.indexOf('/oe/tmp') > -1) {
          dispatch({
            type: 'fetchOemTmpList',
            payload: emptyFields,
            isInit: true
          });
          dispatch({
            type: 'fetchOemTmpPartname',
            isInit: true
          });
          dispatch({
            type: 'fetchOemTmpCmbrand',
            isInit: true
          });
          dispatch({ 
            type: 'fetchCategoryTree', 
            payload: 'norequire'
          });
        }
      });
    }
  }
};
