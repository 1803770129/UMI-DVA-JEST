import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Divider, Modal } from 'antd';
import router from 'umi/router';
import IndexSearchForm from './components/IndexSearchForm';
import IndexTableList from './components/IndexTableList';
import CopyModal from './components/CopyModal';
import msg from '@/utils/msg';

const confirm = Modal.confirm;

class index extends Component {

  state = {
    copyModalVisible: false,
    stdPartskuId: '',
    curCategoryId: ''
  }

  componentDidMount() {
    const {dispatch}=this.props;
    const data={
      record_obj:{
        'operation':'standardcode/list'
      },
      record_page:' 标准码管理/标准码列表',
      record_operations:'查看标准码列表'
    };
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  }

  //获取初始默认选中
  getInitialValue = () => {
    const { searchFields } = this.props;
    // const initValue = [];
    // if (categoryTree.length > 0) {
    //   initValue.push(categoryTree[0].category_id, categoryTree[0].children[0].category_id);
    // }
    // return initValue;
    return searchFields.category_id || [];
  }

  // 获取标准码列表
  fetchStdSkuList(params) {
    const { dispatch } = this.props;
    dispatch({ type: 'std_sku_list/fetchStdSkuList', payload: params });
  }

  // ************* IndexSearchForm ******************** //
  // 点击查询事件
  onHandleSubmitSearchFn = ({
    category_id,
    std_partsku_status,
    std_partsku_code,
    oem_partsku_code,
    merge,
    exception_status,
  }) => {
    // console.log(category_id, 'category_id');
    const { searchFields,  dispatch} = this.props;
    let params = {
      ...searchFields,
      exception_status,
      category_id,
      oem_partsku_code,
      std_partsku_code,
      std_partsku_status,
      merge: merge ? 'checked' : '',
      page: 1,
      perpage: searchFields.perpage,
      cb: () => this.updateStdSkuParamsFn(params),
    };
    if (!category_id.length && !std_partsku_code && !oem_partsku_code){
      msg('产品，标准码，OE码不能同时为空！');
      return;
    }
    //只有选择产品时才进行渲染
    // if (category_id.length !== 0) {
    this.fetchStdSkuList(params);
    dispatch({
      type: 'std_sku_list/saveStdSkuListParams',
      payload: { ...searchFields, category_id }
    });
    const data={
      record_obj:{ ...searchFields, category_id },
      record_page:' 标准码管理/标准码列表',
      record_operations:'查询标准码列表'
    };
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
    // } else {
    //   //清空列表数据
    //   dispatch({ type: 'std_sku_list/saveStdSkuList', payload: false });
    //   msg('请选择产品！！！');
    // }
  };

  // ************* IndexTableList ******************** //
  // 调整每页显示数量函数
  onHandlePageSizeChangeFn = (current, perpage) => {
    let params = {
      ...this.props.searchFields,
      page: 1,
      perpage,
      cb: () => this.updateStdSkuParamsFn(params),
    };
    this.fetchStdSkuList(params);
  };
  //切换产品更新标准码列表
  handleProductChangeFn = (values = []) => {
    if(values.length === 0) return;
    let params = {
      ...this.props.searchFields,
      category_id: values,
      page:1,
      perpage: this.props.searchFields.perpage,
      cb: () => this.updateStdSkuParamsFn(params),
    };
    this.fetchStdSkuList(params);
  }
  //切换数据状态更新标准码列表
  handleDataStatusChange = values => {
    let params = {
      ...this.props.searchFields,
      std_partsku_status: values,
      page: 1,
      perpage: this.props.searchFields.perpage,
      cb: () => this.updateStdSkuParamsFn(params),
    };
    this.fetchStdSkuList(params);
  }
  // 切换页面函数
  onHandlePageChangeFn = page => {
    let params = {
      ...this.props.searchFields,
      page,
      perpage: this.props.searchFields.perpage,
      cb: () => this.updateStdSkuParamsFn(params),
    };
    this.fetchStdSkuList(params);
  };

  // 点击跳转到详情页
  onGoStdSkuDetailFn = std_partsku_id => {
    router.push('./list/' + std_partsku_id + '?std_partsku_id=' + std_partsku_id);
  };

  // 更新查询标准码列表参数
  updateStdSkuParamsFn = params => {
    const { dispatch, searchFields } = this.props;
    dispatch({
      type: 'std_sku_list/saveStdSkuListParams',
      payload: { ...searchFields, ...params },
    });
  };

  // 复制
  handleCopy = (category_id, category_name, brand_category_name) => {
    const { dispatch, stdSkuList } = this.props;
    const { stdPartskuId } = this.state;
    if(stdPartskuId) {
      const std = stdSkuList.list.find(v => v.std_partsku_id === stdPartskuId) || {};
      confirm({
        title: `确认将此标准码从【${std.category_name}】复制到【${brand_category_name} > ${category_name}】吗？`,
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          const data={
            record_obj:{
              'category_id':category_id,
              'category_name':category_name,
              'brand_category_name':brand_category_name
            },
            record_page:' 标准码管理/标准码列表',
            record_operations:'复制标准码'
          };
          dispatch({
            type:'managerRecord/fetchUserRecorListInsert',
            data:data
          });
          dispatch({
            type: 'std_sku_list/fetchStdskuCopy',
            payload: { std_partsku_id:  stdPartskuId, category_id }
          });
          
        },
      });

      this.hideCopyModal();
      
    }
   
  }

  showCopyModal = (std_partsku_id, category_id) => {
    const { dispatch, stdSkuList } = this.props;
    this.setState({
      copyModalVisible: true,
      stdPartskuId: std_partsku_id,
      curCategoryId: category_id
    }, () => {
      // 获取品类&产品信息
      dispatch({
        type: 'std_sku_list/fetchBrandCategory',
        payload: { category_id }
      });
    });
  }

  hideCopyModal = () => {
    this.setState({
      copyModalVisible: false,
      stdPartskuId: '',
      curCategoryId: ''
    });
  }


  render() {
    const { loading, searchFields, categoryTree, stdSkuList, BRAND_CATEGORY } = this.props;
    const { copyModalVisible, curCategoryId } = this.state;
    return (
      <React.Fragment>
        <Card>
          {/* 搜索 */}
          <IndexSearchForm
            searchFields={formatSearchFormFn(searchFields)}
            categoryTree={categoryTree}
            onHandleSubmitSearchFn={this.onHandleSubmitSearchFn}
            initialValue={this.getInitialValue()}
            handleProductChangeFn={this.handleProductChangeFn}
            handleDataStatusChange={this.handleDataStatusChange}
          />

          <Divider />

          {/* 表格 */}
          <IndexTableList
            loading={loading['std_sku_list/fetchStdSkuList']}
            searchFields={searchFields}
            stdSkuList={{ ...stdSkuList, list: formatStdSkuListFn(stdSkuList.list) }}
            onHandleFeedbackModalVisitFn={this.onHandleFeedbackModalVisitFn}
            onHandlePageSizeChangeFn={this.onHandlePageSizeChangeFn}
            onHandlePageChangeFn={this.onHandlePageChangeFn}
            onGoStdSkuDetailFn={this.onGoStdSkuDetailFn}
            onCopy={this.showCopyModal}
          />
        </Card>

        {/* 复制标准码模态框 */}
        <CopyModal visible={copyModalVisible} BRAND_CATEGORY={BRAND_CATEGORY} curCategoryId={curCategoryId} onOk={this.handleCopy} onCancel={this.hideCopyModal} />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.std_sku_list,
});
export default connect(mapStateToProps)(index);

// 格式化搜索表单数据
function formatSearchFormFn(object) {
  let obj = {};
  // 只显示可合并项
  obj.merge = object.merge == 'checked' ? true : false;
  return Object.assign({}, object, obj);
}

// 格式化标准码管理列表数据
function formatStdSkuListFn(list) {
  return list.map(item => {
    let obj = { ...item };
    obj.std_partsku_id = item.std_partsku_id;
    // 产品
    obj.category_name = item.category_name;
    // 标准码
    obj.std_partsku_code = item.std_partsku_code;
    // 覆盖OE码
    if (item.oem_partsku_codes.length !== 0) {
      obj.oem_partsku_codes = item.oem_partsku_codes.map((itm, idx) => <div key={idx}>{itm}</div>);
    } else {
      obj.oem_partsku_codes = '虚拟OE';
    }
    // 创建人
    obj.create_origin = item.create_origin;
    // 创建时间
    obj.create_time = (
      <React.Fragment>
        <div>{item.create_time.split(' ')[0]}</div>
        <div className="text-center">{item.create_time.split(' ')[1]}</div>
      </React.Fragment>
    );
    // 数据状态
    obj.std_partsku_status = item.std_partsku_status;
    obj.operation = '';
    return obj;
  });
}