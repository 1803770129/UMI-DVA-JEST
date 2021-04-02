import { request, get } from '@/utils/http';
import * as api from '@/services/apiUrl';
import msg from '@/utils/msg';
import BraftEditor from 'braft-editor';
import qs from 'querystringify';
import ENV from '@/utils/env';
import { isEmpty } from '@/utils/tools';

const emptyEditorState = {data: {}, html: '', imgs: []};
const emptyArr = [];
const emptyObj = {};
const emptyData = {
  api: '',
  data: {}
};
const emptyDataArr = {
  api: '',
  data: []
};

export default {
  namespace: 'std_sku_id',

  state: {
    STD_SKU_ID_FIELDS: emptyObj,
    EDITOR_STATE: emptyEditorState, // 富文本编辑器 EditorState.createEmpty() 直接把editstate设置为空
    PART_PIC_LIST: emptyArr, // 上传产品图片列表
    STDSKU_INFO: emptyData, // 标准码信息
    CATEGORY_PRO: emptyArr, // 品类属性
    STDSKU_OE: emptyDataArr, //标准码对应的oe信息
    STDSKU_MATCH: emptyDataArr, // 合并标准码列表
    OEMSKU_INFO: emptyObj,
    OEMSKU_CARMODEL: emptyArr,
    OEMSKU_FILTER: emptyArr,
    CATEGORIES_FORBID: emptyArr, // 获取品类禁用数据
  },

  effects: {
    // 获取标准码信息
    *fetchStdskuInfo({ payload, isForce }, { call, put, select }) {
      const data = yield select(state => state.std_sku_id.STDSKU_INFO);
      const api = qs.stringify(payload);
      if(data.api !== api || isForce) {
        const res = yield call(request, {
          fnName: 'stdsku_info',
          params: payload
        });
        if(res.code === 0) {
          const { category_id } = res.data;
          // 获取品类禁用数据
          // yield put({ 
          //   type: 'fetchCategoriesForbid', 
          //   payload: { category_id }
          // });
          // 获取品类属性
          yield put({ 
            type: 'fetchCategoryPro', 
            payload: { category_id },
            stdsku_info: res.data
          });
        } else {
          msg(res);
        }
      }
    },
    // 获取品类属性
    *fetchCategoryPro({ payload, stdsku_info }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'category_pro',
        params: payload,
                
      });
      if(res.code === 0) {
        // 更新品类属性
        yield put({ type: 'updateCategoryPro', payload: res.data});
        const _partsku_vals = res.data.filter(v => v.category_pro_type !== 'IMAGE').map(v => {
          const find = stdsku_info.partsku_vals.find(p => p.category_pro_id === v.category_pro_id);
          return find ? {...v, ...find} : v;
        });
        // category_pro_type为IMAGE的属性，根据category_pro_id分组单独展示
        let category_pro_ids = res.data.filter(v => v.category_pro_type === 'IMAGE');
        const _partsku_val_imgs = category_pro_ids.map(pro => {
          const partsku_value_imgs = stdsku_info.partsku_val_imgs.filter(v => v.category_pro_id === pro.category_pro_id).map(v => ({...v, uid: v.std_partsku_image_id, url: v.std_partsku_image_url}));
          const len = partsku_value_imgs.filter(v => !isEmpty(v.std_partsku_image_url)).length;
          return { ...pro, partsku_value_imgs: len > 0 ? partsku_value_imgs : [] };
        });
        // 更新标准码信息
        yield put({
          type: 'updateStdskuInfo', 
          payload: { 
            api, 
            data: {
              ...stdsku_info,
              partsku_vals: _partsku_vals, // 品类属性
              partsku_val_imgs: _partsku_val_imgs // 品类属性图片
            }
          }
        });

        // 设定标准码信息初始化fields值
        const { STDSKU_INFO } = yield select(state => state.std_sku_id);
        const { category_id, category_name, std_partsku_code, partsku_vals, partsku_imgs, partsku_prices, std_partsku_desc, partsku_desc_imgs } = STDSKU_INFO.data;
        let fields = { category_id, category_name, std_partsku_code, partsku_prices };
        for (let i = 0; i < partsku_vals.length; i++) {
          const {category_pro_id, std_partsku_value} = partsku_vals[i];
          fields[category_pro_id] = std_partsku_value;
        }
        yield put({ 
          type: 'updateStdSkuIdInfoFields', 
          payload: fields
        });
        // 设定标准码图片
        yield put({
          type: 'updatePartPicList',
          payload: partsku_imgs
        });
        // 富文本编辑器
        yield put({ 
          type: 'updateEditorState', 
          payload: {...emptyEditorState, data: {}, html: std_partsku_desc, imgs: partsku_desc_imgs}
        });

      } else {
        msg(res);
      }
    },
    // 上传图片文件
    *fetchImageUpload({ payload }, { call, put, select }) {
      const { category_id, file } = payload;
      let fd = new FormData();
      fd.append('category_id', category_id);
      fd.append('image', file);
      const res = yield call(request, { fnName: 'stdsku_image_upload', data: fd });
      if(res.code === 0) {
        const { std_partsku_image_id, std_partsku_image_url } = res.data;
        const { PART_PIC_LIST } = yield select(state => state.std_sku_id);
        yield put({
          type: 'updatePartPicList',
          payload: [...PART_PIC_LIST, { std_partsku_image_id, std_partsku_image_url }]
        });
      } else {
        msg(res.msg);
      }
    },

    // 上传属性图片文件
    *fetchPropImageUpload({ payload, callback }, { call, put, select }) {
      const { category_id, file } = payload;
      let fd = new FormData();
      fd.append('category_id', category_id);
      fd.append('image', file);
      const res = yield call(request, { fnName: 'stdsku_image_upload', data: fd });
      if(res.code === 0) {
        const { STDSKU_INFO } = yield select(state => state.std_sku_id);
        const { std_partsku_image_id, std_partsku_image_url } = res.data;
        const partsku_val_imgs = STDSKU_INFO.data.partsku_val_imgs.map(v => {
          let obj = {...v};
          let fileObj = {...file, std_partsku_image_id, std_partsku_image_url, url: std_partsku_image_url, uid: std_partsku_image_id, status: 'done'};
          // 更新显示图片
          if(v.category_pro_id === payload.category_pro_id) {
            const list = (v.partsku_value_imgs && v.partsku_value_imgs.length > 0) ? [...v.partsku_value_imgs, fileObj] : [fileObj];
            obj.partsku_value_imgs = list.length <= payload.category_pro_size ? list : list.slice(1, payload.category_pro_size + 1);
          }
          return obj;
        });
        const _STDSKU_INFO= {
          ...STDSKU_INFO,
          data: {
            ...STDSKU_INFO.data,
            partsku_val_imgs
          }
        };
        yield put({
          type: 'updateStdskuInfo',
          payload: _STDSKU_INFO
        });
      } else {
        msg(res.msg);
      }
    },

    // 上传图片文件富文本编辑器
    *fetchEditorUpload({ payload, callback }, { call, put, select }) {
      const { file } = payload;
      const { STDSKU_INFO } = yield select(state => state.std_sku_id);
      const { category_id } = STDSKU_INFO.data;
      let fd = new FormData();
      fd.append('category_id', category_id);
      fd.append('image', file);
      return yield call(request, { fnName: 'stdsku_image_upload', data: fd });
    },

    // 富文本生成长图上传
    *fetchPartskuDescUpload({ payload }, { call, put, select }) {
      const { file } = payload;
      const { STDSKU_INFO } = yield select(state => state.std_sku_id);
      const { category_id } = STDSKU_INFO.data;
      const fd = new FormData();
      fd.append('category_id', category_id);
      fd.append('image', file);
      return yield call(request, {
        fnName: 'stdsku_image_upload',
        data: fd
      });
    }, 

    // 标准码信息更新
    *fetchStdskuUpdate({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'stdsku_update',
        data: payload,
      });
      if(res.code === 0) {
        // 重新拉取列表
        // const { searchFields } = yield select(state => state.std_sku_list);
        // yield put({ type: 'std_sku_list/fetchStdSkuList', payload: {...searchFields} });
        callback();
        msg('产品信息更新成功');
      } else {
        msg(res);
      }
    },
    // 获取标准码对应的oe信息
    *fetchStdskuOe({ payload, isForce }, { call, put, select }) {
      const data = yield select(state => state.std_sku_id.STDSKU_OE);
      const api = qs.stringify(payload);
      if(data.api !== api || isForce) {
        const { CATEGORY_PRO } = yield select(state => state.std_sku_id);
        const res = yield call(request, {
          fnName: 'stdsku_oe',
          params: payload
        });
        if(res.code === 0) {
          yield put({ 
            type: 'updateStdskuOe', 
            payload: { 
              api, 
              data: res.data.map(v => ({
                ...v,
                partsku_values: v.partsku_values.map(p => {
                  let props = {...p};
                  for (let i = 0; i < CATEGORY_PRO.length; i++) {
                    const c = CATEGORY_PRO[i];
                    if(c.category_pro_id === p.category_pro_id) {
                      props = { ...c, ...props};
                      break;
                    }
                  }
                  return props;
                })
              }))
            }
          });
        } else {
          msg(res);
        }
      }
    },
    // 获取合并标准码列表
    *fetchStdskuMatch({ payload }, { call, put, select }) {
      const data = yield select(state => state.std_sku_id.STDSKU_MATCH);
      const api = qs.stringify(payload);
      if(data.api !== api) {
        const res = yield call(request, {
          fnName: 'stdsku_match_get',
          params: payload
        });
        if(res.code === 0) {
          yield put({
            type: 'updateStdskuMatch',
            payload: {
              api,
              data: res.data
            }
          });
        } else {
          msg(res);
        }
      }

    },
    // 更新oe属性为标准码属性
    *fetchStdskuOesku({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'stdsku_oesku',
        data: payload
      });
      if(res.code === 0) {
        msg('成功更新OE属性');
        callback();
      } else {
        msg(res);
      }

    },

    // 更新标准码属性为oe属性
    *fetchOeskuStdsku({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'oesku_stdsku',
        data: payload
      });
      if(res.code === 0) {
        msg('成功更新标准码属性');
        callback();
      } else {
        msg(res);
      }
    },

    // 标准码和oe拆分
    *fetchStdsSkuOeSplit({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'stdsku_oe_split',
        data: payload
      });
      if(res.code === 0) {
        msg('标准码和oe拆分成功');
        callback();
      } else {
        msg(res);
      }
    },

    // 标准码合并
    *fetchStdskuMerge({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'stdsku_merge',
        data: payload
      });
      if(res.code === 0) {
        msg('标准码合并成功');
                
        // 清空stdSelectedRows
        callback();

        // 成功后，手动移除当前数据
        const { STDSKU_MATCH } = yield select(state => state.std_sku_id);
        yield put({
          type: 'updateStdskuMatch',
          payload: {
            ...STDSKU_MATCH,
            api: '', //保证下次请求不缓存
            data: STDSKU_MATCH.data.filter(item => !payload.merge_std_partsku_ids.includes(item.std_partsku_id))
          }
        });
      } else {
        msg(res);
      }
    },

    // 设置代用状态
    *fetchStdskuMatchPost({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'stdsku_match_post',
        data: payload
      });
      if(res.code === 0) {
        msg('设置成功');

        // 清空stdSelectedRows以及关闭模态框
        callback();

        // 手动修改数据以更新页面显示
        const { STDSKU_MATCH } = yield select(state => state.std_sku_id);
        yield put({
          type: 'updateStdskuMatch',
          payload: {
            ...STDSKU_MATCH,
            api: '', //保证下次请求不缓存
            data: STDSKU_MATCH.data.filter(v => {
              return payload.std_match_ids.includes(v.std_match_id) ? { ...v, std_match_status: payload.std_match_status, std_match_desc: payload.std_match_desc, update_time: payload.update_time} : v;
            })
          }
        });

      } else {
        msg(res);
      }
    },
    // 商户反馈不匹配OE产品信息
    *fetchOemSkuUnmatch({ payload }, { call, put, all }) {
      let promises= [];
      // 获取oem车型信息
      promises.push(call(request, {
        fnName: 'oemsku_carmodel',
        params: payload
      }));
      // 获取oem信息
      promises.push(call(request, {
        fnName: 'oemsku_info',
        params: payload
      }));
      // 获取商户反馈不匹配oe产品信息
      promises.push(call(request, {
        fnName: 'oemsku_filter',
        params: payload
      }));
            
      const allRes = yield all(promises);
      const isOk = allRes.every(res => res.code === 0);
      if(isOk) {
        yield put({ type: 'updateOemskuCarmodel', payload: allRes[0].data });
        yield put({ type: 'updateOemskuInfo', payload: allRes[1].data });
        yield put({ type: 'updateOemSkuFilter', payload: allRes[2].data });
      }else{
        msg('反馈信息获取错误');
      }

    },
    // 商户反馈 - 确认已查看
    *fetchOemskuFilterHandled({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'oemsku_filter_handled',
        data: payload
      });
      if(res.code === 0) {
        msg('已确认');
        // 成功后，手动修改数据以更新页面显示, 把当前列的未查看的信息设置为0
        const { STDSKU_OE } = yield select(state => state.std_sku_id);
        yield put({
          type: 'updateStdskuOe',
          payload: {
            ...STDSKU_OE,
            data: STDSKU_OE.data.map(v => {
              return {
                ...v,
                unsolve_count: v.oem_partsku_id == payload.oem_partsku_id ? 0 : v.unsolve_count
              };
            })
          }
        });
        callback();
      } else {
        msg(res);
      }
    },
    // 获取品类禁用数据
    *fetchCategoriesForbid({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'categories_forbid',
        params: payload
      });
      if (res.code == 0) {
        yield put({
          type: 'updateCategoriesForbid',
          payload: res.data
        });
      } else {
        msg(res);
      }
    },
        
  },

  reducers: {
    updateOemskuCarmodel(state, { payload }) {
      return payload ? { ...state, OEMSKU_CARMODEL: payload } : { ...state, OEMSKU_CARMODEL: emptyArr };
    },
    updateOemskuInfo(state, { payload }) {
      return payload ? { ...state, OEMSKU_INFO: payload } : { ...state, OEMSKU_INFO: emptyObj };
    },
    updateOemSkuFilter(state, { payload }) {
      return payload ? { ...state, OEMSKU_FILTER: payload } : { ...state, OEMSKU_FILTER: emptyArr };
    },
    // 更新图片列表
    updatePartPicList(state, { payload }) {
      return payload ? { ...state, PART_PIC_LIST: payload.map(v => ({...v, uid: v.std_partsku_image_id, url: v.std_partsku_image_url})) } : { ...state, PART_PIC_LIST: emptyArr };
    },
    // 更新富文本编辑器
    updateEditorState(state, { payload }) {
      return payload ? { ...state, EDITOR_STATE: {...state.EDITOR_STATE, ...payload} } : { ...state, EDITOR_STATE: emptyEditorState };
    },
    updateStdskuInfo(state, { payload }) {
      return payload ? { ...state, STDSKU_INFO: payload } : { ...state, STDSKU_INFO: emptyData };
    },
    updateCategoryPro(state, { payload }) {
      return payload ? { ...state, CATEGORY_PRO: payload } : { ...state, CATEGORY_PRO: emptyArr };
    },
    updateStdSkuIdInfoFields(state, { payload }) {
      return payload ? { ...state, STD_SKU_ID_FIELDS: payload } : { ...state, STD_SKU_ID_FIELDS: emptyObj };
    },
    updateStdskuOe(state, { payload }) {
      return payload ? { ...state, STDSKU_OE: payload } : { ...state, STDSKU_OE: emptyDataArr };
    },
    updateStdskuMatch(state, { payload }) {
      return payload ? { ...state, STDSKU_MATCH: payload } : { ...state, STDSKU_MATCH: emptyDataArr };
    },
    updateCategoriesForbid(state, { payload }) {
      return payload ? { ...state, CATEGORIES_FORBID: payload } : { ...state, CATEGORIES_FORBID: emptyArr }; 
    },
  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen((location, action) => {
        const { query } = location;
        const { std_partsku_id } = query;
        if(std_partsku_id) {
          // 获取标准码信息
          dispatch({
            type: 'fetchStdskuInfo',
            payload: { std_partsku_id }
          });
        }

      });
    }
  }
};