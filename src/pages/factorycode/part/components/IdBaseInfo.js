import React from 'react';
import { Row, Col, Form, Input, Select, Button, Tag, Modal } from 'antd';
import styles from './IdBaseInfo.less';
const confirm = Modal.confirm;
const Option = Select.Option;
const FormItem = Form.Item;

export default props => {
  const {
    isAdd,
    form,
    postFields,
    fmsBrandsDropList,
    fmsCategoriesDropList,
    fmsPartsDropList,
    vaildCodeStatus,
    vaildCodeHelp,
    onChangeFmsBrandDropListFn,
    onChangeFmsCategoryDropListFn,
    onChangeFmsPartFn,
    onHandleInputCodeFn,
    updatePostFieldsFn
  } = props;

  const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
  const { partsku_codes = [], fms_brand_id, fms_part_id, brand_category_id } = postFields;

  
  // 切换品类
  const changeFmsCategoryFn = _brand_category_id => {
    onChangeFmsCategoryDropListFn(_brand_category_id);
    setFieldsValue({ fms_brand_id: undefined, fms_part_id: undefined });
  };
  
  // 切换品牌
  const changeFmsBrandFn = _fms_brand_id => {
    onChangeFmsBrandDropListFn(getFieldValue('brand_category_id'), _fms_brand_id);
    setFieldsValue({ fms_part_id: undefined });
  };
  // 切换产品
  const changeFmsPartFn = _fms_part_id => {
    onChangeFmsPartFn(getFieldValue('brand_category_id'), getFieldValue('fms_brand_id'), _fms_part_id);
  };

  // 点击添加大厂编码
  const handleAddCodeFn = () => {
    onHandleInputCodeFn(getFieldValue('fms_partsku_code'), () => {
      setFieldsValue({ 'fms_partsku_code': '' });
    });
  };

  // 点击移除大厂编码
  const handleTagCloseFn = (e, val) => {
    e.preventDefault(); // 默认动作会帮忙从视觉上移除，所以需要阻止
    confirm({
      content: '确定删除当前大厂编码吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => updatePostFieldsFn({ partsku_codes: partsku_codes.filter(item => item.fms_partsku_code != val) })
    });
  };
  return (
    <div className={styles.infoRow} autoComplete="off">
      <Row type="flex" gutter={16}>
        <Col>
          <FormItem label="大厂品类">
            {
              getFieldDecorator('brand_category_id', {
                rules: [{ required: true, message: '必填项' }],
                initialValue: brand_category_id
              })(
                <Select
                  style={{ width: 200 }}
                  disabled={!isAdd}
                  placeholder="请选择品类"
                  onChange={e => changeFmsCategoryFn(e)}
                >
                  {
                    fmsCategoriesDropList.map(item => (
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
          <FormItem label="大厂品牌">
            {
              getFieldDecorator('fms_brand_id', {
                rules: [{ required: true, message: '必填项' }],
                initialValue: fms_brand_id
              })(
                <Select
                  style={{ width: 200 }}
                  disabled={!isAdd}
                  placeholder="请选择品牌"
                  onChange={e => changeFmsBrandFn(e)}
                >
                  {
                    fmsBrandsDropList.map(item => (
                      <Option key={item.fms_brand_id} value={item.fms_brand_id}>{item.fms_brand_name}</Option>
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
              getFieldDecorator('fms_part_id', {
                rules: [{ required: true, message: '必填项' }],
                initialValue: fms_part_id
              })(
                <Select
                  style={{ width: 200 }}
                  placeholder="请选择产品"
                  disabled={!isAdd}
                  onChange={e => changeFmsPartFn(e)}
                >
                  {
                    fmsPartsDropList.map(item => (
                      <Option key={item.fms_part_id} value={item.fms_part_id}>
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
          <FormItem label="大厂编码" validateStatus={vaildCodeStatus} help={vaildCodeHelp}>
            {
              getFieldDecorator('fms_partsku_code', {
                initialValue: '',
              })(
                <Input
                  placeholder="请填写编码"
                  style={{ width: 200 }}
                  disabled={!getFieldValue('fms_brand_id') || !getFieldValue('brand_category_id') || !getFieldValue('fms_part_id')}
                />
              )
            }
            <Button type="primary" className="m-l-5 m-r-10" onClick={() => handleAddCodeFn()} disabled={!getFieldValue('fms_partsku_code')}>添加</Button>
            {
              partsku_codes.map((item, index) => {
                return <Tag key={item.fms_partsku_code_id} closable={true} color={item.fms_partsku_code_id.indexOf('time-') !== -1 ? 'red' : 'green'} onClose={e => handleTagCloseFn(e, item.fms_partsku_code)}>{item.fms_partsku_code}</Tag>;
              }) // 带【time-】前缀的是时间戳，表示是新增的，显示红色，否则显示绿色
            }
          </FormItem>
        </Col>
      </Row>
    </div>
  );
};