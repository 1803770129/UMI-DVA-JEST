import React, { Component } from 'react';
import { Card ,Table, Select , Input , Button , Tooltip , message} from 'antd';
import styles from './index.less';
import {connect} from 'dva';
import router from 'umi/router';
const Option = Select.Option;
class Checktenant extends Component {
  state={
    market_app_id:this.props.match.params.id,
    page:this.props.TENPAGES.page,
    pageCount:this.props.TENPAGES.pageCount,
    searchVal:'',
    searchBrandVal:''
  }
  componentDidMount() {
    const {TENPAGES}=this.props;
    this.fetchCheckTenantList(TENPAGES);
    this.fetchAllApp();
  }
  componentWillUnmount(){
      this.props.dispatch({
        type:'label/updateTENFields',
      })
  }
  fetchCheckTenantList = params => {
    this.props.dispatch({ type: 'label/fetchCheckTenantList', payload: {...params , market_app_id:this.props.match.params.id} });
  };
  fetchAllApp=()=>{
    this.props.dispatch({
      type:'label/fetchAllApp',
      payload:{market_app_open_type:'SOME_TENANT'}
    });
  }
  DelCheckTen=async(record)=>{
    const params={
      market_app_id:this.state.market_app_id,
      tenant_id:record.tenant_id
    };
    await this.props.dispatch({ type: 'label/fetchDelCheckTen', payload: params });
  }
  AddCheckTen=async(record)=>{
    const params={
      market_app_id:this.state.market_app_id,
      tenant_id:record.tenant_id
    };
    await this.props.dispatch({ type: 'label/fetchAddCheckTen', payload: params });
  }
  tenSearchChange=e=>{
    this.setState({
      searchVal:e.target.value
    });
  }
  tenSearchChangeBrand=e=>{
    this.setState({
      searchBrandVal:e.target.value
    });
  }
  searchSubmit=async()=>{
    console.log(this.state.searchBrandVal )
    const {TENPAGES,dispatch}=this.props;
    await dispatch({
      type: 'label/fetchCheckTenantList',
      payload:{...TENPAGES,page:1,company_name:this.state.searchVal,ten_brand_name:this.state.searchBrandVal,market_app_id:this.state.market_app_id}
    });
    dispatch({
      type:'label/updateTENFields',
      payload:{company_name:this.state.searchVal,ten_brand_name:this.state.searchBrandVal}
    })
    this.setState({
      page:1
    });
  }
  render() {
    const {CTHECKTENLIST , ALLAPPLIST , TENPAGES , loading , FIELDS}=this.props;
    const columns=[
      {
        title: '????????????',
        dataIndex: 'company_name',
        key: 'company_name ',
      },
      {
        title: '????????????',
        dataIndex: 'ten_brand_names',
        key: 'ten_brand_names ',
        // width:'300px'
        render:(text)=>{
          if(text!==''){
            let arr=text.split(',')
          if(arr.length===1){
            return arr[0]
          }
          if(arr.length===2 || arr.length===3){
            return arr.join('???')
          }
          if(arr.length>3){
            return arr[0]+'???'+arr[1]+'???'+arr[2]+'????? ?? ?? '
          }
          }
        }
      },
      {
        title: '??????',
        key: 'action',
        render: (text, record) => (
          <div>
            {
              record.checked?
                <span><a style={{cursor:'no-drop' , color:'grey'}}>?????????</a> | <a style={{fontWeight:'bold'}} onClick={()=>this.DelCheckTen(record)}>??????</a></span>
                :
                <span><a style={{fontWeight:'bold'}} onClick={()=>this.AddCheckTen(record)}>??????</a> | <a style={{cursor:'no-drop' , color:'grey'}}>??????</a></span>
            }
          </div>
        ),
      },
    ];
    const handleChange=(value)=>{
      this.props.dispatch({
        type:'label/fetchCheckTenantList',
        payload:{market_app_id:value,page:1,pageCount:this.state.pageCount}
      });
      this.setState({
        market_app_id:value,
        page:1
      });
    };
    const paginations={
      pageSize:this.state.pageCount,
      current:this.state.page,
      total: parseInt(CTHECKTENLIST.count,10),
      showSizeChanger: true,
      showTotal: (total, range) => `?????? ${range[0]}-${range[1]}, ??? ${total} ?????????`,
      onShowSizeChange: (current, perpage) => onHandlePageSizeChangeFn(current, perpage),
      onChange: page => onHandlePageChangeFn(page)
    };
    const onHandlePageSizeChangeFn = (current, perpage) => {
      this.setState({
        pageCount:perpage
      });
      this.fetchCheckTenantList({...TENPAGES, pageCount:perpage, page: 1 , ...FIELDS});
    };
    const onHandlePageChangeFn = page => {
      this.setState({
        page:page
      });
      this.fetchCheckTenantList({pageCount:this.state.pageCount, page:page , ...FIELDS });
    };
    return (
      <>
        <Card className={styles.factoryCategoryList} style={{padding:'20px'}}>
          <div style={{marginBottom:'20px'}}>
            <label>?????????</label><Select style={{ width: 150 }}  onChange={handleChange} showSearch defaultValue={this.props.match.params.id}
              filterOption={(value, option) => option.props.children.toLowerCase().indexOf(value.toLowerCase()) >= 0}
            >
              {
                ALLAPPLIST.map(item => <Option key={item.market_app_id} value={item.market_app_id}>{item.market_app_name}</Option>)
              }
            </Select>
          </div>
          <div style={{marginBottom:'20px'}}>
            <label>???????????????</label><Input placeholder='?????????????????????' style={{width:'200px',marginRight:'20px'}} allowClear onChange={this.tenSearchChange} />
            <label>???????????????</label><Input placeholder='?????????????????????' style={{width:'200px'}} allowClear onChange={this.tenSearchChangeBrand} />
            <Button style={{marginLeft:'10px'}} onClick={()=>this.searchSubmit()} type='primary'>??????</Button>
          </div>
          <Table columns={columns} dataSource={CTHECKTENLIST.tentans} bordered
            // aligin="center"
            rowKey={(record,index)=>record.tenant_id}
            loading={loading['label/fetchCheckTenantList']}
            pagination={paginations}
            scroll={{x:'max-content'}}
          />
          <Button onClick={()=>router.goBack()}>???????????????</Button>
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
export default connect(mapStateToProps)(Checktenant);

