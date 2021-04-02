import React from 'react';
import { Form, Cascader, Select, Checkbox, Button, Input, Row, Col } from 'antd';
import styles from '../../../oe/list/components/OeSearchForm.less';
const FormItem = Form.Item;
const Option = Select.Option;

const IndexSearchForm = ({
  form, searchFields, handleDataStatusChange,
  categoryTree, onHandleSubmitSearchFn,
  initialValue, handleProductChangeFn
}) => {
  const { getFieldDecorator } = form;
  const handleSubmit = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        onHandleSubmitSearchFn(values);
      }
    });
  };
  const filter = (inputValue, path) => {
    return (path.some(option => (option.label).toLowerCase().indexOf(inputValue.toLowerCase().trim()) > -1));
  };
  return (
    <Form layout="inline" onSubmit={ e => {handleSubmit(e);}} autoComplete="off">
      <Row>
        <Col className={styles.colOne}>
          <FormItem label="产品">
            {getFieldDecorator('category_id', {
              initialValue: initialValue
            })(
              <Cascader
                options={categoryTree}
                placeholder="请选择"
                style={{ width: 300 }}
                showSearch={{filter, limit: false}}
                // onChange={handleProductChangeFn}
              />
            )}
          </FormItem>
          <FormItem label="数据状态">
            {getFieldDecorator('std_partsku_status', {
              initialValue: searchFields.std_partsku_status
            })(
              <Select style={{ width: 100 }} onChange={handleDataStatusChange}>
                <Option value="">全部</Option>
                <Option value="PENDING">待审核</Option>
                <Option value="OPEN">开放共享</Option>
                <Option value="PRIVATE">商户私有</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="标准码">
            {getFieldDecorator('std_partsku_code', {
              initialValue: searchFields.std_partsku_code,
              rules: []
            })(
              <Input placeholder="请输入完整标准码" allowClear style={{width: 220}} />
            )}
          </FormItem>
          <FormItem label="OE码">
            {getFieldDecorator('oem_partsku_code', {
              initialValue: searchFields.oem_partsku_code,
              // rules: [{ message: 'OE码只能为字母和数字', pattern: /^[\dA-Za-z]+$/}]
            })(
              <Input placeholder="请输入" allowClear style={{width: 170}}/>
            )}
          </FormItem>
        </Col>
        <Col>
          <FormItem>
            {getFieldDecorator('merge', {
              initialValue: searchFields.merge
            })(
              <Checkbox defaultChecked={searchFields.merge}>只显示可合并项</Checkbox>
            )}
          </FormItem>
          <FormItem label="异常状态">
            {getFieldDecorator('exception_status', {
              initialValue: searchFields.exception_status
            })(
              <Select allowClear placeholder='请选择' style={{width: 150}}>
                <Option value='EXC_IMAGE'>缺少图片</Option>
                <Option value='EXC_VALUE'>缺少属性</Option>
                <Option value='EXC_PRICE'>缺少价格</Option>
              </Select>
            )}
          </FormItem>
          <FormItem style={{float: 'right'}}>
            <Button type="primary" htmlType="submit">查询</Button>
          </FormItem>
        </Col>
      </Row>
    </Form>
  );
};

const TopSearch = Form.create()(IndexSearchForm);
export default TopSearch;