// import React, { Component } from 'react'
// import { connect } from 'dva';
// import { Form, Input, Button, Checkbox } from 'antd';

// const psdCheck = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[^]{8,16}$/;


import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Icon, Input, Button, Card, Row, Col } from 'antd';
import { getLocal } from '@/utils/tools';
const FormItem = Form.Item;


class UpdatePassword extends Component {
  state = {

  };

  // 提交表单
  handleSubmit = e => {
    const { dispatch, form } = this.props;
    e.preventDefault();
    const { validateFields } = form;
    validateFields((err, values) => {
      if (!err) {
        const { password, newPassword } = values;
        dispatch({ 
          type: 'login/fetchUpdatePassword', 
          payload: { password, newPassword } 
        });
      }
    });
  };

  // 确认密码验证
  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('newPassword')) {
      callback('两次密码输入结果不符!');
    } else {
      callback();
    }
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const account = getLocal('account') || '';
    return (
      <Card>
        <Row>
          <Col offset={8} span={8}>
            <Form onSubmit={this.handleSubmit} className="login-form">
              {account && <FormItem label={'账号'}>
                <Input size="large" defaultValue={account} readOnly prefix={<Icon type="user" />} />
              </FormItem>}
              <FormItem label={'原密码'}>
                {getFieldDecorator('password', {
                  rules: [{ required: true, message: '请输入原密码' }]
                })(
                  <Input type="password" size="large" maxLength={20} prefix={<Icon type="lock" />} />
                )}
              </FormItem>
              <FormItem label={'新密码'}>
                {getFieldDecorator('newPassword', {
                  rules: [
                    { required: true, message: '请输入新密码' },
                    { min: 8, message: '最少8字符' }
                  ]
                })(
                  <Input type="password" size="large" maxLength={20} prefix={<Icon type="lock" />} />
                )}
              </FormItem>
              <FormItem label={'确认密码'}>
                {getFieldDecorator('confirm_newPassword', {
                  rules: [
                    { required: true, message: '请输入新密码' },
                    { min: 8, message: '最少8字符' },
                    {
                      validator: this.compareToFirstPassword
                    },
                  ]
                })(
                  <Input type="password" size="large" maxLength={20} prefix={<Icon type="lock" />} />
                )}
              </FormItem>
              <FormItem className="text-center">
                <Button type="primary" size="large" block htmlType="submit" className="submit">
                  确认
                </Button>
              </FormItem>
            </Form>
          </Col>
        </Row>
      </Card>
    );
  }
}

const LoginForm = Form.create()(UpdatePassword);
export default connect()(LoginForm);
