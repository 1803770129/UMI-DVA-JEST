import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Button, Divider, Modal, message } from 'antd';
import IndexSearchForm from './components/IndexSearchForm';
import IndexTableList from './components/IndexTableList';
import router from 'umi/router';
import { clearState } from '@/utils/tools';
import msg from '@/utils/msg';
const confirm = Modal.confirm;

class FmsParts extends Component {
  state = {
    category_id: '',
    fms_brand_id: '',
    fms_category_id: '',
    fms_part_id: '',
    selectedPartsRowKeys: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'fms_parts_list/pageInit',
    });
    const data={
      record_obj:{
        'operation':'进入大厂码管理/产品管理'
      },
      record_page:' 大厂码管理/产品管理',
      record_operations:'大厂产品管理页面'
    };
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });

  }

  componentWillUnmount(a) {
    const { dispatch } = this.props;
    // 清空缓存数据
    if(!window.location.hash.includes('/factorycode/part')) {
      // clearState(dispatch, 'fms_parts_list');
    }
  }

  // 获取产品列表数据
  fetchFmsPartskus = params => this.props.dispatch({ type: 'fms_parts_list/fetchFmsPartskus', payload: params });

  // 点击查询，获取产品列表数据
  handleSubmit = values => {
    const { FIELDS } = this.props;
    let params = {
      ...FIELDS,
      fms_category_id: FIELDS.fms_category_id,
      fms_brand_id: values.fms_brand_id,
      fms_part_id: values.fms_part_id,
      fms_partsku_code: values.fms_partsku_code,
      oem_partsku_code: values.oem_partsku_code,
      exception_status: values.exception_status,
      page: 1,
    };

    this.fetchFmsPartskus(params);
    const { dispatch } = this.props;
    const data={
      record_obj:params,
      record_page:' 大厂码管理/产品管理',
      record_operations:'搜索大厂产品管理页面'
    };
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  };

  // 调整每页显示数量函数
  handlePageSizeChange = (current, perpage) => {
    let params = {
      ...this.props.FIELDS,
      page: 1,
      perpage,
    };
    this.fetchFmsPartskus(params);
  };

  // 切换页面函数
  handlePageChange = page => {
    let params = {
      ...this.props.FIELDS,
      page,
    };
    this.fetchFmsPartskus(params);
  };

  // 切换启用状态
  onChangePartStatusFn = (fms_partsku_id, checked) => {
    this.props.dispatch({
      type: 'fms_parts_list/fetchFmsStatusUpdate',
      payload: {
        fms_partsku_id: fms_partsku_id,
        fms_partsku_status: checked ? 'ENABLE' : 'DISABLE',
      },
    });
    const data={
      record_obj:{
        'fms_partsku_id': fms_partsku_id,
        'fms_partsku_status': checked ? 'ENABLE' : 'DISABLE',
      },
      record_page:' 大厂码管理/产品管理',
      record_operations:'切换启用状态'
    };
    const {dispatch}=this.props;
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  };

  // 点击跳转到编辑页
  // type：add、edit
  onGoFmsPartEditFn = (category_id, fms_brand_id, fms_category_id, fms_partsku_id, fms_part_id) => {
    const { getFieldValue } = this.searchForm.props.form;
    router.push({
      pathname: 'part/' + category_id,
      query: { category_id, brand_category_id: getFieldValue('brand_category_id'), fms_brand_id, fms_category_id, fms_partsku_id, fms_part_id },
    });
    const data={
      record_obj:{
        'category_id':category_id
      },
      record_page:' 大厂码管理/产品管理',
      record_operations:'编辑产品'
    };
    const {dispatch}=this.props;
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  };

  // 点击跳转到创建页
  onGoFmsPartAddFn = () => {
    const { FIELDS, FMS_PARTS } = this.props;
    const { categorys } = FMS_PARTS;
    const { fms_brand_id, fms_category_id, fms_part_id } = FIELDS;
    const find = categorys.find( v => v.fms_part_id === fms_part_id ) || {};
    // 创建
    router.push({
      pathname: 'part/-1',
      query: { category_id: find.category_id, fms_brand_id, fms_category_id, fms_part_id },
    });
    const data={
      record_obj:{
        'operation':'点击创建，创建产品'
      },
      record_page:' 大厂码管理/产品管理',
      record_operations:'创建产品'
    };
    const {dispatch}=this.props;
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  };

  // 勾选产品的值
  onSelectedPartsRowKeysFn = selectedRowKeys => {
    this.setState({ selectedPartsRowKeys: selectedRowKeys });
  };

  // 批量删除配件
  handleDeleteFmsPartFn = () => {
    const { selectedPartsRowKeys } = this.state;
    if (selectedPartsRowKeys.length === 0) return;
    confirm({
      title: '删除后不可恢复，确定删除所选择的配件？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const data={
          record_obj:{
            'fms_partsku_ids': selectedPartsRowKeys
          },
          record_page:' 大厂码管理/产品管理',
          record_operations:'批量删除大厂产品'
        };
        const {dispatch}=this.props;
        dispatch({
          type:'managerRecord/fetchUserRecorListInsert',
          data:data
        });
        this.props.dispatch({
          type: 'fms_parts_list/delFmsPart',
          payload: { fms_partsku_ids: selectedPartsRowKeys },
          cb: () => this.onSelectedPartsRowKeysFn([]), // 清空勾选项
        });
      },
    });
  };

  // select选择
  handleChangeSelect = async (key, value) => {
    const { dispatch, FIELDS } = this.props;
    const { setFieldsValue, getFieldValue } = this.searchForm.props.form;
    const fields = { perpage: FIELDS.perpage, page: 1 };
    let fms_brand_id, fms_part_id, fms_category_id, brand_category_id;
    switch (key) {
      case 'brand_category_id':
        brand_category_id = value;
        await dispatch({
          type: 'fms_parts_list/fetchFmsBrands',
          payload: { brand_category_id },
        });
        const { FMS_BRANDS } = this.props;
        if (FMS_BRANDS.length > 0) {
          fms_brand_id = FMS_BRANDS[0].fms_brand_id;
          await dispatch({
            type: 'fms_parts_list/fetchFmsParts',
            payload: {
              brand_category_id,
              fms_brand_id,
            },
          });
          const { FMS_PARTS } = this.props;
          const { categorys, BrandIds } = FMS_PARTS;
          if (categorys.length > 0 && BrandIds.length > 0) {
            fms_part_id = categorys[0].fms_part_id;
            fms_category_id = BrandIds[0].fms_category_id;
            this.fetchFmsPartskus({ ...fields, brand_category_id, fms_brand_id, fms_part_id, fms_category_id });
          } else {
            // 清空产品数据
            dispatch({
              type: 'fms_parts_list/updateFmsPartskus',
            });
            dispatch({
              type: 'fms_parts_list/updateFields',
              payload: { ...FIELDS, brand_category_id, fms_category_id, fms_brand_id, fms_part_id}
            });
          }
        } else {
          // 清空产品数据
          dispatch({
            type: 'fms_parts_list/updateFmsPartskus',
          });
          dispatch({
            type: 'fms_parts_list/updateFields',
            payload: { ...FIELDS, brand_category_id, fms_category_id, fms_brand_id, fms_part_id}
          });
        }
        setFieldsValue({
          fms_brand_id,
          fms_part_id,
        });
        break;
      case 'fms_brand_id':
        brand_category_id = getFieldValue('brand_category_id');
        await dispatch({
          type: 'fms_parts_list/fetchFmsParts',
          payload: {
            brand_category_id,
            fms_brand_id: value,
          },
        });
        const { FMS_PARTS } = this.props;
        const { categorys, BrandIds } = FMS_PARTS;
        if (categorys.length > 0 && BrandIds.length > 0) {
          fms_part_id = categorys[0].fms_part_id;
          fms_category_id = BrandIds[0].fms_category_id;
          this.fetchFmsPartskus({ ...fields, brand_category_id, fms_brand_id: value, fms_part_id, fms_category_id });
        } else {
          // 清空产品数据
          dispatch({
            type: 'fms_parts_list/updateFmsPartskus',
          });
          dispatch({
            type: 'fms_parts_list/updateFields',
            payload: { ...FIELDS, brand_category_id, fms_category_id, fms_brand_id, fms_part_id}
          });
        }
        setFieldsValue({
          fms_part_id,
        });
        break;
      case 'fms_part_id':
        brand_category_id = getFieldValue('brand_category_id');
        fms_brand_id = getFieldValue('fms_brand_id');
        this.fetchFmsPartskus({
          ...fields,
          brand_category_id,
          fms_category_id: FIELDS.fms_category_id,
          fms_brand_id,
          fms_part_id: value,
        });
        break;
      default:
        break;
    }
    // 重置填写值
    setFieldsValue({
      fms_partsku_code: undefined,
      oem_partsku_code: undefined,
      exception_status: undefined,
    });
  };

  render() {
    const { loading, FIELDS } = this.props;
    const { selectedPartsRowKeys } = this.state;
    return (
      <Card loading={loading['fms_parts_list/pageInit']}>
        <IndexSearchForm onChangeSelect={this.handleChangeSelect} onSubmit={this.handleSubmit} wrappedComponentRef={el => (this.searchForm = el)} />
        <Divider />
        <Row type="flex" justify="space-between">
          <Col className="f16">大厂产品列表</Col>
          <Col>
            <Button type="primary" className="m-r-10" onClick={this.onGoFmsPartAddFn}>
              创建
            </Button>
            <Button type="danger" ghost disabled={selectedPartsRowKeys.length === 0} onClick={this.handleDeleteFmsPartFn}>
              删除
            </Button>
          </Col>
        </Row>
        <IndexTableList
          selectedPartsRowKeys={selectedPartsRowKeys}
          onSelectedPartsRowKeysFn={this.onSelectedPartsRowKeysFn}
          onGoFmsPartEditFn={this.onGoFmsPartEditFn}
          onChangePartStatusFn={this.onChangePartStatusFn}
          onPageSizeChange={this.handlePageSizeChange}
          onPageChange={this.handlePageChange}
          onGoCarmodelFn={this.onGoCarmodelFn}
        />
      </Card>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.fms_parts_list,
});

export default connect(mapStateToProps)(FmsParts);
