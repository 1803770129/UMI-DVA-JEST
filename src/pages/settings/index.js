import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Alert, Table, Row, Col, Icon, InputNumber, Button} from 'antd';

const columns = [{
    title: <span className="f14">参数名</span>,
    dataIndex: 'name',
    width: 750,
    render: () => {
        return(
            <Row>
                <Col className="f14">标准码可合并通用指数阈值</Col>
                <Col className="c9 f14">标准码之间通用指数达到此阈值，将被系统自动筛选出提示“可合并”供数据管理人员审核。</Col>
            </Row>
        );
    }
}, {
    title: <span className="f14">参数值</span>,
    dataIndex: 'std_config_value'
}];

class Settings extends Component {

    state = {
        thresholdState: false
    };

    handleThresholdState = () => {
        this.setState({thresholdState: !this.state.thresholdState});
    };

    handleChangeThreshold = (value, record) => {
        const { dispatch, STD_SKU_CONFIG } = this.props;
        dispatch({
            type: 'settings/updateStdskuConfig',
            payload: STD_SKU_CONFIG.map(v => record.std_config_id === v.std_config_id ? {...v, std_config_value: value} : v)
        
        });
    };

    handleChangeThresholdOk = record => {
        const { dispatch } = this.props;
        if(record) {
            dispatch({
                type: 'settings/fetchStdskuConfigPost',
                payload: {
                    std_config_id: record.std_config_id,
                    std_config_value: record.std_config_value
                }
            });
        }

        this.handleThresholdState();
    };

    render() {
        const { loading, STD_SKU_CONFIG } = this.props;
        const { thresholdState } = this.state;
        const isLoading = loading['settings/fetchStdskuConfigGet'];
        
        columns[1].render = (text, record, index) => {
            let content = <span className="f14">{text}</span>;
            if(thresholdState) {
                content =  <InputNumber min={1} max={100} defaultValue={text} style={{width:100}} onChange={value => this.handleChangeThreshold(value, record)} />;
            }
            return (
                <div>
                    {content}
                    <Icon type="edit" className="cur f16 m-l-10 vm" onClick={this.handleThresholdState} />
                    {
                        thresholdState && 
                        <span>
                            <Button type="primary" className="m-l-10" size="small" onClick={()=> this.handleChangeThresholdOk(record)}>更新</Button>
                            <Button type="primary" className="m-l-5" size="small"  ghost onClick={()=> this.handleChangeThresholdOk()}>取消</Button>
                        </span>
                    }
                </div>
            );
        };
        return (
            <Card>
                <Alert message="以下是搜配平台高级配置。如果你不是十分了解这些参数，请不要更改。" type="warning" showIcon />
                <Table className="m-t-15" bordered={true} loading={isLoading} dataSource={STD_SKU_CONFIG} columns={columns} pagination={false} rowKey={(item, index) => index} />
            </Card>
        );
    }
}

const mapStateToProps = state => ({
    loading: state.loading.effects,
    ...state.global,
    ...state.settings
});
export default connect(mapStateToProps)(Settings);
