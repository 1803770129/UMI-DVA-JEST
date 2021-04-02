import { request } from '@/utils/http';
import msg from '@/utils/msg';

const emptyFields = {
  cm_brand_name: '',                    // 车型品牌
  cm_factory_name: '',                  // 车型主机厂
  cm_hot_flag: undefined,               // 热门标识： HOT 热门， NORMAL 普通
  cm_brand_country: 'ALL',              // 车系国别
  cm_brand_status: 'ALL',              // 车系国别
  page: 1,
  perpage: 10
};
const emptyObjectList = {
  count: 0,
  list: []
};
const emptyObject = {};
const emptyConfigSubmitInfo = {
  logoImg: '',
  cm_brand_id: '',
  cm_hot_flag: '',
  del_cm_factory_ids: []
};

export default {
  namespace: 'carmodel_brand',

  state: {
    searchFields: emptyFields,
    carmodelBrandList: emptyObjectList,
    carmodelBrandInfo: emptyObject,
    configSubmitInfo: emptyConfigSubmitInfo
  },
  effects: {
    // 列表 - 获取列表数据
    *fetchCarmodelBrands({ payload }, { call, put }) {
      let params = {
        cm_brand_name: payload.cm_brand_name,
        cm_factory_name: payload.cm_factory_name,
        cm_hot_flag: payload.cm_hot_flag,
        cm_brand_country: payload.cm_brand_country,
        cm_brand_status: payload.cm_brand_status,
        page: payload.page,
        perpage: payload.perpage
      };
      const res = yield call(request, { fnName: 'carmodel_brands', params });
      if(res.code === 0) {
        yield put({ type: 'saveCarmodelBrands', payload: res.data });
        yield put({ type: 'saveSearchFields', payload: params });
      } else {
        msg(res);
      }
    },
    // 模态框 - 获取详情数据
    *fetchCarmodelBrandInfo({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'carmodel_brand_info',
        params: {
          cm_brand_id: payload.cm_brand_id
        }
      });
      if(res.code === 0) {
        yield put({ type: 'saveCarmodelBrandInfo', payload: res.data });
        const { configSubmitInfo } = yield select(state => state.carmodel_brand);
        // 提交设置的对象
        yield put({
          type: 'saveConfigSubmitInfo',
          payload: {
            ...configSubmitInfo,
            cm_brand_status: res.data.cm_brand_status,
            cm_brand_id: res.data.cm_brand_id,
            cm_hot_flag: res.data.cm_hot_flag,
            cm_brand_country: res.data.cm_brand_country
          }
        });

        payload.cb && payload.cb();
      } else {
        msg(res);
      }
    },
    // 模态框 - 保存设置
    *updateCarmodelBrand({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'carmodel_brand_update',
        data: {
          cm_brand_image_url: payload.cm_brand_image_url,
          cm_brand_id: payload.cm_brand_id,
          cm_hot_flag: payload.cm_hot_flag,
          cm_brand_country: payload.cm_brand_country,
          del_cm_factory_ids: payload.del_cm_factory_ids,
          cm_brand_status: payload.cm_brand_status
        }
      });
      if(res.code === 0) {
        const { carmodelBrandList } = yield select(state => state.carmodel_brand);
        let newList = carmodelBrandList.list.map(item => {
          let tar = {...item};
          if(tar.cm_brand_id == payload.cm_brand_id) {
            tar.cm_hot_flag = payload.cm_hot_flag;
          }
          return tar;
        });
        yield put({ type: 'saveCarmodelBrands', payload: {...carmodelBrandList, list: newList} });
        payload.cb && payload.cb();
      } else {
        msg(res);
      }
    },
    // 删除车型品牌
    *delCarmodelBrand({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'carmodel_brand_del',
        data: {
          cm_brand_id: payload.cm_brand_id
        }
      });
      if(res.code === 0) {
        msg('删除成功');
        // 手动移除
        const { carmodelBrandList } = yield select(state => state.carmodel_brand);
        let newList = carmodelBrandList.list.filter(item => item.cm_brand_id != payload.cm_brand_id);
        yield put({ type: 'saveCarmodelBrands', payload: {...carmodelBrandList, list: newList} });
        const {searchFields} = yield select(state=>state.carmodel_brand);
        yield put({type:'fetchCarmodelBrands',payload:searchFields});
      } else {
        msg(res);
      }
    },
    // 车型品牌图片上传
    *carmodelBrandImageUpload({ payload }, { call, put, select }) {
      let fd = new FormData();
      fd.append('image', payload.image);
      const res = yield call(request, { fnName: 'carmodel_brand_image_upload', data: fd });
      if(res.code === 0) {
        payload.cb && payload.cb(res.data.file_path);
      } else {
        msg(res.msg);
      }
    },
    // 主机厂排序
    *carmodelFactory({ payload }, { call, put }) {
      const res = yield call(request, {
        fnName: 'carmodel_factory',
        data: {
          cm_factory_id: payload.cm_factory_id,
          cm_factory_index: payload.cm_factory_index
        }
      });
      if(res.code === 0) {
        msg('排序成功');
      } else {
        msg(res.msg);
      }
    }
  },
  reducers: {
    // 保存车型品牌列表
    saveCarmodelBrands(state, { payload }) {
      return payload ? { ...state, carmodelBrandList: payload } : { ...state, carmodelBrandList: emptyObjectList };
    },
    // 保存车型品牌设置详情数据
    saveCarmodelBrandInfo(state, { payload }) {
      return payload ? { ...state, carmodelBrandInfo: payload } : { ...state, carmodelBrandInfo: emptyObject };
    },
    // 保存车型品牌设置提交的数据
    saveConfigSubmitInfo(state, { payload }) {
      return payload ? { ...state, configSubmitInfo: payload } : { ...state, configSubmitInfo: emptyConfigSubmitInfo };
    },
    // 保存筛选条件参数
    saveSearchFields(state, { payload }) {
      return payload ? { ...state, searchFields: payload } : { ...state, searchFields: emptyFields };
    }
  },
  subscriptions: {

  }
};
