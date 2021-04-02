import { request, get } from '@/utils/http';
import * as api from '@/services/apiUrl';
import msg from '@/utils/msg';
import router from 'umi/router';

const emptyArray = [];
const emptyInfo = {
    fms_brand_level: '',
    categoryNames: '',
    create_by: '',
    create_time: '',
    fms_brand_desc: '',
    fms_brand_id: '',
    fms_brand_imageurl: '',
    fms_brand_name: '',
    fms_brand_status: '',
    update_by: '',
    update_time: ''
};

export default {

    namespace: 'fms_id',

    state: {
        fmsBrandDetail: emptyInfo,
        fmsCategories: emptyArray,
        fmsCategoriesParts: emptyArray
    },

    effects: {
        // 编辑时的初始化
        *fetchPageEditInit({ payload }, { call, put }) {
            let promises = [];
            promises.push(get(`${api.fms_categories}?fms_brand_id=${payload.fms_brand_id}`));
            promises.push(get(`${api.fms_categories_parts}?fms_brand_id=${payload.fms_brand_id}`));
            promises.push(get(`${api.fms_brands}?fms_brand_id=${payload.fms_brand_id}`));
            const ret = yield Promise.all(promises);
            yield put({ type: 'saveFmsCategories', payload: ret[0].data.list });
            yield put({ type: 'saveFmsCategoriesParts', payload: formatFmsCategoriesPartsFn(ret[1].data, ret[0].data.list) });
            yield put({ type: 'saveFmsBrandDetail', payload: ret[2].data.list[0] });
            payload.cb && payload.cb(ret[2].data.list[0], ret[0].data.list);
        },
        // 获取已开通产品品类列表
        *fetchFmsCategories({ payload }, { call, put }) {
            const res = yield call(request, {
                fnName: 'fms_categories',
                params: payload.fms_brand_id
            });

            if(res.code === 0) {
                yield put({ type: 'saveFmsCategories', payload: res.data });
            } else {
                msg(res.msg);
            }
        },
        // 获取产品品类列表
        *fetchFmsCategoriesParts({ payload }, { call, put }) {
            const res = yield call(request, { fnName: 'fms_categories_parts' });
            if(res.code === 0) {
                yield put({ type: 'saveFmsCategoriesParts', payload: res.data });
            } else {
                msg(res.msg);
            }
        },
        // 大厂码更新
        *updateFmsBrands({ payload }, { call, put }) {
            const res = yield call(request, {
                fnName: 'fms_brands_update',
                data: {
                    fms_brand_id: payload.fms_brand_id,
                    fms_brand_name: payload.fms_brand_name,
                    fms_brand_imageurl: payload.fms_brand_imageurl,
                    fms_brand_desc: payload.fms_brand_desc,
                    fms_brand_status: payload.fms_brand_status,
                    categories: payload.categories,
                    fms_brand_level: payload.fms_brand_level
                }
            });

            if(res.code === 0) {
                msg('更新成功');
                yield put({ type: 'fms_list/updateCachedIndexFlag', payload: false });
                router.goBack();
            } else {
                msg(res.msg);
            }
        },
        // 创建大厂码
        *createFmsBrands({ payload }, { call, put }) {
            const res = yield call(request, {
                fnName: 'fms_brands_create',
                data: {
                    fms_brand_name: payload.fms_brand_name,
                    fms_brand_imageurl: payload.fms_brand_imageurl,
                    fms_brand_desc: payload.fms_brand_desc,
                    fms_brand_status: payload.fms_brand_status,
                    categories: payload.categories,
                    fms_brand_level: payload.fms_brand_level
                }
            });

            if(res.code === 0) {
                msg('创建成功');
                yield put({ type: 'fms_list/updateCachedIndexFlag', payload: false });
                router.goBack();
            } else {
                msg(res.msg);
            }
        },
        // 品牌名称重复校验
        *fmsBrandCheck({ payload }, { call, put }) {
            const res = yield call(request, {
                fnName: 'fms_brand_check',
                data: {
                    fms_brand_id: payload.fms_brand_id,
                    fms_brand_name: payload.fms_brand_name
                }
            });
            if(res.code === 0) {
                payload.cb && payload.cb(true);
            } else {
                payload.cb && payload.cb(false);
            }
        },
        // 上传图片文件【品牌图片】
        *brandImageUpload({ payload }, { call, put }) {
            let fd = new FormData();
            fd.append('image', payload.image);
            const res = yield call(request, { fnName: 'fms_brand_image_upload', data: fd });
            if(res.code === 0) {
                payload.cb && payload.cb(res.data.file_path);
            } else {
                msg(res.msg);
            }
        }
    },

    reducers: {
        // 保存大厂码详情数据
        saveFmsBrandDetail(state, { payload }) {
            return payload ? { ...state, fmsBrandDetail: payload } : { ...state, fmsBrandDetail: emptyInfo };
        },
        // 保存已开通的产品品类列表数据
        saveFmsCategories(state, { payload }) {
            return payload ? { ...state, fmsCategories: payload } : { ...state, fmsCategories: emptyArray };
        },
        // 保存产品品类列表数据
        saveFmsCategoriesParts(state, { payload }) {
            return payload ? { ...state, fmsCategoriesParts: payload } : { ...state, fmsCategoriesParts: emptyArray };
        }
    },

    subscriptions: {
        setup({ history, dispatch }) {
            return history.listen(({ pathname }, action) => {
                // 离开页面，清空缓存
                if(pathname.indexOf(history.location.query.fms_id) === -1) {
                    const types = [
                        'saveFmsBrandDetail', 
                        'saveFmsCategories', 
                        'saveFmsCategoriesParts'
                    ];
                    types.forEach(type => dispatch({ type: type }));
                }
            });
        }
    }
};

// 格式化可开通的品类数据【由于后台接口没有返回标识告诉前端某个品类是否已被开通，所以需要前端手动标识】
function formatFmsCategoriesPartsFn(list, categories) {
    return list.map(item => {
        let obj = {};
        if(categories.map(itm => itm.brand_category_id).includes(item.brand_category_id)) {
            obj.disabled = true;
        };
        return {...item, ...obj};
    });
}