import { request } from '@/utils/http';
import msg from '@/utils/msg';

const emptyArray = [];
const emptyFields = {
  page: 1,
  perpage: 10,
};

const emptyFmsParts = {
  BrandIds: [],
  categorys: [],
};

const emptyFmsPartskus = {
  list: [],
  count: 0,
};

export default {
  namespace: 'fms_parts_list',

  state: {
    CATEGORY_TREE: emptyArray,
    FMS_BRANDS: emptyArray,
    FMS_PARTS: emptyFmsParts,
    FIELDS: emptyFields,
    FMS_PARTSKUS: emptyFmsPartskus,
    IS_INIT: false,
  },

  effects: {
    /** 页面初始化 */
    *pageInit({ payload }, { call, put, select, all }) {
      const { IS_INIT, FIELDS } = yield select(state => state.fms_parts_list);
      if (IS_INIT) return;

      const fetchCategoryTree = yield put({ type: 'fetchCategoryTree' });
      yield fetchCategoryTree;
      const { CATEGORY_TREE } = yield select(state => state.fms_parts_list);
      let brand_category_id = '';
      let fms_brand_id = '';
      let fms_part_id = '';
      let fms_category_id = '';
      if (FIELDS.brand_category_id) {
        brand_category_id = FIELDS.brand_category_id;
      } else if (CATEGORY_TREE.length > 0) {
        brand_category_id = CATEGORY_TREE[0].category_id;
        const fetchFmsBrands = yield put({
          type: 'fetchFmsBrands',
          payload: { brand_category_id },
        });
        yield fetchFmsBrands;
      }
      const { FMS_BRANDS } = yield select(state => state.fms_parts_list);
      if (FIELDS.fms_brand_id) {
        fms_brand_id = FIELDS.fms_brand_id;
      } else if (FMS_BRANDS.length > 0) {
        fms_brand_id = FMS_BRANDS[0].fms_brand_id;
        const fetchFmsParts = yield put({
          type: 'fetchFmsParts',
          payload: {
            brand_category_id,
            fms_brand_id,
          },
        });
        yield fetchFmsParts;
      }

      const { FMS_PARTS } = yield select(state => state.fms_parts_list);
      const { categorys, BrandIds } = FMS_PARTS;
      if (FIELDS.fms_part_id) {
        fms_part_id = FIELDS.fms_part_id;
      } else if (categorys.length > 0) {
        fms_part_id = categorys[0].fms_part_id;
      }
      if (FIELDS.fms_category_id) {
        fms_category_id = FIELDS.fms_category_id;
      } else if (BrandIds.length > 0) {
        fms_category_id = BrandIds[0].fms_category_id;
      }

      let fields = {
        ...FIELDS,
        brand_category_id,
        fms_brand_id,
        fms_part_id,
        fms_category_id,
      };
      if (brand_category_id && fms_brand_id && fms_part_id && fms_category_id) {
        // 获取产品列表
        yield put({
          type: 'fetchFmsPartskus',
          payload: fields,
        });
      }

      // 加载完毕标识
      yield put({
        type: 'updateIsInit',
        payload: true,
      });
    },

    // 获取品类下拉列表
    *fetchCategoryTree({ payload }, { call, put, select }) {
      const res = yield call(request, { fnName: 'category_tree' });
      if (res.code === 0) {
        yield put({ type: 'updateCategoryTree', payload: res.data });
      } else {
        yield put({ type: 'updateCategoryTree' });
        msg(res.msg);
      }
    },

    // 获取品牌下拉列表
    *fetchFmsBrands({ payload }, { call, put, select }) {
      const res = yield call(request, { fnName: 'fms_brand_getFamousId', params: payload });
      if (res.code === 0) {
        yield put({
          type: 'updateFmsBrands',
          payload: res.data,
        });
      } else {
        yield put({
          type: 'updateFmsBrands',
        });
        msg(res.msg);
      }
    },

    // 获取大厂产品下拉列表
    *fetchFmsParts({ payload }, { call, put, select }) {
      const res = yield call(request, { fnName: 'fms_brand_famousIdCategory', params: payload });
      if (res.code === 0) {
        const { BrandIds = [], categorys = [] } = res.data;
        yield put({
          type: 'updateFmsParts',
          payload: {
            BrandIds,
            categorys,
          },
        });
      } else {
        yield put({
          type: 'updateFmsParts',
        });
        msg(res.msg);
      }
    },

    // 产品列表
    *fetchFmsPartskus({ payload }, { call, put, select }) {
      const { fms_brand_id, fms_part_id, fms_category_id } = payload;
      // console.log('fetchFmsPartskus', payload);

      if (fms_brand_id && fms_part_id && fms_category_id) {
        let params = { ...payload };
        delete params.brand_category_id;
        const res = yield call(request, { fnName: 'fms_partskus', params });
        if (res.code === 0) {
          yield put({ type: 'updateFmsPartskus', payload: res.data });
          // 缓存查询参数
          yield put({
            type: 'updateFields',
            payload,
          });
        } else {
          yield put({ type: 'updateFmsPartskus' });
          msg(res.msg);
        }
      }
    },

    // 更新配件状态
    *fetchFmsStatusUpdate({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'fms_status_update',
        data: payload,
      });

      if (res.code === 0) {
        msg('更改状态成功');
        // 手动更新页面状态
        const { FMS_PARTSKUS } = yield select(state => state.fms_parts_list);
        const { fms_partsku_id, fms_partsku_status } = payload;
        const newList = FMS_PARTSKUS.list.map(v => {
          return { ...v, fms_partsku_status: v.fms_partsku_id == fms_partsku_id ? fms_partsku_status : v.fms_partsku_status };
        });
        yield put({ type: 'updateFmsPartskus', payload: { ...FMS_PARTSKUS, list: newList } });
      } else {
        // res.code === 21023
        msg(res.msg);
      }
      payload.cb && payload.cb(res);
    },
    // 删除配件
    *delFmsPart({ payload, cb }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'fms_partskus_del',
        data: payload,
      });

      if (res.code === 0) {
        msg('删除成功');
        const { FMS_PARTSKUS } = yield select(state => state.fms_parts_list);
        let newList = FMS_PARTSKUS.list.filter(v => !payload.fms_partsku_ids.includes(v.fms_partsku_id));
        // 移除被删除的勾选数据
        yield put({ type: 'updateFmsPartskus', payload: { ...FMS_PARTSKUS, list: newList } });
        cb && cb();
      } else {
        msg(res.msg);
      }
    },
  },

  reducers: {
    updateCategoryTree(state, { payload }) {
      return { ...state, CATEGORY_TREE: payload || emptyArray };
    },
    updateFmsBrands(state, { payload }) {
      return { ...state, FMS_BRANDS: payload || emptyArray };
    },
    updateFmsParts(state, { payload }) {
      return { ...state, FMS_PARTS: payload || emptyFmsParts };
    },
    updateFields(state, { payload }) {
      return { ...state, FIELDS: payload || emptyFields };
    },
    updateFmsPartskus(state, { payload }) {
      return { ...state, FMS_PARTSKUS: payload || emptyFmsPartskus };
    },
    updateIsInit(state, { payload }) {
      return { ...state, IS_INIT: payload || false };
    },
  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname }, action) => {});
    },
  },
};
