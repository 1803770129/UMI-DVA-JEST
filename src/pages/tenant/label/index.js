import React, { Component } from 'react';
import { Card ,Table,Button , Modal , message , Row , Col , Input , Form} from 'antd';
import styles from './index.less';
import router from 'umi/router';
import {connect} from 'dva';
const confirm = Modal.confirm;
const FormItem = Form.Item;
class Label extends Component {
    state={
      page:this.props.LABELPAGES.page,
      pageCount:this.props.LABELPAGES.pageCount
    }
    componentDidMount() {
      const {LABELPAGES}=this.props;
      this.fetchLabelList(LABELPAGES);
    }
  fetchLabelList=params=>{
    this.props.dispatch({
      type:'label/fetchLabelList',
      payload:params
    });
  }
  delLabel=(id)=>{
    confirm({
      title: '确认删除该标签？',
      onOk:() => {
        this.props.dispatch({
          type:'label/fetchLabelDel',
          data:{ten_label_id:id}
        });
      },
      onCancel:() =>{}
    });
  }
  handleSubmit=e=>{
    e.preventDefault();
    const { form ,LABELPAGES } = this.props;
    form.validateFields((err,values)=>{
      if(!err){
        this.props.dispatch({
          type:'label/fetchLabelList',
          payload:{
            ten_label_name:values.labelName,
            page:1,
            pageCount:LABELPAGES.pageCount
          }
        });
      }
    });
  }
  render() {
    const {LABELLIST , loading , LABELPAGES , form}=this.props;
    const { getFieldDecorator } = form;
    const columns=[
      {
        title: '标签名称',
        dataIndex: 'ten_label_name',
        key: 'ten_label_name ',
      },
      {
        title: '描述',
        dataIndex: 'ten_label_memo',
        key: 'ten_label_memo',
      },
      {
        title: '商户数量',
        dataIndex: 'countTens',
        key: 'countTens',
        render:(text,record)=>(
          <a onClick={()=>router.push({pathname:'labels',query:{ten_label_id:record.ten_label_id,ten_label_name:record.ten_label_name,from:'label'}})}>{text}</a>
        )
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => (
          <>
          {
            record.countTens===0?
              <div>
                <a onClick={()=>toGroupEdit(record)}>编辑</a> | <a onClick={()=>this.delLabel(record.ten_label_id)}>删除</a>
              </div>
              :
              <div>
                <a onClick={()=>toGroupEdit(record)}>编辑</a> | <a onClick={()=>message.warning('商户数量为 0 时才可以删除标签')} style={{color:'grey'}}>删除</a>
              </div>
          }
          </>
        ),
      },
    ];

    const toGroupEdit=(record)=>{
      router.push({
        pathname : `label/${record.ten_label_id}`,
        query : { ten_label_name:`${record.ten_label_name}`,ten_label_memo:`${record.ten_label_memo}`}
      });
    };
    const paginations={
      pageSize:this.state.pageCount,
      current:this.state.page,
      total: parseInt(LABELLIST.count,10),
      showSizeChanger: true,
      showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`,
      onShowSizeChange: (current, perpage) => onHandlePageSizeChangeFn(current, perpage),
      onChange: page => onHandlePageChangeFn(page)
    };
    const onHandlePageSizeChangeFn = (current, perpage) => {
      this.setState({
        pageCount:perpage
      });
      this.fetchLabelList({...LABELPAGES, pageCount:perpage, page: 1});
    };
    const onHandlePageChangeFn = page => {
      this.setState({
        page:page
      });
      this.fetchLabelList({pageCount:this.state.pageCount, page:page });
    };
    return (
      <>
        <Card className={styles.factoryCategoryList} style={{padding:'20px'}}>
          <Form layout="inline" onSubmit={this.handleSubmit} style={{marginBottom:'10px'}}>
            <Row type="flex" justify="space-between">
              <Col>
                <FormItem label="标签名">
                  {
                    getFieldDecorator('labelName')(
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
          <Row>
            <Col span={22}>
              <div></div>
            </Col>
            <Col span={2}><Button style={{marginBottom:'20px'}} type="primary" onClick={()=>router.push('label/-1')}>创建标签</Button></Col>
          </Row>
          <Table columns={columns} dataSource={LABELLIST.labels} bordered
            aligin="center"
            rowKey={(record,index)=>index}
            loading={loading['label/fetchLabelList']}
            pagination={paginations}
          />
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
const LabelForm = Form.create()(Label);
export default connect(mapStateToProps)(LabelForm);
