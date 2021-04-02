import React ,{useState,useEffect} from 'react';
import { Row, Form, Input, Button , Select, Cascader } from 'antd';
import '../index.less';
const Option = Select.Option;
const FormItem = Form.Item;

// 筛选表单【车型属性】
const FilterForm = props => {
  const [format , setFormat] = useState('ALL');
  const { carmodelList ,form } = props;
  const {getFieldDecorator}=form;
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

  const handleSubmit = () => {
    form.validateFields((err, values) => {
      if (!err) {
        console.log(values);
      }
    });
  };
  return (
    <Form layout="inline" onSubmit={handleSubmit}>
      <Row>
        <FormItem label="源车型Id">
          {
            getFieldDecorator(
              'cm_id', {
              },
            )(
              <Input placeholder='源车型id' />
            )
          }
        </FormItem>
        <FormItem label="品牌/主机厂/车型：">
          {
            getFieldDecorator(
              'pzc', {
              },
            )(
              <Cascader options={carmodelList} {...carmodelSelectConfig}/>
            )
          }
        </FormItem>
        <FormItem>
          {
            getFieldDecorator(
              'check', {
              },
            )(
              <Select style={{ width: 150 }}  onChange={this.handleChange} allowClear>
                <Option value='ALL'>全部</Option>
                <Option value='FORMATTED'>已格式化</Option>
                <Option value='UNFORMATTED'>未格式化</Option>
              </Select>
            )
          }
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit">查询</Button>
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit">进入格式化车型表</Button>
        </FormItem>
      </Row>
    </Form>
  );
};

export default FilterForm;
