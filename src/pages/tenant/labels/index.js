import React, { Component } from 'react'
import { Card ,Table ,Row,Col , Modal  , Input , Form , Select , Button , message , Checkbox, Tag , Tooltip , Icon} from 'antd';
import styles from './index.less';
import {connect} from 'dva';
const FormItem = Form.Item;
class Tenlabel extends Component {
     state={
        page:this.props.TenLabelPages.page,
        pageCount:this.props.TenLabelPages.pageCount,
        labelpage:this.props.LABELPAGES.page,
        batchpage:this.props.LABELPAGES.page,
        labelpageCount:5,
        selectedRowKeys:[],
        selectedRows:[],
        selectedRowKeys1:[],
        selectedRows1:[],
        selectedRowKeysList:[],
        selectedRowsList:[],
        visible:false,
        title:'',
        visible1:false,
        tenant_id:''
      }
      componentDidMount() {
          const {location , TenLabelPages}=this.props
          this.props.dispatch({
            type:'tenlabel/saveFields',
          })
          if(location.query.from==='label'){
            this.props.dispatch({
              type:'tenlabel/fetchTensLabelList',
              payload:{...TenLabelPages , ten_label_name:location.query.ten_label_name}
            })
            this.props.dispatch({
              type:'tenlabel/saveFields',
              payload:{ten_label_name:location.query.ten_label_name}
            })
          }else{
              this.fetchTensLabelList(TenLabelPages)
          }
          setTimeout(()=>{
            window.history.replaceState({}, 0, `${window.location.origin}/#/tenant/labels`);
          })
      }
      fetchTensLabelList= async params=>{
       await this.props.dispatch({
          type:'tenlabel/fetchTensLabelList',
          payload:params
        })
      }
      handleSubmitFn=(e)=>{
        e.preventDefault()
        const { form , TenLabelPages } = this.props
        form.validateFields((err,values)=>{
          if(!err){
            this.props.dispatch({
              type:'tenlabel/fetchTensLabelList',
              payload:{...TenLabelPages,ten_label_name:values.labelName,company_name:values.tenName,ten_brand_name:values.brandName}
            })
            this.props.dispatch({
              type:'tenlabel/saveFields',
              payload:{ten_label_name:values.labelName,company_name:values.tenName,ten_brand_name:values.brandName}
            })
          }
        })
      }
      setTenlabel=async(record)=>{
          await this.props.dispatch({
            type:'label/fetchLabelList',
            payload:{tenant_id:record.tenant_id,type:'all'}
          });
          const labels=this.props.LABELLIST.labels.filter(item=>item.checked===true).map(v=>v.ten_label_id);
            this.setState({
            selectedRowKeys:labels,
            visible:true,
            title:record.company_name,
            tenant_id:record.tenant_id
        })
      }
      fetchLabelList=(par)=>{
        this.props.dispatch({
          type:'label/fetchLabelList',
          payload:par
        });
      }
      showModal=()=>{
        this.fetchLabelList({type:'all'})
        this.setState({
            visible1:true,
        })
      }
      handleOk =async e => {
        let ten_label_ids=this.state.selectedRowKeys;
        const data={
          ten_label_ids:ten_label_ids,
          tenant_id:this.state.tenant_id
        };
        await this.props.dispatch({
          type:'tenlabel/fetchTenLabelInsert',
          data:data
        });
        this.props.dispatch({
          type:'label/savePages'
        })
        this.setState({
          visible: false,
          labelpage:1
        });
      };

      handleCancel = e => {
        this.props.dispatch({
          type:'label/savePages'
        })
        this.setState({
          visible: false,
          labelpage:1
        });
      };
      handleOk1 = async e => {
        console.log(this.state.selectedRowKeys1)
        console.log(this.state.selectedRowKeysList)
        await this.props.dispatch({
          type:'tenlabel/fetchTenLabelBatchInsert',
          data:{
            ten_label_ids:this.state.selectedRowKeys1,
            tenant_ids:this.state.selectedRowKeysList
          }
        })
        this.props.dispatch({
          type:'label/savePages',
        })
        this.setState({
          visible1: false,
          selectedRowKeysList:[],
          selectedRowKeys1:[],
          batchpage:1
        });
      };

      handleCancel1 = e => {
        this.props.dispatch({
          type:'label/savePages'
        })
        this.setState({
          visible1: false,
          selectedRowKeysList:[],
          selectedRowKeys1:[],
          batchpage:1
        });
      };
      handleSubmitTen=e=>{
        e.preventDefault()
        const { form ,LABELPAGES } = this.props
        form.validateFields((err,values)=>{
          if(!err){
            this.props.dispatch({
              type:"label/fetchLabelList",
              payload:{
                ten_label_name:values.tenlabelName,
                type:'all'
              }
            })
          }
        })
      }
      handleSubmitBatch=e=>{
        e.preventDefault()
        const { form ,LABELPAGES } = this.props
        form.validateFields((err,values)=>{
          if(!err){
            this.props.dispatch({
              type:"label/fetchLabelList",
              payload:{
                ten_label_name:values.batchlabelName,
                type:'all'
              }
            })
          }
        })
      }

    render() {
        const {LABELLIST , location , form , loading , TENLABELLIST , TenLabelPages , FIELDS}=this.props
        const { getFieldDecorator } = form;
        const Tagcolor=['#0050b3']
        const columns = [
            {
              title: '商户名称',
              dataIndex: 'company_name',
              key: 'company_name',
              width:200
            },
            {
              title: '开通品牌',
              dataIndex: 'ten_brand_names',
              key: 'ten_brand_names',
              render:(text)=>{
                if(text!==''){
                  let arr=text.split(',')
                if(arr.length===1){
                  return arr[0]
                }
                if(arr.length===2 || arr.length===3){
                  return arr.join('、')
                }
                if(arr.length>3){
                  return arr[0]+'、'+arr[1]+'、'+arr[2]+'、· · · '
                }
                }
              }
            },
            {
              title: '商户标签',
              dataIndex: 'ten_label_names',
              key: 'ten_label_names',
              render:(text,record)=>{
                return(
                  <>
                  {
                    text===''?
                    ''
                    :
                    text!==null&&text.indexOf(',')?
                    text.split(',').map((item,index)=>{
                      return(
                            <Tag color={Tagcolor[0]} style={{marginBottom:'8px'}} key={index}>{item}</Tag>
                    )
                    })
                    :
                    <Tag color={Tagcolor[0]} style={{marginBottom:'8px'}}>{text}</Tag>
                  }
                  </>
                )
              }
            },
            {
              title: '操作',
              key: 'action',
              width:80,
              render: (text, record) => (
                <a onClick={()=>this.setTenlabel(record)}>设置</a>
              ),
            },

          ];
          const labelColumns=[
            {
              title: '标签名称',
              dataIndex: 'ten_label_name',
              key: 'ten_label_name ',
              width:150
            },
            {
              title: '描述',
              dataIndex: 'ten_label_memo',
              key: 'ten_label_memo',
            },
          ];
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
          const rowSelection1 = {
            selectedRowKeys:this.state.selectedRowKeys1,
            onChange:(selectedRowKeys, selectedRows)=>{
              this.setState({
                selectedRowKeys1:selectedRowKeys,
                selectedRows1:selectedRows,
                status:'1'
              });

            },
          };
          const rowSelectionList = {
            selectedRowKeys:this.state.selectedRowKeysList,
            onChange:(selectedRowKeys, selectedRows)=>{
              this.setState({
                selectedRowKeysList:selectedRowKeys,
                selectedRowsList:selectedRows,
                status:'1'
              });

            },
          };
          const paginations={
            pageSize:this.state.pageCount,
            current:this.state.page,
            total: parseInt(TENLABELLIST.count,10),
            showSizeChanger: true,
            showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`,
            onShowSizeChange: (current, perpage) => onHandlePageSizeChangeFn(current, perpage),
            onChange: page => onHandlePageChangeFn(page)
          };
          const onHandlePageSizeChangeFn = (current, perpage) => {
            this.setState({
              pageCount:perpage
            });
            this.fetchTensLabelList({...TenLabelPages, pageCount:perpage, page: 1,...FIELDS});
          };
          const onHandlePageChangeFn = page => {
            this.setState({
              page:page
            });
            this.fetchTensLabelList({pageCount:this.state.pageCount, page:page ,...FIELDS});
          };
        return (
            <>
              <Card className={styles.factoryCategoryList} style={{padding:'20px'}}>
                <Form layout="inline" onSubmit={this.handleSubmitFn}>
                    <Row type="flex" justify="space-between">
                        <Col>
                            <FormItem label="商户名">
                            {
                                getFieldDecorator(
                                    'tenName',{
                                      }
                                )(
                                    <Input placeholder='请输入商户名' autoComplete="off" allowClear />
                                )
                            }
                            </FormItem>
                            <FormItem label="标签名">
                            {
                                getFieldDecorator(
                                    'labelName',{
                                        initialValue: location.query.from==='label'?location.query.ten_label_name:''
                                      }
                                )(
                                    <Input placeholder='请输入标签名' autoComplete="off" allowClear />
                                )
                            }
                            </FormItem>
                            <FormItem label="品牌名">
                            {
                                getFieldDecorator(
                                    'brandName'
                                )(
                                    <Input placeholder='请输入品牌名' autoComplete="off" allowClear />
                                )
                            }
                            </FormItem>
                            <FormItem>
                                <Button type="primary" htmlType="submit">查询</Button>
                            </FormItem>
                        </Col>
                    </Row>
                </Form>
                <Row>
                    <Col span={22}><div></div></Col>
                    <Col span={2}>
                      <Button type="primary" style={{marginTop:'20px'}} onClick={()=>this.showModal()} disabled={this.state.selectedRowKeysList.length===0?true:false}>批量添加</Button>
                      <Tooltip overlayStyle={{ maxWidth: 'auto' }} title="该功能仅可以进行标签的批量添加操作，如需修改或取消标签请单独设置"><Icon type="question-circle" theme="filled" className="f18 m-l-5 c9 help" /></Tooltip>
                    </Col>

                </Row>
                <Table style={{marginTop:'10px'}} columns={columns} dataSource={TENLABELLIST.labels} bordered
                    rowKey={(record,index)=>record.tenant_id} loading={loading['tenlabel/fetchTensLabelList']} rowSelection={rowSelectionList}
                    pagination={paginations}
                />
                 <Modal
                    title={this.state.title}
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    width={'40%'}
                    destroyOnClose={true}
                 >
                   <Form layout="inline" onSubmit={this.handleSubmitTen} style={{marginBottom:'10px'}}>
                      <Row type="flex" justify="space-between">
                          <Col>
                              <FormItem label="标签名">
                              {
                                  getFieldDecorator('tenlabelName')(
                                      <Input placeholder='请输入标签名' autoComplete="off" allowClear />
                                  )
                              }
                              </FormItem>
                              <FormItem>
                                  <Button type="primary" htmlType="submit">查询</Button>
                              </FormItem>
                          </Col>
                      </Row>
                    </Form>
                     <div>请选择标签：</div>
                     <Table style={{marginTop:'10px'}} columns={labelColumns} dataSource={LABELLIST.labels} bordered
                    rowKey={(record,index)=>record.ten_label_id} rowSelection={rowSelection} loading={loading['label/fetchLabelList']}
                    pagination={false} scroll={{y:300}}
                />
                 </Modal>
                 <Modal
                    title="批量添加商户标签"
                    visible={this.state.visible1}
                    // onOk={this.handleOk1}
                    onCancel={this.handleCancel1}
                    footer={<div><Button type='default' onClick={this.handleCancel1}>取消</Button><Button onClick={this.handleOk1} disabled={this.state.selectedRowKeys1.length===0?true:false} type='primary'>确定</Button></div>}
                    width={'40%'}
                    destroyOnClose={true}
                 >
                   <Form layout="inline" onSubmit={this.handleSubmitBatch} style={{marginBottom:'10px'}}>
                      <Row type="flex" justify="space-between">
                          <Col>
                              <FormItem label="标签名">
                              {
                                  getFieldDecorator('batchlabelName')(
                                      <Input placeholder='请输入标签名' autoComplete="off" allowClear />
                                  )
                              }
                              </FormItem>
                              <FormItem>
                                  <Button type="primary" htmlType="submit">查询</Button>
                              </FormItem>
                          </Col>
                      </Row>
                    </Form>
                     <div>请选择标签：</div>
                     <Table style={{marginTop:'10px'}} columns={labelColumns} dataSource={LABELLIST.labels} bordered
                    rowKey={(record,index)=>record.ten_label_id} rowSelection={rowSelection1} loading={loading['label/fetchLabelList']}
                    pagination={false} scroll={{y:300}}
                />
                 </Modal>
              </Card>
            </>
        )
    }
}
const mapStateToProps = (state) =>{
    return {
      loading:state.loading.effects,
      ...state.label,
      ...state.tenlabel
    };

  };
  const TenlabelForm = Form.create()(Tenlabel);
  export default connect(mapStateToProps)(TenlabelForm);
