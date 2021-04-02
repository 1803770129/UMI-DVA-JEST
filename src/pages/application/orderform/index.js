import React, { Component } from 'react';
import { Card, Table, Button, Modal, Form, Input, Radio, Row , Select , DatePicker , Checkbox, Col ,Spin , message } from 'antd';
import styles from './index.less';
import { connect } from 'dva';
const { confirm } = Modal;
const Option = Select.Option;
const FormItem = Form.Item;
class OrderForma extends Component {

  state = {
    isTable: true,
    confirmVisible: false,
    radioValue: 'MONTH',
    wayRadio: 'TENANT',
    brandList: [],
    categoryList: [],
    categoryId: '',
    market_job_id:'',
    page:this.props.ORDERFORMPAGES.page,
    pageCount:this.props.ORDERFORMPAGES.pageCount,
    page1:this.props.JOBPAGES.page,
    pageCount1:this.props.JOBPAGES.pageCount,
    market_job_status:'PENDING',
    market_job_type:'',
    configData:[],
    market_app_cfg_id:'',
    market_tenant_cfg_name:'初级版本',
    market_tenant_cfg_val:'PRIMARY',
    configObj:{},
    market_app_id:'',
    tenant_id:''
  }
  componentDidMount() {
    const { ORDERFORMPAGES , JOBPAGES } = this.props;
    this.fetchJobList(JOBPAGES);
    this.fetchOrderlist(ORDERFORMPAGES);
  }
  fetchJobList=async params=>{
    await this.props.dispatch({ type: 'orderform/fetchJobList', payload: params });
  }
  fetchOrderlist = async params => {
    await this.props.dispatch({ type: 'orderform/fetchOrderformList', payload: {...params , market_job_status:this.state.market_job_status} });
  };
  clickTenant=(record)=>{
    this.setState({
      tenant_id:record.tenant_id,
      wayRadio: record.market_app_pay_type,
      market_job_type:record.market_job_type,
    });
  }
  getBrandRadio = async (e) => {
    this.setState({
      categoryId: e.target.value
    });
    await this.props.dispatch({
      type: 'orderform/fetchOrderformCategory', payload: { ten_brand_id: e.target.value }
    });
  }
  getBrandCheckList = (value) => {
    if (value.target.checked) {
      this.state.brandList.push(value.target.value);
    } else {
      this.state.brandList = this.state.brandList.filter(item => !(item == value.target.value));
    }

  }
  getCategoryCheckList = (value) => {
    if (value.target.checked) {
      this.state.categoryList.push(value.target.value);
    } else {
      this.state.categoryList = this.state.categoryList.filter(item => !(item == value.target.value));
    }

  }
  handleOk = e => {
    e.preventDefault();
    const { form , CONFIGDATA } = this.props;
    form.validateFields(async(err, values) => {
      // 改变应用配置数据结构
      let market_app_cfg=[];
      let configObj={};
      CONFIGDATA.forEach(item=>{
        if(!configObj[item.market_app_cfg_id]){
          configObj[item.market_app_cfg_id]={
            market_app_id:item.market_app_id,
            market_app_cfg_id: item.market_app_cfg_id,
            market_app_cfg_index: item.market_app_cfg_index,
            market_app_cfg_type: item.market_app_cfg_type,
            market_app_cfg_name: item.market_app_cfg_name,
            market_app_cfg_tip:item.market_app_cfg_tip,
            market_app_cfg_enums:[]
          };
        }
        if(item.market_app_cfg_type==='ENUM'){
          let enumObj={
            market_app_cfg_enum_id: item.market_app_cfg_enum_id,
            market_app_cfg_enum_index: item.market_app_cfg_enum_index,
            market_app_cfg_enum_name: item.market_app_cfg_enum_name,
            market_app_cfg_enum_value: item.market_app_cfg_enum_value
          };
          configObj[item.market_app_cfg_id].market_app_cfg_enums.push(enumObj);
        }
      });
      // 将配置id放入数组中，可以查看有多少个配置
      let enumList=[];
      let numList=[];
      let strList=[];
      for (let key in values) {
        if (key.indexOf('cfgEnum') !== -1) {
          if (values[key]) {
            enumList.push({market_app_cfg_id:key.split('+')[1] , market_app_cfg_enum_id:values[key]});
          }
        }
        if (key.indexOf('cfgNumber') !== -1) {
          if (values[key]) {
            numList.push({market_app_cfg_id:key.split('+')[1],market_tenant_cfg_name:values[key],market_tenant_cfg_val:values[key]});
          }
        }
        if (key.indexOf('cfgString') !== -1) {
          if (values[key]) {
            strList.push({market_app_cfg_id:key.split('+')[1],market_tenant_cfg_name:values[key],market_tenant_cfg_val:values[key]});
          }
        }
      }
      if(enumList.length!==0){
        enumList.forEach(item=>{
          market_app_cfg.push(item);
        });
      }
      if(numList.length!==0){
        numList.forEach(item=>{
          market_app_cfg.push(item);
        });
      }
      if(strList.length!==0){
        strList.forEach(item=>{
          market_app_cfg.push(item);
        });
      }
      if (!err) {
        if(this.state.brandList.length===0 && this.state.wayRadio==='BRAND'){
          message.warning('请至少选择一个品牌');
          return;
        }else if(this.state.categoryList.length===0&&this.state.wayRadio==='CATEGORY'){
          message.warning('请至少选择一个品类');
          return;
        }
        else{
          let ten_category_objs=[];

          this.state.categoryList.forEach(item=>{
            let objs={};
            objs['ten_brand_id']=this.state.categoryId,
            objs['ten_category_id']=item;
            ten_category_objs.push(objs);
          });
          const data={
            market_order_price:values.applicationPrice,
            market_renew_count:values.applicationCycle,
            market_app_id:this.state.market_app_id,
            market_renew_type:this.state.radioValue,
            ten_brand_ids:this.state.brandList,
            ten_category_objs:ten_category_objs,
            market_job_id:this.state.market_job_id,
            market_app_cfg:market_app_cfg,
            tenant_id:this.state.tenant_id
          };

          await this.props.dispatch({
            type: 'orderform/fetchOrderfromAccept',
            data: data
          });
          this.setState({
            confirmVisible: false,
            radioValue: 'MONTH',
            wayRadio: 'TENANT',
            categoryId: '',
            brandList: [],
            categoryList: [],
          });
        }
      }
    });

  };

  handleCancel = () => {
    this.setState({
      confirmVisible: false,
      radioValue: 'MONTH',
      wayRadio: 'TENANT',
      categoryId: '',
      brandList: [],
      categoryList: [],
      configObj:{}
    });

  };


  onChange=(e)=>{
    this.setState({
      radioValue:e.target.value
    });
  }
  handleSubmitFn=e=>{

  }
  onChangeDate=(date, dateString)=> {
  };
  handleStatusChange=async(value)=>{

    const {ORDERFORMPAGES} =this.props;
    await this.props.dispatch({ type: 'orderform/fetchOrderformList', payload: {...ORDERFORMPAGES , market_job_status:value} });
    this.setState({
      market_job_status:value
    });
  }
  changeConfig=(e)=>{
    this.setState({
      market_tenant_cfg_val:e.target.value
    });
  }
  clickConfig=(name,id)=>{
    this.setState({
      market_app_cfg_id:id,
      market_tenant_cfg_name:name,
    });
  }
  render() {
    const { ORDERFORMLIST, form, BRANDSARR , CONFIGDATA ,CATEGORYARR ,loading , JOBLIST , JOBPAGES , ORDERFORMPAGES } = this.props;
    let configObj={};
    CONFIGDATA.forEach(item=>{
      if(!configObj[item.market_app_cfg_id]){
        configObj[item.market_app_cfg_id]={
          market_app_id:item.market_app_id,
          market_app_cfg_id: item.market_app_cfg_id,
          market_app_cfg_index: item.market_app_cfg_index,
          market_app_cfg_type: item.market_app_cfg_type,
          market_app_cfg_name: item.market_app_cfg_name,
          market_app_cfg_tip:item.market_app_cfg_tip,
          market_app_cfg_enums:[]
        };
      }
      if(item.market_app_cfg_type==='ENUM'){
        let enumObj={
          market_app_cfg_enum_id: item.market_app_cfg_enum_id,
          market_app_cfg_enum_index: item.market_app_cfg_enum_index,
          market_app_cfg_enum_name: item.market_app_cfg_enum_name,
          market_app_cfg_enum_value: item.market_app_cfg_enum_value
        };
        configObj[item.market_app_cfg_id].market_app_cfg_enums.push(enumObj);
      }
    });
    let keyArr=[];
    for(let key in configObj){
      keyArr.push(key);
    }
    const { getFieldDecorator } = form;
    const columns = [
      {
        title: '商户名称',
        dataIndex: 'company_name',
        key: 'company_name',
      },
      {
        title: '应用名称',
        dataIndex: 'market_app_name',
        key: 'market_app_name',
      },
      {
        title: '咨询时间',
        dataIndex: 'create_time',
        key: 'create_time ',
      },
      {
        title: '工单类型',
        dataIndex: 'market_job_type',
        key: 'market_job_type',
        render:text=>text==='OPEN'?'开通应用':'续费应用'
      },

      {
        title: '工单状态',
        dataIndex: 'market_job_status',
        key: 'market_job_status',
        render:text=>text==='PENDING'?'待处理':'已处理'
      },

      {
        title: '操作',
        key: 'action',
        render: (text, record) => (
          <div>
            {
              record.market_job_status==='PENDING'?
                record.market_app_status==='ON'?
                  <span><a onClick={() => showComfirmModal(record,configObj)}>确认开通</a> | <a onClick={() => showCancelModal(record)}>取消开通</a></span>
                  :
                  <span><a style={{color:'grey'}} onClick={() => message.error('该应用已下架，无法开通')}>确认开通</a> | <a onClick={() => showCancelModal(record)}>取消开通</a></span>
                :
                ''
            }
          </div>
        ),
      },
    ];
    const showComfirmModal = async (record,configObj) => {
      this.setState({
        market_job_id:record.market_job_id,
        market_job_type:record.market_job_type,
        market_app_id:record.market_app_id
      });
      this.clickTenant(record);

      await this.props.dispatch({
        type: 'appconfig/fetchAppconfig', payload: { market_app_id: record.market_app_id }
      });
      this.setState({
        configData:this.props.CONFIGDATA
      });
      if (record.market_app_pay_type === 'BRAND') {
        await this.props.dispatch({
          type: 'orderform/fetchOrderformBrands', payload: { tenant_id: record.tenant_id }
        });
      } else if (record.market_app_pay_type === 'CATEGORY') {
        await this.props.dispatch({
          type: 'orderform/fetchOrderformBrands', payload: { tenant_id: record.tenant_id }
        });
      }
      this.setState({
        confirmVisible: true,
      });
    };
    const showCancelModal = (record) => {
      this.clickTenant(record);
      confirm({
        title: '确认取消开通该咨询工单?',
        content: '请认真审核后点击确认',
        onOk: () => {
          this.props.dispatch({
            type: 'orderform/fetchOrderfromDisaccept', payload: { market_job_id: record.market_job_id , tenant_id:record.tenant_id , market_app_name:record.market_app_name }
          });
          Modal.destroyAll();
        },
        onCancel() {
        },
      });

    };
    const layout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 14 },
    };
    const columnsa = [
      {
        title: '订单ID',
        dataIndex: 'market_order_code',
        key: 'market_order_code ',
      },
      {
        title: '订单时间',
        dataIndex: 'create_time',
        key: 'create_time',
      },
      {
        title: '商户名称',
        dataIndex: 'company_name',
        key: 'company_name',
      },
      {
        title: '应用名称',
        dataIndex: 'market_app_name',
        key: 'market_app_name',
      },

      // {
      //   title: '时间单位',
      //   dataIndex: 'market_renew_type',
      //   key: 'market_renew_type',
      //   render:text=>text==='MONTH'?'月':'天'
      // },
      // {
      //   title: '单位数量',
      //   dataIndex: 'market_renew_count',
      //   key: 'market_renew_count',
      // },
      {
        title: '应用价格(元)',
        dataIndex: 'market_order_price',
        key: 'market_order_price',
        render:text=>parseInt(text)/100
      },
      {
        title: '付费类型',
        dataIndex: 'market_app_pay_type',
        key: 'market_app_pay_type',
        render:text=>text==='CATECORY'?'按品类付费':text==='BRAND'?'按品牌付费':'按商户付费'
      },
      {
        title: '订单状态',
        dataIndex: 'market_job_type',
        key: 'market_job_type',
        render:text=>text==='RENEW'?'续费应用':'开通应用'
      },

    ];
    const paginations={
      pageSize:this.state.pageCount,
      current:this.state.page,
      total: parseInt(ORDERFORMLIST.count,10),
      showSizeChanger: true,
      showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`,
      onShowSizeChange: (current, perpage) => onHandlePageSizeChangeFn(current, perpage),
      onChange: page => onHandlePageChangeFn(page)
    };
    const onHandlePageSizeChangeFn = (current, perpage) => {
      this.setState({
        pageCount:perpage
      });
      this.fetchOrderlist({...ORDERFORMPAGES, pageCount:perpage, page: 1});
    };
    const onHandlePageChangeFn = page => {
      this.setState({
        page:page
      });
      this.fetchOrderlist({pageCount:this.state.pageCount, page:page });
    };
    const paginations1={
      pageSize:this.state.pageCount1,
      current:this.state.page1,
      total: parseInt(JOBLIST.count,10),
      showSizeChanger: true,
      showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`,
      onShowSizeChange: (current, perpage) => onHandlePageSizeChangeFn1(current, perpage),
      onChange: page => onHandlePageChangeFn1(page)
    };
    const onHandlePageSizeChangeFn1 = (current, perpage) => {
      this.setState({
        pageCount1:perpage
      });
      this.fetchJobList({...JOBPAGES, pageCount:perpage, page: 1});
    };
    const onHandlePageChangeFn1 = page => {
      this.setState({
        page1:page
      });
      this.fetchJobList({pageCount:this.state.pageCount1, page:page });
    };

    return (
      <>
        <Card className={styles.factoryCategoryList}>
          {/* <div>
            <label>商户：</label><Input placeholder="搜索商户" style={{width:'30%'}} />  <Button style={{float:'right'}}>搜索</Button>
          </div> */}
          {/* <Divider /> */}
          <Modal
            title="确认开通"
            visible={this.state.confirmVisible}
            onCancel={this.handleCancel}
            destroyOnClose={true}
            afterClose={this.afertClose}
            width={'50%'}
            footer={[
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button style={{ width: '100px' }} type='primary' onClick={e => this.handleOk(e)}>确认</Button>
                <Button style={{ width: '100px' }} type='default' onClick={() => this.handleCancel()}>返回</Button>
              </div>
            ]}
          >
            <Form {...layout} onSubmit={() => this.handleOk()}>
              <Form.Item label="应用价格">
                {
                  getFieldDecorator(
                    'applicationPrice',
                    {
                      rules: [{ required: true, message: '必填' }, { pattern: '^[0-9]*[0-9][0-9]*$', message: '只能输入大于等于0的整数' }],
                    },
                  )(
                    <Input placeholder='请输入≥0的整数' autoComplete="off" />
                  )
                }

              </Form.Item>
              {
                CONFIGDATA.length!==0&&
                <Form.Item label={<span><span style={{color:'red'}}>*</span> <span>应用配置</span></span>}>

                  {
                    getFieldDecorator(
                      'applicationConfig',
                    )(
                      <div>
                        {

                          keyArr.map((item,index)=>{
                            return (
                              <div key={index}>
                                <label>{configObj[item].market_app_cfg_name}： </label><Radio.Group name="radiogroup" onChange={this.changeConfig} >
                                  {/* <label></label><Radio.Group name="radiogroup" onChange={this.changeConfig} > */}
                                  {

                                    configObj[item].market_app_cfg_type==='ENUM'?
                                      <Form.Item>
                                        {
                                          getFieldDecorator(
                                            'cfgEnum+'+configObj[item].market_app_cfg_id,
                                            {
                                              initialValue:configObj[item].market_app_cfg_enums[0].market_app_cfg_enum_id
                                            },
                                          )(
                                            <Select style={{width:'100px'}}>
                                              {
                                                configObj[item].market_app_cfg_enums.map(v=>{
                                                  return(
                                                    <Option value={v.market_app_cfg_enum_id} key={v.market_app_cfg_enum_id} disabled={v.market_app_cfg_enum_value==='ADEVANCED'||v.market_app_cfg_enum_value==='SUPER_VIP'} onClick={()=>this.clickConfig(v.market_app_cfg_enum_name,configObj[item].market_app_cfg_id)}>{v.market_app_cfg_enum_name}</Option>
                                                  );
                                                })
                                              }
                                            </Select>
                                          )
                                        }

                                      </Form.Item>

                                      :
                                      configObj[item].market_app_cfg_type==='NUMBER'?
                                        <Form.Item>
                                          {
                                            getFieldDecorator(
                                              'cfgNumber+'+configObj[item].market_app_cfg_id,
                                              {

                                              },
                                            )(
                                              <Input placeholder={configObj[item].market_app_cfg_tip} autoComplete="off" />
                                            )
                                          }

                                        </Form.Item>

                                        :
                                        <Form.Item>
                                          {
                                            getFieldDecorator(
                                              'cfgString+'+configObj[item].market_app_cfg_id,
                                              {

                                              },
                                            )(
                                              <Input placeholder={configObj[item].market_app_cfg_tip} autoComplete="off" />
                                            )
                                          }

                                        </Form.Item>
                                  }
                                </Radio.Group>
                              </div>
                            );
                          })
                        }
                      </div>
                    )
                  }
                </Form.Item>
              }



              <Form.Item label="使用周期">
                <Radio.Group onChange={this.onChange} value={this.state.radioValue}>
                  <Radio value='MONTH' key="MONTH">按月</Radio>
                  <Radio value='DAY' key="DAY">按天</Radio>
                </Radio.Group>
                {
                  getFieldDecorator(
                    'applicationCycle',
                    {
                      rules: [{ required: true, message: '必填' }, { pattern: '^[0-9]*[1-9][0-9]*$', message: '只能输入大于等于1的整数' }],
                    },
                  )(
                    <Input placeholder='请输入≥1的整数' suffix={this.state.radioValue == 'MONTH' ? '月' : '日'} autoComplete="off" />
                  )
                }

              </Form.Item>
              <Form.Item label={<span><span style={{color:'red'}}>*</span> <span>收费方式</span></span>}>
                <Radio.Group onChange={this.onChangeWay} value={this.state.wayRadio}>
                  <Radio value='TENANT' key="TENANT" disabled={this.state.wayRadio !== 'TENANT'}>按商户</Radio>
                  <Radio value='BRAND' key="BRAND" disabled={this.state.wayRadio !== 'BRAND'}>按品牌</Radio>
                  <Radio value='CATEGORY' key="CATEGORY" disabled={this.state.wayRadio !== 'CATEGORY'}>按品类</Radio>
                </Radio.Group>
              </Form.Item>

              <>
                  {

                    this.state.wayRadio === 'TENANT' ?
                      ''
                      :
                      this.state.wayRadio === 'BRAND' ?
                        <Form.Item label='请选择品牌'>
                          {
                            getFieldDecorator(
                              'moneyType',

                            )(
                              <div>
                                {
                                  BRANDSARR &&
                                  BRANDSARR.map(item => (
                                    <Col span={8} key={item.ten_brand_id}>
                                      <Checkbox defaultChecked={item.checked} value={item.ten_brand_id}
                                        onChange={this.getBrandCheckList}>{item.ten_brand_name}</Checkbox>
                                    </Col>
                                  ))
                                }
                              </div>
                            )
                          }
                        </Form.Item>
                        :

                        <Form.Item label='请选择品牌：'>
                          <div>
                            <Radio.Group>
                              {
                                BRANDSARR.map(item => (
                                  <Radio defaultChecked={item.checked} value={item.ten_brand_id}
                                    onChange={this.getBrandRadio}>{item.ten_brand_name}</Radio>
                                ))
                              }
                            </Radio.Group>
                          </div>
                          {
                            getFieldDecorator(
                              'moneyType',
                              {
                                rules: [{ validator: (_, value) => value ? Promise.resolve() : Promise.reject('请至少选择1个') }],
                              },
                            )(
                              <div>
                                {
                                  this.state.categoryId ?
                                    <Spin spinning={loading['orderform/fetchOrderformCategory']}>
                                      <div>品类：</div>
                                      {
                                        CATEGORYARR.length===0?
                                          <div>该品牌下暂无品类，请选择其他品牌</div>
                                          :
                                          <div>
                                            {
                                              CATEGORYARR &&
                                          CATEGORYARR.map(item => (
                                            <div>
                                              <Col span={8} key={item.ten_category_id}>
                                                {
                                                  <Checkbox defaultChecked={item.checked} value={item.ten_category_id}
                                                    onChange={this.getCategoryCheckList}    >{item.brand_category_name}</Checkbox>
                                                }
                                              </Col>
                                            </div>
                                          ))
                                            }
                                          </div>
                                      }

                                    </Spin>
                                    : ''
                                }
                              </div>
                            )
                          }

                        </Form.Item>

                  }
                </>
            </Form>
          </Modal>
          <div style={{ marginBottom: '20px' }}>
            <Button type={this.state.isTable ? 'primary' : ''} style={{ marginRight: '30px' }} onClick={() => this.setState({ isTable: true })}>咨询工单</Button>
            <Button type={this.state.isTable ? '' : 'primary'} onClick={() =>{
              this.setState({ isTable: false });
              this.fetchJobList(JOBPAGES);
            }
            }>已开通订单</Button>
          </div>
          {
            this.state.isTable?
              <div>
                <Form layout="inline" onSubmit={e => {this.handleSubmitFn(e);}} style={{marginBottom:'20px'}}>
                  <Row type="flex" justify="space-between">
                    <Col>
                      {/* <FormItem label="商户名称">
                        <Input autoComplete="off" />
                      </FormItem>
                      <FormItem label="咨询时间">
                        <DatePicker onChange={this.onChangeDate}/>
                      </FormItem> */}
                      <FormItem label="工单状态">
                        <Select style={{ width: 150 }} defaultValue={'PENDING'} allowClear onChange={this.handleStatusChange}>
                          <Option value={'PENDING'}>待处理</Option>
                          <Option value={'DONE'}>已处理</Option>
                        </Select>
                      </FormItem>
                      {/* <FormItem>
                        <Button type="primary" htmlType="submit">查询</Button>
                      </FormItem> */}
                    </Col>
                  </Row>
                </Form>
                <Table columns={columns} dataSource={ORDERFORMLIST.jobs} bordered
                  pagination={{ pageSize: 5 }}
                  aligin="center"
                  rowKey={(record, index) => index}
                  loading={loading['orderform/fetchOrderformList']}
                  pagination={paginations}
                /></div>
              :
              <Table columns={columnsa} dataSource={JOBLIST.orders} bordered
                pagination={{ pageSize:5}}
                aligin="center"
                pagination={paginations1}
                loading={loading['orderform/fetchJobList']}
                rowKey={(record, index) => index}
              />
          }
        </Card>
      </>
    );
  }
}
const mapStateToProps = state => {
  return {
    loading:state.loading.effects,
    ...state.orderform,
    ...state.appconfig
  };
};
export default connect(mapStateToProps)(Form.create()(OrderForma));
