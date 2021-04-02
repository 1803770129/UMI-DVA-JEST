import { Table } from 'antd';
import styles from './OeSearchForm.less';
import router from 'umi/router';
import { getCarmodelStatusColor } from '@/utils/tools';

// OE列表
let columns = [
  { title: '产品', dataIndex: 'category_name', width: 120 },
  { title: 'OE码', dataIndex: 'oem_partsku_codes', width: 120 },
  { title: '车型品牌', dataIndex: 'cm_brand_name' },
  { title: '标准码', dataIndex: 'std_partsku_code', width: 190 },
  { title: '属性', dataIndex: 'oem_partsku_values' },
  { title: '创建人', dataIndex: 'create_origin', width: 120 },
  { title: '创建时间', dataIndex: 'create_time', width: 100 },
  { title: '异常状态', dataIndex: 'oem_partsku_exception_desc', width: 200 },
  { title: '审核状态', dataIndex: 'filter_status', width: 80 },
  { title: '合并提示', dataIndex: 'merge_value' },
  { title: '操作', dataIndex: 'operation', width: 60,fixed:'right' },
];

export default ({
  loading,
  selectedRowKeys,
  FIELDS,
  OEMSKU_LIST,
  onFetchOemskuList,
  onChangeSelectedRows,
  OEMSKU,
  OEMSKUA
}) => {
  let OEMSKUArr=[...OEMSKUA];
  let oemArrList=[];
  OEMSKUArr.forEach(item=>{
    let oemObj={};
    oemObj['title']=item.category_pro_group?item.category_pro_name+'['+item.category_pro_group+']':item.category_pro_name;
    oemObj['dataIndex']=item.category_pro_id;
    oemArrList.push(oemObj);
  });
  // console.log(oemArrList)
  const { list, count } = OEMSKU_LIST;
  let List=[...list];
  let tableList=[];
  List.forEach(item=>{
    if(item.oem_partsku_values.length!==0){
      item.oem_partsku_values.forEach(val=>{
        for(let key in val){
          item[key]=val[key];
        }
      });
    }
    tableList.push(item);
  });
  // console.log(tableList);
  columns.forEach(item => {
    if(item.dataIndex==='oem_partsku_values'){
      item['children']=oemArrList;
    }
    item.render = (text, record, index) => {
      // OE码
      if (item.dataIndex === 'oem_partsku_codes') {
        return text.length !== 0 ? text.map((itm, idx) => <div key={idx}>{itm}</div>) : '虚拟OE';
      }
      // 标准码
      if (item.dataIndex === 'std_partsku_code') {
        return (
          <span
            className="blue6 cur"
            onClick={() => {
              router.push(
                '/standardcode/list/' +
                  record.std_partsku_id +
                  '?std_partsku_id=' +
                  record.std_partsku_id
              );
            }}
            title="点击跳转到对应的标准码编辑页"
          >
            {text}
          </span>
        );
      }
      // 属性

      // 异常状态
      if (item.dataIndex === 'oem_partsku_exception_desc') {
        return (
          <span className={styles.tdContent} title={text}>
            {text}
          </span>
        );
      }
      // 审核状态
      if (item.dataIndex === 'filter_status') {
        const _className = getCarmodelStatusColor(record.oem_partsku_status);
        return record.filter_status == '待审核' ? (
          <span className={_className}>{record.filter_status}</span>
        ) : (
          <span className={_className}>{record.filter_status}</span>
        );
      }
      // 操作
      if (item.dataIndex === 'operation') {
        return (
          <span
            className="blue6 cur"
            onClick={() => {
              router.push(
                '/oe/list/' + record.oem_partsku_id + '?oem_partsku_id=' + record.oem_partsku_id
              );
            }}
          >
            编辑
          </span>
        );
      }
      return text || '-';
    };
  });
  // console.log(columns)
  let tableProps = {
    showHeader: false,
    loading: loading,
    dataSource: tableList,
    bordered: true,
    columns,
    rowKey: (item, index) => index,
    rowSelection: {
      selectedRowKeys: selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        onChangeSelectedRows(selectedRowKeys);
      },
    },
    pagination: {
      total: count,
      pageSize: FIELDS.perpage,
      current: FIELDS.page,
      showSizeChanger: true,
      onShowSizeChange: (current, perpage) =>
        onFetchOemskuList({ ...FIELDS, page: 1, perpage }),
      onChange: (current, perpage) => onFetchOemskuList({ ...FIELDS, page: current, perpage }),
      showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`,
    },
  };
  return <Table {...tableProps} scroll={{x:'max-content'}} showHeader={true} />;
};
