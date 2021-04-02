import { request } from '@/utils/http';
import msg from '@/utils/msg';
import { clone, isArray, isObject } from '@/utils/tools';
import carmodelBaseInfoConfig from '@/assets/json/carmodelBaseInfo.json';
const emptyFields = {
  vinCode: ''
};
const emptyCarmodelOriginInfo = { stdCarmodel: [], originCarmodel: {} };
export default {
  namespace: 'vinQuery',

  state: {
    VIN_QUERY: [],
    FIELDS: emptyFields,
    CARMODEL_ORIGIN_INFO: emptyCarmodelOriginInfo
  },

  effects: {
    // vin查询
    *fetchVinQuery({ payload, callback }, { call, put, select }) {
      const vinCode = (payload.vinCode || '').replace(/-/g, '');

      const res = yield call(request, {
        fnName: 'vin_vinQuery',
        data: { vinCode }
      });
      if (res.code === 0) {
        yield put({
          type: 'updateVinQuery',
          payload: res.data
        });
        yield put({
          type: 'updateFields',
          payload: { vinCode }
        });
        callback(res.data);
      } else {
        msg(res);
        yield put({
          type: 'updateVinQuery'
        });
        yield put({
          type: 'updateFields'
        });
        callback([]);
      }
    },
    // 获取源车型详情
    *fetchCarmodelOriginInfo({ payload }, { call, put }) {
      const res = yield call(request, {
        fnName: 'carmodel_origin_info',
        params: payload
      });
      if (res.code === 0) {
        const { stdCarmodel = {}, originCarmodel = {} } = res.data;
        let baseInfo = clone(carmodelBaseInfoConfig);
        baseInfo.forEach(cate => {
          for (const key in stdCarmodel) {
            const item = stdCarmodel[key];
            let d = {};
            if (isArray(item) && item.length) {
              d = item[0];
            }
            if (isObject(item)) {
              d = item;
            }
            if (cate.key == key) {
              cate.list.forEach(sub => {
                for (const k in d) {
                  const val = d[k];
                  if (k == sub.key) {
                    sub.val = val || '';
                    sub.edit = false;
                  }
                }
              });
            }
          }
        });
        yield put({
          type: 'updateCarmodelOriginInfo',
          payload: { stdCarmodel: baseInfo, originCarmodel }
        });

      } else {
        msg(res);
        yield put({
          type: 'updateCarmodelOriginInfo'
        });
      }
    },
    *fetchWhiteList({data},{call}){
      const res = yield call(request, {
        fnName: 'vin_white_list',
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
    updateVinQuery(state, { payload }) {
      return { ...state, VIN_QUERY: payload || [] };
    },
    updateFields(state, { payload }) {
      return { ...state, FIELDS: payload || emptyFields };
    },
    updateCarmodelOriginInfo(state, { payload }) {
      return { ...state, CARMODEL_ORIGIN_INFO: payload || emptyCarmodelOriginInfo };
    },
  },

  subscriptions: {},
};
