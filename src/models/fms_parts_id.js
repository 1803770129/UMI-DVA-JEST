import { request, get } from '@/utils/http';
import * as api from '@/services/apiUrl';
import msg from '@/utils/msg';
import router from 'umi/router';
import { isEmpty } from '@/utils/tools';
const emptyEditorState = { data: {}, html: '', imgs: [] };

const emptyArray = [];
const emptyFields = {
  std_partsku_ids: [], // 添加适配车型关联OE的id
};
const emptyInfo = {};

export default {
  namespace: 'fms_parts_id',

  state: {
    fmsBrandsDropList: emptyArray, // 大厂品牌下拉列表数据
    fmsCategoriesDropList: emptyArray, // 大厂品类下拉列表数据
    fmsPartsDropList: emptyArray, // 大厂产品下拉列表数据
    postFields: emptyFields, //
    fmsCategoryProps: emptyArray, // 品类属性数据
    fmsCarmodelList: emptyArray, // 适配车型列表
    // carmodelBrandFacModDropList: emptyArray,        // 品牌/主机厂/车型下拉列表数据
    fmsPartSkusInfo: emptyInfo, // 产品详情数据
    carmodelProperties: emptyArray, // 车型关键属性
    initFlag: false, // 初始化是否完成标识
    EDITOR_STATE: emptyEditorState, // 富文本编辑器
    CATEGORIES_FORBID: emptyArray, // 获取品类禁用数据
  },

  effects: {
    // 获取品牌下拉列表
    *fetchFmsBrands({ payload }, { call, put, select }) {
      const res = yield call(request, { fnName: 'fms_brand_getFamousId', params: payload });
      if (res.code === 0) {
        yield put({ type: 'saveFmsBrandsDropList', payload: res.data });
      } else {
        yield put({
          type: 'saveFmsBrandsDropList',
        });
        msg(res.msg);
      }
    },

    // 获取大厂产品下拉列表
    *fetchFmsParts({ payload }, { call, put, select }) {
      const res = yield call(request, { fnName: 'fms_brand_famousIdCategory', params: payload });
      if (res.code === 0) {
        const { BrandIds = [], categorys = [] } = res.data;
        const { postFields } = yield select(state => state.fms_parts_id);
        yield put({ type: 'saveFmsPartsDropList', payload: categorys });
        if(BrandIds.length > 0) {
          yield put({
            type: 'savePostFields',
            payload: { ...postFields, fms_category_id: BrandIds[0].fms_category_id},
          });
        }
        
      } else {
        yield put({ type: 'saveFmsPartsDropList' });
        msg(res.msg);
      }
    },

    // ***************************** 产品信息
    // 创建初始化
    *fetchAddPageInit({ payload }, { call, put, select }) {
      // 初始化大厂品类select数据
      const res = yield call(request, { fnName: 'category_tree' });
      yield put({ type: 'saveFmsCategoriesDropList', payload: res.data });
    },
    // 编辑初始化
    *fetchEditPageInit({ payload }, { call, put, select }) {
      const { category_id, fms_brand_id, fms_category_id, fms_partsku_id, brand_category_id, cb } = payload;
      // 初始化大厂品类select数据
      const res = yield call(request, { fnName: 'category_tree' });
      yield put({ type: 'saveFmsCategoriesDropList', payload: res.data });
      yield yield put({
        type: 'fetchFmsBrands',
        payload: { brand_category_id }
      });

      yield yield put({
        type: 'fetchFmsParts',
        payload: { brand_category_id, fms_brand_id }
      });

      let infoPromises = [];
      // 4、获取产品详情数据
      infoPromises.push(get(`${api.fms_partskus_info}?fms_partsku_id=${fms_partsku_id}`));
      // 5、获取品类属性
      infoPromises.push(get(`${api.category_pros}?category_id=${category_id}`));
      let infoRet = yield Promise.all(infoPromises);
      // 保存品类属性
      yield put({ type: 'saveCategoryProps', payload: infoRet[1].data });

      const { fmsCategoryProps } = yield select(state => state.fms_parts_id);
      const _fmsPartSkusInfo = infoRet[0].data;
      const _partsku_vals = fmsCategoryProps
        .filter(v => v.category_pro_type !== 'IMAGE')
        .map(v => {
          const find = _fmsPartSkusInfo.partsku_vals.find(p => p.category_pro_id === v.category_pro_id);
          return find ? { ...v, ...find } : v;
        });
      // category_pro_type为IMAGE的属性，根据category_pro_id分组单独展示
      let category_pro_ids = fmsCategoryProps.filter(v => v.category_pro_type === 'IMAGE');
      const _partsku_val_imgs = category_pro_ids.map(pro => {
        const partsku_value_imgs = _fmsPartSkusInfo.partsku_vals.filter(v => v.category_pro_id === pro.category_pro_id).map(v => ({ ...v, uid: v.fms_partsku_image_id, url: v.fms_partsku_image_url }));
        const len = partsku_value_imgs.filter(v => !isEmpty(v.fms_partsku_image_url)).length;
        return { ...pro, partsku_value_imgs: len > 0 ? partsku_value_imgs : [] };
      });
      // 保存产品详情数据
      yield put({
        type: 'saveFmsPartSkusInfo',
        payload: {
          ..._fmsPartSkusInfo,
          partsku_vals: _partsku_vals, // 品类属性
          partsku_val_imgs: _partsku_val_imgs, // 品类属性图片
        },
      });

      // 获取品类禁用数据
      // yield put({
      //   type: 'fetchCategoriesForbid',
      //   payload: { category_id }
      // });

      // 6、保存postFields
      const { postFields } = yield select(state => state.fms_parts_id);
      const { fms_part_id, fms_partsku_desc, partsku_desc_imgs, partsku_codes, partsku_vals } = infoRet[0].data;

      // 富文本编辑器
      yield put({
        type: 'updateEditorState',
        payload: { ...emptyEditorState, data: {}, html: fms_partsku_desc, imgs: partsku_desc_imgs },
      });

      const { fmsPartsDropList } = yield select(state => state.fms_parts_id);
      const part = fmsPartsDropList.find(v => v.fms_part_id === fms_part_id) || {};

      let fields = {
        ...postFields,
        brand_category_id,
        category_id,
        fms_brand_id,
        fms_category_id,
        fms_part_id,
        fms_partsku_id,
        fms_part_name: part.title,
        partsku_codes,
      };

      for (let i = 0; i < partsku_vals.length; i++) {
        const { category_pro_id, fms_partsku_value } = partsku_vals[i];
        fields[category_pro_id] = fms_partsku_value;
      }
      yield put({
        type: 'savePostFields',
        payload: fields,
      });
      cb && cb();
      yield put({ type: 'saveInitFlag', payload: true });
    },
    // 获取大厂品类下拉列表
    *fetchCategoriesDropList({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'fms_categories',
        params: { fms_brand_id: payload.fms_brand_id },
      });
      if (res.code === 0) {
        yield put({ type: 'saveFmsCategoriesDropList', payload: res.data.list });
        // 保存postFields
        const { postFields } = yield select(state => state.fms_parts_id);
        yield put({
          type: 'savePostFields',
          payload: { ...postFields, fms_brand_id: payload.fms_brand_id, fms_category_id: '', fms_part_id: '', fms_part_name: '' },
        });
        // 清空产品下拉列表数据
        yield put({ type: 'saveFmsPartsDropList', payload: emptyArray });
      } else {
        msg(res.msg);
      }
    },
    // 获取大厂产品下拉列表
    *fetchParsDropList({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'fms_parts',
        params: {
          fms_brand_id: payload.fms_brand_id,
          fms_category_id: payload.fms_category_id,
        },
      });
      if (res.code === 0) {
        yield put({ type: 'saveFmsPartsDropList', payload: res.data });
        // 保存postFields
        const { postFields } = yield select(state => state.fms_parts_id);
        yield put({
          type: 'savePostFields',
          payload: { ...postFields, fms_brand_id: payload.fms_brand_id, fms_category_id: payload.fms_category_id, fms_part_id: '', fms_part_name: '' },
        });
      } else {
        msg(res.msg);
      }
    },
    // 获取属性信息(创建时用)
    *fetchCategoryPros({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'category_pros',
        params: {
          category_id: payload.category_id,
        },
      });

      if (res.code === 0) {
        yield put({ type: 'saveCategoryProps', payload: res.data });

        // 获取品类禁用数据
        // yield put({
        //   type: 'fetchCategoriesForbid',
        //   payload: { category_id: payload.category_id }
        // });
        const { fmsCategoryProps, fmsPartSkusInfo, fmsPartsDropList, postFields } = yield select(state => state.fms_parts_id);
        const partsku_vals = fmsCategoryProps.filter(v => v.category_pro_type !== 'IMAGE');
        // category_pro_type为IMAGE的属性，根据category_pro_id分组单独展示
        let partsku_val_imgs = fmsCategoryProps.filter(v => v.category_pro_type === 'IMAGE').map(v => ({ ...v, partsku_value_imgs: [] }));
        // 获取category_type
        const part = fmsPartsDropList.find(v => v.fms_part_id === postFields.fms_part_id);
        // 更新产品详情数据
        yield put({
          type: 'saveFmsPartSkusInfo',
          payload: {
            ...fmsPartSkusInfo,
            category_type: part.category_type,
            partsku_vals, // 品类属性
            partsku_val_imgs, // 品类属性图片
          },
        });
      } else {
        msg(res.msg);
      }
    },
    // ***************************** 适配车型
    // 适配车型列表
    *fetchFmsCarmodelList({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'fms_carmodel',
        params: {
          fms_partsku_id: payload.fms_partsku_id,
          category_id: payload.category_id,
        },
      });
      // 判断适配车型是否与产品信息匹配
      const { fmsPartSkusInfo } = yield select(state => state.fms_parts_id);
      let infoList = fmsPartSkusInfo.partsku_vals;
      if (res.code === 0) {
        let list = res.data;
        // 是否匹配判断函数
        const matchFn = oemList => {
          let flag = 'match';
          for (let j = 0; j < oemList.length; j++) {
            let partskus = oemList[j].oem_partsku_vals;
            if (partskus.length === 0) {
              flag = 'unmatch';
              break;
            } else {
              for (let l = 0; l < partskus.length; l++) {
                for (let k = 0; k < infoList.length; k++) {
                  // 比对产品信息
                  if (infoList[k].category_pro_id == partskus[l].category_pro_id && infoList[k].fms_partsku_value != partskus[l].oem_partsku_value) {
                    // 不匹配
                    flag = 'unmatch';
                    break;
                  }
                }
              }
            }
          }
          return flag;
        };
        for (let i = 0; i < list.length; i++) {
          list[i].matchFlag = matchFn(list[i].oemList);
          const oemList = list[i].oemList;
          const cm_vals = oemList[0].cm_vals;
          if (oemList.length > 0 && cm_vals.length > 0) {
            list[i].cm_brand = cm_vals[0].cm_brand;
          }
        }
        yield put({ type: 'saveFmsCarmodelList', payload: list });
        payload.cb && payload.cb(list);
      } else {
        msg(res.msg);
      }
    },
    // // 获取品牌/主机厂/车型下拉列表
    // *fetchCarmodelBrandFacModDropList({ payload }, { call, put }) {
    //     const res = yield call(request, { fnName: 'carmodel_brand_fac_mod_list_approved' });
    //     if(res.code === 0) {
    //         yield put({ type: 'saveCarmodelBrandFacModDropList', payload: res.data });
    //     } else {
    //         msg(res.msg);
    //     }
    // },
    // 通过OE查询获取车型
    *fetchCarmodelOEList({ payload }, { call, put }) {
      const res = yield call(request, {
        fnName: 'carmodel_oe',
        params: {
          category_id: payload.category_id,
          oem_partsku_code: payload.oem_partsku_code,
        },
      });
      if (res.code === 0) {
        payload.cb && payload.cb(res.data);
      } else {
        msg(res.msg);
      }
    },
    // 通过参数查询获取车型
    *fetchCarmodelParamsList({ payload }, { call, put }) {
      const res = yield call(request, {
        fnName: 'carmodel_params',
        params: {
          category_id: payload.category_id,
          cm_brand: payload.cm_brand,
          cm_factory: payload.cm_factory,
          cm_model: payload.cm_model,
          cm_displacement: payload.cm_displacement,
          cm_model_year: payload.cm_model_year,
        },
      });
      if (res.code === 0) {
        payload.cb && payload.cb(res.data);
      } else {
        msg(res.msg);
      }
    },
    // 产品管理 - 保存
    *createFmsPartSkus({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'fms_partskus_create',
        data: payload,
      });

      if (res.code === 0) {
        msg('创建成功');
        // 重置初始化状态
        yield put({ type: 'fms_parts_list/updateIsInit' });
        router.goBack();
      } else {
        msg(res.msg);
      }
    },
    // 产品管理 - 编辑
    *updateFmsPartSkus({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'fms_partskus_update',
        data: payload,
      });

      if (res.code === 0) {
        msg('编辑成功');
        // 重置初始化状态
        yield put({ type: 'fms_parts_list/updateIsInit' });
        router.goBack();
      } else {
        msg(res.msg);
      }
    },
    // 产品管理 - 删除
    *deleteFmsPartSkus({ payload }, { call, put }) {
      const res = yield call(request, {
        fnName: 'fms_partskus_del',
        data: {
          fms_partsku_id: payload.fms_partsku_id,
        },
      });

      if (res.code === 0) {
        msg('删除成功');
        router.goBack();
      } else {
        msg(res.msg);
      }
    },
    // 产品管理 - 更新产品启用状态
    *updateFmsPartStatus({ payload }, { call, put }) {
      const res = yield call(request, {
        fnName: 'fms_status_update',
        data: {
          fms_partsku_id: payload.fms_partsku_id,
          fms_partsku_status: payload.fms_partsku_status,
        },
      });
      if (res.code === 0) {
        msg('更新状态成功');
        payload.cb && payload.cb();
      } else {
        msg(res.msg);
      }
    },
    // 适配车型 - 获取车型关键属性
    *fetchCarmodelProperities({ payload }, { call, put }) {
      const res = yield call(request, {
        fnName: 'carmodel_properties',
        params: { category_id: payload.category_id },
      });

      if (res.code === 0) {
        yield put({ type: 'saveCarmodelProperties', payload: res.data });
      } else {
        msg(res.msg);
      }
    },
    // 适配车型 - 添加适配车型
    *addFmsCarmodel({ payload, callback }, { call, put }) {
      const res = yield call(request, {
        fnName: 'fms_carmodel_add',
        data: payload,
      });
      if (res.code === 0) {
        msg('添加适配车型成功');
        callback && callback();
      } else {
        msg(res.msg);
      }
    },
    // 删除适配车型
    *deleteFmsCarmodel({ payload }, { call, put }) {
      const res = yield call(request, {
        fnName: 'fms_std_rel_del',
        data: {
          fms_partsku_id: payload.fms_partsku_id,
          std_partsku_id: payload.std_partsku_id,
        },
      });
      if (res.code === 0) {
        payload.cb && payload.cb();
        msg('删除成功');
      } else {
        msg(res.msg);
      }
    },
    // 配件code重复验证
    *fmsPartskuCodeCheck({ payload }, { call, put }) {
      const res = yield call(request, {
        fnName: 'fms_partsku_code_check',
        data: {
          fms_brand_id: payload.fms_brand_id,
          fms_category_id: payload.fms_category_id,
          fms_part_id: payload.fms_part_id,
          fms_partsku_code: payload.fms_partsku_code,
          fms_partsku_id: payload.fms_partsku_id,
        },
      });
      if (res.code === 0) {
        payload.cb && payload.cb(true);
      } else if (res.code === 21022) {
        payload.cb && payload.cb(false);
      } else {
        msg(res.msg);
      }
    },

    // 上传sku图片文件
    *fetchImageUpload({ payload, callback }, { call, put, select }) {
      const { fms_brand_id, file } = payload;
      let fd = new FormData();
      fd.append('fms_brand_id', fms_brand_id);
      fd.append('image', file);
      const res = yield call(request, { fnName: 'fms_sku_image_upload', data: fd });
      if (res.code === 0) {
        const { fms_partsku_image_id, fms_partsku_image_url } = res.data;
        const { fmsPartSkusInfo } = yield select(state => state.fms_parts_id);
        const { partsku_imgs = [] } = fmsPartSkusInfo;
        yield put({
          type: 'saveFmsPartSkusInfo',
          payload: {
            ...fmsPartSkusInfo,
            partsku_imgs: [...partsku_imgs, { fms_partsku_image_id, fms_partsku_image_url }],
          },
        });
      } else {
        msg(res.msg);
      }
    },
    // 上传图片文件富文本编辑器
    *fetchEditorUpload({ payload }, { call, put, select }) {
      const { file } = payload;
      let fd = new FormData();
      fd.append('fms_brand_id', payload.fms_brand_id);
      fd.append('image', file);
      return yield call(request, { fnName: 'fms_sku_image_upload', data: fd });
    },

    // 上传属性图片文件
    *fetchPropImageUpload({ payload, callback }, { call, put, select }) {
      const { file } = payload;
      let fd = new FormData();
      fd.append('fms_brand_id', payload.fms_brand_id);
      fd.append('image', file);
      const res = yield call(request, { fnName: 'fms_sku_image_upload', data: fd });
      if (res.code === 0) {
        const { fmsPartSkusInfo } = yield select(state => state.fms_parts_id);
        const { fms_partsku_image_id, fms_partsku_image_url } = res.data;
        const partsku_val_imgs = fmsPartSkusInfo.partsku_val_imgs.map(v => {
          let obj = { ...v };
          let fileObj = { ...file, fms_partsku_image_id, fms_partsku_image_url, url: fms_partsku_image_url, uid: fms_partsku_image_id, status: 'done' };
          // 更新显示图片
          if (v.category_pro_id === payload.category_pro_id) {
            const list = v.partsku_value_imgs && v.partsku_value_imgs.length > 0 ? [...v.partsku_value_imgs, fileObj] : [fileObj];
            obj.partsku_value_imgs = list.length <= payload.category_pro_size ? list : list.slice(1, payload.category_pro_size + 1);
          }
          return obj;
        });
        yield put({
          type: 'saveFmsPartSkusInfo',
          payload: {
            ...fmsPartSkusInfo,
            partsku_val_imgs,
          },
        });
      } else {
        msg(res.msg);
      }
    },

    // 富文本生成长图上传
    *fetchPartskuDescUpload({ payload }, { call, put, select }) {
      const { file, fms_brand_id } = payload;
      const fd = new FormData();
      fd.append('fms_brand_id', fms_brand_id);
      fd.append('image', file);
      return yield call(request, {
        fnName: 'fms_sku_image_upload',
        data: fd,
      });
    },

    // 获取品类禁用数据
    *fetchCategoriesForbid({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'categories_forbid',
        params: payload,
      });
      if (res.code == 0) {
        yield put({
          type: 'updateCategoriesForbid',
          payload: res.data,
        });
      } else {
        msg(res);
      }
    },
  },

  reducers: {
    // ***************************** 产品信息
    // 保存大厂品牌下拉列表
    saveFmsBrandsDropList(state, { payload }) {
      return payload ? { ...state, fmsBrandsDropList: payload } : { ...state, fmsBrandsDropList: emptyArray };
    },
    // 保存大厂品类下拉列表
    saveFmsCategoriesDropList(state, { payload }) {
      return payload ? { ...state, fmsCategoriesDropList: payload } : { ...state, fmsCategoriesDropList: emptyArray };
    },
    // 保存大厂产品下拉列表
    saveFmsPartsDropList(state, { payload }) {
      return payload ? { ...state, fmsPartsDropList: payload } : { ...state, fmsPartsDropList: emptyArray };
    },
    // 保存品类属性数据
    saveCategoryProps(state, { payload }) {
      return payload ? { ...state, fmsCategoryProps: payload } : { ...state, fmsCategoryProps: emptyArray };
    },
    // 保存产品详情数据
    saveFmsPartSkusInfo(state, { payload }) {
      if (payload) {
        // 处理图片上传格式
        let fmsPartSkusInfo = { ...payload };
        if (payload.partsku_imgs) {
          fmsPartSkusInfo.partsku_imgs = payload.partsku_imgs.map(v => (!v.uid ? { ...v, uid: v.fms_partsku_image_id, url: v.fms_partsku_image_url } : v));
        }
        if (payload.partsku_val_imgs) {
          fmsPartSkusInfo.partsku_val_imgs = payload.partsku_val_imgs.map(v => (!v.uid ? { ...v, uid: v.fms_partsku_image_id, url: v.fms_partsku_image_url } : v));
        }
        return { ...state, fmsPartSkusInfo };
      } else {
        return { ...state, fmsPartSkusInfo: emptyInfo };
      }
    },
    // 保存
    savePostFields(state, { payload }) {
      return payload ? { ...state, postFields: payload } : { ...state, postFields: emptyFields };
    },
    // ***************************** 适配车型
    // 保存适配车型列表数据
    saveFmsCarmodelList(state, { payload }) {
      return payload ? { ...state, fmsCarmodelList: payload } : { ...state, fmsCarmodelList: emptyArray };
    },
    // // 保存品牌/主机厂/车型下拉数据
    // saveCarmodelBrandFacModDropList(state, { payload }) {
    //     return payload ? { ...state, carmodelBrandFacModDropList: formatBrandFacModFn(payload) } : { ...state, carmodelBrandFacModDropList: emptyArray };
    // },
    // 保存关键车型属性数据
    saveCarmodelProperties(state, { payload }) {
      return payload ? { ...state, carmodelProperties: payload } : { ...state, carmodelProperties: emptyArray };
    },
    // 保存初始化完成标识
    saveInitFlag(state, { payload }) {
      return { ...state, initFlag: payload };
    },
    // 更新富文本编辑器
    updateEditorState(state, { payload }) {
      return payload ? { ...state, EDITOR_STATE: { ...state.EDITOR_STATE, ...payload } } : { ...state, EDITOR_STATE: emptyEditorState };
    },
    updateCategoriesForbid(state, { payload }) {
      return payload ? { ...state, CATEGORIES_FORBID: payload } : { ...state, CATEGORIES_FORBID: emptyArray };
    },
  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname }, action) => {
        // 离开页面，清空缓存
        if (pathname.indexOf(history.location.query.fms_parts_id) === -1) {
          const types = [
            'saveFmsBrandsDropList',
            'saveFmsCategoriesDropList',
            'saveFmsPartsDropList',
            'saveCategoryProps',
            'saveFmsPartSkusInfo',
            'savePostFields',
            'saveFmsCarmodelList',
            // 'saveCarmodelBrandFacModDropList',
            'saveCarmodelProperties',
            'saveInitFlag',
            'updateEditorState',
          ];
          types.forEach(type => dispatch({ type: type }));
        }
      });
    },
  },
};

// 格式化车型品牌下拉列表数据
function formatBrandFacModFn(array) {
  // 增加label字段
  const setLable = list => {
    list.forEach(item => {
      item.label = item.v;
      if (item.c) {
        setLable(item.c);
      }
    });
    return list;
  };
  return setLable(array);
}

// 通过fms_part_id获取对应的产品名称
function getNameByFmsPartIdFn(fmsPartsDropList, fms_part_id) {
  let name = '';
  for (let i = 0; i < fmsPartsDropList.length; i++) {
    if (fmsPartsDropList[i].fms_part_id == fms_part_id) {
      name = fmsPartsDropList[i].category_name;
      break;
    }
  }
  return name;
}
