import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Divider, Row, Col } from 'antd';
import IndexSearchForm from './components/IndexSearchForm';
import IndexTableList from './components/IndexTableList';
import router from 'umi/router';

class ClientManage extends Component {

  componentDidMount() {
    this.fetchCustomerListFn(this.props.searchFields);
  }

    // 搜索栏 - 点击查询
    onSubmitFn = values => this.fetchCustomerListFn({...this.props.searchFields, ...values, page: 1});

    // 列表 - 获取车型品牌列表
    fetchCustomerListFn = params => this.props.dispatch({ type: 'client_manage_list/fetchCustomerList', payload: params });

    // 列表 - 分页
    onHandlePageSizeChangeFn = (current, perpage) => this.fetchCustomerListFn({...this.props.searchFields, perpage, page: 1});

    // 列表 - 翻页
    onHandlePageChangeFn = page => this.fetchCustomerListFn({...this.props.searchFields, page});

    // 列表 - 点击编辑
    onGoEditFn = company_id => {
      const { dispatch, customerList } = this.props;
      const { list = [] } = customerList;
      const customerInfo = customerList.list.find(item => item.company_id == company_id);
      dispatch({ type: 'client_manage_list/saveCustomerInfo', payload: customerInfo });
      router.push('./clientmanage/' + company_id);
    }

    // 切换筛选列表表单
    onChangeSearchFormFn = (key, value) => this.fetchCustomerListFn({...this.props.searchFields, [key]: value, page: 1});

    render() {
      const { loading, searchFields, customerList, serviceList, addressList } = this.props;
      return (
        <React.Fragment>
          <Card>
            <IndexSearchForm 
              searchFields={searchFields}
              serviceList={serviceList}
              addressList={addressList}
              onSubmitFn={this.onSubmitFn}
              onChangeSearchFormFn={this.onChangeSearchFormFn}
            />
            <Divider />
            <Row type="flex" justify="space-between">
              <Col className="f16">商户列表</Col>
            </Row>
            <IndexTableList 
              loading={loading['client_manage_list/fetchCustomerList']}
              searchFields={searchFields}
              customerList={{...customerList, list: formatCustomListFn(customerList.list, serviceList)}}
              onHandlePageSizeChangeFn={this.onHandlePageSizeChangeFn}
              onHandlePageChangeFn={this.onHandlePageChangeFn}
              onGoEditFn={this.onGoEditFn}
            />
          </Card>
        </React.Fragment>
      );
    }
};

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.global,
  ...state.client_manage_list
});
export default connect(mapStateToProps)(ClientManage);

// 格式化车型品牌列表
function formatCustomListFn(list = [], serviceList) {
  if(serviceList.length === 0) return;
  // 获取开通服务值
  const getAppChannelValueFn = app_channel => serviceList.reduce(item => item.app_channel == app_channel).app_channel_name;
  const tenant_status = { 'INSERVICE': '服务中', 'BANNED': '已封禁', '': '' };
  const company_type = { 'TENANT': '厂家', 'MEMBER': '会员', '': '' };
  const tenant_level = { 'PROBATION': '试用', 'NORMAL': '普通', '': '' };
  return list.map(item => {
    let obj = {...item};
    obj.company_id = item.company_id;
    // 商户名称
    obj.company_name = item.company_name;
    // 省/市/区县
    if(item.province_name && item.city_name && item.county_name) {
      obj.province_city_country = item.province_name + '/' + item.city_name + '/' + item.county_name;
    } else {
      obj.province_city_country = '';
    }
    // 联系人
    obj.contact = item.contact || '';
    // 联系电话
    obj.contact_phone = item.contact_phone || '';
    // 类型定义
    obj.company_type = company_type[item.company_type];
    // 开通服务
    obj.app_channel = getAppChannelValueFn(item.app_channel, serviceList);
    // 商户等级
    obj.tenant_level = tenant_level[item.tenant_level];
    // 备注信息
    obj.company_desc = item.company_desc || '';
    // 星级
    obj.company_evaluate = item.company_evaluate + '星';
    // 服务状态
    obj.tenant_status = tenant_status[item.tenant_status];
    // 跳转去商户服务要用到的参数
    obj.params_ten_brand_status = item.tenant_status;
    obj.params_app_channel = item.app_channel;
    // 注册账号
    obj.person_phone = item.person_phone;
    return obj;
  });
}
