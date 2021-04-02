import React, { Component } from 'react';
import { Form, Row, Col, Select, Button, Input, Card, Table, Divider, Modal, Spin, Icon, Tooltip } from 'antd';
import { connect } from 'dva';
import WeappModal from './components/WeappModal';
import styles from './index.less';
import msg from '@/utils/msg';
import classNames from 'classnames';
import moment from 'moment';
import { PhotoSwipe } from 'react-photoswipe';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

class Weapp extends Component {
  state = {
    selectedRowKeys: [],
    visible: false,
    record: {},
    page: 1,
    loadingStr: '',
    perpage: 10,
    isShowQrcode: false,
    weappQrcode: []
  };

  componentDidMount() {
    this.fetchWeapps({
      page: this.state.page,
      perpage: this.state.perpage,
    });
    this.managerMpEditionManage();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({ type: 'weapp/clearState' });
  }

  /** 小程序管理列表 */
  fetchWeapps = payload => {
    const { dispatch } = this.props;
    const { record } = this.state;
    this.setState({
      page: payload.page,
      perpage: payload.perpage,
      selectedRowKeys: []
    });
    if(payload.version) {
      delete payload.version;
    }
    dispatch({
      type: 'weapp/fetchWeapps',
      payload,
      callback: (result) => {
        if (!$.isEmptyObject(record)) {
          result.forEach(item => {
            if (item.ten_brand_id === record.ten_brand_id) {
              this.setState({
                record: item,
              });
            }
          });
        }
      },
    });
  };

  searchData = () => {

    this.setState({
      selectedRowKeys: [],
      page: 1,
    });
    this.props.form.validateFields((err, values) => {
      // console.log(values);
      this.fetchWeapps({
        page: 1,
        perpage: this.state.perpage,
        ...values,
      });
    });
  };
  selectEmpower=(e)=>{
    this.setState({
      selectedRowKeys: [],
      page: 1,
    });
    this.props.form.validateFields((err, values) => {
      values.auth_status=e;
      this.fetchWeapps({
        page: 1,
        perpage: this.state.perpage,
        ...values,

      });
    });
  }
  selectStatus=(e)=>{
    this.setState({
      selectedRowKeys: [],
      page: 1,
    });
    this.props.form.validateFields((err, values) => {
      values.weapp_status=e;
      this.fetchWeapps({
        page: 1,
        perpage: this.state.perpage,
        ...values
      });
    });
  }

  /** 小程序版本列表 */
  managerMpEditionManage() {
    const { dispatch } = this.props;
    dispatch({
      type: 'weapp/managerMpEditionManage',
    });
  }

  /** 发布小程序 */
  fetchManagerMpPublishWeapp = payload => {
    const { dispatch, form } = this.props;
    dispatch({
      type: 'weapp/fetchManagerMpPublishWeapp',
      payload,
      callback: () => {
        form.resetFields(['weapp_template_id', 'version']);
        this.props.form.validateFields((err, values) => {
          this.fetchWeapps({
            page: this.state.page,
            perpage: this.state.perpage,
            ...values,
          });
        });
      },
    });
  };

  /** 小程序回退 */
  fetchManagerMpBackWeapp = data => {
    const { dispatch } = this.props;
    dispatch({
      type: 'weapp/fetchManagerMpBackWeapp',
      data,
      callback: () => {
        this.props.form.validateFields((err, values) => {
          this.fetchWeapps({
            page: this.state.page,
            perpage: this.state.perpage,
            ...values,
          });
        });
      },
    });
  };

  /** 批量操作 */
  handleOperation = flag => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { WEAPPS } = this.props;
        const { list } = WEAPPS;
        // console.log('Received values of form: ', values);
        const { selectedRowKeys } = this.state;
        const weapp_ids = selectedRowKeys.map(key => {
          const find = list.find(v => v.ten_brand_id === key);
          return find ? find.weapp_id : null;
        }).filter(id => Boolean(id));
        const { weapp_template_id } = values;
        switch (flag) {
          case 'batch_publish':
            if (!weapp_template_id) {
              msg('请选择小程序版本号');
              return;
            }
            if (weapp_ids.length <= 0) {
              msg('请选择你要操作的品牌');
              return;
            }

            this.infoMsg('确定要发布所选小程序?', () => {
              this.fetchManagerMpPublishWeapp({
                weapp_template_id, weapp_ids
              });
            });
            break;
          case 'full_publish':
            if (!weapp_template_id) {
              msg('请选择小程序版本号');
              return;
            }
            this.infoMsg('确定要发布所有小程序?', () => {
              this.fetchManagerMpPublishWeapp({
                weapp_template_id, weapp_ids
              });
            });
            break;
          case 'batch_rollback':
            if (weapp_ids.length <= 0) {
              msg('请选择你要操作的品牌');
              return;
            }
            this.infoMsg('确定要回滚所选小程序到上个可用版本?', () => {
              this.fetchManagerMpBackWeapp({
                weapp_ids
              });
            });
            break;
          case 'full_rollback':
            this.infoMsg('确定要回滚所有小程序到上个可用版本?', () => {
              this.fetchManagerMpBackWeapp();
            });
            break;
          case 'batch_undo':
            if (weapp_ids.length <= 0) {
              msg('请选择你要操作的品牌');
              return;
            }
            this.fetchWeappAuditUndo(weapp_ids);
            break;
          case 'full_undo':
            this.fetchWeappAuditUndo();
            break;
          default:
            break;
        }
      }
    });
  };

  infoMsg = (content, callback) => {
    const { loading } = this.props;
    confirm({
      title: '提示',
      okButtonProps: {
        loading: loading['weapp/fetchManagerMpPublishWeapp'],
      },
      content,
      onOk: callback,
    });
  };

  showModal = (record) => {
    if(record.weapp_id) {
      this.fetchWeappDomain(record);
    }else{
      this.setState({
        record,
        visible: true,
      });
    }
  };

  fetchWeappDomain = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'weapp/fetchWeappDomain',
      payload: { weapp_id: record.weapp_id},
      callback: (result) => {
        const config_domains = [{
          key: 'REQUEST',
          domains: result.request || []
        },{
          key: 'UPLOAD',
          domains: result.upload || []
        },{
          key: 'DOWNLOAD',
          domains: result.download || []
        }].filter(v => v.domains.length > 0 );
        this.setState({
          record: {...record, config_domains },
          visible: true,
        });
      },
    });
  }

  hideModal = () => {
    this.setState({ visible: false, record: {} });
  };

  handleModalOk = () => {
    this.hideModal();
  };

  handleWeappModalSubmit = (type, values) => {
    const { record } = this.state;
    const { dispatch, loading } = this.props;
    if (type == 'switch_change') {
      this.setState({
        loadingStr: 'weapp/managerSetManagerBrand',
      });
      const data = { ten_brand_auth_switch: values ? 'SHOW' : 'HIDE', ten_brand_id: record.ten_brand_id, tenant_id: record.tenant_id };
      dispatch({
        type: 'weapp/managerSetManagerBrand',
        data,
        callback: () => {
          this.props.form.validateFields((err, values) => {
            this.fetchWeapps({
              page: this.state.page,
              perpage: this.state.perpage,
              ...values,
            });
          });
        },
      });
    } else if (type == 'public') {
      if (!values.model_version && values.model_version !== 0) {
        msg('请选择小程序模板库!');
        return;
      }
      confirm({
        title: '提示',
        okButtonProps: {
          loading: loading['weapp/fetchManagerMpPublishWeapp'],
        },
        content: '确定要发布小程序！',
        onOk: () => {
          this.setState({
            loadingStr: 'weapp/fetchManagerMpPublishWeapp',
          });
          const payload = {
            weapp_template_id: values.model_version,
            weapp_ids: [record.weapp_id]
          };
          dispatch({
            type: 'weapp/fetchManagerMpPublishWeapp',
            payload,
            callback: () => {
              this.props.form.validateFields((err, values) => {
                this.fetchWeapps({
                  page: this.state.page,
                  perpage: this.state.perpage,
                  ...values,
                });
              });
            },
          });
        },
      });
    } else if(type == 'back') {
      confirm({
        title: '提示',
        okButtonProps: {
          loading: loading['weapp/fetchManagerMpBackWeapp'],
        },
        content: `1.如果没有上一个线上版本，将无法回退\n
        2.只能向上回退一个版本，即当前版本回退后，不能再调用版本回退接口`,
        onOk: () => {
          this.setState({
            loadingStr: 'weapp/fetchManagerMpBackWeapp',
          });
          this.fetchManagerMpBackWeapp({
            weapp_ids: [record.weapp_id]
          });
        },
      });

    } else if (type == 'undo') {
      // 审核撤回
      this.fetchWeappAuditUndo([ record.weapp_id ]);
    } else if (type == 'setWeappDomain') {
      if(record.weapp_id) {
        // 设置域名
        dispatch({
          type: 'weapp/fetchSetWeappDomain',
          payload: { weapp_id: record.weapp_id },
          callback: () => {
            // 重新更新域名
            this.fetchWeappDomain(record);
          }
        });
      }

    }

  };

  // 审核撤回
  fetchWeappAuditUndo = (weapp_ids) => {
    const { dispatch, loading } = this.props;
    confirm({
      title: '提示',
      okButtonProps: {
        loading: loading['weapp/fetchWeappAuditUndo'],
      },
      content: weapp_ids ? '确定要撤回所选小程序的审核提交么？' : '确定要撤回所有小程序的审核提交？',
      onOk: () => {
        this.setState({
          loadingStr: 'weapp/fetchWeappAuditUndo',
        });
        dispatch({
          type: 'weapp/fetchWeappAuditUndo',
          payload: { weapp_ids },
          callback: () => {
            this.props.form.validateFields((err, values) => {
              this.fetchWeapps({
                page: this.state.page,
                perpage: this.state.perpage,
                ...values,
              });
            });
          },
        });
      },
    });
  }

  showDescribe = (value) => {
    const { form, TEMPLATE_LIST } = this.props;
    if (!value) {
      return form.setFieldsValue({
        version: undefined
      });
    };
    const retData = TEMPLATE_LIST.filter(item => item.template_id == value);
    let time = moment(retData[0].create_time * 1000).format('YYYY-MM-DD HH:mm:ss');
    form.setFieldsValue({
      version: `提交者：${retData[0].developer}\n模板版本号：${retData[0].user_version}\n创建时间：${time}\n描述：${retData[0].user_desc}`,
    });
  };

  handleCloseWeappQrcode = () => {
    this.setState({
      isShowQrcode: false,
      weappQrcode: []
    });
  }

  handleShowWeappQrcode = (weapp_id) => {
    const { dispatch } = this.props;
    if(weapp_id) {
      dispatch({
        type: 'weapp/fetchWeappQrcode',
        payload: { weapp_id },
        callback: async (qrcode) => {
          if(qrcode) {
            this.setState({
              isShowQrcode: true,
              weappQrcode: [{src: qrcode, w: 350, h: 350}]
            });
          }else{
            msg('暂无预览');
          }
        },
      });
    }
  }

  // 设置基础库版本（控件默认隐藏起来）
  fetchWeappSupportVersion = () => {
    const { dispatch, form } = this.props;
    dispatch({
      type: 'weapp/fetchWeappSupportVersion',
      payload: { version: form.getFieldValue('weapp_support_version') }
    });
  }

  render() {
    const { selectedRowKeys, visible, record, page, loadingStr, isShowQrcode, weappQrcode } = this.state;

    const { form, loading, WEAPPS, TEMPLATE_LIST } = this.props;
    const { count, list } = WEAPPS;
    const { getFieldDecorator } = form;
    const columns = [
      {
        title: '企业名称',
        dataIndex: 'company_name',
      },
      {
        title: '品牌名',
        dataIndex: 'ten_brand_name',
      },
      {
        title: 'App ID',
        dataIndex: 'weapp_id',
      },
      {
        title: '历史模板ID',
        dataIndex: 'history_template_id',
      },
      {
        title: '线上模板ID',
        dataIndex: 'weapp_template_id',
      },
      {
        title: '升级模板ID',
        dataIndex: 'upgrade_template_id',
      },
      {
        title: '更新时间',
        dataIndex: 'update_time',
      },
      {
        title: '代码更新状态',
        dataIndex: 'weapp_status',
        render: (text, record, index) => {
          switch (text) {
            case 'AUTHORIZED':
              return '已授权';
            case 'SUBMIT-FAIL':
              return <span className="red6">提交失败</span>;
            case 'WAIT-AUDIT':
              return '待审核';
            case 'UNDO-AUDIT':
              return '撤销审核';
            case 'AUDIT-FAIL':
              return <span className="red6">审核失败</span>;
            case 'RELEASE-FAIL':
              return <span className="red6">发布失败</span>;
            case 'RELEASE-SUCC':
              return '发布成功';
            default:
              return '-';
          }
        }
      },
      {
        title: '操作',
        dataIndex: 'company_id',
        render: (text, record, index) => {
          return (
            <>
              <span className={classNames('cur blue6')} value="small" onClick={() => this.showModal(record)}>编辑</span>
              <Divider type="vertical" />
              <span className={classNames('', !record.weapp_id ? 'cur-notAllowed gray' : 'cur blue6' )} value="small" onClick={() => this.handleShowWeappQrcode(record.weapp_id)}>预览</span>
            </>
          );
        },
      },
    ];
    const pagination = {
      total: count,
      current: page,
      pageSize: this.state.perpage,
      showSizeChanger: true,
      onShowSizeChange: (current, perpage) => {
        this.fetchWeapps({
          page: 1,
          perpage
        });
      },
      onChange: (page, pageSize) => {
        this.props.form.validateFields((err, values) => {
          this.fetchWeapps({
            page,
            perpage: this.state.perpage,
            ...values,
          });
        });
      },
      showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`
    };
    const rowSelection = {
      selectedRowKeys,
      onChange: selectedRowKeys => {
        this.setState({ selectedRowKeys });
      },
      getCheckboxProps: record => ({
        disabled: !Boolean(record.weapp_id)
      })
    };
    const tableProps = {
      className: 'm-t-15',
      loading: loading['weapp/fetchWeapps'],
      bordered: true,
      rowSelection,
      rowKey: (record, index) => record.ten_brand_id,
      dataSource: list,
      columns,
      pagination,
    };

    return (
      <Spin spinning={Boolean(loading['weapp/fetchWeappQrcode'])}>
        <Card>
          <Row type="flex" gutter={16} style={{display: 'none'}}>
            <Col>
              <FormItem>基础库版本</FormItem>
            </Col>
            <Col span={6}>
              <FormItem>
                {getFieldDecorator('weapp_support_version')(
                  <Input allowClear />
                )}</FormItem>
            </Col>
            <Col>
              <FormItem><Button type="primary" onClick={this.fetchWeappSupportVersion}>确定</Button></FormItem>
            </Col>
          </Row>
          {/* Form */}
          <Form autoComplete="off">
            <Row type="flex" gutter={16}>
              <Col>
                <FormItem>&emsp;小程序模板库</FormItem>
              </Col>
              <Col span={6}>
                <FormItem>
                  {getFieldDecorator('weapp_template_id')(
                    <Select dropdownMatchSelectWidth={false} placeholder="选择小程序版本" onChange={this.showDescribe}>
                      <Option key="all" value="">全部</Option>
                      {TEMPLATE_LIST.map((item, index) => {
                        return <Option key={index}
                          value={item.template_id}>模板id:{item.template_id}&emsp;模板号:{item.user_version}&emsp;创建时间:{moment(item.create_time * 1000).format('YYYY-MM-DD HH:mm:ss')}</Option>;
                      })}
                    </Select>,
                  )}
                </FormItem>
              </Col>
              <Col>
                <FormItem>
                  <Button type="primary" title="请选择要操作的小程序" disabled={selectedRowKeys.length === 0}
                    onClick={() => this.handleOperation('batch_publish')}
                    loading={loading['weapp/fetchManagerMpPublishWeapp']}>
                    批量发布
                  </Button>
                </FormItem>
              </Col>
              <Col>
                <FormItem>
                  <Button type="primary" onClick={() => this.handleOperation('full_publish')}
                    loading={loading['weapp/fetchManagerMpPublishWeapp']}>
                    全量发布
                  </Button>
                </FormItem>
              </Col>
              <Col>
                <FormItem>
                  <Button type="danger" title="请选择要操作的小程序" disabled={selectedRowKeys.length === 0}
                    onClick={() => this.handleOperation('batch_rollback')}>
                    批量回滚
                  </Button>
                </FormItem>
              </Col>
              <Col>
                <FormItem>
                  <Button type="danger" onClick={() => this.handleOperation('full_rollback')}>
                    全量回滚
                  </Button>
                </FormItem>
              </Col>
              <Col>
                <FormItem>
                  <Button type="danger" ghost title="请选择要操作的小程序" disabled={selectedRowKeys.length === 0}
                    onClick={() => this.handleOperation('batch_undo')}>
                    批量审核撤回
                  </Button>
                </FormItem>
              </Col>
              <Col>
                <FormItem>
                  <Button type="danger" ghost onClick={() => this.handleOperation('full_undo')}>
                    全量审核撤回
                  </Button>
                  <Divider type="vertical" />
                  <Tooltip placement="topRight" title="单个小程序每天审核撤回次数最多不超过 5 次(每天的额度从0点开始生效),一个月不超过 10 次" arrowPointAtCenter>
                    <Icon type="exclamation-circle" />
                  </Tooltip>
                </FormItem>
              </Col>
            </Row>
            <Row type="flex" gutter={16} className={styles.describe}>
              <Col>小程序版本描述</Col>
              <Col style={{ flex: 1 }}>
                {
                  getFieldDecorator(
                    'version',
                  )(
                    <TextArea readOnly rows={5}/>,
                  )
                }
              </Col>
            </Row>
            <Row className={styles.duiqi} type="flex" gutter={12}>

              <Col>
                <Form.Item>
                  &emsp;&emsp;&emsp;&emsp;App ID
                </Form.Item>
              </Col>
              <Col>
                <FormItem>
                  {
                    getFieldDecorator(
                      'weapp_id',
                    )(
                      <Input allowClear className={styles.inputStytle}/>,
                    )
                  }
                </FormItem>

              </Col>
              <Col>
                <Form.Item>
                  企业名称
                </Form.Item>
              </Col>
              <Col>
                {
                  getFieldDecorator(
                    'company_name',
                  )(
                    <Input allowClear className={styles.inputStytle}/>,
                  )
                }
              </Col>
              <Col>
                <Form.Item>
                  品牌名
                </Form.Item>
              </Col>
              <Col>
                {
                  getFieldDecorator(
                    'ten_brand_name',
                  )(
                    <Input allowClear className={styles.inputStytle}/>,
                  )
                }
              </Col>


              <Col>
                <Button type="primary" onClick={this.searchData}>
                  查询
                </Button>
              </Col>
            </Row>
            <Row className={styles.duiqi} type="flex" gutter={12}>
              <Col>
                <Form.Item>
                  &emsp;&emsp;&emsp;是否授权
                </Form.Item>
              </Col>
              <Col span={3}>
                {getFieldDecorator('auth_status',{
                  initialValue : '',
                })(
                  <Select onChange={e=>this.selectEmpower(e)}>
                    <Option key="0" value="">全部</Option>
                    <Option key="1" value="AUTH">已授权</Option>
                    <Option key="2" value="UNAUTH">未授权</Option>
                  </Select>,
                )}
              </Col>
              <Col>
                <Form.Item>
                  审核状态
                </Form.Item>
              </Col>
              <Col span={3}>
                {getFieldDecorator('weapp_status',{
                  initialValue : '',
                })(
                  <Select onChange={e=>this.selectStatus(e)}>
                    <Option key="0" value="">全部</Option>
                    <Option key="1" value="AUTHORIZED">已授权</Option>
                    <Option key="2" value="SUBMIT-FAIL">提交失败</Option>
                    <Option key="3" value="WAIT-AUDIT">待审核</Option>
                    <Option key="4" value="UNDO-AUDIT">撤销审核</Option>
                    <Option key="5" value="AUDIT-FAIL">审核失败</Option>
                    <Option key="6" value="RELEASE-FAIL">发布失败</Option>
                    <Option key="7" value="RELEASE-SUCC">发布成功</Option>
                  </Select>,
                )}
              </Col>
            </Row>
          </Form>
          {/* Form end */}

          <Divider/>

          {/* 品牌列表 */}
          <Row type="flex" justify="space-between">
            <Col className={styles.title}>品牌列表</Col>
          </Row>
          <Table {...tableProps} />
          {/* 品牌列表 end */}

          {/* 管理面板 */}
          <Modal
            destroyOnClose={false}
            title="管理"
            footer={false}
            visible={visible}
            onOk={this.handleModalOk}
            onCancel={this.hideModal}
          >
            <WeappModal isLoading={Boolean(loading[loadingStr])} record={record}
              TEMPLATE_LIST={TEMPLATE_LIST} onSubmit={this.handleWeappModalSubmit}/>
          </Modal>
          {/* 管理面板 end */}

          {/* 小程序码 */}
          <PhotoSwipe isOpen={isShowQrcode} items={weappQrcode} onClose={this.handleCloseWeappQrcode} />
        </Card>
      </Spin>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.loading.effects,
  WEAPPS: state.weapp.WEAPPS,
  TEMPLATE_LIST: state.weapp.TEMPLATE_LIST,
  // ...state.weapp
});
export default connect(mapStateToProps)(Form.create()(Weapp));
