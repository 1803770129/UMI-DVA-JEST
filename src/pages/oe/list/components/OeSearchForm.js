import React, { useState } from 'react';
import { Form, Cascader, Row, Col, Select, Checkbox, Input, Button,Spin } from 'antd';
import { connect } from 'dva';
import styles from './OeSearchForm.less';
import msg from '@/utils/msg';
import { isEmpty } from '@/utils/tools';
import CarmodelProSelect from './CarmodelProSelect';
const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: {
    xxl: { span: 4 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xxl: { span: 20 },
    sm: { span: 18 },
  },
};

const formItemLayout1 = {
  labelCol: {
    xxl: { span: 8 },
    sm: { span: 10 },
  },
  wrapperCol: {
    xxl: { span: 16 },
    sm: { span: 14 },
  },
};
// Cascader搜索过滤
const handleCmFilter = (inputValue, selectedOptions) => {
  return selectedOptions.some(option => {
    const v = option.v || option.label || option.title || '';
    return v.toLowerCase().indexOf(inputValue.toLowerCase().trim()) > -1;
  });
};

const handlePartFilter = (inputValue, selectedOptions) => {
  return selectedOptions.some(option => option.title ? option.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1 : false);
};


const OeSearch = ({ dispatch, form, loading, FIELDS, CATEGORY_TREE = [], CARMODEL_CM_BRAND_LIST, BRAND_FAC_MOD_APPROVED_LIST = [],
  CARMODEL_CMINFO_DISPLACEMENT_LIST = [], CARMODEL_PRO_LIST,OEMSKU,oemField,
  onFetchOemskuList, initialCategoryId }) => {
  const { getFieldDecorator, getFieldsValue, setFieldsValue } = form;
  const [carmodelProps, setCarmodelProps] = useState({});
  const { brand_fac_mod = [] } = getFieldsValue();
  const [ cm_brand, cm_factory, cm_model ] = brand_fac_mod;
  let oemList=[];
  if(OEMSKU.length!==0){
    const OEMSKULIST=[...OEMSKU];

    OEMSKULIST.forEach(item=>{
      if(item.oem_partsku_values){
        let obj={};
        let oem_partsku_values=[];
        item.oem_partsku_values.forEach(oem=>{
          let formate={};
          formate['category_pro_id']=oem;
          formate['category_pro_name']=oem;
          oem_partsku_values.push(formate);
        });
        obj['category_id']=item.category_id;
        obj['category_pro_id']=item.category_pro_id;
        obj['category_pro_name']=item.category_pro_group?item.category_pro_name+'['+item.category_pro_group+']':item.category_pro_name;
        obj['category_pro_unit']=item.category_pro_unit;
        obj['oem_partsku_values']=oem_partsku_values;
        oemList.push(obj);
      }
    });
  }
  // 表单提交
  const handleSubmit = e => {
    e.preventDefault();
    const { validateFields } = form;
    validateFields((err, values) => {
      if (!err) {
        const obj = { ...values, ...carmodelProps };
        if (!obj.category_id.length && !obj.partsku_code) {
          msg('请选择产品或者填写OE码');
          return;
        }
        // 区分OE码和标准码查询
        obj[obj.code_type] = obj.partsku_code;
        delete obj.code_type;
        delete obj.partsku_code;
        // 查询时重置分页
        let o = { page: 1 };
        // 移除空参数
        for (const k in obj) {
          const el = obj[k];
          if (!isEmpty(el)) {
            o[k] = el;
          }
        }
        console.log(o);
        onFetchOemskuList(o);
      }
    });
    const data={
      record_obj:{
        'operation':'查询OE列表'
      },
      record_page:'OE管理',
      record_operations:'查询OE列表'
    };
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  };

  const prefixSelector = getFieldDecorator('code_type', {
    initialValue: 'oem_partsku_code',
  })(
    <Select style={{ width: 85 }} onChange={() => setFieldsValue({ partsku_code: '' })}>
      <Option value="oem_partsku_code">OE码</Option>
      <Option value="std_partsku_code">标准码</Option>
    </Select>
  );

  // 获取车型属性选项
  const carmodelProSelectChange = (carmodelPro) => {
    setCarmodelProps(carmodelPro || {});
  };

  // 动态获取车型属性值
  const fetchCarmodelGetCminfoBytype = (obj, callback) => {
    if (cm_brand) {
      dispatch({
        type: 'oe/fetchCarmodelGetCminfoBytype',
        payload: {
          searchByte: obj.cm_pro_column,
          cm_brand, cm_factory, cm_model
        },
        callback
      });
    } else {
      callback();
    }
  };
  const changeCascader=(list)=>{
    const {setFieldsValue}=form;
    setFieldsValue({
      attribute: [],
    });
    dispatch({type:'oe/updateOemField'});
    if(list.length!==0){
      dispatch({
        type:'oe/fetchOemsku',
        payload:{
          category_id:list[1]
        }
      });
    }
  };
  return (
    <Form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
      <Row className={styles.formRow} gutter={8}>
        <Col span={12}>
          <FormItem label="产品" {...formItemLayout}>
            {getFieldDecorator('category_id', {
              initialValue: initialCategoryId,
              // rules: [{ required: true, message: '必填项' }]
            })(
              <Cascader
                fieldNames={{ label: 'title', value: 'key', children: 'children' }}
                options={CATEGORY_TREE}
                placeholder='请选择'
                showSearch={{ filter: handlePartFilter, matchInputWidth: true, limit: false }}
                onChange={changeCascader}
              // changeOnSelect={true}
              />

            )}
          </FormItem>
        </Col>
        <Col span={4}>
          <FormItem label="车型品牌" {...formItemLayout1}>
            {getFieldDecorator('carmodel_brand_id', {
              initialValue: FIELDS.carmodel_brand_id
            })(
              <Select showSearch allowClear placeholder='请选择'
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {
                  CARMODEL_CM_BRAND_LIST.map(item => {
                    return <Option key={item.cm_brand_id} value={item.cm_brand_id}>{item.cm_brand_name}</Option>;
                  })
                }
              </Select>
            )}
          </FormItem>
        </Col>
        <Col span={4}>
          <FormItem label="审核状态" {...formItemLayout1}>
            {getFieldDecorator('oem_partsku_status', {
              initialValue: FIELDS.oem_partsku_status
            })(
              <Select allowClear placeholder='请选择'>
                <Option value="">全部</Option>
                <Option value="PENDING">待审核</Option>
                <Option value="APPROVED">审核通过</Option>
                <Option value="NONAPPROVED">审核不通过</Option>
              </Select>
            )}
          </FormItem>
        </Col>
        <Col span={4}>
          <FormItem label="异常状态" {...formItemLayout1}>
            {getFieldDecorator('exception_status', {
              initialValue: FIELDS.exception_status
            })(
              <Select allowClear placeholder='请选择'>
                <Option value='EXC_IMAGE'>缺少图片</Option>
                <Option value='EXC_VALUE'>缺少属性</Option>
                <Option value='EXC_PRICE'>缺少价格</Option>
                <Option value='EXC_CODE'>缺少OE码</Option>
                <Option value='EXC_CARMODEL'>缺少车型</Option>
                <Option value='EXC_STANDARD'>缺少标准码</Option>
              </Select>
            )}
          </FormItem>
        </Col>
        {/* <Col className={styles.colRight}>
                    <FormItem className={styles.exception}>
                        {getFieldDecorator('exception', {
                            initialValue: FIELDS.exception
                        })(<Checkbox defaultChecked={FIELDS.exception}>只显示异常</Checkbox>)}
                    </FormItem>

                </Col> */}
      </Row>
      <Row className={styles.formRow} gutter={12}>
        <Col span={12}>
          <FormItem label="品牌/主机厂/车型" {...formItemLayout}>
            {getFieldDecorator('brand_fac_mod', {
              initialValue: FIELDS.brand_fac_mod
            })(
              <Cascader
                fieldNames={{ label: 'l', value: 'v', children: 'c' }}
                options={BRAND_FAC_MOD_APPROVED_LIST}
                placeholder='请选择品牌/主机厂/车型'
                showSearch={{ filter: handleCmFilter, matchInputWidth: true, limit: false }}
                changeOnSelect={true}
              />

            )}
          </FormItem>
        </Col>
        <Col xxl={6} sm={8} >
          <FormItem>
            {getFieldDecorator('partsku_code', {
              initialValue: FIELDS.partsku_code
            })(<Input style={{ width: 310 }} addonBefore={prefixSelector} allowClear placeholder="请输入" onChange={e => setFieldsValue({ partsku_code: e.target.value.trim() })} />)}
          </FormItem>
        </Col>
        <Col span={4} >
          <FormItem>
            {getFieldDecorator('merge', {
              initialValue: FIELDS.merge
            })(<Checkbox>只显示合并项</Checkbox>)}
          </FormItem>
        </Col>

      </Row>

      <Row className={styles.formRow} gutter={8}>
        <Col span={6}>
          <Spin spinning={loading['oe/fetchOemsku']} size="small">
            <FormItem label="属性" {...formItemLayout}>
              {getFieldDecorator('attribute', {
                initialValue: oemField
              })(
                <Cascader
                  fieldNames={{ label: 'category_pro_name', value: 'category_pro_id', children: 'oem_partsku_values' }}
                  options={oemList}
                  placeholder='请选择属性'
                // showSearch={{ filter: handleCmFilter, matchInputWidth: true, limit: false }}
                // changeOnSelect={true}
                />

              )}
            </FormItem>
          </Spin>
        </Col>
      </Row>
      {/* 车型属性筛选项 */}
      {
        cm_brand && <Row type="flex">
          <CarmodelProSelect CARMODEL_PRO_LIST={CARMODEL_PRO_LIST} brand_fac_mod={brand_fac_mod} onChangeParent={fetchCarmodelGetCminfoBytype} onSelectChange={carmodelProSelectChange} />
        </Row>
      }

      <Row className={styles.formRow} gutter={16} justify="space-between" type="flex">
        <Col className={styles.colRight}>
          <Button className="m-r-10" type="primary" htmlType="submit">查询</Button>
          <Button type="dashed" icon="download">批量导出OE属性</Button>
        </Col>
      </Row>
    </Form>


  );
};
const OeSearchForm = Form.create()(OeSearch);

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.oe
});
export default connect(mapStateToProps)(OeSearchForm);
