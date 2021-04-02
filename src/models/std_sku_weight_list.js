import { request } from '@/utils/http';
import msg from '@/utils/msg';

const emptyFields = {
    all_brand_id: '',
    std_weight_type: 'TENANT',
    category_id: '',
    std_weight_num_min: '',
    std_weight_num_max: '',
    page: 1,
    perpage: 10
};
const emptyCategoryTree = [];
const emptyPartSkuBrand = [];
const emptyStdSkuWeightList = {
    count: 0,
    list: []
};

export default {
    namespace: 'std_sku_weight_list',

    state: {
        searchFields: emptyFields,
        categoryTree: emptyCategoryTree,
        partSkuBrand: emptyPartSkuBrand,
        stdSkuWeightList: emptyStdSkuWeightList
    },

    effects: {
        // 获取品牌名称下拉框数据
        *fetchPartSkuBrand({ payload }, { call, put }) {
            const res = yield call(request, {
                fnName: 'partsku_brand',
                params: payload
            });
            if(res.code === 0) {
                yield put({ type: 'savePartSkuBrand', payload: res.data });
            } else {
                msg(res);
            }
        },
        // 获取零件树数据
        *fetchCategoryTree({ payload }, { call, put }) {
            const res = yield call(request, {
                fnName: 'category_tree',
                params: 'norequire'
            });
            if(res.code === 0) {
                yield put({ type: 'saveCategoryTree', payload: res.data });
            } else {
                msg(res);
            }
        },
        // 获取通用权重列表
        *fetchStdSkuWeightList({ payload }, { call, put }) {
            const res = yield call(request, {
                fnName: 'stdsku_weight_list',
                params: {
                    page: payload.page,
                    perpage: payload.perpage,
                    std_weight_type: payload.std_weight_type,
                    all_brand_id: payload.all_brand_id,
                    category_id: payload.category_id,
                    std_weight_num_min: payload.std_weight_num_min,
                    std_weight_num_max: payload.std_weight_num_max
                }
            });
            if(res.code === 0) {
                payload.cb && payload.cb();
                yield put({ type: 'saveStdSkuWeightList', payload: res.data });
            } else {
                msg(res);
            }
        },
        // 更新通用权重
        *updateStdSkuWeight({ payload }, { call, put }) {
            const res = yield call(request, {
                fnName: 'stdsku_weight_update',
                data: {
                    std_weight_id: payload.std_weight_id,
                    std_weight_num: payload.std_weight_num
                }
            });
            if(res.code === 0) {
                payload.cb && payload.cb();
                msg('设置成功');
                // 手动修改列表的数据
                let stdSkuWeightList = window.g_app._store.getState().std_sku_weight_list.stdSkuWeightList;
                let newList = stdSkuWeightList.list.map(item => {
                    if(item.std_weight_id == payload.std_weight_id) {
                        return {...item, std_weight_num: payload.std_weight_num};
                    } else {
                        return item;
                    }
                });
                yield put({ type: 'saveStdSkuWeightList', payload: {...stdSkuWeightList, list: newList} });
            } else {
                msg(res);
            }
        }
    },

    reducers: {
        // 保存品牌名称下拉框数据
        savePartSkuBrand(state, { payload }) {
            return payload ? { ...state, partSkuBrand: payload } : { ...state, partSkuBrand: emptyPartSkuBrand };
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
            return payload ? { ...state, categoryTree: setLable(payload) } : { ...state, categoryTree: emptyCategoryTree };
        },
        // 保存通用权重列表数据
        saveStdSkuWeightList(state, { payload }) {
            return payload ? { ...state, stdSkuWeightList: payload } : { ...state, stdSkuWeightList: emptyStdSkuWeightList };
        },
        // 保存通用权重列表查询参数
        saveStdSkuWeightListParams(state, { payload }) {
            return payload ? { ...state, searchFields: payload } : { ...state, searchFields: emptyFields };
        }
    },

    subscriptions: {
        setup({ history, dispatch }) {
            return history.listen(({ pathname }, action) => {
                // 离开页面，清空缓存
                if(pathname.indexOf('standardcode/weight') == -1) {
                    const types = ['savePartSkuBrand', 'saveCategoryTree', 'saveStdSkuWeightList', 'saveStdSkuWeightListParams'];
                    types.forEach(type => dispatch({type: type}));
                }
            });
        }
    }

};