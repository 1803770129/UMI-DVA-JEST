import React, { Component } from 'react';
import { Card, Col, Row, Button,Table , Icon , Tooltip , Form ,Input} from 'antd';
import styles from './sten.less';
import moment from 'moment';
import { connect } from 'dva';
import router from 'umi/router';
const FormItem = Form.Item;
class StenList extends Component {
    state = {
      infoWay: 'day',
      flowShow:true,
      page:this.props.SBRANDPAGE.page,
      pageCount:this.props.SBRANDPAGE.pageCount,
      // day:moment().locale('zh-cn').format('YYYY-MM-DD'),
      // month:moment().locale('zh-cn').format('YYYY-MM'),
      partId:''
    }
    componentDidMount() {
      const {SBRANDPAGE}=this.props;
      this.setState({
        partId:this.props.match.params.id
      });
      // 获取商户品牌数据列表
      this.fetchSBrandList(SBRANDPAGE);
      // 获取流量数据列表
      this.fetchLastPeriod();
    }
    fetchSBrandList=(sbrandPage)=>{
      this.props.dispatch({
        type:'statistics/fetchSBrandList',
        payload:{
          ...sbrandPage,
          statistics_day:this.props.location.query.day,
          host:this.props.match.params.id
        }
      });
    }
    fetchLastPeriod=()=>{
      this.props.dispatch({
        type:'statistics/fetchLastPeriod',
        payload:{
          statistics_day:this.props.location.query.day,
          host:this.props.match.params.id
        }
      });
    }
    clickDay = () => {
      this.setState({
        infoWay: 'day',
        page:1,
        pageCount:10
      });
      this.props.dispatch({
        type:'statistics/fetchSBrandList',
        payload:{
          page:1,
          pageCount:this.props.SBRANDPAGE.pageCount,
          statistics_day:this.props.location.query.day,
          host:this.props.match.params.id
        }
      });
      this.props.dispatch({
        type:'statistics/fetchLastPeriod',
        payload:{
          statistics_day:this.props.location.query.day,
          host:this.props.match.params.id
        }
      });
    }
    clickMonth = () => {
      this.setState({
        infoWay: 'month',
        page:1,
        pageCount:10
      });
      this.props.dispatch({
        type:'statistics/fetchSBrandList',
        payload:{
          page:1,
          pageCount:this.props.SBRANDPAGE.pageCount,
          statistics_month:this.props.location.query.month,
          host:this.props.match.params.id
        }
      });
      this.props.dispatch({
        type:'statistics/fetchLastPeriod',
        payload:{
          statistics_month:this.props.location.query.month,
          host:this.props.match.params.id
        }
      });
    }
    handleTableChange=(pagination, filters, sorter)=>{
      // sorter.order:   "ascend":升序   "descend"：降序    无排序不会有order字段
      // sorter.columnKey:当前升降序的code
      this.setState({
        page:pagination.current,
        pageCount:pagination.pageSize
      })
      if(sorter['columnKey']){
        if(!sorter.order){
          if(this.state.infoWay==='day'){
            this.props.dispatch({
              type:'statistics/fetchSBrandList',
              payload:{
                page:pagination.current,
                pageCount:pagination.pageSize,
                statistics_day:this.props.location.query.day,
                host:this.props.match.params.id
              }
            });
          }else{
            this.props.dispatch({
              type:'statistics/fetchSBrandList',
              payload:{
                page:pagination.current,
                pageCount:pagination.pageSize,
                statistics_month:this.props.location.query.month,
                host:this.props.match.params.id
              }
            });
          }

        }else{
          console.log(sorter)
          if(this.state.infoWay==='day'){
            this.props.dispatch({
              type:'statistics/fetchSBrandList',
              payload:{
                page:pagination.current,
                pageCount:pagination.pageSize,
                statistics_day:this.props.location.query.day,
                host:this.props.match.params.id,
                type:sorter.columnKey,
                order:sorter.order==='ascend'?'asc':'desc'
              }
            });
          }else{
            this.props.dispatch({
              type:'statistics/fetchSBrandList',
              payload:{
                page:pagination.current,
                pageCount:pagination.pageSize,
                statistics_month:this.props.location.query.month,
                host:this.props.match.params.id,
                type:sorter.columnKey,
                order:sorter.order==='ascend'?'asc':'desc'
              }
            });
          }
        }

      }else{
        if(this.state.infoWay==='day'){
          this.props.dispatch({
            type:'statistics/fetchSBrandList',
            payload:{
              page:pagination.current,
              pageCount:pagination.pageSize,
              statistics_day:this.props.location.query.day,
              host:this.props.match.params.id
            }
          });
        }else{
          this.props.dispatch({
            type:'statistics/fetchSBrandList',
            payload:{
              page:pagination.current,
              pageCount:pagination.pageSize,
              statistics_month:this.props.location.query.month,
              host:this.props.match.params.id
            }
          });
        }
      }

    }

    search=(e)=>{
      e.preventDefault();
      this.setState({
        page:1
      })
      const { form } = this.props;
      form.validateFields(async(err, values) => {
        console.log(values);
        if(this.state.infoWay==='day'){
          this.props.dispatch({
            type:'statistics/fetchSBrandList',
            payload:{
              page:1,
              pageCount:this.props.SBRANDPAGE.pageCount,
              statistics_day:this.props.location.query.day,
              host:this.props.match.params.id,
              ten_brand_name:values.brandName
            }
          });
        }else{
          this.props.dispatch({
            type:'statistics/fetchSBrandList',
            payload:{
              page:1,
              pageCount:this.props.SBRANDPAGE.pageCount,
              statistics_month:this.props.location.query.month,
              host:this.props.match.params.id,
              ten_brand_name:values.brandName
            }
          });
        }
      });
    }
    render() {
      const { infoWay,partId } = this.state;
      const { form, SBRANDLIST, loading, PERIODLIST }=this.props;
      const {getFieldDecorator}=form;
      const columns = [
        {
          title: 'date',
          dataIndex: 'date',
          key: 'date',
          align:'center'
        },
        {
          title: 'pv',
          dataIndex: 'pv',
          key: 'pv',
          align:'center',
          render:(text,record)=>{
            if(record.date==='较昨日' ||record.date==='较前月'){
              if(record.pv>0){
                return(
                  <span>{text}<Icon type="arrow-up" style={{marginLeft:'10px',color:'#1A82D2',fontSize:'15px'}} /></span>
                );
              }else if(record.pv<0){
                return(
                  <span>{text}<Icon type="arrow-down" style={{marginLeft:'10px',color:'red',fontSize:'15px'}} /></span>
                );
              }else{
                return(
                  <span>{text}</span>
                );
              }
            }else{
              return(
                <span>{text}</span>
              );
            }
          }
        },
        {
          title: 'uv',
          dataIndex: 'uv',
          key: 'uv',align:'center',
          render:(text,record)=>{
            if(record.date==='较昨日' ||record.date==='较前月'){
              if(record.uv>0){
                return(
                  <span>{text}<Icon type="arrow-up" style={{marginLeft:'10px',color:'#1A82D2',fontSize:'15px'}} /></span>
                );
              }else if(record.uv<0){
                return(
                  <span>{text}<Icon type="arrow-down" style={{marginLeft:'10px',color:'red',fontSize:'15px'}} /></span>
                );
              }else{
                return(
                  <span>{text}</span>
                );
              }
            }else{
              return(
                <span>{text}</span>
              );
            }
          }
        },
        {
          title: '车型查询次数',
          dataIndex: 'vehicleQuery',
          key: 'vehicleQuery',
          align:'center',
          render:(text,record)=>{
            if(record.date==='较昨日' ||record.date==='较前月'){
              if(record.vehicleQuery>0){
                return(
                  <span>{text}<Icon type="arrow-up" style={{marginLeft:'10px',color:'#1A82D2',fontSize:'15px'}} /></span>
                );
              }else if(record.vehicleQuery<0){
                return(
                  <span>{text}<Icon type="arrow-down" style={{marginLeft:'10px',color:'red',fontSize:'15px'}} /></span>
                );
              }else{
                return(
                  <span>{text}</span>
                );
              }
            }else{
              return(
                <span>{text}</span>
              );
            }
          }
        },
        {
          title: 'VIN解析次数',
          dataIndex: 'vinQuery',
          key: 'vinQuery',
          align:'center',
          render:(text,record)=>{
            if(record.date==='较昨日' ||record.date==='较前月'){
              if(record.vinQuery>0){
                return(
                  <span>{text}<Icon type="arrow-up" style={{marginLeft:'10px',color:'#1A82D2',fontSize:'15px'}} /></span>
                );
              }else if(record.vinQuery<0){
                return(
                  <span>{text}<Icon type="arrow-down" style={{marginLeft:'10px',color:'red',fontSize:'15px'}} /></span>
                );
              }else{
                return(
                  <span>{text}</span>
                );
              }
            }else{
              return(
                <span>{text}</span>
              );
            }
          }
        },
        {
          title: 'OCR识别',
          dataIndex: 'ocrQuery',
          key: 'ocrQuery',
          align:'center',
          render:(text,record)=>{
            if(record.date==='较昨日' ||record.date==='较前月'){
              if(record.ocrQuery>0){
                return(
                  <span>{text}<Icon type="arrow-up" style={{marginLeft:'10px',color:'#1A82D2',fontSize:'15px'}} /></span>
                );
              }else if(record.ocrQuery<0){
                return(
                  <span>{text}<Icon type="arrow-down" style={{marginLeft:'10px',color:'red',fontSize:'15px'}} /></span>
                );
              }else{
                return(
                  <span>{text}</span>
                );
              }
            }else{
              return(
                <span>{text}</span>
              );
            }
          }
        },
        {
          title: '编码查询',
          dataIndex: 'codeQuery',
          key: 'codeQuery',
          align:'center',
          render:(text,record)=>{
            if(record.date==='较昨日' ||record.date==='较前月'){
              if(record.codeQuery>0){
                return(
                  <span>{text}<Icon type="arrow-up" style={{marginLeft:'10px',color:'#1A82D2',fontSize:'15px'}} /></span>
                );
              }else if(record.codeQuery<0){
                return(
                  <span>{text}<Icon type="arrow-down" style={{marginLeft:'10px',color:'red',fontSize:'15px'}} /></span>
                );
              }else{
                return(
                  <span>{text}</span>
                );
              }
            }else{
              return(
                <span>{text}</span>
              );
            }
          }
        }
      ];
      const columnsTen = [
        {
          title: '品牌名称',
          dataIndex: 'ten_brand_name',
          key: 'ten_brand_name',
        },
        {
          title: '商户名称',
          dataIndex: 'company_name',
          key: 'company_name',
        },
        {
          title: 'pv',
          dataIndex: 'pv',
          key: 'pv',
          sorter:true
        },
        {
          title: 'uv',
          dataIndex: 'uv',
          key: 'uv',
          sorter:true
        },
        {
          title: '车型查询次数',
          dataIndex: 'vehicleQuery',
          key: 'vehicleQuery',
          sorter:true
        },
        {
          title: 'VIN解析次数',
          dataIndex: 'vinQuery',
          key: 'vinQuery',
          sorter:true
        },
        {
          title: 'OCR识别',
          dataIndex: 'ocrQuery',
          key: 'ocrQuery',
          sorter:true
        },
        {
          title: '编码查询',
          dataIndex: 'codeQuery',
          key: 'codeQuery',
          sorter:true
        },
        {
          title: '操作',
          key: 'action',
          render: (text, record) => (
            <div>
              <span className={styles.routes} onClick={()=>router.push({pathname:'../steninfo/'+record.ten_brand_id,query:{host:this.props.match.params.id,brand_name:record.ten_brand_name,startDate:this.props.location.query.day}})}>查看品牌详细数据</span>
            </div>
          ),
        },
      ];
      const paginations={
        pageSize:this.state.pageCount,
        current:this.state.page,
        total: parseInt(SBRANDLIST.count,10),
        showSizeChanger: true,
        showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`,
        // onShowSizeChange: (current, perpage) => onHandlePageSizeChangeFn(current, perpage),
        // onChange: page => onHandlePageChangeFn(page)
      };
      // const onHandlePageSizeChangeFn = (current, perpage) => {
      //   this.setState({
      //     pageCount:perpage
      //   });
      //   if(infoWay==='day'){
      //     this.props.dispatch({
      //       type:'statistics/fetchSBrandList',
      //       payload:{
      //         ...this.props.SBRANDPAGE,pageCount:perpage, page: 1,host:this.props.match.params.id,statistics_day:this.props.location.query.day
      //       }
      //     });
      //   }else{

      //     this.props.dispatch({
      //       type:'statistics/fetchSBrandList',
      //       payload:{
      //         ...this.props.SBRANDPAGE,pageCount:perpage, page: 1,host:this.props.match.params.id,statistics_month:this.props.location.query.month
      //       }
      //     });
      //   }

      // };
      // const onHandlePageChangeFn = page => {
      //   this.setState({
      //     page:page
      //   });
      //   if(infoWay==='day'){
      //     this.props.dispatch({
      //       type:'statistics/fetchSBrandList',
      //       payload:{
      //         pageCount:this.state.pageCount, page:page ,host:this.props.match.params.id,statistics_day:this.props.location.query.day
      //       }
      //     });
      //   }else{
      //     console.log(this.state.pageCount);
      //     this.props.dispatch({
      //       type:'statistics/fetchSBrandList',
      //       payload:{
      //         pageCount:this.state.pageCount, page:page ,host:this.props.match.params.id,statistics_month:this.props.location.query.month
      //       }
      //     });
      //   }

      // };
      return (
        <Card className={styles.factoryCategoryList}>
          <div className={styles.title}>
            <Tooltip placement="top" title={'返回上一页'}>
              <Icon type="left-circle" className={styles.backIcon} onClick={()=>router.goBack()} />
            </Tooltip>
            <span style={{color:'#1A82D2',marginRight:'5px'}}>{partId}</span> 数据详情
          </div>
          <Tooltip placement="top" title={this.props.location.query.day}>
            <Button className={styles.btn} type={infoWay === 'day' ? 'primary' : 'default'} onClick={() => this.clickDay()}>当日</Button>
          </Tooltip>
          <Tooltip placement="top" title={this.props.location.query.month}>
            <Button className={styles.btn} type={infoWay === 'month' ? 'primary' : 'default'} onClick={() => this.clickMonth()}>当月</Button>
          </Tooltip>
          <span style={{color:'#aaa',marginLeft:'10px'}}>在上一页可以重新选择天和月</span>
          <div className={styles.info}>
            <div className={styles.flexInfo}>
              {
                this.state.flowShow?
                  <div className={styles.flowShow} onClick={()=>this.setState({flowShow:false})}><Icon type="down-square" style={{fontSize:'20px',marginRight:'5px'}} /><span>点击隐藏</span></div>
                  :
                  <div className={styles.flowShow} onClick={()=>this.setState({flowShow:true})}><Icon type="up-square" style={{fontSize:'20px',marginRight:'5px'}} /><span>点击显示</span></div>
              }

              <div className={styles.titleH3}>{infoWay==='day'?'当日流量':'当月流量'}</div>


              <Button type="primary" shape="round" icon="line-chart" onClick={()=>router.push({pathname:'../parttrend/'+this.props.match.params.id,query:{startDate:this.props.location.query.day,startMonth:this.props.location.query.month,infoWay:this.state.infoWay}})}>点击查看趋势</Button>
            </div>
            {
              this.state.flowShow &&
                        <Table columns={columns} dataSource={PERIODLIST}
                          bordered
                          aligin="center"
                          rowKey={(record,index)=>index}
                          loading={loading['statistics/fetchLastPeriod']}
                          scroll={{x:'max-content'}}
                        />
            }
          </div>

          <div>
            <div className={styles.titleH3} style={{marginTop:'15px',marginBottom:'15px'}}>商户品牌信息列表</div>
            <Form layout="inline" style={{marginBottom:20}} autoComplete="off" onSubmit={e=>this.search(e)}>
              <Row type="flex">
                <Col>
                  <FormItem label="品牌名称">
                    {
                      getFieldDecorator(
                        'brandName'
                      )(
                        <Input placeholder="请输入商户品牌名称" />
                      )
                    }
                  </FormItem>
                </Col>
                <Col>
                  <FormItem>
                    <Button htmlType="submit" type="primary" style={{marginRight:'15px'}}>
                                    搜索
                    </Button>
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </div>
          <Table columns={columnsTen} dataSource={SBRANDLIST.tenBrands}
            bordered
            aligin="center"
            rowKey={(record,index)=>index}
            onChange={this.handleTableChange}
            loading={loading['statistics/fetchSBrandList']}
            scroll={{x:'max-content'}}
            pagination={paginations}
          />
        </Card>
      );
    }
}
const mapStateToProps = (state) =>{
  return{
    loading:state.loading.effects,
    ...state.statistics,
  };

};
const Sten = Form.create()(StenList);
export default connect(mapStateToProps)(Sten);
