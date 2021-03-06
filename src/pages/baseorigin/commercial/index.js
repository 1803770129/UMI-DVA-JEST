import React, { Component } from 'react';
import { Form , Table ,Card ,Row , Input, Button , Select, Cascader , Tooltip , Icon} from 'antd';
import { sleep } from '@/utils/tools';
import { connect } from 'dva';
const Option = Select.Option;
const FormItem = Form.Item;
class Commercial extends Component {
  state={
    selectedRowKeys:[],
    selectedRows:[],
    format:'ALL',
    page:this.props.COMMPAGES.page,
    perpage:this.props.COMMPAGES.perpage
  }
  componentDidMount() {
    const {COMMPAGES } = this.props;
    this.fetchBrandFacModList();
    this.fetchCommercialList(COMMPAGES);
  }
  fetchBrandFacModList = async () => {
    const { dispatch } = this.props;
    if(this.props.carmodelList.length === 0) {
      await dispatch({ type: 'commercial/fetchBrandFacModList' });
    }
    await dispatch({ type: 'commercial/updateState', payload: { carmodelList: this.props.carmodelList } });
  };
  fetchCommercialList=(params)=>{
    this.props.dispatch({
      type:'commercial/fetchCommercialList',
      payload:params

    });
  }
  handleChange=e=>{
    this.setState({
      format:e
    });
  }
  handleSubmit = e => {
    e.preventDefault();
    const {form} = this.props;
    const {  getFieldsValue } = form;
    const { brand_fac_mod = [] } = getFieldsValue();
    const [ cm_brand, cm_factory, cm_model ] = brand_fac_mod;
    form.validateFields((err, values) => {
      const {COMMPAGES}=this.props;
      if (!err) {
        if(this.state.format==='ALL'){
          this.props.dispatch({
            type:'commercial/fetchCommercialList',
            payload:{...COMMPAGES,page:1,cm_brand, cm_factory, cm_model,cm_version:values.cm_version,cm_levelid:values.cm_levelid}
          });
          this.setState({
            page:1
          });
        }else{
          this.props.dispatch({
            type:'commercial/fetchCommercialList',
            payload:{...COMMPAGES,page:1,cm_brand, cm_factory, cm_model,cm_format:values.check,cm_version:values.cm_version,cm_levelid:values.cm_levelid}
          });
          this.setState({
            page:1
          });
        }
      }
    });
  };
  toReview = () => {
    this.loopGetBatchStatus('', 0, new Date().getTime());
    this.loopGetBatchStatus1('', 0, new Date().getTime());
    // this.fetchToReviewList(this.state.selectedRowKeys);
    this.setState({
      selectedRowKeys:[]
    });
  }
  fetchToReviewList=async(selectedId)=>{
    await this.props.dispatch({
      type:'commercial/fetchToReviewList',
      data:{cm_levelids:selectedId}
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
              // ????????? ?????? ???RUN?????? ?????? ?????????30??????
              let newFields = {
                record_origin: result.job_record_origin,
                record_synctype: result.job_record_synctype,
                record_version: result.job_record_version
              };
              this.setState({ fields: newFields });
            }
            if (result.job_record_status == 'SUCCESS' || result.job_record_status == 'FAIL') {
              this.setState({ btnDisabled: false, btnName: '????????????' });
            } else if (result.job_record_status == 'RUN') {
              if (new Date(result.system_time).getTime() - new Date(result.job_record_start).getTime() < 1800000) {
                this.loopGetBatchStatus(result.job_record_id, 60000, startTime); // 1??????????????????
                this.setState({ btnDisabled: true, btnName: '?????????...' });
              } else {
                this.setState({ btnDisabled: false, btnName: '????????????' });
                message.error('?????????????????????????????????????????????');
              }
            }
          } else {
            this.setState({ btnDisabled: false, btnName: '????????????' });
          }
        }
      }
    });

  };
  loopGetBatchStatus1 = async (job_record_id, sleepTime, startTime) => {
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
              this.setState({ btnDisabled1: false, btnName1: '??????????????????' });
            } else if (result.job_record_status == 'RUN') {
              if (new Date(result.system_time).getTime() - new Date(result.job_record_start).getTime() < 1800000) {
                this.loopGetBatchStatus(result.job_record_id, 60000, startTime); // 1??????????????????
                this.setState({ btnDisabled1: true, btnName1: '?????????...' });
              } else {
                this.setState({ btnDisabled1: false, btnName1: '??????????????????' });
                message.error('???????????????????????????????????????????????????');
              }
            }
          } else {
            this.setState({ btnDisabled1: false, btnName1: '??????????????????' });
          }
        }
      }
    });
  };

  render() {
    const { form , carmodelList , COMMERCIALLIST ,loading , COMMPAGES} = this.props;
    const {getFieldDecorator}=form;
    const handleCarmodelFilter = (inputValue, selectedOptions) => {
      return selectedOptions.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase().trim()) > -1);
    };

    // ??????????????????
    const carmodelSelectConfig = {
      style: { minWidth: 380 },
      placeholder: '???????????????/?????????/??????',
      showSearch: { filter: handleCarmodelFilter, limit: false },
      changeOnSelect: true,
      fieldNames: { label: 'label', value: 'v', children: 'c' }
    };
    const columns = [
      {
        title: 'Level ID',
        dataIndex: 'cm_levelid',
        fixed: 'left',
      },
      {
        title: '??????',
        dataIndex: 'cm_brand',
        fixed: 'left',
      },
      {
        title: '?????????',
        dataIndex: 'cm_factory',
      },
      {
        title: '??????',
        dataIndex: 'cm_car',
      },
      {
        title: '??????',
        dataIndex: 'cm_model',
      },
      {
        title: '????????????',
        dataIndex: 'cm_emission',
      },
      {
        title: '?????????',
        dataIndex: 'cm_chassis_model',
      },
      {
        title: '????????????',
        dataIndex: 'cm_product_year',
      },
      {
        title: '????????????',
        dataIndex: 'cm_stop_year',
      },
      {
        title: '??????/??????/??????',
        dataIndex: 'cm_manage_nature',
      },
      {
        title: '????????????',
        dataIndex: 'cm_manage_code',
      },
      {
        title: '???????????????',
        dataIndex: 'cm_engine_model',
      },
      {
        title: '????????????',
        dataIndex: 'cm_cylinder',
      },
      {
        title: '??????(??????',
        dataIndex: 'cm_displacement',
      },
      {
        title: '????????????',
        dataIndex: 'cm_air_intake',
      },
      {
        title: '????????????',
        dataIndex: 'cm_fuel_type',
      },
      {
        title: '????????????(kW)',
        dataIndex: 'cm_max_power',
      },
      {
        title: '???????????????',
        dataIndex: 'cm_trans_type',
      },
      {
        title: '???????????????',
        dataIndex: 'cm_trans_desc',
      },
      {
        title: '?????????',
        dataIndex: 'cm_gear_num',
      },
      {
        title: '??????????????????',
        dataIndex: 'cm_front_brake_type',
      },
      {
        title: '??????????????????',
        dataIndex: 'cm_rear_brake_type',
      },
      {
        title: '???????????????',
        dataIndex: 'cm_front_suspension_type',
      },
      {
        title: '???????????????',
        dataIndex: 'cm_rear_suspension_type',
      },
      {
        title: '????????????',
        dataIndex: 'cm_driving_mode',
      },
      {
        title: '????????????',
        dataIndex: 'cm_vehicle_body',
      },
      {
        title: '???????????????Kg???',
        dataIndex: 'cm_vehicle_weight',
      },
      {
        title: '???????????????',
        dataIndex: 'cm_front_tire_size',
      },
      {
        title: '???????????????',
        dataIndex: 'cm_rear_tire',
      },
      {
        title: '???????????????',
        dataIndex: 'cm_front_wheel',
      },
      {
        title: '???????????????',
        dataIndex: 'cm_rear_wheel',
      },
      {
        title: '?????????????????????',
        dataIndex: 'cm_driver_airbag',
      },
      {
        title: '?????????????????????',
        dataIndex: 'cm_passenger_airbag',
      },
      {
        title: '???????????????',
        dataIndex: 'cm_front_side_airbag',
      },
      {
        title: '???????????????',
        dataIndex: 'cm_rear_side_airbag',
      },
      {
        title: '??????????????????????????????',
        dataIndex: 'cm_front_head_airbag',
      },
      {
        title: '??????????????????????????????',
        dataIndex: 'cm_rear_head_airbag',
      },
      {
        title: '????????????',
        dataIndex: 'cm_knee_airbag',
      },
      {
        title: 'ABS?????????',
        dataIndex: 'cm_abs_antilock',
      },
      {
        title: '????????????',
        dataIndex: 'cm_electric_skylight',
      },
      {
        title: '????????????',
        dataIndex: 'cm_panoramic_sunroof',
      },
      {
        title: '????????????',
        dataIndex: 'cm_xenon_lamp',
      },
      {
        title: 'LED??????',
        dataIndex: 'cm_led_lamp',
      },
      {
        title: '???????????????',
        dataIndex: 'cm_daytime_lamp',
      },
      {
        title: '????????????',
        dataIndex: 'cm_auto_lamp',
      },
      {
        title: '????????????',
        dataIndex: 'cm_turn_head_lamp',
      },
      {
        title: '?????????',
        dataIndex: 'cm_front_fog',
      },
      {
        title: 'GPS??????',
        dataIndex: 'cm_gps',
      },
      {
        title: '??????',
        dataIndex: 'cm_air',
      },
      {
        title: '????????????',
        dataIndex: 'cm_auto_air',
      },
      {
        title: '????????????',
        dataIndex: 'cm_park_brake_type',
      },
      {
        title: '???????????????',
        dataIndex: 'cm_dipped_beam_type',
      },
      {
        title: '???????????????',
        dataIndex: 'cm_high_beam_type',
      },
      {
        title: '??????????????????',
        dataIndex: 'cm_vehicle_series',
      },
      {
        title: '????????????',
        dataIndex: 'cm_update_time',
      },
      {
        title: '????????????',
        dataIndex: 'cm_version',
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
      getCheckboxProps: (record) => ({
        disabled: record.cm_format==='formatted' || record.cm_status==='approved'
      }),
    };
    const paginations={
      pageSize:this.state.perpage,
      current:this.state.page,
      total: parseInt(COMMERCIALLIST.count,10),
      showSizeChanger: true,
      showTotal: (total, range) => `?????? ${range[0]}-${range[1]}, ??? ${total} ?????????`,
      onShowSizeChange: (current, perpage) => onHandlePageSizeChangeFn(current, perpage),
      onChange: page => onHandlePageChangeFn(page)
    };
    const onHandlePageSizeChangeFn = (current, perpage) => {
      this.setState({
        perpage:perpage
      });
      this.fetchCommercialList({...COMMPAGES, perpage:perpage, page: 1});
    };
    const onHandlePageChangeFn = page => {
      this.setState({
        page:page
      });
      this.fetchCommercialList({perpage:this.state.perpage, page:page });
    };
    return (
      <>
      <Card>
        <Card bordered={false}  loading={loading['commercial/fetchBrandFacModList']}>
          <Form layout="inline" onSubmit={this.handleSubmit}>
            <Row>
              <FormItem label="Level ID">
                {
                  getFieldDecorator(
                    'cm_levelid', {
                    },
                  )(
                    <Input placeholder='Level ID' allowClear autoComplete="off" />
                  )
                }
              </FormItem>
              <FormItem label="?????????">
                {
                  getFieldDecorator(
                    'cm_version', {
                    },
                  )(
                    <Input placeholder='?????????' allowClear autoComplete="off" />
                  )
                }
              </FormItem>
              <FormItem label="??????/?????????/?????????">
                {
                  getFieldDecorator(
                    'brand_fac_mod', {
                    },
                  )(
                    <Cascader options={carmodelList} {...carmodelSelectConfig}/>
                  )
                }
              </FormItem>
              <FormItem>
                {
                  getFieldDecorator(
                    'check', {
                      initialValue:'ALL',
                    },
                  )(
                    <Select style={{ width: 100 }}  onChange={this.handleChange} allowClear >
                      <Option value='ALL'>??????</Option>
                      <Option value='FORMATTED'>????????????</Option>
                      <Option value='UNFORMATTED'>????????????</Option>
                    </Select>
                  )
                }
              </FormItem>
              <FormItem>
                <Button type="primary" htmlType="submit">??????</Button>
              </FormItem>
              <FormItem>
                <Button type="primary" onClick={()=>this.toReview()} disabled={this.state.selectedRowKeys.length===0?true:false}>???????????????????????????</Button>
                <Tooltip overlayStyle={{ maxWidth: 'auto' }} title="????????????????????????????????????????????????">
                  <Icon type="question-circle" theme="filled" className="f18 m-l-5 c9 help" />
                </Tooltip>
              </FormItem>
            </Row>
          </Form>
        </Card>

        <Table columns={columns} dataSource={COMMERCIALLIST.models} bordered
          aligin="center"
          rowKey={record=>record.cm_levelid}
          loading={loading['commercial/fetchCommercialList']}
          rowSelection={rowSelection}
          pagination={paginations}
          scroll={{x:'max-content'}}
        />
      </Card>
      </>
    );
  }
}
const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.commercial
});
const CommercialList = Form.create()(Commercial);
export default connect(mapStateToProps)(CommercialList);
