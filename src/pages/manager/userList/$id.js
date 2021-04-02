import React, { Component } from 'react';
import router from 'umi/router';
import { connect } from 'dva';
import { Card, Form, Spin, Row, Input, Col, Button, Checkbox, Divider , message} from 'antd';
import styles from './$id.less';
import NoData from '@/components/NoData';

const FormItem = Form.Item;

class user extends Component {
  state = {
    isAdd: false,
    checkedList: [],
    plainOptions: ['Apple', 'Pear', 'Orange'],
    userRolelist: [],
    userCategorylist: [],
    search_user_id: '',
    roleLoadingStr: 'manager/managerSelectRole',
    categoryLoadingStr: 'manager/managerallBrandCategory',
    userInfoLoadingStr: 'manager/managerGetUserDetail',
  };

  componentDidMount() {
    const backstage_user_id = this.props.match.params.id;
    if (backstage_user_id === '-1') {
      this.setState({ isAdd: true });
      this.pageCreateInitFn();
    } else {
      this.setState({ isAdd: false });
      this.setState({
        search_user_id: backstage_user_id,
      });
      let payload = { search_user_id: backstage_user_id };
      this.pageCreateInitFn(payload);

    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({ type: 'manager/managerClearState' });
  }

  // onChange = checkedList => {
  //   this.setState({
  //     checkedList,
  //     // indeterminate: !!checkedList.length && checkedList.length < plainOptions.length,
  //     // checkAll: checkedList.length === plainOptions.length,
  //   });
  // };

  pageCreateInitFn = (payload) => this.fetchCategoriesPartsFn(payload);

  fetchCategoriesPartsFn = (payload) => {
    this.props.dispatch({ type: 'manager/managerSelectRole', payload });
    this.props.dispatch({ type: 'manager/managerallBrandCategory', payload });
    if (!this.state.isAdd) {
      this.props.dispatch({ type: 'manager/managerGetUserDetail', payload });
    }

  };

  //新增或者编辑权限
  getRoleCheckList = (value) => {
    const { isAdd } = this.state;
    if (isAdd) {
      if (value.target.checked) {
        this.state.userRolelist.push(value.target.value);
      } else {
        this.state.userRolelist = this.state.userRolelist.filter(item => !(item == value.target.value));
      }
    } else {
      this.setState({
        roleLoadingStr: 'manager/managerUpdateuserRole',
      });
      this.props.dispatch({
        type: 'manager/managerUpdateuserRole',
        payload: {
          user_id: this.state.search_user_id,
          role_id: value.target.value,
        },
      });
    }
  };

  //新增或者编辑权限
  getCategoryCheckList = (value) => {
    const { isAdd } = this.state;
    if (isAdd) {
      if (value.target.checked) {
        this.state.userCategorylist.push(value.target.value);
      } else {
        this.state.userCategorylist = this.state.userCategorylist.filter(item => !(item == value.target.value));
      }
    } else {
      this.setState({
        categoryLoadingStr: 'manager/managerUpdateuserCategory',
      });
      this.props.dispatch({
        type: 'manager/managerUpdateuserCategory',
        payload: {
          user_id: this.state.search_user_id,
          brand_category_id: value.target.value,
        },
      });
    }
  };

  // 提交表单
  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch, fmsBrandDetail } = this.props;
    if (this.state.vaildBrandNameStatus == 'error') return;
    form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        if (this.state.isAdd) {
          const data = {
            ...values,
            'brand_category_ids': this.state.userCategorylist,
            'role_ids': this.state.userRolelist,
          };
          if(this.state.userRolelist.length===0){
            message.warning('请至少选择一个分配角色');
            return;
          }else{
            dispatch(
              {
                type: 'manager/managerInsertUser',
                data,
              },
            );
          }

        } else {
          this.setState({
            userInfoLoadingStr: 'manager/managerUpdateUserInfo',
          });
          const payload = {
            user_name: values.user_name,
            user_phone: values.user_phone,
            user_id: this.state.search_user_id,
          };
          dispatch({
            type: 'manager/managerUpdateUserInfo',
            payload,
          });
        }
      }
    });
  };


  render() {
    const { loading, form, MANAGER_Role_LIST, MANAGER_CATEORY_LIST, MANAGER_USER_DETAIL_INFO } = this.props;

    const { getFieldDecorator } = form;
    const { isAdd, roleLoadingStr, categoryLoadingStr, userInfoLoadingStr } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 }, sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 }, sm: { span: 16 },
      },
    };

    const tailFormItemLayout = {
      wrapperCol: {
        xs: { span: 12, offset: 0 }, sm: { span: 10, offset: 4 },
      },
    };

    // 创建初始化

    return (
      <Card loading={loading['indus_id/fetchPageEditInit']}>
        <Form autoComplete="off" onSubmit={e => this.handleSubmit(e)}>
          <Spin spinning={loading[userInfoLoadingStr]}>
            <Row className="m-b-10"><span className="f16 fb m-r-10"><strong>基本信息</strong></span>不约束输入的字符类型，根据实际情况和方便管理需要填写即可</Row>
            <Row type="flex" gutter={12}>
              <Col>
                <FormItem type="flex" label={'姓名：'} {...formItemLayout} >
                  {
                    getFieldDecorator(
                      'user_name',
                      {
                        initialValue: isAdd ? '' : MANAGER_USER_DETAIL_INFO.user_name,
                        rules: [{ required: true, message: '必填' }],
                      },
                    )(
                      <Input allowClear className={styles.inputStytle}/>,
                    )
                  }
                </FormItem>
              </Col>


              <Col>
                <FormItem type="flex" label={'账号：'} {...formItemLayout}>
                  {
                    getFieldDecorator(
                      'user_login_id',
                      {
                        initialValue: isAdd ? '' : MANAGER_USER_DETAIL_INFO.user_login_id,
                        rules: [{ required: true, message: '必填' }],
                      },
                    )(
                      <Input allowClear={isAdd} readOnly={!isAdd}
                        className={styles.inputStytle}/>,
                    )
                  }
                </FormItem>
              </Col>

            </Row>

            <Divider style={{ marginTop: 0 }}/>

            {/*<Row className={styles.duiqi} type="flex" gutter={12}>
              <Col span={3}>
                <FormItem>
                  账号状态：{Boolean(MANAGER_USER_DETAIL_INFO.user_status == 1)}
                  {getFieldDecorator('user_status', {})
                  (
                    <Switch defaultChecked={MANAGER_USER_DETAIL_INFO.user_status == 1 ? true : false}/>,
                  )}
                </FormItem>,
              </Col>

              <Col span={3}>
                <Form.Item>
                  能否创建角色：
                  {getFieldDecorator('role_power', {})
                  (
                    <Switch/>,
                  )}
                </Form.Item>,

              </Col>

              <Col span={3}>
                <Form.Item>
                  能否创建用户：
                  {getFieldDecorator('user_power', {})
                  (
                    <Switch/>,
                  )}
                </Form.Item>,
              </Col>

              <Col span={5}>
                <Form.Item>
                  能否查看所有用户角色：
                  {getFieldDecorator('role_all', {
                    initialValue: false,
                  })
                  (

                    <Switch/>,
                  )}
                </Form.Item>,

              </Col>
            </Row>*/}
          </Spin>

          <Row className="m-b-10"><span className={styles.userlistRed}>* </span><span className="f16 fb m-r-10" ><strong> 分配角色</strong></span><span
            onClick={() => {
              router.push(
                '/manager/role',
              );

            }} className="cur blue6">管理或创建角色</span></Row>

          <Row className={styles.duiqi} gutter={12}>
            <Spin spinning={loading[roleLoadingStr]}>
              <FormItem valuePropName="checked" name="agreement"
                rules={[
                  { validator:(_, value) => value ? Promise.resolve() : Promise.reject('Should accept agreement') },
                ]}>
                {
                  MANAGER_Role_LIST.length > 0 ? MANAGER_Role_LIST.map(item => (
                    <Col span={4} key={item.role_id}>
                      <Checkbox defaultChecked={item.checked} value={item.role_id}
                        onChange={this.getRoleCheckList}>{item.role_name}</Checkbox>
                    </Col>
                  )) : <NoData title="还没有角色"/>
                }
              </FormItem>
            </Spin>
          </Row>

          <Divider style={{ marginTop: 0 }}/>


          <Row className="m-b-10"><span className="red m-r-5">*</span><span className="f16 fb m-r-10"><strong>负责品类</strong></span></Row>

          <Row className={styles.duiqi} gutter={12}>
            <Spin spinning={loading[categoryLoadingStr]}>
              <FormItem >
                {
                  MANAGER_CATEORY_LIST.map(item => (
                    // defaultChecked={isAdd}
                    <Col span={4} key={item.brand_category_id}>
                      <Checkbox defaultChecked={item.checked} value={item.brand_category_id}
                        onChange={this.getCategoryCheckList}>{item.brand_category_name}</Checkbox>
                    </Col>
                  ))
                }
              </FormItem>
            </Spin>
          </Row>


          <FormItem>
            <Button type="primary" htmlType="submit" className="m-r-15"
              loading={loading['manager/managerUpdateUserInfo']}>{isAdd ? '创建账号' : '保存编辑'}
            </Button>
            <Button type="primary" ghost onClick={() => router.goBack()}>返回上一页</Button>
          </FormItem>
        </Form>
      </Card>
    );
  }
}

const $id = Form.create()(user);
const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.manager,
});

export default connect(mapStateToProps)($id);
