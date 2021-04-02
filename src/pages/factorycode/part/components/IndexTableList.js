import React from 'react';
import { Table, Switch } from 'antd';
import { connect } from 'dva';
// 获取品牌名
const getBrandName = (fms_brand_id, list = []) => {
  let s = list.find(v => v.fms_brand_id === fms_brand_id);
  return s ? s.fms_brand_name : '';
};

// 获取产品名
const getPartName = (fms_part_id, list = []) => {
  let s = list.find(v => v.fms_part_id === fms_part_id);
  return s ? s.title : '';
};

const IndexTableList = ({ loading, FIELDS, FMS_PARTSKUS, FMS_BRANDS, FMS_PARTS, selectedPartsRowKeys, onSelectedPartsRowKeysFn, onGoFmsPartEditFn, onChangePartStatusFn, onPageSizeChange, onPageChange, onGoCarmodelFn }) => {
  const columns = [
    {
      title: '产品编码',
      dataIndex: 'fms_partsku_code',
      render: (text, record, index) => record.fms_partsku_codes.map((itm, idx) => <div key={idx}>{itm}</div>),
    },
    { title: '产品', dataIndex: 'category_name', render: (text, record, index) => getPartName(record.fms_part_id, FMS_PARTS.categorys) },
    { title: '品牌', dataIndex: 'fms_brand_name', render: (text, record, index) => getBrandName(record.fms_brand_id, FMS_BRANDS) },
    {
      title: '适配车型',
      dataIndex: 'match_brands',
      render: (text, record, index) => <span onClick={() => onGoCarmodelFn()}>{text ? text.map((brand, idx) => <div key={idx}>{brand}</div>) : '-'}</span>,
    },
    { title: '异常状态', dataIndex: 'fms_partsku_exception_desc' },
    {
      title: '启用状态',
      dataIndex: 'fms_partsku_status',
      render: (text, record) => {
        return (
          <Switch
            checkedChildren="开"
            unCheckedChildren="关"
            checked={record.fms_partsku_status === 'ENABLE' ? true : false}
            onChange={checked => {
              onChangePartStatusFn(record.fms_partsku_id, checked);
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
            onGoFmsPartEditFn(record.category_id, record.fms_brand_id, record.fms_category_id, record.fms_partsku_id, record.fms_part_id);
          }}
        >
          编辑
        </span>
      ),
    },
  ];

  const tableProps = {
    loading: loading['fms_parts_list/fetchFmsPartskus'] || loading['fms_parts_list/pageInit'] || loading['fms_parts_list/fetchFmsStatusUpdate'] || loading['fms_parts_list/delFmsPart'],
    className: 'm-t-15',
    bordered: true,
    dataSource: FMS_PARTSKUS.list,
    columns,
    rowKey: item => item.fms_partsku_id,
    pagination: {
      total: parseInt(FMS_PARTSKUS.count, 10),
      pageSize: FIELDS.perpage,
      current: FIELDS.page,
      showSizeChanger: true,
      onShowSizeChange: (current, perpage) => onPageSizeChange(current, perpage),
      onChange: page => onPageChange(page),
      showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`,
    },
    rowSelection: {
      selectedRowKeys: selectedPartsRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        onSelectedPartsRowKeysFn(selectedRowKeys);
      },
    },
  };

  return <Table {...tableProps} />;
};

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.fms_parts_list,
});
export default connect(mapStateToProps)(IndexTableList);
