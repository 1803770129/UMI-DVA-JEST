import React, { Component, useEffect } from 'react';
import { Card, Button, DatePicker, Icon, Tooltip , Select } from 'antd';
import styles from './trend.less';
import moment from 'moment';
import { Chart } from '@antv/g2';
import { connect } from 'dva';
import router from 'umi/router';
const { MonthPicker } = DatePicker;
const { Option } = Select;
const CHART = props => {
  let {LASTTRENDLIST}=props;
  useEffect(() => {
    // console.log(LASTTRENDLIST);
    const chart = new Chart({
      container: 'chart',
      autoFit: true,
      height: 500,
      width: Number(window.innerWidth) - 400
    });

    chart.data(LASTTRENDLIST);
    chart.scale({
      time: {
        range: [0, 1],

      },
      num: {
        nice: true,
      },
    });

    chart.tooltip({
      showCrosshairs: true,
      shared: true,
    });
    chart
      .line()
      .position('time*num')
      .color('type', ['#1A82D2', '#F5222D']);
    chart.interaction('element-active');
    //   chart.line().position('time*num');
    chart.area().position('time*num')
      .color('type', ['#1A82D2', '#F5222D']);
    //   .style({
    //     fillOpacity: 0.5,
    //   });
    chart.render();
    return ()=>{
      chart.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [LASTTRENDLIST]);
  return (
    <div id="chart"></div>
  );
};
class PartTrend extends Component {
    state = {
      PartTrendWay: 'day',
      dayTime: this.props.location.query.startDate,
      monthTime: this.props.location.query.startMonth,
      searchWay: 'PV'
    }
    componentDidMount() {
      this.setState({
        PartTrendWay:this.props.location.query.infoWay
      });
      this.fetchLastTrendList();
    }
    fetchLastTrendListDay=(day)=>{
      this.props.dispatch({
        type:'statistics/fetchLastTrendList',
        payload:{
          start_date:day,
          end_date:day,
          host:this.props.match.params.id,
          type:this.state.searchWay
        }
      });
    }
    fetchLastTrendListMonth=(month)=>{
      this.props.dispatch({
        type:'statistics/fetchLastTrendList',
        payload:{
          start_date:month,
          host:this.props.match.params.id,
          type:this.state.searchWay
        }
      });
    }
    fetchLastTrendList=()=>{
      let infoWay=this.props.location.query.infoWay;
      if(infoWay==='day'){
        this.fetchLastTrendListDay(this.state.dayTime);
      }else{
        this.fetchLastTrendListMonth(this.state.monthTime);
      }
    }
    clickDay = () => {
      this.setState({
        PartTrendWay: 'day'
      });
      this.fetchLastTrendListDay(this.state.dayTime);
    }
    clickMonth = () => {
      this.setState({
        PartTrendWay: 'month'
      });
      this.fetchLastTrendListMonth(this.state.monthTime);
    }
    dayChange = (date, dateString) => {
      this.setState({
        dayTime: dateString
      });
      this.fetchLastTrendListDay(dateString);
    }
    monthChhange = (date, dateString) => {
      this.setState({
        monthTime: dateString
      });
      this.fetchLastTrendListMonth(dateString);
    }
    changeWay = (val) =>{
      if(this.state.PartTrendWay==='day'){
        this.props.dispatch({
          type:'statistics/fetchLastTrendList',
          payload:{
            start_date:this.state.dayTime,
            end_date:this.state.dayTime,
            host:this.props.match.params.id,
            type:val
          }
        });
      }else{
        this.props.dispatch({
          type:'statistics/fetchLastTrendList',
          payload:{
            start_date:this.state.monthTime,
            host:this.props.match.params.id,
            type:val
          }
        });
      }
    }
    render() {
      const { LASTTRENDLIST }=this.props;
      const { PartTrendWay } = this.state;
      let date = this.props.location.query.startDate;
      let month = this.props.location.query.startMonth;
      return (
        <Card className={styles.factoryCategoryList}>
          <div className={styles.titleMain}>
            <Tooltip placement="top" title={'???????????????'}>
              <Icon type="left-circle" className={styles.backIcon} onClick={() => router.goBack()} />
            </Tooltip>
            <div className={styles.title}>??????????????????</div>
          </div>
          <Button className={styles.btn} type={PartTrendWay === 'day' ? 'primary' : 'default'} onClick={() => this.clickDay()}>???</Button><Button className={styles.btn} type={PartTrendWay === 'month' ? 'primary' : 'default'} onClick={() => this.clickMonth()}>???</Button>
          <div className={styles.datepick}>
            <label>???????????????</label><DatePicker defaultValue={moment(date, 'YYYY-MM-DD')} allowClear={false} disabled={PartTrendWay === 'day' ? false : true} onChange={this.dayChange} />
            <label style={{ marginLeft: '20px' }}>???????????????</label><MonthPicker defaultValue={moment(month, 'YYYY-MM')} allowClear={false} disabled={PartTrendWay === 'month' ? false : true} onChange={this.monthChhange} />
            <label style={{ marginLeft: '20px' }}>???????????????</label>
            <Select defaultValue="????????????PV???" style={{ width: 170 }} onChange={this.changeWay}>
              <Option value="PV">????????????PV???</Option>
              <Option value="UV">????????????UV???</Option>
              <Option value="vehicle">?????????????????????</Option>
              <Option value="vin">???Vin????????????</Option>
              <Option value="ocr">???OCR??????????????????</Option>
              <Option value="code">?????????????????????</Option>
            </Select>
          </div>

          <CHART LASTTRENDLIST={LASTTRENDLIST} />
          <span className={styles.warn}><Icon type="warning" style={{marginRight:'5px'}} /><b>now</b>?????????/??????  <b>last</b>?????????/?????? </span>
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
export default connect(mapStateToProps)(PartTrend);
