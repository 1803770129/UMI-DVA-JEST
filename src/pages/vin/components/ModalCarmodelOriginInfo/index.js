import React from 'react';
import { Modal, Tabs, List, Card, Spin } from 'antd';
import ReactJson from 'react-json-view';
import styles from './index.less';
const TabPane = Tabs.TabPane;

const TableData = ({ row }) => {
  return (
    <div className={styles.modal_Tab_pane}>
      <List size="small" grid={{ gutter: 8, column: 4 }} dataSource={row.list} renderItem={item => {
        return (
          <List.Item>
            <Card title={<span className="c9" style={{ fontWeight: 'normal' }}>{item.name}</span>} className="c3">{item.val || <span style={{ padding: 8 }}></span>}</Card>
          </List.Item>
        );
      }}
      />
    </div>
  );
};


const ModalCarmodelOriginInfo = ({ CARMODEL_ORIGIN_INFO, visible, isLoading, onClose }) => {
  const { originCarmodel, stdCarmodel } = CARMODEL_ORIGIN_INFO;
  const config = {
    title: '车型详情',
    visible: visible,
    onCancel: onClose,
    width: '1250px',
    destroyOnClose: true,
    style: { top: 30 },
    footer: null
  };

  return (
    <Modal {...config}>
      <Spin spinning={isLoading}>
        <Tabs defaultActiveKey="origin_detail" tabPosition="left" size="small" className={styles.modal_tabs}>
          <TabPane tab="源车型记录" key={'origin_detail'}>
            <ReactJson src={originCarmodel} displayDataTypes={false} displayObjectSize={false} style={{ fontSize: 12, maxHeight: 490, overflowY: 'auto' }} />
          </TabPane>
          {
            stdCarmodel.map(item => {
              return (
                <TabPane tab={item.name} key={item.key}>
                  <TableData row={item} />
                </TabPane>
              );
            })
          }
        </Tabs>
      </Spin>
    </Modal>
  );
};

export default ModalCarmodelOriginInfo;