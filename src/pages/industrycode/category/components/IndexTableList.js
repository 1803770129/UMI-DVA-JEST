import React from 'react';
import { Row, Col, Table, Switch, Pagination } from 'antd';
import '../index.less';

export default props => {
    const { loading, searchFields, fmsCategoriesList, onHandlePageChangeFn, onHandlePageSizeChangeFn, onGoFmsCategoryDetailFn, onChangeCategoryStatusFn, onChangePartStatusFn } = props;
    
    const columns = [
        { title: '产品名', dataIndex: 'category_name' },
        { title: '产品数量', dataIndex: 'count', width: 200 },
        {
            title: '启用状态',
            dataIndex: 'indus_part_status',
            width: 250,
            render: (text, record, index) => (
                <Switch 
                    checkedChildren="开" 
                    unCheckedChildren="关" 
                    defaultChecked={record.indus_part_status} 
                    checked={record.indus_part_status}
                    onChange={checked => {onChangePartStatusFn(record.indus_category_id, record.indus_part_id, checked);}} 
                />
            )
        },
        {
            title: '操作',
            dataIndex: 'operation',
            width: 200,
            render: (text, record, index) => (
                <span className="blue6 cur" onClick={() => {onGoFmsCategoryDetailFn(record.category_id, record.indus_brand_id, record.indus_category_id, record.indus_part_id);}}>产品管理</span>
            )
        }
    ];

    const TableTitle = categoryInfo => {
        return (
            <Row type="flex" justify="space-between">
                <Col>
                    <strong>品牌：</strong>{categoryInfo.indus_brand_name} &emsp; <strong>品类：</strong>{categoryInfo.brand_category_name}
                </Col>
                <Col>
                    启用状态：
                    <Switch
                        checkedChildren="开"
                        unCheckedChildren="关"
                        defaultChecked={categoryInfo.indus_category_status}
                        checked={categoryInfo.indus_category_status}
                        onChange={checked => {onChangeCategoryStatusFn(categoryInfo.indus_category_id, checked);}}
                    />
                </Col>
            </Row>
        );
    };

    const tableProps = {
        loading: loading,
        showHeader: false,
        bordered: true,
        columns,
        pagination: false,
        rowKey: (item, index) => index
    };

    return (
        <div className="factorycode-category">
            {/* 表格头 */}
            <Table {...tableProps} dataSource={[]} showHeader={true} title={null} bordered={true} className="factorycode-category-nobody m-t-15" />
            {/* 表格 */}
            {
                fmsCategoriesList.list.length !== 0 &&
                fmsCategoriesList.list.map(item => {
                    return (
                        <Table
                            key={item.categoryInfo.indus_category_id}
                            {...tableProps}
                            dataSource={item.parts}
                            title={() => TableTitle(item.categoryInfo)}
                            className="m-t-15"
                        />
                    );
                })
            }
            {
                fmsCategoriesList.list.length === 0 && <Table　{...tableProps} dataSource={[]} className="m-t-15" />
            }
            {/* 分页器 */}
            {
                fmsCategoriesList.list.length !== 0 &&
                <Row className="m-t-15 text-right">
                    <Pagination 
                        total = {parseInt(fmsCategoriesList.count, 10)}
                        pageSizeOptions = {['2', '5', '10', '20']}
                        defaultPageSize = {2}
                        pageSize = {searchFields.perpage}
                        current = {searchFields.page}
                        showSizeChanger = {true}
                        onShowSizeChange = {(current, perpage) => onHandlePageSizeChangeFn(current, perpage)}
                        onChange = {page => onHandlePageChangeFn(page)}
                        showTotal = {(total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`}
                    />
                </Row>
            }
        </div>
    );
};