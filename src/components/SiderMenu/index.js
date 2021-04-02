import React from 'react';
import DrawerMenu from 'rc-drawer-menu';
import 'rc-drawer-menu/assets/index.css';
import SiderMenu from './SiderMenu';
import styles from './index.less';

export default props =>
// props.isMobile ? (
        
//   <DrawerMenu parent={null} level={null} iconChild={null} open={!props.collapsed} width="200px"
//     onMaskClick={() => {
//       props.onCollapse(true);
//     }}
//   >
//     <SiderMenu {...props} collapsed={props.isMobile ? false : props.collapsed} />
            
  //   </DrawerMenu>
  // ) : (
  <SiderMenu {...props} cls={styles.sider} />;
// );