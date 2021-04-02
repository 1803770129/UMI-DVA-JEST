import React, { Component } from 'react';
import { connect } from 'dva';
import { Tabs, Modal, Table, Button, Divider, Row, Col, message, Icon, Radio, Spin } from 'antd';
import { isString, isEmpty, clearState, getPicSize, dataURLtoFile, loadingAllDescImgs, getOriginalImgDesc, isArray } from '@/utils/tools';
import qs from 'querystringify';
import IdOeInfo from './components/IdOeInfo';
import IdCarModel from './components/IdCarModel';
import IdOeMergeGroup from './components/IdOeMergeGroup';
import TreeNodeModal from '@/components/TreeNodeModal';
import IdAddCarmodel from './components/IdAddCarmodel';
import IdDescPropsModal from './components/IdDescPropsModal';
import SaveBtn from './components/SaveBtn';
import IdFeedback from './components/IdFeedback';
import { uniqBy } from 'lodash';
// 转换html为图片
import domtoimage from 'dom-to-image';
import { PhotoSwipe } from 'react-photoswipe';
import router from 'umi/router';
import msg from '@/utils/msg';
import ENV from '@/utils/env';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import styles from './$id.less';
const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
let timer = null;
const modalProps = {
  destroyOnClose: true,
  maskClosable: false,
  footer: null
};
let _modal = null;

// 页面组件
class $Oe_id extends Component {

  state = {
    oeCode: '',
    codeVerify: '',
    treeNodeModalVisible: false, // 零件树模态框状态
    addCarmodelModalVisible: false,　// 添加适配车型模态框状态
    descModalVisible: false,  //特殊说明模态框状态
    saveApproveModalVisible: false, // 保存并审核模态框状态
    feedbackModalVisible: false, // 用户反馈模态框状态
    splitModalVisible: false, // 拆分模态框状态
    oem_carmodel_comment_desc: '', //缓存特殊说明
    currentRowIdx: '', // 缓存特殊说明当前行
    expandedKeys: [],
    selectedKeys: [],
    columnSearchKeys: {},
    tabsActiveKey: 'oeInfo', // tab状态
    carmodelModelType: 'add', // 适配车型模态框操作状态
    currentEditCarmodel: {}, // 缓存当前编辑车型
    saveApproveModalDataSource: [], //保存并审核模态框表格数据
    split_type: '', // 拆分类型
    split_cm_ids: '', // 缓存拆分的cm_ids
    isOpen: false,
    isOpenImg: [],
  };

  componentDidMount() {
    this.initScroll();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {

  }

  componentWillUnmount() {
    const { dispatch, location, history } = this.props;

    if (location.pathname !== history.location.pathname) {
      // 离开页面清空当前页面缓存数据(返回oe页面，不清空)
      clearState(dispatch, 'oe_id');
    }
  }

  // 触发按钮初始化依附在页面底部
  initScroll = () => {
    timer = setTimeout(() => {
      window.scrollBy(0, 10);
      window.scrollTo(0, 0);
      clearTimeout(timer);
      timer = null;
    }, 100);
  };

  // 添加OE码
  handleOemskuCodeAdd = () => {
    const { dispatch, OE_CODES } = this.props;
    const { oeCode: oem_partsku_code, codeVerify } = this.state;
    const regexp = /[0-9A-Za-z\u4e00-\u9fa5]/g;
    if (isEmpty(oem_partsku_code) || codeVerify ) return;
    if(!regexp.test(oem_partsku_code)) {
      return this.setState({ codeVerify: <span className="red5">OE码最少包含一个字符</span> });
    }
    const isRepeat = OE_CODES.filter(v => v.oem_partsku_code === oem_partsku_code);
    if (isRepeat.length > 0) {
      return this.setState({ codeVerify: <span className="red5">OE编码不可重复添加</span> });
    }
    dispatch({
      type: 'oe_id/updateOeCodes',
      payload: [...OE_CODES, {
        oem_partsku_code
      }]
    });
    // 清空输入框
    this.setState({ oeCode: '' });
  };

  // 删除OE码
  handleOemskuCodeDelete = () => {
    const { dispatch, OE_CODES } = this.props;
    confirm({
      title: '确定删除此OE么？',
      content: '确认后不可恢复',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        dispatch({
          type: 'oe_id/updateOeCodes',
          payload: OE_CODES.filter(v => !v.checked)
        });
      }
    });
  };

  // 拆分OE码
  handleOemskuCodeSplit = () => {
    const { dispatch, location, OE_CODES } = this.props;
    const { query } = location;
    confirm({
      title: '确定拆分此OE么？',
      content: '确认后不可恢复',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        dispatch({
          type: 'oe_id/fetchOemskuCodeSplit',
          payload: {
            oem_partsku_id: query.oem_partsku_id,
            oem_partsku_codes: OE_CODES.filter(v => v.checked).map(v => v.oem_partsku_code)
          },
          callback: () => {
            // 更新OE_CODES
            dispatch({
              type: 'oe_id/updateOeCodes',
              payload: OE_CODES.filter(v => !v.checked)
            });
            // 保证重新拉取列表
            dispatch({
              type: 'oe/updateOemskuList'
            });
          }
        });
      }
    });
  }

  // 选择OE码
  handleCheckCode = (e, index) => {
    const { dispatch, PAGE_TYPE, OE_CODES } = this.props;
    if (PAGE_TYPE === 'edit') {
      dispatch({
        type: 'oe_id/updateOeCodes',
        payload: OE_CODES.map((v, idx) => idx === index ? { ...v, checked: e.target.checked } : v)
      });
    }
    // 添加时进行删除操作
    if (PAGE_TYPE === 'add') {
      e.preventDefault();
      dispatch({
        type: 'oe_id/updateOeCodes',
        payload: OE_CODES.filter((v, idx) => idx !== index)
      });
    }
  };

  // 输入OE码
  handleInputOecode = e => {
    // 如果存在验证错误信息，输入oe码时重置状态
    if (this.state.codeVerify) {
      this.setState({ codeVerify: '' });
    }
    this.setState({ oeCode: e.target.value });
  };

  // 树节点选择
  handleTreeSelect = (selectedKeys, e) => {
    const { CATEGORY_TREE, CATEGORY_INFO, dispatch } = this.props;
    const { selected } = e;
    const { pos, isLeaf } = e.node.props;
    // 获取品类信息
    if (isLeaf) {
      // 选择到产品更新右侧属性值
      const cate = getSelectCategory(pos)(CATEGORY_TREE);
      dispatch({
        type: 'oe_id/fetchCategoryInfo',
        payload: { category_id: cate.key }
      });
    } else {
      // 选择目录禁用确定按钮
      dispatch({
        type: 'oe_id/updateCategoryInfo',
        payload: {
          ...CATEGORY_INFO,
          isDis: true
        }
      });
    }
    // 更新展开、选中状态
    const keys = selectedKeys[0].split('-');
    this.setState({
      expandedKeys: selected ? selectedKeys : [keys.slice(0, keys.length - 1).join('-')],
      selectedKeys: selected ? selectedKeys : []
    });
  }

  // 选择零件树节点名Input
  handleSelectTreeNodeInput = () => {
    const { OE_INFO_FIELDS, dispatch } = this.props;
    const { category_id } = OE_INFO_FIELDS;
    // 存在默认产品，需要拉取品类属性，设定零件树初始状态
    if (category_id) {
      dispatch({
        type: 'oe_id/fetchCategoryInfo',
        payload: { category_id }
      });
    }
    // 更新模态框显示状态
    this.toggleTreeNodeModal(true);
  }

  // 零件树节点模态框 确定
  handleTreeNodeModalOk = () => {
    const { OE_INFO, OE_INFO_FIELDS, CATEGORY_INFO, dispatch } = this.props;
    const { setFieldsValue } = this.oeInfoForm;
    const { categoryParams, categoryProParams } = CATEGORY_INFO;
    const { category_id, category_name } = categoryParams;
    // 获取品类禁用数据
    // dispatch({
    //   type: 'oe_id/fetchCategoriesForbid',
    //   payload: { category_id }
    // });
    // 取得选中零件节点名
    dispatch({
      type: 'oe_id/updateOeInfoFields',
      payload: {
        ...OE_INFO_FIELDS,
        category_id,
        category_name
      }
    });
    // 更新零件树节点名表单显示
    setFieldsValue({ category_name });

    // category_pro_type为IMAGE的属性，根据category_pro_id分组单独展示
    const _categoryProsImages = categoryProParams.filter(v => v.category_pro_type === 'IMAGE');
    let category_pro_ids = uniqBy(_categoryProsImages.map(v => v.category_pro_id));
    const categoryProsImages = category_pro_ids.map(id => {
      const catePro = _categoryProsImages.find(v => v.category_pro_id === id);
      return { ...catePro, partsku_value_imgs: [] };
    });
    // 更新产品属性表单
    dispatch({
      type: 'oe_id/updateOemskuInfo',
      payload: {
        ...OE_INFO,
        data: {
          ...OE_INFO.data,
          ...categoryParams,
          categoryPros: categoryProParams.filter(v => v.category_pro_type !== 'IMAGE'),
          categoryProsImages
        }
      }
    });

    // 更新模态框显示状态
    this.toggleTreeNodeModal(false);

  };

  // 零件树节点模态框 取消
  handleTreeNodeModalCancel = () => {
    this.toggleTreeNodeModal(false);
  }

  // 切换零件树模态框显示状态
  toggleTreeNodeModal = visble => {
    this.setState({ treeNodeModalVisible: visble });
  }
  // 搜索树节点
  handleTreeInputChange = e => {
    const { CATEGORY_TREE } = this.props;
    const value = e.target.value;
    let expandedKeys = [];
    const filterTitle = (data, init = []) => {
      for (let i = 0; i < data.length; i++) {
        const it = data[i];
        if (value && it.title.indexOf(value) > -1) {
          expandedKeys.push(it.keys);
        }
        if (it.children) {
          filterTitle(it.children);
        }
      }
    };
    filterTitle(CATEGORY_TREE);
    this.setState({ expandedKeys });
  }

  /** 上传图片 */

  // 上传图片
  handleUploadPic = (file, callback) => {
    const { OE_INFO_FIELDS, dispatch } = this.props;
    const { category_id } = OE_INFO_FIELDS;
    // 上传图片
    dispatch({
      type: 'oe_id/fetchImageUpload',
      payload: { category_id, file },
      callback
    });
  };

  // 更新图片
  handleUpdatePic = imgs => {
    const { dispatch } = this.props;
    dispatch({
      type: 'oe_id/updatePartPicList',
      payload: imgs
    });
  };

  // 上传属性图片
  handleUploadPropPic = (part_prop, file, callback) => {
    const { OE_INFO_FIELDS, dispatch } = this.props;
    const { category_id } = OE_INFO_FIELDS;
    // 上传图片
    dispatch({
      type: 'oe_id/fetchPropImageUpload',
      payload: { ...part_prop, file, category_id },
      callback
    });
  };

  // 更新属性图片
  handleUpdatePropPic = (part_prop, imgs) => {
    const { OE_INFO, dispatch } = this.props;
    const { categoryProsImages } = OE_INFO.data;
    dispatch({
      type: 'oe_id/updateOemskuInfo',
      payload: {
        ...OE_INFO,
        data: {
          ...OE_INFO.data,
          categoryProsImages: categoryProsImages.map(v => {
            return v.category_pro_id === part_prop.category_pro_id ? { ...v, partsku_value_imgs: imgs } : v;
          })
        }
      }
    });
  };

  /** 上传图片 end */

  /** 富文本编辑器 */
  handleEditorChange = (editorState, editorStateHtml) => {
    const { dispatch, EDITOR_STATE } = this.props;
    // 实时更新 EDITOR_STATE的model值，保存时方便获取
    dispatch({ type: 'oe_id/updateEditorState', payload: { ...EDITOR_STATE, data: editorState, html: editorStateHtml } });
  };

  handleEditorUpload = (info, uploadParam) => {
    const { dispatch } = this.props;
    return dispatch({ type: 'oe_id/fetchEditorUpload', payload: info });
  };
  /** 富文本编辑器 end */


  // tab切换
  handleTabsChange = active => {
    const { location, dispatch, PAGE_TYPE, OE_INFO, OE_INFO_FIELDS } = this.props;
    const { category_id } = OE_INFO_FIELDS;
    const { data = {} } = OE_INFO;
    const { query } = location;
    const { oem_partsku_id } = query;
    if (active === 'carModel') {
      if (isEmpty(category_id)) {
        return msg('请先选择零件树节点名');
      }
      if (PAGE_TYPE === 'edit') {
        dispatch({
          type: 'oe_id/fetchOemskuCarmodelTabInfo',
          payload: { oem_partsku_id, cm_brand: data.carmodelBrand }
        });
      }
      // 获取品牌主机厂车型（审核通过）
      dispatch({
        type: 'oe_id/fetchBrandFacModListApproved',
        payload: (PAGE_TYPE === 'edit' && data.oem_partsku_status === 'APPROVED') ? { oem_partsku_id, cm_brand: data.carmodelBrand } : {}
      });
      // 获取车型属性列表(全部属性)
      dispatch({
        type: 'oe_id/fetchCarmodelProList',
        payload: { type: 'category' }
      });
    }

    if (active === 'oeMergeGroup') {
      if (data.oem_partsku_status === 'APPROVED' && PAGE_TYPE === 'edit') {
        let obj = { oem_partsku_id, type: 'carmodel' };
        if (this.mergeGroupForm) {
          const { getFieldsValue } = this.mergeGroupForm.props.form;
          obj = { ...obj, ...getFieldsValue() };
        }
        // 获取OE合并组
        this.handleFetchOemskuMergeSelect(obj);
      }
    }
    // 改变当前tab状态
    this.setState({
      tabsActiveKey: active
    });
  };

  // 表格头筛选
  handleSetFilter = (dataIndex, selectedKey, confirm) => {
    const columnSearchKeys = { ...this.state.columnSearchKeys };
    if (!selectedKey) {
      delete columnSearchKeys[dataIndex];
      // 点×清理过滤列
      this.setState({
        columnSearchKeys
      });
    } else {
      const { CARMODEL_LIST } = this.props;
      // 设定筛选列数据
      this.setState({
        columnSearchKeys: { ...this.state.columnSearchKeys, [dataIndex]: selectedKey }
      });
      // 筛选时清理checked状态, 避免选中项操作误差
      const payload = CARMODEL_LIST.map(brand => {
        return {
          ...brand,
          list: brand.list.map(cm => {
            return {
              ...cm, checked: false
            };
          })
        };
      });
      this.updateCarmodelList(payload);

      confirm();
    }
  };

  // 点击底部审核按钮(编辑) status: APPROVED 审核通过 | NONAPPROVED 审核不通过
  handleOemskuApprove = status => {
    const { location } = this.props;
    const { query } = location;
    const { oem_partsku_id } = query;
    let text = status == 'APPROVED' ? '通过' : '不通过';
    confirm({
      title: '确定' + text + '么？',
      content: '确认后不可恢复',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const { dispatch } = this.props;
        dispatch({
          type: 'oe_id/fetchOemskuApprove',
          payload: {
            oem_partsku_ids: [query.oem_partsku_id],
            oem_partsku_status: status
          }
        });
        const data={
          record_obj:{
            'oem_partsku_id':oem_partsku_id
          },
          record_page:'  OE管理/创建/编辑',
          record_operations:status==='APPROVED'?'审核通过':'审核不通过'
        };
        dispatch({
          type:'managerRecord/fetchUserRecorListInsert',
          data:data
        });
      }
    });
  };

  // 点击底部删除按钮(编辑)
  handleOemskuDelete = () => {
    const { dispatch, location } = this.props;
    const { query } = location;
    const {oem_partsku_id} = query;
    confirm({
      title: '确定删除此OE么？',
      content: '确认后不可恢复',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        dispatch({
          type: 'oe_id/fetchOemskuDelete',
          payload: { oem_partsku_id: query.oem_partsku_id },
          fail: res => {
            Modal.warning({
              title: res.msg,
              content: isArray(res.error) ? res.error.join('，') : res.error,
            });
          }
        });
        const data={
          record_obj:{
            'oem_partsku_id':oem_partsku_id
          },
          record_page:'  OE管理/创建/编辑',
          record_operations:'删除OE'
        };
        dispatch({
          type:'managerRecord/fetchUserRecorListInsert',
          data:data
        });
      }
    });
  };

  // 显示添加适配车型模态框
  showCarmodelModal = (type, row, callback) => {
    const { PAGE_TYPE } = this.props;
    // 设定适配车型模态框操作状态， add || edit
    this.setState({ carmodelModelType: type });

    if (type === 'add') {
      // 添加模态框初始化清空筛选车型数据
      this.updateCarmodelKeyvalueList();
    }
    if (type === 'edit') {
      // 编辑模态框带入当前行数据
      this.updateCarmodelKeyvalueList([row]);
      // 缓存当前编辑车型行
      this.setState({ currentEditCarmodel: row });
      callback && callback();
    }

    // 显示模态框
    this.setState({ addCarmodelModalVisible: true });
  };

  // 隐藏添加适配车型模态框
  hideCarmodelModal = clearColumnSearchKeys => {
    this.setState({ addCarmodelModalVisible: false });
    clearColumnSearchKeys && clearColumnSearchKeys();
  };

  // 筛选车型【添加适配车型用】
  handleCarmodelKeyvalueList = (car_fac_model, expand_columns, callback) => {
    const { location, PAGE_TYPE, OE_INFO_FIELDS, dispatch } = this.props;
    const { query } = location;
    const { category_id } = OE_INFO_FIELDS;
    const cm_pro_columns = expand_columns.map(v => v.cm_pro_column).join(',');
    const [cm_brand, cm_factory, cm_model] = car_fac_model;
    const { oem_partsku_id } = query;
    let payload = { category_id, cm_brand, cm_factory, cm_model, cm_pro_columns };
    if (PAGE_TYPE === 'edit') {
      payload.oem_partsku_id = oem_partsku_id;
    }
    if (cm_model) {
      dispatch({
        type: 'oe_id/fetchCarmodelKeyvalueList',
        payload,
        callback,
        PAGE_TYPE
      });
    }
  };

  // oe适配车型编辑查询, 筛选车型【编辑适配车型用】
  handleOemskuCarmodelEdit = (expand_columns, callback) => {
    const { location, OE_INFO_FIELDS, dispatch } = this.props;
    const { query } = location;
    const { category_id } = OE_INFO_FIELDS;
    const { cm_ids = [] } = this.state.currentEditCarmodel;
    const cm_pro_columns = expand_columns.map(v => v.cm_pro_column).join(',');
    dispatch({
      type: 'oe_id/fetchOemskuCarmodelEditList',
      payload: {
        oem_partsku_id: query.oem_partsku_id,
        category_id, cm_ids: cm_ids.join(','), cm_pro_columns
      },
      callback
    });
  };

  // 更新筛选车型列表数据
  updateCarmodelKeyvalueList = payload => {
    const { dispatch } = this.props;
    dispatch({
      type: 'oe_id/updateCarmodelKeyvalueList',
      payload
    });
  };

  // 更新适配车型列表
  updateCarmodelList = payload => {
    const { dispatch } = this.props;
    dispatch({
      type: 'oe_id/updateCarmodelList',
      payload
    });
  };

  // 获取去重数据
  getDiffList = (selectedRowKeys) => {
    const { PAGE_TYPE, CARMODEL_KEYVALUE_LIST, CARMODEL_INFO, CATEGORY_INFO } = this.props;
    // 品类默认属性
    const { carPro = [] } = CARMODEL_INFO.data;
    const { carmodelProParams = [] } = CATEGORY_INFO;
    const cmProps = PAGE_TYPE === 'add' ? carmodelProParams : carPro;

    // 取得选中行
    const list = CARMODEL_KEYVALUE_LIST.filter((cm, cmIdx) => selectedRowKeys.includes(cm.timeStamp))
      .map(cm => {
        const cm_extends = cm.cm_extends.map(v => {
          return {
            ...v,
            oem_carmodel_extend_val: cm[v.cm_pro_column]
          };
        });

        const vals = { oem_carmodel_comment_desc: cm.oem_carmodel_comment_desc };
        const keys = cmProps.map(v => v.cm_pro_column);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          vals[key] = cm[key];
        }
        // 展开扩展值，方便去重对比
        cm_extends.forEach(p => {
          vals[p.cm_pro_column] = p.oem_carmodel_extend_val;
        });
        // 取得对比数组，只取 扩展列，关键属性，备注进行对比
        return { ...cm, cm_extends, str: qs.stringify(vals) };
      });
    // 去重，并且合并cm_ids
    let hash = {};
    let diffList = [];
    list.forEach(v => {
      if (!hash[v.str]) {
        // 勾选了两条车型，但扩展列和备注都没有值，这个时候添加到适配车型列表时，应该为一条车型(点击添加保存时处理)
        hash[v.str] = [];
      }
      hash[v.str].push(v);
    });
    for (const key in hash) {
      diffList.push({
        ...hash[key][0],
        cm_ids: hash[key].reduce((init, v) => init.concat(v.cm_ids), [])
      });
    }
    return diffList;
  }

  // 确定添加适配车型
  handleCarmodelAdd = (selectedRowKeys, clearColumnSearchKeys) => {
    const { location, dispatch, PAGE_TYPE, CARMODEL_LIST, OE_INFO, CARMODEL_KEYVALUE_LIST, CARMODEL_INFO, CATEGORY_INFO } = this.props;
    const { query } = location;
    const { oem_partsku_id } = query;
    const { data = {} } = OE_INFO;

    // 取得选中行(勾选了两条车型，但扩展列和备注都没有值，这个时候添加到适配车型列表时，应该为一条车型(点击添加保存时处理))
    const diffList = this.getDiffList(selectedRowKeys);

    // 取得对比数组，只取 扩展列，关键属性，备注进行对比
    if (PAGE_TYPE === 'add') {
      // 保持和编辑时相同结构
      const payload = [{ cm_brand: diffList[0].cm_brand, list: diffList }, ...CARMODEL_LIST];
      // 更新适配车型列表
      this.updateCarmodelList(payload);
      //  隐藏模态框
      this.hideCarmodelModal(clearColumnSearchKeys);
    }

    if (PAGE_TYPE === 'edit') {
      const payload = {
        oem_partsku_id,
        cm_models: diffList.filter(v => v.selected === 0).map(v => {
          return {
            cm_ids: v.cm_ids,
            oem_carmodel_comment_desc: v.oem_carmodel_comment_desc,
            cm_extends: v.cm_extends.filter(c => c.checked).map(c => {
              const { cm_pro_id, cm_pro_name, cm_pro_column, oem_carmodel_extend_val } = c;
              return { cm_pro_id, cm_pro_name, cm_pro_column, oem_carmodel_extend_val };
            })
          };
        })
      };
      // 保存适配车型数据(编辑OE时添加适配车型)
      dispatch({
        type: 'oe_id/fetchOemskuCarmodelAdd',
        payload,
        callback: () => {
          // 重新获取oe车型tab信息详情
          dispatch({
            type: 'oe_id/fetchOemskuCarmodelTabInfo',
            payload: { oem_partsku_id, cm_brand: data.carmodelBrand },
            isForce: true // 标注强制重新拉取
          });
          //  隐藏模态框
          this.hideCarmodelModal(clearColumnSearchKeys);
        }
      });

    }

  };

  // 确定编辑适配车型
  handleCarmodelEdit = (selectedRowKeys, clearColumnSearchKeys) => {
    const { location, dispatch, PAGE_TYPE, OE_INFO, CARMODEL_LIST } = this.props;
    const { currentEditCarmodel } = this.state;
    const { query } = location;
    const { data = {} } = OE_INFO;
    const { oem_partsku_id } = query;

    // 移除当前车型行
    const removeCarmodel = () => {
      // 获取更新数据
      const carmodel_list = CARMODEL_LIST.map(brand => {
        return {
          ...brand,
          list: brand.list.filter(v => v.timeStamp !== currentEditCarmodel.timeStamp)
        };
      });
      // 更新适配车型列表
      dispatch({
        type: 'oe_id/updateCarmodelList',
        payload: carmodel_list
      });
      // 隐藏模态框
      this.hideCarmodelModal(clearColumnSearchKeys);
    };

    // 取得选中行(勾选了两条车型，但扩展列和备注都没有值，这个时候添加到适配车型列表时，应该为一条车型(点击添加保存时处理))
    const diffList = this.getDiffList(selectedRowKeys);

    if (PAGE_TYPE === 'add') {
      if (selectedRowKeys.length === 0) {
        // 未勾选任何车型
        return confirm({
          title: '提醒：',
          content: '未勾选任何车型，确认后将从车型适配列表中删除此车型。',
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            // 移除当前车型行
            removeCarmodel();
          }
        });
      }

      // 移除列表上的当前编辑数据
      const carmodel_list = CARMODEL_LIST.map(brand => {
        return {
          ...brand,
          list: brand.list.filter(v => v.timeStamp !== currentEditCarmodel.timeStamp)
        };
      });

      const payload = [{ cm_brand: diffList[0].cm_brand, list: diffList }, ...carmodel_list];
      // 更新适配车型列表
      this.updateCarmodelList(payload);
      // 隐藏模态框
      this.hideCarmodelModal(clearColumnSearchKeys);
    }

    if (PAGE_TYPE === 'edit') {
      if (selectedRowKeys.length === 0) {
        // 未勾选任何车型
        confirm({
          title: '提醒：',
          content: '未勾选任何车型，确认后将从车型适配列表中删除此车型。',
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            // 删除此车型
            dispatch({
              type: 'oe_id/fetchOemskuCarmodelDelete',
              payload: {
                oem_partsku_id,
                cm_ids: currentEditCarmodel.cm_ids
              },
              callback: () => {
                // 移除当前车型行
                removeCarmodel();
              }
            });
          }
        });
      } else {
        // 存在勾选车型
        const cm_models = diffList.map(cm => {
          return {
            cm_ids: cm.cm_ids,
            oem_carmodel_comment_desc: cm.oem_carmodel_comment_desc,
            cm_extends: cm.cm_extends.map(v => {
              // 备注值和实际值已不同，选中时用新值进行备注，取消后备注值仍为旧值。
              const newVal = cm[v.cm_pro_column];
              const oldVal = v.oem_carmodel_extend_val;
              let val;
              if (v.checked) {
                val = newVal;
              }
              // oldVal 为undefined时，不保存，此状态既不属于初始化数据，也没有选中
              if (!v.checked && oldVal) {
                val = oldVal;
              }
              return {
                cm_pro_id: v.cm_pro_id,
                cm_pro_name: v.cm_pro_name,
                cm_pro_column: v.cm_pro_column,
                oem_carmodel_extend_val: val
              };
            }).filter(v => v.oem_carmodel_extend_val)
          };
        });
        // oe适配车型更新
        dispatch({
          type: 'oe_id/fetchOemskuCarmodelEdit',
          payload: {
            oem_partsku_id,
            cm_ids: this.state.currentEditCarmodel.cm_ids,
            cm_models
          },
          callback: () => {
            // 重新获取oe车型tab信息详情
            dispatch({
              type: 'oe_id/fetchOemskuCarmodelTabInfo',
              payload: { oem_partsku_id, cm_brand: data.carmodelBrand },
              isForce: true // 标注强制重新拉取
            });
            // 清空OE列表，保证重新拉取
            dispatch({
              type: 'oe/updateOemskuList'
            });
            // 隐藏模态框
            this.hideCarmodelModal(clearColumnSearchKeys);
          }
        });

      }
    }

  }

  // 删除适配车型
  handleOemskuCarmodelDelete = (cm_ids) => {
    const { location, dispatch, CARMODEL_LIST, PAGE_TYPE } = this.props;
    const { query } = location;
    const { oem_partsku_id } = query;
    const list = CARMODEL_LIST.map(brand => {
      return {
        ...brand,
        list: brand.list.filter(v => !v.checked)
      };
    }).filter(v => v.list.length > 0);
    if (PAGE_TYPE === 'add') {
      dispatch({
        type: 'oe_id/updateCarmodelList',
        payload: list
      });
    }
    if (PAGE_TYPE === 'edit') {
      confirm({
        title: '确定执行此操作？',
        content: '确认后不可恢复',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          const payload = {
            oem_partsku_id,
            cm_ids
          };
          dispatch({
            type: 'oe_id/fetchOemskuCarmodelDelete',
            payload,
            callback: () => {
              // 更新当前车型列表
              dispatch({
                type: 'oe_id/updateCarmodelList',
                payload: list
              });
              // 保证重新拉取列表
              dispatch({
                type: 'oe/updateOemskuList'
              });
            }
          });
        }
      });

    }
  }

  // 隐藏拆分模态框
  hideSplitModal = () => {
    this.setState({
      splitModalVisible: false,
      split_cm_ids: [],
      split_type: ''
    });
  }

  // 显示拆分模态框
  showSplitModal = cm_ids => {
    this.setState({
      splitModalVisible: true,
      split_cm_ids: cm_ids
    });
  }

  // 选择拆分模式
  handleChangeSplitType = e => {
    this.setState({ split_type: e.target.value });
  }

  // 拆分适配车型
  handleOemskuCarmodelSplit = () => {
    const { location, CARMODEL_LIST, dispatch } = this.props;
    const { query } = location;
    const { oem_partsku_id } = query;
    const payload = {
      oem_partsku_id,
      cm_ids: this.state.split_cm_ids,
      type: this.state.split_type
    };
    const list = CARMODEL_LIST.map(brand => {
      return {
        ...brand,
        list: brand.list.filter(v => !v.checked)
      };
    }).filter(v => v.list.length > 0);
    dispatch({
      type: 'oe_id/fetchOemskuCarmodelSplit',
      payload,
      callback: () => {
        // 更新当前车型列表
        dispatch({
          type: 'oe_id/updateCarmodelList',
          payload: list
        });
        // 保证重新拉取列表
        dispatch({
          type: 'oe/updateOemskuList'
        });
        // 隐藏拆分模态框
        this.hideSplitModal();
      }
    });

  }

  // 获取OE合并组
  handleFetchOemskuMergeSelect = (payload, isForce) => {
    const { location, dispatch } = this.props;
    const { query } = location;
    const { oem_partsku_id } = query;
    dispatch({
      type: 'oe_id/fetchOemskuMergeSelect',
      payload: { ...payload, oem_partsku_id },
      isForce
    });
  };

  // 合并组 - 确定保存操作
  handleMerge = (fields, oem_partsku_ids, clearSelectedRows) => {
    const { dispatch, location, OE_CODES } = this.props;
    const { query } = location;
    const { oem_partsku_id } = query;
    confirm({
      title: '确定执行合并操作吗？',
      content: '确认后不可恢复',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        dispatch({
          type: 'oe_id/fetchOemskuMerge',
          payload: {
            oem_partsku_id_targets: oem_partsku_ids, // 需要操作的对象id数组
            oem_partsku_id // 当前oemid
          },
          callback: ({ failList }) => {
            const resetFn = () => {
              // 清空selected状态
              clearSelectedRows();
              // 清空列表，保证返回重新拉取数据
              dispatch({ type: 'oe/updateOemskuList' });
              // 重新获取oe信息详情
              dispatch({ type: 'oe_id/fetchOemskuEditTabInfo', payload: { oem_partsku_id }, isForce: true });
              // 重新获取OE合并组
              this.handleFetchOemskuMergeSelect(fields, true);
            };
            const routeToStd = record => {
              _modal.destroy();
              router.push('/standardcode/list/' + record.std_partsku_id + '?std_partsku_id=' + record.std_partsku_id);
            };
            if (failList.length > 0) {
              const tableProps = {
                className: 'm-t-15',
                bordered: true,
                pagination: false,
                rowKey: (item, index) => index,
                columns: [{
                  title: '标准码',
                  dataIndex: 'std_partsku_code',
                  render: (text, record, index) => {
                    return (
                      <span className="cur link"onClick={() => routeToStd(record)}>{text}</span>
                    );
                  }
                },
                {
                  title: '被合并OE号',
                  dataIndex: 'oem_partsku_codes',
                  render: (text = [], record, index) => {
                    return (
                      text.length > 0 ? text.join('，') : '虚拟OE'
                    );
                  }
                }
                ],
                dataSource: failList,
                footer: () => {
                  return (
                    <>
                      <div><strong>合并限制条件说明：</strong></div>
                      <div>被合并OE所对应的标准码下存在其它OE号，不允许直接合并；</div>
                      <div>可点击标准码，将被合并的OE号从所属标准码拆分出来后才可以合并。</div>
                    </>
                  );
                }
              };

              _modal = Modal.info({
                className: 'oe_id_confirm',
                title: '以下OE不满足合并条件',
                okText: '确认',
                onOk: () => {
                  resetFn();
                },
                content: <Table {...tableProps} />,
                closable: true
              });
            } else {
              resetFn();
            }



          }
        });

      }
    });
  }

  // 不合并 - 确定保存操作
  handleUnMerge = (fields, currentUnmergeRow, oe_unmerge_des, cb) => {
    const { dispatch, location } = this.props;
    const { query } = location;
    const { oem_partsku_id } = query;
    if (!isEmpty(currentUnmergeRow)) {
      confirm({
        title: '确定执行不合并操作吗？',
        content: '确认后不可恢复',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          dispatch({
            type: 'oe_id/fetchOemskuExclude',
            payload: {
              oem_partsku_id_target: currentUnmergeRow.oem_partsku_id,
              oem_exclude_id: currentUnmergeRow.oem_exclude_id,
              oem_partsku_id,
              oem_exclude_reason: oe_unmerge_des
            },
            callback: () => {
              // 重新获取OE合并组
              this.handleFetchOemskuMergeSelect(fields, true);
              // 重新获取oe信息详情
              dispatch({ type: 'oe_id/fetchOemskuEditTabInfo', payload: { oem_partsku_id } });
              // 隐藏模态框
              cb();
            }
          });
        }
      });
    }
  }

  // 特殊说明模态框隐藏
  hideDescModal = () => {
    this.setState({
      currentRowIdx: null,
      descModalVisible: false
    });
  }

  // 特殊说明模态框显示
  showDescModal = (desc = '', index, isSelected) => {
    if (!isSelected) return;
    // 设定当前行状态, 开启模态框
    this.setState({
      currentRowIdx: index,
      descModalVisible: true,
      oem_carmodel_comment_desc: desc
    });
  }

  // 确定编辑特殊说明
  handlEditDesc = getFieldValue => {
    const { CARMODEL_KEYVALUE_LIST } = this.props;
    const { currentRowIdx } = this.state;
    // 更新当前行的特殊说明文字
    const value = getFieldValue('oem_carmodel_comment_desc');
    if (!isEmpty(currentRowIdx)) {
      const list = CARMODEL_KEYVALUE_LIST.map((cm, cmIdx) => {
        return currentRowIdx === cm.timeStamp ? { ...cm, oem_carmodel_comment_desc: value } : cm;
      });
      this.updateCarmodelKeyvalueList(list);
    }

    // 隐藏模态框
    this.hideDescModal();
  }

  // 显示保存并审核模态框
  showSaveApproveModal = () => {
    const { dispatch, location, PAGE_TYPE, OE_CODES, OE_INFO_FIELDS, OE_INFO } = this.props;
    const { query } = location;
    const { oem_partsku_id } = query;
    const { oem_partsku_status } = OE_INFO.data;

    // 创建oem时
    if (PAGE_TYPE === 'add' || oem_partsku_status !== 'PENDING') {
      this.handleSubmit('save_approve');

    }

    // 编辑oem时  PENDING才走下面的逻辑
    if (PAGE_TYPE === 'edit' && oem_partsku_status === 'PENDING') {
      if (OE_CODES.length === 0) {
        // 无需校验code，oem保存并审核通过check, 并且显示保存并审核模态框
        this.handleOemskuApproveCheck();
        return false;
      }
      // 调用code的校验
      dispatch({
        type: 'oe_id/fetchOemskuCodeCheck',
        payload: {
          oem_partsku_codes: OE_CODES.map(v => v.oem_partsku_code),
          category_id: OE_INFO_FIELDS.category_id,
          oem_partsku_id
        },
        callback: checkRes => {
          if (checkRes.code === 0) {
            // 校验成功，oem保存并审核通过check, 并且显示保存并审核模态框
            this.handleOemskuApproveCheck();
          } else if (checkRes.code == 21018) {
            // 允许创建，但是需要提示
            const tableProps = {
              className: 'm-t-15',
              bordered: true,
              pagination: false,
              rowKey: (item, index) => index,
              columns: [
                { title: '品牌', dataIndex: 'cm_brand_name', width: 100 },
                { title: 'OE码', dataIndex: 'oem_partsku_codes' },
                { title: '说明', dataIndex: 'err' }
              ],
              dataSource: checkRes.error.map(v => ({
                ...v,
                err: `既有OE产品已经包含OE号：${v.oem_partsku_codes.join()}`,
                oem_partsku_codes: v.oem_partsku_codes.map((code, idx) => <div key={idx}>{code}</div>)
              }))
            };
            confirm({
              className: 'oe_id_confirm',
              title: '提示：点击继续完成操作，取消则放弃',
              okText: '确认',
              cancelText: '取消',
              closable: true,
              content: <Table {...tableProps} />,
              onOk: () => {
                // 提示完成，oem保存并审核通过check, 并且显示保存并审核模态框
                this.handleOemskuApproveCheck();
              },
              onCancel: () => { }
            });
          } else {
            // res.code === 21006 不允许创建 系统存在此OE码，可通过“OE合并组”操作符将OE合并为一组
            msg(checkRes);
          }
        }

      });

    }

  }

  // 隐藏保存并审核模态框
  hideSaveApproveModal = () => {
    this.setState({ saveApproveModalVisible: false });
  }


  // 保存并审核模态框时保存OE
  handleSaveOE = () => {
    this.handleSubmit('save');
    this.hideSaveApproveModal();
  }

  // oem保存并审核通过check
  handleOemskuApproveCheck = () => {
    /**
       * 1、点击保存并审核，调用当前oe_codes的校验
       * 2、codes校验成功后调用审核通过check，如果验证出现错误提示，显示模态框的表格信息
       * 3、如果符合条件，先调用oemsku/update保存当前OE编辑操作
       * 4、再调用批量审核OE操作
       */
    const { location, dispatch } = this.props;
    const { query } = location;
    const { oem_partsku_id } = query;
    this.setState({ saveApproveModalVisible: true });
    dispatch({
      type: 'oe_id/fetchOemskuApproveCheck',
      payload: { oem_partsku_id },
      callback: data => {
        this.setState({ saveApproveModalDataSource: data });
      }
    });
  }

  // 保存并审核模态框时全部审核通过OE
  handleApproveAllOE = () => {
    const { location, dispatch } = this.props;
    const { query } = location;
    const { oem_partsku_id } = query;
    // 保存当前OE
    this.handleSubmit('save', () => {
      // 同一个标准码下的oe全部审核通过
      dispatch({
        type: 'oe_id/fetchOemskuApproveAll',
        payload: { oem_partsku_id },
        callback: () => {
          this.hideSaveApproveModal();
          router.goBack();
        }
      });
    });

  };

  // 保存
  handleSubmit = (type, callback) => {
    const { location, PAGE_TYPE, OE_CODES, OE_INFO_FIELDS, EDITOR_STATE, CARMODEL_LIST, OE_INFO, PART_PIC_LIST, OEMSKU_PRICE, dispatch } = this.props;
    const { validateFields } = this.oeInfoForm;
    const { query } = location;
    const { oem_partsku_id } = query;
    validateFields(async (err, values) => {
      if (!err) {
        const { categoryPros = [], categoryProsImages = [], category_type } = OE_INFO.data;
        const { data: prices } = OEMSKU_PRICE;
        let oem_partsku_prices = [];
        for (let i = 0; i < prices.length; i++) {
          const p = prices[i];
          for (const k in values) {
            const price = values[k];
            if (p.oem_partsku_price_area_code === k && !isEmpty(price)) {
              oem_partsku_prices.push({
                oem_partsku_price_level: '1',
                oem_partsku_price: price,
                oem_partsku_price_area_code: k
              });
              break;
            }
          }
        }

        const cm_models = CARMODEL_LIST.reduce((init, brand) => init.concat(brand.list), []).map(v => {
          return {
            cm_ids: v.cm_ids,
            oem_carmodel_comment_desc: v.oem_carmodel_comment_desc,
            cm_extends: v.cm_extends.filter(v => v.checked)
          };
        });

        let payload = {
          category_id: OE_INFO_FIELDS.category_id,
          oem_partsku_codes: OE_CODES.map(v => v.oem_partsku_code),
          oem_partsku_values: categoryPros.map(v => {
            const _val = values[v.category_pro_id];
            return {
              category_pro_id: v.category_pro_id,
              oem_partsku_value: isString(_val) ? _val.trim() : _val
            };
          }).filter(v => !isEmpty(v.oem_partsku_value)),
          oem_partsku_images: PART_PIC_LIST.map(v => v.oem_partsku_image_id),
          oem_partsku_prices,
          approve: type === 'save_approve' ? true : false
        };

        // 产品属性图片
        let partsku_val_imgs = [];
        for (let i = 0; i < categoryProsImages.length; i++) {
          const catePro = categoryProsImages[i];
          for (let j = 0; j < catePro.partsku_value_imgs.length; j++) {
            const partsku_value = catePro.partsku_value_imgs[j];
            if (partsku_value.url) {
              const { oem_partsku_image_id } = partsku_value;
              partsku_val_imgs.push({
                category_pro_id: catePro.category_pro_id, oem_partsku_image_id, oem_partsku_image_index: j
              });
            }
          }
        }

        if (partsku_val_imgs.length > 0) {
          payload.partsku_val_imgs = partsku_val_imgs;
        }

        // 产品说明
        const regexp = new RegExp(ENV.imgDomain, 'g');
        const oem_partsku_desc = EDITOR_STATE.html.replace(regexp, '');
        if (!isEmpty(oem_partsku_desc)) {
          payload.oem_partsku_desc = oem_partsku_desc;
          payload.partsku_desc_imgs = [];
          if (EDITOR_STATE.data.entityMap) {
            // 保存过的img数据
            for (const key in EDITOR_STATE.data.entityMap) {
              const url = EDITOR_STATE.data.entityMap[key].data.url;
              const match = url.match(/http.*\?(.*)/);
              if (match && match[1]) {
                const parse = qs.parse(match[1]);
                if (parse.oem_partsku_image_id) {
                  payload.partsku_desc_imgs.push(parse.oem_partsku_image_id);
                }
              }
            }
          }
          if (payload.partsku_desc_imgs.length === 0) {
            // 没保存过的默认img数据
            payload.partsku_desc_imgs = EDITOR_STATE.imgs.map(v => v.oem_partsku_image_id);
          }
        }


        if (PAGE_TYPE === 'edit') {
          payload.oem_partsku_id = oem_partsku_id;
        }

        if (PAGE_TYPE === 'add') {
          payload.cm_models = cm_models;
        }
        // 生成长图
        if (category_type === 'GUIDE' && !isEmpty(EDITOR_STATE.html)) {
          // 生成长图
          let tenPartskuDescImg = document.createElement('div');
          tenPartskuDescImg.id = 'tenPartskuDescImg';
          tenPartskuDescImg.innerHTML = getOriginalImgDesc(EDITOR_STATE.html, '/oem/partsku/');
          tenPartskuDescImg.className = 'desc_img';
          document.body.appendChild(tenPartskuDescImg);
          const el = document.getElementById('tenPartskuDescImg');
          if(el.clientHeight > 9000) {
            // 移除临时节点
            document.body.removeChild(el);
            return message.error('生成长图高度不能超过9000px');
          }
          try {
            // 预先加载图片，再生成长图
            await loadingAllDescImgs(el.querySelectorAll('img'));
            await domtoimage.toJpeg(el, { quality: 0.8 })
              .then(async dataUrl => {
                // 移除临时节点
                document.body.removeChild(el);
                const file = dataURLtoFile(dataUrl, 'desc');
                const isLtSize = (file.size / 1024 / 1024) > 5;
                if(isLtSize) {
                  return message.error('生成长图大小不能超过5MB');
                }
                // 上传长图
                const res = await dispatch({
                  type: 'oe_id/fetchPartskuDescUpload',
                  payload: { file }
                });
                if (res.code === 0) {
                  // 配件说明长图
                  payload.oem_partsku_desc_img = res.data.oem_partsku_image_url;
                }
              });
          }
          catch (err) {
            // 移除临时节点
            document.body.removeChild(el);
          }

        }

        // 保存: save |  保存并审核: save_approve
        if (type === 'save' || type === 'save_approve') {
          payload.std_pic_pro = values.std_pic_pro ? 'YES' : 'NO';
          // 无添加oe编码，则无需校验，直接创建
          if (payload.oem_partsku_codes.length === 0 || callback) {
            // 调用创建/编辑OE接口
            return this.fetchOemskuCreate(payload, callback);
          }

          // 提交保存参数-Check
          dispatch({
            type: 'oe_id/fetchOemskuCodeCheck',
            payload,
            callback: checkRes => {
              if (checkRes.code === 0) {
                // 校验成功，调用创建/编辑OE接口
                this.fetchOemskuCreate(payload);
              } else if (checkRes.code == 21018) {
                // 允许创建，但是需要提示
                const tableProps = {
                  className: 'm-t-15',
                  bordered: true,
                  pagination: false,
                  rowKey: (item, index) => index,
                  columns: [
                    { title: '品牌', dataIndex: 'cm_brand_name', width: 100 },
                    { title: 'OE码', dataIndex: 'oem_partsku_codes' },
                    { title: '说明', dataIndex: 'err' }
                  ],
                  dataSource: checkRes.error.map(v => ({
                    ...v,
                    err: `既有OE产品已经包含OE号：${v.oem_partsku_codes.join()}`,
                    oem_partsku_codes: v.oem_partsku_codes.map((code, idx) => <div key={idx}>{code}</div>)
                  }))
                };
                confirm({
                  className: 'oe_id_confirm',
                  title: '提示：点击继续完成操作，取消则放弃',
                  okText: '确认',
                  cancelText: '取消',
                  closable: true,
                  content: <Table {...tableProps} />,
                  onOk: () => {
                    // 调用创建OE接口
                    this.fetchOemskuCreate(payload);
                  },
                  onCancel: () => { }
                });
              } else {
                // res.code === 21006 不允许创建 系统存在此OE码，可通过“OE合并组”操作符将OE合并为一组
                msg(checkRes);
              }
            }
          });


        }

      }

    });
    const data={
      record_obj:{
        'operation':type==='save'?'保存OE':'保存并审核OE'
      },
      record_page:'  OE管理/创建/编辑',
      record_operations:type==='save'?'保存OE':'保存并审核OE'
    };
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  };

  // 创建OE
  fetchOemskuCreate = (payload, callback) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'oe_id/fetchOemskuCreate',
      payload,
      callback: () => {
        // 保证重新拉取列表，并且返回第一页
        dispatch({
          type: 'oe/updateOemskuList'
        });
        if (callback) {
          // 操作同一个标准码下的oe全部审核通过
          callback();
        } else {
          router.goBack();
        }
      }
    });
  }

  // 跳转到OE详情
  routeToOe = async oem_partsku_id => {
    const { dispatch } = this.props;
    this.hideSaveApproveModal();
    await dispatch({
      type: 'oe_id/fetchOemskuEditTabInfo',
      payload: { oem_partsku_id },
      isForce: true
    });
    // 这里在当前页面跳转，数据不刷新，所以需要手动调用接口
    router.replace('/oe/list/' + oem_partsku_id + '?oem_partsku_id=' + oem_partsku_id);
    this.handleTabsChange('carModel');
  }

  // 隐藏用户反馈模态框
  hideFeedbackModal = () => {
    const { dispatch } = this.props;
    this.setState({ feedbackModalVisible: false });
    // 清空获取车型不适配反馈数据
    dispatch({ type: 'updateOemskuCarmodelFilterInfo' });
  }

  // 显示用户反馈模态框
  showFeedbackModal = row => {
    const { dispatch, location } = this.props;
    const { query } = location;
    const { oem_partsku_id } = query;
    this.setState({ feedbackModalVisible: true });
    dispatch({
      type: 'oe_id/fetchOemskuCarmodelFilterInfo',
      payload: { oem_partsku_id, ...row }
    });
  }

  // 用户反馈->设置已处理
  fetchOemskuCarmodelFilterHandled = () => {
    const { dispatch, location, OE_INFO, OEMSKU_CARMODEL_FILTER_INFO } = this.props;
    const { data = {} } = OE_INFO;
    const { query } = location;
    const { oem_partsku_id } = query;
    dispatch({
      type: 'oe_id/fetchOemskuCarmodelFilterHandled',
      payload: {
        oem_partsku_id,
        cm_ids: OEMSKU_CARMODEL_FILTER_INFO.carmodel.cm_ids
      },
      callback: () => {
        // 重新获取oe车型tab信息详情
        dispatch({
          type: 'oe_id/fetchOemskuCarmodelTabInfo',
          payload: { oem_partsku_id, cm_brand: data.carmodelBrand },
          isForce: true // 标注强制重新拉取
        });
        // 清空OE列表，保证重新拉取
        dispatch({
          type: 'oe/updateOemskuList'
        });
        // 隐藏模态框
        this.hideFeedbackModal();
      }
    });
  };

  /** 图片预览 */
  // 预览图片
  handlePreviewImage = async imgs => {
    let previewImgs = [];
    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i];
      let config = await getPicSize(img);
      previewImgs[i] = config;
    }
    // 开启pc预览图
    this.setState({
      isOpenImg: previewImgs,
      isOpen: true
    });
  };

  // 关闭预览图
  handleCloseImg = () => {
    this.setState({
      isOpen: false
    });
  };
  /** 图片预览end */

  render() {
    const { loading, PAGE_TYPE, OE_INFO, OE_INFO_FIELDS, CATEGORY_TREE, CATEGORY_INFO, PART_PIC_LIST, EDITOR_STATE, OEMSKU_CARMODEL_FILTER_INFO, CATEGORIES_FORBID } = this.props;
    // const category_forbid_content = CATEGORIES_FORBID.filter(v => v.category_type_forbid_type === 'CONTENT');
    // const category_type_forbids = category_forbid_content.map(v => v.category_type_forbid_obj);
    const { treeNodeModalVisible, expandedKeys, selectedKeys, codeVerify, oeCode, addCarmodelModalVisible, tabsActiveKey, carmodelModelType, currentEditCarmodel, descModalVisible, saveApproveModalVisible, oem_carmodel_comment_desc, saveApproveModalDataSource, splitModalVisible, split_type, feedbackModalVisible } = this.state;
    const { data: oe_info = {} } = OE_INFO;
    const { std_partsku_code } = oe_info;
    const oeMergeGroupProps = {
      ...this.props,
      onFetchOemskuMergeSelect: this.handleFetchOemskuMergeSelect,
      onUnMerge: this.handleUnMerge,
      onMerge: this.handleMerge,
      onPreviewImage: this.handlePreviewImage
    };
    const idCarModelProps = {
      ...this.props,
      columnSearchKeys: this.state.columnSearchKeys,
      onSetFilter: this.handleSetFilter,
      onShowCarmodelModal: this.showCarmodelModal,
      onOemskuCarmodelDelete: this.handleOemskuCarmodelDelete,
      onOemskuCarmodelSplit: this.showSplitModal,
      onUpdateCarmodelList: this.updateCarmodelList,
      onShowFeedbackModal: this.showFeedbackModal,
    };
    // 产品图片
    const partsku_imgs = PART_PIC_LIST.filter(v => v.url);
    const oeInfoProps = {
      ...this.props,
      codeVerify,
      oeCode,
      // category_type_forbids,
      partsku_imgs,
      EDITOR_STATE,
      original_img_desc: getOriginalImgDesc(EDITOR_STATE.html, '/oem/partsku/'),
      onEditorChange: this.handleEditorChange,
      onEditorUpload: this.handleEditorUpload,
      onOemskuCodeAdd: this.handleOemskuCodeAdd,
      onOemskuCodeDelete: this.handleOemskuCodeDelete,
      onOemskuCodeSplit: this.handleOemskuCodeSplit,
      onCheckCode: this.handleCheckCode,
      onInputOecode: this.handleInputOecode,
      onSelectTreeNodeInput: this.handleSelectTreeNodeInput,
      onUpdatePropPic: this.handleUpdatePropPic,
      onUploadPropPic: this.handleUploadPropPic,
      onUpdatePic: this.handleUpdatePic,
      onUploadPic: this.handleUploadPic
    };

    const treeNodeModalProps = {
      visible: treeNodeModalVisible,
      expandedKeys,
      selectedKeys,
      PAGE_TYPE,
      CATEGORY_TREE,
      CATEGORY_INFO,
      onOk: this.handleTreeNodeModalOk,
      onCancel: this.handleTreeNodeModalCancel,
      onInputChange: this.handleTreeInputChange,
      onTreeSelect: this.handleTreeSelect
    };
    const SaveBtnProps = {
      PAGE_TYPE,
      OE_INFO,
      OE_INFO_FIELDS,
      onSubmit: this.handleSubmit,
      onOemskuApprove: this.handleOemskuApprove,
      onOemskuDelete: this.handleOemskuDelete,
      onshowSaveApproveModal: this.showSaveApproveModal
    };

    // 添加适配车型模态框组件属性
    const idAddCarmodelProps = {
      ...this.props,
      addCarmodelModalVisible,
      carmodelModelType,
      currentEditCarmodel,
      onCarmodelKeyvalueList: this.handleCarmodelKeyvalueList,
      onOemskuCarmodelEdit: this.handleOemskuCarmodelEdit,
      onUpdateCarmodelKeyvalueList: this.updateCarmodelKeyvalueList,
      onHideCarmodelModal: this.hideCarmodelModal,
      onCarmodelAdd: this.handleCarmodelAdd,
      onCarmodelEdit: this.handleCarmodelEdit,
      onShowDescModal: this.showDescModal
    };

    // 保存并审核模态框表格
    const columns = [{
      title: 'OE号',
      dataIndex: 'oem_partsku_codes',
      key: 'oem_partsku_codes',
      render: (text, record, index) => {
        const { oem_partsku_id } = record;
        // 点击路由后需要隐藏模态框
        return <span className="blue6 cur" onClick={() => this.routeToOe(oem_partsku_id)}>
          {text.length > 0 ? text.map((v, i) => <div key={i}>{v}</div>) : '虚拟OE'}
        </span>;
      }
    }, {
      title: 'OE属性',
      dataIndex: 'oem_partsku_values',
      key: 'oem_partsku_values',
      render: (text, row, index) => {
        return (
          <>
            {
              text.length > 0 &&
              text.map(v => `${v.category_pro_name}：${v.oem_partsku_value}${v.category_pro_unit && '(' + v.category_pro_unit + ')'}`).join('，')
            }
            {
              text.length == 0 &&
              '-'
            }
          </>
        );
      }
    }, {
      title: '说明',
      dataIndex: 'err',
      key: 'err',
      render: (text, row, index) => {
        return text || '-';
      }
    }];
    const isCheckLoading = loading['oe_id/fetchOemskuApproveCheck'];
    const saveApproveTableProps = {
      loading: isCheckLoading,
      bordered: true,
      dataSource: saveApproveModalDataSource,
      columns,
      pagination: false,
      rowKey: (item, index) => index
    };
    // 保存并审核模态框属性
    const saveApproveModalProps = {
      title: '隶属于相同标准码的OE产品',
      destroyOnClose: true,
      maskClosable: false,
      visible: saveApproveModalVisible,
      width: 1200,
      bodyStyle: { height: 600, overflowY: 'auto' },
      style: { top: 30 },
      onCancel: this.hideSaveApproveModal,
      footer: <>
        <Button type="primary" onClick={this.handleSaveOE}>保存当前OE</Button>
        <Divider type="vertical" />
        <Button type="primary" onClick={this.handleApproveAllOE} disabled={isCheckLoading || saveApproveModalDataSource.some(v => v.code === -1)}>全部审核通过</Button>
      </>
    };
    const feedbackModalProps = {
      title: 'OE&车型不适配反馈',
      visible: feedbackModalVisible,
      destroyOnClose: true,
      maskClosable: false,
      keyboard: false,
      onCancel: this.hideFeedbackModal,
      width: 1200,
      style: { top: 30 },
      bodyStyle: { height: '80vh', overflow: 'auto' },
      footer: [
        <Button key='handled' type='primary' onClick={this.fetchOemskuCarmodelFilterHandled}>设置已处理</Button>,
        <Button key='cancle' type='primary' ghost onClick={this.hideFeedbackModal}>取消</Button>
      ]
    };
    const isPageLoading = loading['oe_id/fetchOemskuCodeCheck'] || loading['oe_id/fetchPartskuDescUpload'] || loading['oe_id/fetchOemskuCreate'];
    return (
      <Spin spinning={!!isPageLoading}>
        <Tabs animated={false} activeKey={tabsActiveKey} tabBarStyle={{ marginBottom: 0 }} onChange={this.handleTabsChange}>
          <TabPane tab='OE信息' key='oeInfo'>
            <IdOeInfo ref={el => this.oeInfoForm = el} {...oeInfoProps} />
          </TabPane>
          <TabPane tab='适配车型' key='carModel'>
            <IdCarModel {...idCarModelProps} />
          </TabPane>
          <TabPane tab='OE合并组' key='oeMergeGroup'>
            <IdOeMergeGroup wrappedComponentRef={el => this.mergeGroupForm = el} {...oeMergeGroupProps} />
          </TabPane>
        </Tabs>

        {/* 保存按钮行 */}
        <SaveBtn form={this.oeInfoForm} {...SaveBtnProps} />

        {/* 零件树模态框 */}
        <TreeNodeModal {...treeNodeModalProps} />

        {/* 添加适配车型模态框 */}
        <IdAddCarmodel {...idAddCarmodelProps} />

        {/* 特殊说明模态框 */}
        <IdDescPropsModal visible={descModalVisible} oem_carmodel_comment_desc={oem_carmodel_comment_desc} onHideDescModal={this.hideDescModal} onEditDesc={this.handlEditDesc} />

        {/* 保存并审核模态框 */}
        <Modal {...saveApproveModalProps}>
          <Row>
            <Col>
              <CopyToClipboard text={std_partsku_code} onCopy={() => message.success('复制成功')}>
                <span><span className="gray">标准码：</span>{std_partsku_code} <Icon type="copy" className="cur" /></span>
              </CopyToClipboard>
            </Col>
            <Col className="m-t-10">
              <Table {...saveApproveTableProps} />
            </Col>
            <Col className="m-t-10"><span className="gray">提示：</span>同一标准码下多个待审核OE必须同时审核通过；</Col>
          </Row>

        </Modal>
        {/* 拆分 模态框 */}
        <Modal title='选择拆分模式' {...modalProps} visible={splitModalVisible} onCancel={this.hideSplitModal}>
          <RadioGroup onChange={this.handleChangeSplitType}>
            <Radio value={'KEEP'}><b>保留关联关系</b></Radio>
            <div className={styles.radio_list}>
              <div>拆分出的车型所对应的标准码仍管理商户产品，产品过滤车型关系在新标准码下保留。</div>
            </div>
            <Radio value={'DELETE'} className="m-t-5"><b>不保留关联关系</b></Radio>
            <div className={styles.radio_list}>
              <div>拆分出的车型所对应的标准码不再管理商户产品，产品过滤车型关系删除</div>
            </div>
          </RadioGroup>
          <div className="text-center m-t-10">
            <Button type="primary" disabled={!split_type} onClick={this.handleOemskuCarmodelSplit}>执行拆分操作</Button>
          </div>
        </Modal>

        {/* 用户反馈模态框 */}
        <Modal {...feedbackModalProps}>
          <IdFeedback OEMSKU_CARMODEL_FILTER_INFO={OEMSKU_CARMODEL_FILTER_INFO} />
        </Modal>

        {/* 图片预览 */}
        <PhotoSwipe isOpen={this.state.isOpen} items={this.state.isOpenImg} onClose={this.handleCloseImg} />
      </Spin>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.global,
  ...state.oe_id
});

export default connect(mapStateToProps)($Oe_id);

// 通过pos获取对应的品类
function getSelectCategory(pos) {
  let cate = {};
  return function fn(data) {
    for (let i = 0; i < data.length; i++) {
      const it = data[i];
      if (it.keys === pos) {
        cate = it;
        break;
      }
      if (it.children) {
        fn(it.children);
      }
    }
    return cate;
  };
}
