import React from 'react';
import { Form, Row, Col, Select, Button, DatePicker, Input } from 'antd';
import InputClose from '@/components/InputClose';
import styles from './IndexSearchForm.less';

const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: {
    xxl: { span: 8 }, xl: { span: 10 }
  },
  wrapperCol: {
    xxl: { span: 16 }, xl: { span: 14 }
  }
};

const formItemLayout_A = {
  labelCol: {
    xxl: { span: 4 }, xl: { span: 5 }
  },
  wrapperCol: {
    xxl: { span: 20 }, xl: { span: 19 }
  }
};



const SearchForm = ({ form, searchFields, brandCategorys, onSubmitFn, onChangeSearch }) => {

  const { getFieldDecorator, validateFields, getFieldValue, setFieldsValue } = form;

  const handleSubmitFn = e => {
    // e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        onSubmitFn(values);
      }
    });
  };
  const handelChangeInput = e => {
    const value = e.target.value;
    if(!value) {
      // 清除时更新一次value，否则validateFields不准确
      setFieldsValue({ keywords: value });
    }
    onChangeSearch('keywords', value);
  };
  return (
    <Form autoComplete="off">
      <Row type="flex" gutter={8}>
        <Col span={5}>
          <FormItem label="品牌类型" {...formItemLayout}>
            {
              getFieldDecorator('ten_brand_type', {
                initialValue: searchFields.ten_brand_type
              })(
                <Select placeholder="请选择" onChange={e => onChangeSearch('ten_brand_type', e)}>
                  <Option key="FACTORY">自主生产</Option>
                  <Option key="DEALER">代理经销</Option>
                </Select>
              )
            }
          </FormItem>
        </Col>
        <Col span={5}>
          <FormItem label="品牌件品类" {...formItemLayout}>
            {
              getFieldDecorator('brand_category_id', {
                initialValue: searchFields.brand_category_id
              })(
                <Select
                  placeholder="请选择"
                  onChange={e => onChangeSearch('brand_category_id', e)}
                >
                  <Option value="ALL">全部</Option>
                  {
                    brandCategorys.map(item => {
                      return <Option key={item.brand_category_id} value={item.brand_category_id}>{item.brand_category_name}</Option>;
                    })
                  }
                </Select>
              )
            }
          </FormItem>
        </Col>
        <Col span={5}>
          <FormItem label="开通申请" {...formItemLayout}>
            {
              getFieldDecorator('ten_category_approved', {
                initialValue: searchFields.ten_category_approved
              })(
                <Select
                  placeholder="请选择"
                  onChange={e => onChangeSearch('ten_category_approved', e)}
                >
                  <Option key='ALL'>全部</Option>
                  <Option key="PENDING">待审核</Option>
                  <Option key="OPENED">已开通</Option>
                  <Option key="DISABLED">已禁用</Option>
                </Select>
              )
            }
          </FormItem>
        </Col>
        <Col span={9}>
          <Row type="flex" align="middle" className={styles.time_content}>
            <Col className="m-l-15">申请时间：</Col>
            <Col>
              <FormItem label="">
                {
                  getFieldDecorator('start_time', {
                    initialValue: searchFields.start_time
                  })(
                    <DatePicker style={{ width: 140 }} placeholder="选择开始时间" onChange={(date, dateString) => onChangeSearch('start_time', dateString)} />
                  )
                }
              </FormItem>
            </Col>
            <Col>
              <FormItem label="">
                {
                  getFieldDecorator('end_time', {
                    initialValue: searchFields.end_time
                  })(
                    <DatePicker style={{ width: 140 }} placeholder="选择结束时间" onChange={(date, dateString) => onChangeSearch('end_time', dateString)} />
                  )
                }
              </FormItem>
            </Col>
          </Row>
        </Col>
        <Col span={5}>
          <FormItem label="服务状态" {...formItemLayout}>
            {
              getFieldDecorator('ten_brand_status', {
                initialValue: searchFields.ten_brand_status
              })(
                <Select
                  showSearch
                  placeholder="请选择"
                  onChange={e => onChangeSearch('ten_brand_status', e)}
                >
                  <Option key="ALL">全部</Option>
                  <Option key="INSERVICE">服务中</Option>
                  <Option key="BANNED">已封禁</Option>
                </Select>
              )
            }
          </FormItem>
        </Col>
        <Col span={10}>
          <FormItem label="关键字搜索" {...formItemLayout_A}>
            {
              getFieldDecorator('keywords', {
                initialValue: searchFields.keywords
              })(
                <div>
                  <Input placeholder={'可输入商户名称/联系人/手机号/品牌查询'} allowClear onChange={handelChangeInput} />
                </div>
              )
            }
          </FormItem>
        </Col>
        <Col span={9}>
          <FormItem>
            <Button type="primary" style={{ marginLeft: 15 }} onClick={handleSubmitFn}>搜索</Button>
          </FormItem>
        </Col>

      </Row>
    </Form>
  );
};

const IndexSearchForm = Form.create()(SearchForm);
export default IndexSearchForm;