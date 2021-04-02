import React, { Component } from 'react';
import router from 'umi/router';
import { connect } from 'dva';
import { Modal, Tabs, Spin, message } from 'antd';
import { PhotoSwipe } from 'react-photoswipe';
import { isEmpty, clearState, dataURLtoFile, getPicSize, loadingAllDescImgs, getOriginalImgDesc } from '@/utils/tools';
import IdPartInfo from './components/IdPartInfo';
import IdMergeSplit from './components/IdMergeSplit';
import FeedbackModal from './components/FeedbackModal';
import SaveButton from './components/SaveButton';
import styles from './$id.less';
import ENV from '@/utils/env';
import qs from 'querystringify';
// 转换html为图片
import domtoimage from 'dom-to-image';
const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;
let timer = null;

class $id extends Component {
  state = {
    tabsActiveKey: 'part_info', // tab状态
    isOpen: false, // 合并拆分图片预览
    isOpenImg: [],
    feedbackModalVisible: false,
    feedbackModal_oem_partsku_id: null
  };

  componentDidMount = () => {
    this.initScroll();
    const {dispatch} = this.props;
    const data={
      record_obj:{
        'category_id':this.props.match.params.id,

      },
      record_page:' 标准码管理/标准码列表',
      record_operations:'编辑标准码'
    };
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  }

  componentDidUpdate(prevProps, prevState) {

  }

  componentWillUnmount() {
    const { dispatch, location, history } = this.props;
    if (location.pathname !== history.location.pathname) {
      // 离开页面清空当前页面缓存数据
      clearState(dispatch, 'std_sku_id');
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

  // Tabs切换
  handleTabsChange = active => {
    // 改变当前tab状态
    this.setState({
      tabsActiveKey: active
    });

    // 合并拆分初始化
    if (active === 'merge_split') {
      this.handleMergeSplitInit();
    }

  };

  // 合并拆分初始化
  handleMergeSplitInit = () => {
    // 获取标准码对应的oe信息
    this.handleFetchStdskuOe();
    // 获取合并标准码列表
    this.handleFetchStdskuMatch();
  };

  /** 上传图片 */

  // 上传图片
  handleUploadPic = (file) => {
    const { STD_SKU_ID_FIELDS, dispatch } = this.props;
    const { category_id } = STD_SKU_ID_FIELDS;
    // 上传图片
    dispatch({
      type: 'std_sku_id/fetchImageUpload',
      payload: { file, category_id }
    });
  };

  // 更新图片
  handleUpdatePic = imgs => {
    const { dispatch } = this.props;
    dispatch({
      type: 'std_sku_id/updatePartPicList',
      payload: imgs
    });
  };

  // 上传属性图片
  handleUploadPropPic = (part_prop, file, callback) => {
    const { STD_SKU_ID_FIELDS, dispatch } = this.props;
    const { category_id } = STD_SKU_ID_FIELDS;
    // 上传图片
    dispatch({
      type: 'std_sku_id/fetchPropImageUpload',
      payload: { ...part_prop, file, category_id },
      callback
    });
  };

  // 更新属性图片
  handleUpdatePropPic = (part_prop, imgs) => {
    const { STDSKU_INFO, dispatch } = this.props;
    const { partsku_val_imgs } = STDSKU_INFO.data;
    dispatch({
      type: 'std_sku_id/updateStdskuInfo',
      payload: {
        ...STDSKU_INFO,
        data: {
          ...STDSKU_INFO.data,
          partsku_val_imgs: partsku_val_imgs.map(v => {
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
    dispatch({ type: 'std_sku_id/updateEditorState', payload: { ...EDITOR_STATE, data: editorState, html: editorStateHtml } });
  };

  handleEditorUpload = (info, uploadParam) => {
    const { dispatch } = this.props;
    return dispatch({ type: 'std_sku_id/fetchEditorUpload', payload: info });
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

  // 产品信息保存
  handleSubmit = type => {
    const { location, dispatch, STDSKU_INFO, EDITOR_STATE, PART_PIC_LIST } = this.props;
    const { data = {} } = STDSKU_INFO;
    const { partsku_vals = [], partsku_val_imgs = [], category_type } = data;
    const { validateFields } = this.infoForm;
    const { query } = location;
    const { std_partsku_id } = query;
    validateFields(async (err, values) => {
      if (!err) {

        let payload = {
          std_partsku_id,
          std_partsku_values: partsku_vals.map(v => ({ category_pro_id: v.category_pro_id, std_partsku_value: values[v.category_pro_id] })).filter(v => !isEmpty(v.std_partsku_value)),
          std_partsku_prices: isEmpty(values.std_partsku_price) ? [] : [values.std_partsku_price],
          partsku_imgs: PART_PIC_LIST.map(v => v.std_partsku_image_id)
        };

        // 产品说明
        const regexp = new RegExp(ENV.imgDomain, 'g');
        const std_partsku_desc = EDITOR_STATE.html.replace(regexp, '');
        if(!isEmpty(std_partsku_desc)) {
          payload.std_partsku_desc = std_partsku_desc;
          payload.partsku_desc_imgs = [];
          if(EDITOR_STATE.data.entityMap) {
            // 保存过的img数据
            for (const key in EDITOR_STATE.data.entityMap) {
              const url = EDITOR_STATE.data.entityMap[key].data.url;
              const match = url.match(/http.*\?(.*)/);
              if(match && match[1]) {
                const parse = qs.parse(match[1]);
                if(parse.std_partsku_image_id) {
                  payload.partsku_desc_imgs.push(parse.std_partsku_image_id);
                }
              }
            }
          }
          if(payload.partsku_desc_imgs.length === 0) {
            // 没保存过的默认img数据
            payload.partsku_desc_imgs = EDITOR_STATE.imgs.map(v => v.std_partsku_image_id);
          }
        }

        // 产品属性图片
        let _partsku_val_imgs = [];
        for (let i = 0; i < partsku_val_imgs.length; i++) {
          const catePro = partsku_val_imgs[i];
          for (let j = 0; j < catePro.partsku_value_imgs.length; j++) {
            const partsku_value = catePro.partsku_value_imgs[j];
            if(partsku_value.url) {
              const { std_partsku_image_id } = partsku_value;
              _partsku_val_imgs.push({
                category_pro_id: catePro.category_pro_id, std_partsku_image_id, std_partsku_image_index: j
              });
            }
          }
        }

        if(_partsku_val_imgs.length > 0) {
          payload.partsku_val_imgs = _partsku_val_imgs;
        }

        // 生成长图
        if (category_type === 'GUIDE' && !isEmpty(EDITOR_STATE.html)) {
          let tenPartskuDescImg = document.createElement('div');
          tenPartskuDescImg.id = 'tenPartskuDescImg';
          tenPartskuDescImg.innerHTML = getOriginalImgDesc(EDITOR_STATE.html, '/std/partsku/');
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
                  type: 'std_sku_id/fetchPartskuDescUpload',
                  payload: { file }
                });
                if (res.code === 0) {
                  // 配件说明长图
                  payload.std_partsku_desc_img = res.data.std_partsku_image_url;
                }
              });
          }
          catch (err) {
            // 移除临时节点
            document.body.removeChild(el);
          }
        }

        // 标准码信息更新
        dispatch({
          type: 'std_sku_id/fetchStdskuUpdate',
          payload,
          callback: router.goBack
        });
      }
    });
    const data1={
      record_obj:{
        'operation':'保存标准码',
        'category_id':this.props.match.params.id
      },
      record_page:' 标准码管理/标准码列表',
      record_operations:'保存标准码'
    };
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data1
    });
  };

  // 跳转OE详情页
  handleRouteToOe = oem_partsku_id => {
    router.replace('/oe/list/' + oem_partsku_id + '?oem_partsku_id=' + oem_partsku_id);
  }
  // 跳转到标准码详情页
  handleRouteToStdSku = std_partsku_id => {
    const { dispatch } = this.props;
    // 当前页面跳转，接口必须重新拉取，否则不刷新数据
    router.replace('/standardcode/list/' + std_partsku_id + '?std_partsku_id=' + std_partsku_id);
    // 重新标准码所覆盖OE码
    dispatch({
      type: 'std_sku_id/fetchStdskuOe',
      payload: { std_partsku_id },
      isForce: true
    });
    // 获取合并标准码列表
    dispatch({
      type: 'std_sku_id/fetchStdskuMatch',
      payload: { std_partsku_id, type: 'COMMON' }
    });

  }

  //标准码所覆盖OE码
  handleFetchStdskuOe = isForce => {
    const { location, dispatch } = this.props;
    const { query } = location;
    const { std_partsku_id } = query;
    dispatch({
      type: 'std_sku_id/fetchStdskuOe',
      payload: { std_partsku_id },
      isForce
    });
  }

  //获取合并标准码列表
  handleFetchStdskuMatch = value => {
    const { location, dispatch } = this.props;
    const { query } = location;
    const { std_partsku_id } = query;
    let payload = { std_partsku_id };
    // 通用指数(COMMON),自定义筛选(CUSTOM,如果是自定义一定要传oe码或者std码),
    if (isEmpty(value)) {
      // 默认通用指数查询
      payload.type = 'COMMON';
    } else {
      const { type, code_type, code, std_match_status } = value;
      payload.type = type;
      // 自定义筛选
      if (!isEmpty(code_type)) {
        payload[code_type] = code;
      }
      // 代用状态
      if (type === 'MATCH') {
        payload.std_match_status = std_match_status;
      }
    }
    // 获取合并标准码列表
    dispatch({
      type: 'std_sku_id/fetchStdskuMatch',
      payload
    });

  }

  // 更新oe属性为标准码属性
  handleFetchStdskuOesku = (stdsku_oesku_types, oeSelectedRows, callback) => {
    const { location, dispatch } = this.props;
    const { query } = location;
    const { std_partsku_id } = query;
    const payload = {
      std_partsku_id,
      oem_partsku_ids: oeSelectedRows.reduce((init, v) => init.concat(v.oem_partsku_id), []),
      copy_pros: stdsku_oesku_types.includes('copy_pros') ? 'YES' : 'NO',
      copy_images: stdsku_oesku_types.includes('copy_images') ? 'YES' : 'NO',
    };
    dispatch({
      type: 'std_sku_id/fetchStdskuOesku',
      payload,
      callback
    });
    const data={
      record_obj:{
        'operation':'更新oe属性为标准码属性',

      },
      record_page:'  标准码管理/ 标准码列表/标准码编辑',
      record_operations:'更新oe属性为标准码属性'
    };
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  }

  // 获取标准码信息
  handleFetchStdskuInfo = isForce => {
    const { location, dispatch } = this.props;
    const { query } = location;
    const { std_partsku_id } = query;
    dispatch({
      type: 'std_sku_id/fetchStdskuInfo',
      payload: { std_partsku_id },
      isForce
    });
  }

  // 更新标准码属性为oe属性
  handleFetchOeskuStdsku = (oesku_stdsku_types, oeSelectedRows, callback) => {
    const { location, dispatch } = this.props;
    const { query } = location;
    const { std_partsku_id } = query;
    const payload = {
      std_partsku_id,
      oem_partsku_id: oeSelectedRows[0].oem_partsku_id,
      copy_pros: oesku_stdsku_types.includes('copy_pros') ? 'YES' : 'NO',
      copy_images: oesku_stdsku_types.includes('copy_images') ? 'YES' : 'NO',
    };
    dispatch({
      type: 'std_sku_id/fetchOeskuStdsku',
      payload,
      callback
    });

  }

  // 标准码和oe拆分
  handleFetchStdsSkuOeSplit = (stdsku_oe_split_type, oeSelectedRows, callback) => {
    const { location, dispatch } = this.props;
    const { query } = location;
    const { std_partsku_id } = query;
    const payload = {
      std_partsku_id,
      oem_partsku_ids: oeSelectedRows.reduce((init, v) => init.concat(v.oem_partsku_id), []),
      type: stdsku_oe_split_type
    };
    dispatch({
      type: 'std_sku_id/fetchStdsSkuOeSplit',
      payload,
      callback
    });
    const data={
      record_obj:{
        'operation':'标准码和oe拆分',

      },
      record_page:'  标准码管理/ 标准码列表/标准码编辑',
      record_operations:'标准码和oe拆分'
    };
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  }

  // 标准码合并
  handleFetchStdskuMerge = (stdSelectedRows, callback) => {
    const { location, dispatch } = this.props;
    const { query } = location;
    const { std_partsku_id } = query;
    confirm({
      title: '合并后不可恢复，是否确定？',
      okText: '确认',
      cancelText: '取消',
      content: '',
      closable: true,
      onOk: () => {
        const data={
          record_obj:{
            'operation':'标准码合并',

          },
          record_page:'  标准码管理/ 标准码列表/标准码编辑',
          record_operations:'标准码合并'
        };
        dispatch({
          type:'managerRecord/fetchUserRecorListInsert',
          data:data
        });
        dispatch({
          type: 'std_sku_id/fetchStdskuMerge',
          payload: {
            std_partsku_id,
            merge_std_partsku_ids: stdSelectedRows.map(v => v.std_partsku_id)
          },
          callback: () => {
            callback();
            // 重置列表数据缓存.保证返回页面获取最新数据
            dispatch({
              type: 'std_sku_list/updateCachedIndexFlag',
              payload: false
            });
          }
        });
      },
      onCancel: () => { }
    });
  }

  //设置代用状态
  handleFetchStdskuMatchPost = (stdSelectedRows, fields, callback) => {
    const { dispatch, location } = this.props;
    const { query } = location;
    const { std_partsku_id } = query;
    confirm({
      title: '确认要执行此操作吗？',
      content: '确认后不可修改，是否继续？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        dispatch({
          type: 'std_sku_id/fetchStdskuMatchPost',
          payload: {
            std_match_ids: stdSelectedRows.map(v => v.std_match_id).filter(v => !isEmpty(v)), // 可选	array匹配id 有就都把id传过来,没有就传空数组
            std_partsku_id, //当前的标准码id
            std_partsku_matchs: stdSelectedRows.map(v => ({ std_partsku_id: v.std_partsku_id, std_match_number: isEmpty(v.std_match_number) ? 0 : v.std_match_number })), //array	勾选需要标准码数组
            std_match_status: fields.std_match_status,	// string	通用状态 RECOMMEND：推荐，NORECOMMEND：不推荐
            std_match_desc: fields.std_match_desc // 可选	string	描述信息
          },
          callback
        });
      }
    });

  }

  // 显示标准码所覆盖OE码商户反馈模态框
  showFeedbackModal = record => {
    const { oem_partsku_id } = record;
    if (!isEmpty(oem_partsku_id)) {
      this.setState({
        feedbackModalVisible: true,
        feedbackModal_oem_partsku_id: oem_partsku_id
      });
      // 获取商户反馈不匹配OE产品信息
      this.fetchOemSkuUnmatch(oem_partsku_id);
    }
  };

  // 隐藏标准码所覆盖OE码商户反馈模态框
  hideFeedbackModal = () => {
    this.setState({
      feedbackModalVisible: false,
      feedbackModal_oem_partsku_id: null
    });
  };

  // 获取商户反馈不匹配OE产品信息
  fetchOemSkuUnmatch = oem_partsku_id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'std_sku_id/fetchOemSkuUnmatch',
      payload: { oem_partsku_id }
    });
  };

  // 商户反馈 - 确认已查看
  handleFeedbackModalOk = () => {
    const { dispatch } = this.props;
    const { feedbackModal_oem_partsku_id } = this.state;
    confirm({
      title: '确认后无法恢复，确认已查看了吗？',
      okText: '确认',
      cancelText: '取消',
      content: '',
      closable: true,
      onOk: () => {
        dispatch({
          type: 'std_sku_id/fetchOemskuFilterHandled',
          payload: {
            oem_partsku_id: feedbackModal_oem_partsku_id
          },
          callback: this.hideFeedbackModal
        });
      }
    });
  }

  render() {
    const { loading, EDITOR_STATE, PART_PIC_LIST, OEMSKU_INFO, OEMSKU_CARMODEL, OEMSKU_FILTER, CATEGORIES_FORBID } = this.props;
    const { tabsActiveKey, isOpen, isOpenImg, feedbackModalVisible } = this.state;
    // const category_forbid_content = CATEGORIES_FORBID.filter(v => v.category_type_forbid_type === 'CONTENT');
    // const category_type_forbids = category_forbid_content.map(v => v.category_type_forbid_obj);
    const idMergeSplitProps = {
      ...this.props,
      onPreviewImage: this.handlePreviewImage,
      onRouteToOe: this.handleRouteToOe,
      onRouteToStdSku: this.handleRouteToStdSku,
      onFetchStdskuMatch: this.handleFetchStdskuMatch,
      onFetchStdskuOe: this.handleFetchStdskuOe,
      onFetchStdskuOesku: this.handleFetchStdskuOesku,
      onFetchOeskuStdsku: this.handleFetchOeskuStdsku,
      onFetchStdsSkuOeSplit: this.handleFetchStdsSkuOeSplit,
      onFetchStdskuInfo: this.handleFetchStdskuInfo,
      onFetchStdskuMerge: this.handleFetchStdskuMerge,
      onFetchStdskuMatchPost: this.handleFetchStdskuMatchPost,
      onShowFeedbackModal: this.showFeedbackModal
    };
    const modalProps = {
      title: 'OE码不适配反馈',
      visible: feedbackModalVisible,
      width: 1200,
      style: { top: 15 },
      bodyStyle: { height: '75vh', overflowY: 'auto', paddingTop: 5 },
      destroyOnClose: true,
      okText: '确认已查看',
      cancelText: '取消',
      onCancel: this.hideFeedbackModal,
      onOk: this.handleFeedbackModalOk
    };
    const partInfoProps = {
      ...this.props,
      partsku_imgs: PART_PIC_LIST.filter(v => v.url),
      original_img_desc: getOriginalImgDesc(EDITOR_STATE.html, '/std/partsku/'),
      // category_type_forbids,
      onUploadPic: this.handleUploadPic,
      onUpdatePic: this.handleUpdatePic,
      onUpdatePropPic: this.handleUpdatePropPic,
      onUploadPropPic: this.handleUploadPropPic,
      onEditorChange: this.handleEditorChange,
      onEditorUpload: this.handleEditorUpload
    };
    const isPageLoading = loading['std_sku_id/fetchStdskuUpdate'] || loading['std_sku_id/fetchPartskuDescUpload'];
    return (
      <Spin spinning={!!isPageLoading}>
        <Tabs animated={false} activeKey={tabsActiveKey} tabBarStyle={{ marginBottom: 0 }} onChange={this.handleTabsChange}>
          <TabPane tab='产品信息' key='part_info'>
            <IdPartInfo {...partInfoProps} ref={el => this.infoForm = el} />
          </TabPane>
          <TabPane tab='合并拆分' key='merge_split'>
            <IdMergeSplit {...idMergeSplitProps} />
          </TabPane>

        </Tabs>
        {/* 保存按钮 */}
        {tabsActiveKey === 'part_info' && <SaveButton onSubmit={this.handleSubmit} />}
        {/* 图片预览 正式使用时合并PartPic的图片预览 */}
        <PhotoSwipe isOpen={isOpen} items={isOpenImg} onClose={this.handleCloseImage} />
        {/* 标准码所覆盖OE码商户反馈模态框 */}
        <Modal {...modalProps}>
          <FeedbackModal isLoading={loading['std_sku_id/fetchOemSkuUnmatch']} OEMSKU_INFO={OEMSKU_INFO} OEMSKU_CARMODEL={OEMSKU_CARMODEL} OEMSKU_FILTER={OEMSKU_FILTER} />
        </Modal>
      </Spin>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.std_sku_id
});
export default connect(mapStateToProps)($id);
