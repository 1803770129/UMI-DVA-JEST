import React from 'react';
import { Table, message } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';

export default props => {

  const {
    loading,
    searchFields,
    serviceList,
    onHandlePageSizeChangeFn,
    onHandlePageChangeFn,
    onGoEditFn,
  } = props;

  const columns = [
    { title: '品牌', dataIndex: 'ten_brand_name', width: 120 },
    {
      title: '品牌类型',
      width: 120,
      dataIndex: 'ten_brand_type',
      render: (text, record) => {
        return (
          <>
            {text === 'DEALER' && '代理经销'}
            {text === 'FACTORY' && '自主生产'}
          </>
        );
      }
    },
    { title: '商户等级', dataIndex: 'tenant_level', width: 80 },
    { title: '商户名称', dataIndex: 'company_name', width: 120 },
    { title: '联系人', dataIndex: 'contact', width: 120 },
    {
      title: '联系电话',
      dataIndex: 'contact_phone',
      width: 100,
      render: (text, record) => <>{record.contact_phone_area_code && text && `${record.contact_phone_area_code}-`}{text}</>
    },
    {
      title: '注册账号',
      dataIndex: 'person_phone',
      width: 100,
      render: (text, record) => <>{record.person_phone_area_code && text && `${record.person_phone_area_code}-`}{text}</>
    },
    {
      title: '开通服务',
      dataIndex: 'app_channel',
      width: 160,
      render: (text, record) => (
        <CopyToClipboard text={record.ten_brand_flag} onCopy={() => message.success('复制成功')}>
          <span className="cur blue6">{text}</span>
        </CopyToClipboard>
      )
    },
    {
      title: '已开通品类', dataIndex: 'opened_categories', width: 150,
      render: (text, record) => {
        return (
          <>
            {text.length > 0 ? text.join(',') : <span className="gray">-</span>}
          </>
        );
      }
    },
    {
      title: '已禁用品类', dataIndex: 'disabled_categories', width: 150,
      render: (text, record) => {
        return (
          <>
            {text.length > 0 ? text.join(',') : <span className="gray">-</span>}
          </>
        );
      }
    },
    {
      title: '待审核品类', dataIndex: 'pending_categories', width: 150,
      render: (text, record) => {
        return (
          <>
            {text.length > 0 ? text.join(',') : <span className="gray">-</span>}
          </>
        );
      }
    },
    { title: '申请时间', dataIndex: 'apply_time', fixed: 'right', },
    { title: '服务状态', dataIndex: 'ten_brand_status', fixed: 'right' },
    {
      title: '操作',
      dataIndex: 'operation',
      fixed: 'right',
      render: (text, record) => <span className="cur blue6" onClick={() => onGoEditFn(record.company_id, record.ten_brand_id)}>编辑</span>
    }
  ];

  const tableProps = {
    loading,
    scroll: { x: 1660 },
    className: 'm-t-15',
    bordered: true,
    dataSource: serviceList.list,
    columns,
    rowKey: (item, index) => index,
    pagination: {
      total: parseInt(serviceList.count, 10),
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