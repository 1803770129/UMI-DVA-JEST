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
    page:this.props.IPBLOCKPAGE.page,
    pageCount:this.props.IPBLOCKPAGE.pageCount,
    rulesList:[],
    rules:'',
    start_date:'',
    end_date:'',
    ip:''
  }
  componentDidMount() {
    const {IPBLOCKPAGE}=this.props;
    this.fetchUserIpBlockList(IPBLOCKPAGE);
    this.fetchUserIpBlockSelector(IPBLOCKPAGE);
  }
  fetchUserIpBlockSelector=(IPBLOCKPAGE)=>{
    this.props.dispatch({
      type:'usermanager/fetchUserIpBlockSelector',
      payload:{
        ...IPBLOCKPAGE,
      }
    });
  }
  fetchUserIpBlockList=(IPBLOCKPAGE)=>{
    this.props.dispatch({
      type:'usermanager/fetchUserIpBlockList',
      payload:{
        ...IPBLOCKPAGE,
        start_date:this.state.start_date,
        end_date:this.state.end_date,
        ip_rate_limit_rule_id:this.state.rules,
        ip_rate_limit_ip:this.state.ip
      }
    });
  }
  unLock=(record)=>{
    confirm({
      content: <span>确定解除IP为：<span style={{color:'red'}}>{record.ip_rate_limit_ip}</span> 的封禁限制？</span>,
      onOk:()=>{
        this.props.dispatch({
          type:'usermanager/fetchUserIpUnlock',
          data:{
            ip_rate_limit_ip:record.ip_rate_limit_ip,
            ip_rate_limit_rule_id:record.ip_rate_limit_rule_id,
            ip_rate_limit_limit_key:record.ip_rate_limit_limit_key,
            ip_rate_limit_block_key:record.ip_rate_limit_block_key,
            ip_rate_limit_id:record.ip_rate_limit_id
          }
        });
      },
      onCancel() {
        // console.log('Cancel');
      },
    });
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
    const {IPBLOCKPAGE}=this.props;
    this.setState({
      page:1
    });
    this.props.dispatch({
      type:'usermanager/fetchUserIpBlockList',
      payload:{
        ...IPBLOCKPAGE,
        page:1,
        start_date:this.state.start_date,
        end_date:this.state.end_date,
        ip_rate_limit_rule_id:this.state.rules,
        ip_rate_limit_ip:this.state.ip
      }
    });
  }
  changeIp=e=>{
    this.setState({
      ip:e.target.value
    });
  };
  render() {
    const { USERIPBLOCKLIST, loading, IPBLOCKPAGE, SELECTORS }=this.props;
    let List=[...SELECTORS];
    let dateMoment=moment().locale('zh-cn').format('YYYY-MM-DD HH:mm:ss');
    console.log(this.props);
    let chooseList=[];
    List.forEach((item,index)=>{
      item['id']=index;
      chooseList.push(item);
    });
    const columns=[
      {
        title: 'IP插件限制IP',
        dataIndex: 'ip_rate_limit_ip',
        key: 'ip_rate_limit_ip',
        fixed: 'left'
      },
      {
        title: '选择器名称',
        dataIndex: 'ip_rate_limit_selector_name',
        key: 'ip_rate_limit_selector_name',
      },
      {
        title: '规则名称',
        dataIndex: 'ip_rate_limit_rule_name',
        key: 'ip_rate_limit_rule_name',
      },
      {
        title: 'IP插件规则ID',
        dataIndex: 'ip_rate_limit_rule_id',
        key: 'ip_rate_limit_rule_id',
      },
      {
        title: 'IP插件计次KEY',
        dataIndex: 'ip_rate_limit_limit_key',
        key: 'ip_rate_limit_limit_key',
      },
      {
        title: 'IP插件封禁KEY',
        dataIndex: 'ip_rate_limit_block_key',
        key: 'ip_rate_limit_block_key',
      },
      {
        title: '被封禁时的次数',
        dataIndex: 'ip_rate_limit_count',
        key: 'ip_rate_limit_count',
      },
      {
        title: '状态',
        dataIndex: 'ip_rate_limit_status',
        key: 'ip_rate_limit_status',
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
        title: '封禁时间',
        dataIndex: 'create_time',
        key: 'create_time',
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
        render: (text, record) => (
          <div>
            <a onClick={()=>this.unLock(record)}>解封</a>
          </div>
        ),
      },
    ];
    const paginations={
      pageSize:this.state.pageCount,
      current:this.state.page,
      total: parseInt(USERIPBLOCKLIST.count,10),
      showSizeChanger: true,
      showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`,
      onShowSizeChange: (current, perpage) => onHandlePageSizeChangeFn(current, perpage),
      onChange: page => onHandlePageChangeFn(page)
    };
    const onHandlePageSizeChangeFn = (current, perpage) => {
      this.setState({
        pageCount:perpage
      });
      this.fetchUserIpBlockList({...IPBLOCKPAGE, pageCount:perpage, page: 1});

    };
    const onHandlePageChangeFn = page => {
      this.setState({
        page:page
      });
      this.fetchUserIpBlockList({...IPBLOCKPAGE, pageCount:this.state.pageCount, page:page});
    };

    return (
      <Card className={styles.factoryCategoryList}>
        <div className={styles.titleMain}>
          <Tooltip placement="top" title={'返回上一页'}>
            <Icon type="left-circle" className={styles.backIcon} onClick={() => router.goBack()} />
          </Tooltip>
          <div className={styles.title}>IP解封</div>
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
              <label style={{marginLeft:'10px'}}>IP：</label><Input placeholder="请输入IP" allowClear defaultValue={this.state.ip} style={{width:'200px'}} onChange={this.changeIp} />
            </Col>
            <Col>
              <Button type="primary" style={{marginLeft:'10px'}} onClick={()=>this.searchIp()}>
                        搜索
              </Button>
            </Col>
          </Row>
        </Card>
        <Table columns={columns} dataSource={USERIPBLOCKLIST.ipList} bordered
          aligin="center"
          rowKey={(record,index)=>index}
          loading={loading['usermanager/fetchUserIpBlockList']}
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
