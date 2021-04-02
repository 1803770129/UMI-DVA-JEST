import React, { Component } from 'react';
import { Card, Col, Row, Button, DatePicker,Table,Tooltip,Icon } from 'antd';
import styles from './index.less';
import moment from 'moment';
import { connect } from 'dva';
import router from 'umi/router';
const { MonthPicker } = DatePicker;
class Spart extends Component {
    state = {
      trendWay: 'day',
      dayTime: moment().locale('zh-cn').format('YYYY-MM-DD'),
      monthTime:moment().locale('zh-cn').format('YYYY-MM')
    }
    componentDidMount() {
      // 获取端口列表
      this.fetchPartList();
    }
    fetchPartList=async()=>{
      await this.props.dispatch({
        type:'statistics/fetchPartList',
        payload:{
          statistics_day:this.state.dayTime
        }
      });
    }
    clickDay = () => {
      this.setState({
        trendWay: 'day'
      });
      this.props.dispatch({
        type:'statistics/fetchPartList',
        payload:{
          statistics_day:this.state.dayTime
        }
      });
    }
    clickMonth = () => {
      this.setState({
        trendWay: 'month'
      });
      this.props.dispatch({
        type:'statistics/fetchPartList',
        payload:{
          statistics_month:this.state.monthTime
        }
      });
    }
    dayChange = async(date, dateString) => {
      this.setState({
        dayTime:dateString
      });
      await this.props.dispatch({
        type:'statistics/fetchPartList',
        payload:{
          statistics_day:dateString
        }
      });
    }
    monthChhange = async(date, dateString) => {
      this.setState({
        monthTime:dateString
      });
      await this.props.dispatch({
        type:'statistics/fetchPartList',
        payload:{
          statistics_month:dateString
        }
      });
    }
    toStenlist=(id)=>{
      router.push({
        pathname:`./spart/stenlist/${id}`,
        query:{
          month:this.state.monthTime,
          day:this.state.dayTime
        }
      });
    }
    render() {
      const {PARTLIST,loading}=this.props;
      const { trendWay } = this.state;
      let date = moment().locale('zh-cn').format('YYYY-MM-DD');
      const columns = [
        {
          title: '端口名称',
          dataIndex: 'host',
          key: 'host',
        },
        {
          title: 'pv',
          dataIndex: 'pv',
          key: 'pv',
        },
        {
          title: 'uv',
          dataIndex: 'uv',
          key: 'uv',
        },
        {
          title: '车型查询次数',
          dataIndex: 'vehicleQuery',
          key: 'vehicleQuery',
        },
        {
          title: 'VIN解析次数',
          dataIndex: 'vinQuery',
          key: 'vinQuery',
        },
        {
          title: 'OCR识别',
          dataIndex: 'ocrQuery',
          key: 'ocrQuery',
        },
        {
          title: '编码查询',
          dataIndex: 'codeQuery',
          key: 'codeQuery',
        },
        {
          title: '操作',
          key: 'action',
          render: (text, record) => (
            <div>
              <a onClick={()=>this.toStenlist(record.host)}>查看详情</a>
            </div>
          ),
        },
      ];
      return (
        <Card className={styles.factoryCategoryList}>
          <div className={styles.titleMain}>
            <Tooltip placement="top" title={'返回上一页'}>
              <Icon type="left-circle" className={styles.backIcon} onClick={() => router.goBack()} />
            </Tooltip>
          <div className={styles.title}>端口列表</div>
          </div>

          <Button className={styles.btn} type={trendWay === 'day' ? 'primary' : 'default'} onClick={() => this.clickDay()}>日</Button><Button className={styles.btn} type={trendWay === 'month' ? 'primary' : 'default'} onClick={() => this.clickMonth()}>月</Button>
          <div className={styles.datepick}>
            <label>按日查询：</label><DatePicker defaultValue={moment(date, 'YYYY-MM-DD')} allowClear={false} disabled={trendWay==='day'?false:true} onChange={this.dayChange} />
            <label style={{marginLeft:'20px'}}>按月查询：</label><MonthPicker defaultValue={moment(date, 'YYYY-MM')} allowClear={false} disabled={trendWay==='month'?false:true} onChange={this.monthChhange} />
          </div>
          <Table columns={columns} dataSource={PARTLIST} bordered
            aligin="center"
            rowKey={(record,index)=>index}
            loading={loading['statistics/fetchPartList']}
            // scroll={{x:'max-content'}}
            pagination={false}
          />
        </Card>
      );
    }
}
const mapStateToProps = (state) => {
  return {
    loading:state.loading.effects,
    ...state.statistics,
  };

};
export default connect(mapStateToProps)(Spart);
