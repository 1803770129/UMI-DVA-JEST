import React from 'react';
import { Row, Form, Input, Button, Icon, Select, Cascader } from 'antd';
import '../index.less';
const Option = Select.Option;
const FormItem = Form.Item;
const InputGroup = Input.Group;

// 筛选表单【车型属性】
const FilterForm = props => {
  const { form, fields, carmodelList, addCarmodelProList, removeCarmodelProList, handleSubmit, carmodelProList, updateCarmodelProList } = props;
  const { carmodelProListValue, cm_carmodel, filter_car_pro } = fields;
  // 车型搜索过滤
  const handleCarmodelFilter = (inputValue, selectedOptions) => {
    return selectedOptions.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase().trim()) > -1);
  };

  // 车型筛选配置
  const carmodelSelectConfig = {
    style: { minWidth: 380 },
    placeholder: '请选择品牌/主机厂/车型',
    showSearch: { filter: handleCarmodelFilter, limit: false },
    changeOnSelect: true,
    fieldNames: { label: 'label', value: 'v', children: 'c' }
  };

  // 数据源列表【车型属性】
  const cm_origin = [
    { key: '全部', val: '' },
    { key: '精友', val: 'easyepc' },
    { key: '力洋', val: 'liyang' },
    { key: '搜配', val: 'sopei' }
  ];

  // 审核状态列表【车型属性】
  const review_status = [
    { key: '全部', val: '' },
    { key: '待审核', val: 'PENDING' },
    { key: '审核通过', val: 'APPROVED' },
    { key: '审核不通过', val: 'NONAPPROVED' },
    { key: '审核通过（关联车型有更新）', val: 'APPROVED_UPDATE' },
  ];

  const handleChangeSelect = (value, key) => {
    updateCarmodelProList(carmodelProListValue.map(v => {
      return v.key === key ? {...v, cm_pro_column: value } : v;
    }));
  };
  const handleChangeInput = (value, key) => {
    updateCarmodelProList(carmodelProListValue.map(v => {
      return v.key === key ? {...v, cm_pro_value: value.trim() } : v;
    }));
  };

  return (
    <Form layout="inline" onSubmit={handleSubmit}>
      <Row>
        <FormItem label="数据源：">
          {
            form.getFieldDecorator('cm_origin', {initialValue: fields['cm_origin']})(
              <Select style={{width: 80}}>
                {cm_origin.map((item, index) => {return <Option key={index} value={item.val}>{item.key}</Option>;})}
              </Select>
            )
          }
        </FormItem>
        <FormItem label="审核状态：">
          {
            form.getFieldDecorator('review_status', {initialValue: fields['review_status']})(
              <Select style={{width: 230}}>
                {review_status.map((item, index) => {return <Option key={index} value={item.val}>{item.key}</Option>;})}
              </Select>
            )
          }
        </FormItem>
        <FormItem label="品牌/主机厂/车型：">
          {form.getFieldDecorator('cm_carmodel', {initialValue: cm_carmodel})(<Cascader options={carmodelList} {...carmodelSelectConfig}/>)}
        </FormItem>
        <FormItem label="关键属性值变更：">
          {form.getFieldDecorator('filter_car_pro', {initialValue: filter_car_pro})(
            <Select style={{width: 150}} placeholder="请选择" allowClear>
              {/* <Option key={''} value={''}>全部</Option> */}
              {carmodelProList.map((proItem, index) => {return <Option key={index} value={proItem.cm_pro_column}>{proItem.cm_pro_name}</Option>;})}
            </Select>
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit">搜索</Button>
        </FormItem>
      </Row>
      <Row className="m-t-10">
        <InputGroup compact>
          {
            carmodelProListValue.map((item, index) => {
              const optName = 'cm_pro_column_' + item.key;
              const valName = 'cm_pro_value_' + item.key;
              return (
                <FormItem key={item.key} style={{marginRight: 10}}>
                  {
                    form.getFieldDecorator(optName, {initialValue: item.cm_pro_value})(
                      <React.Fragment>
                        <Input
                          addonBefore={
                            form.getFieldDecorator(valName, {initialValue: item.cm_pro_column})(
                              <Select style={{width: 150}} onChange={value => handleChangeSelect(value, item.key)}>
                                {carmodelProList.map((proItem, index) => {return <Option key={proItem.cm_pro_column} value={proItem.cm_pro_column}>{proItem.cm_pro_name}</Option>;})}
                              </Select>
                            )
                          }
                          value={item.cm_pro_value}
                          onChange={ e => handleChangeInput(e.target.value, item.key) }
                          style={{ width: 320 }}
                          allowClear
                          placeholder='输入关键字'
                          addonAfter={<Icon type='delete' className='cur' onClick={ () => removeCarmodelProList(item.key) } />}
                        />
                      </React.Fragment>
                    )
                  }
                </FormItem>
              );
            })
          }
          <FormItem><Button icon="plus" onClick={addCarmodelProList}>增加筛选属性</Button></FormItem>
        </InputGroup>
      </Row>
    </Form>
  );
};

export default FilterForm;
