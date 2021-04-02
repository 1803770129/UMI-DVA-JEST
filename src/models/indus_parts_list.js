import { request } from '@/utils/http';
import msg from '@/utils/msg';

const emptyArray = [];
const emptyFields = {
  page: 1,
  perpage: 10,
};

const emptyIndusParts = {
  BrandIds: [],
  categorys: [],
};

const emptyIndusPartskus = {
  list: [],
  count: 0,
};

export default {
  namespace: 'indus_parts_list',

  state: {
    CATEGORY_TREE: emptyArray,
    INDUS: emptyArray,
    INDUS_PARTS: emptyIndusParts,
    FIELDS: emptyFields,
    INDUS_PARTSKUS: emptyIndusPartskus,
    IS_INIT: false,
  },

  effects: {
    *pageInit({ payload }, { call, put, select, all }) {
      const { IS_INIT, FIELDS } = yield select(state => state.indus_parts_list);
      if (IS_INIT) return;
      const fetchCategoryTree = yield put({ type: 'fetchCategoryTree' });
      yield fetchCategoryTree;
      const { CATEGORY_TREE } = yield select(state => state.indus_parts_list);
      let brand_category_id = '',
        indus_brand_id = '',
        indus_part_id = '',
        indus_category_id = '';
      if (FIELDS.brand_category_id) {
        brand_category_id = FIELDS.brand_category_id;
      } else if (CATEGORY_TREE.length > 0) {
        brand_category_id = CATEGORY_TREE[0].category_id;
        const fetchIndus = yield put({
          type: 'fetchIndus',
          payload: { brand_category_id },
        });
        yield fetchIndus;
      }
      const { INDUS } = yield select(state => state.indus_parts_list);
      if (FIELDS.indus_brand_id) {
        indus_brand_id = FIELDS.indus_brand_id;
      } else if (INDUS.length > 0) {
        indus_brand_id = INDUS[0].indus_brand_id;
        const fetchIndusParts = yield put({
          type: 'fetchIndusParts',
          payload: { brand_category_id, indus_brand_id },
        });
        yield fetchIndusParts;
      }

      const { INDUS_PARTS } = yield select(state => state.indus_parts_list);

      const { categorys, BrandIds } = INDUS_PARTS;
      if (FIELDS.indus_part_id) {
        indus_part_id = FIELDS.indus_part_id;
      } else if (categorys.length > 0) {
        indus_part_id = categorys[0].indus_part_id;
      }
      if (FIELDS.indus_category_id) {
        indus_category_id = FIELDS.indus_category_id;
      } else if (BrandIds.length > 0) {
        indus_category_id = BrandIds[0].indus_category_id;
      }

      let fields = {
        ...FIELDS,
        brand_category_id,
        indus_brand_id,
        indus_category_id,
        indus_part_id,
      };

      if (indus_brand_id && indus_category_id && indus_part_id) {
        // 获取产品列表
        yield put({
          type: 'fetchIndusPartskus',
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
    *fetchCategoryTree({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'category_tree' });
      if (res.code === 0) {
        yield put({ type: 'updateCategoryTree', payload: res.data });
      } else {
        yield put({ type: 'updateCategoryTree' });
        msg(res.msg);
      }
    },

    // 行业协会
    *fetchIndus({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'indus_getIndsIdByBrandId', params: payload });
      if (res.code === 0) {
        yield put({ type: 'updateIndus', payload: res.data });
      } else {
        yield put({ type: 'updateIndus' });
        msg(res.msg);
      }
    },

    // 获取产品下拉列表
    *fetchIndusParts({ payload }, { call, put }) {
      const res = yield call(request, {
        fnName: 'indus_indusyBrandId',
        params: payload,
      });
      if (res.code == 0) {
        yield put({
          type: 'updateIndusParts',
          payload: {
            BrandIds: res.data.BrandIds,
            categorys: res.data.categorys,
          },
        });
      }
    },

    // 获取产品列表数据
    *fetchIndusPartskus({ payload }, { call, put, select }) {
      const { indus_brand_id, indus_category_id, indus_part_id } = payload;
      if (indus_brand_id && indus_category_id && indus_part_id) {
        let params = { ...payload };
        if (params.brand_category_id) {
          delete params.brand_category_id;
        } else {
          // 缓存brand_category_id
          const { FIELDS } = yield select(state => state.indus_parts_list);
          payload.brand_category_id = FIELDS.brand_category_id;
        }
        const res = yield call(request, {
          fnName: 'indus_partskus',
          params,
        });

        if (res.code === 0) {
          yield put({ type: 'updateIndusPartskus', payload: res.data });
          // 缓存查询参数

          yield put({
            type: 'updateFields',
            payload,
          });
        } else {
          yield put({ type: 'updateIndusPartskus' });
          msg(res.msg);
        }
      }
    },

    // 更新配件状态
    *fetchIndusStatusUpdate({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'indus_status_update',
        data: payload,
      });

      if (res.code === 0) {
        msg('更改状态成功');
        // 手动更新页面状态
        const { INDUS_PARTSKUS } = yield select(state => state.indus_parts_list);
        const { indus_partsku_id, indus_partsku_status } = payload;
        const list = INDUS_PARTSKUS.list.map(v => {
          return v.indus_partsku_id == indus_partsku_id ? { ...v, indus_partsku_status } : v;
        });
        yield put({ type: 'updateIndusPartskus', payload: { ...INDUS_PARTSKUS, list } });
      } else {
        msg(res.msg);
      }
    },

    // 删除配件
    *fetchIndusPartskusDel({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'indus_partskus_del',
        data: payload,
      });

      if (res.code === 0) {
        msg('删除成功');
        const { INDUS_PARTSKUS } = yield select(state => state.indus_parts_list);
        // 移除被删除的勾选数据
        yield put({ type: 'updateIndusPartskus', payload: { ...INDUS_PARTSKUS, list: INDUS_PARTSKUS.list.filter(v => !payload.indus_partsku_ids.includes(v.indus_partsku_id)) } });
        callback();
      } else {
        msg(res.msg);
      }
    },
  },

  reducers: {
    updateCategoryTree(state, { payload }) {
      return { ...state, CATEGORY_TREE: payload || emptyArray };
    },
    updateIndus(state, { payload }) {
      return { ...state, INDUS: payload || emptyArray };
    },
    updateIndusParts(state, { payload }) {
      return { ...state, INDUS_PARTS: payload || emptyIndusParts };
    },
    updateIndusPartskus(state, { payload }) {
      return { ...state, INDUS_PARTSKUS: payload || emptyIndusPartskus };
    },
    updateFields(state, { payload }) {
      return { ...state, FIELDS: payload || emptyFields };
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
