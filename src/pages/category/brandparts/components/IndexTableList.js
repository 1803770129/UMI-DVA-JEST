import React from 'react';
import { Row, Table, Switch, Pagination } from 'antd';
import IndexTableTitle from './IndexTableTitle';
import router from 'umi/router';

export default ({ brandCategoryProductList, page, perpage, onHandleChangeProductStatusFn, onfetchOemCoverChange ,onChangeCategoryStatusFn, onRemoveCategoryFn, onShowSizeChange, onHandleTableChangeFn }) => {
  const columns = [
    { title: '产品名称', dataIndex: 'category_name', width: 200 },
    { title: '产品编码', dataIndex: 'brand_category_code', width: 200 },
    { title: '零件树节点名', dataIndex: 'category_parent_path' },
    { title: '车型覆盖率', dataIndex: 'oem_cover_rate', width: 100, render: (text, record, index) => <span className="cur link" onClick={() => {
      // await onfetchOemCoverChange(record.category_id)
      router.push({pathname:`/oe/cmcover/${record.category_id}`,query:{fromPage:'category/brandparts',category_id:record.category_id}})
    }}>{`${text}%`}</span>  },
    {
      title: '启用状态',
      dataIndex: 'brand_category_status',
      width: 120,
      render: (text, record, index) => {
        return <Switch
          checkedChildren='开'
          unCheckedChildren='关'
          defaultChecked={record.brand_category_status == 'ENABLE' ? true : false}
          checked={record.brand_category_status == 'ENABLE' ? true : false}
          onChange={checked => {onHandleChangeProductStatusFn(checked, record.brand_category_id, index);}}
        />;
      }
    }
  ];
  return (
    <React.Fragment>
      {/* 有数据时 */}
      {
        brandCategoryProductList.list.length !== 0 &&
                brandCategoryProductList.list.map((item, index) => (
                  <Table
                    key={index}
                    rowKey={(row, idx) => idx}
                    className={'m-t-15'}
                    bordered={true}
                    pagination={false}
                    dataSource={item.children}
                    columns={columns}
                    title={ () => <IndexTableTitle item={item} onChangeCategoryStatusFn={onChangeCategoryStatusFn} onRemoveCategoryFn={onRemoveCategoryFn} />}
                  />
                ))
      }
      {/* 分页 */}
      {
        brandCategoryProductList.list.length !== 0 &&
                <Row className="m-t-15 text-right">
                  <Pagination
                    total={parseInt(brandCategoryProductList.count, 10)}
                    pageSizeOptions={['1', '5', '10', '20']}
                    defaultPageSize={1}
                    pageSize={perpage}
                    current={page}
                    showSizeChanger={true}
                    onShowSizeChange={onShowSizeChange}
                    onChange={onHandleTableChangeFn}
                    showTotal={(total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`}
                  />
                </Row>
      }
      {/* 无数据时 */}
      {
        brandCategoryProductList.list.length === 0 &&
                <Table
                  className={'m-t-15'}
                  bordered={true}
                  pagination={false}
                  rowKey={(item, idx) => idx}
                  dataSource={[]}
                  columns={columns}
                />
      }
    </React.Fragment>
  );
};
