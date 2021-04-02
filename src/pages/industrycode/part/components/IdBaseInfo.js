import React from 'react';
import { Row, Col, Form, Input, Select, Button, Tag, Modal } from 'antd';
import styles from './IdBaseInfo.less';
const confirm = Modal.confirm;
const Option = Select.Option;
const FormItem = Form.Item;

export default props => {
  const { isAdd, form, postFields, INDUS, CATEGORY_TREE, INDUS_PARTS, vaildCodeStatus, vaildCodeHelp, onHandleInputCodeFn, updatePostFieldsFn, onChangeSelect } = props;
  const { categorys } = INDUS_PARTS;
  
  const { partsku_codes = [] } = postFields;
  const { getFieldDecorator, getFieldValue, setFieldsValue } = form;

  // 点击添加大厂编码
  const handleAddCode = () => {
    onHandleInputCodeFn(getFieldValue('indus_partsku_code'), () => {
      setFieldsValue({ 'indus_partsku_code': '' });
    });
  };

  // 点击移除大厂编码
  const handleTagCloseFn = (e, val) => {
    e.preventDefault(); // 默认动作会帮忙从视觉上移除，所以需要阻止
    confirm({
      content: '移除后不可恢复，是否继续？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => updatePostFieldsFn({ partsku_codes: partsku_codes.filter(item => item.indus_partsku_code != val) })
    });
  };
  return (
    <div className={styles.infoRow}>
      <Row type="flex" gutter={16}>
        <Col>
          <FormItem label="品类">
            {
              getFieldDecorator('brand_category_id', {
                rules: [{ required: true, message: '必填项' }],
                initialValue: postFields.brand_category_id
              })(
                <Select
                  style={{ width: 200 }}
                  disabled={!isAdd}
                  placeholder="请选择品类"
                  onChange={e => onChangeSelect('brand_category_id', e, form)}
                >
                  {
                    CATEGORY_TREE.map(item => (
                      <Option key={item.category_id} value={item.category_id}>
                        {item.title}
                      </Option>
                    ))
                  }
                </Select>
              )
            }
          </FormItem>
        </Col>
        <Col>
          <FormItem label="行业协会">
            {
              getFieldDecorator('indus_brand_id', {
                rules: [{ required: true, message: '必填项' }],
                initialValue: postFields.indus_brand_id
              })(
                <Select
                  style={{ width: 200 }}
                  disabled={!isAdd}
                  placeholder="请选择品牌"
                  onChange={e => onChangeSelect('indus_brand_id', e, form)}
                >
                  {
                    INDUS.map(item => (
                      <Option key={item.indus_brand_id} value={item.indus_brand_id}>{item.indus_brand_name}</Option>
                    ))
                  }
                </Select>
              )
            }
          </FormItem>
        </Col>
        <Col>
          <FormItem label="产品">
            {
              getFieldDecorator('indus_part_id', {
                rules: [{ required: true, message: '必填项' }],
                initialValue: postFields.indus_part_id
              })(
                <Select
                  style={{ width: 200 }}
                  placeholder="请选择产品"
                  disabled={!isAdd}
                  onChange={e => onChangeSelect('indus_part_id', e, form)}
                >
                  {
                    categorys.map(item => (
                      <Option key={item.indus_part_id} value={item.indus_part_id}>
                        {item.title}
                      </Option>
                    ))
                  }
                </Select>
              )
            }
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col>
          <FormItem label="行业协会编码" validateStatus={vaildCodeStatus} help={vaildCodeHelp}>
            {
              getFieldDecorator('indus_partsku_code', {
                initialValue: '',
              })(
                <Input
                  placeholder="请填写编码"
                  style={{ width: 200 }}
                  disabled={!getFieldValue('indus_brand_id') || !getFieldValue('brand_category_id') || !getFieldValue('indus_part_id') }
                />
              )
            }
            <Button type="primary" className="m-l-5 m-r-10" onClick={handleAddCode} disabled={!getFieldValue('indus_partsku_code')}>添加</Button>
            {
              partsku_codes.map((item, index) => {
                return <Tag key={item.indus_partsku_code_id} closable={true} color={item.indus_partsku_code_id.indexOf('time-') !== -1 ? 'red' : 'green'} onClose={e => handleTagCloseFn(e, item.indus_partsku_code)}>{item.indus_partsku_code}</Tag>;
              }) // 带【time-】前缀的是时间戳，表示是新增的，显示红色，否则显示绿色
            }
          </FormItem>
        </Col>
      </Row>
    </div>
  );
};