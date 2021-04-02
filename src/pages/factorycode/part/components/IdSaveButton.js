import React from 'react';
import { Row, Col, Button, Affix } from 'antd';
import router from 'umi/router';

export default ({ postFields, fmsCategoryProps, onHandleSubmitFn }) => {
  const AttrHasError = fmsCategoryProps.some(item => item.validateStatus == 'error');
  const { partsku_codes = [], fms_brand_id, brand_category_id, fms_part_id, category_id } = postFields;
  const btnDisabled = partsku_codes.length === 0 || !fms_brand_id || !brand_category_id || !fms_part_id || !category_id || AttrHasError;
  return (
    <Affix offsetBottom={0}>
      <Row type="flex" align="middle" justify="space-between" style={{ padding: '15px 0', background: 'rgba(255,255,255, 0.1)' }}>
        <Col>
          {/* <Alert type="error" message="提示：产品信息属性不完整，请补全。" /> */}
        </Col>
        <Col>
          <Button type="primary" className="m-l-15" htmlType="submit" disabled={btnDisabled} onClick={e => { onHandleSubmitFn(e, 'saveAndOpen'); }}>保存并启用</Button>
          <Button type="primary" className="m-l-15" htmlType="submit" disabled={btnDisabled} onClick={e => { onHandleSubmitFn(e, 'save'); }}>保存</Button>
          <Button type="primary" ghost onClick={() => router.goBack()} className="m-l-15">返回产品列表</Button>
        </Col>
      </Row>
    </Affix>
  );
};