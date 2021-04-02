import React from 'react';
import { Form, Row, Col, Select } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

const SearchForm = ({ form, fmsBrandDropList, searchFields, onChangeBrandFn, onChangeStatusFn }) => {
    const { getFieldDecorator } = form;
    

    const filterFn = (value, option) => option.props.children.toLowerCase().indexOf(value.toLowerCase()) >= 0;

    return (
        <Form layout="inline">
            <Row type="flex" justify="space-between" gutter={8}>
                <Col>
                    <FormItem label="启用状态">
                        {getFieldDecorator('indus_brand_status', {
                            initialValue: searchFields.indus_brand_status
                        })(
                            <Select 
                                style={{ width: 150 }}
                                onChange={e => onChangeStatusFn(e)}
                            >
                                <Option value="ENABLE">启用</Option>
                                <Option value="DISABLE">禁用</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="行业协会">
                        {getFieldDecorator('indus_brand_id', {
                            initialValue: searchFields.indus_brand_id
                        })(
                            <Select 
                                style={{ width: 150 }} 
                                showSearch 
                                filterOption={(value, option) => filterFn(value, option)}
                                onChange={e => onChangeBrandFn(e)}
                            >
                                <Option value="">全部</Option>
                                {
                                    fmsBrandDropList.map(list => {
                                        return (
                                            <Option key={list.indus_brand_id} value={list.indus_brand_id}>
                                                {list.indus_brand_name}
                                            </Option>
                                        );
                                    })
                                }
                            </Select>
                        )}
                    </FormItem>
                </Col>
            </Row>
        </Form>
    );
};

const IndexSearchForm = Form.create()(SearchForm);
export default IndexSearchForm;