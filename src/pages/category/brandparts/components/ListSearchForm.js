import React from 'react';
import { Row, Col, Form, Button, Select } from 'antd';
import InputClose from '@/components/InputClose/index';
const Option = Select.Option;
const FormItem = Form.Item;

const SearchForm = ({ fields, brandCategoryList, onHandleSubmitFn, form }) => {
  const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
  const submitFn = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        onHandleSubmitFn(values);
      }
    });
  };

  return (
    <Form layout="inline" onSubmit={e => {submitFn(e);}}>
      <Row type="flex" justify="space-between">
        <Col>
          <FormItem label="品牌件">
            {
              getFieldDecorator('brand_category_id', { 
                initialValue: fields.brand_category_id
              })(
                <Select style={{ width: 150 }}>
                  <Option value=''>全部</Option>
                  { 
                    brandCategoryList.map(item => <Option key={item.brand_category_id} value={item.brand_category_id}>{item.brand_category_name}</Option>) 
                  }
                </Select>
              )
            }
          </FormItem>
          {/* <FormItem label="产品">
                        {
                            getFieldDecorator('category_name', { 
                                initialValue: fields.category_name
                            })(
                                <span style={{ width: '120px', display: 'inline-block' }}>
                                    <InputClose onClear={ () => setFieldsValue({ 'category_name': '' }) } field={getFieldValue('category_name')} />
                                </span>
                            )
                        }
                    </FormItem> */}
          <FormItem>
            <Button type="primary" htmlType="submit">查询</Button>
          </FormItem>
        </Col>
      </Row>
    </Form>
  );
};

export default Form.create()(SearchForm);