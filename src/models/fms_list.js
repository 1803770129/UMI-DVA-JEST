import { request } from '@/utils/http';
import msg from '@/utils/msg';

const emptyArray = [];
const emptyFields = {
    page: 1,                                // 当前页数
    perpage: 10,                            // 每页多少条
    fms_brand_status: 'ENABLE',             // 启用状态
    fms_brand_id: ''                        // 大厂品牌
};

export default {
    namespace: 'fms_list',

    state: {
        cachedIndexFlag: false,                             // 首次加载是否完成标识
        fmsBrandDropList: emptyArray,                       // 品牌下拉列表数据
        fmsBrandsList: emptyArray,                          // 品牌列表数据
        searchFields: emptyFields                           // 品牌列表查询参数
    },

    effects: {
        // 获取大厂码列表数据
        *fetchFmsBrandsList({ payload }, { call, put, select }) {
            const res = yield call(request, {
                fnName: 'fms_brands',
                params: {
                    page: payload.page,
                    perpage: payload.perpage,
                    fms_brand_id: payload.fms_brand_id,
                    fms_brand_status: payload.fms_brand_status
                }
            });

            if(res.code === 0) {
                yield put({ type: 'saveFmsBrandsList', payload: res.data });
                yield put({ type: 'updateCachedIndexFlag', payload: true });
                
                const { searchFields } = yield select(state => state.fms_parts_id);
                yield put({ 
                    type: 'saveFmsBrandsParamsFn', 
                    payload: {...searchFields, page: payload.page, perpage: payload.perpage, fms_brand_id: payload.fms_brand_id, fms_brand_status: payload.fms_brand_status} 
                });

            } else {
                msg(res);
            }
        },
        // 获取大厂品牌下拉列表数据
        *fetchFmsBrandsDropList({ payload }, { call, put }) {
            const res = yield call(request, { fnName: 'fms_brands' });
            if(res.code === 0) {
                yield put({ type: 'saveFmsBrandsDropList', payload: res.data.list });
            } else {
                msg(res);
            }
        },
        // 删除大厂品牌数据
        *deleteFmsBrand({ payload }, { call, put, select }) {
            const res = yield call(request, { 
                fnName: 'fms_brands_del', 
                data: { fms_brand_id: payload.fms_brand_id }
            });
            if(res.code === 0) {
                msg('删除成功');
                const { fmsBrandsList } = yield select(state => state.fms_list);
                // 手动删除表格数据
                let newList = fmsBrandsList.list.filter(item => item.fms_brand_id != payload.fms_brand_id);
                yield put({ type: 'saveFmsBrandsList', payload: {...fmsBrandsList, list: newList} });
                // 重新拉取下拉列表数据
                yield put({ type: 'fetchFmsBrandsDropList' });
            } else {
                msg(res);
            }
        }
    },

    reducers: {
        // 保存大厂码列表数据
        saveFmsBrandsList(state, { payload }) {
            return payload ? { ...state, fmsBrandsList: payload } : { ...state, fmsBrandsList: emptyArray };
        },
        // 保存大厂品牌数据
        saveFmsBrandsDropList(state, { payload }) {
            return payload ? { ...state, fmsBrandDropList: payload } : { ...state, fmsBrandDropList: emptyArray };
        },
        // 保存大厂码列表查询参数
        saveFmsBrandsParamsFn(state, { payload }) {
            return payload ? { ...state, searchFields: payload } : { ...state, searchFields: emptyFields };
        },
        // 更新首页接口缓存标识
        updateCachedIndexFlag(state, { payload }) {
            return { ...state, cachedIndexFlag: payload };
        }
    },

    subscriptions: {
        setup({ history, dispatch }) {
            return history.listen(({ pathname }, action) => {
                // 离开页面，清空缓存
                if(pathname.indexOf('factorycode/factory') == -1) {
                    const types = [
                        'saveFmsBrandsList', 
                        'saveFmsBrandsDropList', 
                        'saveFmsBrandsParamsFn', 
                        'updateCachedIndexFlag'
                    ];
                    types.forEach(type => dispatch({type: type}));
                }
            });
        }
    }
};
