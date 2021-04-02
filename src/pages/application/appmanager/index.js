import React, { Component } from 'react';
import { Card ,Table, Result , Modal , message ,Button} from 'antd';
import styles from './index.less';
import {connect} from 'dva';
import router from 'umi/router';
const { confirm } = Modal;
class Appmanageer extends Component {

  state={
    page:this.props.APPPAGES.page,
    pageCount:this.props.APPPAGES.pageCount
  }
  componentDidMount() {
    const {APPPAGES}=this.props;
    this.fetchAppmanagerlist(APPPAGES);

  }
  fetchAppmanagerlist = params => {
    this.props.dispatch({ type: 'appmanager_id/fetchAppmanagerList', payload: params });
  };
  render() {
    const {APPMANAGERLIST , loading ,APPPAGES }=this.props;
    const columns = [
      {
        title: '应用名称',
        dataIndex: 'market_app_name',
        key: 'market_app_name',
      },
      {
        title: '应用code',
        dataIndex: 'market_app_code',
        key: 'market_app_code',
      },
      {
        title: '应用简介',
        dataIndex: 'market_app_introduce',
        key: 'market_app_introduce',
      },
      {
        title: '应用特点',
        dataIndex: 'market_app_feature',
        key: 'market_app_feature',
      },
      {
        title: '应用状态',
        dataIndex: 'market_app_status',
        key: 'market_app_status',
        render: text => text=='WAIT'?'待上架':text=='ON'?'已上架':'已下架',
      },
      {
        title: '应用开放范围',
        dataIndex: 'market_app_open_type',
        key: 'market_app_open_type',
        render: text => text=='ALL_TENANT'?'开放所有商户':text=='SOME_TENANT'?'特定商户开放':'特定标签的商户开放',
      },
      {
        title: '付费类型',
        dataIndex: 'market_app_pay_type',
        key: 'market_app_pay_type',
        render: text => text=='TENANT'?'按商户付费':(text=='BRAND'?'按品牌付费':'按品类付费'),
      },
      {
        title: '创建人',
        dataIndex: 'create_name',
        key: 'create_name',
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => (
          <div>
            <a onClick={()=>tosmyEdit(record.market_app_id)}>编辑</a> | <a onClick={()=>pushShelf(record.market_app_status,record.market_app_id)}>{record.market_app_status=='WAIT'|| record.market_app_status=='OFF'?'上架':'下架'}</a>
          </div>
        ),
      },
    ];
    const pushShelf=(status,id)=>{
      if(status==='WAIT'|| status==='OFF'){
        confirm({
          title: '确认上架?',
          content: '请确认应用信息是否无误。',
          onOk:()=>{
            this.props.dispatch({
              type: 'appmanager_id/fetchAppmanagerUpdateList',
              data:{market_app_status:'ON',market_app_id:id}
            });
            message.success('上架成功');
          },
          onCancel() {
          },
        });
      }else{
        confirm({
          title: '确认下架?',
          content: '请确认应用信息是否无误。',
          onOk:()=>{
            this.props.dispatch({
              type: 'appmanager_id/fetchAppmanagerUpdateList',
              data:{market_app_status:'OFF',market_app_id:id}
            });;
            message.success('下架成功');
          },
          onCancel() {
          },
        });
      }
    };
    const tosmyEdit=(key_id)=>{
      router.push('./appmanager/' + key_id);
      const params={market_app_id:key_id};
      fetchAppmanagerEdit(params);
    };
    const fetchAppmanagerEdit=params=>{
      this.props.dispatch({
        type:'appmanager_id/fetchAppmanagerEditList',
        payload:params
      });
    };
    const paginations={
      pageSize:this.state.pageCount,
      current:this.state.page,
      total: parseInt(APPMANAGERLIST.count,10),
      showSizeChanger: true,
      showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`,
      onShowSizeChange: (current, perpage) => onHandlePageSizeChangeFn(current, perpage),
      onChange: page => onHandlePageChangeFn(page)
    };
    const onHandlePageSizeChangeFn = (current, perpage) => {
      this.setState({
        pageCount:perpage
      });
      this.fetchAppmanagerlist({...APPPAGES, pageCount:perpage, page: 1});
    };
    const onHandlePageChangeFn = page => {
      this.setState({
        page:page
      });
      this.fetchAppmanagerlist({pageCount:this.state.pageCount, page:page });
    };
    return (
      <>

        <Card className={styles.factoryCategoryList} style={{padding:'20px'}}>
          <Button style={{marginBottom:'20px'}} type="primary" onClick={()=>router.push('appmanager/-1')}>新建应用</Button>
          {
            APPMANAGERLIST.apps.length!==0?

              <Table columns={columns} dataSource={APPMANAGERLIST.apps} bordered
                aligin="center"
                rowKey={(record,index)=>index}
                loading={loading['appmanager_id/fetchAppmanagerList']}
                scroll={{x:'max-content'}}
                pagination={paginations}
              />
              :
              <Result
                status="warning"
                title="暂无应用"
              />
          }
        </Card>

      </>
    );
  }
}
const mapStateToProps = (state) =>{
  return {
    loading:state.loading.effects,
    ...state.appmanager_id

  };

};
export default connect(mapStateToProps)(Appmanageer);
