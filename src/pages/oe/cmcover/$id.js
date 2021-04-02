import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Card, Divider, Row, Col, Form, Input, Button, Cascader, Spin } from 'antd';
import { PhotoSwipe } from 'react-photoswipe';
import { isEmpty, getPicSize  } from '@/utils/tools';
import router from 'umi/router';
import OemCoverTableList from './components/OemCoverTableList';
import OemCoverCarmodelsTableList from './components/OemCoverCarmodelsTableList';
import SearchForm from './components/SearchForm';
import SelectOeModal from './components/SelectOeModal';
import NoData from '@/components/NoData';
import styles from './$id.less';
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    xxl: { span: 3 },
    sm: { span: 3 },
  },
  wrapperCol: {
    xxl: { span: 21 },
    sm: { span: 21 },
  },
};

// Cascader搜索过滤
const handleCmFilter = (inputValue, selectedOptions) => {
  return selectedOptions.some(option => {
    const v = option.v || option.label || option.title || '';
    return v.toLowerCase().indexOf(inputValue.toLowerCase().trim()) > -1;
  });
};

class Cmcover extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectOeModalVisible: false,
      cm_ids: [],
      isOpen: false,
      isOpenImg: [],

    };
  }
  componentDidMount() {
    this.fetchCategoryTree()
    this.fetchBrandFacModListApproved()
    const { match = {}, location  } = this.props;
    const { params = {} } = match;
    if(params.id){
    }else{
      this.handleSearch();
    }
    if(location.query.fromPage==="category/brandparts"){
      let {query}=location
      let {category_id}=query
      this.fetchOemCoverFromCategory(category_id)
      // const {FIELDS,OEM_COVER}=this.props
      //   this.fetchOemCoverCarmodels({
      //     params: {
      //       page: 1,
      //       perpage: FIELDS.perpage,
      //       category_id: category_id,
      //       cm_brand_id: OEM_COVER.data.cover_rate_list[0].cm_brand_id
      //     }
      //   });

    }
    const {dispatch}=this.props;
    // 操作日志
    const data={
      record_obj:{
        'operation':'oe/cmcover'
      },
      record_page:'OE管理/车型覆盖',
      record_operations:'查看车型覆盖页面'
    };
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  }

  fetchCategoryTree = async () => {
    await this.props.dispatch({
      type:'oe_cmcover/fetchCategoryTree'
    })
  }
  fetchBrandFacModListApproved = async () => {
    await this.props.dispatch({
      type:'oe_cmcover/fetchBrandFacModListApproved'
    })
  }
  fetchOemCoverFromCategory=(id)=>{
     this.props.dispatch({
      type: 'oe_cmcover/fetchOemCoverFromCategory',
      payload: { category_id:id },
      callback:(list)=>{
        const {FIELDS}=this.props
        this.fetchOemCoverCarmodels({
          params: {
            page: 1,
            perpage: FIELDS.perpage,
            category_id: id,
            cm_brand_id: list.cover_rate_list[0].cm_brand_id
          }
        });
      }
    });
  }
  componentWillUnmount(a) {
    const { match = {}, dispatch } = this.props;
    const { params = {} } = match;
    // 缓存category_id
    dispatch({
      type: 'oe_cmcover/updateCacheCategoryId',
      payload: params.id
    });
    const {history} =this.props
    const routeTo = history.location.pathname;
    if (routeTo.indexOf('/oe/list/') == 0) {

    }else{
      sessionStorage.removeItem('SELECTLIST')
      dispatch({
        type:'oe_cmcover/updateOemCoverCarmodels'
      })
      dispatch({
        type:'oe_cmcover/updateFields'
      })
      dispatch({
        type:'oe_cmcover/updateOemCover'
      })
      dispatch({
        type:'oe_cmcover/updateCarmodelProperties'
      })
      dispatch({
        type:'oe_cmcover/updateCategoryPros'
      })
      dispatch({
        type:'oe_cmcover/updateOemCoverPartskus'
      })
      dispatch({
        type:'oe_cmcover/updateOemCoverPartskusSearch'
      })
    }
  }

  //获取默认选中产品初始值
  getInitialValue = () => {
    const { CATEGORY_TREE , location } = this.props;
    let initValue = [];
    if (CATEGORY_TREE.length > 0) {
      let {query}=location
      let {category_id}=query
      let Fcategory=this.getCategory(category_id)
      if(location.query.fromPage==="category/brandparts"){
        let arr=[Fcategory.category_ids[0],category_id]
        initValue=initValue.concat(arr)
      }else{
        if(sessionStorage.getItem('SELECTLIST')===null){
          return
        }else{
          initValue=initValue.concat(JSON.parse(sessionStorage.getItem('SELECTLIST')));
        }
      }
    }
    return initValue;
  }

  getCategoryId = () => {
    const { match = {}, FIELDS } = this.props;
    const { params = {} } = match;
    return (params.id === '-1' || params.id === 'undefined') ? FIELDS.category_id : params.id;
  }

  // 获取根据category_id获取当前零件
  getCategory = category_id => {
    const { CATEGORY_TREE } = this.props;
    if (category_id === '-1' || !category_id || category_id === 'undefined' || CATEGORY_TREE.length === 0) return [];
    let _cate = null;
    const _loop = children => {
      for (let i = 0; i < children.length; i++) {
        const el = children[i];
        if (el.key === category_id) {
          _cate = el;
        }
        if (!_cate && el.children) {
          _loop(el.children);
        }
      }
      return _cate;
    };
    const currentCate = _loop(CATEGORY_TREE);
    const keys = currentCate.category_parent_path.split(',');
    return {
      category_ids: keys.slice(1),
      category_name: currentCate.title
    };
  }

  fetchData = config => {
    this.props.dispatch(config);
  }

  // 拉取OE&车型品牌覆盖率
  fetchOemCover =  order_flag => {
    const category_id = this.getCategoryId();
    if (category_id === '-1' || !category_id) return null;
    this.fetchData({
      type: 'oe_cmcover/fetchOemCover',
      payload: { category_id, order_flag }
    });
  }

  // 表格change排序事件
  oemCoverTableChange = (pagination, filters, sorter) => {
    // 排序
    if (!isEmpty(sorter)) {
      const { order } = sorter;
      const config = {
        ascend: 'ASC',
        descend: 'DESC'
      };
      this.fetchOemCover(config[order]);
    }
  }

  // 切换产品品类
  handleChangeCategory = async(value, selectedOptions) => {
    const category_id = value.length > 0 ? value[value.length - 1] : '-1';
    sessionStorage.setItem('SELECTLIST',JSON.stringify(value));
    router.replace(`/oe/cmcover/${category_id}`);
    await this.props.dispatch({
      type: 'oe_cmcover/fetchOemCoverChange',
      payload: { category_id:value[1] }
    });
    const {dispatch ,FIELDS , OEM_COVER }=this.props;
    if(!FIELDS.brand_fac_mod || !FIELDS.category_id ||! FIELDS.cm_brand_id&&OEM_COVER.data.length!==0){
      this.fetchOemCoverCarmodels({
        params: {
          page: 1,
          perpage: FIELDS.perpage,
          category_id: value[1],
          cm_brand_id: OEM_COVER.data.cover_rate_list[0].cm_brand_id
        }
      });
    }else{
      this.fetchOemCoverCarmodels({
        params: {
          ...FIELDS,
          page: 1,
          perpage: FIELDS.perpage,
          category_id: value[1],

        }
      });
    }

    // 切换产品品类操作日志
    const data={
      record_obj:{
        'category_id':category_id
      },
      record_page:'OE管理/车型覆盖',
      record_operations:'切换产品品类'
    };
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  }

  // 查询
  handleSearch = () => {
    const { FIELDS, OEM_COVER, form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const { data = {} } = OEM_COVER;
        const { cover_rate_list = {} } = data;
        const category = values.category_id;
        if (isEmpty(category)) return false;
        let params = {
          ...values,
          category_id: category[category.length - 1],
          page: 1,
          perpage: FIELDS.perpage,
        };

        if (values.brand_fac_mod && values.brand_fac_mod.length > 0) {
          for (let i = 0; i < cover_rate_list.length; i++) {
            const cm = cover_rate_list[i];
            if (cm.cm_brand === values.brand_fac_mod[0]) {
              params.cm_brand_id = cm.cm_brand_id;
              break;
            }
          }
        }
        this.fetchOemCoverCarmodels({ params });
      }
    });
    const {dispatch}=this.props;
    const data={
      record_obj:{
        'category_id':this.props.match.params.id
      },
      record_page:'OE管理/车型覆盖',
      record_operations:'查询车型属性'
    };
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  }

  // OE覆盖车型列表
  fetchOemCoverCarmodels = values => {
    this.fetchData({
      type: 'oe_cmcover/fetchOemCoverCarmodels',
      payload: values
    });
  }

  // 分页设置
  handlePageSizeChange = (current, perpage) => {
    this.fetchOemCoverCarmodels({
      params: {
        ...this.props.FIELDS,
        perpage,
        page: 1
      }
    });
  };

  handlePageChange = page => {
    this.fetchOemCoverCarmodels({
      params: {
        ...this.props.FIELDS,
        page
      }
    });
  }

  // 选择汽车品牌
  handleChangeCmBrand = cm => {
    const { FIELDS, form } = this.props;
    const { getFieldValue, resetFields } = form;
    // 先清空表单
    resetFields();
    // 获取OE覆盖车型列表， 需要构造brand_fac_mod的初始化显示
    const category = getFieldValue('category_id');
    if (isEmpty(category)) return false;
    this.fetchOemCoverCarmodels({
      currentCmBrand: cm,
      params: {
        page: 1,
        perpage: FIELDS.perpage,
        category_id: category[category.length - 1],
        cm_brand_id: cm.cm_brand_id,
        brand_fac_mod: [cm.cm_brand]
      }
    });
  }

  showSelectOeModal = rows => {
    const { cm_ids, oem_partsku_ids } = rows;
    // 初始化车型匹配OE列表
    if (oem_partsku_ids.length > 0) {
      const category_id = this.getCategoryId();
      this.fetchData({
        type: 'oe_cmcover/fetchOemCoverPartskus',
        payload: {
          category_id,
          oem_partsku_ids: oem_partsku_ids.join(',')
        }
      });
    }
    // 缓存当前选择品牌
    this.fetchData({
      type: 'oe_cmcover/updateCurrentCmBrand',
      payload: { cm_brand: rows.cm_brand, cm_brand_id: rows.cm_brand_id }
    });

    // 显示模态框以及缓存当前cm_ids
    this.setState({
      cm_ids,
      selectOeModalVisible: true
    });
  }

  hideSelectOeModal = () => {
    // 清空待匹配OE产品
    this.fetchData({
      type: 'oe_cmcover/updateOemCoverPartskusSearch'
    });
    // 清空已匹配OE产品
    this.fetchData({
      type: 'oe_cmcover/updateOemCoverPartskus'
    });
    this.setState({
      selectOeModalVisible: false,
      cm_ids: []
    });
  }

  // 编码关键字搜索OE配件
  fetchOemCoverPartskusSearch = code_keyword => {
    const { CURRENT_CM_BRAND } = this.props;
    const category_id = this.getCategoryId();
    this.fetchData({
      type: 'oe_cmcover/fetchOemCoverPartskusSearch',
      payload: { category_id, code_keyword, cm_brand_id: CURRENT_CM_BRAND.cm_brand_id }
    });
  }

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

  handleRemoveList = row => {
    const { OEM_COVER_PARTSKUS } = this.props;
    // 从已匹配OE产品移除当前数据
    this.fetchData({
      type: 'oe_cmcover/updateOemCoverPartskus',
      payload: OEM_COVER_PARTSKUS.filter(v => v.oem_partsku_id !== row.oem_partsku_id)
    });
  }

  handleAddList = row => {
    const { OEM_COVER_PARTSKUS, OEM_COVER_PARTSKUS_SEARCH } = this.props;
    // 从待匹配OE产品移除当前数据
    this.fetchData({
      type: 'oe_cmcover/updateOemCoverPartskusSearch',
      payload: OEM_COVER_PARTSKUS_SEARCH.filter(v => v.oem_partsku_id !== row.oem_partsku_id)
    });
    // 添加当前数据到已匹配OE产品
    this.fetchData({
      type: 'oe_cmcover/updateOemCoverPartskus',
      payload: [row, ...OEM_COVER_PARTSKUS]
    });
  }

  // 修改车型关联OE
  fetchOemCoverPartskusPost = () => {
    const { OEM_COVER_PARTSKUS, CURRENT_CM_BRAND } = this.props;
    const payload = {
      category_id: this.getCategoryId(),
      cm_brand_id: CURRENT_CM_BRAND.cm_brand_id,
      cm_ids: this.state.cm_ids,
      oem_partsku_ids: OEM_COVER_PARTSKUS.reduce((init, v) => init.concat(v.oem_partsku_id), [])
    };

    this.fetchData({
      type: 'oe_cmcover/fetchOemCoverPartskusPost',
      payload,
      callback: () => {
        // 重新拉取 OE覆盖车型列表
        this.fetchOemCoverCarmodels({params:{...this.props.FIELDS}});
        // 隐藏模态框
        this.hideSelectOeModal();
      }
    });
  }

  render() {
    const { form, loading, CATEGORY_TREE, OEM_COVER, OEM_COVER_PARTSKUS, OEM_COVER_PARTSKUS_SEARCH, FIELDS } = this.props;
    const { selectOeModalVisible, isOpen, isOpenImg } = this.state;
    const { cover_rate_list, oem_cover_rate } = OEM_COVER.data;
    const { category_id } = FIELDS;
    const category = this.getCategory(category_id);
    const isLoading = loading['oe_cmcover/fetchOemCoverCarmodels'] || loading['oe_cmcover/fetchCarmodelProperties'] || loading['oe_cmcover/fetchOemCover']  || loading['oe_cmcover/fetchOemCoverFromCategory'] || loading['oe_cmcover/fetchOemCoverChange'] || loading['oe_cmcover/fetchBrandFacModListApproved'];
    const { getFieldDecorator } = form;
    const OemCoverTableListProps = {
      data: OEM_COVER.data,
      isDataLoading: loading['oe_cmcover/fetchOemCover'],
      onChangeCmBrand: this.handleChangeCmBrand,
      onTableChange: this.oemCoverTableChange
    };
    const searchFormProps = {
      ...this.props,
      oem_cover_rate,
      cover_rate_list,
      onSearch: this.handleSearch
    };
    const OemCoverCarmodelsTableListProps = {
      ...this.props,
      isDataLoading: isLoading,
      onHandlePageSizeChange: this.handlePageSizeChange,
      onHandlePageChange: this.handlePageChange,
      onShowSelectOeModal: this.showSelectOeModal
    };
    const modalProps = {
      title: '选择OE产品',
      visible: selectOeModalVisible,
      maskClosable: false,
      keyboard: false,
      destroyOnClose: true,
      width: 1200,
      style: { top: 30 },
      footer: null,
      onCancel: this.hideSelectOeModal
    };
    const selectOeModalProps = {
      loading,
      category,
      OEM_COVER_PARTSKUS,
      OEM_COVER_PARTSKUS_SEARCH,
      onHideSelectOeModal: this.hideSelectOeModal,
      onFetchOemCoverPartskusSearch: this.fetchOemCoverPartskusSearch,
      onPreviewImage: this.handlePreviewImage,
      onAdd: this.handleAddList,
      onRemove: this.handleRemoveList,
      onSave: this.fetchOemCoverPartskusPost
    };
    const displayRender = (labels, selectedOptions) => labels.map((label, i) => {
      // const option = selectedOptions[i];
      return i === labels.length - 1 ? label : '';
    });
    return (
      <Card>
        {/* 查询表单 */}
        <Form autoComplete="off">
          <Row gutter={16}>
            <Col xxl={6} md={8}>
              <FormItem label="产品" {...formItemLayout} style={{ marginBottom: 13 }}>
                {getFieldDecorator('category_id', {
                  // initialValue: category.category_ids
                  initialValue: this.getInitialValue()
                })(
                  <Cascader
                    allowClear={false}
                    displayRender={displayRender}
                    fieldNames={{ label: 'title', value: 'key', children: 'children' }}
                    options={CATEGORY_TREE}
                    placeholder='请选择'
                    showSearch={{ filter: handleCmFilter, matchInputWidth: true, limit: false }}
                    onChange={this.handleChangeCategory}
                  />
                )}
              </FormItem>
              <OemCoverTableList {...OemCoverTableListProps} />

            </Col>
            <Col xxl={18} md={16}>
              <div className={styles.oem_cover_rate}>
                {!isEmpty(oem_cover_rate) ? <><span className="c9">OE车型覆盖率：</span><strong className="red5">{`${oem_cover_rate}%`}</strong></> : <span>&nbsp;</span>}
              </div>
              <Card bodyStyle={{ padding: 0, minHeight: 357 }}>
                {
                  isLoading && <div className={styles.spin_content}>
                    <Spin />
                  </div>
                }
                {
                  !isEmpty(oem_cover_rate) && <SearchForm {...searchFormProps} />
                }
                {
                  isEmpty(oem_cover_rate) && <NoData style={{ marginTop: 170 }} title="请选择汽车品牌" />
                }
              </Card>
            </Col>
          </Row>
        </Form>
        {/* 车型覆盖OE列表 */}
        <Divider style={{ marginTop: 10, marginBottom: 10 }} />
        <Row type="flex" justify="space-between">
          <Col>车型匹配OE产品列表</Col>
        </Row>
        <OemCoverCarmodelsTableList {...OemCoverCarmodelsTableListProps} />

        {/* 选择OE产品模态框 */}
        <Modal {...modalProps} >
          <SelectOeModal {...selectOeModalProps} />
        </Modal>

        {/* 图片预览 */}
        <PhotoSwipe isOpen={isOpen} items={isOpenImg} onClose={this.handleCloseImage} />
      </Card>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.global,
  ...state.oe_cmcover
});
const CmcoverForm = Form.create()(Cmcover);
export default connect(mapStateToProps)(CmcoverForm);
