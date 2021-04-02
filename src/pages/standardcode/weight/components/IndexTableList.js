import React from 'react';
import { Table } from 'antd';

const columns = [
    { title: '通用依据', dataIndex: 'std_weight_type' }, 
    { title: '品牌名称', dataIndex: 'all_brand_name' }, 
    { title: '产品', dataIndex: 'category_name' }, 
    { title: '通用权重', dataIndex: 'std_weight_num', width: 90, sorter: (a, b) => a.std_weight_num - b.std_weight_num }, 
    { title: '操作', dataIndex: 'operation', width: 60 }
];

export default ({ loading, searchFields, stdSkuWeightList, onHandleCommonWeightModalFn, onHandlePageSizeChangeFn, onHandlePageChangeFn }) => {
    columns.forEach(col => {
        if(col.dataIndex == 'operation') {
            col.render = (text, record, index) => <span className="blue6 cur" onClick={() => {onHandleCommonWeightModalFn(record);}}>编辑</span>;
        }
    });
    // 分页配置
    const pagination = {
        total: parseInt(stdSkuWeightList.count, 10),
        pageSize: searchFields.perpage,
        current: searchFields.page,
        showSizeChanger: true,
        onShowSizeChange: (current, perpage) => onHandlePageSizeChangeFn(current, perpage),
        onChange: page => onHandlePageChangeFn(page),
        showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`
    };
    return (
        <Table 
            loading={loading}
            rowKey={item => item.std_weight_id}
            bordered={true} 
            dataSource={stdSkuWeightList.list} 
            columns={columns} 
            pagination={pagination} 
        />
    );
};