import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Divider, Row, Col, Button } from 'antd';
import { isEmpty, originalImage, getPicSize } from '@/utils/tools';
import IndexSearchForm from './components/IndexSearchForm';
import IndexTableList from './components/IndexTableList';
import FeedbackModal from './components/FeedbackModal';
import BatchModal from './components/BatchModal';
import { PhotoSwipe } from 'react-photoswipe';
import moment from 'moment';
import export2Excel from '@/utils/export2Excel';

// 获取非空参数
const getNoEmptyParams = params => {
  // 拉取数据
  let _params = {};
  for (const k in params) {
    const v = params[k];
    if (!isEmpty(v) && v !== 'ALL') {
      _params[k] = v;
    }
  }
  return _params;
};

class SystemmanageFeedback extends Component {
  state = {
    feedbackModalIsOpen: false, // 功能反馈模态框是否显示标识
    cur_row: {},
    selectedRowKeys: [], // 勾选表格的值
    batchModalIsOpen: false,
    isOpen: false,
    isOpenImg: [],
    reply_imgs: [],
    previewViewIndex: 0,
  };

  componentDidMount() {
    this.fetchFeedbackSystems();
  }

  // 获取功能反馈列表
  fetchFeedbackSystems = (payload = {}) => {
    const { dispatch } = this.props;
    // selectedRowKeys
    this.setState({ selectedRowKeys: [] });
    // 拉取数据
    let _payload = {};
    for (const k in payload) {
      const v = payload[k];
      if (!isEmpty(v) && v !== 'ALL') {
        _payload[k] = v;
      }
    }
    dispatch({
      type: 'systemFeedback/fetchFeedbackSystems',
      payload: _payload
    });
  };

  // 搜索栏 - 点击查询
  handleSubmit = values => {
    this.fetchFeedbackSystems({ ...this.props.FIELDS, ...values, page: 1 });
  };


  // 显示反馈处理模态框
  showFeedbackModal = row => {
    const { sys_feedback_id } = row;
    this.setState({
      feedbackModalIsOpen: true,
      cur_row: row
    }, () => {
      // 获取回复列表
      this.fetchFeedbackSystemProcess({ sys_feedback_id });
    });
  };

  // 隐藏反馈处理模态框
  hideFeedbackModal = () => {
    this.setState({
      feedbackModalIsOpen: false,
      cur_row: {}
    });
  };

  // 显示批量处理模态框
  showBatchReplyModal = () => {
    this.setState({
      batchModalIsOpen: true
    });
  }

  // 隐藏批量处理模态框
  hideBatchReplyModal = () => {
    this.setState({
      batchModalIsOpen: false
    });
  }

  // 预览图片
  handlePreviewImage = async (curSrc, imgIdx) => {
    let previewImgs = [];
    for (let i = 0; i < curSrc.length; i++) {
      const img = curSrc[i];
      let config = await getPicSize(img);
      previewImgs[i] = config;
    }
    // 开启pc预览图
    this.setState({
      isOpenImg: previewImgs,
      isOpen: true,
      previewViewIndex: imgIdx || 0
    });
  };

  // 关闭预览图
  handleCloseImg = () => {
    this.setState({
      isOpen: false
    });
  };

  // 表格多选
  handleChangeRowSelection = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  }

  /** 回复图片上传 */
  handleUploadFeedbackPic = file => {
    const { dispatch } = this.props;
    dispatch({
      type: 'systemFeedback/fetchFeedbackImages',
      payload: { file },
      callback: result => {
        const { reply_imgs } = this.state;
        this.setState({
          reply_imgs: [...result, ...reply_imgs]
        });
      }
    });
  };

  handleUpdateFeedbackPic = imgs => {
    this.setState({
      reply_imgs: imgs
    });
  };

  /** 回复图片上传 end */

  // 功能反馈回复列表
  fetchFeedbackSystemProcess = payload => {
    const { dispatch } = this.props;
    dispatch({
      type: 'systemFeedback/fetchFeedbackSystemProcess',
      payload,
      callback: this.scrollToBottom // 回复列表滚动到底部
    });
  }

  // 批量回复
  fetchFeedbackProcess = ({ process_content, status }) => {
    const { selectedRowKeys } = this.state;
    const { dispatch, FEEDBACK_SYSTEMS } = this.props;
    const _selectedRowKeys = [...selectedRowKeys];
    dispatch({
      type: 'systemFeedback/fetchFeedbackProcess',
      payload: { sys_feedback_ids: selectedRowKeys, sys_feedback_process_content: process_content },
      callback: () => {
        // 更新处理状态
        dispatch({
          type: 'systemFeedback/updateFeedbackSystems',
          payload: {
            ...FEEDBACK_SYSTEMS,
            data: FEEDBACK_SYSTEMS.data.map(v => _selectedRowKeys.includes(v.sys_feedback_id) ? { ...v, sys_feedback_status: status /*'OVER'*/, unread_count: 0  } : v)
          }
        });
        // 清空selectedRowKeys
        this.setState({ selectedRowKeys: [] });
        // 隐藏批量处理模态框
        this.hideBatchReplyModal();
      }
    });
  };

  // 单个回复
  fetchReply = ({ process_content }, clearFields) => {
    const { dispatch, FEEDBACK_SYSTEMS, FEEDBACK_SYSTEM_PROCESS } = this.props;
    const { cur_row, reply_imgs } = this.state;
    const { sys_feedback_id } = cur_row;
    const sys_feedback_image_ids = reply_imgs.map(v => v.sys_feedback_image_id);
    const _reply_imgs = [...reply_imgs];
    dispatch({
      type: 'systemFeedback/fetchFeedbackReply',
      payload: { sys_feedback_id, sys_feedback_process_content: process_content, sys_feedback_image_ids },
      callback: () => {
        // 更新处理状态(清空回复数量)
        dispatch({
          type: 'systemFeedback/updateFeedbackSystems',
          payload: {
            ...FEEDBACK_SYSTEMS,
            data: FEEDBACK_SYSTEMS.data.map(v => sys_feedback_id === v.sys_feedback_id ? { ...v, unread_count: 0 } : v)
          }
        });
        // 更新回复列表
        dispatch({
          type: 'systemFeedback/updateFeedbackSystemProcess',
          payload: [
            ...FEEDBACK_SYSTEM_PROCESS,
            {
              sys_feedback_process_content: process_content, // 回复内容
              sys_feedback_images: _reply_imgs.map(v => ({ ...v, sys_feedback_image_url: v.url })), // 回复图片
              sys_feedback_process_time: moment().format('YYYY.MM.DD'), // 反馈时间
              sys_feedback_process_stance: 'SOPEI', // 回复方(SOPEI/USER)
            }
          ]
        });
        // 清空回复图片
        this.setState({ reply_imgs: [] });
        // 清空回复信息表单
        clearFields();
        //回复列表滚动到底部
        this.scrollToBottom();
      }
    });
  }


  // 更新反馈状态
  fetchFeedbackStatus = (status) => {
    const { dispatch, FEEDBACK_SYSTEMS } = this.props;
    const { cur_row } = this.state;
    const { sys_feedback_id } = cur_row;
    dispatch({
      type: 'systemFeedback/fetchFeedbackStatus',
      payload: { sys_feedback_id, sys_feedback_status: status },
      callback: () => {
        // 更新处理状态
        dispatch({
          type: 'systemFeedback/updateFeedbackSystems',
          payload: {
            ...FEEDBACK_SYSTEMS,
            data: FEEDBACK_SYSTEMS.data.map(v => v.sys_feedback_id === sys_feedback_id ? { ...v, sys_feedback_status: status, unread_count: 0 } : v)
          }
        });
        // 隐藏回复模态框
        this.hideFeedbackModal();
      }
    });
  }

  // 回复列表滚动到底部
  scrollToBottom = () => {
    const reply_content = document.getElementById('system_reply_content');
    reply_content.scrollTop = reply_content.scrollHeight;
  }

  // 导出反馈
  fetchFeedbackXls = () => {
    const { dispatch, FIELDS } = this.props;
    let fields = { ...FIELDS };
    delete fields.page;
    delete fields.perpage;
    dispatch({
      type: 'systemFeedback/fetchFeedbackXls',
      payload: getNoEmptyParams(fields),
      callback: (tHeader, tbody) => {
        export2Excel(tHeader, tbody, '功能反馈_' + moment().format('YYYY_MM_DD'));
      }
    });

  }

  render() {
    const { loading, FIELDS, FEEDBACK_SYSTEMS, FEEDBACK_SYSTEM_PROCESS } = this.props;
    const { isOpenImg, isOpen, selectedRowKeys, feedbackModalIsOpen, cur_row, reply_imgs, batchModalIsOpen, previewViewIndex } = this.state;

    return (
      <>
        <Card>
          <IndexSearchForm onSubmit={this.handleSubmit} />
          <Divider style={{ margin: '0 0 15px 0' }} />

          {/* 功能反馈列表 */}
          <Row type="flex" justify="space-between">
            <Col className="f20">功能反馈列表</Col>
            <Col>
              <Button type="dashed" icon="download" onClick={this.fetchFeedbackXls} loading={loading['systemFeedback/fetchFeedbackXls']}>批量导出</Button>
              <Divider type="vertical" />
              <Button type="primary" onClick={this.showBatchReplyModal} disabled={selectedRowKeys.length === 0}>
                批量处理
              </Button>
            </Col>
          </Row>

          <IndexTableList
            loading={loading['systemFeedback/fetchFeedbackSystems']}
            FIELDS={FIELDS}
            count={FEEDBACK_SYSTEMS.count}
            data={FEEDBACK_SYSTEMS.data}
            selectedRowKeys={selectedRowKeys}
            onFetchFeedbackSystems={this.fetchFeedbackSystems}
            onPreview={this.handlePreviewImage}
            onShowFeedbackModal={this.showFeedbackModal}
            onChangeRowSelection={this.handleChangeRowSelection}
          />
        </Card>
        {/* 功能反馈模态框 */}
        <FeedbackModal
          visible={feedbackModalIsOpen} loading={loading} reply_imgs={reply_imgs} cur_row={cur_row} list={FEEDBACK_SYSTEM_PROCESS}
          onOk={this.fetchFeedbackStatus} onCancel={this.hideFeedbackModal} onUploadPic={this.handleUploadFeedbackPic} onUpdatePic={this.handleUpdateFeedbackPic} onReply={this.fetchReply} onPreviewImage={this.handlePreviewImage}
        />
        {/* 批量处理模态框 */}
        <BatchModal visible={batchModalIsOpen} onOk={this.fetchFeedbackProcess} onCancel={this.hideBatchReplyModal} />

        {/* 图片预览 */}
        <PhotoSwipe isOpen={isOpen} items={isOpenImg} options={{ index: previewViewIndex }} onClose={this.handleCloseImg} />
      </>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.systemFeedback,
});
export default connect(mapStateToProps)(SystemmanageFeedback);
