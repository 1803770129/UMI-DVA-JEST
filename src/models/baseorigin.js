import { request } from '@/utils/http';
import msg from '@/utils/msg';
import { isEmpty, isObject } from 'lodash';
import router from 'umi/router';
const emptyArray = [];
const emptyFields = {                                   // 车型属性筛选表单的值容器
  cm_origin: '',                          // 数据源
  review_status: 'PENDING',               // 审核状态【默认待审核】
  cm_carmodel: [],                        // 品牌主机厂车型
  carmodelProListValue: [],               // 车型属性列表【下拉框值，输入框值】
  filter_car_pro: undefined               // 关键属性值变更
};
const emptyCarmodelOriginPendingList = {
  data: [],
  count: 0,
  fields: {
    page: 1,
    perpage: 10
  }
};
const emptyCarmodelOriginPendingCount = {
  addCount: {},
  deleteCount: {},
  updateCountArr: []
};
const emptyCarmodelOriginPendingInfo = {
  pendingOrigin: [],
  approvedOrigin: [],
  pendingOriginColumns: [],
  approvedOriginColumns: []
};

export default {
  namespace: 'baseorigin',

  state: {
    // pageLoading: true,
    approveStatus: 'APPROVED',                  // 默认审核通过【批量审核选项】
    page: 1,
    perpage: 10,
    carmodelBaseList: { list: [], count: 0 },
    carmodelProList: [],                        // 车型属性列表【下拉框】
    carmodelBaseInfo: [],
    fields: emptyFields,
    approveList: [],                             // 批量审核数组
    CARMODEL_ENGINEOIL_LEVEL: emptyArray,
    CARMODEL_ENGINEOIL_SAE: emptyArray,
    carmodelProListValueCheck: [{
      'carmodelProOption-0':'cm_factory',
      'carmodelProInput-0':''
    }],
    CARMODEL_ORIGIN_PENDING_LIST: emptyCarmodelOriginPendingList,
    CARMODEL_ORIGIN_PENDING_COUNT: emptyCarmodelOriginPendingCount,
    CARMODEL_ORIGIN_PENDING_INFO: emptyCarmodelOriginPendingInfo,
    CARMODEL_ORIGIN_COLUMN_NAME: []
  },

  effects: {
    // 获取标准车型列表
    *fetchList({ payload }, { call, put }) {
      let params = {
        page: payload.page,
        perpage: payload.perpage
      };
      for (let key in payload.query) {
        params[key] = payload.query[key];
      }
      const { perpage, page } = payload;
      const res = yield call(request, { fnName: 'carmodel_base_list', params: params });
      if (res.code === 0) {
        yield put({ type: 'savelist', payload: { carmodelBaseList: res.data, perpage, page } });
      }else{
        msg(res);
      }
    },
    // 获取车型属性列表
    *fetchCarmodelProList({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'carmodel_pro_list', params: payload });
      return yield put({ type: 'saveCarmodelProList', payload: res });
    },
    // 车型详情添加
    *fetchBaseInfoAdd({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'carmodel_base_info_add', data: payload.data });
      if (res.code === 0) {
        msg('添加成功');
        // 清空临时数据
        yield put({ type: 'updateCarmodelEngineoilLevel'});
        yield put({ type: 'updateCarmodelEngineoilSae' });
      } else {
        msg(res);
      }
      payload.cb(res);
    },
    // 标准车型审核通过
    *fetchBaseOriginApprove({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'carmodel_base_origin_approve', data: { cm_ids: payload.cm_ids, review_status: payload.review_status } });
      if (res.code === 0) {
        msg('操作成功');
        if (payload.goBackFlag) {
          payload.cb();
        } else {
          // 返回标准车型列表页面
          router.goBack();
        }
      } else {
        msg(res);
      }
    },
    // 审核通过检查
    *fetchCarmodelApproveCheck({ payload, callback }, { call, put }) {
      const res = yield call(request, { fnName: 'carmodel_approve_check', data: payload });
      if (res.code === 0 || res.code === 21028 || res.code === 21029) {
        callback(res);
      } else {
        msg(res);
      }
    },
    // 标准车型clone
    *fetchCarmodelClone({ payload, index }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'carmodel_clone',
        data: payload
      });
      if (res.code === 0) {
        const { carmodelBaseList, perpage, page } = yield select(state => state.baseorigin);
        const { list } = carmodelBaseList;
        // 复制成功后，生成返回的cm_id到新数据，插入新行
        const row = {...list[index]};
        const _list = [...list];
        row.cm_clone_id = res.data.cm_id;
        _list.splice(index, 0, row);
        yield put({
          type: 'savelist',
          payload: {
            carmodelBaseList: {
              ...carmodelBaseList,
              list: _list
            },
            perpage,
            page
          }
        });
      } else {
        msg(res);
      }
    },

    // 获取待审核源车型列表
    *fetchCarmodelOriginPendingList({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'carmodel_origin_pending_list',
        params: payload
      });
      if (res.code === 0) {
        yield put({
          type: 'updateCarmodelOriginPendingList',
          payload: {
            data: res.data.result,
            count: res.data.count,
            fields: payload
          }
        });
      } else {
        msg(res);
        yield put({ type: 'updateCarmodelOriginPendingList' });
      }
    },

    // 获取待审核源车型属性变更的数量
    *fetchCarmodelOriginPendingCount({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'carmodel_origin_pending_count',
        params: payload
      });
      if (res.code === 0) {
        yield put({
          type: 'updateCarmodelOriginPendingCount',
          payload: res.data
        });
      } else {
        msg(res);
        yield put({ type: 'updateCarmodelOriginPendingCount' });
      }
    },

    // 源车型审核通过
    *fetchCarmodelOriginApproved({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'carmodel_origin_approved',
        data: payload
      });
      if (res.code === 0) {
        callback && callback();
        msg('操作成功');
      } else {
        msg(res);
      }
    },

    // 源车型审核不通过
    *fetchCarmodelOriginUnapproved({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'carmodel_origin_unapproved',
        data: payload
      });
      if (res.code === 0) {
        callback && callback();
        msg('操作成功');
      } else {
        msg(res);
      }
    },

    // 获取待审核源车型、已导入源车型详情
    *fetchCarmodelOriginPendingInfo({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'carmodel_origin_pending_info',
        params: payload
      });
      const { pendingOrigin, approvedOrigin } = res.data;
      // 获取列配置
      yield yield put({
        type: 'fetchCarmodelOriginColumnName',
        payload: { cm_origin: 'liyang' }
      });
      if (res.code === 0) {
        const { CARMODEL_ORIGIN_COLUMN_NAME } = yield select(state => state.baseorigin);
        yield put({
          type: 'updateCarmodelOriginPendingInfo',
          payload: {
            pendingOrigin: !isEmpty(pendingOrigin) ? [ pendingOrigin ] : [],
            approvedOrigin: !isEmpty(approvedOrigin) ? [ approvedOrigin ] : [],
            pendingOriginColumns: formatColumns(pendingOrigin, CARMODEL_ORIGIN_COLUMN_NAME),
            approvedOriginColumns: formatColumns(approvedOrigin, CARMODEL_ORIGIN_COLUMN_NAME)
          }
        });

        callback();
      } else {
        msg(res);
      }
    },

    // 获取源车型列配置
    *fetchCarmodelOriginColumnName({ payload }, { call, put, select }) {
      const { CARMODEL_ORIGIN_COLUMN_NAME } = yield select(state => state.baseorigin);
      if(CARMODEL_ORIGIN_COLUMN_NAME.length === 0) {
        const res = yield call(request, {
          fnName: 'carmodel_origin_column_name',
          params: payload
        });

        if (res.code === 0) {
          yield put({
            type: 'updateCarmodelOriginColumnName',
            payload: res.data
          });
        } else {
          msg(res);
        }
      }
    },



  },

  reducers: {
    // 保存标准车型列表
    savelist(state, action) {
      const { carmodelBaseList, perpage, page } = action.payload;
      return { ...state, carmodelBaseList, perpage, page };
    },
    // 保存车型属性列表
    saveCarmodelProList(state, { payload }) {
      if (payload.code == 0) {
        return {
          ...state,
          carmodelProList: payload.data
        };
      } else {
        msg(payload);
        return state;
      }
    },
    // 更新state状态
    updateState(state, action) {
      let props = action.payload;
      return {
        ...state,
        ...props
      };
    },
    // 更新model数据
    updateModel(state, { payload }) {
      return {
        ...state,
        cm_origin: payload.cm_origin,
        review_status: payload.review_status,
        cm_carmodel: payload.cm_carmodel,
        carmodelProListValue: payload.carmodelProListValue,
        fields: payload.fields
      };
    },
    updateCheckModel(state, { payload }) {
      return {
        ...state,
        carmodelProListValueCheck:payload
      };
    },
    updateCarmodelEngineoilLevel(state, { payload }) {
      return {...state, CARMODEL_ENGINEOIL_LEVEL: payload || emptyArray};
    },
    updateCarmodelEngineoilSae(state, { payload }) {
      return {...state, CARMODEL_ENGINEOIL_SAE: payload || emptyArray};
    },
    updateCarmodelOriginPendingList(state, { payload }) {
      return {...state, CARMODEL_ORIGIN_PENDING_LIST: payload || emptyCarmodelOriginPendingList};
    },
    updateCarmodelOriginPendingCount(state, { payload }) {
      return {...state, CARMODEL_ORIGIN_PENDING_COUNT: payload || emptyCarmodelOriginPendingCount};
    },
    updateCarmodelOriginPendingInfo(state, { payload }) {
      return {...state, CARMODEL_ORIGIN_PENDING_INFO: payload || emptyCarmodelOriginPendingInfo};
    },
    updateCarmodelOriginColumnName(state, { payload }) {
      return {...state, CARMODEL_ORIGIN_COLUMN_NAME: payload || []};
    },
    // 离开时清空缓存
    clearState(state) {
      return {
        ...state,
        approveStatus: 'APPROVED',                  // 默认审核通过【批量审核选项】
        page: 1,
        perpage: 10,
        carmodelBaseList: { list: [], count: 0 },
        carmodelProList: [],                        // 车型属性列表【下拉框】
        carmodelBaseInfo: [],                       // 标准车型数据
        fields: emptyFields,
        approveList: []                             // 批量审核数组容器
      };
    }
  },

  subscriptions: {}
};


/** 格式化审核源车型详情表格列 */
function formatColumns(data, config) {
  let arr = [];
  if(data && isObject(data)) {
    for (const key in data) {
      if(!key.includes('id') ) {
        let obj = {
          textWrap: 'word-break',
          dataIndex: key,
          [key]: data[key]
        };
        for(let i = 0; i < config.length; i++) {
          if(config[i].cm_pro_column === key) {
            obj.title = config[i].cm_pro_name;
            break;
          }
        }
        if(!obj.title) obj.title = key;

        arr.push(obj);
      }
    }
  }
  return arr;
  // return sortBy(arr,  ['cm_brand', 'cm_factory', 'cm_model', 'cm_conf_level', 'cm_car', 'cm_displacement', 'cm_model_year']);
}
