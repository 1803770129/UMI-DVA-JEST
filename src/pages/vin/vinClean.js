import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Button, Input, Row, Col, Divider, message } from 'antd';
import { convertVinCode } from '@/utils/tools';
const FormItem = Form.Item;

class VinClean extends Component {

    state = {
      vin_code: ''
    };

    render() {

      // 提交清除
      const submitFn = () => {
        const { vin_code } = this.state;
        if(vin_code == '') return;
        this.props.dispatch({
          type: 'vin_clean/cleanVinLevelId',
          payload: { 
            vin_code: vin_code.replace(/-/g, ''),
            cb: () => {
              message.success('缓存清理成功');
              this.setState({ vin_code: '' });
            }
          }
        });
      };

      // 格式化VIN
      const onChangeVinCodeFn = code => this.setState({ vin_code: convertVinCode(code) });

      return (
        <Card>
          <Row type="flex" justify="space-between">
            <Col className="f16">VIN缓存清理</Col>
          </Row>
          <Divider />
          <Form layout="inline">
            <FormItem label="">
              <Input 
                value={this.state.vin_code} 
                placeholder="请输入17位的VIN码"
                style={{ width: 200 }} 
                onChange={ e => onChangeVinCodeFn(e.target.value) } 
              />
            </FormItem>
            <FormItem>
              <Button type="primary" onClick={ () => submitFn()}>确定</Button>
            </FormItem>
          </Form>
        </Card>
      );
    }
};

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.vin_clean
});

export default connect(mapStateToProps)(VinClean);