import React, { Component } from 'react';
import { connect } from 'dva';
import { Tabs, Form, Card, Divider, Row, Col, Modal, Button, message, notification, Input, Select } from 'antd';
import { PhotoSwipe } from 'react-photoswipe';
import IdBaseInfo from './components/IdBaseInfo';
import NoData from '@/components/NoData';
import classNames from 'classnames';
import IdSaveButton from './components/IdSaveButton';
import CarModelSearchForm from './components/CarModelSearchForm';
import CarModelTableList from './components/CarModelTableList';
import AddOE from './components/AddOE';
import AddCarmodel from './components/AddCarmodel';
import router from 'umi/router';
import styles from './$id.less';
import { isEmpty, uniqueArr, groupFn, getPicSize, dataURLtoFile, getPartskuValues, loadingAllDescImgs } from '@/utils/tools';
import * as _ from 'lodash';
import UploadPicList from '@/components/UploadPicList';
import Editor from '@/components/Editor';
import ENV from '@/utils/env';
import qs from 'querystringify';
// 转换html为图片
import domtoimage from 'dom-to-image';
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const FormItem = Form.Item;
// 获取表单placeholder文字提示
const getPlaceholder = ({ category_pro_size, category_pro_type }) => {
  if (category_pro_size) {
    return `输入的字节长度不得超过${category_pro_size}`;
  }
  if (category_pro_type === 'NUMBER') {
    return '请输入数字';
  }
};
const { Option } = Select;
// 页面组件
class $id extends Component {

  state = {
    isAdd: false,
    currentTabKey: 'partInfo',
    // info
    // editorState: EditorState.createEmpty(),
    // carmodel
    modalVisible: false,                                // 添加适配车型模态框是否展示标识
    carmodelOEFormatList: [],                           // 模态框 - 通过OE查询的适配车型列表【已格式化】
    carmodelParamsFormatList: [],                       // 模态框 - 通过车型查询的适配车型列表【已格式化】
    carmodelOEList: [],                                 // 模态框 - 通过OE查询的适配车型列表
    carmodelParamsList: [],                             // 模态框 - 通过车型查询的适配车型列表
    selectedCarmodelByParams: {},                       // 模态框 - 通过车型查询的参数
    addCarmodelTabKey: 'oe',                            // 添加适配车型模态框tab页的key值
    fmsCarmodelList: [],                                // 适配车型列表数据
    fmsSearchBrand: '',                                 // 适配车型筛选参数 - 车型品牌
    fmsSearchMatchFlag: '',                             // 适配车型筛选参数 - 系统提醒
    vaildCodeStatus: '',                                // 产品编码的重复校验状态
    vaildCodeHelp: '',                                  // 产品编码的重复校验提示
    uploadImageUrls: [],                                // 新上传的图片地址数组 { fms_partsku_image_id: '', fms_partsku_image_url: ''}
    isOpen: false, // 图片预览
    isOpenImg: [], // 图片预览
    selectedRowKeys: []
  };

  componentDidMount() {
    // 触发按钮初始化依附在页面底部
    let timer = setTimeout(() => {
      window.scrollBy(0, 1);
      window.scrollTo(0, 0);
      clearTimeout(timer);
    }, 0);
    this.pageInitFn();
  }

  pageInitFn = () => {
    const { dispatch, carmodelProperties, location } = this.props;
    let paths = location.pathname.split('/');
    const { category_id, fms_brand_id, fms_category_id, fms_partsku_id, fms_part_id, brand_category_id } = location.query;
    let isAdd = null;
    if (paths[paths.length - 1] == -1) {
      // 创建
      isAdd = true;
      dispatch({
        type: 'fms_parts_id/fetchAddPageInit',
        payload: { category_id, fms_brand_id, fms_category_id, fms_part_id }
      });
    } else {
      // 编辑
      isAdd = false;
      dispatch({
        type: 'fms_parts_id/fetchEditPageInit',
        payload: {
          category_id, fms_brand_id, fms_category_id, fms_part_id, fms_partsku_id, brand_category_id,
          cb: () => {
            // 获取适配车型
            dispatch({
              type: 'fms_parts_id/fetchFmsCarmodelList',
              payload: {
                fms_partsku_id,
                category_id,
                cb: list => this.setState({ fmsCarmodelList: list })
              }
            });
          }
        }
      });
    }
    this.setState({ isAdd });
    if (category_id && carmodelProperties.length === 0) {
      dispatch({
        type: 'fms_parts_id/fetchCarmodelProperities',
        payload: { category_id }
      });
    }
  }

  // 切换tab页
  onTabChangeFn = key => {
    const { fms_brand_id, fms_category_id, fms_part_id, partsku_codes = [] } = this.props.postFields;

    if (key == 'partInfo') {
      this.setState({ currentTabKey: key });
    } else if (key == 'carmodel') {
      // 判断是否已选择
      if (fms_brand_id && fms_category_id && fms_part_id && partsku_codes.length > 0) {
        this.setState({ currentTabKey: key });
      } else {
        return notification.info({
          message: '提示',
          description: '请填写完必填项再添加适配车型'
        });
      }
    }
  }

  // 获取适配车型列表
  fetchFmsCarmodelListFn = () => {
    const { fms_partsku_id, category_id } = this.props.postFields;
    this.props.dispatch({
      type: 'fms_parts_id/fetchFmsCarmodelList',
      payload: {
        fms_partsku_id,
        category_id,
        cb: list => this.setState({ fmsCarmodelList: list })
      }
    });
  }

  // **************************** IdBaseInfo 
  // 切换品牌，获取品类下拉列表
  onChangeFmsBrandDropListFn = (brand_category_id, fms_brand_id) => {
    this.props.dispatch({
      type: 'fms_parts_id/fetchFmsParts',
      payload: { brand_category_id, fms_brand_id }
    });
  }

  // 切换品类
  onChangeFmsCategoryDropListFn = (brand_category_id) => {
    this.props.dispatch({
      type: 'fms_parts_id/fetchFmsBrands',
      payload: { brand_category_id }
    });
  }

  // 切换产品下拉列表
  onChangeFmsPartFn = (brand_category_id, fms_brand_id, fms_part_id) => {
    const { dispatch, postFields, fmsPartsDropList } = this.props;
    const part = fmsPartsDropList.find(v => v.fms_part_id === fms_part_id) || {};
    // 获取对应的属性信息
    dispatch({ type: 'fms_parts_id/fetchCategoryPros', payload: { category_id: part.category_id } });
    // 更新postFields
    dispatch({
      type: 'fms_parts_id/savePostFields',
      payload: {
        ...postFields,
        category_id: part.category_id,
        fms_brand_id,
        brand_category_id,
        fms_part_id,
        fms_part_name: part.title
      }
    });
  }

  // 输入大厂编码
  onHandleInputCodeFn = (code, callback) => {
    const { dispatch, postFields } = this.props;
    const { fms_brand_id, fms_category_id, fms_part_id, fms_partsku_id, partsku_codes = [] } = postFields;
    let status = '';
    let help = '';
    if (code) {
      // const regExp = /^[－（）＿　＼／ ()/\\\w\.-]+$/; // 英文 数字 空格 下划线 横杠 斜杠 括号 (包含全角符号)
      // 先判断已有的是否已重复
      if (partsku_codes.some(item => item.fms_partsku_code == code)) {
        // 本地已添加
        message.error('该编码已存在');
        status = 'error';
        help = '该编码已存在';
        this.setState({ vaildCodeStatus: status, vaildCodeHelp: help });
      } 
      // else if (!regExp.test(code)) {
      //   message.error('不能为中文字符或者特殊字符');
      // } 
      else {
        // 
        dispatch({
          type: 'fms_parts_id/fmsPartskuCodeCheck',
          payload: {
            fms_brand_id,
            fms_category_id,
            fms_part_id,
            fms_partsku_code: code,
            fms_partsku_id,
            cb: flag => {
              if (flag) {
                let newCodes = [...partsku_codes];
                newCodes.push({ fms_partsku_code_id: 'time-' + new Date().getTime(), fms_partsku_code: code });
                // 更新postFields
                this.updatePostFieldsFn({ partsku_codes: newCodes });
                callback();
              } else {
                // 重复
                message.error('该编码已存在');
                status = 'error';
                help = '该编码已存在';
              }
              this.setState({ vaildCodeStatus: status, vaildCodeHelp: help });
            }
          }
        });
      }
    } else {
      this.setState({ vaildCodeStatus: 'error', vaildCodeHelp: '请输入' });
    }
  };

  // 更改postFields属性
  updatePostFieldsFn = params => {
    const { dispatch, postFields } = this.props;
    dispatch({
      type: 'fms_parts_id/savePostFields',
      payload: { ...postFields, ...params }
    });
  };

  // ****************************  模态框
  // 模态框 - 点击确定添加适配车型
  handleAddCarmodelModalFn = () => {
    const { dispatch, postFields, fmsCarmodelList } = this.props;
    const { isAdd, addCarmodelTabKey, carmodelOEList, carmodelParamsList, selectedRowKeys } = this.state;

    if (selectedRowKeys.length === 0) {
      return message.error('未有待添加的车型数据');
    }

    if (isAdd) {
      // 创建
      let fmsList = [];
      const std_partsku_ids = _.uniqBy([...postFields.std_partsku_ids, ...selectedRowKeys]);
      if (addCarmodelTabKey == 'oe') {
        // 通过OE查询适配车型
        fmsList = carmodelOEList.filter(v => selectedRowKeys.includes(v.std_partsku_id));
      } else {
        // 通过条件查询适配车型
        fmsList = carmodelParamsList;
      }

      // 赋值std_partsku_ids给postFields
      dispatch({ type: 'fms_parts_id/savePostFields', payload: { ...postFields, std_partsku_ids } });
      // 将选择的适配车型插入到适配车型列表数组
      let newList = [...fmsCarmodelList];
      for (let i = 0; i < fmsList.length; i++) {
        newList.push(fmsList[i]);
      }
      const _newList = _.uniqBy(newList, 'std_partsku_id');
      
      dispatch({ type: 'fms_parts_id/saveFmsCarmodelList', payload: _newList });
      // 更新数据到页面
      this.setState({ fmsCarmodelList: _newList });

      
    } else {
      // 编辑
      const std_partsku_ids = _.uniqBy(selectedRowKeys);

      dispatch({
        type: 'fms_parts_id/addFmsCarmodel',
        payload: {
          fms_partsku_id: postFields.fms_partsku_id,
          std_partsku_ids
        },
        callback: this.fetchFmsCarmodelListFn // 重新拉取适配车型列表
      });
    }
    this.handleModalVisibleFn();
    const data={
      record_obj:{
        'operation':'添加适配车型',
      },
      record_page:' 大厂码管理/产品管理',
      record_operations:'添加适配车型'
    };
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  };

  // 模态框展示控制
  handleModalVisibleFn = () => {
    const { dispatch, carmodelApprovedList } = this.props;
    const newVisible = !this.state.modalVisible;
    this.setState({ modalVisible: newVisible });
    if (newVisible && carmodelApprovedList.length === 0) {
      // 显示模态框并且未拉取品牌主机厂车型数据
      dispatch({ type: 'global/fetchBrandFacModListApproved' });
    }
    if (!newVisible) {
      // 关闭模态框，销毁查询的数据
      this.setState({
        carmodelOEList: [],
        carmodelParamsList: [],
        carmodelOEFormatList: [],
        carmodelParamsFormatList: [],
        selectedCarmodelByParams: {},
        addCarmodelTabKey: 'oe',
        selectedRowKeys: []
      });
    }
  };

  // ****************************  其他

  // 底部操作栏 - 保存操作
  onHandleSubmitFn = (e, type) => {
    e.preventDefault();
    const { form, dispatch, postFields, EDITOR_STATE, fmsCarmodelList, fmsPartSkusInfo, fmsPartsDropList } = this.props;
    const { isAdd, vaildCodeStatus } = this.state;
    const { fms_partsku_id, category_id, fms_brand_id, fms_category_id, fms_part_id, partsku_codes = [], std_partsku_ids } = postFields;
    const { partsku_val_imgs = [], partsku_vals = [], partsku_imgs = [], category_type } = fmsPartSkusInfo;
    form.validateFields(async (err, values) => {
      if (!err && vaildCodeStatus != 'error') {
        const part = fmsPartsDropList.find(v => v.category_id === category_id);
        // 创建：描述，图片，属性，适配车型为选填项
        let params = {
          brand_category_id: part.brand_category_id,
          category_id,
          fms_brand_id,
          fms_category_id,
          fms_part_id,
          fms_partsku_codes: partsku_codes.map(item => item.fms_partsku_code),
          partsku_vals: partsku_vals.map(v => ({ category_pro_id: v.category_pro_id, fms_partsku_value: values[v.category_pro_id] })).filter(v => !isEmpty(v.fms_partsku_value)),
          partsku_imgs: partsku_imgs.map(v => v.fms_partsku_image_id),
        };

        // 产品属性图片
        let _partsku_val_imgs = [];
        for (let i = 0; i < partsku_val_imgs.length; i++) {
          const catePro = partsku_val_imgs[i];
          for (let j = 0; j < catePro.partsku_value_imgs.length; j++) {
            const partsku_value = catePro.partsku_value_imgs[j];
            if (partsku_value.url) {
              const { fms_partsku_image_id } = partsku_value;
              _partsku_val_imgs.push({
                category_pro_id: catePro.category_pro_id, fms_partsku_image_id, fms_partsku_image_index: j
              });
            }
          }
        }

        if (_partsku_val_imgs.length > 0) {
          params.partsku_val_imgs = _partsku_val_imgs;
        }

        // 产品说明
        const regexp = new RegExp(ENV.imgDomain, 'g');
        const fms_partsku_desc = EDITOR_STATE.html.replace(regexp, '');
        if (!isEmpty(fms_partsku_desc)) {
          params.fms_partsku_desc = fms_partsku_desc;
          params.partsku_desc_imgs = [];
          if (EDITOR_STATE.data.entityMap) {
            // 保存过的img数据
            for (const key in EDITOR_STATE.data.entityMap) {
              const url = EDITOR_STATE.data.entityMap[key].data.url;
              const match = url.match(/http.*\?(.*)/);
              if (match && match[1]) {
                const parse = qs.parse(match[1]);
                if (parse.fms_partsku_image_id) {
                  params.partsku_desc_imgs.push(parse.fms_partsku_image_id);
                }
              }
            }
          }
          if (params.partsku_desc_imgs.length === 0) {
            // 没保存过的默认img数据
            params.partsku_desc_imgs = EDITOR_STATE.imgs.map(v => v.fms_partsku_image_id);
          }
        }

        // 生成长图
        if (category_type === 'GUIDE' && !isEmpty(EDITOR_STATE.html)) {
          let tenPartskuDescImg = document.createElement('div');
          tenPartskuDescImg.id = 'tenPartskuDescImg';
          tenPartskuDescImg.innerHTML = EDITOR_STATE.html.replace(/src=\"\/famous\/partsku\//g, 'src=\"' + ENV.imgDomain + '/famous/partsku/');
          tenPartskuDescImg.className = 'desc_img';
          document.body.appendChild(tenPartskuDescImg);
          const el = document.getElementById('tenPartskuDescImg');
          if(el.clientHeight > 9000) {
            // 移除临时节点
            document.body.removeChild(el);
            return message.error('生成长图高度不能超过9000px');
          }
          // 生成配件说明长图
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
                  type: 'fms_parts_id/fetchPartskuDescUpload',
                  payload: { file, fms_brand_id }
                });
                if (res.code === 0) {
                  // 配件说明长图
                  params.fms_partsku_desc_img = res.data.fms_partsku_image_url;
                }
              });
          }
          catch (err) {
            // 移除临时节点
            document.body.removeChild(el);
          }
        }
        if (type == 'save') {
          params.enable_flag = 0;
        } else {
          // 保存并启用
          params.enable_flag = 1;
          // 判断若无适配车型，则不允许启用
          if (fmsCarmodelList.length === 0) {
            message.error('缺少车型信息，不允许启用');
            return;
          }
        }

        if (isAdd) {
          params.std_partsku_ids = std_partsku_ids;
        } else {
          params.fms_partsku_id = fms_partsku_id;
        }
        dispatch({ type: 'fms_parts_id/' + (isAdd ? 'createFmsPartSkus' : 'updateFmsPartSkus'), payload: params });
      }
    });
    const data={
      record_obj:{
        'operation':type==='save'?'保存':'保存并启用',
        'category_id':this.props.match.params.id
      },
      record_page:' 大厂码管理/产品管理',
      record_operations:type==='save'?'保存大厂产品':'保存并启用大厂产品'
    };
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  };

  // 适配车型 - 通过OE获取适配车型
  onHandleSubmitByOEFn = oem_partsku_code => {
    const { dispatch, fmsCategoryProps, postFields } = this.props;
    dispatch({
      type: 'fms_parts_id/fetchCarmodelOEList',
      payload: {
        category_id: postFields.category_id,
        oem_partsku_code,
        cb: list => {
          this.setState({
            carmodelOEFormatList: formatCarmodelOEListFn(fmsCategoryProps, list, oem_partsku_code),
            carmodelOEList: list,
            selectedRowKeys: list.map(v => v.std_partsku_id)
          });
        }
      }
    });
  }

  // 适配车型 - 通过参数获取适配车型
  onHandleSubmitByParamsFn = ({ brandFacModelList, cm_displacement, cm_model_year }) => {
    const { dispatch, fmsCategoryProps, postFields } = this.props;
    dispatch({
      type: 'fms_parts_id/fetchCarmodelParamsList',
      payload: {
        category_id: postFields.category_id,
        cm_brand: brandFacModelList[0],
        cm_factory: brandFacModelList[1],
        cm_model: brandFacModelList[2],
        cm_displacement,
        cm_model_year,
        cb: list => {
          this.setState({
            selectedCarmodelByParams: { cm_brand: brandFacModelList[0], cm_factory: brandFacModelList[1], cm_model: brandFacModelList[2], cm_displacement, cm_model_year },
            carmodelParamsFormatList: formatCarmodelParamsListFn(fmsCategoryProps, list, brandFacModelList[0], brandFacModelList[1], brandFacModelList[2], cm_displacement, cm_model_year),
            carmodelParamsList: list,
            selectedRowKeys: list.map(v => v.std_partsku_id)
          });
        }
      }
    });
  }

  // 删除适配车型
  onHandleDeleteFmsCarmodelFn = std_partsku_id => {
    confirm({
      title: '删除后不可恢复，确定删除该车型？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const { dispatch, fmsCarmodelList, postFields } = this.props;
        const data={
          record_obj:{
            'operation':'删除适配车型：'+std_partsku_id,
          },
          record_page:' 大厂码管理/产品管理',
          record_operations:'删除适配车型'
        };
        dispatch({
          type:'managerRecord/fetchUserRecorListInsert',
          data:data
        });
        if (this.state.isAdd) {
          let newList = fmsCarmodelList.filter(item => std_partsku_id != item.std_partsku_id);
          dispatch({ type: 'fms_parts_id/saveFmsCarmodelList', payload: newList });
          this.setState({ fmsCarmodelList: newList });
          dispatch({ type: 'fms_parts_id/savePostFields', payload: { ...postFields, std_partsku_ids: postFields.std_partsku_ids.filter(v => v !== std_partsku_id) } });
        } else {
          dispatch({
            type: 'fms_parts_id/deleteFmsCarmodel',
            payload: {
              fms_partsku_id: postFields.fms_partsku_id,
              std_partsku_id,
              cb: () => {
                let newList = fmsCarmodelList.filter(item => std_partsku_id != item.std_partsku_id);
                dispatch({ type: 'fms_parts_id/saveFmsCarmodelList', payload: newList });
                this.setState({ fmsCarmodelList: newList });
                dispatch({ type: 'fms_parts_id/savePostFields', payload: { ...postFields, std_partsku_ids: postFields.std_partsku_ids.filter(v => v !== std_partsku_id) } });
              }
            }
          });
        }
      }
    });
  }

  // 切换添加适配车型模态框
  onChangeAddCarmodeModelFn = () => {
    let key = '';
    if (this.state.addCarmodelTabKey == 'oe') {
      key = 'car';
    } else {
      key = 'oe';
    }
    this.setState({ addCarmodelTabKey: key });
  }

  // 跳转去OE编辑页
  onGoOEDetailFn = oem_partsku_id => router.push('/oe/list/' + oem_partsku_id + '?oem_partsku_id=' + oem_partsku_id);

  // 适配车型筛选表单 - 筛选车型品牌
  onChangeBrandFn = cm_brand => {
    this.setState({ fmsSearchBrand: cm_brand });
    this.filterCarModelListFn(cm_brand, this.state.fmsSearchMatchFlag);
  }

  // 适配车型筛选表单 - 筛选系统提示
  onChangeSystemTipFn = matchFlag => {
    this.setState({ fmsSearchMatchFlag: matchFlag });
    this.filterCarModelListFn(this.state.fmsSearchBrand, matchFlag);
  }

  // 筛选适配车型列表
  filterCarModelListFn = (cm_brand, matchFlag) => {
    let newList = [];
    if (cm_brand == '' && matchFlag == '') {
      newList = this.props.fmsCarmodelList;
    }
    if (cm_brand && matchFlag) {
      newList = this.props.fmsCarmodelList.filter(item => item.cm_brand == cm_brand && item.matchFlag == matchFlag);
    } else {
      if (matchFlag) {
        newList = this.props.fmsCarmodelList.filter(item => item.matchFlag == matchFlag);
      }
      if (cm_brand) {
        newList = this.props.fmsCarmodelList.filter(item => item.cm_brand == cm_brand);
      }
    }
    this.setState({ fmsCarmodelList: newList });
  }

  /** 上传图片 */

  // 上传图片
  handleUploadPic = (file, callback) => {
    const { postFields, dispatch } = this.props;
    const { fms_brand_id } = postFields;
    // 上传图片
    dispatch({
      type: 'fms_parts_id/fetchImageUpload',
      payload: { fms_brand_id, file },
      callback
    });
  };

  // 更新图片
  handleUpdatePic = imgs => {
    const { fmsPartSkusInfo, dispatch } = this.props;
    dispatch({
      type: 'fms_parts_id/saveFmsPartSkusInfo',
      payload: {
        ...fmsPartSkusInfo,
        partsku_imgs: imgs
      }
    });
  };

  // 上传属性图片
  handleUploadPropPic = (part_prop, file, callback) => {
    const { location, dispatch } = this.props;
    const { fms_brand_id } = location.query;
    // 上传图片
    dispatch({
      type: 'fms_parts_id/fetchPropImageUpload',
      payload: { ...part_prop, file, fms_brand_id },
      callback
    });
  };

  // 更新属性图片
  handleUpdatePropPic = (part_prop, imgs) => {
    const { fmsPartSkusInfo, dispatch } = this.props;
    const { partsku_val_imgs } = fmsPartSkusInfo;
    dispatch({
      type: 'fms_parts_id/saveFmsPartSkusInfo',
      payload: {
        ...fmsPartSkusInfo,
        partsku_val_imgs: partsku_val_imgs.map(v => {
          return v.category_pro_id === part_prop.category_pro_id ? { ...v, partsku_value_imgs: imgs } : v;
        })
      }
    });
  };

  /** 上传图片 end */

  /** 富文本编辑器 */
  handleEditorChange = (editorState, editorStateHtml) => {
    const { dispatch, EDITOR_STATE } = this.props;
    // 实时更新 EDITOR_STATE的model值，保存时方便获取
    dispatch({ type: 'fms_parts_id/updateEditorState', payload: { ...EDITOR_STATE, data: editorState, html: editorStateHtml } });
  };

  handleEditorUpload = (info, uploadParam) => {
    const { location, dispatch } = this.props;
    const { fms_brand_id } = location.query;
    return dispatch({ type: 'fms_parts_id/fetchEditorUpload', payload: { ...info, fms_brand_id } });
  };
  /** 富文本编辑器 end */

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
  handleCloseImage = () => {
    this.setState({
      isOpen: false
    });
  };
  /** 图片预览end */

  /** 选择适配车型 */
  handleChangeSelectedRow = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  }

  render() {
    const { form, loading, EDITOR_STATE, CATEGORIES_FORBID, postFields, fmsBrandsDropList, fmsCategoriesDropList, fmsPartsDropList, fmsCategoryProps, fmsPartSkusInfo, fmsCarmodelList, carmodelApprovedList, carmodelProperties
    } = this.props;
    const { isAdd, modalVisible, addCarmodelTabKey, vaildCodeStatus, vaildCodeHelp, isOpenImg, isOpen, selectedRowKeys } = this.state;
    const { fms_part_name = '', partsku_codes = [] } = postFields;
    const { partsku_imgs = [], partsku_vals = [], partsku_val_imgs = [], category_type } = fmsPartSkusInfo;
    const categoryProsGroup = groupFn(partsku_vals);
    const matchCarmodelsProps = {
      title: '添加适配车型 （产品: ' + fms_part_name + ' ' + partsku_codes.map(item => item.fms_partsku_code) + '）',
      visible: modalVisible,
      maskClosable: false,
      keyboard: false,
      width: 1200,
      style: { top: 30 },
      okText: '添加',
      cancelText: '取消',
      destroyOnClose: true,
      onCancel: this.handleModalVisibleFn,
      onOk: this.handleAddCarmodelModalFn
    };
    const isCardLoading = loading['fms_parts_id/fetchAddPageInit'] || loading['fms_parts_id/fetchEditPageInit'];
    const { getFieldDecorator } = form;
    // const category_forbid_content = CATEGORIES_FORBID.filter(v => v.category_type_forbid_type === 'CONTENT');
    // const category_type_forbids = category_forbid_content.map(v => v.category_type_forbid_obj);    
    return (
      <div className={styles.part}>
        <Tabs defaultActiveKey={this.state.currentTabKey} activeKey={this.state.currentTabKey} tabBarStyle={{ marginBottom: 0 }} onChange={key => this.onTabChangeFn(key)}>
          <TabPane tab="产品信息" key="partInfo">
            <Card loading={!!isCardLoading}>
              <Form className="factorycode-category-form" onSubmit={e => this.onHandleSubmitFn(e)} autoComplete="off">
                {/* 基本信息 */}
                <Row style={{ fontWeight: '600' }} className={classNames('c9', 'm-b-10')}>基本信息</Row>
                <IdBaseInfo
                  isAdd={isAdd}
                  form={form}
                  postFields={postFields}
                  fmsBrandsDropList={fmsBrandsDropList}
                  fmsCategoriesDropList={fmsCategoriesDropList}
                  fmsPartsDropList={fmsPartsDropList}
                  vaildCodeStatus={vaildCodeStatus}
                  vaildCodeHelp={vaildCodeHelp}
                  onChangeFmsBrandDropListFn={this.onChangeFmsBrandDropListFn}
                  onChangeFmsCategoryDropListFn={this.onChangeFmsCategoryDropListFn}
                  onChangeFmsPartFn={this.onChangeFmsPartFn}
                  onHandleInputCodeFn={this.onHandleInputCodeFn}
                  updatePostFieldsFn={this.updatePostFieldsFn}
                />
                <Divider style={{ marginTop: 10, marginBottom: 10 }} />

                {/* 属性信息 */}
                {
                  categoryProsGroup.length > 0 && categoryProsGroup.map((group, idx) => {
                    return (
                      <div key={idx}>
                        <Row className="c9" style={{ fontWeight: '600' }}>{idx > 0 && '兼容'}属性信息</Row>
                        <Row gutter={16}>
                          {
                            group.map((v, idx) => {
                              let rules = {};
                              const { category_pro_size, category_pro_name, category_pro_id, category_pro_type, category_pro_unit } = v;

                              if (category_pro_size !== '') {
                                rules.max = parseInt(category_pro_size, 10);
                                rules.message = `只允许输入${category_pro_size}个字符`;
                              }
                              // if (category_pro_type === 'NUMBER') {
                              //   rules.message = '请输入数字';
                              //   rules.pattern = /^[0-9]+(.[0-9]{1,2})?$/;
                              // }
                              return (
                                <Col span={6} key={category_pro_id}>
                                  <FormItem label={<span className="c9">{category_pro_name}</span>} className={styles.formItem}>
                                    {
                                      category_pro_type !== 'ENUM' && getFieldDecorator(category_pro_id, {
                                        initialValue: postFields[category_pro_id],
                                        rules: [rules]
                                      })(
                                        <Input addonAfter={category_pro_unit} placeholder={getPlaceholder(v)} />
                                      )
                                    }
                                    {
                                      category_pro_type === 'ENUM' && getFieldDecorator(category_pro_id, {
                                        initialValue: postFields[category_pro_id],
                                        rules: [rules]
                                      })(
                                        <Select placeholder="请选择" >
                                          {
                                            v.category_pro_enum_val.map((it, itIdx) => <Option key={itIdx} value={it}>{it}</Option>)

                                          }
                                        </Select>
                                      )
                                    }
                                  </FormItem>
                                </Col>
                              );
                            })
                          }
                        </Row>
                        <Divider style={{ marginTop: 5, marginBottom: 10 }} />
                      </div>
                    );
                  })
                }
                {
                  categoryProsGroup.length === 0 &&
                  <>
                    <Row className="c9" style={{ fontWeight: '600' }}>属性信息</Row>
                    <NoData title="暂无属性信息" />
                    <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                  </>
                }

                {/* 产品属性图片 category_pro_type为IMAGE的属性，单独展示 */}
                {
                  partsku_val_imgs.map((v, index) => {
                    const { category_pro_name, category_pro_size, partsku_value_imgs = [] } = v;
                    return (
                      <div key={index}>
                        <Row style={{ fontWeight: '600' }} className={classNames('c9')}>{category_pro_name}</Row>
                        <UploadPicList imgs={partsku_value_imgs} size={category_pro_size} loading={loading['fms_parts_id/fetchPropImageUpload']} onUpload={(file, callback) => this.handleUploadPropPic(v, file, callback)} onUpdatePic={(imgs) => this.handleUpdatePropPic(v, imgs)} />
                      </div>
                    );
                  })
                }

                {/* 产品图片 */}
                {
                  // !category_type_forbids.includes('CONTENT_SKU_PIC') &&
                  <>
                    <Row style={{ fontWeight: '600' }} className={classNames('c9')}>
                      产品图片：<span className="f12" style={{ fontWeight: 'normal' }}>最多9张800*800像素或以上的图片,支持.jpeg .png 格式</span>
                    </Row>
                    <Row className="m-t-10">
                      <UploadPicList imgs={partsku_imgs} size={9} loading={loading['fms_parts_id/fetchImageUpload']} onUpload={this.handleUploadPic} onUpdatePic={this.handleUpdatePic} />
                    </Row>

                  </>
                }

                {/* 产品说明 */}
                {
                  // !category_type_forbids.includes('CONTENT_SKU_DESC') &&
                  <>
                    {/* 当产品的category_type 为：GUIDE指导的场合，“产品说明”增加长图生成功能 */}
                    <Row style={{ fontWeight: '600' }} className={classNames('c9', 'm-b-10')}>产品说明</Row>
                    <Editor initialContent={EDITOR_STATE.html.replace(/src=\"\/famous\/partsku\//g, 'src=\"' + ENV.imgDomain + '/famous/partsku/')} type="fms" isPreview={category_type === 'GUIDE'} original_img_desc={EDITOR_STATE.html.replace(/src=\"\/famous\/partsku\//g, 'src=\"' + ENV.imgDomain + '/famous/partsku/')}  onEditorChange={this.handleEditorChange} onEditorUpload={this.handleEditorUpload} />
                  </>
                }

                {/* 保存按钮 */}
                <IdSaveButton
                  fmsCategoryProps={fmsCategoryProps}
                  postFields={postFields}
                  onHandleSubmitFn={this.onHandleSubmitFn}
                />
              </Form>
            </Card>
          </TabPane>
          <TabPane tab="适配车型" key="carmodel">
            <Card title={fms_part_name + '：' + partsku_codes.map(item => item.fms_partsku_code)}>
              <CarModelSearchForm
                isAdd={isAdd}
                brandsDropList={formatBrandsDropListFn(fmsCarmodelList)}
                onChangeBrandFn={this.onChangeBrandFn}
                onChangeSystemTipFn={this.onChangeSystemTipFn}
              />
              <Divider />
              <Row type="flex" justify="space-between">
                <Col className="f20">适配车型列表</Col>
                <Col>
                  <Button type="primary" ghost onClick={() => this.handleModalVisibleFn()}>添加适配车型</Button>
                </Col>
              </Row>
              {
                <CarModelTableList
                  fmsCategoryProps={fmsCategoryProps}
                  fmsCarmodelList={formatCarmodelListFn(fmsCategoryProps, carmodelProperties, this.state.fmsCarmodelList)}
                  onHandleDeleteFmsCarmodelFn={this.onHandleDeleteFmsCarmodelFn} onPreviewImage={this.handlePreviewImage}
                />
              }
              {/* 添加适配车型模态框 */}
              {
                modalVisible &&
                <Modal {...matchCarmodelsProps}>
                  <Tabs defaultActiveKey={addCarmodelTabKey} onChange={() => { this.onChangeAddCarmodeModelFn(); }}>
                    <TabPane tab="通过OE码添加" key="oe">
                      <AddOE
                        loading={loading['fms_parts_id/fetchCarmodelOEList']}
                        carmodelOEFormatList={this.state.carmodelOEFormatList}
                        fmsCategoryProps={fmsCategoryProps}
                        selectedRowKeys={selectedRowKeys}
                        onChangeSelectedRow={this.handleChangeSelectedRow}
                        onHandleSubmitByOEFn={this.onHandleSubmitByOEFn}
                        onGoOEDetailFn={this.onGoOEDetailFn}
                        onPreviewImage={this.handlePreviewImage}
                      />
                    </TabPane>
                    <TabPane tab="通过选择车型" key="car">
                      <AddCarmodel
                        loading={loading['fms_parts_id/fetchCarmodelParamsList']}
                        carmodelApprovedList={carmodelApprovedList}
                        fmsCategoryProps={fmsCategoryProps}
                        carmodelParamsFormatList={this.state.carmodelParamsFormatList}
                        selectedRowKeys={selectedRowKeys}
                        onChangeSelectedRow={this.handleChangeSelectedRow}
                        onHandleSubmitByParamsFn={this.onHandleSubmitByParamsFn}
                        onGoOEDetailFn={this.onGoOEDetailFn}
                        onPreviewImage={this.handlePreviewImage}
                      />
                    </TabPane>
                  </Tabs>
                </Modal>
              }
            </Card>
            {/* 保存按钮 */}
            <IdSaveButton
              postFields={postFields}
              fmsCategoryProps={fmsCategoryProps}
              onHandleSubmitFn={this.onHandleSubmitFn}
            />
          </TabPane>
        </Tabs>
        <PhotoSwipe isOpen={isOpen} items={isOpenImg} onClose={this.handleCloseImage} />
      </div>
    );
  }
}

const Part = Form.create()($id);
const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.global,
  ...state.fms_parts_id
});

export default connect(mapStateToProps)(Part);

// 模态框 - 格式化通过OE获取适配车型列表
// fmsCategoryProps 品类属性；list 通过OE获取适配车型列表数据
function formatCarmodelOEListFn(fmsCategoryProps, carmodelOEList, oem_partsku_code) {
  // 根据 oem_partsku_id 获取OE信息
  const getValueFn = (category_pro_id, oem_partsku_value) => {
    let str = '';
    for (let i = 0; i < fmsCategoryProps.length; i++) {
      let tar = fmsCategoryProps[i];
      if (tar.category_pro_id == category_pro_id) {
        if (tar.category_pro_type == 'NUMBER') {
          str += tar.category_pro_name + '：' + oem_partsku_value + '（' + tar.category_pro_unit + '）';
        } else if (tar.category_pro_type == 'STRING') {
          str += tar.category_pro_name + '：' + oem_partsku_value;
        } else if (tar.category_pro_type == 'ENUM') {
          str += tar.category_pro_name + '：' + tar.category_pro_enum_val.join('');
        }
        if (i != fmsCategoryProps.length - 1) {
          str += '，';
        }
      }
    }
    return str;
  };

  return carmodelOEList.filter(v => v.recommend !== 1).map(item => {
    let obj = {};
    let cm_vals = item.oem_partskus.reduce((s, v) => s.concat(v.cm_vals), []);
    obj.search_cms = cm_vals;
    // 去重
    cm_vals = _.uniqBy(cm_vals, v => `${v.cm_brand}${v.cm_factory}${v.cm_model}`);
    const search_cms = _.uniqBy(cm_vals, v => `${v.cm_brand}${v.cm_factory}`);
    const oemPartsku = item.oem_partskus.find(v => v.oem_partsku_codes.includes(oem_partsku_code)) || {};
    obj.std_partsku_id = item.std_partsku_id;
    // OE信息
    obj.info = {};
    item.oem_partskus.forEach((elem) => {
      obj.info.oeInfo = elem.oem_partsku_vals.map(i => getValueFn(i.category_pro_id, i.oem_partsku_value)).join('');
      obj.info.oeCode = elem.oem_partsku_codes.map(i => i).join('，');
      obj.info.create_type = elem.create_type;
      obj.info.oem_partsku_status = elem.oem_partsku_status;
      obj.info.oem_partsku_id = elem.oem_partsku_id;
    });
    // 适配车型
    obj.oem_partsku_codes = oemPartsku.oem_partsku_codes;
    obj.oem_partsku_vals = oemPartsku.oem_partsku_vals;
    obj.carmodel = search_cms.map(v => `${v.cm_brand},${v.cm_factory},${cm_vals.filter(u => u.cm_brand === v.cm_brand && u.cm_factory === v.cm_factory).map(v => v.cm_model).join()}`).join('，');
    return obj;
  });
}

// 模态框 - 格式化通过参数获取适配车型列表数据
// fmsCategoryProps 品类属性；list 通过参数获取适配车型列表数据
function formatCarmodelParamsListFn(fmsCategoryProps, carmodelParamsFormatList, cm_brand, cm_factory, cm_model, cm_displacement, cm_model_year) {
  // 根据 category_pro_id 获取OE信息
  const getValueFn = (category_pro_id, oem_partsku_value) => {
    let str = '';
    for (let i = 0; i < fmsCategoryProps.length; i++) {
      let tar = fmsCategoryProps[i];
      if (tar.category_pro_id == category_pro_id) {
        if (tar.category_pro_type == 'NUMBER') {
          str += tar.category_pro_name + '：' + oem_partsku_value + '（' + tar.category_pro_unit + '）';
        } else if (tar.category_pro_type == 'STRING') {
          str += tar.category_pro_name + '：' + oem_partsku_value;
        } else if (tar.category_pro_type == 'ENUM') {
          str += tar.category_pro_name + '：' + tar.category_pro_enum_val.join('');
        }
        if (i != fmsCategoryProps.length - 1) {
          str += '，';
        }
      }
    }
    return str;
  };

  return carmodelParamsFormatList.filter(v => v.recommend !== 1).map(item => {
    let obj = {};
    let search_cms = [];
    for (const oem of item.oem_partskus) {
      for (const cm of oem.cm_vals) {
        // params -> 请求参数对象
        if (cm.cm_brand === cm_brand && cm.cm_factory === cm_factory && cm.cm_model === cm_model && (!cm_displacement || cm.cm_displacement === cm_displacement) && (!cm_model_year || cm.cm_model_year === cm_model_year)) {
          search_cms.push(cm);
        }
      }
    }
    // 去重
    search_cms = _.uniqBy(search_cms, v => {
      const keys = Object.keys(v);
      return keys.slice(1, keys.length - 1).map(k => v[k]).join('');
    });

    const oemPartsku = item.oem_partskus[item.oem_partskus.length - 1];

    obj.std_partsku_id = item.std_partsku_id;
    obj.oem_partsku_codes = oemPartsku.oem_partsku_codes;
    obj.oem_partsku_vals = oemPartsku.oem_partsku_vals;
    obj.search_cms = search_cms;

    obj.std_partsku_id = item.std_partsku_id;
    // OE信息
    obj.info = {};
    item.oem_partskus.forEach(elem => {
      obj.info.oeInfo = elem.oem_partsku_vals.map(i => getValueFn(i.category_pro_id, i.oem_partsku_value));
      obj.info.oeCode = elem.oem_partsku_codes.map(itm => itm).join('，');
      obj.info.create_type = elem.create_type;
      obj.info.oem_partsku_status = elem.oem_partsku_status;
      obj.info.oem_partsku_id = elem.oem_partsku_id;

    });
    // 适配车型
    obj.carmodel = search_cms;
    obj.carmodelInfo = search_cms.length !== 0 ? `${search_cms[0].cm_brand}，${search_cms[0].cm_factory}，${search_cms[0].cm_model}` : '';
    return obj;
  });
}

// 适配车型列表 - 品类属性信息格式化函数
function formatCategoryPropsFn(isAdd, fmsPartSkusInfo, fmsCategoryProps) {
  const groups = uniqueArr(fmsCategoryProps.map(i => i.category_pro_group));
  const res = groups.map(item => {
    return { key: item, list: [] };
  });

  const getValue = category_pro_id => {
    let val = '';
    let tar = fmsPartSkusInfo;
    for (let i = 0; i < tar.partsku_vals.length; i++) {
      let t = tar.partsku_vals[i];
      if (t.category_pro_id == category_pro_id) {
        val = t.fms_partsku_value;
        break;
      }
    }
    return val;
  };

  fmsCategoryProps.forEach(item => {
    let obj = {};
    switch (item.category_pro_type) {
      case 'NUMBER':
        obj.category_id = item.category_id;
        obj.category_pro_id = item.category_pro_id;
        obj.category_pro_name = item.category_pro_name;
        obj.category_pro_unit = item.category_pro_unit;
        if (!isAdd) obj.fms_partsku_value = getValue(item.category_pro_id);
        obj.category_pro_type = item.category_pro_type;
        obj.category_pro_group = item.category_pro_group;
        obj.validateStatus = item.validateStatus;
        obj.help = item.help;
        break;
      case 'STRING':
        obj.category_id = item.category_id;
        obj.category_pro_id = item.category_pro_id;
        obj.category_pro_name = item.category_pro_name;
        obj.category_pro_size = item.category_pro_size;
        if (!isAdd) obj.fms_partsku_value = getValue(item.category_pro_id);
        obj.category_pro_type = item.category_pro_type;
        obj.category_pro_group = item.category_pro_group;
        obj.validateStatus = item.validateStatus;
        obj.help = item.help;
        break;
      case 'ENUM':
        obj.category_id = item.category_id;
        obj.category_pro_id = item.category_pro_id;
        obj.category_pro_name = item.category_pro_name;
        obj.category_pro_size = item.category_pro_size;
        if (!isAdd) obj.fms_partsku_value = getValue(item.category_pro_id);
        obj.category_pro_enum_val = item.category_pro_enum_val;
        obj.category_pro_type = item.category_pro_type;
        obj.category_pro_group = item.category_pro_group;
        obj.validateStatus = item.validateStatus;
        obj.help = item.help;
        break;
      default: {

      }
    }
    for (let i = 0; i < res.length; i++) {
      if (res[i].key == item.category_pro_group) {
        res[i].list.push(obj);
        break;
      }
    }
  });
  return res;
}

// 适配车型列表 - 格式化适配车型列表
function formatCarmodelListFn(fmsCategoryProps, carmodelProperties, list) {
  let res = [];
  // 根据 category_pro_id 获取OE数据
  const getOEValueFn = (category_pro_id, oem_partsku_value) => {
    let str = '';
    for (let i = 0; i < fmsCategoryProps.length; i++) {
      let tar = fmsCategoryProps[i];
      if (tar.category_pro_id == category_pro_id) {
        if (tar.category_pro_type == 'NUMBER') {
          str += tar.category_pro_name + '：' + oem_partsku_value + '（' + tar.category_pro_unit + '）';
        } else if (tar.category_pro_type == 'STRING') {
          str += tar.category_pro_name + '：' + oem_partsku_value;
        } else if (tar.category_pro_type == 'ENUM') {
          str += tar.category_pro_name + '：' + oem_partsku_value;
        }
      }
    }
    return str;
  };
  // 获取适配车型数据
  const getCarmodelValue = item => {
    let str = '';
    for (let i = 0; i < carmodelProperties.length; i++) {
      let tar = carmodelProperties[i];
      for (let key in item) {
        if (key != 'cm_brand' && key != 'cm_factory' && key != 'cm_model' && key != 'cm_model_year' && key != 'cm_displacement') {
          if (tar.cm_pro_column == key) {
            str += tar.cm_pro_name + '：' + item[key] || '';
            if (i != carmodelProperties.length - 1) {
              str += ' ；';
            }
          }
        }
      }
    }
    return str;
  };

  list.forEach(item => {
    let object = {
      std_partsku_id: '',
      oem_partsku_codes: [],
      carmodelList: [],
      oem_partsku_vals: ''
    };

    let oeList = item.oemList ? item.oemList : item.oem_partskus;
    for (let k = 0; k < oeList.length; k++) {
      let itm = oeList[k];
      const { partsku_values, partsku_values_img } = getPartskuValues(fmsCategoryProps, itm);
      object.std_partsku_id = item.std_partsku_id;
      // OE码
      const oem_partsku_codes = itm.oem_partsku_codes || [];
      object.oem_partsku_codes = [...object.oem_partsku_codes, ...oem_partsku_codes];
      
      // 属性
      object.oem_partsku_vals = itm.oem_partsku_vals.map(i => getOEValueFn(i.category_pro_id, i.oem_partsku_value)).join('，');
      object.partsku_values = partsku_values;
      object.partsku_values_img = partsku_values_img;
      // 不匹配标识
      object.matchFlag = item.matchFlag;
      // 适配车型
      for (let i = 0; i < itm.cm_vals.length; i++) {
        let carmodel = {};
        carmodel.std_partsku_id = itm.std_partsku_id;
        let car = itm.cm_vals[i];
        // 品牌
        carmodel.cm_brand = car.cm_brand;
        // 主机厂
        carmodel.cm_factory = car.cm_factory;
        // 车型
        carmodel.cm_model = car.cm_model;
        // 年款
        carmodel.cm_model_year = car.cm_model_year;
        // 排量
        carmodel.cm_displacement = car.cm_displacement;
        // 其他属性
        carmodel.cm_other = getCarmodelValue(car);
        object.carmodelList.push(carmodel);
      }
    }
    res.push(object);
  });
  return res;
}

// 筛选表单 - 格式化Select筛选列表， 所有车型品牌名称
function formatBrandsDropListFn(fmsCarmodelList) {
  /** 
   * [
   *  {cm_brand: '奥迪'},
   *  {oem_partsku_id: 'xxxxxxx'}
   * ]
   */
  let res = [];
  fmsCarmodelList.forEach(element => {
    let oems = element.oemList ? element.oemList : element.oem_partskus;
    oems.forEach(elem => {
      let cmv = elem.cm_vals;
      cmv.forEach(e => {
        if (res.length === 0) {
          res.push({ cm_brand: e.cm_brand, label: e.cm_brand, std_partsku_id: elem.std_partsku_id, oem_partsku_id: e.oem_partsku_id });
        } else {
          let flag = false; // 不存在
          for (let i = 0; i < res.length; i++) {
            if (res[i].cm_brand == e.cm_brand) {
              flag = true;
              break;
            }
          }
          if (!flag) res.push({ cm_brand: e.cm_brand, label: e.cm_brand, std_partsku_id: elem.std_partsku_id, oem_partsku_id: e.oem_partsku_id });
        }
      });
    });
  });
  return res;
};

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