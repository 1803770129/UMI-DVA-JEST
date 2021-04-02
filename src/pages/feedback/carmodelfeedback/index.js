import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Divider, Row, Col, Button } from 'antd';
import { isEmpty, originalImage, getPicSize } from '@/utils/tools';
import IndexSearchForm from './components/IndexSearchForm';
import IndexTableList from './components/IndexTableList';
import FeedbackCarmodelsModal from './components/FeedbackCarmodelsModal';
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

class CarmodelFeedback extends Component {
  state = {
    feedbackCarmodelsModalIsOpen: false, // 车型反馈模态框是否显示标识
    cur_row: {},
    selectedRowKeys: [], // 勾选表格的值
    batchModalIsOpen: false,
    isOpen: false,
    isOpenImg: [],
    reply_imgs: [],
    previewViewIndex: 0,
  };

  componentDidMount() {
    this.fetchFeedbackCarmodels();
  }

  // 获取车型反馈列表
  fetchFeedbackCarmodels = (payload = {}) => {
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
      type: 'carmodelFeedback/fetchFeedbackCarmodels',
      payload: _payload
    });
  };

  // 搜索栏 - 点击查询
  handleSubmit = values => {
    this.fetchFeedbackCarmodels({ ...this.props.FIELDS, ...values, page: 1 });
  };


  // 显示反馈处理模态框
  showFeedbackCarmodelsModal = row => {
    const { feedback_cm_id } = row;
    this.setState({
      feedbackCarmodelsModalIsOpen: true,
      cur_row: row
    }, () => {
      // 获取回复列表
      this.fetchFeedbackCarmodelProcess({ feedback_cm_id });
    });
  };

  // 隐藏反馈处理模态框
  hideFeedbackCarmodelsModal = () => {
    this.setState({
      feedbackCarmodelsModalIsOpen: false,
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
      type: 'carmodelFeedback/fetchFeedbackImages',
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

  // 车型反馈回复列表
  fetchFeedbackCarmodelProcess = payload => {
    const { dispatch } = this.props;
    dispatch({
      type: 'carmodelFeedback/fetchFeedbackCarmodelProcess',
      payload,
      callback: this.scrollToBottom // 回复列表滚动到底部
    });
  }

  // 批量回复
  fetchFeedbackProcess = ({ process_content, status }) => {
    const { selectedRowKeys } = this.state;
    const { dispatch, FEEDBACK_CARMODELS } = this.props;
    const _selectedRowKeys = [...selectedRowKeys];
    dispatch({
      type: 'carmodelFeedback/fetchFeedbackProcess',
      payload: { feedback_cm_ids: selectedRowKeys, feedback_cm_process_content: process_content },
      callback: () => {
        // 更新处理状态
        dispatch({
          type: 'carmodelFeedback/updateFeedbackCarmodels',
          payload: {
            ...FEEDBACK_CARMODELS,
            data: FEEDBACK_CARMODELS.data.map(v => _selectedRowKeys.includes(v.feedback_cm_id) ? { ...v, feedback_cm_status: status /*'OVER'*/, unread_count: 0  } : v)
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
    const { dispatch, FEEDBACK_CARMODELS, FEEDBACK_CARMODEL_PROCESS } = this.props;
    const { cur_row, reply_imgs } = this.state;
    const { feedback_cm_id } = cur_row;
    const feedback_images = reply_imgs.map(v => v.feedback_cm_image_id);
    const _reply_imgs = [...reply_imgs];
    dispatch({
      type: 'carmodelFeedback/fetchFeedbackReply',
      payload: { feedback_cm_id, feedback_cm_process_content: process_content, feedback_cm_image_ids: feedback_images },
      callback: () => {
        // 更新处理状态(清空回复数量)
        dispatch({
          type: 'carmodelFeedback/updateFeedbackCarmodels',
          payload: {
            ...FEEDBACK_CARMODELS,
            data: FEEDBACK_CARMODELS.data.map(v => feedback_cm_id === v.feedback_cm_id ? { ...v, unread_count: 0 } : v)
          }
        });
        // 更新回复列表
        dispatch({
          type: 'carmodelFeedback/updateFeedbackCarmodelProcess',
          payload: [
            ...FEEDBACK_CARMODEL_PROCESS,
            {
              feedback_cm_process_content: process_content, // 回复内容
              feedback_cm_images: _reply_imgs.map(v => ({...v, feedback_cm_image_url: v.url})), // 回复图片
              feedback_cm_process_time: moment().format('YYYY.MM.DD'), // 反馈时间
              feedback_cm_process_stance: 'SOPEI', // 回复方(SOPEI/USER)
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
    const { dispatch, FEEDBACK_CARMODELS } = this.props;
    const { cur_row } = this.state;
    const { feedback_cm_id } = cur_row;
    dispatch({
      type: 'carmodelFeedback/fetchFeedbackStatus',
      payload: { feedback_cm_id, feedback_cm_status: status },
      callback: () => {
        // 更新处理状态
        dispatch({
          type: 'carmodelFeedback/updateFeedbackCarmodels',
          payload: {
            ...FEEDBACK_CARMODELS,
            data: FEEDBACK_CARMODELS.data.map(v => v.feedback_cm_id === feedback_cm_id ? { ...v, feedback_cm_status: status, unread_count: 0 } : v)
          }
        });
        // 隐藏回复模态框
        this.hideFeedbackCarmodelsModal();
      }
    });
  }

  // 回复列表滚动到底部
  scrollToBottom = () => {
    const reply_content = document.getElementById('carmodel_reply_content');
    reply_content.scrollTop = reply_content.scrollHeight;
  }

  // 导出反馈
  fetchFeedbackXls = () => {
    const { dispatch, FIELDS } = this.props;
    let fields = {...FIELDS};
    delete fields.page;
    delete fields.perpage;
    dispatch({
      type: 'carmodelFeedback/fetchFeedbackXls',
      payload: getNoEmptyParams(fields),
      callback: (tHeader, tbody) => {
        export2Excel(tHeader, tbody, '车型反馈_' + moment().format('YYYY_MM_DD'));
      }
    });
    
  }

  render() {
    const { loading, FIELDS, FEEDBACK_CARMODELS, FEEDBACK_CARMODEL_PROCESS } = this.props;
    const { isOpenImg, isOpen, selectedRowKeys, feedbackCarmodelsModalIsOpen, cur_row, reply_imgs, batchModalIsOpen, previewViewIndex } = this.state;

    return (
      <>
        <Card>
          <IndexSearchForm onSubmit={this.handleSubmit} />
          <Divider style={{ margin: '0 0 15px 0' }} />

          {/* 车型反馈列表 */}
          <Row type="flex" justify="space-between">
            <Col className="f20">车型反馈列表</Col>
            <Col>
              <Button type="dashed" icon="download" onClick={this.fetchFeedbackXls} loading={loading['carmodelFeedback/fetchFeedbackXls']}>批量导出</Button>
              <Divider type="vertical" />
              <Button type="primary" onClick={this.showBatchReplyModal} disabled={selectedRowKeys.length === 0}>
                批量处理
              </Button>
            </Col>
          </Row>

          <IndexTableList
            loading={loading['carmodelFeedback/fetchFeedbackCarmodels']}
            FIELDS={FIELDS}
            count={FEEDBACK_CARMODELS.count}
            data={FEEDBACK_CARMODELS.data}
            selectedRowKeys={selectedRowKeys}
            onFetchFeedbackCarmodels={this.fetchFeedbackCarmodels}
            onPreview={this.handlePreviewImage}
            onShowFeedbackCarmodelsModal={this.showFeedbackCarmodelsModal}
            onChangeRowSelection={this.handleChangeRowSelection}
          />
        </Card>
        {/* 车型反馈模态框 */}
        <FeedbackCarmodelsModal
          visible={feedbackCarmodelsModalIsOpen} loading={loading} reply_imgs={reply_imgs} cur_row={cur_row} list={FEEDBACK_CARMODEL_PROCESS}
          onOk={this.fetchFeedbackStatus} onCancel={this.hideFeedbackCarmodelsModal} onUploadPic={this.handleUploadFeedbackPic} onUpdatePic={this.handleUpdateFeedbackPic} onReply={this.fetchReply}  onPreviewImage={this.handlePreviewImage}
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
  ...state.carmodelFeedback,
});
export default connect(mapStateToProps)(CarmodelFeedback);
