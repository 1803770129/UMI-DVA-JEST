import React, { Component } from 'react';
import { Card, Icon, Row, Col} from 'antd';
import styles from './index.less';
import router from 'umi/router';
export default class IPUnlock extends Component {
  render() {
    return (
      <Card className={styles.factoryCategoryList}>
        <Card  title="数据统计">
          <Row gutter={16}>
            <Col span={8}>
              <Card title={<span><Icon type="area-chart" style={{marginRight:'10px',fontSize:'25px',color:'#1A82D2'}} /> <span style={{fontSize:'20px'}}>端口统计</span></span>} onClick={()=>{
                router.push('/system/systemfn/spart');
              }} style={{cursor:'pointer'}} hoverable={true}>
                <div>1. 各个端口的pv、uv、查询次数</div>
                <div>2. 各个端口的pv、uv、查询次数的趋势与数据比较</div>
                <div>3. 商户品牌的pv、uv、查询次数及其趋势</div>
              </Card>
            </Col>
          </Row>
        </Card>
        
        <Card className={styles.card} title="用户管理">
          <Row gutter={16}>
            <Col span={8}>
              <Card title={<span><Icon type="check-circle" style={{marginRight:'10px',fontSize:'25px',color:'green'}} /> <span style={{fontSize:'20px'}}>IP解封</span></span>} onClick={()=>{
                router.push('/system/systemfn/ipunlock');
              }} style={{cursor:'pointer'}} hoverable={true}>
              解封网关IP插件
              </Card>
            </Col>
            <Col span={8}>
              <Card title={<span><Icon type="user" style={{marginRight:'10px',fontSize:'25px',color:'green'}} /> <span style={{fontSize:'20px'}}>用户频率限制</span></span>} onClick={()=>{
                router.push('/system/systemfn/userlock');
              }} style={{cursor:'pointer'}} hoverable={true}>
              解封网关用户插件,永久封禁非法用户
              </Card>
            </Col>
            <Col span={8}>
            </Col>
          </Row> 
        </Card>
        <div className="app" title="appTitle" data-test="container">hahaha</div>
      </Card>
    );
  }
}