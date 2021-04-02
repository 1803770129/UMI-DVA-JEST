import React, { Component } from 'react';
import { Card ,Table, Select , Input , Button , Tooltip , message} from 'antd';
import styles from './index.less';
import {connect} from 'dva';
import router from 'umi/router';

const Option = Select.Option;
class Checklabel extends Component {
  state={
    selectedRowKeys:[],
    selectedRows:[],
    market_app_id:this.props.match.params.id,
    status:'0'
  }
  componentDidMount() {
    this.fetchCheckLabelList();
    this.fetchAllApp();
  }
  fetchCheckLabelList=async()=>{
    await this.props.dispatch({
      type:'label/fetchCheckLabelList',
      payload:{market_app_id:this.props.match.params.id}
    });
    const labels=this.props.CHECKLABELLIST.labels.filter(item=>item.checked===true).map(v=>v.ten_label_id);
    this.setState({
      selectedRowKeys:labels
    });
  }
  fetchAllApp=()=>{
    this.props.dispatch({
      type:'label/fetchAllApp',
      payload:{market_app_open_type:'LABEL_TENANT'}
    });
  }
  submitLabel=async()=>{
    if(this.state.status==='1'){
      let ten_label_ids=this.state.selectedRowKeys;
      const data={
        ten_label_ids:ten_label_ids,
        market_app_id:this.state.market_app_id
      };
      await this.props.dispatch({
        type:'label/fetchCheckLabelInsert',
        data:data
      });
    }else{
      message.warning('请改变后再提交');
    }
  }
  handleChange=(value)=>{
    this.props.dispatch({
      type:'label/fetchCheckLabelList',
      payload:{market_app_id:value}
    });
    const labels=this.props.CHECKLABELLIST.labels.filter(item=>item.checked===true).map(v=>v.ten_label_id);
    this.setState({
      status:'0',
      market_app_id:value,
      selectedRowKeys:labels
    });
  };
  render() {
    const {CHECKLABELLIST , ALLAPPLIST , loading}=this.props;
    const rowSelection = {
      selectedRowKeys:this.state.selectedRowKeys,
      onChange:(selectedRowKeys, selectedRows)=>{
        this.setState({
          selectedRowKeys:selectedRowKeys,
          selectedRows:selectedRows,
          status:'1'
        });

      },
    };
    const columns=[
      {
        title: '标签名称',
        dataIndex: 'ten_label_name',
        key: 'ten_label_name ',
        width:'200px'
      },
      {
        title: '描述',
        dataIndex: 'ten_label_memo',
        key: 'ten_label_memo',
      }
    ];

    return (
      <>
        <Card className={styles.factoryCategoryList} style={{padding:'20px'}}>
          <div style={{marginBottom:'20px'}}>
            <label>应用：</label><Select style={{ width: 150 }}  onChange={this.handleChange} allowClear showSearch defaultValue={this.props.match.params.id}
              filterOption={(value, option) => option.props.children.toLowerCase().indexOf(value.toLowerCase()) >= 0
              }>
              {
                ALLAPPLIST.map(item => <Option key={item.market_app_id}  value={item.market_app_id}>{item.market_app_name}</Option>)
              }
            </Select>
          </div>
          <div style={{marginBottom:'20px'}}>
            <br/>
            <Button type='primary' onClick={()=>this.submitLabel()}>批量提交</Button> <Tooltip title="批量设置应用标签">
              <span style={{color:'blue',opacity:'0.5'}}>有疑问？</span>
            </Tooltip>
          </div>
          <Table columns={columns} dataSource={CHECKLABELLIST.labels} bordered
            aligin="center"
            rowKey={(record,index)=>record.ten_label_id}
            loading={loading['label/fetchCheckLabelList']}
            rowSelection={rowSelection}
            pagination={false}
            scroll={{x:'max-content',y:'450px'}}
          />
          <Button onClick={()=>router.goBack()}>返回上一页</Button>
        </Card>
      </>
    );
  }
}
const mapStateToProps = (state) =>{
  return {
    loading:state.loading.effects,
    ...state.label

  };

};
export default connect(mapStateToProps)(Checklabel);

