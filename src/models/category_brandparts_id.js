import { request } from '@/utils/http';
import msg from '@/utils/msg';

export default {
  namespace: 'category_brandparts_id',

  state: {
    isChanged: false,
    brandCategoryProductDetail: {},
    treeData: [],
    treeCategoryInfo: {},
    page: 1,
    perpage: 10,
  },

  effects: {
    // 获取品牌件产品列表
    *fetchBrandCategoryProductDetail({ payload }, { call, put }) {
      const res = yield call(request, { 
        fnName: 'brand_category_product_detail', 
        params: { 
          brand_category_id: payload.brand_category_id 
        }
      });
      if(res.code === 0) {
        let list = res.data.map((item, index) => {
          let obj = {...item};
          obj.id = index;
          return obj;
        });
        yield put({ type: 'updateBrandCategoryProductDetail', payload: list[0] });
        yield put({ type: 'updatePageInitFlag', payload: true });
        payload.cb && payload.cb(list[0]);
      }
    },
    // 获取零件树
    *fetchCategoryTree({ payload }, { call, put }) {

      const res = yield call(request, { fnName: 'category_tree_all', payload: 'require' });

      if(res.code === 0) {
        // 生成树数据keys
        const list = [...res.data];
        const loopKeys = (data, init = '0') => {
          let count = 0;
          for (let i = 0; i < data.length; i++) {
            const it = data[i];
            it.keys = init + '-' + count++;
            if (it.children) {
              loopKeys(it.children, it.keys);
            }
          }
        };
        loopKeys(list);
        yield put({ type: 'updateCategoryTree', payload: list });
      } else {
        msg(res);
      }

      payload.cb && payload.cb();
    },
    // 获取品类信息
    *fetchCategoryInfo({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'category_info', params: { category_id: payload } });
      if(res.code === 0) {
        yield put({ type: 'updateCategoryInfo', payload: res.data });
      } else {
        msg(res);
      }
    },
    // 查看品类名是否可用【添加】
    *vaildCategoryNameAdd({ payload }, { call, put }) {
      const res = yield call(request, { 
        fnName: 'brand_category_name_valid_update', 
        params: { 
          type: 'category',
          brand_category_id: payload.brand_category_id, 
          brand_category_name: payload.brand_category_name 
        }
      });
      yield payload.cb && payload.cb(res);
    },
    // 查看品类编码是否可用【添加】
    *vaildCategoryCodeAdd({ payload }, { call, put }) {
      const res = yield call(request, { 
        fnName: 'brand_category_code_valid_add', 
        params: { 
          type: 'category',
          brand_category_code: payload.brand_category_code
        }
      });
      yield payload.cb && payload.cb(res);
    },
    // 查看品类编码是否可用【更新】
    *vaildCategoryCodeUpdate({ payload }, { call, put }) {
      const res = yield call(request, { 
        fnName: 'brand_category_code_valid_update', 
        params: { 
          type: 'category',
          brand_category_id: payload.brand_category_id, 
          brand_category_code: payload.brand_category_code 
        }
      });
      yield payload.cb && payload.cb(res);
      if(res.code === 0) {
        if(res.data) {
          yield put({ 
            type: 'updateBrandCode', 
            payload: { 
              brand_category_id: payload.brand_category_id, 
              brand_category_code: payload.brand_category_code 
            } 
          });
        }
      }
    },
    // 查看品类名是否可用【更新】
    *vaildCategoryNameUpdate({ payload }, { call, put }) {
      const res = yield call(request, { 
        fnName: 'brand_category_name_valid_update', 
        params: { 
          type: 'category',
          brand_category_id: payload.brand_category_id, 
          brand_category_name: payload.brand_category_name 
        }
      });
      yield payload.cb && payload.cb(res);
      if(res.code === 0) {
        // if(res.data) {
        yield put({ 
          type: 'updateBrandName', 
          payload: { 
            brand_category_id: payload.brand_category_id, 
            brand_category_name: payload.brand_category_name 
          } 
        });
        // }
      }
    },
    // 查看产品编码是否可用【添加】
    *vaildProductCodeAdd({ payload }, { call, put }) {
      if(!payload.product_code) return;
      const res = yield call(request, { 
        fnName: 'brand_product_code_valid_add', 
        params: { 
          type: 'product',
          product_id: payload.product_id, 
          brand_category_id: payload.brand_category_id,
          product_code: payload.product_code
        }
      });
      yield payload.cb && payload.cb(res);
      if(res.code !== 0) {
        msg('该产品编码已被使用');
      }
    },
    // 查看产品编码是否可用【更新】
    *vaildProductCodeUpdate({ payload }, { call, put }) {
      const res = yield call(request, { 
        fnName: 'brand_product_code_valid_update', 
        params: { 
          type: 'product',
          product_id: payload.product_id, 
          brand_category_id: payload.brand_category_id,
          product_code: payload.product_code 
        }
      });
      if(res.code === 0) {
        yield put({ 
          type: 'updateProductCode', 
          payload: { 
            brand_category_id: payload.product_id, 
            brand_category_code: payload.product_code 
          } 
        });
      }
      payload.cb && payload.cb(res);
    },
    // 查看产品名称是否可用【更新】
    *vaildProductNameUpdate({ payload }, { call, put }) {
      const res = yield call(request, {
        fnName: 'brand_product_name_valid_update',
        params: {
          type: 'product',
          brand_category_id: payload.check_brand_category_id,
          product_id: payload.check_product_id, 
          product_name: payload.product_name
        }
      });
      yield payload.cb && payload.cb(res);
      if(res.code != 0) {
        msg('该产品名称已被使用');
      } else {
        yield put({ 
          type: 'updateProductName', 
          payload: { 
            brand_category_id: payload.brand_category_id, 
            category_id: payload.category_id 
          } 
        });
      }
    },
    // 查看产品名称是否可用【添加】
    *vaildProductNameAdd({ payload }, { call, put }) {
      const res = yield call(request, {
        fnName: 'brand_product_name_valid_add',
        params: {
          type: 'product',
          brand_category_id: payload.brand_category_id,
          product_name: payload.brand_productList.category_name
        }
      });
      yield payload.vaildcb && payload.vaildcb(res);
      if(res.code === 0) {
        yield put({
          type: 'createProduct', 
          payload: { 
            brand_category_id: payload.brand_category_id, 
            brand_productList: payload.brand_productList,
            createcb: payload.createcb
          }
        });
      } else {
        msg('该产品名称已被使用');
      }
    },
    // 修改产品编码
    *updateProductCode({ payload }, { call, put }) {
      const res = yield call(request, { 
        fnName: 'brand_product_update', 
        data: { 
          brand_category_id: payload.brand_category_id, 
          brand_category_code: payload.brand_category_code 
        }
      });
      if(res.code === 0) {
        msg('修改品类状态成功');
      } else {
        msg(res);
      }
    },
    // 修改品类名
    *updateBrandName({ payload }, { call, put }) {
      const res = yield call(request, { 
        fnName: 'brand_product_update',
        data: { 
          brand_category_id: payload.brand_category_id, 
          brand_category_name: payload.brand_category_name 
        }
      });
      if(res.code === 0) {
        msg('修改品类名成功');
      } else {
        msg(res);
      }
    },
    // 修改品类编码
    *updateBrandCode({ payload }, { call, put }) {
      const res = yield call(request, { 
        fnName: 'brand_product_update', 
        data: { 
          brand_category_id: payload.brand_category_id, 
          brand_category_code: payload.brand_category_code 
        }
      });
      if(res.code === 0) {
        msg('修改品类编码成功');
      } else {
        msg(res);
      }
    },
    // 修改品类状态
    *modifyBrandStatus({ payload }, { call, put }) {
      const res = yield call(request, { 
        fnName: 'brand_product_update', 
        data: { 
          brand_category_id: payload.brand_category_id, 
          brand_category_status: payload.brand_category_status 
        }
      });
      if(res.code === 0) {
        payload.cb && payload.cb(res);
        msg('修改品类状态成功');
      } else {
        msg(res);
      }
    },
    // 修改产品名称
    *updateProductName({ payload }, { call, put }) {
      const res = yield call(request, { 
        fnName: 'brand_product_update', 
        data: { 
          brand_category_id: payload.brand_category_id, 
          category_id: payload.category_id 
        }
      });
      if(res.code === 0) {
        msg('修改零件树节点名成功');
      } else {
        msg(res);
      }
    },
    // 修改产品状态修改
    *updateBrandCategoryStatus({ payload }, { call, put }) {
      const res = yield call(request, { 
        fnName: 'brand_product_update', 
        data: { 
          brand_category_id: payload.brand_category_id, 
          brand_category_status: payload.brand_category_status 
        }
      });
      if(res.code === 0) {
        payload.cb && payload.cb();
        msg('状态更改成功');
      } else {
        msg(res);
      }
    },
    // 修改适配编码模板说明
    *updateBrandCategoryImptDesc({ payload }, { call, put }) {
      const res = yield call(request, { 
        fnName: 'brand_product_update', 
        data: { 
          brand_category_id: payload.brand_category_id, 
          brand_category_impt_desc: payload.brand_category_impt_desc || ''
        }
      });
      if(res.code === 0) {
        payload.cb && payload.cb();
        msg('适配编码模板说明更改成功');
      } else {
        msg(res);
      }
    },
    // 品牌件品类删除
    *deleteBrandCategory({ payload }, { call, put }) {
      const res = yield call(request, { fnName: 'brand_category_delete', data: payload });
      if(res.code === 0) {
        msg('删除成功');
      } else {
        msg(res);
      }
      payload.cb && payload.cb(res);
    },
    // 创建品类和产品
    *createCategory({ payload }, { call, put }) {
      const res = yield call(request, { 
        fnName: 'brand_product_create', 
        data: {
          brand_category_name: payload.brand_category_name,
          brand_category_code: payload.brand_category_code,
          brand_category_image: payload.brand_category_image,
          brand_category_impt_desc: payload.brand_category_impt_desc,
          brand_category_status: payload.brand_category_status,
          brand_productList: payload.brand_productList
        } 
      });
      payload.cb && payload.cb(res);
      if(res.code === 0) {
        msg('创建成功');
      } else if(res.code == 21003) {
        msg('编码或者名称有重复');
      } else {
        msg(res);
      }
    },
    // 创建产品
    *createProduct({ payload }, { call, put }) {
      const res = yield call(request, { 
        fnName: 'brand_product_add', 
        data: { 
          brand_category_id: payload.brand_category_id, 
          brand_productList: payload.brand_productList 
        }
      });
      yield payload.createcb && payload.createcb(res);
      if(res.code === 0) {
        msg('添加产品成功');
      }
    },
    // 拖拽表格
    *dragTable({ payload }, { call, put }) {
      const res = yield call(request, { 
        fnName: 'brand_product_drag', 
        data: { 
          brand_category_id: payload.brand_category_id, 
          brand_category_index: payload.brand_category_index 
        }
      });
      yield payload.cb && payload.cb(res);
      if(res.code === 0) {
        msg('产品排序成功');
      } else {
        msg(res.msg);
      }
    },
    // 更新品类logo
    *updateCategoryLogo({ payload }, { call, put }) {
      const res = yield call(request, {
        fnName: 'brand_product_update',
        data: {
          brand_category_id: payload.brand_category_id,
          brand_category_image: payload.brand_category_image
        }
      });
      if(res.code === 0) {
        msg('修改成功');
      } else {
        msg(res.msg);
      }
    }
  },

  reducers: {
    // 更新品牌件产品列表
    updateBrandCategoryProductDetail(state, { payload }) { return { ...state, brandCategoryProductDetail: payload }; },
    // 更新零件树
    updateCategoryTree(state, { payload }) { return { ...state, treeData: payload }; },
    // 更新品类树上的产品详情
    updateCategoryInfo(state, { payload }) { return { ...state, treeCategoryInfo: payload }; },
    // 更新当前页是否保存标识
    updateIsChanged(state, { payload }) { return { ...state, isChanged: payload }; },
    clearState(state, { payload }) {
      return {
        ...state,
        isChanged: false,
        brandCategoryProductDetail: {},
        treeData: [],
        treeCategoryInfo: {},
        page: 1,
        perpage: 10
      };
    }
  },

  subscriptions: {

  }
};