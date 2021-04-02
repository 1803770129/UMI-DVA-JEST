import { request } from '@/utils/http';
import { isEmpty } from '@/utils/tools';
import BraftEditor from 'braft-editor';
import msg from '@/utils/msg';
import qs from 'querystringify';
import ENV from '@/utils/env';
import { Modal, Table } from 'antd';
import router from 'umi/router';
import { uniqBy } from 'lodash';

const emptyArr = [];
const emptyObj = {};

const emptyData = {
  api: '',
  data: {}
};


const emptyPrice = {
  api: '',
  data: [{
    oem_partsku_price: null,
    oem_partsku_price_area_code: 'TENANT'
  },{
    oem_partsku_price: null,
    oem_partsku_price_area_code: 'AREA_NORTH'
  },{
    oem_partsku_price: null,
    oem_partsku_price_area_code: 'AREA_NORTHEASE'
  },{
    oem_partsku_price: null,
    oem_partsku_price_area_code: 'AREA_EAST'
  },{
    oem_partsku_price: null,
    oem_partsku_price_area_code: 'AREA_SOUTH'
  },{
    oem_partsku_price: null,
    oem_partsku_price_area_code: 'AREA_NORTHWEST'
  },{
    oem_partsku_price: null,
    oem_partsku_price_area_code: 'AREA_SHANGHAI'
  }]
};
const emptyEditorState = {data: {}, html: '', imgs: []};
// 获取品类产品名
const getCateName = path => {
  const paths = path ? path.split('/') : [];
  return paths.length === 0 ? '' : paths[paths.length - 1];
};

export default {

  namespace: 'oe_id',

  state: {
    PAGE_TYPE: null,
    OE_INFO_FIELDS: emptyObj,
    OE_INFO: emptyData,
    OE_CODES: emptyArr,
    CATEGORY_TREE: emptyArr,
    CATEGORY_INFO: emptyObj,
    EDITOR_STATE: emptyEditorState, // 富文本编辑器
    PART_PIC_LIST: emptyArr, // 上传产品图片列表
    OEMSKU_PRICE: emptyPrice, // OE价格
    CARMODEL_INFO: emptyData, // 适配车型信息
    CARMODEL_LIST: emptyArr, // 适配车型列表
    BRAND_FAC_MOD_APPROVED_LIST: emptyArr, // 品牌主机厂车型（审核通过）
    CARMODEL_KEYVALUE_LIST: emptyArr, // 筛选车型【添加适配车型用】
    CARMODEL_PRO_LIST: emptyArr, // 车型属性列表
    OEMSKU_MERGE_SELECT: emptyData, // OE合并组
    OEMSKU_MERGE_SELECT_TYPE: 'carmodel',
    OEMSKU_CARMODEL_FILTER_INFO: { data: emptyObj, carmodel: emptyObj }, // 用户反馈数据
    CATEGORIES_FORBID: emptyArr, // 获取品类禁用数据
    CATEGORY_PRO: emptyArr // 品类属性
  },

  effects: {
    // 获取品类属性
    *fetchCategoryPro({ payload, stdsku_info }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'category_pro',
        params: payload,

      });
      if (res.code === 0) {
        // 更新品类属性
        yield put({ type: 'updateCategoryPro', payload: res.data });

      } else {
        msg(res);
      }
    },

    // 获取oe信息详情
    *fetchOemskuEditTabInfo({ payload, isForce }, { call, put, all, select }) {
      const api = qs.stringify(payload);
      const data = yield select(state => state.oe_id.OE_INFO);
      if(data.api !== api || isForce) {
        const res = yield call(request, { fnName: 'oemsku_edit_tab_info', params: payload });
        if(res.code === 0) {
          // 获取品类属性
          yield all([
            yield put({ type: 'fetchCategoryPro', payload: { category_id: res.data.category_id } })
          ]);
    
          const { CATEGORY_PRO } = yield select(state => state.oe_id);
          const _categoryPros = CATEGORY_PRO.filter(v => v.category_pro_type !== 'IMAGE').map(v => {
            const find = res.data.partsku_vals.find(c => c.category_pro_id === v.category_pro_id);
            return find ? {...v, ...find} : v;
          });
          const _categoryProsImages = res.data.partsku_val_imgs.map(v => ({...v, ...CATEGORY_PRO.find(c => c.category_pro_id === v.category_pro_id)}));
          // category_pro_type为IMAGE的属性，根据category_pro_id分组单独展示
          let category_pro_ids = CATEGORY_PRO.filter(v => v.category_pro_type === 'IMAGE');
          const categoryProsImages = category_pro_ids.map(pro => {
            const partsku_value_imgs = _categoryProsImages.filter(v => v.category_pro_id === pro.category_pro_id).map(v => ({...v, uid: v.oem_partsku_image_id, url: v.oem_partsku_image_url}));
            const len = partsku_value_imgs.filter(v => !isEmpty(v.oem_partsku_image_url)).length;
            return { ...pro, partsku_value_imgs: len > 0 ? partsku_value_imgs : [] };
          });
          const data = {...res.data, categoryPros: _categoryPros, categoryProsImages};
          yield put({ 
            type: 'updateOemskuInfo', 
            payload: { api, data }
          });
          const { category_parent_path, category_id, oem_partsku_codes, partsku_imgs, oem_partsku_desc, partsku_desc_imgs } = res.data;
          // 设定OE信息初始化fields值
          // 获取品类禁用数据
          // yield put({ 
          //   type: 'fetchCategoriesForbid', 
          //   payload: { category_id }
          // });

          let fields = { category_id, category_name: getCateName(category_parent_path) };
          for (let i = 0; i < _categoryPros.length; i++) {
            const {category_pro_id, oem_partsku_value} = _categoryPros[i];
            fields[category_pro_id] = oem_partsku_value;
          }
          yield put({ 
            type: 'updateOeInfoFields', 
            payload: fields
          });
                    
          // 设定OE组
          yield put({ 
            type: 'updateOeCodes', 
            payload: oem_partsku_codes
          });

          // 产品图片
          yield put({ 
            type: 'updatePartPicList', 
            payload: partsku_imgs
          });

          // 富文本编辑器
          yield put({ 
            type: 'updateEditorState', 
            payload: {...emptyEditorState, data: {}, html: oem_partsku_desc, imgs: partsku_desc_imgs}
          });
                    
        }else{
          msg(res);
        }
      }
        
    },
    // 零件数-根据品类名称获取品类树
    *fetchCategoryTree({ payload }, { call, put, select }) {
      const data = yield select(state => state.oe_id.CATEGORY_TREE);
      if( data.length === 0 ) {
        const res = yield call(request, {
          fnName: 'category_tree',
          params: payload
        });
        if(res.code === 0) {
          // 生成树数据keys
          const list = [...res.data];
          const loopKeys = (data, init = '0') => {
            let count = 0;
            for(let i = 0; i < data.length; i++) {
              const it = data[i];
              it.keys = init + '-' + count++;
              if(it.children) {
                loopKeys(it.children, it.keys);
              }
            }
          };
          loopKeys(list);
          yield put({
            type: 'updateCategoryTree',
            payload: list
          });
        }else{
          msg(res);
          yield put({ type: 'updateCategoryTree' });
        }
      }
    },
        
    // 获取品类信息
    *fetchCategoryInfo({ payload }, { call, put, select }) {
      const res = yield call(request, { fnName: 'category_info', params: payload });
      if(res.code == 0) {
        yield put({ 
          type: 'updateCategoryInfo', 
          payload: res.data
        });
      }else{
        msg(res);
        yield put({ type: 'updateCategoryInfo' });
      }
    },

    // 获取OE价格
    *fetchOemskuPrice({ payload }, { call, put, select }) {
      const api = qs.stringify(payload);
      const data = yield select(state => state.oe_id.OEMSKU_PRICE);
      if(data.api !== api) {
        const res = yield call(request, { fnName: 'oemsku_price', params: payload });
        if(res.code == 0) {
          let payload = emptyPrice;
          if(res.data.length > 0) {
            const data = emptyPrice.data.map(v => {
              const fil = res.data.filter(r => r.oem_partsku_price_area_code === v.oem_partsku_price_area_code);
              return fil.length > 0 ? {...v, ...fil[0]} : v;
            });
            payload = { api, data };
          }
          yield put({ 
            type: 'updateOemskuPrice', 
            payload
          });
        }else{
          msg(res);
          yield put({ type: 'updateOemskuPrice' });
        }
      }
    },

    // 更新OE价格
    *fetchOemskuPriceUpdate({ payload, callback }, { call, put, select }) {
      const res = yield call(request, { fnName: 'oemsku_price_update', data: payload });
      if(res.code === 0) {
        // 更新id
        callback(res.data.oem_partsku_price_id);
      }else{
        msg(res);
      }
    },

    // 编辑-拆分OE码
    *fetchOemskuCodeSplit({ payload, callback }, { call, put }) {
      const res = yield call(request, {
        fnName: 'oemsku_code_split',
        data: payload
      });
      if(res.code == 0) {
        msg('拆分成功');
        callback();
      } else {
        msg(res);
      }
    },

    // 上传图片文件(编辑和新增时参数不同)
    *fetchImageUpload({ payload, callback }, { call, put, select }) {
      const { oem_partsku_id, category_id, file } = payload;
      const { PAGE_TYPE } = yield select(state => state.oe_id);
      if(!category_id) {
        return callback && callback('请选择 <零件树节点名> 后，再上传图片');
      }
      let fd = new FormData();
      if(PAGE_TYPE === 'edit') {
        fd.append('oem_partsku_id', oem_partsku_id);
      }
      fd.append('category_id', category_id);
      fd.append('image', file);
      const res = yield call(request, { fnName: 'oe_sku_image_upload', data: fd });
      if(res.code === 0) {
        const { oem_partsku_image_id, oem_partsku_image_url } = res.data;
        const { PART_PIC_LIST } = yield select(state => state.oe_id);
        yield put({
          type: 'updatePartPicList',
          payload: [...PART_PIC_LIST, { oem_partsku_image_id, oem_partsku_image_url }]
        });
      } else {
        msg(res.msg);
      }
    },

    // 上传属性图片文件
    *fetchPropImageUpload({ payload, callback }, { call, put, select }) {
      const { category_id, file } = payload;
      if(!category_id) {
        return callback && callback('请选择 <零件树节点名> 后，再上传图片');
      }
      let fd = new FormData();
      fd.append('category_id', category_id);
      fd.append('image', file);
      const res = yield call(request, { fnName: 'oe_sku_image_upload', data: fd });
      if(res.code === 0) {
        const { OE_INFO } = yield select(state => state.oe_id);
        const { oem_partsku_image_id, oem_partsku_image_url } = res.data;
        const categoryProsImages = OE_INFO.data.categoryProsImages.map(v => {
          let obj = {...v};
          let fileObj = {...file, oem_partsku_image_id, oem_partsku_image_url, url: oem_partsku_image_url, uid: oem_partsku_image_id, status: 'done'};
          // 更新显示图片
          if(v.category_pro_id === payload.category_pro_id) {
            const list = (v.partsku_value_imgs && v.partsku_value_imgs.length > 0) ? [...v.partsku_value_imgs, fileObj] : [fileObj];
            obj.partsku_value_imgs = list.length <= payload.category_pro_size ? list : list.slice(1, payload.category_pro_size + 1);
          }
          return obj;
        });
        const _OE_INFO = {
          ...OE_INFO,
          data: {
            ...OE_INFO.data,
            categoryProsImages
          }
        };
        yield put({
          type: 'updateOemskuInfo',
          payload: _OE_INFO
        });
      } else {
        msg(res.msg);
      }
    },

    // 富文本生成长图上传
    *fetchPartskuDescUpload({ payload }, { call, put, select }) {
      const { file } = payload;
      const { OE_INFO } = yield select(state => state.oe_id);
      const { category_id } = OE_INFO.data;
      const fd = new FormData();
      fd.append('category_id', category_id);
      fd.append('image', file);
      return yield call(request, {
        fnName: 'oe_sku_image_upload',
        data: fd
      });
    }, 

    // 上传图片文件富文本编辑器
    *fetchEditorUpload({ payload, callback }, { call, put, select }) {
      const { file } = payload;
      const { PAGE_TYPE, OE_INFO } = yield select(state => state.oe_id);
      const { oem_partsku_id, category_id } = OE_INFO.data;
      // if(!category_id) {
      //   return msg('请选择 <零件树节点名> 后，再上传图片');
      // }
      let fd = new FormData();
      if(PAGE_TYPE === 'edit') {
        fd.append('oem_partsku_id', oem_partsku_id);
      }
      fd.append('category_id', category_id);
      fd.append('image', file);
      return yield call(request, { fnName: 'oe_sku_image_upload', data: fd });
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

    /**适配车型tab */
    // 获取oe车型tab信息详情
    *fetchOemskuCarmodelTabInfo({ payload, isForce }, { call, put, select }) {
      const api = qs.stringify(payload);
      const data = yield select(state => state.oe_id.CARMODEL_INFO);
      if(data.api !== api || isForce) {
        // 获取oe适配车型列表
        const res = yield call(request, { 
          fnName: 'oemsku_carmodel_tab_info', 
          params: payload
        });
        if(res.code === 0) {
          yield put({
            type: 'updateCarmodelInfo',
            payload: { api, data: res.data }
          });
          // 更新适配车型列表
          yield put({
            type: 'updateCarmodelList',
            payload: res.data.carmodelList
          });
        }else{
          msg(res);
        }
      }
    },
    // oem code 检验 【创建OE时用】
    *fetchOemskuCodeCheck({ payload, callback }, { call }) {
      const res = yield call(request, { 
        fnName: 'oemsku_code_check', 
        data: {
          oem_partsku_codes: payload.oem_partsku_codes,
          category_id: payload.category_id,
          oem_partsku_id: payload.oem_partsku_id
        }
      });
      callback(res);
    },

    // 创建OE
    *fetchOemskuCreate({ payload, callback }, { call, put, select }) {
      const { PAGE_TYPE } = yield select(state => state.oe_id);
      const res = yield call(request, { 
        // 区别更新oems和创建oem
        fnName: PAGE_TYPE === 'add' ? 'oemsku_create' : 'oemsku_update', 
        data: payload
      });
        
      if(res.code === 0) {
        const { failList } = res.data;
        if(payload.approve && failList && failList.length !== 0) {
          // 参数approve为true, 审核才会提示， 实际上已经创建成功，只是提示状态，并且显示为待审核状态
          const { OE_CODES } = yield select(state => state.oe_id);
          const tableProps = {
            className: 'm-t-15',
            bordered: true,
            pagination: false,
            rowKey: (item, index) => index,
            columns: [
              { title: 'OE码', dataIndex: 'oem_partsku_code' },
              { title: '失败原因', dataIndex: 'err' }
            ],
            dataSource: OE_CODES.length > 0 ? OE_CODES.map(item => ({oem_partsku_code: item.oem_partsku_code, err: failList[0].err})) : [{oem_partsku_code: '虚拟OE', err: failList[0].err}]
          };

          Modal.info({
            className: 'oe_id_confirm',
            title: '提示',
            okText: '确认',
            onOk: () => {
              // 保证重新拉取列表，并且返回第一页
              callback();
            },
            content: <Table {...tableProps} />,
            closable: true
          });
        } else {
          // 正常成功状态
          msg(PAGE_TYPE === 'add' ? '创建成功' : '更新成功');
          // 保证重新拉取列表，并且返回第一页
          callback();
        }
      }else{
        msg(res);
      }
    },

    // oemsku审核(编辑时)
    *fetchOemskuApprove({ payload }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'oemsku_approve',
        data: payload
      });
      if(res.code === 0) {
        const { failList } = res.data;
        if(failList.length === 0) {
          const { FIELDS } = yield select(state => state.oe);
          msg('操作成功');
          // 保证重新拉取列表，并且保持当前页面
          yield put({
            type: 'oe/fetchOemskuList',
            payload: { 
              params: { ...FIELDS },
              isForce: true
            }
          });
          router.goBack();
        } else {
          // 有错误信息，则提示
          msg({msg: failList[0].err});
        }
      } else {
        msg(res);
      }
    },
    // 删除oem(编辑时)
    *fetchOemskuDelete({ payload, fail }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'oemsku_delete',
        data: payload
      });

      if (res.code == 0) {
        const { FIELDS } = yield select(state => state.oe);
        msg('删除OE成功');
        // 保证重新拉取列表，并且保持当前页面
        yield put({
          type: 'oe/fetchOemskuList',
          payload: {
            params: { ...FIELDS },
            isForce: true
          }
        });
        router.goBack();
      } else if ([21030, 21031, 21032, 21033, 21034].includes(res.code)) {
        // 无法删除提示
        fail(res);
      } else {
        msg(res);
      }
    },
    // 删除oem图片
    // *fetchOemskuImageDelete({ payload, callback }, { call, put }) {
    //     const res = yield call(request, {
    //         fnName: 'oemsku_image_delete',
    //         data: payload
    //     });
    //     if(res.code === 0) {
    //         msg('删除图片成功');
    //         callback();
    //     } else {
    //         msg(res);
    //     }
    // },
    // 获取品牌主机厂车型（审核通过）
    *fetchBrandFacModListApproved({ payload }, { call, put, select }) {
      const data = yield select(state => state.oe_id.BRAND_FAC_MOD_APPROVED_LIST);
      const { oem_partsku_id, cm_brand } = payload;
      const obj = cm_brand ? { fnName: 'carmodel_brand_fac_mod_list_approved', params: { cm_brand } } : {fnName: 'carmodel_brand_fac_mod_list_approved' };
      if( data.length === 0 ) {
        const res = yield call(request, obj);
        if(res.code === 0) {
          // 增加label字段
          const loop = list => {
            return list.map(item => {
              return item.c ? {...item, l: item.v, c: loop(item.c)} : {...item, l: item.v};
            });
          };
          yield put({ type: 'updateBrandfacmodapprovedlist', payload: loop(res.data) });
        } else {
          msg(res);
          yield put({ type: 'updateBrandfacmodapprovedlist' });
        }
      }
    },
    // 筛选车型【添加适配车型用】
    *fetchCarmodelKeyvalueList({ payload, callback }, { call, put, select }) {
      const res = yield call(request, { fnName: 'carmodel_keyvalue_list', params: payload });
      if(res.code === 0) {
        const { CARMODEL_LIST } = yield select(state => state.oe_id);
        yield put({ type: 'updateCarmodelKeyvalueList', payload: formatCarmodelKeyvalueList(CARMODEL_LIST, res.data)});
        callback && callback();
      }else{
        yield put({ type: 'updateCarmodelKeyvalueList'});
        msg(res);
      }
    },
        
    // oe适配车型编辑查询, 筛选车型【编辑适配车型用】
    *fetchOemskuCarmodelEditList({ payload, callback }, { call, put, select }) {
      const res = yield call(request, { fnName: 'oemsku_carmodel_edit_list', params: payload });
      if(res.code === 0) {
        const { CARMODEL_LIST } = yield select(state => state.oe_id);
        const list = res.data.map(v => ({...v, cm_extends: v.cm_extends ? v.cm_extends.map(c => ({...c, checked: true})) : [] }));
        yield put({ 
          type: 'updateCarmodelKeyvalueList', 
          payload: formatCarmodelKeyvalueList(CARMODEL_LIST, list, payload.cm_ids)
        });
        
        callback && callback();
      }else{
        yield put({ type: 'updateCarmodelKeyvalueList'});
        msg(res);
      }
    },

    // 获取车型属性列表
    *fetchCarmodelProList({ payload }, { call, put, select }) {
      const data = yield select(state => state.oe_id.CARMODEL_PRO_LIST);
      if( data.length === 0 ) {
        const res = yield call(request, { fnName: 'carmodel_pro_list', params: payload });
        if(res.code === 0) {
          yield put({ type: 'updateCarmodelProList', payload: res.data });
        }else{
          yield put({ type: 'updateCarmodelProList'});
          msg(res);
        }
      }
    },

    // oe适配车型更新(编辑OE时编辑适配车型)
    *fetchOemskuCarmodelEdit({ payload, callback }, { call, put, select }) {
      const res = yield call(request, { fnName: 'oemsku_carmodel_edit', data: payload });
      if(res.code === 0) {
        msg('适配车型编辑成功！');
        callback();
      }else{
        msg(res);
      }
    },

    // 保存适配车型数据(编辑OE时添加适配车型)
    *fetchOemskuCarmodelAdd({ payload, callback }, { call, put }) {
      const res = yield call(request, {
        fnName: 'oemsku_carmodel_add',
        data: payload
      });
      if(res.code == 0) {
        msg('适配车型添加成功！');
        callback();
      } else {
        msg(res);
      }
    },

    // 删除适配车型
    *fetchOemskuCarmodelDelete({ payload, callback }, { call, put }) {
      const res = yield call(request, {
        fnName: 'oemsku_carmodel_delete',
        data: payload
      });

      if(res.code == 0) {
        msg('删除成功');
        callback();
      } else {
        msg(res);
      }
    },

    // 拆分适配车型
    *fetchOemskuCarmodelSplit({ payload, callback }, { call, put }) {
      const res = yield call(request, {
        fnName: 'oemsku_carmodel_split',
        data: payload
      });

      if(res.code == 0) {
        msg('拆分成功');
        callback();
      } else {
        msg(res);
      }
    },

    // OE合并组
    *fetchOemskuMergeSelect({ payload, isForce }, { call, put, select }) {
      const api = qs.stringify(payload);
      const data = yield select(state => state.oe_id.OEMSKU_MERGE_SELECT);
      if(data.api !== api || isForce) {
        const res = yield call(request, {
          fnName: 'oemsku_merge_select',
          params: payload
        });
        if(res.code == 0) {
          yield put({ type: 'updateOemskuMergeSelect', payload: { api, data: res.data } });
          yield put({ type: 'updateOemskuMergeSelectType', payload: payload.type });
        } else {
          yield put({ type: 'updateOemskuMergeSelect' });
          msg(res);
        }
      }
    },
    // oem不合并
    *fetchOemskuExclude({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'oemsku_exclude',
        data: payload
      });

      if(res.code == 0) {
        callback();
      } else {
        msg(res);
      }
    },
    // oem合并
    *fetchOemskuMerge({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'oemsku_merge',
        data: payload
      });

      if(res.code == 0) {
        callback(res.data);
      } else {
        msg(res);
      }
    },
    // oem保存并审核通过check
    *fetchOemskuApproveCheck({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'oemsku_approve_check',
        params: payload
      });

      if(res.code == 0) {
        const { OE_INFO } = yield select(state => state.oe_id);
        const { categoryPros } = OE_INFO.data;
        const data = res.data.map(v => ({
          ...v,
          oem_partsku_values: v.oem_partsku_values.map(p => {
            let props = {...p};
            for (let i = 0; i < categoryPros.length; i++) {
              const c = categoryPros[i];
              if(c.category_pro_id === p.category_pro_id) {
                props = { ...c, ...props};
                break;
              }
            }
            return props;
          })
        }));
        callback(data);
      } else {
        msg(res);
      }
    },
    // 同一个标准码下的oe全部审核通过
    *fetchOemskuApproveAll({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'oemsku_approve_all',
        data: payload
      });

      if(res.code == 0) {
        callback();
      } else {
        msg(res);
      }
    },
    // 获取车型不适配反馈页面
    *fetchOemskuCarmodelFilterInfo({ payload }, { call, put, select }) {
      const res = yield call(request, { 
        fnName: 'oemsku_carmodel_filter_info', 
        params: {
          oem_partsku_id: payload.oem_partsku_id,
          cm_ids: payload.cm_ids
        }
      });
      if(res.code == 0) {
        let data = res.data;
        let carmodel = payload;
        // 1、oe信息表格
        let oeInfoList = [];
        const partsku_vals = data.categoryPros.filter(v => !isEmpty(v.partsku_value));
        oeInfoList.push({
          cm_product: data.category_name,
          cm_oe: data.oem_partsku_code.length > 0 ? data.oem_partsku_code.map(item => item.oem_partsku_code).join(',') : '虚拟OE',
          cm_info: partsku_vals.length > 0 ? partsku_vals.map(item => { 
            if(item.category_pro_type == 'NUMBER') {
              return item.category_pro_name + '：' + (item.partsku_value || '') + '（' + item.category_pro_unit + '）'; 
            } else {
              return item.category_pro_name + '：' + (item.partsku_value || ''); 
            }
          }).join('，') : '-'
        });
        data.oeInfoList = oeInfoList;
        // 2、反馈车型
        const { CARMODEL_INFO } = yield select(state => state.oe_id);
        let carmodelList = [];
        let cm_other = [];
        const excludes = ['cm_brand', 'cm_factory', 'cm_model', 'cm_model_year', 'cm_displacement', 'cm_ids', 'cm_extends', 'cm_pro_columns'];
        for (let k in carmodel){
          if(!excludes.includes(k) && k.includes('cm_') && !isEmpty(carmodel[k])){
            const pros = CARMODEL_INFO.data.carPro.filter(v => k === v.cm_pro_column)[0];
            cm_other.push({...pros, val: carmodel[k]});
          }
        }
        carmodelList.push({
          cm_brand: carmodel.cm_brand,
          cm_factory: carmodel.cm_factory,
          cm_model: carmodel.cm_model,
          cm_model_year: carmodel.cm_model_year,
          cm_displacement: carmodel.cm_displacement,
          cm_other: cm_other.map(v => `${v.cm_pro_name}：${v.val}`).join('，'),
          cm_ids: carmodel.cm_ids
        });
        data.carmodelList = carmodelList;
        // 3、商户反馈不适配产品
        let noFilterList = [];
        for(let i = 0; i < data.noFilterPartskuArr.length; i++) {
          let item = data.noFilterPartskuArr[i];
          const partsku_vals = item.partsku_vals.filter(v => !isEmpty(v.ten_partsku_value));
          noFilterList.push({
            ten_brand_name: item.ten_brand_name,
            ten_partsku_code: item.ten_partsku_code,
            part_info: partsku_vals.length > 0 ? partsku_vals.map(itm => { 
              let res = '';
              if(itm.category_pro_type == 'NUMBER') {
                res += itm.category_pro_name + '：' + (itm.ten_partsku_value || '') + '（' + itm.category_pro_unit + '）';
              } else {
                res += itm.category_pro_name + '：' + itm.ten_partsku_value || ''; 
              }
              return res;
            }).join('，') : '-'
          });
        }
        data.noFilterList = noFilterList;
        // 4、已适配无反馈产品（参考）
        let filteredList = [];
        for(let i = 0; i < data.filterPartskuArr.length; i++) {
          let item = data.filterPartskuArr[i];
          const partsku_vals = item.partsku_vals.filter(v => !isEmpty(v.ten_partsku_value));
          filteredList.push({
            ten_brand_name: item.ten_brand_name,
            ten_partsku_code: item.ten_partsku_code,
            part_info: partsku_vals.length > 0 ? partsku_vals.map(itm => { 
              let res = '';
              if(itm.category_pro_type == 'NUMBER') {
                res += itm.category_pro_name + '：' + (itm.ten_partsku_value || '') + '（' + itm.category_pro_unit + '）'; 
              } else {
                res += itm.category_pro_name + '：' + itm.ten_partsku_value || ''; 
              }
              return  res;
            }).join('，') : '-'
          });
        }
        data.filteredList = filteredList;
        yield put({ type: 'updateOemskuCarmodelFilterInfo', payload: { data, carmodel: payload } });
      } else {
        yield put({ type: 'updateOemskuCarmodelFilterInfo' });
        msg(res);
      }
            
    },
    // 用户反馈->设置已处理
    *fetchOemskuCarmodelFilterHandled({ payload, callback }, { call, put }) {
      const res = yield call(request, {
        fnName: 'oemsku_carmodel_filter_handled',
        data: payload
      });
            
      if(res.code == 0) {
        callback();
        msg('设置已处理成功');
      } else {
        msg(res);
      }
    },
        
  },

  reducers: {
    updateOemskuInfo(state, { payload }) {
      return payload ? { ...state, OE_INFO: payload } : { ...state, OE_INFO: emptyData };
    },
    updatePageType(state, { payload }) {
      return payload ? { ...state, PAGE_TYPE: payload } : { ...state, PAGE_TYPE: null };
    },
    updateOeInfoFields(state, { payload }) {
      return payload ? { ...state, OE_INFO_FIELDS: payload } : { ...state, OE_INFO_FIELDS: emptyObj };
    },
    updateOeCodes(state, { payload }) {
      return payload ? { ...state, OE_CODES: payload } : { ...state, OE_CODES: emptyArr };
    },
    updateCategoryTree(state, { payload }) {
      return payload ? { ...state, CATEGORY_TREE: payload } : { ...state, CATEGORY_TREE: emptyArr }; 
    },
    updateCategoryInfo(state, { payload }) {
      return payload ? { ...state, CATEGORY_INFO: payload } : { ...state, CATEGORY_INFO: emptyObj };
    },
    updateOemskuPrice(state, { payload }) {
      return payload ? { ...state, OEMSKU_PRICE: payload } : { ...state, OEMSKU_PRICE: emptyPrice };
    },
    // 更新图片列表
    updatePartPicList(state, { payload }) {
      return payload ? { ...state, PART_PIC_LIST: payload.map(v => ({...v, uid: v.oem_partsku_image_id, url: v.oem_partsku_image_url})) } : { ...state, PART_PIC_LIST: emptyArr };
    },
    // 更新富文本编辑器
    updateEditorState(state, { payload }) {
      return payload ? { ...state, EDITOR_STATE: {...state.EDITOR_STATE, ...payload} } : { ...state, EDITOR_STATE: emptyEditorState };
    },
    updateCarmodelInfo(state, { payload }) {
      return payload ? { ...state,  CARMODEL_INFO: payload } : { ...state,  CARMODEL_INFO: emptyData };
    },
    updateCarmodelList(state, { payload }) {
      return payload ? {
        ...state,
        // 适配车型标记时间戳，作为唯一标识
        // 初始化返回的cm_extends标记为选中状态
        CARMODEL_LIST: payload.map(cm => {
          const _cm = {
            ...cm,
            list: cm.list.map( v => v.timeStamp ? v : { ...v, cm_extends: v.cm_extends.map(c => ({...c, checked: true })), timeStamp: Math.ceil(Math.random() * new Date().getTime()) } )
          };
          return _cm.timeStamp ? _cm : { ..._cm, timeStamp: Math.ceil(Math.random() * new Date().getTime()) };
        })
      } : { ...state, CARMODEL_LIST: emptyArr };
    },
    updateBrandfacmodapprovedlist(state, { payload }) {
      return payload ? { ...state, BRAND_FAC_MOD_APPROVED_LIST: payload } : { ...state, BRAND_FAC_MOD_APPROVED_LIST: emptyArr }; 
    },
    updateCarmodelKeyvalueList(state, { payload }) {
      return payload ? { ...state, CARMODEL_KEYVALUE_LIST: payload.map(v => (v.timeStamp ? v : { ...v, timeStamp: Math.ceil(Math.random() * new Date().getTime())  })) } : { ...state, CARMODEL_KEYVALUE_LIST: emptyArr }; 
    },
    updateCarmodelProList(state, { payload }) {
      return payload ? { ...state, CARMODEL_PRO_LIST: payload } : { ...state, CARMODEL_PRO_LIST: emptyArr }; 
    },
    updateOemskuMergeSelect(state, { payload }) {
      return payload ? { ...state, OEMSKU_MERGE_SELECT: payload } : { ...state, OEMSKU_MERGE_SELECT: emptyData }; 
    },
    updateOemskuMergeSelectType(state, { payload }) {
      return payload ? { ...state, OEMSKU_MERGE_SELECT_TYPE: payload } : { ...state, OEMSKU_MERGE_SELECT_TYPE: 'carmodel' }; 
    },
    updateOemskuCarmodelFilterInfo(state, { payload }) {
      return payload ? { ...state, OEMSKU_CARMODEL_FILTER_INFO: payload } : { ...state, OEMSKU_CARMODEL_FILTER_INFO: { data: emptyObj, carmodel: emptyObj } }; 
    },
    updateCategoriesForbid(state, { payload }) {
      return payload ? { ...state, CATEGORIES_FORBID: payload } : { ...state, CATEGORIES_FORBID: emptyArr }; 
    },
    updateCategoryPro(state, { payload }) {
      return payload ? { ...state, CATEGORY_PRO: payload } : { ...state, CATEGORY_PRO: emptyArr };
    },
  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, query }, action) => {
        const { oem_partsku_id } = query;
        // OE信息初始化
        const isEdit = /^\/oe\/list\/\d+\/?$/i.test(pathname);
        const isAdd = /^\/oe\/list\/-1\/?$/i.test(pathname);
        let queues = [
          { type: 'fetchCategoryTree', payload: 'norequire'} 
        ];
        if(isAdd) {
          // 添加OE页面
          queues = queues.concat([
            { type: 'updatePageType', payload: 'add' },
            { type: 'updateOemskuPrice' } // 价格默认初始值
          ]);
        }
        if(isEdit) {
          // 编辑OE页面
          queues = queues.concat([
            { type: 'fetchOemskuEditTabInfo', payload: { oem_partsku_id } },
            { type: 'fetchOemskuPrice', payload: { oem_partsku_id }}, 
            { type: 'updatePageType', payload: 'edit' }
          ]);
        }

        if(isAdd || isEdit) {
          for (const it of queues) {
            dispatch(it);
          }
        }

                
      });
    }
  }
};

// 格式化待添加车型数据
function formatCarmodelKeyvalueList(CARMODEL_LIST, resData, payload_cm_ids) {
  let payload = [];
  let includes_exclude_list = [];
  /**
     * 1、一条车型对应多个cm_id，其中包含已经添加过的cm_id，那么已经添加的cm_id就要拆分出一条车型展示出来，checkbox不可选，应该显示两条一样的车型，一条不可勾选（对应已添加的cm_id），一条可勾选（对应为添加的cm_id）。
     * 2、一条车型对应多个cm_id，如果全部cm_id都是已添加的，那么这条车型就是不可勾选的
     * 3、勾选了两条车型，但扩展列和备注都没有值，这个时候添加到适配车型列表时，应该为一条车型(点击添加保存时处理)
     */
    
  const all_cm_ids = CARMODEL_LIST.reduce((init, v) => init.concat(v.list), []).reduce((init, v) => init.concat(v.cm_ids), []);
  includes_exclude_list = resData.map(v => {
    let _v = { ...v, cm_extends: v.cm_extends ? v.cm_extends : [] };
    let includes = [];
    let exclude = [];
    for(let i = 0; i < v.cm_ids.length; i++) {
      const cm_id = v.cm_ids[i];
      if(all_cm_ids.includes(cm_id)) {
        includes.push(cm_id);
      }else{
        exclude.push(cm_id);
      }
    }
    return {..._v, includes, exclude};
  });

  // 1、一条车型对应多个cm_id，其中包含已经添加过的cm_id，那么已经添加的cm_id就要拆分出一条车型展示出来，checkbox不可选，应该显示两条一样的车型，一条不可勾选（对应已添加的cm_id），一条可勾选（对应为添加的cm_id）。
  // 2、一条车型对应多个cm_id，如果全部cm_id都是已添加的，那么这条车型就是不可勾选的
  for (let i = 0; i < includes_exclude_list.length; i++) {
    const v = includes_exclude_list[i];
    if(v.includes.length > 0){
      // includes 是cm_id已经包含在当前车型列表，selected = 1 模拟禁用项, 
      // exclude 是重新生成另外一组车型
      // payload_cm_ids 编辑时，不禁用当前编辑带入的行
      const includesObj = {...v, cm_ids: v.includes, selected: payload_cm_ids ? 0 : 1};
      if(v.exclude.length === 0) {
        // includes.length > 0 && exclude.length === 0 说明全部cm_id都是已添加
        payload.push(includesObj);
      }else{
        payload.push(includesObj, {...v, cm_ids: v.exclude});
      }
    }else{
      payload.push({...v});
    }
  }

  return payload;
}