import { request } from '@/utils/http';
import msg from '@/utils/msg';

const emptyFields = {
  std_partsku_status: '', // 数据状态
  merge: '', // 只显示是否可合并
  page: 1,
  perpage: 10,
};
const emptyStdSkuList = {
  count: 0,
  list: [],
};
const emptyCategoryTree = [];

export default {
  namespace: 'std_sku_list',

  state: {
    INIT_FIELD:[],
    searchFields: emptyFields, // 标准码查询表单参数
    stdSkuList: emptyStdSkuList, // 标准码列表数据
    categoryTree: emptyCategoryTree, // 零件树数据
    cachedIndexFlag: false, // 首页接口缓存标识【列表数据，零件树数据】
    BRAND_CATEGORY: []
  },

  effects: {
    *pageInit({ payload }, { call, put, select, all }) {
      yield all([
        yield put({ type: 'fetchCategoryTree', payload: 'norequire' }),
      ]);
      const init_fields = yield select(state => state.std_sku_list.INIT_FIELD);
      const { searchFields } =  yield select(state => state.std_sku_list );
      // console.log(init_fields,'init_fields');
      if(init_fields.category_id) {
        yield put({ type: 'fetchStdSkuList', payload:  {...searchFields, category_id: init_fields.category_id}  });
        // yield put({
        //   type: 'saveStdSkuListParams',
        //   payload: { ...searchFields, category_id: init_fields.category_id }
        // });
      }
    },
    // 获取标准码列表
    *fetchStdSkuList({ payload }, { call, put }) {
      const params = {
        page: payload.page,
        perpage: payload.perpage,
        category_id: payload.category_id
          ? payload.category_id[payload.category_id.length - 1]
          : '',
        std_partsku_status: payload.std_partsku_status,
        std_partsku_code: payload.std_partsku_code,
        oem_partsku_code: payload.oem_partsku_code,
        exception_status: payload.exception_status,
        merge: payload.merge,
      };
      const res = yield call(request, {
        fnName: 'stdsku_list',
        params
      });
      if (res.code === 0) {
        payload.cb && payload.cb();
        yield put({ type: 'saveStdSkuList', payload: res.data });
        yield put({ type: 'updateCachedIndexFlag', payload: true });

        yield put({
          type: 'saveStdSkuListParams',
          payload: payload
        });
      } else {
        msg(res);
      }
    },
    // 获取零件树数据
    *fetchCategoryTree({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'category_tree',
        params: 'norequire',
      });
      if (res.code === 0) {
        yield put({ type: 'saveCategoryTree', payload: res.data });
        const { searchFields } = yield select(state => state.std_sku_list);

        if(res.data.length > 0) {

          if(!searchFields.category_id) {
            const INIT_FIELD = [];
            INIT_FIELD.push(res.data[0].category_id);
            res.data[0].children && INIT_FIELD.push(res.data[0].children[0].category_id);
    
            //初始化initField
            yield put({
              type: 'initField',
              payload: {  category_id: INIT_FIELD,...emptyFields }
            });
          }else{
            yield put({
              type: 'initField',
              payload: {  category_id: searchFields.category_id,...emptyFields }
            });
          }
      
        }

      } else {
        msg(res);
      }
    },
    // 复制标准码
    *fetchStdskuCopy({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'stdsku_copy',
        data: payload,
      });
      if (res.code === 0) {
        const { searchFields } = yield select(state => state.std_sku_list);
        msg('标准码复制成功');
        // 重新拉取列表
        yield put({ type: 'fetchStdSkuList', payload: { ...searchFields, page: 1 } });
      } else {
        msg(res);
      }
    },
    // 根据品类id获取品类&产品
    *fetchBrandCategory({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'brand_category',
        params: payload,
      });
      if (res.code === 0) {
        // 重新拉取列表
        yield put({ type: 'updateBrandCategory', payload: res.data });
      } else {
        msg(res);
      }
    },
  },

  reducers: {
    // 保存标准码列表
    saveStdSkuList(state, { payload }) {
      return payload
        ? { ...state, stdSkuList: payload }
        : { ...state, stdSkuList: emptyStdSkuList };
    },
    // 保存标准码列表查询参数
    saveStdSkuListParams(state, { payload }) {
      return payload
        ? { ...state, searchFields: payload }
        : { ...state, searchFields: emptyFields };
    },
    // 保存零件树数据
    saveCategoryTree(state, { payload }) {
      // 增加label字段
      const setLable = list => {
        list.forEach(item => {
          item.label = item.title;
          item.value = item.key;
          delete item.title;
          if (item.children) {
            setLable(item.children);
          }
        });
        return list;
      };
      return payload
        ? { ...state, categoryTree: setLable(payload) }
        : { ...state, categoryTree: emptyCategoryTree };
    },
    // 更新首页接口缓存标识
    updateCachedIndexFlag(state, { payload }) {
      return { ...state, cachedIndexFlag: payload };
    },
    updateBrandCategory(state, { payload }) {
      return { ...state, BRAND_CATEGORY: payload || [] };
    },
    initField(state, { payload }) {
      return { ...state, INIT_FIELD: payload };
    }
  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname }, action) => {
        //初始化
        const _pName = pathname.toLowerCase();
        const pages = ['/standardcode/list', '/standardcode/list/'];
        if (pages.some(v => v === _pName)) {
          dispatch({ type: 'pageInit' });
        }
        // 离开页面，清空缓存
        if (pathname.indexOf('standardcode/list') == -1) {
          const types = [
            'saveStdSkuList',
            'saveStdSkuListParams',
            'saveCategoryTree',
            'updateCachedIndexFlag',
          ];
          types.forEach(type => dispatch({ type: type }));
        }
      });
    },
  },
};
