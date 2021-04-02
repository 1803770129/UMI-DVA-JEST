import React from 'react';
import { Table } from 'antd';


export default ({ loading, searchFields, carmodelBrandList, onClickSetFn, onClickDelFn, onHandlePageSizeChangeFn, onHandlePageChangeFn }) => {

  const columns = [
    { title: '品牌', dataIndex: 'cm_brand_name' },
    { title: '车系国别', dataIndex: 'cm_brand_country', width: 100, render: (text, record, index) => text || '' },
    { title: '主机厂', dataIndex: 'cm_factory_name' },
    { title: '车型数量', dataIndex: 'count', width: 100 },
    { title: '品牌标识', dataIndex: 'cm_hot_flag', width: 100 },
    { title: '品牌禁用状态', dataIndex: 'cm_brand_status', width: 100,
      render: (text, record, index) => {
        const configs = { ENABLE:'启用', DISABLE:'禁用' };
        return configs[text] || '';
      }
    },
    {
      title: '操作',
      dataIndex: 'opeartion',
      width: 100,
      render: (text, record, index) => (
        <React.Fragment>
          <span className="blue6 cur m-r-10" onClick={() => onClickSetFn(record.cm_brand_id)}>设置</span>
          {
            record.count == 0 &&
                        <span className="blue6 cur" onClick={() => onClickDelFn(record.cm_brand_id)}>删除</span>
          }
        </React.Fragment>
      )
    }
  ];

  const tableProps = {
    loading,
    className: 'm-t-15',
    bordered: true,
    dataSource: carmodelBrandList.list,
    columns,
    rowKey: (item, index) => index,
    pagination: {
      total: parseInt(carmodelBrandList.count, 10),
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
