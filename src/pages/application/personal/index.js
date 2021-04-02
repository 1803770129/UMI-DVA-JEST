import React, { Component } from 'react';
import { Card , Col, Row} from 'antd';
import styles from './index.less';
import {connect} from 'dva';
import router from 'umi/router';
export default class index extends Component {
  render() {
    return (
      <Card className={styles.factoryCategoryList} onClick={()=>{
        router.push('/application/personal/usercolor');
      }}>
        <Row gutter={16}>
          <Col span={8}>
            <Card title="个性端口-用户自定义颜色" style={{cursor:'pointer'}}>
              新增、修改、删除个性端口的颜色
            </Card>
          </Col>
          <Col span={8}>
          </Col>
          <Col span={8}>
          </Col>
        </Row>
      </Card>
    );
  }
}
