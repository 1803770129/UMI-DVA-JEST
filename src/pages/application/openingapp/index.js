import React, { Component } from 'react';
import { Card, Table,  Form } from 'antd';
import styles from './index.less';
import { connect } from 'dva';

class OpeningApp extends Component {
  handleSubmitFn = e => {
  };
  state = {
    page:this.props.MARKETPAGES.page,
    pageCount:this.props.MARKETPAGES.pageCount,
  };

  componentDidMount() {
    const {MARKETPAGES}=this.props;
    this.getMarketsTenantsList(MARKETPAGES);
  }

  getMarketsTenantsList = params => {
    const { dispatch } = this.props;
    dispatch({
      type: 'markets/fetchMarketsTenantsWeappList',
      payload:params,
    });
  };

  render() {
    const { TENANT_MARKETS, loading , MARKETPAGES } = this.props;
    const columns = [
      {
        title: '商户名称',
        dataIndex: 'company_name',
        key: 'company_name',
      },
      {
        title: '应用名称',
        dataIndex: 'market_app_name',
        key: 'market_app_name',
      },
      {
        title: '应用配置',
        dataIndex: 'market_app_cfgs',
        key: 'market_app_cfgs',
      },
      {
        title: '品牌名称',
        dataIndex: 'ten_brand_name',
        key: 'ten_brand_name',
      },
      // {
      //   title: '品类名称',
      //   dataIndex: 'brand_category_name',
      //   key: 'brand_category_name',
      // },
      // {
      //   title: '开始时间',
      //   dataIndex: 'market_tenant_starttime',
      //   key: 'market_tenant_starttime',
      // },
      {
        title: '有效期',
        dataIndex: 'market_tenant_endtime',
        key: 'market_tenant_endtime',
      },
      {
        title: '应用状态',
        dataIndex: 'statusName',
        key: 'statusName',
      },
      {
        title: '创建人',
        dataIndex: 'create_name',
        key: 'create_name',
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
        key: 'create_time',
      },
    ];
    const pagination={
      pageSize:this.state.pageCount,
      current:this.state.page,
      total: parseInt(TENANT_MARKETS.count,10),
      showSizeChanger: true,
      showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`,
      onShowSizeChange: (current, perpage) => onHandlePageSizeChangeFn(current, perpage),
      onChange: page => onHandlePageChangeFn(page)
    };
    const onHandlePageSizeChangeFn = (current, perpage) => {
      this.setState({
        pageCount:perpage
      });
      this.getMarketsTenantsList({...MARKETPAGES, pageCount:perpage, page: 1});
    };
    const onHandlePageChangeFn = page => {
      this.setState({
        page:page
      });
      this.getMarketsTenantsList({...MARKETPAGES,pageCount:this.state.pageCount, page:page });
    };

    // let tableProps = {
    //   className: 'm-t-15',
    //   loading: loading['markets/fetchMarketsTenantsWeappList'],
    //   bordered: true,
    //   rowKey: record => record.ten_brand_id+record.market_tenant_endtime,
    //   dataSource: TENANT_MARKETS.tenMarkets,
    //   columns,
    //   pagination:pagination,
    // };
    return (
      <Card className={styles.factoryCategoryList}>
        <Table className="m-t-15" loading={loading['markets/fetchMarketsTenantsWeappList']} bordered rowKey={record => record.market_tenant_id} columns={columns}
          dataSource={TENANT_MARKETS.tenMarkets} pagination={pagination}
        />
      </Card>
    );
  }
}

const tenStateToProps = state => {
  return {
    loading: state.loading.effects,
    ...state.markets,
  };
};
export default connect(tenStateToProps)(OpeningApp);
