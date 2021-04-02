import React from 'react';
import { Form, Select, Row, Col, Button } from 'antd';
import InputClose from 'components/InputClose';
import styles from './TopForm.less';


const FormItem = Form.Item;
const Option = Select.Option;
// 表单布局控制
const formItemLayout = {
  labelCol: {
    xxl: { span: 6 }, xl: { span: 6 }
  },
  wrapperCol: {
    xxl: { span: 18 }, xl: { span: 18 }
  }
};

// 顶部搜索表单
const TopForm = ({ form, CATEGORIES, onSubmit, onTopFormChange }) => {
  const { getFieldDecorator, setFieldsValue, getFieldValue } = form;
  return (
    <Form className={styles.form} autoComplete="off">
      <Row gutter={24}>
        <Col span={5}>
          <FormItem label="品类" {...formItemLayout}>
            {getFieldDecorator('brand_category_id', {
              initialValue: 'ALL'
            })(
              <Select onChange={value => onTopFormChange('brand_category_id', value)}>
                <Option key={'ALL'}>全部</Option>
                {
                  CATEGORIES.map(v => <Option key={v.brand_category_id}>{v.brand_category_name}</Option>)
                }
              </Select>
            )}
          </FormItem>
        </Col>
        <Col span={5}>
          <FormItem label="处理状态" {...formItemLayout}>
            {getFieldDecorator('ten_feedback_status', {
              initialValue: 'ALL'
            })(
              <Select onChange={value => onTopFormChange('ten_feedback_status', value)}>
                <Option value='ALL'>全部</Option>
                <Option value='UNREAD'>消息未读</Option>
                <Option value='PENDING'>待处理</Option>
                <Option value='PROCESSING'>处理中</Option>
                <Option value='OVER'>已处理</Option>
              </Select>
            )}
          </FormItem>
        </Col>
        <Col span={6}>
          <FormItem label="操作状态" {...formItemLayout}>
            {getFieldDecorator('ten_feedback_operation', {
              initialValue: 'ALL'
            })(
              <Select onChange={value => onTopFormChange('ten_feedback_operation', value)}>
                <Option value='ALL'>全部</Option>
                <Option value='PENDING'>待确定</Option>
                <Option value='OVER'>已确定</Option>
              </Select>
            )}
          </FormItem>
        </Col>
        <Col span={6}>
          <FormItem label="关键字" {...formItemLayout}>
            {getFieldDecorator('keywords', {
              initialValue: ''
            })(
              <span>
                <InputClose onClear={() => {
                  setFieldsValue({ keywords: '' }, () => {
                    onTopFormChange('keywords', '');
                  });

                }} field={getFieldValue('keywords')} placeholder="产品编码/反馈人/联系电话" />
              </span>
            )}
          </FormItem>
        </Col>
        <Col span={2} className="text-right">
          <FormItem {...formItemLayout}>
            <Button type="primary" onClick={onSubmit}>查询</Button>
          </FormItem>
        </Col>
      </Row>
    </Form>
  );
};

export default Form.create()(TopForm);