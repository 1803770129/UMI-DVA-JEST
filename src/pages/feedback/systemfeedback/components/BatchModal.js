import React from 'react';
import { Divider, Form, Button, Input, Radio, Modal } from 'antd';
import styles from './BatchModal.less';
const FormItem = Form.Item;
const { TextArea } = Input;
const RadioGroup = Radio.Group;

// 批量处理模态框
const BatchModal = ({ form, visible, onOk, onCancel }) => {
  const { getFieldDecorator, validateFields } = form;
  const handleSubmit = e => {
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        onOk(values);
      }
    });
  };

  return (
    <Modal destroyOnClose title="批量处理" visible={visible} footer={null} onCancel={onCancel}>
      <Form autoComplete="off" className={styles.batch_modal}>
        <FormItem>
          {getFieldDecorator('process_content', {
            initialValue: '',
            rules: [
              { message: '必填项', required: true }
            ]
          })(
            <TextArea placeholder="请填写反馈回复内容！" maxLength={100} rows={3} />
          )}

        </FormItem>
        <FormItem label="处理状态" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
          {getFieldDecorator('status', {
            initialValue: 'OVER',
            rules: [{ required: true }]
          })(
            <RadioGroup>
              <Radio value="OVER">已处理</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem className="text-center">
          <Button type="primary" onClick={handleSubmit}>确定</Button>
          <Divider type="vertical" style={{ marginLeft: 10, marginRight: 10 }} />
          <Button onClick={onCancel}>取消</Button>
        </FormItem>
      </Form>
    </Modal>
  );
};

export default Form.create()(BatchModal);
