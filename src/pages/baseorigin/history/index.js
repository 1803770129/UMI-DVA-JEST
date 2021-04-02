import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Table } from 'antd';

// 车型更新历史记录title
const historyTitle = [
    { title: '数据源', dataIndex: 'job_record_origin' },
    { title: '类型', dataIndex: 'job_record_type' },
    { title: '更新模式', dataIndex: 'job_record_synctype' },
    { title: '更新版本时间', dataIndex: 'job_record_version' },
    { title: '执行时间', dataIndex: 'job_record_start' },
    { title: '更新状态', dataIndex: 'job_record_status' },
    { title: '操作人', dataIndex: 'create_by' },
    { title: '操作日期', dataIndex: 'create_time' }
];

class History extends Component {

    componentDidMount() {
        this.pageInit();
    }
    
    pageInit = () => {
        const { page, perpage } = this.props;
        // 获取batch执行历史状态
        this.fetchCarmodelBatchHisList(page, perpage);
    };

    // 获取batch执行历史状态
    fetchCarmodelBatchHisList = (page, perpage) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'batchtask/fetchCarmodelBatchHisList',
            payload: { 
                page, 
                perpage,
                cb: res => {
                    const tableList = res.data.list.map(item => item);
                    tableList.forEach(element => {
                        element.job_record_origin = element.job_record_origin == 'liyang' ? '力洋' : '精友';
                        element.job_record_type = element.job_record_type == 'MANUAL' ? '手动' : '定时';
                        element.job_record_synctype = element.job_record_synctype == 'increment' ? '增量' : '全量';
                        element.create_by = element.create_by == 1 ? '系统' : '系统'; // 暂时固定只有系统
                        if(element.job_record_status == 'SUCCESS') {
                            element.job_record_status = '成功';
                        } else if(element.job_record_status == 'FAIL') {
                            element.job_record_status = '失败';
                        } else if(element.job_record_status == 'RUN') {
                            element.job_record_status = '执行中';
                        }
                    });
                    dispatch({ type: 'batchtask/updateState', payload: { page: page, perpage: perpage, carmodelBatchHisList: res.data } });
                }
            }
        });

    };

    // 表格分页
    handleTableChange = page => this.fetchCarmodelBatchHisList(page, this.props.perpage);

    // 改变单页数量
    onShowSizeChange = (current, perpage) => this.fetchCarmodelBatchHisList(this.props.page, perpage);

    render() {
        const { carmodelBatchHisList, perpage, page } = this.props;

        // 分页配置
        const pagination = {
            total: parseInt(carmodelBatchHisList.count, 10),
            pageSize: perpage,
            current: page,
            showSizeChanger: true,
            onShowSizeChange: this.onShowSizeChange,
            onChange: this.handleTableChange,
            showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`
        };

        return (
            <Card title="车型更新历史记录">
                <Table
                    bordered={true}
                    columns={historyTitle}
                    dataSource={carmodelBatchHisList.list}
                    rowKey={(item, index) => index}
                    pagination={pagination}
                />
            </Card>
        );
    }
}

const mapStateToProps = state => ({
    loading: state.loading.effects,
    ...state.batchtask
});
export default connect(mapStateToProps)(History);