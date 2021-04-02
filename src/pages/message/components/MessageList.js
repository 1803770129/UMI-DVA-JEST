import React from 'react';
import { Row, Col, Icon } from 'antd';
import styles from './MessageList.less';
import classNames from 'classnames';
import moment from 'moment';

export default ({data = [], onActive}) => {

  return (
    <React.Fragment>
      {
        data.map((item, index) => {
          let meg_type = '';
          if (item.msg_type_code === 'CARMODEL_FEEDBACK') {
            meg_type = '【车型反馈】';
          } else if (item.msg_type_code === 'PARTSKU_FEEDBACK') {
            meg_type = '【产品反馈】';
          } else if (item.msg_type_code === 'SYSTEM_FEEDBACK') {
            meg_type = '【功能反馈】';
          } else {
            meg_type = '【服务通知】';
          }

          const isToday  = moment(new Date()).isSame(item.create_time, 'day');
          return (
            <Row className={styles.row} key={index} onClick={()=> onActive(item)}>
              <Col className={classNames(styles.title, 'cur')}>
                {/* 消息读取flag  1:未读  2：已读 */}
                <Icon type="sound" className="gray m-r-5" theme={item.msg_read_flag === 1 && 'twoTone'} />
                {meg_type}<span className={styles.link}>{item.msg_note}</span>
              </Col>
              <Col className={classNames({'C6': isToday, 'gray': !isToday})}>{item.create_time}</Col>
            </Row>
          );
        })
      }

    </React.Fragment>
  );
};