import { Table } from 'antd';

export default ({ loading, data, pros }) => {
  const columns = pros.map(v => {
    let obj = { dataIndex: v.key, title: v.name };
    switch (v.key) {
      case 'cm_sales_year':
        obj.render = (text, row) => `${row.cm_sales_year} - ${row.cm_stop_year}`;
        break;
      default:
        break;
    }
    return obj;
  }).filter(v => v.key !== 'cm_stop_year');
  const tableProps = {
    bordered: true,
    loading: loading['oe_tmp/fetchOemTmpCmvalues'],
    dataSource: data,
    columns,
    pagination: false,
    rowKey: (row, index) => index
  };
  return <Table {...tableProps} />;
};








