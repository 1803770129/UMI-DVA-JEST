import React ,{useState,useEffect} from 'react';
import { Card ,Table ,Row,Col , Modal , DatePicker ,Form , Select , Button} from 'antd';
import styles from './index.less';
import ReactJson from 'react-json-view';
import {connect} from 'dva';
// import router from 'umi/router';
// import moment from 'moment';
const Option = Select.Option;
const FormItem = Form.Item;
const Record=(props) => {
  const {dispatch, MANAGER_USERRECORLIST,PAGES,loadings , ALLUSERLIST } = props;
  useEffect(() => {
    fetchUserRecorListFn(PAGES);
    fetchUserRecorListAlluser();

  }, []);
  // console.log(props)
  const fetchUserRecorListFn = params => {
    dispatch({ type: 'managerRecord/fetchUserRecorList', payload: params });
  };
  const fetchUserRecorListAlluser=()=>{
    dispatch({type:'managerRecord/fetchUserRecorListAlluser'});
  };

  const columns = [
    // {
    //   title: '提交参数',
    //   dataIndex: 'record_obj',
    //   key: 'record_obj',
    //   render: (text) => {
    //     let texta=JSON.parse(text);
    //     return <ReactJson src={texta} displayDataTypes={false} displayObjectSize={false} style={{ fontSize: 12, maxHeight: 490, overflowY: 'auto' }} />;
    //   }
    // },
    {
      title: '操作页面',
      dataIndex: 'record_page',
      key: 'record_page',
    },
    {
      title: '操作动作',
      dataIndex: 'record_operations',
      key: 'record_operations',
    },
    {
      title: '操作人登录账号',
      dataIndex: 'user_login_id',
      key: 'user_login_id',
    },
    {
      title: '操作时间',
      dataIndex: 'create_time',
      key: 'create_time',

    },
    {
      title: '操作人',
      dataIndex: 'user_name',
      key: 'user_name',

    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <a onClick={()=>showModal(record)}>查看参数</a>

      ),
    },

  ];

  // <ReactJson src={carmodelOriginInfo} displayDataTypes={false} displayObjectSize={false} style={{ fontSize: 12, maxHeight: 490, overflowY: 'auto' }} />
  const [page , setPage] = useState(PAGES.page);
  const [perpage , setPerpage] = useState(PAGES.perpage);
  const [visible , setVisible] = useState(false);
  const [record , setRecord] = useState();
  const [start_date , setStart_date] = useState('');
  const [end_date , setEnd_date] = useState('');
  const [user , setUser] = useState('');
  const showModal=(record)=>{
    setVisible(true);
    setRecord(record);
  };
  const handleOk = ()=> {
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };
  const paginations={
    pageSize:perpage,
    current:page,
    total: parseInt(MANAGER_USERRECORLIST.count,10),
    showSizeChanger: true,
    showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`,
    onShowSizeChange: (current, perpage) => onHandlePageSizeChangeFn(current, perpage),
    onChange: page => onHandlePageChangeFn(page)
  };
  const onHandlePageSizeChangeFn = (current, perpage) => {
    setPerpage(perpage);
    fetchUserRecorListFn({...PAGES, perpage, page: 1 , start_time:start_date,end_time:end_date,user_id:user});
  };
  const onHandlePageChangeFn = page => {
    setPage(page);
    fetchUserRecorListFn({perpage:perpage, page:page , start_time:start_date,end_time:end_date,user_id:user});
  };
  const onChange1=(date, dateString)=> {
    dateString?
      setStart_date(dateString+' 00:00:00')
      :
      setStart_date(dateString);
  };
  const onChange2=(date, dateString)=> {
    dateString?
      setEnd_date(dateString+' 23:59:59')
      :
      setEnd_date(dateString);
  };
  const handleChange=(value)=>{
    setUser(value);
  };
  const handleSubmitFn = e => {
    setPerpage(PAGES.perpage);
    let params={
      start_time:start_date,
      end_time:end_date,
      user_id:user
    };
    e.preventDefault();
    dispatch({
      type: 'managerRecord/fetchUserRecorList',
      payload:{...PAGES,page:1,...params}
    });
    setPage(1);
  };

  // const onSubmitFn = values => {
  //   this.fetchCarmodelBrandsFn({...this.props.searchFields, ...values, page: 1});
  // }
  // fetchCarmodelBrandsFn = params => this.props.dispatch({ type: 'managerRecord/fetchUserRecorList', payload: params });
  return (
    <>
        <Modal
          title="提交参数"
          visible={visible}
          onOk={ handleOk }
          onCancel={handleCancel}
        >{
            record&&<div>
              <ReactJson src={JSON.parse(record.record_obj)} displayDataTypes={false} displayObjectSize={false} style={{ fontSize: 12, maxHeight: 490, overflowY: 'auto' }} />
            </div>
          }


        </Modal>

        <Card className={styles.factoryCategoryList}>
          <Row type="flex" justify="space-between">
            <Col className="f16">操作日志列表</Col>
          </Row>

          <Form layout="inline" onSubmit={e => {handleSubmitFn(e);}}>
            <Row type="flex" justify="space-between">
              <Col>
                <FormItem label="开始时间">
                  <DatePicker onChange={onChange1}/>
                </FormItem>
                <FormItem label="结束时间">
                  <DatePicker onChange={onChange2}/>
                </FormItem>
                <FormItem label="查询人">
                  <Select style={{ width: 150 }}  onChange={handleChange} allowClear>
                    {
                      ALLUSERLIST.map(item => <Option key={item.user_id} value={item.user_id}>{item.user_name}</Option>)
                    }
                  </Select>
                </FormItem>
                <FormItem>
                  <Button type="primary" htmlType="submit">查询</Button>
                </FormItem>
              </Col>
            </Row>
          </Form>
          <Table style={{marginTop:'10px'}} columns={columns} dataSource={MANAGER_USERRECORLIST.recorList} bordered
            pagination={paginations}
            rowKey={(record,index)=>index}
            aligin="center"
            loading={loadings['userRecorList/fetchUserRecorList']}
          />
        </Card>

    </>
  );
};
const mapStateToProps = (state) =>{
  // console.log(state);
  return {
    loadings:state.loading.effects,
    ...state.managerRecord

  };

};
export default connect(mapStateToProps)(Record);
