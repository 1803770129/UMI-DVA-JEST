import SYS from '../pages/system/systemfn';
import PART from '../pages/system/systemfn/spart';
import React from 'react';
import Enzyme,{shallow,mount} from 'enzyme';
import { connect } from 'dva';
import Adapter from 'enzyme-adapter-react-16';
import store from '../models/statistics';
Enzyme.configure({ adapter: new Adapter() });
it('Systems', () => {
  const Parts = PART;
  const s=SYS;
  const COMPONENT=Parts.WrappedComponent; 
  // console.log(s); 
  // const wrapper = mount(<COMPONENT loading={store.namespace+'/'+store.effects.fetchPartList} />);
  const wrapper = mount(<COMPONENT store={store} loading={store.effects.fetchPartList} />);
  // const wrapper = mount(<SYS />);
  console.log(...wrapper);
});