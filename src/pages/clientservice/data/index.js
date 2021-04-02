import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Divider, Row, Col } from 'antd';
import IndexSearchForm from './components/IndexSearchForm';
import IndexTableList from './components/IndexTableList';
import router from 'umi/router';
import { isEmptyObject } from '@/utils/tools';
import ENV from '@/utils/env';

class DataList extends Component {

  componentDidMount() {
    const { searchFields, location } = this.props;
    const query = location.query;
    if(isEmptyObject(query)) {
      // 地址栏没参数，从菜单点进来的
      this.fetchServiceDataList(searchFields);
    } else {
      // 地址栏有参数，从商户管理跳过来的
      let newSearchFields = {
        ...searchFields,
        ten_brand_status: query.ten_brand_status,
      };
      this.fetchServiceDataList(newSearchFields);
    }
  }

    // 搜索栏 - 点击查询
    onSubmitFn = values => {
      const { searchFields } = this.props;
      const { keywords } = values;
      if(keywords) {
        this.fetchServiceDataList({...searchFields, keywords, page: 1});
      }
    };

    // 搜索栏 - 切换操作栏数据
    handleChangeSearchParams = (key, val) => {
      const { searchFields } = this.props;
      if(key === 'keywords' && val) {
        // 输入关键字不查询
        return false;
      }
      this.fetchServiceDataList({...searchFields, [key]: val , page: 1});
    };

    // 列表 - 获取车型品牌列表
    fetchServiceDataList = params => {
      const { dispatch } = this.props;
      dispatch({ 
        type: 'client_service_data_list/fetchServiceDataList', 
        payload: params 
      });
    };

    // 列表 - 分页设置
    onHandlePageSizeChangeFn = (current, perpage) => {
      const { searchFields } = this.props;
      this.fetchServiceDataList({...searchFields, perpage, page: 1});
    };

    // 列表 - 翻页
    onHandlePageChangeFn = page => {
      const { searchFields } = this.props;
      this.fetchServiceDataList({...searchFields, page});
    };

    // 点击编辑跳转
    onGoEditFn = (company_id, ten_brand_id) => {
      const { dispatch, serviceDataList, serviceList } = this.props;
      // 获取开通服务值
      const getAppChannelValueFn = app_channel => serviceList.reduce(item => item.app_channel == app_channel).app_channel_name;
      // 开通服务
      let serviceDataInfo = serviceDataList.list.find(item => item.ten_brand_id == ten_brand_id );
      serviceDataInfo.app_channel = getAppChannelValueFn(serviceDataInfo.app_channel);
      dispatch({ type: 'client_service_data_list/saveServiceInfo', payload: serviceDataInfo });
      router.push('./data/' + ten_brand_id);
    }

    render() {
      const { loading, searchFields, serviceDataList, serviceList, brandCategoryDropList } = this.props;

      return (
        <Card>
          <IndexSearchForm 
            searchFields={searchFields}
            brandCategorys={brandCategoryDropList}
            onSubmitFn={this.onSubmitFn}
            onChangeSearch={this.handleChangeSearchParams}
          />
          <Divider />
          <Row type="flex" justify="space-between">
            <Col className="f16">数据查询服务列表</Col>
          </Row>
          <IndexTableList 
            loading={loading['client_service_data_list/fetchServiceDataList']}
            searchFields={searchFields}
            serviceList={{...serviceDataList, list: formatServiceDataList(serviceDataList.list, serviceList, brandCategoryDropList)}}
            onHandlePageSizeChangeFn={this.onHandlePageSizeChangeFn}
            onHandlePageChangeFn={this.onHandlePageChangeFn}
            onGoEditFn={this.onGoEditFn}
          />
        </Card>
      );
    }
};

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.global,
  ...state.client_service_data_list
});
export default connect(mapStateToProps)(DataList);

// 格式化车型品牌列表
// list                             // 数据查询服务列表
// serviceList                      // 已开通的服务数据
// brandCategoryDropList            // 品类下拉列表
function formatServiceDataList(list = [], serviceList, brandCategoryDropList) {
  if(serviceList.length === 0) return;
  // 获取开通服务值
  const getAppChannelValueFn = app_channel => serviceList.reduce(item => item.app_channel == app_channel).app_channel_name;
  // 获取品类值
  const getCategoryNameValueFn = brand_category_id => {
    let name = null;
    let result = brandCategoryDropList.find(item => item.brand_category_id == brand_category_id);
    if(result) {
      name = result.brand_category_name;
    } 
    return name;
  };
  const ten_brand_status = {
    'INSERVICE': '服务中',
    'BANNED': '已封禁'
  };
  const tenant_level = {
    'PROBATION': '试用',
    'NORMAL': '普通'
  };
  return list.map(item => {
    let obj = {...item};
    // 开通服务
    obj.app_channel = getAppChannelValueFn(item.app_channel, serviceList);
    // 服务状态
    obj.ten_brand_status = ten_brand_status[item.ten_brand_status];
    // 用于复制用户端访问链接的标识
    obj.ten_brand_flag = ENV.userDomain + item.ten_brand_flag;
    // 商户等级
    obj.tenant_level = tenant_level[item.tenant_level];

    return obj;
  });
}