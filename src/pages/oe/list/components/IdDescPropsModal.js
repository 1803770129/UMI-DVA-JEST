import { Modal, Button, Form, Input, Row, Col  } from 'antd';
const { TextArea } = Input;
// 特殊说明模态框

export default Form.create()(({form, visible, oem_carmodel_comment_desc, onHideDescModal, onEditDesc})=>{
    const { setFieldsValue, getFieldValue, getFieldDecorator } = form;
    const handlEditDesc = () => {
        onEditDesc(getFieldValue);
    };
    // 特殊说明模态框模态框
    const descPropsModal = {
        title: '特殊说明',
        destroyOnClose: true,
        maskClosable: false,
        visible: visible,
        onCancel: onHideDescModal,
        footer: <Row type="flex" justify="space-between" style={{paddingLeft: 10, paddingRight: 10}}>
            <Col>
                <Button type = "primary" ghost onClick={ () => setFieldsValue({oem_carmodel_comment_desc: ''}) }>清除</Button>
            </Col>
            <Col>
                <Button type = "primary" onClick = {handlEditDesc} disabled={false}>确定</Button>
            </Col>
        </Row>
    };

    return (
        <Modal {...descPropsModal}>
            {getFieldDecorator('oem_carmodel_comment_desc', {
                initialValue: oem_carmodel_comment_desc
            })(
                <TextArea rows={6} maxLength={100} placeholder="特殊说明不能超过100字符" />
            )}
        </Modal>
    );
});

