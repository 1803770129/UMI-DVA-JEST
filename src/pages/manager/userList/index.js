import React, { Component } from 'react';
import { Form, Row, Col, Select, Button, Input, Card, Table, Divider, Modal } from 'antd';
import { connect } from 'dva';
import styles from './index.less';
import NoData from '@/components/NoData';
import router from 'umi/router';
const { confirm } = Modal;
const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

class userlist extends Component {

  state = {
    selectedRowKeys: [],
    page: 1,
    pageCount: 10,
    lodingStr: 'manager/fetchManagerUserList',
  };

  componentDidMount() {
    const { FIELDS } = this.props;

    this.managerUserList({
      page: FIELDS.page || this.state.page,
      pageCount: FIELDS.pageCount || this.state.pageCount,
    });
  }

  managerUserList = payload => {
    const { dispatch } = this.props;
    this.setState({
      lodingStr: 'manager/fetchManagerUserList',
      page: payload.page,
      pageCount: payload.pageCount
    });
    dispatch({
      type: 'manager/fetchManagerUserList',
      payload,
    });
  };
  updateUserStatus = (record) => {
    const { loading } = this.props;
    confirm({
      title: '提示',
      okButtonProps: {
        loading: loading['manager/managerDeleteUser'],
      },
      content: '确定删除账号？账号被删除后不能再使用审核后台',
      onOk: () => {
        this.setState({
          lodingStr: 'manager/managerDeleteUser',
        });
        const { dispatch } = this.props;
        dispatch({
          type: 'manager/managerDeleteUser',
          payload: record,
        });
      },
    });

  };

  searchData = () => {
    this.setState({
      page: 1,
    });
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
      this.managerUserList({
        page: 1,
        pageCount: this.state.pageCount,
        ...values,
      });
    });
  };

  render() {
    const { page, lodingStr } = this.state;
    const { form, loading, MANAGER_USER_LIST, FIELDS } = this.props;
    const { count, userList } = MANAGER_USER_LIST;
    const { getFieldDecorator } = form;
    const columns = [
      {
        title: '姓名',
        dataIndex: 'user_name'
      },
      {
        title: '账号',
        dataIndex: 'user_login_id'
      },
      {
        title: '角色',
        dataIndex: 'role_name',
      },
      {
        title: '创建者',
        dataIndex: 'cratename'
      },
      {
        title: '操作',
        dataIndex: 'company_id',
        render: (text, record, index) => {
          return (
            <>
                <span className="cur blue6" value="small" onClick={() => {
                  router.push(
                    '/manager/userList/' + record.user_id,
                  );
                }}>编辑</span>
                <Divider type="vertical" />
               
                    <span className="cur blue6" value="small"  onClick={() => this.updateUserStatus(record)}>删除</span>
                
            </>
          );
        },
      },
    ];
    const pagination = {
      total: Number(count),
      current: page,
      pageSize: this.state.pageCount,
      onChange: (page, pageSize) => {
        this.props.form.validateFields((err, values) => {
          if (!err) {
            // console.log('Received values of form: ', values);
          }
          this.managerUserList({
            page,
            pageCount: this.state.pageCount,
            ...values,
          });
        });
      },
      showTotal: (total, range) => `当前${range[0]}-${range[1]}，共${total}条数据`
      ,
    };

    const tableProps = {
      className: 'm-t-15',
      loading: loading[lodingStr],
      bordered: true,
      rowKey: record => record.user_id,
      dataSource: userList,
      columns,
      pagination,
    };

    return (
      <Card className={styles.content}>

        {/* Form */}
        <Form autoComplete="off">
          <Row type="flex" gutter={12}>

            <Col>
              <Form.Item>
                姓名
              </Form.Item>
            </Col>
            <Col>
              <FormItem>
                {
                  getFieldDecorator(
                    'user_name', {
                      initialValue: FIELDS.user_name,
                    },
                  )(
                    <Input allowClear className={styles.inputStytle}/>,
                  )
                }
              </FormItem>

            </Col>

            <Col>
              <Form.Item>
                账号
              </Form.Item>
            </Col>
            <Col>
              {
                getFieldDecorator(
                  'user_login_id', {
                    initialValue: FIELDS.user_login_id,
                  },
                )(
                  <Input allowClear className={styles.inputStytle}/>,
                )
              }
            </Col>
            <Col>
              <Button type="primary" onClick={this.searchData}>
                查询
              </Button>
            </Col>
          </Row>
          <Row className={styles.duiqi} type="flex" gutter={12}>

          </Row>
        </Form>
        {/* Form end */}

        <Divider style={{ marginTop: 0, marginBottom: 25 }}/>

        {/* 用户列表 */}
        <Row type="flex" className="text-right">
          <Button type="primary" href="/#/manager/userList/-1">创建账号</Button>
        </Row>
        { userList.length > 0 ? <Table {...tableProps} /> : <NoData title="还没有账号" /> }
        {/* 品牌列表 end */}
      </Card>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.manager,
});

export default connect(mapStateToProps)(Form.create()(userlist));
