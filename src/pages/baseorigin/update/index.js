import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Form, Select, DatePicker, Button, message, Divider, Input, Icon, Modal, Table } from 'antd';
import { sleep } from '@/utils/tools';
import Link from 'umi/link';
import moment from 'moment';
const FormItem = Form.Item;
const Option = Select.Option;
const InputGroup = Input.Group;
// 数据源下拉框数据
const record_origins = [
  { key: '力洋', val: 'liyang' },
  { key: '力洋(商用车)', val: 'liyang_commercial' },
  { key: '精友', val: 'easyepc' }
];
const cm_origins = [
  { key: '力洋', val: 'liyang' },
  { key: '力洋(商用车)', val: 'liyang_commercial' },
];
const origins = [
  { key: '力洋', val: 'liyang' },
  { key: '精友', val: 'easyepc' }
];

// 更新模式下拉框数据
const record_synctype = [
  { key: '增量', val: 'increment' },
  { key: '全量', val: 'total' }
];

class BatchUpdate extends Component {
  state = {
    fields: {
      record_origin: 'liyang',                                    // 数据源
      record_synctype: 'increment',                               // 更新模式
      record_version: moment(new Date()).format('YYYY-MM-DD')     // 版本日期
    },
    origin: 'liyang',                                 // 数据源
    origin1: 'liyang',                                 // 数据源
    btnDisabled: true,
    btnDisabled1: true,
    cm_pro_column: 'cm_brand',
    btnName: '启动更新',
    btnName1: '启动自动审核',
    inputValue: '',
    conditions: {},
    cm_pro_column1: 'cm_brand',
    visible: false,
    visible1: false,
    cm_pro_new_value: '',
    cm_pro_old_value: '',
    cm_origin_val:'liyang'
  };

  componentDidMount() {
    this.loopGetBatchStatus('', 0, new Date().getTime());
    this.loopGetBatchStatusApprove('', 0, new Date().getTime());
    this.fetchCarmodelProList({ type: 'baseorigin' });
  }
  fetchCarmodelProList = async payload => {
    const { dispatch } = this.props;
    dispatch({ type: 'baseorigin/fetchCarmodelProList', payload });
  };
  // 轮询获取批量状态
  /**
   * job_record_id
   * sleepTime        轮询时间
   * startTime        开始调用的时间
   */
  changeCmOrigin=e=>{
    this.setState({
      cm_origin_val:e
    });
  }
  loopGetBatchStatus = async (job_record_id, sleepTime, startTime) => {
    await sleep(sleepTime);
    await this.props.dispatch({
      type: 'batchtask/fetchCarmodelBatchStatus',
      payload: {
        job_record_id: job_record_id,
        cb: res => {
          if (res.data.length !== 0) {
            let result = res.data[0];
            if (!job_record_id && result.job_record_status == 'RUN' && new Date(result.system_time).getTime() - new Date().getTime() < 1800000) {
              // 初始化 并且 是RUN状态 并且 不超过30分钟
              let newFields = {
                record_origin: result.job_record_origin,
                record_synctype: result.job_record_synctype,
                record_version: result.job_record_version
              };
              this.setState({ fields: newFields });
            }
            if (result.job_record_status == 'SUCCESS' || result.job_record_status == 'FAIL') {
              this.setState({ btnDisabled: false, btnName: '启动更新' });
            } else if (result.job_record_status == 'RUN') {
              if (new Date(result.system_time).getTime() - new Date(result.job_record_start).getTime() < 1800000) {
                this.loopGetBatchStatus(result.job_record_id, 60000, startTime); // 1分钟轮询一次
                this.setState({ btnDisabled: true, btnName: '更新中...' });
              } else {
                this.setState({ btnDisabled: false, btnName: '启动更新' });
                message.error('任务失败，通知技术人员分析原因');
              }
            }
          } else {
            this.setState({ btnDisabled: false, btnName: '启动更新' });
          }
        }
      }
    });

  };
  loopGetBatchStatusApprove = async (job_record_id, sleepTime, startTime) => {
    await sleep(sleepTime);
    await this.props.dispatch({
      type: 'batchtask/fetchCarmodelBatchApproveStatus',
      payload: {
        job_record_id: job_record_id,
        cb: res => {
          if (res.data.length !== 0) {
            let result = res.data[0];
            if (!job_record_id && result.job_record_status == 'RUN' && new Date(result.system_time).getTime() - new Date().getTime() < 1800000) {
            }
            if (result.job_record_status == 'SUCCESS' || result.job_record_status == 'FAIL') {
              this.setState({ btnDisabled: false, btnName1: '启动自动审核' });
            } else if (result.job_record_status == 'RUN') {
              if (new Date(result.system_time).getTime() - new Date(result.job_record_start).getTime() < 10800000) {
                this.loopGetBatchStatusApprove(result.job_record_id, 30000, startTime); // 1分钟轮询一次
                this.setState({ btnDisabled: true, btnName1: '审核中...' });
              } else {
                this.setState({ btnDisabled: false, btnName1: '启动自动审核' });
                message.error('批量审核失败，通知技术人员分析原因');
              }
            }
          } else {
            this.setState({ btnDisabled: false, btnName1: '启动自动审核' });
          }
        }
      },
      callback:(res)=>{
        if(!job_record_id){
        }else{
          if(res.data[0].job_record_status==='FAIL'){
            message.error('本次批量任务执行失败');
          }
        }
      }
    });
  };
  loopGetBatchStatusApproveCheck = async (job_record_id, sleepTime, startTime) => {
    await sleep(sleepTime);
    await this.props.dispatch({
      type: 'batchtask/fetchCarmodelBatchApproveStatus',
      payload: {
        job_record_id: job_record_id,
        cb: res => {
          if (res.data.length !== 0) {
            let result = res.data[0];
            if (!job_record_id && result.job_record_status == 'RUN' && new Date(result.system_time).getTime() - new Date().getTime() < 1800000) {
            }
            if (result.job_record_status == 'SUCCESS' || result.job_record_status == 'FAIL') {
              this.setState({ btnDisabled: false });
            } else if (result.job_record_status == 'RUN') {
              if (new Date(result.system_time).getTime() - new Date(result.job_record_start).getTime() < 1800000) {
                this.loopGetBatchStatusApproveCheck(result.job_record_id, 30000, startTime); // 1分钟轮询一次
                this.setState({ btnDisabled: true});
              } else {
                this.setState({ btnDisabled: false });
                message.error('批量审核失败，通知技术人员分析原因');
              }
            }
          } else {
            this.setState({ btnDisabled: false });
          }
        }
      },
      callback:(res)=>{
        if(!job_record_id){
        }else{
          if(res.data[0].job_record_status==='FAIL'){
            message.error('本次批量任务执行失败');
          }
        }
      }
    });
  };

  // 点击启动更新按钮
  handleSubmit = () => {
    const { dispatch, form } = this.props;
    this.setState({ btnDisabled: true });
    form.validateFields(async(err, values) => {
      if (!err) {
        let obj = {
          cm_origin: values.record_origin,
          synctype: values.record_synctype,
          version: values.record_version.format('YYYY-MM-DD'),
          cb: res => this.loopGetBatchStatus(res.data.data.job_record_id, 0, new Date().getTime())
        };
        await dispatch({ type: 'batchtask/fetchCarmodelBatch', payload: obj });
      }
    });
  };
  handleCmApprove = () => {
    const { dispatch, form } = this.props;
    this.setState({ btnDisabled: true });
    form.validateFields(async(err, values) => {
      if (!err) {
        if(values.review_status=='all'){
          let obj = {
            cm_origin: this.state.cm_origin_val,
            // synctype: values.record_synctype,
            version: values.version.format('YYYY-MM-DD'),
            endDate:values.endDate===''?'':values.endDate.format('YYYY-MM-DD'),
            cb: res => this.loopGetBatchStatusApprove(res.data.data.job_record_id, 0, new Date().getTime())
          };
          await dispatch({ type: 'batchtask/fetchCarmodelBatchApprove', payload: obj });
        }else{
          let objs = {
            cm_origin: this.state.cm_origin_val,
            // synctype: values.record_synctype,
            version: values.version.format('YYYY-MM-DD'),
            endDate:values.endDate===''?'':values.endDate.format('YYYY-MM-DD'),
            review_status:values.review_status,
            cb: res => this.loopGetBatchStatusApprove(res.data.data.job_record_id, 0, new Date().getTime())
          };
          console.log(objs);
          await dispatch({ type: 'batchtask/fetchCarmodelBatchApprove', payload: objs });
        }

      }
    });
  };

  // 启动自动审核
  // handleApprove = () => {
  //   const { dispatch, form } = this.props;
  //   const { getFieldValue } = form;
  //   const approve_version = getFieldValue('approve_version');
  //   if (!approve_version) return;
  //   dispatch({
  //     type: 'batchtask/fetchCarmodelFromatApprove',
  //     payload: { version: approve_version.format('YYYY-MM-DD') }
  //   });
  // }
  changeOrigin = val => {
    this.setState({
      origin: val
    });
  }
  addCarmodelProList = () => {
    const { carmodelProList, carmodelProListValueCheck, } = this.props;
    let arr = [...carmodelProListValueCheck];
    arr.push({
      ['carmodelProOption-' + carmodelProListValueCheck.length]: carmodelProList[0].cm_pro_column,
      ['carmodelProInput-' + carmodelProListValueCheck.length]: ''
    });
    this.props.dispatch({
      type: 'baseorigin/updateCheckModel',
      payload: arr
    });
  };
  removeCarmodelProList = index => {
    const { carmodelProListValueCheck } = this.props;
    let arr = [...carmodelProListValueCheck];
    arr.splice(index, 1);
    this.props.dispatch({
      type: 'baseorigin/updateCheckModel',
      payload: arr
    });
  }
  checkSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields(async (err, values) => {
      const { carmodelProListValueCheck } = this.props;
      let newList = [...carmodelProListValueCheck];
      for (let i = 0; i < newList.length; i++) {
        for (let n in newList[i]) {
          for (let v in values) {
            if (n == v) {
              newList[i][n] = values[v];
            }
          }
        }
      }
      let list = [...newList];
      let conditions = {};
      let proList = list;
      for (let i = 0; i < proList.length; i++) {
        let vals = Object.values(proList[i]);
        let k = vals[0];
        let v = vals[1];
        conditions[k] = v;
      }
      this.setState({
        conditions: conditions,
        cm_pro_old_value: values.cm_pro_old_value,
        cm_pro_new_value: values.cm_pro_new_value
      });
      const data = {
        // cm_origin:this.state.origin,
        cm_pro_column: this.state.cm_pro_column,
        cm_pro_old_value: values.cm_pro_old_value,
        cm_pro_new_value: values.cm_pro_new_value,
        conditions: conditions
      };
      if(!err){
        if(conditions.cm_factory===''){
          message.error('修改品牌，主机厂必填');
        }else if(!values.cm_pro_new_value){
          message.error('修改后属性值不能为空');
        }else if(!values.cm_pro_old_value){
          message.error('修改前属性值不能为空');
        }

        else{
          await this.props.dispatch({
            type: 'updatecm/fetchBatch',
            data: data
          });
          this.setState({
            visible: true
          });
        }

      }

    });
  };
  handleOk = async () => {
    const { conditions, cm_origin, cm_pro_column, cm_pro_old_value, cm_pro_new_value } = this.state;
    const data1 = {
      conditions: conditions,
      cm_origin: cm_origin,
      cm_pro_column: cm_pro_column,
      cm_pro_old_value: cm_pro_old_value,
      cm_pro_new_value: cm_pro_new_value,
      cb: res => this.loopGetBatchStatusApproveCheck(res.data.job_record_id, 0, new Date().getTime())
    };
    await this.props.dispatch({
      type: 'updatecm/fetchBatchInsert',
      data: data1
    });
    this.setState({
      visible: false,
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false,
    });
  };

  // checkSubmitOrigin = e => {
  //   e.preventDefault();
  //   const { form } = this.props;
  //   this.setState({
  //     visible1: true
  //   });
  //   form.validateFields(async (err, values) => {
  //     this.setState({
  //       origin1:values.cm_origin1,
  //       cm_pro_column1:values.cm_pro_column1
  //     });
  //     await this.props.dispatch({
  //       type: 'updatecm/fetchBatchOrigin',
  //       payload: {cm_origin:values.cm_origin1,cm_pro_column:values.cm_pro_column1}
  //     });
  //   });
  // }
  // handleOk1 = async () => {
  //   await this.props.dispatch({
  //     type: 'updatecm/fetchBatchOriginInsert',
  //     data: {cm_origin:this.state.origin1,cm_pro_column:this.state.cm_pro_column1}
  //   });
  //   this.setState({
  //     visible1: false,
  //   });
  // };

  // handleCancel1 = e => {
  //   this.setState({
  //     visible1: false,
  //   });
  // };
  render() {
    const { loading, form, carmodelProList, carmodelProListValueCheck, BATCH } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    const { fields, btnDisabled , btnName, btnName1 , origin, origin1, cm_pro_column, cm_pro_column1 } = this.state;
    const tableTitle = [
      { title: '品牌', dataIndex: 'cm_brand' ,width: 140 },
      { title: '主机厂', dataIndex: 'cm_factory' ,width: 140 },
      { title: '车型', dataIndex: 'cm_model',width: 140 },
      { title: '配置等级', dataIndex: 'cm_conf_level',width: 140 },
      { title: '车系', dataIndex: 'cm_car' ,width: 140},
      { title: '排量', dataIndex: 'cm_displacement' ,width: 140},
      { title: '年款', dataIndex: 'cm_model_year', width: 60 },
      { title: '底盘号', dataIndex: 'cm_chassis_model',width: 140 },
      { title: '发动机型号', dataIndex: 'cm_engine_model' ,width: 140},
      { title: '发动机启停', dataIndex: 'cm_engine_start_stop' ,width: 140},
      { title: '燃油类型', dataIndex: 'cm_fuel_type' ,width: 140},
      { title: '变速箱类型', dataIndex: 'cm_gearbox' ,width: 140},
      { title: '驱动方式', dataIndex: 'cm_driving_mode' ,width: 140},
      { title: '排放标准', dataIndex: 'cm_emission' ,width: 140},
      { title: '上市年份', dataIndex: 'cm_sales_year' ,width: 140},
      { title: '停产年份', dataIndex: 'cm_stop_year' ,width: 140},
      { title: '最大功率kW', dataIndex: 'cm_max_power' ,width: 140},
      { title: '审核状态', dataIndex: 'review_status',width: 140 },
      { title: '更新时间', dataIndex: 'update_time' ,width: 140},
    ];
    return (
      <React.Fragment>
        <Modal
          title={<div><label>修改前属性值：</label><span style={{marginRight:'20%'}}>{this.state.cm_pro_old_value} </span><label> 修改后属性值：</label><span>{this.state.cm_pro_new_value}</span></div>}
          visible={this.state.visible}
          footer={<div><Button type='primary' onClick={()=>this.handleOk()} disabled={BATCH.length===0?true:false}>确定修改</Button><Button onClick={()=>this.handleCancel()}>取消</Button></div>}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width="60%"
        >
          <Table
            columns={tableTitle} dataSource={BATCH}
            bordered={true}
            pagination={false}
            rowKey={(item, index) => index}
            scroll={{y:'500px',x:'max-content'}}
          />
        </Modal>
        <Modal
          title="确定修改？"
          visible={this.state.visible1}
          onOk={this.handleOk1}
          onCancel={this.handleCancel1}
          width="60%"
        >
          <Table
            title={() => '根据数据源修改'}
            scroll={{ x: 'max-content'}}
            columns={tableTitle} dataSource={BATCH}
            bordered={true}
            showHeader={true}
            pagination={false}
            rowKey={(item, index) => index}
          />
        </Modal>
        <Card className="m-b-15" title="批量格式化">
          <Form layout="inline">
            <Row>
              <Col span={20}>
                <FormItem label="数据源：">
                  {
                    getFieldDecorator('record_origin', { initialValue: fields['record_origin'] })(
                      <Select style={{ width: 130 }}>
                        {
                          record_origins.map((item, index) => {
                            return <Option value={item.val} key={item.key}>{item.key}</Option>;
                          })
                        }
                      </Select>
                    )
                  }
                </FormItem>
                <FormItem label="更新模式：">
                  {
                    getFieldDecorator('record_synctype', { initialValue: fields['record_synctype'] })(
                      <Select>
                        {
                          record_synctype.map((item, index) => {
                            return <Option value={item.val} key={item.key}>{item.key}</Option>;
                          })
                        }
                      </Select>
                    )
                  }
                </FormItem>
                <FormItem label="版本日期：">
                  {
                    getFieldDecorator('record_version', { initialValue: moment(new Date(fields['record_version'])) })(
                      <DatePicker allowClear={false} />
                    )
                  }
                </FormItem>
                <FormItem>
                  <Button type="primary" disabled={btnDisabled} onClick={this.handleSubmit}>{btnName}</Button>
                </FormItem>
              </Col>
            </Row>
          </Form>
          <Divider />
          <Link className='f12' to={'./history'}>查看更新历史记录</Link>
        </Card>

        <Divider style={{ marginTop: 10, marginBottom: 10 }} />
        {/* 自动审核 */}
        <Card className="m-b-15" title="自动审核">
          <Form layout="inline">
            <Row>
              <Col span={20}>
                <FormItem label="数据源：">
                  {
                    getFieldDecorator('cm_origin ', { initialValue: 'liyang' })(
                      <Select style={{ width: 130 }} onChange={this.changeCmOrigin}>
                        {
                          cm_origins.map((item, index) => {
                            return <Option value={item.val} key={item.key}>{item.key}</Option>;
                          })
                        }
                      </Select>
                    )
                  }
                </FormItem>
                <FormItem label="起始日期：">
                  {
                    getFieldDecorator('version',{initialValue:moment(moment().locale('zh-cn').format('YYYY-MM-DD'), 'YYYY-MM-DD')})(
                      <DatePicker allowClear={false} />
                    )
                  }
                </FormItem>
                <FormItem label="结束日期：">
                  {
                    getFieldDecorator('endDate',{initialValue:''})(
                      <DatePicker allowClear={false} />
                    )
                  }
                </FormItem>
                <FormItem label="审核状态">
                  {
                    getFieldDecorator('review_status',{initialValue:'PENDING'})(
                      <Select style={{width:200}}>
                        {/* <Option value={'all'}>全部</Option> */}
                        <Option value={'PENDING'}>待审核</Option>
                        <Option value={'APPROVED'}>审核通过</Option>
                        <Option value={'APPROVED_UPDATE'}>审核通过（关联车型有更新)</Option>
                      </Select>
                    )
                  }
                </FormItem>
                <FormItem>
                  <Button type="primary" disabled={btnDisabled} onClick={this.handleCmApprove} loading={loading['batchtask/fetchCarmodelFromatApprove']}>{btnName1}</Button>
                  {/* <Button type="primary" disabled onClick={this.handleCmApprove} loading={loading['batchtask/fetchCarmodelFromatApprove']}>{btnName1}</Button> */}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Card>

        <Divider style={{ marginTop: 10, marginBottom: 10 }} />

        <Card className="m-b-15" title={
          <>
            <span style={{ marginRight: '20px' }}>批量修改属性</span>
            {
              getFieldDecorator('cm_origin', { initialValue: origin })(
                <Select style={{ width: 130 }} onChange={this.changeOrigin}>
                  {
                    origins.map((item, index) => {
                      return <Option value={item.val} key={item.key}>{item.key}</Option>;
                    })
                  }
                </Select>
              )
            }
          </>
        }>
          <p style={{ fontSize: '15px' }}>指定条件修改</p>
          <Form layout="inline" onSubmit={this.checkSubmit}>
            <Row>
              <Col span={20}>
                <FormItem label='修改属性'>
                  {
                    getFieldDecorator('cm_pro_column', {
                      initialValue: cm_pro_column ,
                    })(
                      <Select style={{ width: 130 }}>
                        <Option value='cm_brand'>品牌</Option>
                      </Select>
                    )
                  }
                </FormItem>
                <FormItem label='修改前属性值：'>
                  {
                    getFieldDecorator('cm_pro_old_value')(
                      <Input placeholder="请填写修改前属性值" allowClear autoComplete="off" />
                    )
                  }
                </FormItem>
                <FormItem label='修改后属性值：'>
                  {
                    getFieldDecorator('cm_pro_new_value')(
                      <Input placeholder="请填写修改后属性值" allowClear autoComplete="off" />
                    )
                  }
                </FormItem>
              </Col>
            </Row>
            <Row className="m-t-10">
              <InputGroup compact>
                <FormItem label='条件'>
                  {
                    carmodelProListValueCheck.map((item, index) => {
                      let keys = Object.keys(item);
                      let optName = keys[0];
                      let valName = keys[1];
                      return (
                        <FormItem key={index}>
                          {
                            form.getFieldDecorator(valName, { initialValue: item[valName] })(
                              <React.Fragment>
                                <Input
                                  addonBefore={
                                    form.getFieldDecorator(optName, { initialValue: item[optName] })(
                                      index === 0 ?
                                        <Select style={{ width: 150 }}>
                                          <Option key={index} value='cm_factory'>主机厂</Option>
                                        </Select>
                                        :
                                        <Select style={{ width: 150 }}>
                                          {/* <Option key={index} value='cm_factory'>主机厂</Option> */}
                                          <Option key={index} value='cm_model'>车型</Option>
                                          <Option key={index} value='cm_brand'>品牌</Option>
                                          {carmodelProList.map((proItem, index) => { return <Option key={index} value={proItem.cm_pro_column}>{proItem.cm_pro_name}</Option>; })}
                                        </Select>
                                    )
                                  }
                                  value={getFieldValue(valName)}
                                  onChange={e => {
                                    setFieldsValue({ [valName]: e.target.value });
                                  }}
                                  allowClear
                                  style={{ width: 320 }}
                                  placeholder='输入关键字'
                                  suffix={
                                    item.flag &&
                                    <Icon
                                      type='close-circle'
                                      className='gray cur'
                                      onClick={() => setFieldsValue({ [valName]: '' })}
                                    />
                                  }
                                  addonAfter={index !== 0 ? <Icon type='delete' className='cur' onClick={() => { setFieldsValue({ [valName]: '' }); this.removeCarmodelProList(index); }} /> : ''}
                                  autoComplete="off"
                                />
                              </React.Fragment>
                            )
                          }
                        </FormItem>
                      );
                    })
                  }
                </FormItem>
                <FormItem><Button icon="plus" onClick={() => this.addCarmodelProList()}>增加筛选条件</Button></FormItem>
              </InputGroup>
            </Row>
            <Row>
              <Button type='primary' htmlType="submit" style={{marginTop:'20px'}} loading={loading['updatecm/fetchBatch']} disabled={btnDisabled}>查询</Button>
            </Row>
          </Form>
        </Card>
        <Divider style={{ marginTop: 10, marginBottom: 10 }} />

        {/* <Card className="m-b-15" title={
          <>
            <span style={{ marginRight: '20px' }}>批量修改审核</span>
            {
              getFieldDecorator('cm_origin1', { initialValue: origin1 })(
                <Select style={{ width: 130 }} onChange={this.changeOrigin}>
                  {
                    origins.map((item, index) => {
                      return <Option value={item.val} key={item.key}>{item.key}</Option>;
                    })
                  }
                </Select>
              )
            }
          </>
        }>
          <p style={{ fontSize: '15px' }}>根据数据源修改(标准车型关联多条源车型，源车型属性一致并且与标准车型相同)</p>
          <Form layout="inline" onSubmit={this.checkSubmitOrigin}>
            <Row>
              <Col span={20}>
                <FormItem label='修改属性'>
                  {
                    getFieldDecorator('cm_pro_column1', { initialValue: cm_pro_column1 })(
                      <Select style={{ width: 150 }}>
                        {carmodelProList.map((proItem, index) => { return <Option key={index} value={proItem.cm_pro_column}>{proItem.cm_pro_name}</Option>; })}
                      </Select>
                    )
                  }
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Button type='primary' htmlType="submit" style={{marginTop:'20px'}}>查询</Button>
            </Row>
          </Form>
        </Card> */}
      </React.Fragment>
    );
  }
}

const batchFormat = Form.create()(BatchUpdate);
const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.batchtask,
  ...state.baseorigin,
  ...state.updatecm
});
export default connect(mapStateToProps)(batchFormat);
