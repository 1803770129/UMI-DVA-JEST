import { Table } from 'antd';

export default ({ loading, FIELDS, data, count, selectedRowKeys, onShowViewMatchCmModal, onTableSelectChange, onFetchOemTmpList, onShowViewPriceModal }) => {
  const columns = [
    { title: '产品', dataIndex: 'oem_tmp_partsku_partname' },
    { title: '车型品牌', dataIndex: 'oem_tmp_partsku_cmbrand' },
    { title: 'OE码', dataIndex: 'oem_tmp_partsku_code' },
    { title: 'OE配件名称', dataIndex: 'oem_tmp_partsku_name' },
    { title: '备注说明', dataIndex: 'oem_tmp_partsku_remark' },
    { title: '价格', dataIndex: 'oem_tmp_partsku_price_flag', render: (text, row) => text === 1 && <span className="cur link" onClick={() => onShowViewPriceModal(row)}>查看价格</span> },
    { title: '适配车型', dataIndex: 'match_cm', render: (text, row) => <span className="cur link" onClick={() => onShowViewMatchCmModal(row)}>查看适配车型</span> },
    { title: '创建人', dataIndex: 'oem_tmp_partsku_origin' },
    { title: '创建时间', dataIndex: 'create_time' }
  ];
  // 分页配置
  const pagination = {
    total: parseInt(count, 10),
    pageSize: FIELDS.perpage,
    current: FIELDS.page,
    showSizeChanger: true,
    onShowSizeChange: (current, perpage) => onFetchOemTmpList({...FIELDS, page: current, perpage}),
    onChange: page => onFetchOemTmpList({...FIELDS, page}),
    showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onTableSelectChange,
  };
  const tableProps = {
    className: 'm-t-15',
    bordered: true,
    rowKey: row  => row.oem_tmp_partsku_id,
    loading: loading['oe_tmp/fetchOemTmpList'],
    dataSource: data,
    columns,
    pagination,
    rowSelection
  };
  return (
    <>
      <Table {...tableProps} />
    </>
  );
};








