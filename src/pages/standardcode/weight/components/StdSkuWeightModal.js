import React from 'react';
import { Form, InputNumber, Modal, Button } from 'antd';
const FormItem = Form.Item;

export default ({ currentStdWeightObj, commonWeightModalVisible, onHandleCommonWeightModalFn, onHandleConfirmWeightModalFn }) => {
    let new_std_weight_num = 0;

    const formItemLayout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 18 },
        style: {marginBottom: 10}
    };

    const handleConfirmWeightModalFn = () => {
        onHandleConfirmWeightModalFn(currentStdWeightObj.std_weight_id, new_std_weight_num);
    };

    const handleChangeStdWeightNum = val => {
        if(val) {
            new_std_weight_num = val;
        }
    };

    const modalProps = {
        title: '编辑通用权重',
        visible: commonWeightModalVisible,
        footer: [
            <Button key='cancle' onClick={ () => {onHandleCommonWeightModalFn();}}>取消</Button>,
            <Button type='primary' key='ok' onClick={ () => {handleConfirmWeightModalFn();}}>确定</Button>
        ]
    };

    return (
        <Modal {...modalProps}>
            <Form>
                <FormItem label="通用依据" {...formItemLayout}>{currentStdWeightObj.std_weight_type}</FormItem>
                <FormItem label="品牌名称" {...formItemLayout}>{currentStdWeightObj.all_brand_name}</FormItem>
                <FormItem label="产品名称" {...formItemLayout}>{currentStdWeightObj.category_name}</FormItem>
                <FormItem label="通用权重" {...formItemLayout}>
                    <InputNumber 
                        min={1} 
                        max={10} 
                        style={{width:100}} 
                        defaultValue={currentStdWeightObj.std_weight_num}
                        value={currentStdWeightObj.std_weight_num}
                        onChange={ e => handleChangeStdWeightNum(e)}
                    />
                </FormItem>
            </Form>
        </Modal>
    );
};
