import { request, get } from '@/utils/http';
import * as api from '@/services/apiUrl';
import msg from '@/utils/msg';

const emptyCategoryInfo = {
  category_id: '',
  category_image: '',
  category_index: '',
  category_level: '',
  category_name: '',
  category_parent_id: '',
  category_parent_path: ''
};

export default {
  namespace: 'category_parts',

  state: {
    isChanged: false,                     // 页面是否改动标识 - 用于未保存状态下离开页面时的提示
    categoryTreeList: [],                 // 品类树
    carmodelProList: [],                  // 车型属性列表
    modalInfo: {},                        // 模态框信息
    categoryInfo: emptyCategoryInfo,                     // 品类基本信息【名称，图片】
    categoryList: [],                     // 品类属性【表格】
    carmodelList: [],                     // 车型属性【下拉框】
    isAddTree: false,                     // 表单是否为添加状态
    isAddModal: false,                    // 模态框是否添加状态
    currentCategoryInTree: '',            // 当前品类树的品类
    currentCategoryListIndex: ''          // 当前操作的品类属性索引值【模态框用】
  },

  effects: {
    // 零件树初始化
    *fetchPageInitFn({ payload }, { call, put }) {
      let promises = [];
      // 零件树
      promises.push(get(`${api.category_tree_all}?root=require`));
      // 车型属性
      promises.push(get(`${api.carmodel_pro_list}?type=category`));
      const ret = yield Promise.all(promises);
      yield put({ type: 'updateCategoryTreeList', payload: ret[0].data });
            
      if (ret[1].code === 0) {
        yield put({ type: 'updateCarmodelProList', payload: ret[1].data });
      } else {
        msg(ret[1].msg);
      }
      if(ret[0].data.length === 0) {
        // 创建一个根
        yield put({ type: 'createCategory', payload: {
          categoryParams: {
            category_type: 'PRODUCT',
            category_name: '搜配根零件树',
            category_level: '0',
            category_index: '1',
            category_parent_id: '0',
            category_image: '',
            category_parent_path: '0'
          },
          categoryProParams: [],
          carmodelProParams: [
            {'cm_pro_id': '1000000000000001'},
            {'cm_pro_id': '1000000000000002'},
            {'cm_pro_id': '1000000000000003'},
            {'cm_pro_id': '1000000000000006'},
            {'cm_pro_id': '1000000000000007'},
            {'cm_pro_id': '1000000000000008'},
            {'cm_pro_id': '1000000000000009'},
            {'cm_pro_id': '10000000000000019'},
          ]
        }});
      } else {
        let category_id = ret[0].data[0].key;
        // 默认获取零件树的第一层第一个品类
        const category = yield call(request, { fnName: 'category_info', params: { category_id: category_id } });
        yield put({ type: 'updateCategoryInfo', payload: category.data.categoryParams });
        yield put({ type: 'updateCategoryList', payload: category.data.categoryProParams });
        yield put({ type: 'updateCarmodelList', payload: category.data.carmodelProParams.map(item => item.cm_pro_name) });
        yield put({ type: 'updateCurrentCategoryInTree', payload: category.data });
        payload.cb && payload.cb(category_id);
      }
    },
    // 获取品类树
    *fetchCategoryTree({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'category_tree_all', params: 'require' });
      if(res.code === 0) {
        // 缓存数据
        yield put({ type: 'updateCategoryTreeList', payload: res.data });
        yield put({ type: 'fetchCategoryInfo', payload: res.data[0].key });
        yield put({ type: 'fetchCarmodelProList', payload: { type: 'category' } });
      } 
    },
    // 获取品类信息
    *fetchCategoryInfo({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'category_info', params: { category_id: payload } });
      yield put({ type: 'updateCategoryInfo', payload: res.data.categoryParams });
      yield put({ type: 'updateCategoryList', payload: res.data.categoryProParams });
      yield put({ type: 'updateCarmodelList', payload: res.data.carmodelProParams.map(item => item.cm_pro_name) });
      yield put({ type: 'updateCurrentCategoryInTree', payload: res.data });
      yield put({ type: 'updateIsAddTree', payload: false });
    },
    // 获取当前品类信息
    *fetchCurrentCategoryInfo({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'category_info', params: { category_id: payload } });
      yield put({ type: 'updateCurrentCategoryInTree', payload: res.data });
    },
    // 获取车型属性列表
    *fetchCarmodelProList({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'carmodel_pro_list', params: payload });
      yield put({ type: 'updateCarmodelProList', payload: res.data });
    },
    // 创建品类
    *createCategory({ payload }, { call, put }) {
      const res = yield call(request, { 
        fnName: 'category_create', 
        data: {
          categoryParams: payload.categoryParams,
          categoryProParams: payload.categoryProParams,
          carmodelProParams: payload.carmodelProParams
        } 
      });
      if(res.code === 0) {
        msg('创建成功');
        yield put({ type: 'clearState' });
        yield put({ type: 'fetchCategoryTree' });
      } else if(res.code === 21002) {
        msg(res.error);
      } else {
        msg(res);
      }
      payload.cb && payload.cb(res);
    },
    // 更新品类
    *updateCategory({ payload }, { call, put }) {
      const res = yield call(request, { 
        fnName: 'category_update', 
        data: {
          category_id: payload.category_id,
          categoryParams: payload.categoryParams,
          categoryProParams: payload.categoryProParams,
          carmodelProParams: payload.carmodelProParams
        } 
      });
      if(res.code === 0) {
        msg('更新成功');
        yield put({ type: 'clearState' });
        yield put({ type: 'temp' });
        yield put({ type: 'fetchCategoryInfo', payload: payload.category_id });
        yield put({ type: 'fetchCarmodelProList', payload: { type: 'category' } });
      } else {
        msg(res);
      }
      payload.cb && payload.cb(res);
    },
    // 删除品类
    *deleteCategory({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'category_delete', data: payload });
      if(res.code === 0) {
        msg('删除树节点成功');
        yield put({ type: 'clearState' });
        yield put({ type: 'fetchCategoryTree' });
      } else {
        msg(res);
      }
    },
    // 添加品类节点
    *addCategoryTreeNode({ payload }, { put }) {
      const { fetchCategoryInfo, updateCategoryId, updateIsAddTree, carmodelList, categoryInfo, categoryList } = payload;
      yield put({ type: 'fetchCurrentCategoryInfo', payload: fetchCategoryInfo });
      yield put({ type: 'updateCategoryId', payload: updateCategoryId });
      yield put({ type: 'updateIsAddTree', payload: updateIsAddTree });
      yield put({ type: 'updateCategoryInfo', payload: categoryInfo });
      yield put({ type: 'updateCarmodelList', payload: carmodelList });
      yield put({ type: 'updateCategoryList', payload: categoryList });
    },
    // 零件树节点拖动
    *updateTreeNode({ payload }, { call, put }) {
      const res = yield call(request, { 
        fnName: 'category_drag', 
        data: {
          category_parent_id: payload.category_parent_id,
          category_id: payload.category_id,
          category_index: payload.category_index
        } 
      });
      if(res.code === 0) {
        yield put({ type: 'fetchCategoryTree' });
        msg('排序成功');
      } else {
        msg(res);
      }
    },
    // 品类名称校验
    *validCategoryName({ payload }, { call, put }) {
      let category_name = payload.category_name;
      let category_id = payload.category_id;
      const res = yield call(request, { fnName: 'category_name_valid', params: {category_name, category_id} });
      payload.cb && payload.cb(res);
    },
    *temp({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'category_tree_all', params: 'require' });
      // 缓存数据
      yield put({ type: 'updateCategoryTreeList', payload: res.data });
    }
  },

  reducers: {
    // 保存车型属性列表【原始数据】
    updateCarmodelProList(state, { payload }) { return { ...state, carmodelProList: payload }; },
    // 更新 categoryTreeList【品类树】 数据
    updateCategoryTreeList(state, { payload }) { return { ...state, categoryTreeList: payload }; },
    // 更新 categoryInfo【当前品类信息：名称，图片】 数据
    updateCategoryInfo(state, { payload }) { 
      return payload ? { ...state, categoryInfo: payload } : { ...state, categoryInfo: emptyCategoryInfo }; 
    },
    // 更新 categoryList【表格数据】 数据
    updateCategoryList(state, { payload }) { return { ...state, categoryList: payload }; },
    // 更新 carmodelList【车型属性数据】 数据
    updateCarmodelList(state, { payload }) { return { ...state, carmodelList: payload }; },
    // 更新 currentCategoryInTree 
    updateCurrentCategoryInTree(state, { payload }) { return { ...state, currentCategoryInTree: payload }; },
    // 更新 isAddTree
    updateIsAddTree(state, { payload }) { return { ...state, isAddTree: payload }; },
    // 更新 isAddModal
    updateIsAddModal(state, { payload }) { return { ...state, isAddModal: payload }; },
    // 更新 currentCategoryListIndex 
    updateCurrentCategoryListIndex(state, { payload }) { return { ...state, currentCategoryListIndex: payload }; },
    // 更新 modal 数据
    updateModalInfo(state, { payload }) { return { ...state, modalInfo: payload }; },
    // 更新当前页是否保存标识
    updateIsChanged(state, { payload }) { return { ...state, isChanged: payload }; },
    // 清空缓存
    clearState(state) {
      return {
        ...state,
        isChanged: false,                     // 页面是否改动标识 - 用于未保存状态下离开页面时的提示
        categoryTreeList: [],                 // 品类树
        carmodelProList: [],                  // 车型属性列表
        modalInfo: {},                        // 模态框信息
        categoryInfo: emptyCategoryInfo,      // 品类基本信息【名称，图片】
        categoryList: [],                     // 品类属性【表格】
        carmodelList: [],                     // 车型属性【下拉框】
        isAddTree: false,                     // 表单是否为添加状态
        isAddModal: false,                    // 模态框是否添加状态
        currentCategoryInTree: '',            // 当前品类树的品类
        currentCategoryListIndex: '',         // 当前操作的品类属性索引值【模态框用】
        expandedKeys: []
      };
    },
  },

  subscriptions: {

  }
};