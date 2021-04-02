import React from 'react';
import { Row, Col, Form, Input, Select } from 'antd';
const Option = Select.Option;
const FormItem = Form.Item;

export default props => {
    const { form, fmsCategoryProps, onHandleAttrInfoFn } = props;
    const { getFieldDecorator } = form;

    return (
        <React.Fragment>
            {
                fmsCategoryProps.map((item, index) => {
                    return <div key={index}>
                        <div className="f16">{item.key == '' ? '默认分组' : '兼容分组' + item.key}</div>
                        <Row type="flex" gutter={16}>
                            {
                                item.list.map((itm, idx) => {
                                    let html = '';
                                    if(itm.category_pro_type === 'ENUM') {
                                        const vals = itm.category_pro_enum_val;
                                        html = (
                                            <Col span={8} key={itm.category_pro_id + '：'}>
                                                <FormItem label={itm.category_pro_group == '' ? itm.category_pro_name : (itm.category_pro_name + '['+ itm.category_pro_group + ']')} validateStatus={itm.validateStatus} help={itm.help}>
                                                    {
                                                        getFieldDecorator(itm.category_pro_id, {
                                                            initialValue: itm.fms_partsku_value
                                                        })(
                                                            <Select placeholder="请选择" onChange={ e => onHandleAttrInfoFn(itm, e, idx)}>
                                                                {
                                                                    vals.map((v, i) => <Option key={i} value={v}>{v}</Option>)
                                                                }
                                                            </Select>
                                                        )
                                                    }
                                                </FormItem>
                                            </Col>
                                        );
                                    } else if(itm.category_pro_type === 'STRING') {
                                        html = (
                                            <Col span={8} key={itm.category_pro_id + '：'}>
                                                <FormItem label={itm.category_pro_group == '' ? itm.category_pro_name : (itm.category_pro_name + '['+ itm.category_pro_group + ']')} validateStatus={itm.validateStatus} help={itm.help}>
                                                    {
                                                        getFieldDecorator(itm.category_pro_id, {
                                                            initialValue: itm.fms_partsku_value
                                                        })(
                                                            <Input 
                                                                placeholder={`输入的字节长度不得超过${itm.category_pro_size}`}
                                                                onBlur={ e => onHandleAttrInfoFn(itm, e.target.value, idx)}
                                                            />
                                                        )
                                                    }
                                                </FormItem>
                                            </Col>
                                        );
                                    } else if(itm.category_pro_type === 'NUMBER') {
                                        html = (
                                            <Col span={8} key={itm.category_pro_id + '：'}>
                                                <FormItem label={itm.category_pro_group == '' ? itm.category_pro_name : (itm.category_pro_name + '['+ itm.category_pro_group + ']')} validateStatus={itm.validateStatus} help={itm.help}>
                                                    {
                                                        getFieldDecorator(itm.category_pro_id, {
                                                            initialValue: itm.fms_partsku_value
                                                        })(
                                                            <Input 
                                                                placeholder="请输入数字类型的内容"
                                                                onBlur={ e => onHandleAttrInfoFn(itm, e.target.value, idx)}
                                                                addonAfter={<span>{itm.category_pro_unit}</span>}
                                                            />
                                                        )
                                                    }
                                                </FormItem>
                                            </Col>
                                        );
                                    }
                                    return html;
                                })
                            }
                        </Row>
                    </div>;
                })
            }
        </React.Fragment>
    );
};