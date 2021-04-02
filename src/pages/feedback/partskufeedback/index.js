import React, { Component } from 'react';
import { Card, Divider, Form, Select, Row, Col, Button, Table, Badge, Modal, Input, Radio } from 'antd';
import InputClose from 'components/InputClose';
import { thumbnail, originalImage, isEmpty, sleep, getPicSize } from 'utils/tools';
import styles from './index.less';
import { PhotoSwipe } from 'react-photoswipe';
import router from 'umi/router';
import TopForm from './components/TopForm';
import ReplyModal from './components/ReplyModal';
import { connect } from 'dva';
import moment from 'moment';
import export2Excel from '@/utils/export2Excel';
import classNames from 'classnames';
const { confirm } = Modal;

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
class Partskufeedback extends Component {

  state = {
    cur_row: {},
    ten_feedback_ids: [],
    isOpen: false,
    isOpenImg: [],
    previewViewIndex: 0,
    replyModalIsOpen: false,
  }


  // 点击回复消息
  handleReply = record => {
    // 缓存当前行数据
    this.setState({ cur_row: record }, () => {
      // 显示回复模态框
      this.showReplyModal();
      // 获取回复列表
      this.fetchFeedbackProcess();
    });
  };


  // 获取回复列表
  fetchFeedbackProcess = () => {
    const { dispatch } = this.props;
    const { cur_row } = this.state;
    const { ten_feedback_id } = cur_row;
    dispatch({
      type: 'partskufeedback/fetchFeedbackProcess',
      payload: { ten_feedback_id }
    });
  }

  // 显示回复模态框
  showReplyModal = () => {
    this.setState({
      replyModalIsOpen: true
    });
  }

  // 隐藏回复模态框
  hideReplyModal = () => {
    this.setState({
      replyModalIsOpen: false
    });
  }

  // 表单change事件
  handleTopFormChange = async (key, value) => {
    const { form, FIELDS } = this.props;
    const { perpage } = FIELDS;
    const { getFieldsValue } = form;
    // change事件存在延迟，也可用onSelect事件代替
    await sleep(10);
    const fields = getFieldsValue();
    // 重新拉取列表数据
    this.fetchPartskuFeedbacks({ ...fields, page: 1, perpage });
  };

  // 获取品类列表
  fetchCategories = ten_brand_id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'partskufeedback/fetchCategories',
      payload: { ten_brand_id }
    });
  };

  // 获取反馈列表
  fetchPartskuFeedbacks = payload => {
    const { dispatch } = this.props;
    // 清空ten_feedback_ids
    this.setState({ ten_feedback_ids: [] });
    dispatch({
      type: 'partskufeedback/fetchPartskuFeedbacks',
      payload: getNoEmptyParams(payload)
    });
  };

  // 搜索
  handleSubmit = e => {
    const { form, FIELDS } = this.props;
    const { perpage } = FIELDS;
    const { validateFields } = form;
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        this.fetchPartskuFeedbacks({ ...values, page: 1, perpage });
      }
    });
  };

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


  // 批量操作
  fetchFeedbacksOperation = () => {
    const { ten_feedback_ids } = this.state;
    const { dispatch, PARTSKU_FEEDBACKS } = this.props;
    const _ten_feedback_ids = [...ten_feedback_ids];
    const ten_feedback_operation = 'OVER';
    // 提示
    confirm({
      title: '批量操作',
      content: '是否批量确定操作状态',
      onOk: () => {
        dispatch({
          type: 'partskufeedback/fetchFeedbacksOperation',
          payload: { ten_feedback_ids, ten_feedback_operation },
          callback: () => {
            // 更新处理状态
            dispatch({
              type: 'partskufeedback/updatePartskuFeedbacks',
              payload: {
                ...PARTSKU_FEEDBACKS,
                data: PARTSKU_FEEDBACKS.data.map(v => _ten_feedback_ids.includes(v.ten_feedback_id) ? { ...v, ten_feedback_operation } : v)
              }
            });
            // 清空ten_feedback_ids
            this.setState({ ten_feedback_ids: [] });
          }
        });
      },
      onCancel: () => {
       
      },
    });


  };

  // 导出反馈
  fetchFeedbackXls = () => {
    const { dispatch, FIELDS } = this.props;
    let fields = { ...FIELDS };
    delete fields.page;
    delete fields.perpage;
    dispatch({
      type: 'partskufeedback/fetchFeedbackXls',
      payload: getNoEmptyParams(fields),
      callback: (tHeader, tbody) => {
        export2Excel(tHeader, tbody, '产品反馈_' + moment().format('YYYY_MM_DD'));
      }
    });

  }

  render() {
    const { isOpenImg, isOpen, previewViewIndex, replyModalIsOpen, ten_feedback_ids, cur_row } = this.state;
    const { form, loading, PARTSKU_FEEDBACKS, FEEDBACK_PROCESS, CATEGORIES, FIELDS } = this.props;
    const rowSelection = {
      selectedRowKeys: ten_feedback_ids,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ ten_feedback_ids: selectedRowKeys });
      }
    };
    // 分页配置
    const pagination = {
      total: parseInt(PARTSKU_FEEDBACKS.count, 10),
      pageSize: FIELDS.perpage,
      current: FIELDS.page,
      showSizeChanger: true,
      onShowSizeChange: (page, perpage) => {
        this.fetchPartskuFeedbacks({ ...FIELDS, page: 1, perpage });
      },
      onChange: (page, perpage) => {
        this.fetchPartskuFeedbacks({ ...FIELDS, page, perpage });
      },
      showTotal: (total, range) =>
        `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`
    };
    const columns = [{
      title: '反馈单号',
      dataIndex: 'ten_feedback_code',
      width: 125
    }, {
      title: '品牌',
      width: 90,
      dataIndex: 'ten_brand_name'
    }, {
      title: '产品',
      width: 100,
      dataIndex: 'brand_category_name'
    }, {
      title: '产品编码',
      dataIndex: 'ten_partsku_code'
    }, {
      title: '反馈内容',
      dataIndex: 'ten_feedback_content',
      render: (v , record, index) => {
        return (
          <span className="cur link" onClick={() => this.handleReply(record)}>
            {v}
          </span>
        );
      }
    }, {
      title: '反馈图片',
      dataIndex: 'ten_feedback_images',
      render: (v = [], record, index) => {
        const imgs = v.map(img => img.ten_feedback_image_url).filter(url => !!url);
        const count = imgs.length > 1 ? imgs.length : 0;
        return (
          <>
            {
              imgs.length > 0 ?
                <Badge style={{ backgroundColor: '#CCC' }} count={count} offset={[0, 45]}>
                  <div className={styles.img_box}>
                    <img className={styles.img} src={thumbnail(imgs[0])} onClick={() => {
                      this.handlePreviewImage(imgs);
                    }} />
                  </div>
                </Badge>
                : '-'
            }
          </>
        );
      }
    }, {
      title: '反馈人',
      dataIndex: 'person_name',
      width: 90
    }, {
      title: '联系电话',
      dataIndex: 'ten_feedback_phone',
      width: 110
    }, {
      title: '反馈时间',
      width: 100,
      dataIndex: 'ten_feedback_time'
    }, {
      title: '处理状态',
      dataIndex: 'ten_feedback_status',
      render: (v, record, index) => {
        // PENDING:待处理， PROCESSING:处理中，OVER:已处理, UNREAD: 消息未读
        switch (v) {
          case 'UNREAD':
            return <span className="green5">消息未读</span>;
          case 'PENDING':
            return <span className="red6">待处理</span>;
          case 'PROCESSING':
            return <span className="gold6">处理中</span>;
          case 'OVER':
            return <span className="gold6">已处理</span>;
          default:
            return '';
        }
      }
    }, {
      title: '操作状态',
      dataIndex: 'ten_feedback_operation',
      render: (v, record, index) => {
        // PENDING:未确定， OVER:已确定
        switch (v) {
          case 'PENDING':
            return <span className="red6">未确定</span>;
          default:
            return <span>已确定</span>;
        }
      }
    }].map(item => {
      // 统一处理render
      if (!item.render) {
        return {
          ...item,
          render: (text, record, index) => {
            return text || '-';
          }
        };
      } else {
        return item;
      }

    });
    return (
      <Card bordered={false} className="m-t-15 m-b-15">
        {/* 搜索表单 */}
        <TopForm form={form} CATEGORIES={CATEGORIES} onTopFormChange={this.handleTopFormChange} onSubmit={this.handleSubmit}
        />
        <Divider style={{ margin: '0 0 15px 0' }} />
        {/* 标题栏 */}
        <Row>
          <Col span={12} className="f20">
            产品反馈列表
          </Col>
          <Col span={12} className="text-right">
            <Button type="dashed" icon="download" onClick={this.fetchFeedbackXls} loading={loading['partskufeedback/fetchFeedbackXls']}>批量导出</Button>
            <Divider type="vertical" />
            <Button type="primary" onClick={this.fetchFeedbacksOperation} disabled={ten_feedback_ids.length === 0}>批量操作</Button>
          </Col>
        </Row>
        {/* 反馈列表 */}
        <Table className={classNames('m-t-15', styles.feedback_table)} loading={loading['partskufeedback/fetchPartskuFeedbacks']} bordered dataSource={PARTSKU_FEEDBACKS.data} columns={columns} pagination={pagination} rowSelection={rowSelection} rowKey={(record, index) => record.ten_feedback_id} />
        {/* 图片预览 */}
        <PhotoSwipe isOpen={isOpen} items={isOpenImg} options={{ index: previewViewIndex }} onClose={this.handleCloseImg} />
        {/* 回复模态框 */}
        <ReplyModal
          visible={replyModalIsOpen} FEEDBACK_PROCESS={FEEDBACK_PROCESS} cur_row={cur_row}
          onPreviewImage={this.handlePreviewImage} onCancel={this.hideReplyModal}
        />
      </Card>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.partskufeedback,
  ...state.global
});
export default connect(mapStateToProps)(Form.create()(Partskufeedback));
