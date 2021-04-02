import React from 'react';
import { Table, message, Badge, } from 'antd';
import { thumbnail, originalImage, isEmpty } from 'utils/tools';
import styles from './IndexTableList.less';
import classNames from 'classnames';

export default ({ loading, FIELDS, data, count, selectedRowKeys, onFetchFeedbackCarmodels, onShowFeedbackCarmodelsModal, onPreview, onChangeRowSelection }) => {

  const columns = [
    { title: '反馈单号', dataIndex: 'feedback_cm_code', width: 130, },
    { title: '反馈车型', dataIndex: 'feedback_cm_car' },
    {
      title: '问题描述',
      dataIndex: 'feedback_cm_content',
      render: (text, row, index) => <div className={classNames(styles.break_all, 'cur blue6')} onClick={() => onShowFeedbackCarmodelsModal(row)}>{text}</div>
    },
    {
      title: '反馈图片', dataIndex: 'feedback_cm_images', width: 90,
      render: (v = [], record, index) => {
        const imgs = v.map(img => img.feedback_cm_image_url).filter(url => !!url);
        const count = imgs.length > 1 ? imgs.length : 0;
        return (
          <>
            {
              imgs.length > 0 ?
                <Badge style={{ backgroundColor: '#CCC' }} count={count} offset={[0, 45]}>
                  <div className={styles.img_box}>
                    <img className={styles.img} src={thumbnail(imgs[0])} onClick={() => onPreview(imgs)} />
                  </div>
                </Badge>
                : '-'
            }
          </>
        );
      }
    },
    { title: '反馈人', dataIndex: 'person_name', width: 90, },
    { title: '联系电话', dataIndex: 'feedback_cm_phone', width: 90, },
    { title: '反馈时间', dataIndex: 'feedback_cm_time', width: 135, },
    {
      title: '处理状态', dataIndex: 'feedback_cm_status', width: 90,
      render: (v, record, index) => {
        const { unread_count } = record;
        const Msg = () => {
          return unread_count > 0 && <div className="red6">新消息({unread_count})</div>;
        };
        // PENDING:待处理， PROCESSING:处理中，OVER:已处理, UNREAD: 消息未读
        switch (v) {
          case 'UNREAD':
            return <div className="text-center"><span className="green5">消息未读</span><Msg/></div>;
          case 'PENDING':
            return <div className="text-center"><span className="red6">待处理</span><Msg/></div>;
          case 'PROCESSING':
            return <div className="text-center"><span className="gold6">处理中</span><Msg/></div>;
          case 'OVER':
            return <div className="text-center"><span>已处理</span><Msg/></div>;
          default:
            return <div className="text-center"><span></span><Msg/></div>;
        }
      }
    },
    { title: '负责人', dataIndex: 'feedback_cm_staff', width: 90, },
  ].map(v => {
    // 统一处理render
    if (!v.render) {
      return {
        ...v,
        render: (text, record, index) => {
          return text || '-';
        }
      };
    } else {
      return v;
    }
  });
  const rowSelection = {
    selectedRowKeys,
    onChange: onChangeRowSelection
  };

  const tableProps = {
    loading,
    className: classNames('m-t-15', styles.feedback_table),
    bordered: true,
    dataSource: data,
    columns,
    rowKey: (item, index) => item.feedback_cm_id,
    rowSelection,
    pagination: {
      total: parseInt(count, 10),
      pageSize: FIELDS.perpage,
      current: FIELDS.page,
      showSizeChanger: true,
      onShowSizeChange: (page, perpage) => {
        onFetchFeedbackCarmodels({ ...FIELDS, page: 1, perpage });
      },
      onChange: (page, perpage) => {
        onFetchFeedbackCarmodels({ ...FIELDS, page, perpage });
      },
      showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`
    }
  };

  return (
    <Table {...tableProps} />
  );
};