import { Row, Col, Affix, Button } from 'antd';
import router from 'umi/router';

const SaveButton = ({ onSubmit }) => {
  const valid = false;
  return (
    <Affix offsetBottom={0}>
      <Row type="flex" align="middle" justify="space-between" style={{ padding: '15px 32px 15px 0', background: 'rgba(255,255,255, 0.1)' }}>
        <Col>

        </Col>
        <Col>
          <Button type="primary" onClick={onSubmit} disabled={valid}>保存</Button>
          <Button type="primary" ghost onClick={() => router.goBack()} className="m-l-15">取消</Button>
        </Col>
      </Row>
    </Affix>
  );
};

export default SaveButton;