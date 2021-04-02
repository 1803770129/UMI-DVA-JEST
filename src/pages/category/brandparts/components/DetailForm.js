import React from 'react';
import { Row, Col, Form, Input, Switch } from 'antd';
import styles from '../$id.less';
const FormItem = Form.Item;
const { TextArea } = Input;

const TopForm = props => {

  const {
    form,
    isAdd,
    fields,
    onChangeCategoryStatusFn,
    onVaildCategoryNameFn,
    onVaildCategoryCodeFn,
    onChangeIconfontVisibleFn,
    onChangeUpdateBrandCategoryImptDesc
  } = props;
  const { getFieldDecorator, getFieldValue } = form;

  return (
    <>
      <Row type="flex" justify="space-between">
        <Col className={styles.formItemContainer}>
          <FormItem label="品类logo">
            {
              // 有值
              fields.brand_category_image &&
              <span className={'cur sopei_category sopei_category-' + fields.brand_category_image} style={{ fontSize: 36 }} onClick={() => onChangeIconfontVisibleFn(true)}></span>
            }
            {
              // 无值
              fields.brand_category_image == '' &&
              <span className="cur blue6" onClick={() => onChangeIconfontVisibleFn(true)}>请选择零件图片</span>
            }
          </FormItem>
          <FormItem label="品类名称" validateStatus={fields.brand_category_name_error} help={fields.brand_category_name_help}>
            {
              getFieldDecorator('brand_category_name', {
                initialValue: fields.brand_category_name,
                rules: [{ required: true, whitespace: true, message: '必填项' }]
              })(
                <Input placeholder="输入品类名称" style={{ width: 150 }} onBlur={() => { onVaildCategoryNameFn(); }} disabled={!isAdd} autocomplete="off" />
              )
            }
          </FormItem>
          <FormItem label="品类编码" validateStatus={fields.brand_category_code_error} help={fields.brand_category_code_help}>
            {
              getFieldDecorator('brand_category_code', {
                initialValue: fields.brand_category_code,
                rules: [{ required: true, whitespace: true, message: '必填项' }]
              }
              )(
                <Input placeholder="输入品类编码" style={{ width: 150 }} onBlur={() => { onVaildCategoryCodeFn(); }} disabled={!isAdd} autocomplete="off" />
              )
            }
          </FormItem>
          <FormItem label="启用状态">
            {
              getFieldDecorator('brand_category_status', { initialValue: fields.brand_category_status == 'ENABLE' ? true : false })(
                <Switch
                  checkedChildren='开'
                  unCheckedChildren='关'
                  disabled={isAdd}
                  checked={fields.brand_category_status == 'ENABLE' ? true : false}
                  onChange={checked => { onChangeCategoryStatusFn(checked); }}
                />
              )
            }
          </FormItem>
        </Col>

      </Row>
      <Row>
        <Col>
          {
            getFieldDecorator('brand_category_impt_desc', {
              initialValue: fields.brand_category_impt_desc
            })(
              <TextArea placeholder="输入适配编码模板说明" rows={4} onBlur={() => onChangeUpdateBrandCategoryImptDesc(getFieldValue('brand_category_impt_desc'))}/>
            )
          }
        </Col>
      </Row>
    </>
  );
};

export default TopForm;