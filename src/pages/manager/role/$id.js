import React, { Component } from 'react';
import router from 'umi/router';
import { connect } from 'dva';
import { Card, Form, Spin, Row, Input, Col, Button, Tree } from 'antd';
import styles from './$id.less';

const FormItem = Form.Item;
const { TreeNode } = Tree;

class user extends Component {


  state = {
    isAdd: false,
    search_role_id: '',
    //默认展开的tree
    expandedKeys: [],
    autoExpandParent: true,
    //选中的
    checkedKeys: [],
    selectedKeys: [],
    role_name: '',
    disabled: false,
  };

  componentDidMount() {
    const role_id = this.props.match.params.id;
    if (role_id === '-1') {
      this.setState({ isAdd: true });
      this.fetchCategoriesPartsFn();
    } else {
      this.setState({ isAdd: false });
      this.setState({
        search_role_id: role_id,
      });
      let payload = { role_id: role_id };
      this.fetchCategoriesPartsFn(payload);
    }
  }

  componentWillUnmount() {

  }

  fetchCategoriesPartsFn = (payload) => {
    this.props.dispatch({
      type: 'manager/managerGetmenuAllList',
      payload,
      callback: (res) => {
        if (res.code === 0) {
          this.setState({
            checkedKeys: res.data.defaultMenuId.map(v => v.menu_id),
          });
        }
      },
    });
  };


  // 提交表单
  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    if (this.state.vaildBrandNameStatus == 'error') return;
    form.validateFields((err, values) => {
      if (!err) {

        if (this.state.isAdd) {
          const data = {
            ...values,
            menu_ids: this.state.checkedKeys,
          };
          dispatch(
            {
              type: 'manager/managerInsertRole',
              data,
            },
          );
        } else {
          const data = {
            ...values,
            menu_ids: this.state.checkedKeys,
            role_id: this.state.search_role_id,
          };
          dispatch(
            {
              type: 'manager/managerInsertRole',
              data,
            },
          );
        }
      }
    });
  };

  onExpand = expandedKeys => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };

  onCheck = (checkedKeys, info) => {
    this.setState({ checkedKeys });
  };

  onSelect = (selectedKeys, info) => {
    this.setState({ selectedKeys });
  };

  renderTreeNodes = data =>
    data.map(item => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key}
            disabled={item.menu_id === '1895495488455143424' ? true : false || this.props.match.params.id === '1' ? true : false}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode key={item.key} {...item}
          disabled={(item.menu_id === '1895497056655077376' || item.menu_id === '1895497513884545024' || item.menu_id === '1906743155873119233') ? true : false || this.props.match.params.id === '1' ? true : false}/>
      );

    });

  render() {
    const { loading, form, MANAGER_MENU_LIST } = this.props;
    const { menulist } = MANAGER_MENU_LIST;
    const { getFieldDecorator } = form;
    const { isAdd, checkedKeys } = this.state;
    const adminId = this.props.match.params.id;
    return (
      <Card>
        <Form autoComplete="off" onSubmit={e => this.handleSubmit(e)}>
          <Spin spinning={loading['manager/managerGetmenuAllList']}>
            <Row type="flex" gutter={12}>
              <Col span={8}>
                <FormItem type="flex" label={<strong>角色名称</strong>}>
                  {
                    getFieldDecorator(
                      'role_name',
                      {
                        initialValue: isAdd ? '' : window.localStorage.getItem('page_role_name'),
                        rules: [{ required: true, message: '必填' }],
                      },
                    )(
                      <Input allowClear disabled={adminId === '1' ? true : false} className={styles.inputStytle}/>,
                    )
                  }
                </FormItem>
              </Col>

            </Row>
            <Row>
              <div><strong><span className="red6 m-r-5">*</span><strong>功能权限</strong></strong></div>
              <Tree
                className={styles.tree}
                expandedKeys={menulist.map(v => v.menu_id)}
                checkable
                // onExpand={this.onExpand}
                onCheck={this.onCheck}
                checkedKeys={checkedKeys}
                onSelect={this.onSelect}
                selectedKeys={this.state.selectedKeys}
              >
                {this.renderTreeNodes(menulist)}
              </Tree>
            </Row>
          </Spin>
          <FormItem>
            {
              adminId === '1' ?
                null :
                <Button type="primary" htmlType="submit" className="m-r-15"
                  loading={loading['manager/managerUpdateUserInfo']}>{isAdd ? '创建角色' : '保存编辑'}</Button>
            }
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
