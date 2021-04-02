import { request } from '@/utils/http';
import msg from '@/utils/msg';
import { getMenuData } from '@/common/menu';
import simplePages from '@/common/simplePages';

const emptyArray = [];

export default {
  namespace: 'global',
  state: {
    carmodelList: emptyArray,               // 品牌/主机厂/车型 - 多层下拉列表【全部车型 - 包括未审核】
    carmodelApprovedList: emptyArray,       // 品牌/主机厂/车型 - 多层下拉列表【已审核通过的车型】
    carbrandList: emptyArray,               // 车型品牌 - 下拉列表
    addressList: emptyArray,                // 省/市/区 - 多层下拉列表
    serviceList: emptyArray,                // 获取已开通服务 - 下拉列表
    MENU_DATA: []                           // menu配置
  },
  effects: {
    // 获取品牌主机厂车型
    *fetchBrandFacModList({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'carmodel_brand_fac_mod_list' });
      if(res.code === 0) {
        yield put({ type: 'savebrandfacmodlist', payload: res.data });
      } else {
        msg(res);
      }
    },
    // 获取品牌主机厂车型
    *fetchBrandFacModListApproved({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'carmodel_brand_fac_mod_list_approved' });
      if(res.code === 0) {
        yield put({ type: 'savebrandfacmodapprovedlist', payload: res.data });
      } else {
        msg(res);
      }
    },
    // 获取省市区
    *fetchAddress({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'address' });
      if(res.code === 0) {
        yield put({ type: 'saveAddress', payload: res.data });
      } else {
        msg(res);
      }
    },
    // 获取品牌
    *fetchServices({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'services' });
      if(res.code === 0) {
        yield put({ type: 'saveServices', payload: res.data });
      } else {
        msg(res);
      }
    },
    // 获取menu
    *fetchMenuData({ payload }, { call, put, select }) {
      const { MENU_DATA } = yield select(state => state.global);
      if(MENU_DATA.length === 0) {
        // 这里通过接口获取数据再通过updateMenuData存储到MENU_DATA
        let menusData = JSON.parse(localStorage.getItem('menusData'));
        yield put({ type: 'updateMenuData', payload: menusData });
      }

    },
  },
  reducers: {
    // 保存品牌主机厂车型列表【全部车型，包括未审核的】
    savebrandfacmodlist(state, { payload }) {
      // 增加label字段
      const loop = list => {
        return list.map(item => {
          return item.c ? {...item, label: item.v, c: loop(item.c)} : {...item, label: item.v};
        });
      };
      return { ...state, carmodelList: loop(payload) };
    },
    // 保存品牌主机厂车型列表【已通过审核的】
    savebrandfacmodapprovedlist(state, { payload }) {
      // 增加label字段
      const loop = list => {
        return list.map(item => {
          return item.c ? {...item, label: item.v, c: loop(item.c)} : {...item, label: item.v};
        });
      };
      return { ...state, carmodelApprovedList: loop(payload) };
    },
    // 保存车型品牌
    saveCarmodelCmbrandList(state, { payload }) {
      return { ...state, carbrandList: payload };
    },
    // 保存省市区列表
    saveAddress(state, { payload }) {
      return payload ? { ...state, addressList: payload } : { ...state, addressList: emptyArray };
    },
    // 保存已开通服务列表
    saveServices(state, { payload }) {
      return payload ? { ...state, serviceList: payload } : { ...state, serviceList: emptyArray };
    },
    updateMenuData(state, { payload }) {
      return { ...state, MENU_DATA: payload || [] };
    },
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname }, action) => {
        !simplePages.includes(pathname) && dispatch({ type: 'fetchMenuData' });
      });
    }
  }
};