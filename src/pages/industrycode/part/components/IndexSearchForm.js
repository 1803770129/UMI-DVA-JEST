import React from 'react';
import { Form, Row, Col, Select, Button, Spin } from 'antd';
import InputClose from '@/components/InputClose/index';
import { connect } from 'dva';
import ENV from '@/utils/env';
const FormItem = Form.Item;
const Option = Select.Option;

const SearchForm = props => {
  const { form, loading, CATEGORY_TREE, INDUS, INDUS_PARTS, FIELDS, onChangeSelect, onSubmit } = props;
  const { categorys } = INDUS_PARTS;
  const { getFieldDecorator, validateFields, getFieldValue, setFieldsValue } = form;

  // 点击查询【主要针对产品编码】
  const handleSubmit = e => {
    e.preventDefault();
    validateFields(async (err, values) => {
      if (!err) {
        onSubmit(values);
      }
    });
  };

  return (
    <Spin spinning={!!(loading['indus_parts_list/fetchCategoryTree'] || loading['indus_parts_list/fetchIndus'] || loading['indus_parts_list/fetchIndusParts'])}>
      <Form layout="inline" onSubmit={handleSubmit}>
        <Row type="flex" justify="space-between" gutter={8}>
          <Col>
            <FormItem label="品类">
              {getFieldDecorator('brand_category_id', {
                initialValue: FIELDS.brand_category_id,
              })(
                <Select style={{ width: 120 }} placeholder="请选择" disabled={CATEGORY_TREE.length === 0} onChange={value => onChangeSelect('brand_category_id', value)}>
                  {CATEGORY_TREE.map(item => {
                    return (
                      <Option key={item.category_id} value={item.category_id}>
                        {item.title}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>

            <FormItem label="行业协会">
              {getFieldDecorator('indus_brand_id', {
                initialValue: FIELDS.indus_brand_id,
              })(
                <Select style={{ width: 100 }} placeholder="请选择" disabled={!getFieldValue('brand_category_id')} onChange={value => onChangeSelect('indus_brand_id', value)}>
                  {INDUS.map(item => {
                    return (
                      <Option key={item.indus_brand_id} value={item.indus_brand_id}>
                        {item.indus_brand_name}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>

            <FormItem label="产品">
              {getFieldDecorator('indus_part_id', {
                initialValue: FIELDS.indus_part_id,
              })(
                <Select style={{ width: 120 }} placeholder="请选择" disabled={!getFieldValue('brand_category_id') || !getFieldValue('indus_brand_id')} onChange={value => onChangeSelect('indus_part_id', value)}>
                  {categorys.map(item => {
                    return (
                      <Option key={item.indus_part_id} value={item.indus_part_id}>
                        {item.title}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
            <FormItem label="产品编码">
              {getFieldDecorator('indus_partsku_code', {
                initialValue: FIELDS.indus_partsku_code,
              })(
                <span style={{ display: 'inline-block', width: '150px' }}>
                  <InputClose onClear={() => setFieldsValue({ indus_partsku_code: '' })} field={getFieldValue('indus_partsku_code')} />
                </span>
              )}
            </FormItem>
            <FormItem label="OE码">
              {getFieldDecorator('oem_partsku_code', {
                initialValue: FIELDS.oem_partsku_code,
              })(
                <span style={{ display: 'inline-block', width: '150px' }}>
                  <InputClose onClear={() => setFieldsValue({ oem_partsku_code: '' })} field={getFieldValue('oem_partsku_code')} />
                </span>
              )}
            </FormItem>
          </Col>
          <Col>
            <FormItem style={{ marginRight: 0 }}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="异常状态">
              {getFieldDecorator('exception_status', {
                initialValue: FIELDS.exception_status,
              })(
                <Select placeholder="请选择" style={{ width: 250 }} onChange={value => onChangeSelect('exception_status', value)}>
                  <Option value="">全部</Option>
                  <Option value="EXC_IMAGE">缺少图片</Option>
                  <Option value="EXC_VALUE">缺少属性</Option>
                  <Option value="EXC_PRICE">缺少价格</Option>
                  <Option value="EXC_CODE">缺少产品编码</Option>
                  <Option value="EXC_CARMODEL">缺少车型</Option>
                  <Option value="EXC_STANDARD">缺少标准码</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={12} className="m-t-5 text-right">
            <a href="!#" className="m-r-10">
              下载产品属性数据模板
            </a>
            <Button type="primary" ghost icon="upload" className="m-r-10">
              导入产品属性数据
            </Button>
            <Button type="primary" ghost icon="upload">
              批量导入产品图片
            </Button>
          </Col>
        </Row>
      </Form>
    </Spin>
  );
};

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.indus_parts_list,
});

export default Form.create()(connect(mapStateToProps)(SearchForm));
