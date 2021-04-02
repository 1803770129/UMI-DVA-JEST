import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Modal, Button, Divider, Row, Col, Card } from 'antd';
import TopFrom from './components/TopFrom';
import OemTmpListTable from './components/OemTmpListTable';
import ViewMatchCm from './components/ViewMatchCm';
import ViewPrice from './components/ViewPrice';

import TreeNodeModal from '@/components/TreeNodeModal';
const confirm = Modal.confirm;

class index extends Component {

  state = {
    viewMatchCmModalVisible: false,
    treeNodeModalVisible: false,
    viewPriceVisible: false,
    expandedKeys: [],
    selectedKeys: [],
    selectedRowKeys: []
  }

  handleSubmit = () => {
    const { form } = this.props;
    const { validateFields } = form;
    validateFields((err, values) => {
      if (!err) {
        this.fetchOemTmpList(values);
      }
    });
    const {dispatch}=this.props;
    const data={
      record_obj:{
        'operation':'oe/tmp'
      },
      record_page:'   OE管理/待归类OE',
      record_operations:'查询待归类OE页面'
    };
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  };

  // 删除临时OE相关数据
  fetchOemTmpDel = () => {
    const { dispatch, FIELDS } = this.props;
    const { selectedRowKeys } = this.state;
    confirm({
      title: '删除后不可恢复，是否继续？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        // 删除数据
        dispatch({
          type: 'oe_tmp/fetchOemTmpDel',
          payload: { oem_tmp_partsku_ids: selectedRowKeys },
          callback: () => {
            // 清空selectedRowKeys选项
            this.handleTableSelectChange();
            // 重新拉取列表
            this.fetchOemTmpList(FIELDS, true);
          }
        });
      }
    });
  }
  componentDidMount() {
    const {dispatch}=this.props;
    const data={
      record_obj:{
        'operation':'oe/tmp'
      },
      record_page:'   OE管理/待归类OE',
      record_operations:'查看待归类OE页面'
    };
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  }

  // 获取临时OE列表
  fetchOemTmpList = (payload, isInit) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'oe_tmp/fetchOemTmpList',
      payload,
      isInit
    });
    // 清空selectedRowKeys选项
    this.handleTableSelectChange();
  };

  // 待归类OE列表select状态
  handleTableSelectChange = (selectedRowKeys = []) => {
    this.setState({ selectedRowKeys });
  };

  // 显示查看适配车型模态框
  showViewMatchCmModal = row => {
    const { dispatch } = this.props;
    const { oem_tmp_partsku_id } = row;
    // 获取适配车型
    dispatch({
      type: 'oe_tmp/fetchOemTmpCmvalues',
      payload: { oem_tmp_partsku_id }
    });
    // 显示模态框
    this.setState({ viewMatchCmModalVisible: true });
  };

  // 隐藏查看适配车型模态框
  hideViewMatchCmModal = () => {
    this.setState({ viewMatchCmModalVisible: false });
  };

  /**
   * 零件树节点
   */
  // 归类临时OE相关数据
  fetchOemTmpMark = () => {
    const { dispatch, FIELDS, CATEGORY_INFO } = this.props;
    const { selectedRowKeys } = this.state;

    // 获取适配车型
    dispatch({
      type: 'oe_tmp/fetchOemTmpMark',
      payload: { oem_tmp_partsku_ids: selectedRowKeys, category_id: CATEGORY_INFO.categoryParams.category_id },
      callback: () => {
        // 清空选项
        this.handleTableSelectChange();
        // 重新拉取列表
        this.fetchOemTmpList(FIELDS, true);
        // 隐藏零件树节点模态框
        this.hideTreeNodeModal(false);
      }
    });
  };

  // 显示零件树模态框显示状态
  showTreeNodeModal = () => {
    const { dispatch } = this.props;
    // 显示模态框前，清空选中数据
    dispatch({
      type: 'oe_tmp/updateCategoryInfo'
    });
    this.setState({ treeNodeModalVisible: true });
  };

  // 隐藏零件树模态框显示状态
  hideTreeNodeModal = () => {
    this.setState({ 
      treeNodeModalVisible: false,
      // 同时清空模态框缓存状态
      expandedKeys: [],
      selectedKeys: [],
    });
  };

  
  // 显示价格模态框显示状态
  showViewPriceModal = row => {
    const { dispatch } = this.props;
    const { oem_tmp_partsku_id } = row;
    // 获取适配车型
    dispatch({
      type: 'oe_tmp/fetchOemTmpPrice',
      payload: { oem_tmp_partsku_id }
    });
    this.setState({ viewPriceVisible: true });
  };

  // 隐藏价格模态框显示状态
  hideViewPriceModal= () => {
    this.setState({ viewPriceVisible: false });
  };

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
        type: 'oe_tmp/fetchCategoryInfo',
        payload: { category_id: cate.key }
      });
    } else {
      // 选择目录禁用确定按钮
      dispatch({
        type: 'oe_tmp/updateCategoryInfo',
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
  };

  render() {
    const { loading, form, FIELDS, OEM_TMP_PARTNAME, OEM_TMP_CMBRAND, OEM_TMP_LIST, OEM_TMP_CMVALUES, CATEGORY_TREE, CATEGORY_INFO, OEM_TMP_PRICE } = this.props;
    const { viewMatchCmModalVisible, treeNodeModalVisible, expandedKeys, selectedKeys, selectedRowKeys, viewPriceVisible } = this.state;
    const viewMatchCmModalProps = {
      width: 1000,
      title: '查看适配车型',
      visible: viewMatchCmModalVisible,
      destroyOnClose: true,
      maskClosable: false,
      footer: <Button type="primary" onClick={this.hideViewMatchCmModal}>确定</Button>,
      onCancel: this.hideViewMatchCmModal
    };
    const viewPriceProps = {
      width: 1000,
      title: '查看价格',
      visible: viewPriceVisible,
      destroyOnClose: true,
      maskClosable: false,
      footer: <Button type="primary" onClick={this.hideViewPriceModal}>确定</Button>,
      onCancel: this.hideViewPriceModal
    };

    const treeNodeModalProps = {
      visible: treeNodeModalVisible,
      expandedKeys,
      selectedKeys,
      PAGE_TYPE: 'add',
      CATEGORY_TREE,
      CATEGORY_INFO,
      onOk: this.fetchOemTmpMark,
      onCancel: this.hideTreeNodeModal,
      onInputChange: this.handleTreeInputChange,
      onTreeSelect: this.handleTreeSelect
    };
    return (
      <>
        <Card>
          <TopFrom form={form} FIELDS={FIELDS} OEM_TMP_PARTNAME={OEM_TMP_PARTNAME} OEM_TMP_CMBRAND={OEM_TMP_CMBRAND} onSubmit={this.handleSubmit} />
          <Divider style={{ marginTop: 15, marginBottom: 15 }} />
          <Row type="flex" justify="space-between">
            <Col className="f16">待归类OE列表</Col>
            <Col>
              <Button type="danger" className="m-r-10" disabled={selectedRowKeys.length === 0} onClick={this.fetchOemTmpDel}>删除</Button>
              <Button type="primary" disabled={selectedRowKeys.length === 0} onClick={this.showTreeNodeModal}>归类</Button>
            </Col>
          </Row>
          <OemTmpListTable loading={loading} FIELDS={FIELDS} data={OEM_TMP_LIST.data} count={OEM_TMP_LIST.count} selectedRowKeys={selectedRowKeys} onShowViewMatchCmModal={this.showViewMatchCmModal} onTableSelectChange={this.handleTableSelectChange} onFetchOemTmpList={this.fetchOemTmpList} onShowViewPriceModal={this.showViewPriceModal}/>
        </Card>
        {/* 查看适配车型 模态框 */}
        <Modal {...viewMatchCmModalProps}>
          <ViewMatchCm loading={loading} data={OEM_TMP_CMVALUES.data} pros={OEM_TMP_CMVALUES.pros} />
        </Modal>
        {/* 查看价格 模态框 */}
        <Modal {...viewPriceProps}>
          <ViewPrice loading={loading} data={OEM_TMP_PRICE.data} />
        </Modal>
        {/* 零件树模态框 */}
        <TreeNodeModal {...treeNodeModalProps} />
      </>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.global,
  ...state.oe_tmp
});

const TmpForm = Form.create()(index);
export default connect(mapStateToProps)(TmpForm);

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