import React from 'react';
import { Form, Row, Col, Select, Button } from 'antd';
import InputClose from '@/components/InputClose/index';
import styles from './IndexSearchForm.less';
const FormItem = Form.Item;
const Option = Select.Option;

// 表单布局控制
const formItemLayout = {
  labelCol: {
    xxl: { span: 6 }, xl: { span: 8 }
  },
  wrapperCol: {
    xxl: { span: 18 }, xl: { span: 16 }
  }
};

const formItemLayoutLg = {
  labelCol: {
    xxl: { span: 4 }, xl: { span: 6 }
  },
  wrapperCol: {
    xxl: { span: 20 }, xl: { span: 18 }
  }
};

const SearchForm = ({ form, onSubmit }) => {
  const { getFieldDecorator, validateFields, getFieldValue, getFieldsValue, setFieldsValue } = form;

  const handleSubmit = e => {
    e.preventDefault();
    validateFields(async (err, values) => {
      if (!err) {
        onSubmit(values);
      }
    });
  };

  const handelChange = (value, key) => {
    if(key === 'keywords') {
      setFieldsValue({ keywords: '' });
    }
    onSubmit({...getFieldsValue(), [key]:value });
  };
 
  return (
    <Form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
      <Row gutter={24}>
        <Col span={6}>
          <FormItem label="处理状态" {...formItemLayout}>
            {
              getFieldDecorator('feedback_cm_status', {
                initialValue: 'ALL'
              })(
                // 处理状态:PENDING 待处理， PROCESSING:处理中，OVER:已处理
                <Select placeholder="请选择" onChange={value => handelChange(value, 'feedback_cm_status')}>
                  <Option key="ALL">全部</Option>
                  <Option key="UNREAD">消息未读</Option>
                  <Option key="PENDING">待处理</Option>
                  <Option key="PROCESSING">处理中</Option>
                  <Option key="OVER">已处理</Option>
                </Select>
              )
            }
          </FormItem>
        </Col>
        <Col span={6}>
          <FormItem label="担当者" {...formItemLayout}>
            {
              getFieldDecorator('feedback_cm_staff', {
                initialValue: 'ALL'
              })(
                <Select placeholder="请选择" >
                  <Option key="ALL">全部</Option>
                  {/* <Option key="0">客服A</Option> */}
                </Select>
              )
            }
          </FormItem>
        </Col>
        <Col span={10}>
          <FormItem label="关键字搜索" {...formItemLayoutLg}>
            {
              getFieldDecorator('keywords', {
                initialValue: ''
              })(
                <span>
                  <InputClose placeholder="反馈车型/问题描述/反馈人" onClear={() => handelChange('', 'keywords')} field={getFieldValue('keywords')} />
                </span>
              )
            }
          </FormItem>
        </Col>
        <Col span={2} className="text-right">
          <FormItem>
            <Button type="primary" htmlType="submit">查询</Button>
          </FormItem>
        </Col>
        
      </Row>
    </Form>
  );
};

const IndexSearchForm = Form.create()(SearchForm);
export default IndexSearchForm;
