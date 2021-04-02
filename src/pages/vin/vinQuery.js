import React, { Component } from 'react';
import { Form, Card, Input, Button, Table,message , Modal } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import ModalCarmodelOriginInfo from './components/ModalCarmodelOriginInfo';
import { convertVinCode } from '@/utils/tools';
const FormItem = Form.Item;
const { confirm } = Modal;
class VinQuery extends Component {

  state = {
    _vin_code: undefined,
    visible: false,
    vin_code: ''
  }

  componentDidMount() {
    const { FIELDS } = this.props;
    if(FIELDS.vinCode) {
      this.fetchVinQuery(FIELDS.vinCode);
    }
  }

  fetchVinQuery = vinCode => {
    const { dispatch } = this.props;
    dispatch({
      type: 'vinQuery/fetchVinQuery',
      payload: { vinCode },
      callback: (res) => {
        if (res.length === 0){
          message.warning('未查询到VIN码对应的车型数据');
        }
      }
    });
  }

  handleSubmit = e => {
    const { form } = this.props;
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        const { vinCode } = values;
        this.fetchVinQuery(vinCode);
      }
    });
  };

  /** 显示模态框 */
  showModal = (record) => {
    this.setState({ visible: true });
    this.fetchCarmodelOriginInfo(record.cm_origin_id, record.cm_origin);
  };

  /** 关闭模态框 */
  closeModal = () => {
    this.setState({ visible: false });
  };

  /** 获取车型数据 */
  fetchCarmodelOriginInfo = (cm_origin_id, cm_origin) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'vinQuery/fetchCarmodelOriginInfo',
      payload: { cm_origin_id, cm_origin }
    });
  };

  changeVinCode = e => {
    const { dispatch } = this.props;
    if (!e || !e.target) {
      return e;
    }
    const { value } = e.target;
    if(!value) {
      // 清空数据
      dispatch({
        type: 'vinQuery/updateVinQuery'
      });
      dispatch({
        type: 'vinQuery/updateFields'
      });
    }
    return convertVinCode(value);
  };

  render() {
    const { form, loading, VIN_QUERY, FIELDS, CARMODEL_ORIGIN_INFO } = this.props;
    const { visible } = this.state;
    const { getFieldDecorator } = form;
    const columns = [
      {
        title: '数据源',
        dataIndex: 'cm_origin',
      },
      {
        title: '源车型ID',
        dataIndex: 'cm_origin_id',
        render: (text, record, index) => {
          return <span className="f12 blue6 cur" onClick={() => this.showModal(record)} title="点击查看源车型">{text}</span>;
        },
      },
      {
        title: '错误标识',
        dataIndex: 'cm_check',
      },
      {
        title: '标准车型ID',
        dataIndex: 'cm_id',
        render: (text, record, index) => {
          return <span className="f12 blue6 cur" onClick={() => router.push('/baseorigin/list/' + text)} title="点击跳转到对应的车型编辑页">{text}</span>;
        },
      },
      {
        title: 'VIN查询时间',
        dataIndex: 'update_time',
      },
      {
        title: '品牌/主机厂/车型/配置等级',
        dataIndex: 'cm_carmodel',
        render: (text, record, index) => {
          const { cm_brand, cm_factory, cm_model, cm_conf_level } = record;
          return [cm_brand, cm_factory, cm_model, cm_conf_level].map(v => v || '-').join('/');
        },
      },
      {
        title: '车系',
        dataIndex: 'cm_car',
      },
      {
        title: '排量',
        dataIndex: 'cm_displacement',
      },
      {
        title: '年款',
        dataIndex: 'cm_model_year',
      },
      {
        title: '底盘号',
        dataIndex: 'cm_chassis_model',
      },
      {
        title: '发动机型号',
        dataIndex: 'cm_engine_model',
      },
      {
        title: '发动机启停',
        dataIndex: 'cm_engine_start_stop',
      },
      {
        title: '燃油类型',
        dataIndex: 'cm_fuel_type',
      },
      {
        title: '变速箱类型',
        dataIndex: 'cm_gearbox',
      },
      {
        title: '驱动方式',
        dataIndex: 'cm_driving_mode',
      },
      {
        title: '排放标准',
        dataIndex: 'cm_emission',
      },
      {
        title: '上市年份',
        dataIndex: 'cm_sales_year',
      },
      {
        title: '停产年份',
        dataIndex: 'cm_stop_year',
      },
      {
        title: '最大功率kw',
        dataIndex: 'cm_max_power',
      },
      {
        title: '克隆ID',
        dataIndex: 'cm_clone_id',
      },
      {
        title: '审核状态',
        dataIndex: 'review_status',
        fixed: 'right',

        render: (text, record, index) => {
          const review_status = {
            PENDING: '待审核',
            APPROVED: '审核通过',
            NONAPPROVED: '审核不通过',
            APPROVED_UPDATE: '审核通过（关联车型有更新）'
          };
          let className = 'c9';
          if(text === 'APPROVED' || text === 'APPROVED_UPDATE') {
            className = 'red3';
          }else if(text === 'NONAPPROVED') {
            className = 'red5';
          }else if(text === 'PENDING') {
            className = 'green5';
          }
          return <span className={className}>{review_status[text] || '-'}</span>;
        },
      },
    ].map(v => {
      return {
        ...v,
        render:
          v.render ||
          ((text, record, index) => {
            return text || '-';
          }),
      };
    });
    const submitFn = () => {
      const { vin_code } = this.state;
      confirm({
        content: '确定进行VIN缓存清理？',
        onOk:()=> {
          if(vin_code == '') return;
          this.props.dispatch({
            type: 'vin_clean/cleanVinLevelId',
            payload: {
              vin_code: vin_code.replace(/-/g, ''),
              cb: () => {
                message.success('缓存清理成功');
                this.setState({ vin_code: '' });
              }
            }
          });
        },
      });
    };
    const submitWhitelist = async() => {
      const { vin_code } = this.state;
      if(vin_code == '') return;
      await this.props.dispatch({
        type: 'vinQuery/fetchWhiteList',
        data: {
          vin_code: vin_code.replace(/-/g, ''),
        }
      });
    };
    const onChangeVinCodeFn = code => this.setState({ vin_code: convertVinCode(code) });
    return (
      <Card>
        <Form layout="inline" autoComplete="off" onSubmit={this.handleSubmit}>
          <FormItem label="VIN">
            {getFieldDecorator('vinCode', {
              initialValue: convertVinCode(FIELDS.vinCode),
              getValueFromEvent: this.changeVinCode,
              validateTrigger: 'onSubmit',
              rules: [{ required: true, message: '必填项' }],
            })(<Input allowClear  value={this.state.vin_code}
              placeholder="请输入17位的VIN码"
              style={{ width: 200 }}
              onChange={ e => onChangeVinCodeFn(e.target.value) } />)}
          </FormItem>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              搜索
            </Button>
            <Button style={{marginLeft:'20px'}} type="primary" onClick={ () => submitFn()}>清理VIN缓存</Button>
            <Button style={{marginLeft:'20px'}} type="primary" onClick={ () => submitWhitelist()}>加入白名单</Button>
          </Form.Item>
        </Form>

        <Table className="m-t-15" bordered dataSource={VIN_QUERY} columns={columns} rowKey="cm_origin_id" pagination={false} scroll={{ x: 'max-content' }} loading={loading['vinQuery/fetchVinQuery']} />

        {/* 源车型数据模态框 */}
        <ModalCarmodelOriginInfo isLoading={loading['vinQuery/fetchCarmodelOriginInfo']} visible={visible} CARMODEL_ORIGIN_INFO={CARMODEL_ORIGIN_INFO} onClose={this.closeModal} />
      </Card>
    );
  }
}


const mapStateToProps = state => ({
  loading: state.loading.effects,
  VIN_QUERY: state.vinQuery.VIN_QUERY,
  FIELDS: state.vinQuery.FIELDS,
  CARMODEL_ORIGIN_INFO: state.vinQuery.CARMODEL_ORIGIN_INFO,
  ...state.vin_clean
});

export default connect(mapStateToProps)(Form.create()(VinQuery));
