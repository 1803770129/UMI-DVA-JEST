import React, { Component } from 'react';
import { Card, Col, Row, Button, Table, Modal,Select, Cascader, DatePicker, Input, Tooltip, Icon } from 'antd';
import styles from './index.less';
import { connect } from 'dva';
import moment from 'moment';
import router from 'umi/router';
const { Option } = Select;
const { confirm } = Modal;
class Ipunlock extends Component {
  state={
    page:this.props.USERBLOCKPAGE.page,
    pageCount:this.props.USERBLOCKPAGE.pageCount,
    rulesList:[],
    rules:'',
    start_date:'',
    end_date:'',
    user_id:''
  }
  componentDidMount() {
    const {USERBLOCKPAGE}=this.props;
    this.fetchUserBlockList(USERBLOCKPAGE);
    this.fetchUserBlockSelector(USERBLOCKPAGE);
  }
  fetchUserBlockSelector=(USERBLOCKPAGE)=>{
    this.props.dispatch({
      type:'usermanager/fetchUserBlockSelector',
      payload:{
        ...USERBLOCKPAGE,
      }
    });
  }
  fetchUserBlockList=(USERBLOCKPAGE)=>{
    this.props.dispatch({
      type:'usermanager/fetchUserBlockList',
      payload:{
        ...USERBLOCKPAGE,
        start_date:this.state.start_date,
        end_date:this.state.end_date,
        user_rate_limit_rule_id:this.state.rules,
        user_id:this.state.user_id
      }
    });
  }
  lockForever=(record)=>{
    
  }
  unLock=(record)=>{
    if(record.user_id){
      confirm({
        content: <span>确定解除user_id为：<span style={{color:'red'}}>{record.user_id}</span> 的封禁限制？</span>,
        onOk:()=>{
          this.props.dispatch({
            type:'usermanager/fetchUserUnlock',
            data:{
              user_rate_limit_id:record.user_rate_limit_id,
              user_id:record.user_id,
              user_rate_limit_count_key:record.user_rate_limit_count_key,
              user_rate_limit_block_key:record.user_rate_limit_block_key,
              user_rate_limit_block_count_key:record.user_rate_limit_block_count_key
            }
          });
        },
        onCancel() {
          // console.log('Cancel');
        },
      });
    }else{
      confirm({
        content: <span>确定解除SOPEIID为：<span style={{color:'red'}}>{record.SOPEIID}</span> 的封禁限制？</span>,
        onOk:()=>{
          this.props.dispatch({
            type:'usermanager/fetchUserUnlock',
            data:{
              user_rate_limit_id:record.user_rate_limit_id,
              SOPEIID:record.SOPEIID,
              user_rate_limit_count_key:record.user_rate_limit_count_key,
              user_rate_limit_block_key:record.user_rate_limit_block_key,
              user_rate_limit_block_count_key:record.user_rate_limit_block_count_key
            }
          });
        },
        onCancel() {
          // console.log('Cancel');
        },
      });
    }
  }
  changeCascader=(list)=>{
    this.setState({
      rules:list[1],
      rulesList:list
    });
  }
  handleEndDisabledDate1 = (current) => {
    const { start_date } = this.state;
    if (start_date !== '') {
      return current && current > moment().endOf('day') || current > moment(start_date).add(365, 'day') || current < moment(start_date);
    } else {
      return;
    }
  }
  // 开始时间可选范围
  handleStartDisabledDate1 = (current) => {
    const { end_date } = this.state;
    if (end_date !== '') {
      return current && current > moment().endOf('day') || current < moment(end_date).subtract(365, 'day') || current > moment(end_date);
    } else {
      return current && current > moment().endOf('day');
    }
  }
  handlestart_dateChange1 = async(value, dateString) => {
    this.setState({
      start_date: dateString,
    });
  }
  handleend_dateChange1 = async(value, dateString) => {
    this.setState({
      end_date: dateString,
    });
  }
  searchIp=()=>{
    const {USERBLOCKPAGE}=this.props;
    this.setState({
      page:1
    });
    this.props.dispatch({
      type:'usermanager/fetchUserBlockList',
      payload:{
        ...USERBLOCKPAGE,
        page:1,
        start_date:this.state.start_date,
        end_date:this.state.end_date,
        user_rate_limit_rule_id:this.state.rules,
        user_id:this.state.user_id
      }
    });
  }
  changeUserId=e=>{
    this.setState({
      user_id:e.target.value
    });
  };
  render() {
    const { USERBLOCKLIST, loading, USERBLOCKPAGE, USERSELECTORS }=this.props;
    let List=[...USERSELECTORS];
    let dateMoment=moment().locale('zh-cn').format('YYYY-MM-DD HH:mm:ss');
    console.log(this.props);
    let chooseList=[];
    List.forEach((item,index)=>{
      item['id']=index;
      chooseList.push(item);
    });
    const columns=[
      {
        title: '限制user_id',
        dataIndex: 'user_id',
        key: 'user_id',
        width:200,
        fixed: 'left'
      },
      {
        title: 'SOPEIID',
        dataIndex: 'SOPEIID',
        key: 'SOPEIID',
      },
      {
        title: '选择器名称',
        dataIndex: 'user_rate_limit_selector_name',
        key: 'user_rate_limit_selector_name',
      },
      {
        title: '规则名称',
        dataIndex: 'user_rate_limit_rule_name',
        key: 'user_rate_limit_rule_name',
      },
      {
        title: '用户当天超频次数',
        dataIndex: 'user_rate_limit_block_count',
        key: 'user_rate_limit_block_count',
      },
      {
        title: '被封禁时的次数',
        dataIndex: 'user_rate_limit_count',
        key: 'user_rate_limit_count',
      },

      {
        title: '状态',
        dataIndex: 'user_rate_limit_status',
        key: 'user_rate_limit_status',
        width:100,
        render:(text,record)=>{
          return(
            <span>
              {
                text!=='BLOCK'?
                  <span style={{color:'green'}}>手动解封</span>
                  :
                  moment(record.end_time)<=moment(dateMoment)?
                    <span style={{color:'blue'}}>自动解封</span>
                    :
                    <span style={{color:'red'}}>已封禁</span>
              }
            </span>
            //
          );
        }
      },
      {
        title: <span>自动解封时间 <Tooltip title="到达该时间将会自动解封"><Icon type="question-circle" style={{fontSize:'16px'}} theme="filled" /></Tooltip></span>,
        dataIndex: 'end_time',
        key: 'end_time',
      },
      {
        title: '手动解封时间',
        dataIndex: 'update_time',
        key: 'update_time',
        render:(text,record)=>{
          return(
            <span>
              {
                record.update_time===record.create_time?
                  ''
                  :
                  <span>{record.update_time}</span>
              }
            </span>
          );
        }
      },
      {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width:130,
        render: (text, record) => (
          <div>
            <a onClick={()=>this.unLock(record)}>解封</a> | <a style={{color:'red'}} onClick={()=>this.lockForever(record)}>永久封禁</a>
          </div>
        ),
      },
    ];
    const paginations={
      pageSize:this.state.pageCount,
      current:this.state.page,
      total: parseInt(USERBLOCKLIST.count,10),
      showSizeChanger: true,
      showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`,
      onShowSizeChange: (current, perpage) => onHandlePageSizeChangeFn(current, perpage),
      onChange: page => onHandlePageChangeFn(page)
    };
    const onHandlePageSizeChangeFn = (current, perpage) => {
      this.setState({
        pageCount:perpage
      });
      this.fetchUserBlockList({...USERBLOCKPAGE, pageCount:perpage, page: 1});

    };
    const onHandlePageChangeFn = page => {
      this.setState({
        page:page
      });
      this.fetchUserBlockList({...USERBLOCKPAGE, pageCount:this.state.pageCount, page:page});
    };

    return (
      <Card className={styles.factoryCategoryList}>
        <div className={styles.titleMain}>
          <Tooltip placement="top" title={'返回上一页'}>
            <Icon type="left-circle" className={styles.backIcon} onClick={() => router.goBack()} />
          </Tooltip>
          <div className={styles.title}>用户频率限制</div>
        </div>
        <Card className={styles.search} bordered={false}>
          <Row type="flex">
            <Col>
              <label>选择器名及规则：</label><Cascader
                fieldNames={{ label: 'name', value: 'id', children: 'rules' }}
                options={chooseList}
                onChange={this.changeCascader}
                placeholder="请选择选择器名及规则"
                defaultValue={this.state.rulesList}
              />
              <label style={{marginLeft:'10px'}}>日期：</label>
              {
                this.state.start_date?
                  <DatePicker
                    onChange={this.handlestart_dateChange1}
                    placeholder="请选择起始日期"
                    disabledDate={this.handleStartDisabledDate1.bind(this)}
                    defaultValue={moment(this.state.start_date,'YYYY-MM-DD')}
                  />
                  :
                  <DatePicker
                    onChange={this.handlestart_dateChange1}
                    placeholder="请选择起始日期"
                    disabledDate={this.handleStartDisabledDate1.bind(this)}
                  />
              }
               —
              {
                this.state.end_date?
                  <DatePicker
                    onChange={this.handleend_dateChange1}
                    placeholder="请选择结束日期"
                    disabledDate={this.handleEndDisabledDate1.bind(this)}
                    defaultValue={moment(this.state.end_date,'YYYY-MM-DD')}
                  />
                  :
                  <DatePicker
                    onChange={this.handleend_dateChange1}
                    placeholder="请选择结束日期"
                    disabledDate={this.handleEndDisabledDate1.bind(this)}
                  />
              }
              <label style={{marginLeft:'10px'}}>user_id：</label><Input placeholder="请输入user_id" allowClear defaultValue={this.state.user_id} style={{width:'200px'}} onChange={this.changeUserId} />
            </Col>
            <Col>
              <Button type="primary" style={{marginLeft:'10px'}} onClick={()=>this.searchIp()}>
                        搜索
              </Button>
            </Col>
          </Row>
        </Card>
        <Table columns={columns} dataSource={USERBLOCKLIST.userList} bordered
          aligin="center"
          rowKey={(record,index)=>index}
          loading={loading['usermanager/fetchUserBlockList']}
          scroll={{x:'max-content'}}
          pagination={paginations}
        />
      </Card>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    loading:state.loading.effects,
    ...state.usermanager
  };

};
export default connect(mapStateToProps)(Ipunlock);
