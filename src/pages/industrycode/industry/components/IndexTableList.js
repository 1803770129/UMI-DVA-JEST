import React from 'react';
import { Table } from 'antd';

export default ({ loading, searchFields, fmsBrandsList, onHandlePageSizeChangeFn, onHandlePageChangeFn, onGoFmsBrandDetailFn, onDeleteFmsBrandFn }) => {
    
    const columns = [
        { title: '行业协会', dataIndex: 'indus_brand_name' },
        { title: '行业协会描述', dataIndex: 'indus_brand_desc' },
        { title: '配件品类', dataIndex: 'categoryNames' },
        { title: '优先级', dataIndex: 'indus_brand_level' },
        { title: '启用状态', dataIndex: 'indus_brand_status', width: 80 },
        { title: '创建时间', dataIndex: 'create_time', width: 160 },
        {
            title: '操作',
            dataIndex: 'operation',
            width: 100,
            render: (text, record) => (
                <React.Fragment>
                    <span className="blue6 cur m-r-15" onClick={() => {onGoFmsBrandDetailFn(record.indus_brand_id);}}>编辑</span>
                    <span className="blue6 cur" onClick={() => {onDeleteFmsBrandFn(record.indus_brand_id);}}>删除</span>
                </React.Fragment>
            )
        }
    ];

    const tableProps = {
        loading: loading,
        bordered: true,
        className: 'm-t-15',
        dataSource: fmsBrandsList.list,
        columns,
        rowKey: item => item.indus_brand_id,
        pagination: {
            total: parseInt(fmsBrandsList.count, 10),
            pageSize: searchFields.perpage,
            current: searchFields.page,
            showSizeChanger: true,
            onShowSizeChange: (current, perpage) => onHandlePageSizeChangeFn(current, perpage),
            onChange: page => onHandlePageChangeFn(page),
            showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`
        }
    };

    return (
        <React.Fragment>
            <Table {...tableProps} />
        </React.Fragment>
    );
};