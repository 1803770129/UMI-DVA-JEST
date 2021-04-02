import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Select, Button, Input } from 'antd';
import router from 'umi/router';
import { isEmptyObject } from '@/utils/tools';
const FormItem = Form.Item;
const Option = Select.Option;
const TextArea = Input.TextArea;

class ClientDetail extends Component {

  componentDidMount() {
    // 由于没有单独接口获取详情数据，详情数据从列表存到redux，所以无值时返回列表页
    if(isEmptyObject(this.props.customerInfo)) {
      router.goBack();
    }
  }

    // 提交表单
    handleSubmit = e => {
      e.preventDefault();
      const { form, dispatch, customerInfo } = this.props;
      form.validateFields((err, values) => {
        if (!err) {
          dispatch({ 
            type: 'client_manage_list/updateCustomerInfo',
            payload: {
              ...customerInfo, 
              ...values,
              cb: () => router.goBack()
            }
          });
        } 
      });
    }

    render() {
      const { form, serviceList } = this.props;
      const { getFieldDecorator } = form;

      const formItemLayout = {
        labelCol: { 
          xs: { span: 24 }, sm: { span: 4 } 
        },
        wrapperCol: { 
          xs: { span: 24 }, sm: { span: 16 } 
        }
      };

      const tailFormItemLayout = {
        wrapperCol: {
          xs: { span: 24, offset: 0 }, sm: { span: 16, offset: 4 }
        }
      };

      // 点击开通服务跳转
      const handleRouteToFn = () => router.push('/clientservice/data?app_channel=' + customerInfo.params_app_channel + '&ten_brand_status=' + customerInfo.params_ten_brand_status);

      const customerInfo = formatClientDetailFn(this.props.customerInfo, serviceList);

      return (
        <Card>
          {
            customerInfo && 
                    <Form onSubmit={e => this.handleSubmit(e)}>
                      {/* 客户名称 */}
                      <FormItem {...formItemLayout} label={<strong>客户名称</strong>}>{customerInfo.company_name}</FormItem>
    
                      {/* 所在地 */}
                      <FormItem {...formItemLayout} label={<strong>所在地</strong>}>{customerInfo.provinceCityCountry}</FormItem>
    
                      {/* 联系人 */}
                      <FormItem {...formItemLayout} label={<strong>联系人</strong>}>{customerInfo.contact || ''}</FormItem>
    
                      {/* 联系电话 */}
                      <FormItem {...formItemLayout} label={<strong>联系电话</strong>}>{customerInfo.contact_phone_area_code && `${customerInfo.contact_phone_area_code}-`}{customerInfo.contact_phone || ''}</FormItem>

                      {/* 注册账号 */}
                      <FormItem {...formItemLayout} label={<strong>注册账号</strong>}>{customerInfo.person_phone_area_code && `${customerInfo.person_phone_area_code}-`}{customerInfo.person_phone || ''}</FormItem>
    
                      {/* 类型定义 */}
                      <FormItem {...formItemLayout} label={<strong>类型定义</strong>}>
                        {getFieldDecorator('company_type', {
                          initialValue: customerInfo.company_type,
                        })(
                          <Select style={{ width: 150 }}>
                            <Option value="TENANT">厂家</Option>
                            <Option value="MEMBER">会员</Option>
                          </Select>
                        )}
                      </FormItem>
    
                      {/* 已开通服务 */}
                      <FormItem {...formItemLayout} label={<strong>已开通服务</strong>}>
                        <span className="cur blue6" onClick={() => handleRouteToFn()}>{customerInfo.app_channel}</span>
                      </FormItem>
    
                      {/* 星级 */}
                      <FormItem {...formItemLayout} label={<strong>星级</strong>}>
                        {getFieldDecorator('company_evaluate', {
                          initialValue: customerInfo.company_evaluate
                        })(
                          <Select style={{ width: 150 }} placeholder="0星">
                            <Option value="5">5星</Option>
                            <Option value="4">4星</Option>
                            <Option value="3">3星</Option>
                            <Option value="2">2星</Option>
                            <Option value="1">1星</Option>
                          </Select>
                        )}
                      </FormItem>
    
                      {/* 备注信息 */}
                      <FormItem {...formItemLayout} label={<strong>备注信息</strong>}>
                        {
                          getFieldDecorator('company_desc', {
                            initialValue: customerInfo.company_desc,
                          })(
                            <TextArea rows={4} />
                          )
                        }
                      </FormItem>
    
                      {/* 商户等级 */}
                      <FormItem {...formItemLayout} label={<strong>商户等级</strong>}>
                        {
                          getFieldDecorator('tenant_level', {
                            initialValue: customerInfo.tenant_level,
                          })(
                            <Select style={{ width: 150 }}>
                              <Option value="PROBATION">试用</Option>
                              <Option value="NORMAL">普通</Option>
                            </Select>
                          )
                        }
                      </FormItem>
    
                      {/* 服务状态 */}
                      <FormItem {...formItemLayout} label={<strong>服务状态</strong>}>
                        {
                          getFieldDecorator('tenant_status', {
                            initialValue: customerInfo.tenant_status,
                          })(
                            <Select style={{ width: 150 }}>
                              <Option value="INSERVICE">服务中</Option>
                              <Option value="BANNED">已封禁</Option>
                            </Select>
                          )
                        }
                      </FormItem>
    
                      <FormItem {...tailFormItemLayout}>
                        <Button type="primary" htmlType="submit" className="m-r-15">保存</Button>
                        <Button type="primary" ghost onClick={() => router.goBack()}>返回上一页</Button>
                      </FormItem>
                    </Form>
          }
        </Card>
      );
    }
}

const $id = Form.create()(ClientDetail);
const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.global,
  ...state.client_manage_list
});

export default connect(mapStateToProps)($id);

// 格式化客户详情信息
function formatClientDetailFn(customerInfo, serviceList = []) {
  if(serviceList.length === 0) return;
  const getAppChannelValueFn = app_channel => {
    // 获取开通服务值
    return serviceList.reduce(item => item.app_channel == app_channel).app_channel_name;
  };
  let obj = {};
  obj.provinceCityCountry = '';
  if(customerInfo.province_name && customerInfo.city_name && customerInfo.county_name) {
    obj.provinceCityCountry = customerInfo.province_name + ' ' + customerInfo.city_name + ' ' + customerInfo.county_name + ' ' + customerInfo.address;
  } else {
    if(customerInfo.address) {
      obj.provinceCityCountry = customerInfo.address;
    } else {
      obj.provinceCityCountry = '';
    }
  }
  // 开通服务
  obj.app_channel = getAppChannelValueFn(customerInfo.app_channel, serviceList);
  // 星级
  obj.company_evaluate = customerInfo.company_evaluate == 0 ? '0星' : customerInfo.company_evaluate + '星';
  // 跳转去商户服务要用到的参数
  obj.params_ten_brand_status = customerInfo.tenant_status;
  obj.params_app_channel = customerInfo.app_channel;
  return Object.assign({}, customerInfo, obj);
}