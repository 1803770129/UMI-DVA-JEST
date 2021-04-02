import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Button, Divider, Modal, message } from 'antd';
import IndexSearchForm from './components/IndexSearchForm';
import IndexTableList from './components/IndexTableList';
import router from 'umi/router';
import { clearState } from '@/utils/tools';
const confirm = Modal.confirm;

class FmsParts extends Component {
  state = {
    selectedRowKeys: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'indus_parts_list/pageInit',
    });
    const data={
      record_obj:{
        'operation':'进入行业码管理/产品管理'
      },
      record_page:' 行业码管理/产品管理',
      record_operations:'行业产品管理页面'
    };
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  }

  componentWillUnmount(a) {
    const { dispatch } = this.props;
    // 清空缓存数据
    if (!window.location.hash.includes('/industrycode/part')) {
      // clearState(dispatch, 'indus_parts_list');
    }
  }

  // 获取产品列表数据
  fetchIndusPartskus = params => this.props.dispatch({ type: 'indus_parts_list/fetchIndusPartskus', payload: params });

  // 调整每页显示数量函数
  handlePageSizeChange = perpage => {
    let params = {
      ...this.props.FIELDS,
      page: 1,
      perpage,
    };
    this.fetchIndusPartskus(params);
  };

  // 切换页面函数
  handlePageChange = page => {
    let params = {
      ...this.props.FIELDS,
      page,
    };
    this.fetchIndusPartskus(params);
  };

  // 点击查询，获取产品列表数据
  handleSubmit = values => {
    const { FIELDS } = this.props;
    let params = {
      ...FIELDS,
      indus_brand_id: values.indus_brand_id,
      indus_part_id: values.indus_part_id,
      indus_partsku_code: values.indus_partsku_code,
      oem_partsku_code: values.oem_partsku_code,
      exception_status: values.exception_status,
      page: 1,
    };
    this.fetchIndusPartskus(params);
    const { dispatch } = this.props;
    const data={
      record_obj:params,
      record_page:' 行业码管理/产品管理',
      record_operations:'搜索行业产品管理页面'
    };
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  };

  // select选择
  handleChangeSelect = async (key, value) => {
    const { dispatch, FIELDS } = this.props;
    const { setFieldsValue, getFieldValue } = this.searchForm.props.form;
    const fields = { perpage: FIELDS.perpage, page: 1 };
    let indus_part_id, indus_category_id, indus_brand_id, brand_category_id;
    switch (key) {
      case 'brand_category_id':
        brand_category_id = value;
        await dispatch({
          type: 'indus_parts_list/fetchIndus',
          payload: { brand_category_id },
        });
        const { INDUS } = this.props;
        if (INDUS.length > 0) {
          indus_brand_id = INDUS[0].indus_brand_id;
          await dispatch({
            type: 'indus_parts_list/fetchIndusParts',
            payload: { brand_category_id, indus_brand_id },
          });
          const { INDUS_PARTS } = this.props;
          const { categorys, BrandIds } = INDUS_PARTS;
          if (categorys.length > 0 && BrandIds.length > 0) {
            indus_part_id = categorys[0].indus_part_id;
            indus_category_id = BrandIds[0].indus_category_id;
            this.fetchIndusPartskus({ ...fields, brand_category_id, indus_brand_id, indus_part_id, indus_category_id });
          } else {
            // 清空产品数据
            dispatch({
              type: 'indus_parts_list/updateIndusPartskus',
            });
            dispatch({
              type: 'indus_parts_list/updateFields',
              payload: { ...FIELDS, brand_category_id, indus_brand_id, indus_part_id}
            });
          }
        }else{
          // 清空产品数据
          dispatch({
            type: 'indus_parts_list/updateIndusPartskus',
          });
          dispatch({
            type: 'indus_parts_list/updateFields',
            payload: { ...FIELDS, brand_category_id, indus_brand_id, indus_part_id}
          });
        }
        setFieldsValue({
          indus_brand_id,
          indus_part_id,
        });

        break;
      case 'indus_brand_id':
        indus_brand_id = value;
        await dispatch({
          type: 'indus_parts_list/fetchIndusParts',
          payload: {
            brand_category_id: getFieldValue('brand_category_id'),
            indus_brand_id,
          },
        });
        const { INDUS_PARTS } = this.props;
        const { categorys, BrandIds } = INDUS_PARTS;
        if (categorys.length > 0 && BrandIds.length > 0) {
          indus_part_id = categorys[0].indus_part_id;
          indus_category_id = BrandIds[0].indus_category_id;
          this.fetchIndusPartskus({ ...fields, brand_category_id, indus_brand_id, indus_part_id, indus_category_id });
        } else {
          // 清空产品数据
          dispatch({
            type: 'indus_parts_list/updateIndusPartskus',
          });
          dispatch({
            type: 'indus_parts_list/updateFields',
            payload: { ...FIELDS, brand_category_id, indus_brand_id, indus_part_id}
          });
        }
        setFieldsValue({
          indus_part_id,
        });
        break;
      case 'indus_part_id':
        this.fetchIndusPartskus({
          ...fields,
          brand_category_id: getFieldValue('brand_category_id'),
          indus_brand_id: getFieldValue('indus_brand_id'),
          indus_category_id: FIELDS.indus_category_id,
          indus_part_id: value,
        });
        break;
      case 'exception_status':
        this.fetchIndusPartskus({
          ...FIELDS,
          ...fields,
          exception_status: value,
        });
        break;
      default:
        break;
    }
    // 重置填写值
    setFieldsValue({
      indus_partsku_code: undefined,
      oem_partsku_code: undefined
    });
  };
  // 切换状态
  handleChangePartStatus = (indus_partsku_id, checked) => {
    this.props.dispatch({
      type: 'indus_parts_list/fetchIndusStatusUpdate',
      payload: {
        indus_partsku_id: indus_partsku_id,
        indus_partsku_status: checked ? 'ENABLE' : 'DISABLE',
      },
    });
    const data={
      record_obj:{
        'indus_partsku_id': indus_partsku_id,
        'indus_partsku_status': checked ? 'ENABLE' : 'DISABLE',
      },
      record_page:' 行业码管理/产品管理',
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
  routePartEdit = (category_id, indus_brand_id, indus_category_id, indus_partsku_id, indus_part_id) => {
    const { brand_category_id } = this.props.FIELDS;
    router.push({
      pathname: 'part/' + category_id,
      query: { brand_category_id, category_id, indus_brand_id, indus_category_id, indus_partsku_id, indus_part_id },
    });
    const data={
      record_obj:{
        'category_id':category_id
      },
      record_page:' 行业码管理/产品管理',
      record_operations:'编辑产品'
    };
    const {dispatch}=this.props;
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  };


  // 点击跳转到创建页
  routePartAdd = () => {
    const { indus_brand_id, indus_category_id, indus_part_id, brand_category_id } = this.props.FIELDS;
    // 创建
    router.push({
      pathname: 'part/-1',
      query: { brand_category_id, indus_brand_id, indus_category_id, indus_part_id },
    });
    const data={
      record_obj:{
        'operation':'点击创建，创建产品'
      },
      record_page:' 行业码管理/产品管理',
      record_operations:'创建产品'
    };
    const {dispatch}=this.props;
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  };

  // 勾选产品的值
  handleSelectedRowKeys = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  // 批量删除配件
  handleDeletePart = () => {
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length === 0) return;
    confirm({
      title: '删除后不可恢复，确定删除所选择的配件？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const data={
          record_obj:{
            'indus_partsku_ids': selectedRowKeys
          },
          record_page:' 行业码管理/产品管理',
          record_operations:'批量删除配件行业产品'
        };
        const {dispatch}=this.props;
        dispatch({
          type:'managerRecord/fetchUserRecorListInsert',
          data:data
        });
        this.props.dispatch({
          type: 'indus_parts_list/fetchIndusPartskusDel',
          payload: { indus_partsku_ids: selectedRowKeys },
          callback: () => this.handleSelectedRowKeys([]), // 清空勾选项
        });
      },
    });
  };

  render() {
    const { loading } = this.props;
    const { selectedRowKeys } = this.state;
    return (
      <Card loading={loading['indus_parts_list/pageInit']}>
        <IndexSearchForm wrappedComponentRef={el => (this.searchForm = el)} onChangeSelect={this.handleChangeSelect} onSubmit={this.handleSubmit} />
        <Divider />
        <Row type="flex" justify="space-between">
          <Col className="f16">行业协会产品列表</Col>
          <Col>
            <Button type="primary" className="m-r-10" onClick={this.routePartAdd}>
              创建
            </Button>
            <Button type="danger" ghost disabled={selectedRowKeys.length === 0} onClick={this.handleDeletePart}>
              删除
            </Button>
          </Col>
        </Row>
        <IndexTableList
          selectedRowKeys={selectedRowKeys}
          onSelectedRowKeys={this.handleSelectedRowKeys}
          onEdit={this.routePartEdit}
          onChangePartStatus={this.handleChangePartStatus}
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
  ...state.indus_parts_list,
});

export default connect(mapStateToProps)(FmsParts);
