import System from '../pages/system/systemfn';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import { Card, Icon, Row, Col} from 'antd';
it('Systems', () => {
  // dom 测试
  // 仅能测试dom中展示的信息，    
  const div=document.createElement('div');
  ReactDOM.render(<System />,div);
  const container = div.getElementsByClassName('app');
  expect(container.length).toBe(1);
});
