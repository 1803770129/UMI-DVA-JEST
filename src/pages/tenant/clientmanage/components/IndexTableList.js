import React from 'react';
import { Table } from 'antd';
import router from 'umi/router';

export default props => {

  const {
    loading,
    searchFields,
    customerList,
    onHandlePageSizeChangeFn,
    onHandlePageChangeFn,
    onGoEditFn
  } = props;

  // 点击开通服务跳转
  const handleRoutToFn = target => router.push('/clientservice/data?app_channel=' + target.params_app_channel + '&ten_brand_status=' + target.params_ten_brand_status);
    
  const columns = [
    { title: '商户名称', dataIndex: 'company_name' },
    { title: '省/市/区县', dataIndex: 'province_city_country' },
    { title: '联系人', dataIndex: 'contact' },
    { 
      title: '联系电话', 
      dataIndex: 'contact_phone', 
      width: 110,
      render: (text, record) => <>{record.contact_phone_area_code && text && `${record.contact_phone_area_code}-`}{text}</>
    },
    { 
      title: '注册账号', 
      dataIndex: 'person_phone', 
      width: 110,
      render: (text, record) => <>{record.person_phone_area_code && text && `${record.person_phone_area_code}-`}{text}</>
    },
    { title: '类型定义', dataIndex: 'company_type' },
    { 
      title: '开通服务', 
      dataIndex: 'app_channel',
      render: (text, record) => <span className="cur blue6" onClick={() => handleRoutToFn(record)}>{record.app_channel}</span>
    },
    { title: '商户等级', dataIndex: 'tenant_level' },
    { title: '备注信息', dataIndex: 'company_desc' },
    { title: '星级', dataIndex: 'company_evaluate' },
    { title: '服务状态', dataIndex: 'tenant_status' },
    { title: '注册时间', dataIndex: 'create_time' },
    { 
      title: '操作', 
      dataIndex: 'operation',
      render: (text, record) => <span className="cur blue6" onClick={() => onGoEditFn(record.company_id)}>编辑</span>
    }
  ];
  const tableProps = {
    loading,
    className: 'm-t-15',
    bordered: true,
    dataSource: customerList.list,
    columns,
    rowKey: (item, index) => index,
    pagination: {
      total: parseInt(customerList.count, 10),
      pageSize: searchFields.perpage,
      current: searchFields.page,
      showSizeChanger: true,
      onShowSizeChange: (current, perpage) => onHandlePageSizeChangeFn(current, perpage),
      onChange: page => onHandlePageChangeFn(page),
      showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`
    }
  };

  return (
    <Table {...tableProps} />
  );
};