import { request } from '@/utils/http';
import msg from '@/utils/msg';
import router from 'umi/router';

const emptyArray = [];

export default {
  namespace: 'baseorigin_id',

  state: {
    carmodelOriginList: [],                     // 关联源车型列表
    carmodelOriginInfo: {},                     // 关联源车型详情
    listByCmid: [],                             // 待审核标准车型列表
    listBySearch: [],                           // 合并标准车型列表
    carmodelBaseInfo: [],                       // 标准车型详情数据【模态框】
    showModalCmid: '',
    removeOriginList: [],                       // 解除标准车型和源车型关系id列表【保存勾选的数据索引】
    listBySearchSelectedList: [],               // 合并标准车型被选中的数组【保存勾选的数据索引】
    fields: {
      cm_carmodel: [],                        // 合并标准车型 - 搜索框车型值
      cm_engine_model: '',                    // 合并标准车型 - 搜索框发动机型号值
      cm_displacement: '',                    // 合并标准车型 - 搜索框排量值
      cm_model_year: '',                      // 合并标准车型 - 搜索框年款值
      yearFlag: '',                           // 合并标准车型 - 搜索框删除图标flag
      displacementFlag: '',                   // 合并标准车型 - 搜索框删除图标flag
      engineFlag: ''                          // 合并标准车型 - 搜索框删除图标flag
    },
    CARMODEL_CAR: emptyArray,
    CARMODEL_ENGINEOIL_LEVEL: emptyArray,
    CARMODEL_ENGINEOIL_SAE: emptyArray,
    carmodelOriginHistoryList:[]
  },

  effects: {
    // 获取源车型列表
    *fetchCarmodelOriginList({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'carmodel_origin_list', params: payload });
      if(res.code === 0) {
        yield put({ type: 'saveCarmodelOriginList', payload: res.data });
        payload.cb && payload.cb();
      } else {
        msg(res);
      }
    },
    // 获取标准车型修改记录
    *fetchCarmodelOriginRecordList({payload},{call,put}){
      const res = yield call(request,{
        fnName:'carmodel_info_update_history',
        params:payload
      });
      if (res.code === 0) {
        yield put({
          type: 'updateHistory',
          payload: res.data,
        });
      }else{
        msg(res);
        yield put({
          type: 'updateHistory',
        });
      }
    },
    // 获取待审核车型列表 // 通过cm_id获取页面标准车型(详情页面)
    *fetchListByCmid({ payload }, { call, put }) {
      let params = {};
      for(let key in payload.query) {
        params[key] = payload.query[key];
      }
      const res = yield call(request, { fnName: 'carmodel_base_list', params: params });
      if (res.code === 0) {
        let listByCmid = res.data.list.map(item => {
          let cm_carmodel = item.cm_brand + ' / ' + item.cm_factory + ' / ' + item.cm_model + ' / ' + item.cm_conf_level;
          return { ...item, cm_carmodel };
        });
        yield put({ type: 'updateState', payload: {listByCmid} });
        payload.cb && payload.cb();
      } else {
        msg(res);
      }
    },
    // 获取合并车型列表 // 通过查询条件获取合并车型列表(详情页面)
    *fetchListBySearch({ payload }, { call, put }) {
      let params = {
        filterCmIdList: payload.filterCmIdList.join(','),
        review_status: 'APPROVED',                               // 默认返回已通过审核的数据
        page:1,
        perpage: 100 // 只显示100条数据，太多也没意义
      };
      for(let key in payload.query) {
        params[key] = payload.query[key];
      }
      const res = yield call(request, { fnName: 'carmodel_base_list', params: params });
      if (res.code === 0) {
        let listBySearch = res.data.list.map(item => {
          let cm_carmodel = item.cm_brand + ' / ' + item.cm_factory + ' / ' + item.cm_model + ' / ' + item.cm_conf_level;
          return { ...item, cm_carmodel };
        });
        yield put({ type: 'updateState', payload: {listBySearch} });
        payload.cb && payload.cb();
      } else {
        msg(res);
      }
    },

    // 解除标准车型和源车型关系
    *fetchBaseOriginMappingDelete({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'carmodel_base_origin_mapping_delete', data: payload });
      if (res.code === 0) {
        msg('解除源车型关联成功');
      } else {
        msg(res);
      }
      payload.cb && payload.cb(res);
    },

    // 标准车型审核通过
    *fetchBaseOriginApprove({ payload }, { call, put }) {
      let data = { cm_ids: payload.data.cm_ids, review_status: payload.data.review_status };
      if(payload.data.target_cm_id) {
        data.target_cm_id = payload.data.target_cm_id;
      }
      const res = yield call(request, { fnName: 'carmodel_base_origin_approve', data });
      if (res.code === 0) {
        msg('审核成功');
      } else {
        msg(res);
      }
      payload.cb && payload.cb(res);
    },

    // 删除标准车型
    *fetchBaseInfoDelete({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'carmodel_base_info_delete', data: payload });
      if (res.code === 0) {
        msg('删除成功');
        router.goBack();
      } else {
        msg(res);
      }
    },
    // 车型详情更新
    *fetchBaseInfoUpdate({ payload }, { call, put }) {

      const res = yield call(request, { fnName: 'carmodel_base_info_update', data: payload.data });
      if (res.code === 0) {
        yield put({
          type: 'fetchCarmodelOriginRecordList',
          payload:{cm_id:payload.data.cm_id}
        });
        let baseorigin_id = window.g_app._store.getState().baseorigin_id;
        let cm_id = baseorigin_id.listByCmid[0].cm_id;
        // 重新加载待选车型数据
        yield put({ type: 'fetchListByCmid', payload: { query: { cm_id } } });

        let query = {
          cm_brand: baseorigin_id.fields.cm_carmodel[0] || '',
          cm_factory: baseorigin_id.fields.cm_carmodel[1] || '',
          cm_model: baseorigin_id.fields.cm_carmodel[2] || '',
          cm_displacement: baseorigin_id.fields.cm_displacement,
          cm_engine_model: baseorigin_id.fields.cm_engine_model,
          cm_model_year: baseorigin_id.fields.cm_model_year
        };
        for(let key in query) {
          if(!query[key]) {
            delete query[key];
          }
        }
        payload.cb && payload.cb();

      } else {
        msg(res);
      }
    },
    // 获取源车型详情
    *fetchCarmodelOriginInfo({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'carmodel_origin_info', params: payload });
      if (res.code === 0) {
        return res.data;

      } else {
        msg(res);
      }
    },
    // 获取标准车型详情
    *fetchCarmodelBaseInfo({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'carmodel_base_info', params: payload });
      if (res.code === 0) {
        return res.data;
      } else {
        msg(res);
      }
    },
    // 删除标准车型源车型
    *delCarmodelOrigin({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'carmodel_origin_del',
        data: {
          cm_id: payload.cm_id,
          cm_origin_id: payload.cm_origin_id
        }
      });
      if (res.code === 0) {
        msg('删除成功');
        const { carmodelOriginList } = yield select(state => state.baseorigin_id);
        let newCarmodelOriginList = carmodelOriginList.filter(item => item.cm_origin_id != payload.cm_origin_id);
        yield put({ type: 'saveCarmodelOriginList', payload: newCarmodelOriginList });
      } else {
        msg(res);
      }
    },
    // 获取同品牌同主机厂下的车系
    *fetchCarmodelCar({ payload }, { call, put, select }) {
      // 事先清空数据
      yield put({ type: 'updateCarmodelCar' });
      const res = yield call(request, {
        fnName: 'carmodel_car',
        params: payload
      });

      if (res.code === 0) {
        yield put({ type: 'updateCarmodelCar', payload: res.data });
      }else{
        msg(res);
      }
    },

    // 获取机油等级数据
    *fetchCarmodelEngineoilLevel({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'carmodel_engineoil_level',
        params: payload
      });

      if (res.code === 0) {
        yield put({
          type: 'updateCarmodelEngineoilLevel',
          payload: res.data
        });
      }else{
        msg(res);
      }
    },

    // 添加标准车型机油等级
    *fetchCarmodelEngineoilLevelAdd({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'carmodel_engineoil_level_add',
        data: payload
      });
      if (res.code === 0) {
        yield put({
          type: 'fetchCarmodelEngineoilLevel',
          payload: { cm_id: payload.cm_id }
        });
      }else{
        msg(res);
      }
    },

    // 更新标准车型机油等级
    *fetchCarmodelEngineoilLevelUpdate({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'carmodel_engineoil_level_update',
        data: payload
      });
      if (res.code === 0) {
        msg('更新成功');
        yield put({
          type: 'fetchCarmodelOriginRecordList',
          payload:{cm_id:payload.cm_id}
        });
      }else{
        msg(res);
      }
    },

    // 删除标准车型机油等级
    *fetchCarmodelEngineoilLevelDel({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'carmodel_engineoil_level_del',
        data: payload
      });
      if (res.code === 0) {
        const { CARMODEL_ENGINEOIL_LEVEL } = yield select(state => state.baseorigin_id);
        yield put({
          type: 'updateCarmodelEngineoilLevel',
          payload: CARMODEL_ENGINEOIL_LEVEL.filter(v => v.cm_engineoil_level_id !== payload.cm_engineoil_level_id)
        });
        msg('删除成功');
        yield put({
          type: 'fetchCarmodelOriginRecordList',
          payload:{cm_id:payload.cm_id}
        });
      }else{
        msg(res);
      }
    },

    // 获取机油等级数据
    *fetchCarmodelEngineoilSae({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'carmodel_engineoil_sae',
        params: payload
      });

      if (res.code === 0) {
        yield put({
          type: 'updateCarmodelEngineoilSae',
          payload: res.data
        });
      }else{
        msg(res);
      }
    },

    // 添加标准车型机油等级
    *fetchCarmodelEngineoilSaeAdd({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'carmodel_engineoil_sae_add',
        data: payload
      });
      if (res.code === 0) {
        yield put({
          type: 'fetchCarmodelEngineoilSae',
          payload: { cm_id: payload.cm_id }
        });
      }else{
        msg(res);
      }
    },

    // 更新标准车型机油等级
    *fetchCarmodelEngineoilSaeUpdate({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'carmodel_engineoil_sae_update',
        data: payload
      });
      if (res.code === 0) {
        msg('更新成功');
        yield put({
          type: 'fetchCarmodelOriginRecordList',
          payload:{cm_id:payload.cm_id}
        });
      }else{
        msg(res);
      }
    },

    // 删除标准车型机油等级
    *fetchCarmodelEngineoilSaeDel({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'carmodel_engineoil_sae_del',
        data: payload
      });
      if (res.code === 0) {
        const { CARMODEL_ENGINEOIL_SAE } = yield select(state => state.baseorigin_id);
        yield put({
          type: 'updateCarmodelEngineoilSae',
          payload: CARMODEL_ENGINEOIL_SAE.filter(v => v.cm_engineoil_sae_id !== payload.cm_engineoil_sae_id)
        });
        msg('删除成功');
        yield put({
          type: 'fetchCarmodelOriginRecordList',
          payload:{cm_id:payload.cm_id}
        });
      }else{
        msg(res);
      }
    },


  },

  reducers: {
    // 保存源车型列表
    saveCarmodelOriginList(state, { payload }) {
      return payload ? {...state, carmodelOriginList: payload} : {...state, carmodelOriginList: emptyArray};
    },
    // 更新state状态
    updateState(state, action) {
      let props = action.payload;
      return { ...state, ...props };
    },
    // 离开时清空缓存
    clearState(state) {
      return {
        ...state,
        carmodelOriginList: [],                     // 关联源车型列表
        carmodelOriginInfo: {},                     // 关联源车型详情
        listByCmid: [],                             // 待审核标准车型列表
        listBySearch: [],                           // 合并标准车型列表
        carmodelBaseInfo: [],                       // 标准车型详情数据【模态框】
        showModalCmid: '',
        removeOriginList: [],                       // 解除标准车型和源车型关系id列表
        listBySearchSelectedList: [],               //
        fields: {
          cm_carmodel: [],                        // 合并标准车型 - 搜索框车型值
          cm_engine_model: '',                    // 合并标准车型 - 搜索框发动机型号值
          cm_displacement: '',                    // 合并标准车型 - 搜索框排量值
          cm_model_year: '',                      // 合并标准车型 - 搜索框年款值
          yearFlag: '',                           // 合并标准车型 - 搜索框删除图标flag
          displacementFlag: '',                   // 合并标准车型 - 搜索框删除图标flag
          engineFlag: ''                          // 合并标准车型 - 搜索框删除图标flag
        }
      };
    },
    // 保存勾选的合并标准车型的索引数组
    saveListBySearchSelected(state, { payload }) {
      return payload ? {...state, listBySearchSelectedList: payload} : {...state, listBySearchSelectedList: emptyArray};
    },
    updateCarmodelCar(state, { payload }) {
      return payload ? {...state, CARMODEL_CAR: payload} : {...state, CARMODEL_CAR: emptyArray};
    },
    updateCarmodelEngineoilLevel(state, { payload }) {
      return {...state, CARMODEL_ENGINEOIL_LEVEL: payload || emptyArray};
    },
    updateCarmodelEngineoilSae(state, { payload }) {
      return {...state, CARMODEL_ENGINEOIL_SAE: payload || emptyArray};
    },
    updateHistory(state, { payload }) {
      return { ...state, carmodelOriginHistoryList: payload };
    },

  },

  subscriptions: {

  }

};
