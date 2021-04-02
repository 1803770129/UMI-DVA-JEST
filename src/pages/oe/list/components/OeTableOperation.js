import { Dropdown, Icon, Button, Menu, Row, Col  } from 'antd';

export default ({ isDisabled, onMenuClick }) => {
    const menu = (
        <Menu onClick={onMenuClick}>
            <Menu.Item key="APPROVED">审核通过</Menu.Item>
            <Menu.Item key="NONAPPROVED">审核不通过</Menu.Item>
        </Menu>
    );
    return (
        <Row justify="space-between" type="flex" style={{marginBottom: 16 }}>
            <Col>
                <Button type="primary" ghost icon="upload">批量导入属性图片</Button>
            </Col>
            <Col>
                <Button type="dashed" icon="edit" style={{ marginRight: 8 }}>
                    批量编辑产品属性
                </Button>
                {/* 批量操作按钮 */}
                <Dropdown overlay={menu} disabled={isDisabled}>
                    <Button type="primary" ghost style={{ marginRight: 8 }}>
                        批量操作 <Icon type="down" />
                    </Button>
                </Dropdown>
                <Button href="/#/oe/list/-1" type="primary">创建OE</Button>
            </Col>
        </Row>

    );
};
