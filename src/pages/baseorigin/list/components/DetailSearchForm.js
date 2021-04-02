import React from 'react';
import { Row, Button, Form, Cascader } from 'antd';
import InputClose from 'components/InputClose';
const FormItem = Form.Item;

// 搜索表单
const searchForm = props => {
  const { dispatch, form, carmodelApprovedList, handleSubmit, fields } = props;
  const { getFieldDecorator, validateFields, setFieldsValue, getFieldValue } = form;

  // 车型搜索过滤
  const handleCarmodelFilter = (inputValue, selectedOptions) => selectedOptions.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase().trim()) > -1);
    
  // 车型筛选配置
  const carmodelSelectConfig = {
    style: { minWidth: 400 },
    placeholder: '选择品牌/主机厂/车型',
    showSearch: { filter: handleCarmodelFilter, limit: false },
    changeOnSelect: true,
    fieldNames: { label: 'label', value: 'v', children: 'c' }
  };

  const onSubmit = e => {
    e.preventDefault();
    validateFields(async (err, values) => {
      if (!err) {
        await dispatch({ type: 'baseorigin_id/updateState', payload: { fields: values } });
        handleSubmit(values);
      }
    });
  };

  return (
    <Form layout="inline" onSubmit={onSubmit}>
      <Row>
        <span className="search-form-cascader">
          <FormItem label="车型">
            {getFieldDecorator('cm_carmodel', {initialValue: fields['cm_carmodel']})(<Cascader options={carmodelApprovedList} {...carmodelSelectConfig} />)}
          </FormItem>
        </span>
        <span className="search-form-input">
          <FormItem label="年款">
            {getFieldDecorator('cm_model_year', { initialValue: fields['cm_model_year'] })(
              <div style={{width: 80}}><InputClose onClear={ () => setFieldsValue({'cm_model_year': ''}) } field={getFieldValue('cm_model_year')} /></div>
            )}
          </FormItem>
          <FormItem label="排量">
            {getFieldDecorator('cm_displacement', { initialValue: fields['cm_displacement'] })(
              <div style={{width: 80}}><InputClose onClear={ () => setFieldsValue({'cm_displacement': ''}) } field={getFieldValue('cm_displacement')} /></div>
            )}
          </FormItem>
          <FormItem label="发动机型号">
            {getFieldDecorator('cm_engine_model', { initialValue: fields['cm_engine_model'] })(
              <div style={{width: 100}}><InputClose onClear={ () => setFieldsValue({'cm_engine_model': ''}) } field={getFieldValue('cm_engine_model')} /></div>
            )}
          </FormItem>
          <FormItem label="变速箱类型（手动，自动）">
            {getFieldDecorator('cm_trans_type', { initialValue: fields['cm_trans_type'] })(
              <div style={{width: 100}}><InputClose onClear={ () => setFieldsValue({'cm_trans_type': ''}) } field={getFieldValue('cm_trans_type')} /></div>
            )}
          </FormItem>
          <FormItem><Button type="primary" htmlType="submit">搜索</Button></FormItem>
        </span>
      </Row>
    </Form>
  );
};

export default searchForm;