import React, { memo, useState, useEffect } from 'react';
import { Modal, Form, Select, Button, Divider } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 20,
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    span: 20,
    offset: 4,
  },
};

const CopyModal = ({ form, visible, BRAND_CATEGORY, curCategoryId, onOk, onCancel }) => {
  // console.log(BRAND_CATEGORY);
  const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
  const [parts, setParts] = useState([]);
  const brand_category_id = getFieldValue('brand_category_id');
  const category_id = getFieldValue('category_id');

  const handleOk = () => {
    const category = parts.find(v => v.category_id === category_id);
    const brand_category = BRAND_CATEGORY.find(v => v.brand_category_id === brand_category_id);
    if(category && brand_category) {
      onOk(category_id, category.category_name, brand_category.brand_category_name);
    }
    
  };
  const handleCancel = () => {
    setParts([]);
    onCancel();
  };

  const handleChangeBrandCate = value => {
    const brandCategory = BRAND_CATEGORY.find(v => v.brand_category_id === value);
    const parts = brandCategory ? brandCategory.parts : [];
    setParts(parts);
  };

  useEffect(() => {
    if(BRAND_CATEGORY.length > 0) {
      // 默认选择首个品类 
      handleChangeBrandCate(BRAND_CATEGORY[0].brand_category_id);
      // 默认选择当前产品
      setFieldsValue({ category_id: curCategoryId });
    }
  }, [BRAND_CATEGORY]);
  
  return (
    <Modal
      title="复制此标准码"
      visible={visible}
      onOk={onOk}
      onCancel={handleCancel}
      width={350}
      footer={null}
      destroyOnClose
    >
      <Form autoComplete="off" {...formItemLayout}>
        <FormItem label="品类" style={{ marginBottom: 10 }}>
          {getFieldDecorator('brand_category_id', {
            initialValue: BRAND_CATEGORY[0] ? BRAND_CATEGORY[0].brand_category_id : '',
            rules: [{ required: true, message: '必填项' }],
          })(
            <Select placeholder="请选择" onChange={handleChangeBrandCate}>
              {BRAND_CATEGORY.map(v => (
                <Option key={v.brand_category_id} value={v.brand_category_id}>
                  {v.brand_category_name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem label="产品" style={{ marginBottom: 10 }}>
          {getFieldDecorator('category_id', {
            initialValue: undefined,
            rules: [{ required: true, message: '必填项' }],
          })(
            <Select placeholder="请选择" showSearch filterOption={(value, option) => option.props.children.toLowerCase().indexOf(value.toLowerCase()) >= 0}>
              {parts.map(v => (
                <Option key={v.category_id} value={v.category_id}>
                  {v.category_name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <Form.Item {...tailFormItemLayout}>
          <Button type="primary" onClick={handleOk} disabled={!brand_category_id || !category_id}>
            确定
          </Button>
          <Divider type="vertical" />
          <Button onClick={onCancel}>取消</Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Form.create()(CopyModal);
