import React from 'react';
import { Row, Col, Form, Select } from 'antd';
const Option = Select.Option;
const FormItem = Form.Item;

export default ({ isAdd, brandsDropList, onChangeBrandFn, onChangeSystemTipFn }) => {
    return (
        <Form layout="inline">
            <Row type="flex" justify="space-between" gutter={16}>
                <Col>
                    <FormItem label="车型品牌">
                        <Select 
                            style={{ minWidth: 300 }}
                            showSearch 
                            defaultValue={''}
                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            onChange={e => onChangeBrandFn(e)}
                            disabled={isAdd}
                        >
                            <Option value="">全部</Option>
                            {
                                brandsDropList.map((item, index) => {
                                    return <Option key={index} value={item.cm_brand}>{item.label}</Option>;
                                })
                            }
                        </Select>
                    </FormItem>
                    <FormItem label="系统提醒">
                        <Select 
                            style={{ width: 150 }} 
                            onChange={e => onChangeSystemTipFn(e)} 
                            defaultValue={''}
                            disabled={isAdd}
                        >
                            <Option value="">全部</Option>
                            <Option value="unmatch">有</Option>
                            <Option value='match'>无</Option>
                        </Select>
                    </FormItem>
                </Col>
            </Row>
        </Form>
    );
};