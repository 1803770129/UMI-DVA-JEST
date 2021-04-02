import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Select, Table, Modal, Button, Switch, Row, Col, Tag, Checkbox } from 'antd';
import router from 'umi/router';
import { isEmptyObject } from '@/utils/tools';
import styles from './$id.less';
import classNames from 'classnames';
import ENV from '@/utils/env';
const FormItem = Form.Item;
const Option = Select.Option;
const confirm = Modal.confirm;

class $Id extends Component {

  componentDidMount() {
    const { serviceDataInfo, dispatch } = this.props;
    const { ten_brand_id, tenant_id, ten_brand_type } = serviceDataInfo;
    // 由于没有单独接口获取详情数据，详情数据从列表存到redux，所以无值时返回列表页
    if (isEmptyObject(this.props.serviceDataInfo)) {
      router.goBack();
    } else {
      if (ten_brand_type === 'FACTORY') {
        dispatch({
          type: 'client_service_data_list/fetchTenantCategories',
          payload: { ten_brand_id, tenant_id }
        });
      } else if (ten_brand_type === 'DEALER') {
        dispatch({
          type: 'client_service_data_list/fetchTenantDealerCategories',
          payload: { ten_brand_id, tenant_id }
        });
      }

    }
  }

  // 点击表格的操作
  handleStatusFn = (ten_category_id, brand_category_id, ten_category_approved) => {
    confirm({
      title: '修改之后不可恢复，是否继续？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const { dispatch, serviceDataInfo } = this.props;
        dispatch({
          type: 'client_service_data_list/updateCategoryInfo',
          payload: {
            tenant_id: serviceDataInfo.tenant_id,
            ten_brand_id: serviceDataInfo.ten_brand_id,
            brand_category_id,
            ten_category_id: ten_category_id,
            ten_category_approved,
            cb: () => {
              let newList = null;
              if (ten_category_approved === 'DELETED') {
                newList = serviceDataInfo.ten_brand_categories.filter(item => item.brand_category_id != brand_category_id && item.ten_category_id != ten_category_id);
              } else {
                newList = serviceDataInfo.ten_brand_categories.map(item => {
                  let obj = { ...item };
                  if (item.ten_category_id == ten_category_id) {
                    obj.ten_category_approved = ten_category_approved;
                  }
                  return obj;
                });
              }
              dispatch({
                type: 'client_service_data_list/saveServiceInfo',
                payload: { ...serviceDataInfo, ten_brand_categories: newList }
              });
            }
          }
        });
      }
    });
  }

  // 切换下拉框的操作 (服务状态)
  onChangeStatusFn = ten_brand_status => {
    const { dispatch, serviceDataInfo } = this.props;
    dispatch({
      type: 'client_service_data_list/updateBrandInfo',
      payload: {
        ten_brand_id: serviceDataInfo.ten_brand_id,
        ten_brand_watermark_policy: serviceDataInfo.ten_brand_watermark_policy,
        ten_brand_status,
        tenant_id: serviceDataInfo.tenant_id
      },
      cb: () => {
        dispatch({
          type: 'client_service_data_list/saveServiceInfo',
          payload: { ...serviceDataInfo, ten_brand_status }
        });
      }
    });
  };

  // 切换下拉框的操作 (水印策略)
  onChangeWatermarkPolicyFn = ten_brand_watermark_policy => {
    const { dispatch, serviceDataInfo } = this.props;
    dispatch({
      type: 'client_service_data_list/updateBrandInfo',
      payload: {
        ten_brand_id: serviceDataInfo.ten_brand_id,
        ten_brand_watermark_policy,
        ten_brand_status: serviceDataInfo.ten_brand_status,
        tenant_id: serviceDataInfo.tenant_id
      },
      cb: () => {
        dispatch({
          type: 'client_service_data_list/saveServiceInfo',
          payload: { ...serviceDataInfo, ten_brand_watermark_policy }
        });
      }
    });
  };

  // 更新增值服务
  fetchTenantCategoryServiceUpdate = (ten_category_serv_id, ten_category_serv_status, category_serv_extend = []) => {
    const { dispatch, serviceDataInfo } = this.props;
    const { ten_brand_id, tenant_id } = serviceDataInfo;
    dispatch({
      type: 'client_service_data_list/fetchTenantCategoryServiceUpdate',
      payload: {
        data: { tenant_id, ten_category_serv_id, ten_category_serv_status, indus_brands: category_serv_extend.filter(v => v.selected).map(v => ({ indus_brand_id: v.indus_brand_id, indus_brand_name: v.indus_brand_name })) },
        callback: () => {
          // 更新状态
          dispatch({
            type: 'client_service_data_list/fetchTenantCategories',
            payload: { ten_brand_id, tenant_id }
          });
        }
      }
    });
  }

  // 数据服务品类编辑（代理经销）
  fetchDealerCategoryUpdate = params => {
    const { dispatch } = this.props;
    const { ten_brand_id, tenant_id } = params;
    dispatch({
      type: 'client_service_data_list/fetchDealerCategoryUpdate',
      payload: params,
      callback: () => {
        // 更新状态
        dispatch({
          type: 'client_service_data_list/fetchTenantDealerCategories',
          payload: { ten_brand_id, tenant_id }
        });
      }
    });
  }

  // 品类操作（代理经销）
  handleDealerCategoryApproved = (record, dealer_category_approved) => {
    const { serviceDataInfo } = this.props;
    const { ten_brand_id, tenant_id } = serviceDataInfo;
    const { dealer_category_id, brand_category_id } = record;
    confirm({
      title: '修改之后不可恢复，是否继续？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const params = { ten_brand_id, tenant_id, dealer_category_id, dealer_category_approved, brand_category_id };
        this.fetchDealerCategoryUpdate(params);
      }
    });
  }

  // 变速箱服务 - 更新商户行业码补充服务的品牌
  fetchTenantCategoryServiceIndus = (e, indus_brand, cate, serv) => {
    const { dispatch } = this.props;
    const { checked } = e.target;
    dispatch({
      type: 'client_service_data_list/fetchTenantCategoryServiceIndus',
      payload: {
        ten_category_serv_id: serv.ten_category_serv_id,
        indus_brand_id: indus_brand.indus_brand_id,
        indus_brand_name: indus_brand.indus_brand_name,
        selected: checked
      },
      cate,
      serv
    });
  }

  render() {
    const { serviceDataInfo, brandCategoryDropList } = this.props;

    // ************************ 模态框配置 ***************************
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 }, sm: { span: 4 }
      },
      wrapperCol: {
        xs: { span: 24 }, sm: { span: 16 }
      }
    };

    const formItemLayout1 = {
      labelCol: {
        xs: { span: 24 }, sm: { span: 12 }
      },
      wrapperCol: {
        xs: { span: 24 }, sm: { span: 12 }
      }
    };

    const tailFormItemLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 }, sm: { span: 16, offset: 4 }
      }
    };

    const dataSource = formatCategoryListFn(serviceDataInfo.ten_brand_categories, brandCategoryDropList);
    const dealer_dataSource = serviceDataInfo.ten_brand_categories || [];
    return (
      <Card>
        <Form>
          <Row>
            <Col span={8}>
              {/* 品牌 */}
              <FormItem {...formItemLayout1} label={<span className="c9">品牌</span>}>{serviceDataInfo.ten_brand_name}</FormItem>
            </Col>
            <Col span={16}>
              {/* 品牌 */}
              <FormItem {...formItemLayout} label={<span className="c9">品牌类型</span>}>
                <>
                  {serviceDataInfo.ten_brand_type === 'DEALER' && '代理经销'}
                  {serviceDataInfo.ten_brand_type === 'FACTORY' && '自主生产'}
                </>
              </FormItem>
            </Col>
          </Row>
          {/* 客户名称 */}
          <FormItem {...formItemLayout} label={<span className="c9">客户名称</span>}>{serviceDataInfo.company_name}</FormItem>

          {/* 联系人 */}
          <FormItem {...formItemLayout} label={<span className="c9">联系人</span>}>{serviceDataInfo.contact || ''}</FormItem>

          {/* 联系电话 */}
          <FormItem {...formItemLayout} label={<span className="c9">联系电话</span>}>{serviceDataInfo.contact_phone_area_code && `${serviceDataInfo.contact_phone_area_code}-`}{serviceDataInfo.contact_phone || ''}</FormItem>

          {/* 注册账号 */}
          <FormItem {...formItemLayout} label={<span className="c9">注册账号</span>}>{serviceDataInfo.person_phone_area_code && `${serviceDataInfo.person_phone_area_code}-`}{serviceDataInfo.person_phone || ''}</FormItem>

          {/* 开通服务 */}
          <FormItem {...formItemLayout} label={<span className="c9">开通服务</span>}>{serviceDataInfo.app_channel}</FormItem>

          <Row>
            <Col span={8}>
              {/* 服务状态 */}
              <FormItem {...formItemLayout1} label={<span className="c9">服务状态</span>}>
                <Select
                  style={{ width: 150 }}
                  value={serviceDataInfo.ten_brand_status}
                  onChange={e => this.onChangeStatusFn(e)}
                >
                  <Option value="INSERVICE">服务中</Option>
                  <Option value="BANNED">已封禁</Option>
                </Select>
              </FormItem>
            </Col>

            <Col span={16}>
              {/* 水印策略 */}
              <FormItem {...formItemLayout} label={<span className="c9">水印策略</span>}>
                <Select
                  style={{ width: 150 }}
                  value={serviceDataInfo.ten_brand_watermark_policy}
                  onChange={e => this.onChangeWatermarkPolicyFn(e)}
                >
                  <Option value="OFFICIAL">官方水印</Option>
                  <Option value="CUSTOM">自定义水印</Option>
                </Select>
              </FormItem>
            </Col>
          </Row>

          {/* 开通品类 */}
          <FormItem {...formItemLayout} label={<span className="c9">开通品类</span>}>
            {
              serviceDataInfo.ten_brand_type === 'FACTORY' &&
              dataSource.map(cate => {
                const { ten_category_services = [] } = cate;
                return (
                  <Card className={styles.cate_card} title={
                    <Row type="flex" justify="space-between" className="f12">
                      <Col><span className="c9">配件品类：</span>{cate.brand_category_name}</Col>
                      <Col><span className="c9">申请时间：</span>{cate.create_time}</Col>
                      <Col><span className="c9">开通状态：</span>{cate.ten_category_approved_name}</Col>
                      <Col>
                        <React.Fragment>
                          {
                            cate.ten_category_approved == 'OPENED' && <span className='cur blue6' onClick={() => this.handleStatusFn(cate.ten_category_id, cate.brand_category_id, 'DISABLED')}>禁用</span>
                          }
                          {
                            cate.ten_category_approved == 'DISABLED' && <span className='cur blue6' onClick={() => this.handleStatusFn(cate.ten_category_id, cate.brand_category_id, 'OPENED')}>开通</span>
                          }
                          {
                            cate.ten_category_approved == 'PENDING' &&
                            <React.Fragment>
                              <span className='cur blue6 m-r-10' onClick={() => this.handleStatusFn(cate.ten_category_id, cate.brand_category_id, 'OPENED')}>开通</span>
                              <span className='cur blue6'>|</span>
                              <span className='cur blue6 m-l-10' onClick={() => this.handleStatusFn(cate.ten_category_id, cate.brand_category_id, 'DELETED')}>驳回</span>
                            </React.Fragment>
                          }
                        </React.Fragment>
                      </Col>
                    </Row>
                  } key={cate.brand_category_id}>
                    {
                      ten_category_services.map((serv, idx) => {
                        const { ten_category_serv_id, ten_category_serv_status, ten_category_serv_type, category_serv_extend = [] } = serv;
                        return (
                          <Card.Grid className={styles.card_grid} key={idx}>
                            <Row type="flex" justify="space-between" className={styles.card_grid_row}>
                              <Col><div className={classNames(styles.card_grid_title)}>{ENV.ten_category_serv_types[ten_category_serv_type]}</div></Col>
                              <Col>
                                <>
                                  {
                                    ten_category_serv_status === 'NONE' && <span className="red3">未申请</span>
                                  }
                                  {/*  "ten_category_serv_status":"服务状态: PENDING 待审核;APPROVED 已审核开通;STOP 已停止服务;NONE 未申请", */}
                                  {
                                    ten_category_serv_status === 'PENDING' &&
                                    <Button type="primary" size="small" onClick={() => this.fetchTenantCategoryServiceUpdate(ten_category_serv_id, 'APPROVED', category_serv_extend)}>审核通过</Button>
                                  }
                                  {
                                    ten_category_serv_status !== 'PENDING' && ten_category_serv_status !== 'NONE' &&
                                    <Switch checkedChildren="已开通" unCheckedChildren="已停止" checked={ten_category_serv_status === 'APPROVED' ? true : false} onChange={checked => this.fetchTenantCategoryServiceUpdate(ten_category_serv_id, checked ? 'APPROVED' : 'STOP', category_serv_extend)} />
                                  }
                                </>
                              </Col>
                            </Row>
                            {
                              // 行业配件补充服务
                              ten_category_serv_type === 'SERV_INDUS_PART' &&
                              <div className="m-t-5">

                                {
                                  category_serv_extend.map(v => {
                                    return (
                                      <span key={v.indus_brand_id} style={{ marginBottom: 8, display: 'inline-block' }}>
                                        <label>
                                          <Tag style={{ minWidth: 140 }}>
                                            {
                                              // 变速箱显示出行业品牌
                                              cate.brand_category_code === 'gearbox_service' ? <Checkbox disabled={ten_category_serv_status === 'STOP'} checked={v.selected} value={v.indus_brand_id} onChange={e => this.fetchTenantCategoryServiceIndus(e, v, cate, serv)}>{v.indus_brand_name}</Checkbox> : <>{v.indus_brand_name}</>
                                            }
                                          </Tag>
                                        </label>
                                      </span>

                                    );
                                  })
                                }

                              </div>
                            }

                          </Card.Grid>
                        );
                      })
                    }
                  </Card>
                );
              })
            }

            {
              serviceDataInfo.ten_brand_type === 'DEALER' &&
              dealer_dataSource.map(v => {
                const { agent_brands = [] } = v;
                const _dataSource = agent_brands.map(brand => ({ ...brand, brand_category_id: v.brand_category_id }));
                const dealerColumns = [
                  {
                    title: <>配件品类：<span className="c3">{v.brand_category_name}</span></>,
                    dataIndex: 'brand_category_name',
                    render: (text, record, index) => {
                      const { ten_brand_name, company_name, create_time, agent_ten_category_approved, dealer_category_approved } = record;
                      // 品牌商的审核状态
                      let ten_status = '';
                      if (agent_ten_category_approved == 'OPENED') {
                        ten_status = '（服务中）';
                      } else if (agent_ten_category_approved == 'STOPPED') {
                        ten_status = '（数据服务已停止）';
                      } else if (agent_ten_category_approved == 'PENDING') {
                        ten_status = '（开通申请审核中）';
                      }
                      return (
                        <Row type="flex" justify="space-between">
                          <Col span={10}>{ten_brand_name} - {company_name} <span className="c9">{ten_status}</span></Col>
                          <Col span={6}><span className="c9">申请时间：</span>{create_time}</Col>
                          <Col>
                            <>
                              {
                                dealer_category_approved == 'PENDING' &&
                                <>
                                  <span className="cur link" onClick={() => this.handleDealerCategoryApproved(record, 'OPENED')}>开通</span>
                                  <span className="m-l-10 cur link" onClick={() => this.handleDealerCategoryApproved(record, 'DELETED')}>驳回</span>
                                </>
                              }
                              {
                                dealer_category_approved == 'OPENED' &&
                                <>
                                  <span>已开通</span>
                                  <span className="m-l-10 cur link" onClick={() => this.handleDealerCategoryApproved(record, 'DISABLED')}>禁用</span>
                                </>
                              }
                              {
                                dealer_category_approved == 'DISABLED' &&
                                <>
                                  <span>已禁用</span>
                                  <span className="m-l-10 cur link" onClick={() => this.handleDealerCategoryApproved(record, 'OPENED')}>开通</span>
                                </>
                              }
                            </>
                          </Col>
                        </Row>
                      );
                    }
                  }
                ];
                return (
                  <div key={v.brand_category_id}>
                    <Table
                      className='m-t-15'
                      bordered={true}
                      dataSource={_dataSource}
                      columns={dealerColumns}
                      rowKey={(item, index) => index}
                      pagination={false}
                    />
                  </div>
                );
              })

            }


          </FormItem>

          <FormItem {...tailFormItemLayout}>
            <Button type="primary" ghost onClick={() => router.goBack()}>返回上一页</Button>
          </FormItem>
        </Form>
      </Card>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.client_service_data_list
});

export default connect(mapStateToProps)($Id);

// 获取品类名称
const getCategoryNameValueFn = (brand_category_id, list) => {
  let name = null;
  let result = list.find(item => item.brand_category_id == brand_category_id);
  if (result) name = result.brand_category_name;
  return name;
};

// 格式化开通品类表格数据
function formatCategoryListFn(list = [], brandCategoryDropList) {
  const ten_category_approved_name = {
    'PENDING': '待审核',
    'DISABLED': '已禁用',
    'OPENED': '已开通'
  };
  return list.map(item => {
    let obj = { ...item };
    obj.brand_category_id = item.brand_category_id;
    // 配件品类
    obj.brand_category_name = getCategoryNameValueFn(item.brand_category_id, brandCategoryDropList);
    // 开通状态
    obj.ten_category_approved_name = ten_category_approved_name[item.ten_category_approved];
    return obj;
  });
}
