import React from 'react';
import { Form, Row, Col, Select } from 'antd';
import '../index.less';
const FormItem = Form.Item;
const Option = Select.Option;

const SearchForm = ({ form, searchFields, fmsBrandsDropList, fmsCategoriesDropList, onChangeFmsBrandFn, onChangeFmsCategoryFn }) => {
  // 搜索表单
  const { getFieldDecorator, setFieldsValue } = form;

  // 切换大厂品牌
  const handleChangeFmsBrandFn = indus_brand_id => {
    onChangeFmsBrandFn(indus_brand_id);
    setFieldsValue({'indus_category_id': undefined});
  };

  // 切换大厂品类
  const handleChangeFmsCategory = indus_category_id => {
    onChangeFmsCategoryFn(indus_category_id);
  };

  return (
    <Form layout="inline">
      <Row type="flex" justify="space-between" gutter={8}>
        <Col>
          <FormItem label="行业协会">
            {getFieldDecorator('indus_brand_id', {
              initialValue: searchFields.indus_brand_id
            })(
              <Select
                style={{ width: 150 }}
                placeholder="请选择"
                showSearch
                filterOption={(value, option) => option.props.children.toLowerCase().indexOf(value.toLowerCase()) >= 0}
                onChange={e => handleChangeFmsBrandFn(e)}
              >
                {
                  fmsBrandsDropList.map(item => <Option key={item.indus_brand_id} value={item.indus_brand_id}>{item.indus_brand_name}</Option>)
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="行业协会品类">
            {getFieldDecorator('indus_category_id', {
              initialValue: searchFields.indus_category_id
            })(
              <Select
                style={{ width: 150 }}
                placeholder="请选择"
                disabled={!searchFields.indus_brand_id}
                showSearch
                filterOption={(value, option) => option.props.children.toLowerCase().indexOf(value.toLowerCase()) >= 0}
                onChange={e => handleChangeFmsCategory(e)}
              >
                {
                  fmsCategoriesDropList.map(item => <Option key={item.indus_category_id} value={item.indus_category_id}>{item.brand_category_name}</Option>)
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