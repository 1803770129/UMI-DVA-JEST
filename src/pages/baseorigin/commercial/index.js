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
              this.setState({ btnDisabled1: false, btnName1: '启动批量审核' });
            } else if (result.job_record_status == 'RUN') {
              if (new Date(result.system_time).getTime() - new Date(result.job_record_start).getTime() < 1800000) {
                this.loopGetBatchStatus(result.job_record_id, 60000, startTime); // 1分钟轮询一次
                this.setState({ btnDisabled1: true, btnName1: '审核中...' });
              } else {
                this.setState({ btnDisabled1: false, btnName1: '启动批量审核' });
                message.error('批量审核失败，通知技术人员分析原因');
              }
            }
          } else {
            this.setState({ btnDisabled1: false, btnName1: '启动批量审核' });
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

    // 车型筛选配置
    const carmodelSelectConfig = {
      style: { minWidth: 380 },
      placeholder: '请选择品牌/主机厂/车型',
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
        title: '品牌',
        dataIndex: 'cm_brand',
        fixed: 'left',
      },
      {
        title: '主机厂',
        dataIndex: 'cm_factory',
      },
      {
        title: '车系',
        dataIndex: 'cm_car',
      },
      {
        title: '车型',
        dataIndex: 'cm_model',
      },
      {
        title: '排放标准',
        dataIndex: 'cm_emission',
      },
      {
        title: '底盘号',
        dataIndex: 'cm_chassis_model',
      },
      {
        title: '生产年份',
        dataIndex: 'cm_product_year',
      },
      {
        title: '停产年份',
        dataIndex: 'cm_stop_year',
      },
      {
        title: '国产/合资/进口',
        dataIndex: 'cm_manage_nature',
      },
      {
        title: '车型代码',
        dataIndex: 'cm_manage_code',
      },
      {
        title: '发动机型号',
        dataIndex: 'cm_engine_model',
      },
      {
        title: '气缸容积',
        dataIndex: 'cm_cylinder',
      },
      {
        title: '排量(升）',
        dataIndex: 'cm_displacement',
      },
      {
        title: '进气形式',
        dataIndex: 'cm_air_intake',
      },
      {
        title: '燃油类型',
        dataIndex: 'cm_fuel_type',
      },
      {
        title: '最大功率(kW)',
        dataIndex: 'cm_max_power',
      },
      {
        title: '变速器类型',
        dataIndex: 'cm_trans_type',
      },
      {
        title: '变速器描述',
        dataIndex: 'cm_trans_desc',
      },
      {
        title: '档位数',
        dataIndex: 'cm_gear_num',
      },
      {
        title: '前制动器类型',
        dataIndex: 'cm_front_brake_type',
      },
      {
        title: '后制动器类型',
        dataIndex: 'cm_rear_brake_type',
      },
      {
        title: '前悬挂类型',
        dataIndex: 'cm_front_suspension_type',
      },
      {
        title: '后悬挂类型',
        dataIndex: 'cm_rear_suspension_type',
      },
      {
        title: '驱动方式',
        dataIndex: 'cm_driving_mode',
      },
      {
        title: '车身型式',
        dataIndex: 'cm_vehicle_body',
      },
      {
        title: '整备质量（Kg）',
        dataIndex: 'cm_vehicle_weight',
      },
      {
        title: '前轮胎规格',
        dataIndex: 'cm_front_tire_size',
      },
      {
        title: '后轮胎规格',
        dataIndex: 'cm_rear_tire',
      },
      {
        title: '前轮毂规格',
        dataIndex: 'cm_front_wheel',
      },
      {
        title: '后轮毂规格',
        dataIndex: 'cm_rear_wheel',
      },
      {
        title: '驾驶座安全气囊',
        dataIndex: 'cm_driver_airbag',
      },
      {
        title: '副驾驶安全气囊',
        dataIndex: 'cm_passenger_airbag',
      },
      {
        title: '前排侧气囊',
        dataIndex: 'cm_front_side_airbag',
      },
      {
        title: '后排侧气囊',
        dataIndex: 'cm_rear_side_airbag',
      },
      {
        title: '前排头部气囊（气帘）',
        dataIndex: 'cm_front_head_airbag',
      },
      {
        title: '后排头部气囊（气帘）',
        dataIndex: 'cm_rear_head_airbag',
      },
      {
        title: '膝部气囊',
        dataIndex: 'cm_knee_airbag',
      },
      {
        title: 'ABS防抱死',
        dataIndex: 'cm_abs_antilock',
      },
      {
        title: '电动天窗',
        dataIndex: 'cm_electric_skylight',
      },
      {
        title: '全景天窗',
        dataIndex: 'cm_panoramic_sunroof',
      },
      {
        title: '氙气大灯',
        dataIndex: 'cm_xenon_lamp',
      },
      {
        title: 'LED大灯',
        dataIndex: 'cm_led_lamp',
      },
      {
        title: '日间行车灯',
        dataIndex: 'cm_daytime_lamp',
      },
      {
        title: '自动头灯',
        dataIndex: 'cm_auto_lamp',
      },
      {
        title: '转向头灯',
        dataIndex: 'cm_turn_head_lamp',
      },
      {
        title: '前雾灯',
        dataIndex: 'cm_front_fog',
      },
      {
        title: 'GPS导航',
        dataIndex: 'cm_gps',
      },
      {
        title: '空调',
        dataIndex: 'cm_air',
      },
      {
        title: '自动空调',
        dataIndex: 'cm_auto_air',
      },
      {
        title: '制动类型',
        dataIndex: 'cm_park_brake_type',
      },
      {
        title: '近光灯类型',
        dataIndex: 'cm_dipped_beam_type',
      },
      {
        title: '远光灯类型',
        dataIndex: 'cm_high_beam_type',
      },
      {
        title: '车系归属分类',
        dataIndex: 'cm_vehicle_series',
      },
      {
        title: '更新时间',
        dataIndex: 'cm_update_time',
      },
      {
        title: '文件版本',
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
      showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`,
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
              <FormItem label="版本号">
                {
                  getFieldDecorator(
                    'cm_version', {
                    },
                  )(
                    <Input placeholder='版本号' allowClear autoComplete="off" />
                  )
                }
              </FormItem>
              <FormItem label="品牌/主机厂/车型：">
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
                      <Option value='ALL'>全部</Option>
                      <Option value='FORMATTED'>已格式化</Option>
                      <Option value='UNFORMATTED'>未格式化</Option>
                    </Select>
                  )
                }
              </FormItem>
              <FormItem>
                <Button type="primary" htmlType="submit">查询</Button>
              </FormItem>
              <FormItem>
                <Button type="primary" onClick={()=>this.toReview()} disabled={this.state.selectedRowKeys.length===0?true:false}>进入待标准化车型表</Button>
                <Tooltip overlayStyle={{ maxWidth: 'auto' }} title="请选择需要进入待格式化的车型数据">
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
