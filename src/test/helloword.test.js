import PART from '../pages/system/systemfn/spart';
import React from 'react';
import Enzyme,{shallow,mount} from 'enzyme';
import { connect } from 'dva';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });
it('Systems', () => {
  const mapStateToProps = (state) => {
    return {
      loading:state.loading.effects,
      ...state.statistics,
    };
  
  };
  const wrapper = mount(connect(mapStateToProps)(PART));
  console.log(wrapper);
      
});
