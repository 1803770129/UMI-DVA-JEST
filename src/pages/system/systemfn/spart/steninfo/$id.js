import React, { Component, useEffect, useState, useImperativeHandle } from 'react';
import { Card, DatePicker, Icon, Tooltip, Table, Select } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import router from 'umi/router';
import styles from './info.less';
import { Chart } from '@antv/g2';
const { Option } = Select;
const TenChart = React.forwardRef((props,ref) => {
  const {STRENDlIST}=props;
  const [list, setList] = useState(STRENDlIST);
  let way=props.way;
  const changeWay=()=>{
    let reList=[];
    // 筛选数据
    STRENDlIST.forEach(item=>{
      let format={};
      format['date']=item.date;
      format[way]=item[way];
      reList.push(format);
    });
    setList(reList);
  };
  const changeDate=()=>{
    console.log(STRENDlIST);
    setList(STRENDlIST);
  };
  useImperativeHandle(ref,()=>({
    changeWay,
    changeDate
  }));
  useEffect(() => {
    const chart = new Chart({
      container: 'c1',
      autoFit: true,
      height: 300,
      width: Number(window.innerWidth)-400
    });
    chart.data(list);
    chart.scale({
      time: {
        tickCount: 10
      },
      way: {
        nice: true,
      },
    });

    chart.tooltip({
      showCrosshairs: true,
      shared: true,
    });
    chart
      .line()
      .position('date*'+way);
    chart.interaction('element-active');
    chart.render();
    return ()=>{

      chart.destroy();
    };
  },[list,STRENDlIST]);
  return (
    <div id="c1"></div>
  );
}
);
class PartTrend extends Component {
    state = {
      brandId: '',
      brandName: '',
      startDate: this.props.location.query.startDate,
      endDate: this.props.location.query.startDate,
      way:'pv',
      flowShow:false
    }
    componentDidMount() {
      // console.log(this.props);
      this.setState({
        brandId: this.props.match.params.id,
        brandName: this.props.location.query.brand_name
      });
      this.fetchBrandTrend();
      this.childref=React.createRef();
    }
    fetchBrandTrend=()=>{
      this.props.dispatch({
        type:'statistics/fetchBrandTrend',
        payload:{
          host:this.props.location.query.host,
          ten_brand_id:this.props.match.params.id,
          start_date:this.state.startDate,
          end_date:this.state.endDate
        }
      });
    }
    handleStartDateChange1 = async(value, dateString) => {
      this.setState({
        startDate: dateString,
      });
      if(this.state.endDate!==''&&dateString!==''){
        await this.props.dispatch({
          type:'statistics/fetchBrandTrend',
          payload:{
            host:this.props.location.query.host,
            ten_brand_id:this.props.match.params.id,
            start_date:dateString,
            end_date:this.state.endDate
          }
        });
        if(this.childref.current){
          setTimeout(() => {
            this.childref.current.changeDate();
          },);
        }
      }

    }
    handleEndDateChange1 = async(value, dateString) => {
      this.setState({
        endDate: dateString,
      });
      if(this.state.startDate!==''&&dateString!==''){
        await this.props.dispatch({
          type:'statistics/fetchBrandTrend',
          payload:{
            host:this.props.location.query.host,
            ten_brand_id:this.props.match.params.id,
            start_date:this.state.startDate,
            end_date:dateString
          }
        });
        if(this.childref.current){
          setTimeout(() => {
            this.childref.current.changeDate();
          },);
        }
      }

    }
    // 结束时间可选范围
    handleEndDisabledDate1 = (current) => {
      const { startDate } = this.state;
      if (startDate !== '') {
        return current && current > moment().endOf('day') || current > moment(startDate).add(31, 'day') || current < moment(startDate);
      } else {
        return;
      }
    }
    // 开始时间可选范围
    handleStartDisabledDate1 = (current) => {
      const { endDate } = this.state;
      if (endDate !== '') {
        return current && current > moment().endOf('day') || current < moment(endDate).subtract(31, 'day') || current > moment(endDate);
      } else {
        return current && current > moment().endOf('day');
      }
    }
    changeWay = (val) =>{
      this.setState({
        way:val
      });
      if(this.childref.current){
        setTimeout(() => {
          this.childref.current.changeWay();
        },);
      }
    }
    render() {
      const { STRENDlIST ,loading } = this.props;
      const { brandName } = this.state;
      let date = this.props.location.query.startDate;
      const colums=[
        {
          title: '时间',
          dataIndex: 'date',
          key: 'date',
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
        }
      ];
      return (
        <Card className={styles.factoryCategoryList}>
          <div className={styles.titleMain}>
            <Tooltip placement="top" title={'返回上一页'}>
              <Icon type="left-circle" className={styles.backIcon} onClick={() => router.goBack()} />
            </Tooltip>
            <div className={styles.title}><span style={{ color: '#1A82D2', marginRight: '5px' }}>{brandName}</span> 详细查询数据</div>
          </div>
          <div className={styles.formMain}>
            <div style={{marginRight:'10px'}}><label>选择时间：</label><DatePicker defaultValue={moment(date, 'YYYY-MM-DD')} allowClear onChange={this.handleStartDateChange1} disabledDate={this.handleStartDisabledDate1.bind(this)} /> - <DatePicker defaultValue={moment(date, 'YYYY-MM-DD')} allowClear disabled={this.state.startDate === '' ? true : false} onChange={this.handleEndDateChange1} disabledDate={this.handleEndDisabledDate1.bind(this)} /></div>
            <div><label>查询信息：</label> <Select defaultValue="pv" style={{ width: 170 }} onChange={this.changeWay}>
              <Option value="pv">浏览量（PV）</Option>
              <Option value="uv">访客数（UV）</Option>
              <Option value="vehicleQuery">按车型查询次数</Option>
              <Option value="vinQuery">按Vin查询次数</Option>
              <Option value="ocrQuery">按OCR识别查询次数</Option>
              <Option value="codeQuery">按编码查询次数</Option>
            </Select></div>
          </div>
          {
            this.state.flowShow?
              <div className={styles.flowShow} onClick={()=>this.setState({flowShow:false})}><Icon type="down-square" style={{fontSize:'20px',marginRight:'5px'}} /><span>点击隐藏趋势图</span></div>
              :
              <div className={styles.flowShow} onClick={()=>this.setState({flowShow:true})}><Icon type="up-square" style={{fontSize:'20px',marginRight:'5px'}} /><span>点击显示趋势图</span></div>
          }
          {
            this.state.flowShow&&
            <TenChart STRENDlIST={STRENDlIST} way={this.state.way} ref={this.childref}/>
          }
          <Table columns={colums} dataSource={STRENDlIST} bordered
            aligin="center"
            rowKey={(record,index)=>index}
            style={{marginTop:'30px'}}
            loading={loading['statistics/fetchBrandTrend']}
            scroll={{x:'max-content'}}
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
export default connect(mapStateToProps)(PartTrend);
