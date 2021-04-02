import React from 'react';
import { Table, Switch } from 'antd';
import { connect } from 'dva';

const IndexTableList = ({ loading, FIELDS, INDUS_PARTSKUS, INDUS_PARTS, INDUS, selectedRowKeys, onSelectedRowKeys, onEdit, onChangePartStatus, onPageSizeChange, onPageChange, onGoCarmodelFn }) => {
  const { categorys } = INDUS_PARTS;
  const columns = [
    {
      title: '产品编码',
      dataIndex: 'indus_partsku_codes',
      render: (text, record, index) => record.indus_partsku_codes.map((itm, idx) => <div key={idx}>{itm}</div>),
    },
    {
      title: '产品',
      dataIndex: 'category_name',
      render: (text, record, index) => {
        const { title: indus_part_name = '' } = categorys.find(v => v.indus_part_id === record.indus_part_id) || {};
        return indus_part_name;
      },
    },
    {
      title: '品牌',
      dataIndex: 'indus_brand_name',
      render: (text, record, index) => {
        const { indus_brand_name = '' } = INDUS.find(v => v.indus_brand_id === record.indus_brand_id) || {};
        return indus_brand_name;
      },
    },
    {
      title: '适配车型',
      dataIndex: 'match_brands',
      render: (text, record, index) => <span onClick={() => onGoCarmodelFn()}>{text ? text.map((itm, idx) => <div key={idx}>{itm}</div>) : ''}</span>
    },
    { title: '异常状态', dataIndex: 'indus_partsku_exception_desc' },
    {
      title: '启用状态',
      dataIndex: 'indus_partsku_status',
      render: (text, record) => {
        return (
          <Switch
            checkedChildren="开"
            unCheckedChildren="关"
            checked={text === 'ENABLE' ? true : false}
            onChange={checked => {
              onChangePartStatus(record.indus_partsku_id, checked);
            }}
          />
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 100,
      render: (text, record, index) => (
        <span
          className="blue6 cur"
          onClick={() => {
            onEdit(record.category_id, record.indus_brand_id, record.indus_category_id, record.indus_partsku_id, record.indus_part_id);
          }}
        >
          编辑
        </span>
      ),
    },
  ];

  const tableProps = {
    loading: loading['indus_parts_list/fetchIndusPartskus'] || loading['indus_parts_list/fetchIndusStatusUpdate'] || loading['indus_parts_list/fetchIndusPartskusDel'],
    className: 'm-t-15',
    bordered: true,
    dataSource: INDUS_PARTSKUS.list,
    columns,
    rowKey: item => item.indus_partsku_id,
    pagination: {
      total: parseInt(INDUS_PARTSKUS.count, 10),
      pageSize: FIELDS.perpage,
      current: FIELDS.page,
      showSizeChanger: true,
      onShowSizeChange: (current, perpage) => onPageSizeChange(perpage),
      onChange: page => onPageChange(page),
      showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`,
    },
    rowSelection: {
      selectedRowKeys: selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        onSelectedRowKeys(selectedRowKeys);
      },
    },
  };

  return <Table {...tableProps} />;
};

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.indus_parts_list,
});

export default connect(mapStateToProps)(IndexTableList);
