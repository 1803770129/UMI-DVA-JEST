import { request } from '@/utils/http';
import { isEmpty } from '@/utils/tools';
import msg from '@/utils/msg';
import qs from 'querystringify';
import { Modal, Table } from 'antd';
import shallowequal from 'shallowequal';
import { clearState } from '@/utils/tools';

const emptyOemskuList = {
  api: '',
  list: [],
  count: 0
};
const emptyFields = {
  page: 1,
  perpage: 10,
};
const emptyArr = [];

export default {
  namespace: 'oe',

  state: {
    FIELDS: emptyFields,
    OEMSKU_LIST: emptyOemskuList,
    CATEGORY_TREE: emptyArr,
    CARMODEL_CM_BRAND_LIST: emptyArr,
    BRAND_FAC_MOD_APPROVED_LIST: emptyArr,
    CARMODEL_CMINFO_DISPLACEMENT_LIST: emptyArr,
    CARMODEL_PRO_LIST: emptyArr,
    OEMSKU:[],
    OEMSKUA:[],
    oemField:[]
  },

  effects: {
    *pageInit({ payload }, { call, put, select, all }) {
      yield all([
        yield put({ type: 'fetchCategoryTree', payload: 'norequire' }),
        yield put({ type: 'fetchCarmodelCmbrandList' }),
        yield put({ type: 'fetchBrandFacModListApproved' }),
      ]);
      // 获取车型属性列表, 用于配置动态属性查询条件
      yield put({ type: 'fetchCarmodelProList', payload: { type: 'baseorigin' } });
      const { FIELDS } = yield select(state => state.oe);
      yield put({ type: 'fetchOemskuList', payload: { params: FIELDS, isForce: true } });
      yield put({ type: 'fetchOemsku', payload: { category_id: FIELDS.category_id[1]} });
      yield put({ type: 'fetchOemskua', payload: { category_id: FIELDS.category_id[1]} });
    },

    // oem-获取oem_partsku_id列表
    *fetchOemskuList({ payload }, { call, put, select }) {
      const data = yield select(state => state.oe.OEMSKU_LIST);
      // 参数转换
      const obj = payload.params;
      let params = {};
      for (const key in obj) {
        if (!isEmpty(obj[key])) {
          if (key === 'merge') {
            if (obj[key]) {
              params[key] = 'checked';
            }
          } else if (key === 'category_id') {
            // 取品类ID
            const ids = obj.category_id;
            params[key] = ids[ids.length - 1];
          } else if (key === 'brand_fac_mod') {
            const [cm_brand = '', cm_factory = '', cm_model = ''] = obj[key];
            params.cm_brand = cm_brand;
            params.cm_factory = cm_factory;
            params.cm_model = cm_model;
          } else {
            params[key] = typeof obj[key] === 'string' ? obj[key].trim() : obj[key];
          }
        }
      }
      const api = qs.stringify(params);

      // isForce参数 强制请求一次数据
      if (data.api !== api || payload.isForce) {
        const res = yield call(request, {
          fnName: 'oemsku_list',
          params
        });
        if (res.code === 0) {
          yield put({
            type: 'updateOemskuList',
            payload: { api, list: res.data.list, count: parseInt(res.data.count, 10) }
          });
          yield put({ type: 'updateFields', payload: obj });
        } else {
          msg(res);
          yield put({ type: 'updateOemskuList' });
        }
      }
    },
    // 零件数-根据品类名称获取品类树
    *fetchCategoryTree({ payload }, { call, put, select }) {
      const data = yield select(state => state.oe.CATEGORY_TREE);
      if (data.length === 0) {
        const res = yield call(request, {
          fnName: 'category_tree',
          params: payload
        });
        if (res.code === 0) {
          yield put({
            type: 'updateCategoryTree',
            payload: res.data
          });
          let category_id = [];
          category_id.push(res.data[0].category_id);
          res.data[0].children && category_id.push(res.data[0].children[0].category_id);
          //初始化Field
          yield put({
            type: 'updateFields',
            payload: { ...emptyFields, category_id  }
          });
        } else {
          msg(res);
          yield put({ type: 'updateCategoryTree' });
        }
      }
    },
    // oem-获取车型品牌和id
    *fetchCarmodelCmbrandList({ payload }, { call, put, select }) {
      const data = yield select(state => state.oe.CARMODEL_CM_BRAND_LIST);
      if (data.length === 0) {
        const res = yield call(request, { fnName: 'carmodel_cmbrand_list' });
        if (res.code === 0) {
          yield put({ type: 'updateCarmodelCmbrandList', payload: res.data });
        } else {
          msg(res);
          yield put({ type: 'updateCarmodelCmbrandList' });
        }
      }
    },
    // 获取品牌主机厂车型（审核通过）
    *fetchBrandFacModListApproved({ payload }, { call, put, select }) {
      const data = yield select(state => state.oe.BRAND_FAC_MOD_APPROVED_LIST);
      if (data.length === 0) {
        const res = yield call(request, { fnName: 'carmodel_brand_fac_mod_list_approved' });
        if (res.code === 0) {
          // 增加label字段
          const loop = list => {
            return list.map(item => {
              return item.c ? { ...item, l: item.v, c: loop(item.c) } : { ...item, l: item.v };
            });
          };
          yield put({ type: 'updateBrandfacmodapprovedlist', payload: loop(res.data) });
        } else {
          msg(res);
          yield put({ type: 'updateBrandfacmodapprovedlist' });
        }
      }
    },
    // oemsku审核
    *fetchOemskuApprove({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'oemsku_approve',
        data: payload
      });
      /** "failList": [{ "oem_partsku_id": 1, "err": "没有对应的车型" }]  */
      if (res.code === 0) {
        const { failList } = res.data;
        if (failList.length === 0) {
          msg('操作成功');
        } else {
          const OEMSKU_LIST = yield select(state => state.oe.OEMSKU_LIST);
          // 若有错误值返回 - 弹出模态框展示
          const columns = [
            {
              title: 'OE码',
              dataIndex: 'oem_partsku_codes',
              render: (text, record, index) => {
                const { oem_partsku_codes } = record;
                return oem_partsku_codes.length > 0 ? oem_partsku_codes.map((v, i) => <div key={i}>{v}</div>) : '';
              }
            },
            { title: '失败原因', dataIndex: 'err' }
          ];
          // 构造表格数据
          const dataSource = failList.map(v => {
            const filter = OEMSKU_LIST.list.filter(o => o.oem_partsku_id === v.oem_partsku_id);
            if (filter.length > 0) {
              const { oem_partsku_codes } = filter[0];
              return {
                ...v,
                oem_partsku_codes: oem_partsku_codes.length > 0 ? oem_partsku_codes : ['虚拟OE']
              };
            } else {
              // 此情况不会出现，只是避免前端显示错误
              return { ...v, oem_partsku_codes: [] };
            }
          });

          const tableProps = {
            bordered: true,
            pagination: false,
            rowKey: (item, index) => index,
            columns,
            dataSource
          };

          // 添加错误提示
          Modal.warning({
            title: '提示',
            okText: '确认',
            cancelText: '取消',
            content: <Table {...tableProps} />,
            closable: true,
            onOk: () => { }
          });
        }

        payload.cb && payload.cb();
      } else {
        msg(res);
      }
    },

    *fetchCarmodelGetCminfoBytype({ payload, callback }, { call, put }) {
      const res = yield call(request, {
        fnName: 'carmodel_getCminfoBytype',
        params: payload
      });
      if (res.code === 0) {
        callback(res.data);
      } else {
        msg(res);
        callback();
      }

    },

    // 获取车型属性列表
    *fetchCarmodelProList({ payload, callback }, { select, call, put }) {
      const { CARMODEL_PRO_LIST } = yield select(state => state.oe);
      if(CARMODEL_PRO_LIST.length === 0) {
        const res = yield call(request, {
          fnName: 'carmodel_pro_list',
          params: payload
        });
        if(res.code === 0) {
          yield put({
            type: 'updateCarmodelProList',
            payload: res.data
          });
        }else{
          msg(res);
          yield put({
            type: 'updateCarmodelProList'
          });
        }
      }
    },
    *fetchOemsku({ payload }, {  put, call }){
      const res = yield call(request, {
        fnName: 'oemsku_pro_value',
        params:payload
      });
      if (res.code === 0) {
        yield put({
          type: 'updateOemsku',
          payload: res.data,
        });

      }else{
        msg(res);
        yield put({
          type: 'updateOemsku',
        });
      }
    },
    *fetchOemskua({ payload }, {  put, call }){
      const res = yield call(request, {
        fnName: 'oemsku_pro_value',
        params:payload
      });
      if (res.code === 0) {
        yield put({
          type: 'updateOemskua',
          payload: res.data,
        });

      }else{
        msg(res);
        yield put({
          type: 'updateOemskua',
        });
      }
    }
  },

  reducers: {
    updateOemskuList(state, { payload }) {
      return { ...state, OEMSKU_LIST: payload || emptyOemskuList };
    },
    updateOemField(state, { payload }) {
      return { ...state, oemField: payload || [] };
    },
    updateFields(state, { payload }) {
      return { ...state, FIELDS: payload || emptyFields } ;
    },
    updateCategoryTree(state, { payload }) {
      return { ...state, CATEGORY_TREE: payload || emptyArr };
    },
    updateCarmodelCmbrandList(state, { payload }) {
      return { ...state, CARMODEL_CM_BRAND_LIST: payload || emptyArr };
    },
    updateBrandfacmodapprovedlist(state, { payload }) {
      return { ...state, BRAND_FAC_MOD_APPROVED_LIST: payload || emptyArr };
    },
    updateCarmodelProList(state, { payload }) {
      return { ...state, CARMODEL_PRO_LIST: payload || emptyArr };
    },
    updateOemsku(state, { payload }) {
      return { ...state, OEMSKU: payload || [] };
    },
    updateOemskua(state, { payload }) {
      return { ...state, OEMSKUA: payload || [] };
    },

  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen((location, action) => {


      });
    }
  }
};
