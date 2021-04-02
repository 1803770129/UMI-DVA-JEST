import React, { Component } from 'react';
import { Modal, Tabs, List, Card , Form, Input, Icon, Select, Row, Col , Table , Result ,Button  } from 'antd';

import ReactJson from 'react-json-view';
import './DetailModal.less';
import msg from '@/utils/msg';
import { isEmpty } from '@/utils/tools';
import * as _ from 'lodash';
import AddEngineoilLevel from './AddEngineoilLevel';
import AddEngineoilSae from './AddEngineoilSae';
const Option = Select.Option;
const TabPane = Tabs.TabPane;

const TableData = ({ listData, modalType, cm_origin, fetchBaseInfoUpdate, showModalCmid, form, CARMODEL_CAR }) => {
  const { getFieldDecorator, setFieldsValue } = form;

  const handleBlur = (val, listData, item) => {
    const targetValue = val ? val.trim() : '';
    // 车系的Select单独处理
    if (item.key === 'cm_car') {
      setFieldsValue({ cm_car: val });
      item.edit = true;
      fetchBaseInfoUpdate({ cm_type: listData.key, cm_pro_name: item.key, cm_id: showModalCmid, cm_value: val.trim(), cm_old_value:item.val , cm_pro_column_name:item.name},{list_name:item.name,type_name:listData.name});
      return false;
    }

    if (targetValue != item.val) {
      item.edit = true;
      fetchBaseInfoUpdate({ cm_type: listData.key, cm_pro_name: item.key, cm_id: showModalCmid, cm_value: targetValue.trim() , cm_old_value:item.val ,cm_pro_column_name:item.name },{list_name:item.name,type_name:listData.name});
    }
  };
  return (
    // <Spin spinning={}>
    <div className="baseorigin_detail_modal">

      {

        <List size="small" grid={{ gutter: 8, column: 4 }} dataSource={listData.list} renderItem={item => {
          return (

            <List.Item>
              {
                modalType == 'edit' &&
                <Card title={<span className="c9" style={{ fontWeight: 'normal' }}>{item.name}</span>}>
                  {
                    item.key !== 'cm_car' &&
                    getFieldDecorator( listData.key+item.key, {
                      initialValue:item.val
                    })(
                      <Input
                        disabled={!cm_origin.includes('sopei') && (item.key == 'cm_brand_country' || item.key == 'cm_brand' || item.key == 'cm_factory')}
                        size="small"
                        className="c3 f12"
                        suffix={item.edit && <Icon type="check-circle-o" style={{ color: '#08c' }} />}
                        onBlur={e => handleBlur(e.target.value, listData, item)}
                        autocomplete="off"
                      />
                    )
                  }
                  {
                    item.key === 'cm_car' &&
                    <Row gutter={8}>
                      <Col span={12}>
                        {
                          getFieldDecorator(item.key, {
                            initialValue: item.val
                          })(
                            <Input
                              placeholder="输入或选择"
                              size="small"
                              className="c3 f12"
                              suffix={item.edit && <Icon type="check-circle-o" style={{ color: '#08c' }} />}
                              onBlur={e => handleBlur(e.target.value, listData, item)}
                              autocomplete="off"
                            />
                          )
                        }
                      </Col>
                      <Col span={12}>
                        <Select size="small" defaultValue="" onChange={e => handleBlur(e, listData, item)}>
                          <Option value="">请选择</Option>
                          {
                            _.uniqBy(CARMODEL_CAR).filter(v => !isEmpty(v)).map((opt, optIdx) => {
                              return <Option key={opt} title={opt}>{opt}</Option>;
                            })
                          }
                        </Select>
                      </Col>
                    </Row>
                  }
                </Card>
              }
              {
                (modalType == 'detail' || modalType == 'origin_detail') &&
                <Card title={<span className="c9" style={{ fontWeight: 'normal' }}>{item.name}</span>} className="c3">{item.val || <span style={{ padding: 8 }}></span>}</Card>
              }
              {
                modalType == 'add' &&
                <Card title={<span className="c9" style={{ fontWeight: 'normal' }}>{item.name}</span>}>
                  {
                    getFieldDecorator(item.key, {
                      initialValue: item.val
                    })(
                      <Input size="small" className="c3"  autocomplete="off" />
                    )
                  }
                </Card>
              }
            </List.Item>
          );
        }}
        />
      }
    </div>
    // </Spin>
  );
};

class DetailModal extends Component {
  state = {
    visibleRecord: false,
    loading:true
  };
  componentDidMount() {
    // console.log(this.props)
  }

  // 车型详情添加确定
  handleOk = () => {
    const { form, fetchBaseInfoAdd } = this.props;
    const { validateFields } = form;
    validateFields((err, values) => {
      if (!err) {
        if (values['cm_brand'] == '' || values['cm_factory'] == '' || values['cm_model'] == '') {
          msg('品牌、主机厂、车型不可为空');
          return;
        }
        for (const key in values) {
          values[key] = values[key].trim();
        }
        fetchBaseInfoAdd(values);
      }
    });
  };
  handleOkRecord = () => {;
    this.setState({
      visibleRecord: false,
    });
  };

  handleCancelRecord = () => {
    this.setState({
      visibleRecord: false,
    });
  };
  showRecordModal=()=>{
    this.setState({
      visibleRecord: true,
    });

  }
  render() {
    const { carmodelOriginHistoryList  ,CARMODEL_CAR, CARMODEL_ENGINEOIL_LEVEL, CARMODEL_ENGINEOIL_SAE, carmodelBaseInfo, carmodelOriginInfo = {}, visible, cm_origin = '', closeModal, modalType, showModalCmid, fetchBaseInfoUpdate, form, loadings,loading = false, global_loading, onFetchCarmodelEngineoilLevelAdd, onFetchCarmodelEngineoilLevelUpdate, onFetchCarmodelEngineoilLevelDel, onFetchCarmodelEngineoilSaeAdd, onFetchCarmodelEngineoilSaeUpdate, onFetchCarmodelEngineoilSaeDel, onUpdateCarmodelEngineoilLevel, onUpdateCarmodelEngineoilSae } = this.props;
    const columns = [
      {
        title: '属性范围',
        dataIndex: 'cm_pro_scope',
        key: 'cm_pro_scope',
      },
      {
        title: '属性名称',
        dataIndex: 'cm_pro_column_name',
        key: 'cm_pro_column_name',
      },
      {
        title: '修改前属性值',
        dataIndex: 'cm_old_value',
        key: 'cm_old_value',
      },
      {
        title: '修改后属性值',
        dataIndex: 'cm_new_value',
        key: 'cm_new_value',
      },
      {
        title: '修改者',
        dataIndex: 'update_by_name',
        key: 'update_by_name',
      },
      {
        title: '修改时间',
        dataIndex: 'update_time',
        key: 'update_time',
      },
    ];
    const config = {
      title:
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <div>车型详情</div>
              {
                modalType == 'add' || modalType=='origin_detail'?
                  ''
                  :
                  <Button type="primary" shape="round" size="small" style={{marginRight:'30px'}} onClick={()=>this.showRecordModal()}>
                查看修改记录
                  </Button>
              }
            </div>,
      visible: visible,
      onCancel: closeModal,
      width: '1250px',
      destroyOnClose: true,
      style: { top: 30 },
    };

    if (modalType == 'add') {
      config.okText = '确定添加';
      config.onOk = this.handleOk;
    } else {
      config.footer = null;
    }
    return (
      <React.Fragment>

        {/* 编辑 */}
        <Modal
          title="修改记录"
          visible={this.state.visibleRecord}
          onOk={this.handleOkRecord}
          onCancel={this.handleCancelRecord}
          zIndex={10000}
          width={'60%'}
        >
          <Table columns={columns} loading={loadings} dataSource={carmodelOriginHistoryList}  scroll={{ x: 'max-content',y:'300px' }} pagination={false} size="middle" rowKey={(item, index) => index} />
        </Modal>
        {
          loading &&
          <Card bordered={false} loading={loading} style={{ minHeight: 545 }}></Card>
        }
        {/* 添加 */}
        {
          !loading &&
          <Modal {...config}>

            <Form layout="inline" >
              {
                carmodelBaseInfo.length&&
                <Tabs defaultActiveKey={ modalType == 'origin_detail' ? 'origin_detail' : 'base'} tabPosition="left" size="small" className="batchtask_detail_modal_tabs">
                  {
                    modalType == 'origin_detail' &&
                  <TabPane tab="源车型记录" key={'origin_detail'}>
                    {
                      carmodelOriginInfo?
                        <ReactJson src={carmodelOriginInfo} displayDataTypes={false} displayObjectSize={false} style={{ fontSize: 12, maxHeight: 490, overflowY: 'auto' }} />
                        :
                        <Result
                          status="warning"
                          title="暂无数据"
                        />
                    }
                  </TabPane>
                  }
                  {
                    carmodelBaseInfo.map(item => {
                      return (
                        <TabPane tab={item.name} key={item.key} >
                          <TableData cm_origin={cm_origin} listData={item} modalType={modalType} showModalCmid={showModalCmid} fetchBaseInfoUpdate={fetchBaseInfoUpdate} form={form} CARMODEL_CAR={CARMODEL_CAR} />
                        </TabPane>
                      );
                    })
                  }
                  {
                    modalType !== 'origin_detail' &&
                  <TabPane tab="机油粘度" key={'engineoil_sae'}>
                    <AddEngineoilSae form={form} loading={global_loading} modalType={modalType}  CARMODEL_ENGINEOIL_SAE={CARMODEL_ENGINEOIL_SAE} cm_id={showModalCmid} onFetchCarmodelEngineoilSaeAdd={onFetchCarmodelEngineoilSaeAdd} onFetchCarmodelEngineoilSaeUpdate={onFetchCarmodelEngineoilSaeUpdate} onFetchCarmodelEngineoilSaeDel={onFetchCarmodelEngineoilSaeDel} onUpdateCarmodelEngineoilSae={onUpdateCarmodelEngineoilSae} />
                  </TabPane>
                  }
                  {
                    modalType !== 'origin_detail' &&
                  <TabPane tab="机油等级" key={'engineoil_level'}>
                    <AddEngineoilLevel form={form} loading={global_loading} modalType={modalType} CARMODEL_ENGINEOIL_LEVEL={CARMODEL_ENGINEOIL_LEVEL} cm_id={showModalCmid} onFetchCarmodelEngineoilLevelAdd={onFetchCarmodelEngineoilLevelAdd} onFetchCarmodelEngineoilLevelUpdate={onFetchCarmodelEngineoilLevelUpdate} onFetchCarmodelEngineoilLevelDel={onFetchCarmodelEngineoilLevelDel} onUpdateCarmodelEngineoilLevel={onUpdateCarmodelEngineoilLevel} />
                  </TabPane>
                  }
                </Tabs>

              }
            </Form>
          </Modal>
        }
      </React.Fragment>
    );
  }
}

export default Form.create()(DetailModal);
