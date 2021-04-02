import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Icon, Input, Button, notification , message } from 'antd';
import { routerRedux } from 'dva/router';
import styles from './index.less';
import classNames from 'classnames';
import { setLocal } from '../../utils/tools';
const FormItem = Form.Item;

const FormItemList = props => {
  const { getFieldDecorator, fields } = props;
  return (
    fields.map(item => {
      const { name, options, icon, placeholder, type } = item;
      const iconOptions = {type:icon, className:icon, placeholder};
      return (
        <FormItem key={name}>
          {getFieldDecorator(name, options)(
            <Input type={type} size="large" prefix={ <Icon {...iconOptions} /> } />
          )}
        </FormItem>
      );
    })
  );
};

class Login extends Component {
    state = {
      fields: [{
        name: 'account',
        type: 'text',
        icon: 'user',
        placeholder: '输入管理员帐号',
        options: {
          // initialValue: 'sopei_manager',
          // initialValue: 'awei.com',
          rules: [{ required: true, max:20, message: '请输入正确的管理员帐号'}]
        }
      },{
        name: 'password',
        type: 'password',
        icon: 'lock',
        placeholder: '输入密码',
        options: {
          // initialValue: 'aweiawei',
          // initialValue: '90opl;./',
          rules: [{ required: true, max:20, message: '请输入正确的密码'}]
        }
      }]
    };

    // 提交表单
    handleSubmit = e => {
      e.preventDefault();
      const { validateFields } = this.props.form;
      validateFields((err, values) => {
        if (!err) {
          this.handleLogin(values);
        }
      });
    };
    loginListRecord=(account)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:{
          account:account
        },
        record_page:'login',
        record_operations:'登录'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
  
    // 登录请求
    handleLogin = async ({ account = '', password = '' }) => {
      const { dispatch } = this.props;
      const res = await dispatch({
        type: 'login/fetchLogin',
        payload: { account: account.trim(), password: password.trim() }
      });

      if(res.code === 0) {
        this.loginListRecord(account.trim());
        const { menuTree = [], noticeList = [], updatePwd='not' } = res.data;
        //存储localStorage
        setLocal('menusData', menuTree);
        setLocal('account', account.trim());
        setLocal('noticeList', noticeList);
        setLocal('updatePwd',updatePwd);
        this.routeTo('/home');
        dispatch({
          type: 'global/updateMenuData',
          payload: menuTree
        });
        if(updatePwd==='must'){
          message.warning('请将默认密码修改后再使用！');
          this.routeTo('updatepassword');
        }
      } else {
        // res.code === 21002 帐号或密码错误
        notification.info({
          message: res.msg,
          description: '请检查后重新输入'
        });
      }
    };

    // 路由跳转
    routeTo = url => {
      const { dispatch } = this.props;
      dispatch(routerRedux.push(url));
    }

    render() {
      const { fields } = this.state;
      const { form } = this.props;
      return (
        <div className={styles.login_bg}>
          <div className="login_box">
            {/* logo */}
            <div className="text-center">
              <span className={classNames('logo','iconfont icon-soupei')} />
            </div>
            {/* Form */}
            <Form onSubmit={this.handleSubmit} className="login-form">
              <FormItemList fields={fields} getFieldDecorator={form.getFieldDecorator}/>
              <FormItem>
                <Button type="primary" size="large" htmlType="submit" className="submit">
                                登录
                </Button>
              </FormItem>
            </Form>
          </div>
        </div>
      );
    }
}

const LoginForm = Form.create()(Login);
export default connect()(LoginForm);
