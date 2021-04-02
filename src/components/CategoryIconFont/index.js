import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Row, Col } from 'antd';
import iconfontList from '@/assets/json/iconfont.json';
import styles from './index.less';

class Iconfont extends Component {

    state = {
        value: ''               // 选中的图标key值
    };

    componentDidMount() {
        this.setState({ value: this.props.value });
    }


    // 点击选择图标
    handleClickIconFontFn = key => this.setState({ value: key });

    render() {
        const modalProps = {
            width: 600,
            title: '选择品类产品图标',
            visible: true,
            onOk: () => onConfirmIconfontFn(this.state.value),
            onCancel: () => onChangeIconfontVisibleFn(false),
            okText: '确认',
            cancelText: '取消',
            className: styles.iconfontModal
        };

        let { onConfirmIconfontFn, onChangeIconfontVisibleFn } = this.props;

        return (
            <Modal {...modalProps}>
                <Row gutter={16}>
                    {
                        iconfontList.map((item, index) => (
                            <Col span={6} key={index} style={ item.key == this.state.value ? { color: '#fff', backgroundColor: '#00A0E9'} : {}} onClick={() => this.handleClickIconFontFn(item.key)}>
                                <div className={'sopei_category sopei_category-' + item.key}></div>
                            </Col>
                        ))
                    }
                </Row>
            </Modal>
        );
    }
};


export default connect()(Iconfont);