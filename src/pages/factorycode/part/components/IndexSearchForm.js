import React from 'react';
import { Form, Row, Col, Select, Button, Spin } from 'antd';
import InputClose from '@/components/InputClose/index';
import { connect } from 'dva';
import styles from './IndexSearchForm.less';
const FormItem = Form.Item;
const Option = Select.Option;

const SearchForm = props => {
  const { form, loading, FIELDS, CATEGORY_TREE, FMS_BRANDS, FMS_PARTS, onSubmit, onChangeSelect } = props;
  const { categorys } = FMS_PARTS;
  const { getFieldDecorator, validateFields, getFieldValue, setFieldsValue } = form;
  // 点击查询【主要针对产品编码】
  const handleSubmitFn = e => {
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        onSubmit(values);
      }
    });
  };

  return (
    <Spin spinning={!!(loading['fms_parts_list/fetchCategoryTree'] || loading['fms_parts_list/fetchFmsBrands'] || loading['fms_parts_list/fetchFmsParts'])}>
      <Form className={styles.search_form} onSubmit={e => handleSubmitFn(e)}>
        <Row gutter={16}>
          <Col span={4}>
            <FormItem label="大厂品类">
              {getFieldDecorator('brand_category_id', {
                initialValue: FIELDS.brand_category_id,
              })(
                <Select placeholder="请选择" disabled={CATEGORY_TREE.length === 0} onChange={value => onChangeSelect('brand_category_id', value)}>
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
          </Col>
          <Col span={4}>
            <FormItem label="大厂品牌">
              {getFieldDecorator('fms_brand_id', {
                initialValue: FIELDS.fms_brand_id,
              })(
                <Select placeholder="请选择" disabled={!getFieldValue('brand_category_id')} onChange={value => onChangeSelect('fms_brand_id', value)}>
                  {FMS_BRANDS.map(v => {
                    return (
                      <Option key={v.fms_brand_id} value={v.fms_brand_id}>
                        {v.fms_brand_name}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem label="产品">
              {getFieldDecorator('fms_part_id', {
                initialValue: FIELDS.fms_part_id,
              })(
                <Select placeholder="请选择" disabled={!getFieldValue('brand_category_id') || !getFieldValue('fms_brand_id')  } onChange={value => onChangeSelect('fms_part_id', value)}>
                  {categorys.map(v => {
                    return (
                      <Option key={v.fms_part_id} value={v.fms_part_id}>
                        {v.title}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem label="产品编码">
              {getFieldDecorator('fms_partsku_code', {
                initialValue: FIELDS.fms_partsku_code,
              })(
                <span>
                  <InputClose onClear={() => setFieldsValue({ fms_partsku_code: '' })} field={getFieldValue('fms_partsku_code')} />
                </span>
              )}
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem label="OE码">
              {getFieldDecorator('oem_partsku_code', {
                initialValue: FIELDS.oem_partsku_code,
              })(
                <span>
                  <InputClose onClear={() => setFieldsValue({ oem_partsku_code: '' })} field={getFieldValue('oem_partsku_code')} />
                </span>
              )}
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem label="异常状态" style={{ marginRight: 0 }}>
              {getFieldDecorator('exception_status', {
                initialValue: FIELDS.exception_status,
              })(
                <Select allowClear placeholder="请选择">
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
        </Row>
        <Row>
          <Col span={12}>
            <a href="#!" className="m-r-10">
              下载产品属性数据模板
            </a>
            <Button type="primary" ghost icon="upload" className="m-r-10">
              导入产品属性数据
            </Button>
            <Button type="primary" ghost icon="upload">
              批量导入产品图片
            </Button>
          </Col>
          <Col span={12} className="text-right">
            <Button type="primary" htmlType="submit">
              查询
            </Button>
          </Col>
        </Row>
      </Form>
    </Spin>
  );
};

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.fms_parts_list,
});

export default Form.create()(connect(mapStateToProps)(SearchForm));
