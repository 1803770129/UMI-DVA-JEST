import React from 'react';
import { Form, Row, Col, Select } from 'antd';
import '../index.less';
const FormItem = Form.Item;
const Option = Select.Option;

const SearchForm = ({ form, searchFields, fmsBrandsDropList, fmsCategoriesDropList, onChangeFmsBrandFn, onChangeFmsCategoryFn }) => {
  // 搜索表单
  const { getFieldDecorator, setFieldsValue } = form;

  // 切换大厂品牌
  const handleChangeFmsBrandFn = fms_brand_id => {
    onChangeFmsBrandFn(fms_brand_id);
    setFieldsValue({'fms_category_id': undefined});
  };

  // 切换大厂品类
  const handleChangeFmsCategory = fms_category_id => {
    onChangeFmsCategoryFn(fms_category_id);
  };

  return (
    <Form layout="inline">
      <Row type="flex" justify="space-between" gutter={8}>
        <Col>
          <FormItem label="大厂品牌">
            {getFieldDecorator('fms_brand_id', {
              initialValue: searchFields.fms_brand_id
            })(
              <Select
                style={{ width: 150 }}
                placeholder="请选择"
                showSearch
                filterOption={(value, option) => option.props.children.toLowerCase().indexOf(value.toLowerCase()) >= 0}
                onChange={e => handleChangeFmsBrandFn(e)}
              >
                {
                  fmsBrandsDropList.map(item => <Option key={item.fms_brand_id} value={item.fms_brand_id}>{item.fms_brand_name}</Option>)
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="大厂品类">
            {getFieldDecorator('fms_category_id', {
              initialValue: searchFields.fms_category_id
            })(
              <Select
                style={{ width: 150 }}
                placeholder="请选择"
                disabled={!searchFields.fms_brand_id}
                showSearch
                filterOption={(value, option) => option.props.children.toLowerCase().indexOf(value.toLowerCase()) >= 0}
                onChange={e => handleChangeFmsCategory(e)}
              >
                {
                  fmsCategoriesDropList.map(item => <Option key={item.fms_category_id} value={item.fms_category_id}>{item.brand_category_name}</Option>)
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
