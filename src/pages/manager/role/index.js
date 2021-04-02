import React, { Component } from 'react';
import { Form, Row, Col, Button, Card, Table, Modal, Divider } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
const { confirm } = Modal;


class userlist extends Component {

  state = {
    selectedRowKeys: [],
    page: 1,
    pageCount: 10,
    lodingStr: 'manager/managerSelectRoleList',
  };

  componentDidMount() {
    const { ROLEFILDS } = this.props;

    this.managerRoleList({
      page: ROLEFILDS.page || this.state.page,
      pageCount: ROLEFILDS.pageCount || this.state.pageCount,
    });
  }

  managerRoleList = payload => {
    const { dispatch } = this.props;
    this.setState({
      lodingStr: 'manager/managerSelectRoleList',
      page: payload.page,
      pageCount: payload.pageCount
    });
    dispatch({
      type: 'manager/managerSelectRoleList',
      payload,
    });
  };

  deleteRole = (record) => {
    const { loading } = this.props;
    confirm({
      title: '提示',
      okButtonProps: {
        loading: loading['manager/managerDeleteRole'],
      },
      content: '拥有该角色的账号不能再使用对应功能',
      onOk: () => {
        this.setState({
          lodingStr: 'manager/managerDeleteRole',
        });
        const { dispatch } = this.props;
        dispatch({
          type: 'manager/managerDeleteRole',
          payload: record,
        });
      },
    });

  };



  render() {
    const { page, lodingStr } = this.state;
    const { loading, MANAGER_ROLE_LIST_Table } = this.props;
    const { count, roleList } = MANAGER_ROLE_LIST_Table;
    const columns = [
      {
        title: '角色名称',
        width: 150,
        dataIndex: 'role_name',
      },
      {
        title: '功能权限',
        dataIndex: 'menu_name',
        render: (text) => {
          return text ? text.join('，') : '-';
        }
      },
      {
        title: '操作',
        width: 100,
        dataIndex: 'company_id',
        render: (text, record, index) => {
          return (
            <>
              <span className="cur blue6" value="small" onClick={() => {
                window.localStorage.setItem('page_role_name', record.role_name);
                router.push(
                  '/manager/role/' + record.role_id +
                  '?role_name=' +
                  record.role_name
                );

              }}>{record.role_id==='1'?'查看' : '编辑'}</span>

              <Divider type="vertical" />
              {
                record.role_id==='1'?
                  <span value="small" style={{cursor:'no-drop' , color:'grey'}}>删除</span>
                  :
                  <span className="cur blue6" value="small"  onClick={() => this.deleteRole(record)}>删除</span>
              }
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
        this.managerRoleList({
          page,
          pageCount: this.state.pageCount,
        });
      },
      showTotal: (total, range) => `当前${range[0]}-${range[1]}，共${total}条数据`
      ,
    };

    const tableProps = {
      className: 'm-t-15',
      loading: loading[lodingStr],
      bordered: true,
      // rowSelection,
      rowKey: record => record.role_id,
      dataSource: roleList,
      columns,
      pagination,
    };

    return (
      <Card>
        {/* 用户列表 */}
        <Row type="flex" justify="space-between">
          <Col className="f16">角色列表</Col>
          <Col>
            <Button type="primary" href="/#/manager/role/-1">创建角色</Button>
          </Col>
        </Row>
        <Table {...tableProps} />
        {/* 品牌列表 end */}
      </Card>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.manager
});

export default connect(mapStateToProps)(Form.create()(userlist));
