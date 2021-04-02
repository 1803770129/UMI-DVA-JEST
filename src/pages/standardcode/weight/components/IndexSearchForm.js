import React from 'react';
import { Form, Cascader, Select, Row, Col, InputNumber, Button } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

const TopSearchForm = props => {
  const { form, partSkuBrand, categoryTree, onHandleSubmitFn, fetchPartSkuBrandFn } = props;
  const { getFieldDecorator } = form;

  // 点击查询
  const handleSubmit = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        onHandleSubmitFn(values);
      }
    });
  };

  // 切换通用依据，联动查询其品牌
  const changeStdWeightTypeFn = val => {
    fetchPartSkuBrandFn(val);
    props.form.setFieldsValue({'all_brand_id': ''});
  };

  // 车型搜索过滤
  const handleCarmodelFilterFn = (inputValue, selectedOptions) => {
    return selectedOptions.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase().trim()) > -1);
  };
  return (
        
    <Form layout="inline" onSubmit={handleSubmit}>
      <Row type="flex" justify="space-between">
        <Col>
          <FormItem label="通用依据">
            {getFieldDecorator('std_weight_type', {
              initialValue: 'TENANT'
            })(
              <Select style={{width: 250}} onChange={e => {changeStdWeightTypeFn(e);}}>
                <Option value="TENANT">商户码</Option>
                <Option value="INDUSTRY">D码</Option>
                <Option value="FAMOUS">大厂码</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="品牌名称">
            {getFieldDecorator('all_brand_id', {
              initialValue: ''
            })(
              <Select 
                style={{width: 140}}
                showSearch 
                // allowClear
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                <Option value="">全部</Option>
                {
                  partSkuBrand.map(item => <Option key={item.all_brand_id} value={item.all_brand_id}>{item.all_brand_name}</Option>)
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="产品">
            {getFieldDecorator('category_id', {
              initialValue: '',
              rules: [{ required: true, message: '必填项' }]
            })(
              <Cascader
                options={categoryTree}
                placeholder="请选择"
                style={{ width: 300 }}
                allowClear={false}
                showSearch={{ filter: handleCarmodelFilterFn, matchInputWidth: true, limit: false }}
                // changeOnSelect={true}
              />
            )}
          </FormItem>
        </Col>
      </Row>
      <Row type="flex" justify="space-between" className="m-t-10">
        <Col>
          <FormItem label="权重区间">
            {
              getFieldDecorator('std_weight_num_min', {
                initialValue: '1'
              })(
                <InputNumber min={1} max={10} style={{width:100}} />
              )
            }
          </FormItem> 
          <FormItem>~</FormItem> 
          <FormItem>
            {
              getFieldDecorator('std_weight_num_max', {
                initialValue: '10'
              })(
                <InputNumber min={1} max={10} style={{width:100}} />
              )
            }
          </FormItem> 
          <FormItem>
            <Button type="primary" htmlType="submit">查询</Button>
          </FormItem> 
        </Col>
      </Row>   

    </Form>
  );
};

const TopSearch = Form.create()(TopSearchForm);
export default TopSearch;