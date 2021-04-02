import React, { Component } from 'react';
import { Card, Tabs, Pagination } from 'antd';
import MessageList from './components/MessageList';
import { connect } from 'dva';
import router from 'umi/router';
import NoData from 'components/NoData';
const TabPane = Tabs.TabPane;

class Msg extends Component {
  handleTabChange = key => {
    router.push(`/message?active=${key}`);
  };

  handleActive = item => {
    const { dispatch } = this.props;
    // 消息读取flag  1:未读  2：已读
    if (item.msg_read_flag === 1) {
      const { MSG_RECORDS } = this.props;
      dispatch({
        type: 'FEEDBACK_MSG/UPDATE_MSG_RECORDS',
        payload: {
          ...MSG_RECORDS,
          list: MSG_RECORDS.list.map(msg => {
            return {
              ...msg,
              msg_read_flag: msg.msg_system_record_id === item.msg_system_record_id ? 2 : msg.msg_read_flag,
            };
          }),
        },
      });
    }

    // const MSG_TYPE_CODE_CONFIG = {
    //     TENANT_APPLY_NOTICE: '商户申请通知',
    //     TENANT_APPROVE_NOTICE: '商户审核通知',
    //     MEMBER_APPLY_NOTICE: '会员申请通知',
    //     MEMBER_APPROVE_NOTICE: '会员审核通知',
    //     CATEGORY_APPROVE_NOTICE: '品类服务审核通知',
    //     CATEGORY_APPLY_NOTICE: '品类服务申请通知',
    //     USER_NOTICE: '用户通知',
    //     TENANT_NOTICE: '商户通知',
    //     CARMDOEL_LACK_FEEDBACK: '车型缺少反馈通知',
    //     CARMDOEL_ERROR_FEEDBACK: '车型错误反馈通知',
    //     CARMDOEL_PARTSKU_LACK_FEEDBACK: '车型没有对应的产品反馈通知'
    // };
    switch (item.msg_type_code) {
      case 'CARMODEL_FEEDBACK':
        router.push('/feedback/carmodelfeedback');
        break;
      case 'SYSTEM_FEEDBACK':
        router.push('/feedback/systemfeedback');
        break;
      case 'PARTSKU_FEEDBACK':
        router.push('/feedback/partskufeedback');
        break;
      case 'CARMODEL_CUSTOM_ADD_FEEDBACK':
        router.push('/baseorigin/list?review_status=PENDING');
        break;
      default:
        router.push('/clientservice/data?ten_category_approved=PENDING');
        break;
    }
  };

  handlePaginationChange = (page, perpage) => {
    const { location, dispatch } = this.props;
    const { query } = location;
    let obj = { page, perpage };
    if (query.active !== 'ALL') {
      obj.msg_type_identification = query.active;
    }
    dispatch({
      type: 'FEEDBACK_MSG/FEATCH_MSG_RECORDS',
      payload: obj,
    });
  };

  render() {
    const { MSG_RECORDS, sys, location, MESSAGES } = this.props;
    const { query } = location;
    const { list = [], count = 0, page = 1, perpage = 20 } = MSG_RECORDS;
    // 分页配置
    const pagination = {
      total: parseInt(count, 10),
      pageSize: perpage,
      current: page,
      showSizeChanger: true,
      hideOnSinglePage: true,
      onShowSizeChange: this.handlePaginationChange,
      onChange: this.handlePaginationChange,
      showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`,
    };
    return (
      <Card bodyStyle={{ minHeight: '80vh' }}>
        {/* <Tabs animated={false} activeKey={query.active ||'ALL'} defaultActiveKey={query.active ||'ALL'} onChange={this.handleTabChange}> */}
        {[{ msg_type_identification: 'ALL', msg_title: '全部' }, ...MESSAGES].map(item => {
          return (
            // <TabPane tab={item.msg_title} key={item.msg_type_identification}>
            <div key={item.msg_type_identification}>
              {list.length === 0 && <NoData />}
              {list.length > 0 && <MessageList data={list} onActive={this.handleActive} />}
            </div>
            // </TabPane>
          );
        })}
        {/* </Tabs> */}

        <div className="m-t-15 text-right">
          <Pagination {...pagination} />
        </div>
      </Card>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.FEEDBACK_MSG,
  ...state.global,
});
export default connect(mapStateToProps)(Msg);