import React from 'react';
import { Form, Row, Col, Select, Button } from 'antd';
import InputClose from '@/components/InputClose/index';
const FormItem = Form.Item;
const Option = Select.Option;

const SearchForm = ({ form, searchFields, onSubmitFn, onChangeSearchParamsFn }) => {

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
          <FormItem label="品牌标识">
            {getFieldDecorator('cm_hot_flag', {
              initialValue: searchFields.cm_hot_flag
            })(
              <Select
                style={{ width: 80 }}
                showSearch
                placeholder="请选择"
                onChange={e => onChangeSearchParamsFn('cm_hot_flag', e)}
              >
                <Option key={1} value="HOT">热门</Option>
                <Option key={2} value="NORMAL">普通</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="品牌名称">
            {
              getFieldDecorator('cm_brand_name', {
                initialValue: searchFields.cm_brand_name
              })(
                <div style={{width: 150}}>
                  <InputClose onClear={ () => setFieldsValue({'cm_brand_name': ''}) } field={getFieldValue('cm_brand_name')} />
                </div>
              )
            }
          </FormItem>
          <FormItem label="车系国别">
            {
              getFieldDecorator('cm_brand_country', {
                initialValue: searchFields.cm_brand_country
              })(
                <Select
                  style={{ width: 100 }}
                  showSearch
                  placeholder="请选择"
                  onChange={e => onChangeSearchParamsFn('cm_brand_country', e)}
                >
                  {/* <Option key={1} value="ALL">全部车系</Option>
                  <Option key={2} value="国产车系">国产车系</Option>
                  <Option key={3} value="日韩车系">日韩车系</Option>
                  <Option key={4} value="欧美车系">欧美车系</Option>
                  <Option key={5} value="EMPTY">空</Option> */}
                  <Option key={1} value="ALL">全部车系</Option>
                  <Option key={2} value="国产">国产</Option>
                  <Option key={3} value="日系">日系</Option>
                  <Option key={4} value="韩系">韩系</Option>
                  <Option key={5} value="欧系">欧系</Option>
                  <Option key={6} value="美系">美系</Option>
                  <Option key={7} value="EMPTY">空</Option>
                </Select>
              )
            }
          </FormItem>
          <FormItem label="主机厂名称">
            {
              getFieldDecorator('cm_factory_name', {
                initialValue: searchFields.cm_factory_name
              })(
                <div style={{width: 180}}>
                  <InputClose onClear={ () => setFieldsValue({'cm_factory_name': ''}) } field={getFieldValue('cm_factory_name')} />
                </div>
              )
            }
          </FormItem>
          <FormItem label="品牌禁用状态">
            {
              getFieldDecorator('cm_brand_status', {
                initialValue: searchFields.cm_brand_status || 'ALL'
              })(
                <Select
                  style={{ width: 100 }}
                  placeholder="请选择"
                  onChange={e => onChangeSearchParamsFn('cm_brand_status', e)}
                >
                  <Option key={'ALL'} value="ALL">全部</Option>
                  <Option key={'ENABLE'} value="ENABLE">启用</Option>
                  <Option key={'DISABLE'} value="DISABLE">禁用</Option>
                </Select>
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
