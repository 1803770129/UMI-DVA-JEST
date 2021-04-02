import React from 'react';
import { Form, Row, Col, Select, Button, Cascader  } from 'antd';
import InputClose from '@/components/InputClose';
const FormItem = Form.Item;
const Option = Select.Option;

const SearchForm = props => {
  const { 
    form, 
    searchFields, 
    serviceList, 
    addressList, 
    onSubmitFn,
    onChangeSearchFormFn
  } = props;

  const { getFieldDecorator, validateFields, getFieldValue, setFieldsValue } = form;

  const handleSubmitFn = e => {
    e.preventDefault();
    validateFields(async (err, values) => {
      if (!err) {
        onSubmitFn(values);
      }
    });
  };

  return (
    <Form layout="inline" onSubmit={e => handleSubmitFn(e)}>
      <Row type="flex" justify="space-between" gutter={8}>
        <Col>
          <FormItem label="类型定义">
            {
              getFieldDecorator('company_type', {
                initialValue: searchFields.company_type
              })(
                <Select
                  style={{ width: 90 }}
                  showSearch
                  placeholder="请选择"
                  onChange={e => onChangeSearchFormFn('company_type', e)}
                >
                  <Option key={-1} value="">全部</Option>
                  <Option key={1} value="TENANT">厂家</Option>
                  <Option key={2} value="MEMBER">会员</Option>
                </Select>
              )
            }
          </FormItem>
          <FormItem label="服务状态">
            {
              getFieldDecorator('tenant_status', {
                initialValue: searchFields.tenant_status
              })(
                <Select
                  style={{ width: 90 }}
                  showSearch
                  placeholder="请选择"
                  onChange={e => onChangeSearchFormFn('tenant_status', e)}
                >
                  <Option key={-1} value="">全部</Option>
                  <Option key={1} value="INSERVICE">服务中</Option>
                  <Option key={2} value="BANNED">已封禁</Option>
                </Select>
              )
            }
          </FormItem>
          <FormItem label="已开通服务">
            {
              getFieldDecorator('app_channel', {
                initialValue: searchFields.app_channel
              })(
                <Select
                  style={{ width: 160 }}
                  showSearch
                  placeholder="请选择"
                  onChange={e => onChangeSearchFormFn('app_channel', e)}
                >
                  <Option key={-1} value="">全部</Option>
                  {
                    serviceList.map((item, index) => {
                      return <Option key={index} value={item.app_channel}>{item.app_channel_name}</Option>;
                    })
                  }
                </Select>
              )
            }
          </FormItem>
          <FormItem label="商户等级">
            {
              getFieldDecorator('tenant_level', {
                initialValue: searchFields.tenant_level
              })(
                <Select
                  style={{ width: 80 }}
                  showSearch
                  placeholder="请选择"
                  onChange={e => onChangeSearchFormFn('tenant_level', e)}
                >
                  <Option key={-1} value="">全部</Option>
                  <Option key={0} value="PROBATION">试用</Option>
                  <Option key={1} value="NORMAL">普通</Option>
                </Select>
              )
            }
          </FormItem>
        </Col>
      </Row>
      <Row type="flex" justify="space-between" gutter={8}>
        <Col>
          <FormItem label="省/市/县区">
            {
              getFieldDecorator('province_city_country', {
                initialValue: searchFields.province_city_country
              })(
                <Cascader 
                  options={addressList} 
                  placeholder='请选择' 
                  allowClear={true} 
                  style={{minWidth: 280}}
                  changeOnSelect={true}
                  onChange={e => onChangeSearchFormFn('province_city_country', e)}
                ></Cascader>
              )
            }
          </FormItem>
          <FormItem label="星级">
            {
              getFieldDecorator('evaluate_operator', {
                initialValue: searchFields.evaluate_operator
              })(
                <Select
                  style={{ width: 80 }}
                  showSearch
                  placeholder="请选择"
                  onChange={e => onChangeSearchFormFn('evaluate_operator', e)}
                >
                  <Option key={-1} value="">全部</Option>
                  <Option key={0} value="eq">等于</Option>
                  <Option key={2} value="gt">大于</Option>
                  <Option key={1} value="lt">小于</Option>
                </Select>
              )
            }
          </FormItem>
          <FormItem>
            {
              getFieldDecorator('company_evaluate', {
                initialValue: searchFields.company_evaluate
              })(
                <Select
                  style={{ width: 80 }}
                  showSearch
                  placeholder="请选择"
                  onChange={e => onChangeSearchFormFn('company_evaluate', e)}
                >
                  <Option key={-1} value="">全部</Option>
                  <Option key={5} value="5">5星</Option>
                  <Option key={4} value="4">4星</Option>
                  <Option key={3} value="3">3星</Option>
                  <Option key={2} value="2">2星</Option>
                  <Option key={1} value="1">1星</Option>
                </Select>
              )
            }
          </FormItem>
          <FormItem label="关键字搜索">
            {
              getFieldDecorator('search_key', {
                initialValue: searchFields.search_key
              })(
                <Select
                  style={{ width: 100 }}
                  showSearch
                  placeholder="请选择"
                >
                  <Option key={0} value="company_name">商户名称</Option>
                  <Option key={1} value="contact">联系人</Option>
                  <Option key={2} value="contact_phone">手机号</Option>
                </Select>
              )
            }
          </FormItem>
          <FormItem>
            {
              getFieldDecorator('search_val', {
                initialValue: searchFields.search_val
              })(
                <div style={{width: 150}}>
                  <InputClose onClear={ () => setFieldsValue({'search_val': ''}) } field={getFieldValue('search_val')} />
                </div>
              )
            }
          </FormItem>
          <FormItem>
            <Button type="primary" htmlType="submit">搜索</Button>
          </FormItem>
        </Col>
      </Row>
    </Form>
  );
};

const IndexSearchForm =  Form.create()(SearchForm);
export default IndexSearchForm;