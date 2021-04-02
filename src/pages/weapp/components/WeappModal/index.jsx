import React, { useState, useCallback } from 'react';
import { Form, Select, Button, Input, Divider, Switch, Spin } from 'antd';
import styles from './index.less';
import moment from 'moment';
import { connect } from 'dva';

const { Option } = Select;

const WeappModal = ({ loading, isLoading, form, record, TEMPLATE_LIST, onSubmit }) => {
  const [ domainListVisible, setDomainListVisible ] = useState(false);
  const { config_domains = [] } = record;
  const isdisable = Boolean(record.weapp_id);
  const { getFieldDecorator, getFieldsValue } = form;
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };

  let submitStatus = '';

  switch (record.weapp_status) {
    case 'AUTHORIZED':
      submitStatus = '已授权';
      break;
    case 'SUBMIT-FAIL':
      submitStatus = '提交失败';
      break;
    case 'WAIT-AUDIT':
      submitStatus = '待审核';
      break;
    case 'UNDO-AUDIT':
      submitStatus = '撤销审核';
      break;
    case 'AUDIT-FAIL':
      submitStatus = '审核失败';
      break;
    case 'RELEASE-FAIL':
      submitStatus = '发布失败';
      break;
    case 'RELEASE-SUCC':
      submitStatus = '发布成功';
      break;
    default:
      submitStatus = '-';
  }

  let btuBackDisabled = true;
  let btuSubmitDisabled = true;
  let btuUndoDisabled = true;
  if (['AUTHORIZED', 'SUBMIT-FAIL', 'UNDO-AUDIT', 'AUDIT-FAIL', 'RELEASE-SUCC'].includes(record.weapp_status) && isdisable){
    // 可以发布
    btuSubmitDisabled = false;
  }
  if (record.weapp_status == 'RELEASE-SUCC' && isdisable &&
    (record.history_template_id !== record.weapp_template_id) && record.history_template_id !== 0) {
    // 可以回退
    btuBackDisabled = false;
  }
  if( record.weapp_status === 'WAIT-AUDIT') {
    // 可以撤销审核
    btuUndoDisabled = false;
  }

  const handleBack = () => {
    onSubmit('back', getFieldsValue());
  };

  const handlePublic = () => {
    onSubmit('public', getFieldsValue());
  };

  const handleUndo = () => {
    onSubmit('undo', getFieldsValue());
  };

  const handleSetWeappDomain = () => {
    onSubmit('setWeappDomain', getFieldsValue());
  };

  const viewDomainList = useCallback(() => {
    setDomainListVisible(visible => {
      return !visible;
    });
  }, []);

  return (
    <Spin spinning={isLoading}>
      <Form className={styles.form} {...formItemLayout}>
        <div style={{height: 550, overflowY: 'auto', paddingRight: 15}}>
          <Form.Item label="企业名称">
            {getFieldDecorator('company_name', {
              initialValue: record.company_name,
            })(<Input readOnly/>)}
          </Form.Item>
          <Form.Item label="品牌名">
            {getFieldDecorator('ten_brand_name', {
              initialValue: record.ten_brand_name,
            })(<Input readOnly/>)}
          </Form.Item>
          <Form.Item label="App ID">
            {getFieldDecorator('weapp_id', {
              initialValue: record.weapp_id,
            })(<Input className={styles.font_color} readOnly/>)}
          </Form.Item>
          <Form.Item label="历史模板ID">
            {getFieldDecorator('history_template_id', {
              initialValue: record.history_template_id,
            })(<Input readOnly/>)}
          </Form.Item>
          <Form.Item label="线上模板ID">
            {getFieldDecorator('weapp_template_id', {
              initialValue: record.weapp_template_id,
            })(<Input readOnly/>)}
          </Form.Item>
          <Form.Item label="升级模板ID">
            {getFieldDecorator('upgrade_template_id', {
              initialValue: record.upgrade_template_id,
            })(<Input readOnly/>)}
          </Form.Item>
          <Form.Item label="代码更新状态">
            {getFieldDecorator('ten_brand_client_name', {
              initialValue: submitStatus,
            })(<Input readOnly/>)}
          </Form.Item>
          <Form.Item label="设置小程序域名">
            <Button type="primary" size="small" disabled={loading['weapp/fetchSetWeappDomain'] || !isdisable} onClick={handleSetWeappDomain}>点击设置域名</Button>
            <Divider type="vertical" />
            <Button type="primary" ghost size="small" onClick={viewDomainList}>{domainListVisible ? '隐藏' : '显示'}域名列表</Button>
          </Form.Item>

          {
            domainListVisible &&
            <Form.Item label="小程序域名">
              <div style={{lineHeight: '1.5'}}>
                {
                  config_domains.length > 0 && config_domains.map(v => {
                    return (
                      <div key={v.key} className="m-t-5">
                        <div><strong>{v.key}</strong></div>
                        {v.domains.map(domain =>  <div key={domain}>{domain}</div>)}
                      </div>
                    );
                  })
                }
                {
                  config_domains.length === 0 &&
                  '暂未设置域名'
                }
              </div>
            </Form.Item>
          }

          <Form.Item label="授权链接开关">
            {getFieldDecorator('ten_brand_auth_switch', {
              valuePropName: 'checked',
              initialValue: record.ten_brand_auth_switch === 'SHOW'
            })(<Switch disabled={isdisable} onChange={(value) => onSubmit('switch_change', value)}/>)}
          </Form.Item>
          <Form.Item label="小程序模板库">
            {getFieldDecorator('model_version',
            )(
              <Select placeholder="选择小程序版本">
                {TEMPLATE_LIST.map((item) => {
                  return <Option key={item.template_id}
                    value={item.template_id}>模板id:{item.template_id}&emsp;模板号:{item.user_version}&emsp;创建时间:{moment(item.create_time * 1000).format('YYYY-MM-DD HH:mm:ss')}</Option>;
                })}
              </Select>,
            )}
          </Form.Item>
        </div>
        <div className="text-center">
          <Button type="primary"  title="代码处理中不可以操作" disabled={btuSubmitDisabled} onClick={handlePublic}>
            发布
          </Button>
          <Divider type="vertical"/>
          <Button type="danger" title="代码处理中不可以操作" disabled={btuBackDisabled} onClick={handleBack}>
            回滚
          </Button>
          <Divider type="vertical"/>
          <Button type="danger" title="代码处理中不可以操作" disabled={btuUndoDisabled} onClick={handleUndo}>
            撤销审核
          </Button>
        </div>
      </Form>
    </Spin>
  );
};

const mapStateToProps = state => ({
  loading: state.loading.effects
});

export default connect(mapStateToProps)(Form.create()(WeappModal));
