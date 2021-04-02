import React, { useCallback, useMemo, useEffect } from 'react';
import { connect } from 'dva';
import { Card, Row, Divider, Table, Modal, Button } from 'antd';
import router from 'umi/router';
import { isEmpty } from 'lodash';
const { confirm } = Modal;
let timer = null, pendingOriginTableScroll = null, approvedOriginTableScroll = null;
const approvedOriginTableScrollFn = e => {
  approvedOriginTableScroll.scrollLeft = e.target.scrollLeft;
};
const pendingOriginTableScrollFn = e => {
  pendingOriginTableScroll.scrollLeft = e.target.scrollLeft;
};

const colRender = (columns, data) => {
  return columns.map(v => {
    return {
      ...v,
      render: (text) => {
        const diffData = data[0] || {};
        return (diffData[v.dataIndex] !== text && !isEmpty(data[0])) ? <span style={{background: 'red', color: 'white'}}>{text}</span> : (text || <span className="gray">-</span>);
      }
    };
  });
};

const BaseoriginApproveId = (props) => {
  const { dispatch, loading, match, CARMODEL_ORIGIN_PENDING_INFO } = props;
  const { id: cm_levelid } = match.params;

  // 构造对比状态
  const pendingOrigin = CARMODEL_ORIGIN_PENDING_INFO.pendingOrigin;
  const approvedOrigin = CARMODEL_ORIGIN_PENDING_INFO.approvedOrigin;
  const pendingOriginColumns = useMemo(() => colRender(CARMODEL_ORIGIN_PENDING_INFO.pendingOriginColumns, approvedOrigin), [CARMODEL_ORIGIN_PENDING_INFO]);
  const approvedOriginColumns = useMemo(() => colRender(CARMODEL_ORIGIN_PENDING_INFO.approvedOriginColumns, pendingOrigin), [CARMODEL_ORIGIN_PENDING_INFO]);

  const listenerScroll = () => {
    timer = setTimeout(() => {
      const pendingOriginTable = document.querySelector('#pendingOriginTable');
      const approvedOriginTable = document.querySelector('#approvedOriginTable');
      if(pendingOriginTable && approvedOriginTable) {
        pendingOriginTableScroll = pendingOriginTable.querySelector('.ant-table-body');
        approvedOriginTableScroll = approvedOriginTable.querySelector('.ant-table-body');
        pendingOriginTableScroll.addEventListener('scroll', approvedOriginTableScrollFn);
        approvedOriginTableScroll.addEventListener('scroll', pendingOriginTableScrollFn);
      }
    
    }, 300);
  };

  useEffect(() => {
    dispatch({
      type: 'baseorigin/fetchCarmodelOriginPendingInfo',
      payload: {
        cm_origin: 'liyang',
        cm_levelid
      },
      callback: () => {
        // 监听表格横向滚动条
        listenerScroll();
      }
    });

    return () => {
      // 状态清理
      clearTimeout(timer);
      pendingOriginTableScroll.removeEventListener('scroll', approvedOriginTableScrollFn);
      approvedOriginTableScroll.removeEventListener('scroll', pendingOriginTableScrollFn);
      dispatch({ type: 'baseorigin/updateCarmodelOriginPendingInfo' });
    };
  }, [cm_levelid]);

  /** 审核操作 */
  const handleApprove = useCallback((type) => {

    let title = '', content = '';
    if (type === 'approve') {
      title = '审核通过';
      content = '所选源车型将导入系统源车型库，并从待审核库中删掉。';
    } else if (type === 'unapprove') {
      title = ' 审核不通过';
      content = '所选源车型将从待审核库中删掉，无法找回。';
    }

    const payload = { cm_origin: 'liyang', cm_levelids: [cm_levelid] };

    confirm({
      title,
      content,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        if (type === 'approve') {
          dispatch({
            type: 'baseorigin/fetchCarmodelOriginApproved',
            payload
          });
        } else if (type === 'unapprove') {
          dispatch({
            type: 'baseorigin/fetchCarmodelOriginUnapproved',
            payload
          });
        }
      }
    });

  }, [cm_levelid]);

  const isBtnLoading = loading['baseorigin/fetchCarmodelOriginApproved'] || loading['baseorigin/fetchCarmodelOriginUnapproved'];

  return (
    <Card loading={loading['baseorigin/fetchCarmodelOriginPendingInfo']}>
      <Row className="f18">待审核源车型</Row>
      <Table id="pendingOriginTable" className="m-t-15" loading={loading['baseorigin/fetchCarmodelOriginPendingList']} columns={pendingOriginColumns} dataSource={CARMODEL_ORIGIN_PENDING_INFO.pendingOrigin} rowKey="cm_levelid" bordered pagination={false} scroll={ {x: CARMODEL_ORIGIN_PENDING_INFO.pendingOrigin.length > 0 ? 14000 : 'auto'} } />
      <Row className="m-t-15 f18">已导入源车型</Row>
      <Table id="approvedOriginTable" className="m-t-15" loading={loading['baseorigin/fetchCarmodelOriginPendingList']} columns={approvedOriginColumns} dataSource={CARMODEL_ORIGIN_PENDING_INFO.approvedOrigin} rowKey="cm_levelid" bordered pagination={false} scroll={ {x: CARMODEL_ORIGIN_PENDING_INFO.approvedOrigin.length > 0 ? 14000 : 'auto'} } />
      <Row className="text-center m-t-15">
        <Button type="primary" onClick={() => handleApprove('approve')} loading={isBtnLoading}>审核通过</Button>
        <Divider type="vertical" />
        <Button type="danger" onClick={() => handleApprove('unapprove')} loading={isBtnLoading}>审核不通过</Button>
        <Divider type="vertical" />
        <Button type="primary" ghost onClick={router.goBack}>返回列表</Button>
      </Row>
    </Card>

  );
};

const mapStateToProps = state => ({
  loading: state.loading.effects,
  CARMODEL_ORIGIN_PENDING_INFO: state.baseorigin.CARMODEL_ORIGIN_PENDING_INFO
});

export default connect(mapStateToProps)(BaseoriginApproveId);
