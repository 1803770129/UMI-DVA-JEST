import { request } from '@/utils/http';
import msg from '@/utils/msg';

const emptyManagerMpWeappList = {
  count: 0,
  tenMarkets: [],
};
const emptyFields = {
  page: 1,
  pageCount: 10
};
const emptySearch = {};
export default {
  namespace: 'markets',
  state: {
    TENANT_MARKETS: emptyManagerMpWeappList,
    FIELDS: emptySearch,
    MARKETPAGES:emptyFields
  },

  effects: {
    * fetchMarketsTenantsWeappList({ payload }, { call, put }) {
      let params = {
        page: payload.page,
        pageCount: payload.pageCount
      };
      const res = yield call(request, {
        fnName: 'get_marker_tens',
        params: payload,
      });
      if (res.code === 0) {
        yield put({
          type:'savePages',
          payload:params
        });
        // yield put({
        //   type: 'rememberSearchMarketsData',
        //   payload: payload,
        // });
        yield put({
          type: 'updateMarketTenantsList',
          payload: res.data,
        });

      } else {
        msg(res);
        yield put({
          type: 'updateMarketTenantsList',
        });
      }
    },
  },

  reducers: {
    savePages(state, { payload }) {
      return payload ? { ...state, MARKETPAGES: payload } : { ...state, MARKETPAGES: emptyFields };
    },
    updateMarketTenantsList(state, { payload }) {
      return { ...state, TENANT_MARKETS: payload || emptyManagerMpWeappList };
    },

    rememberSearchMarketsData(state, { payload }) {
      return {
        ...state,
        FIELDS: payload || emptySearch,
      };
    },
  },

  subscriptions: {},
};
