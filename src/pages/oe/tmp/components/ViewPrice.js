import { Table } from 'antd';
import ENV from '@/utils/env';
import { isEmpty } from '@/utils/tools';

export default ({ loading, data }) => {
  const columns = [...ENV.area_prices];
  let pricesRow = {};
  columns.forEach(v => {
    pricesRow[v.dataIndex] = {oem_tmp_partsku_price: null};
    // 构造行结构
    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      if (v.dataIndex === p.oem_tmp_partsku_price_area_code) {
        pricesRow[v.dataIndex] = p;
      }
    }
    v.render = v => v.oem_tmp_partsku_price ? `￥${v.oem_tmp_partsku_price}` : '';
  });
  
  const dataSource = isEmpty(pricesRow) ? [] : [pricesRow];
  const tableProps = {
    bordered: true,
    loading: loading['oe_tmp/fetchOemTmpPrice'],
    dataSource: dataSource,
    columns,
    pagination: false,
    rowKey: (row, index) => index
  };
  return <Table {...tableProps} />;
};








