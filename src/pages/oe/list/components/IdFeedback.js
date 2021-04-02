import {  Row, Col, Table } from 'antd';

export default props => {
    const { OEMSKU_CARMODEL_FILTER_INFO } = props;
    const { data = {} } = OEMSKU_CARMODEL_FILTER_INFO;
    const columns1 = [
        { title: '品牌', dataIndex: 'cm_brand' },
        { title: '主机厂', dataIndex: 'cm_factory' },
        { title: '车型', dataIndex: 'cm_model' },
        { title: '年款', dataIndex: 'cm_model_year' },
        { title: '排量', dataIndex: 'cm_displacement' },
        {title: '其他属性', dataIndex: 'cm_other' }
    ];
    const columns2 = [
        { title: '产品', dataIndex: 'cm_product', width: 100 },
        { title: 'OE码',dataIndex: 'cm_oe', width: 300 },
        { title: 'OE产品信息', dataIndex: 'cm_info' }
    ];
    const columns3 = [
        { title: '商户品牌', dataIndex: 'ten_brand_name', width: 100 },
        { title: '产品编码', dataIndex: 'ten_partsku_code', width: 300 },
        { title: '产品信息', dataIndex: 'part_info' }
    ];
    const columns4 = [
        { title: '商户品牌', dataIndex: 'ten_brand_name', width: 100 },
        { title: '产品编码', dataIndex: 'ten_partsku_code', width: 300 },
        { title: '产品信息', dataIndex: 'part_info' }
    ];
    // ********* 表格配置 ********* 
    // 反馈车型
    const tableProps1 = {
        bordered: true,
        pagination: false,
        rowKey: (item, index) => index,
        dataSource: data.carmodelList,
        columns: columns1
    };
    // OE信息
    const tableProps2 = {
        bordered: true,
        pagination: false,
        rowKey: (item, index) => index,
        dataSource: data.oeInfoList,
        columns: columns2
    };
    // 商户反馈不适配车型
    const tableProps3 = {
        bordered: true,
        pagination: false,
        scroll: { y: 150 },
        rowKey: (item, index) => index,
        dataSource: data.filteredList,
        columns: columns3
    };
    // 已适配无反馈产品（参考）
    const tableProps4 = {
        bordered: true,
        pagination: false,
        scroll: { y: 150 },
        rowKey: (item, index) => index,
        dataSource: data.noFilterList,
        columns: columns4
    };
    return (
        <div>
            <Row>
                <Col className="f16">反馈车型</Col>
                <Col className="m-t-10">
                    <Table {...tableProps1} />
                </Col>
            </Row>

            <Row>
                <Col className="f16 m-t-10">OE信息</Col>
                <Col className="m-t-10">
                    <Table {...tableProps2} />
                </Col>
            </Row>

            <Row>
                <Col className="f16 m-t-10">商户反馈不适配产品</Col>
                <Col className="m-t-10">
                    <Table {...tableProps3} />
                </Col>
            </Row>

            <Row>
                <Col className="f16 m-t-10">已适配无反馈产品（参考)</Col>
                <Col className="m-t-10">
                    <Table {...tableProps4} />
                </Col>
            </Row>
        </div>
    );
};