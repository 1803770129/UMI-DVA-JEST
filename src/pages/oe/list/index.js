import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Card, Divider } from 'antd';
import { clearState } from '@/utils/tools';
import msg from '@/utils/msg';
import OeSearchForm from './components/OeSearchForm';
import OeTableList from './components/OeTableList';
import OeTableOperation from './components/OeTableOperation';
import { validateTel } from '../../../utils/tools';


const confirm = Modal.confirm;

// 页面组件
class Oe extends Component {
  state = {
    selectedRowKeys: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'oe/pageInit' });
    // dispatch({ type: 'oe/fetchOemsku',payload });
    console.log(this.getInitialCategoryId());
    const data={
      record_obj:{
        'operation':'oe/list'
      },
      record_page:' OE管理',
      record_operations:'查看oe管理页面'
    };
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  }

  componentWillUnmount(a) {
    const { dispatch } = this.props;
    // 清空缓存数据(返回oe页面和跳转标准码编辑页面，不清空)
    if(!window.location.hash.includes('/oe/list') && !window.location.hash.includes('/standardcode/list')) {
      clearState(dispatch, 'oe');
    }
  }

  //获取初始默认选中
  getInitialCategoryId = () => {
    const { CATEGORY_TREE, FIELDS } = this.props;
    // const initValue = [];
    // if (CATEGORY_TREE.length > 0) {
    //   initValue.push(CATEGORY_TREE[0].category_id);
    //   CATEGORY_TREE[0].children && initValue.push(CATEGORY_TREE[0].children[0].category_id);
    // }
    // return initValue;
    return FIELDS.category_id || [];
  };

  // 获取oem列表
  handleFetchOemskuList = values => {
    console.log(values);
    const { dispatch, FIELDS } = this.props;
    if(values.category_id.length!==0){
      dispatch({
        type:'oe/fetchOemskua',
        payload:{
          category_id:values.category_id[1]
        }
      });
    }
    if(values.attribute){
      dispatch({
        type:'oe/updateOemField',
        payload:values.attribute
      });
      let valList={...values};
      delete valList.attribute;
      dispatch({
        type: 'oe/fetchOemskuList',
        payload: { params: { page: FIELDS.page, perpage: FIELDS.perpage, ...valList,category_pro_id:values.attribute[0],oem_partsku_value:values.attribute[1] } },
      });
    }else{
      dispatch({
        type: 'oe/fetchOemskuList',
        payload: { params: { page: FIELDS.page, perpage: FIELDS.perpage, ...values, } },
      });
    }
    // 重新拉取列表需要清空selectedRowKeys
    this.handleSelectedRows([]);
  };

  // 表格select选择
  handleSelectedRows = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  // 审核状态选择
  handleMenuClick = e => {
    const { dispatch, OEMSKU_LIST, FIELDS } = this.props;
    const { selectedRowKeys } = this.state;
    const oem_partsku_ids = OEMSKU_LIST.list
      .filter((v, idx) => selectedRowKeys.includes(idx))
      .map(item => item.oem_partsku_id);
    if (oem_partsku_ids.length === 0) return;
    confirm({
      title: '确定执行此操作么？',
      content: '确认后不可恢复',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        dispatch({
          type: 'oe/fetchOemskuApprove',
          payload: {
            oem_partsku_ids,
            oem_partsku_status: e.key,
            cb: () => {
              // 清空selectedRowKeys
              this.handleSelectedRows([]);
              // 重新拉取列表数据
              dispatch({
                type: 'oe/fetchOemskuList',
                payload: {
                  params: { ...FIELDS },
                  isForce: true,
                },
              });
            },
          },
        });
      },
    });
  };

  render() {
    const { dispatch, loading, OEMSKU_LIST, FIELDS, OEMSKU, OEMSKUA } = this.props;
    const { selectedRowKeys } = this.state;
    const getLoading = fnName => loading[`oe/${fnName}`];
    return (
      <Card>
        {/* 表单 */}
        <OeSearchForm
          onFetchOemskuList={this.handleFetchOemskuList}
          initialCategoryId={this.getInitialCategoryId()}
          OEMSKU={OEMSKU}
          dispatch={dispatch}
        />

        <Divider style={{ marginTop: 8, marginBottom: 16 }} />

        {/* 表格操作行 */}
        <OeTableOperation
          onMenuClick={this.handleMenuClick}
          isDisabled={selectedRowKeys.length === 0}
        />

        {/* 列表 */}
        <OeTableList
          loading={getLoading('fetchOemskuList')}
          FIELDS={FIELDS}
          OEMSKU={OEMSKU}
          OEMSKUA={OEMSKUA}
          OEMSKU_LIST={OEMSKU_LIST}
          selectedRowKeys={this.state.selectedRowKeys}
          onFetchOemskuList={this.handleFetchOemskuList}
          onChangeSelectedRows={this.handleSelectedRows}
        />
      </Card>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.global,
  ...state.oe
});
export default connect(mapStateToProps)(Oe);
