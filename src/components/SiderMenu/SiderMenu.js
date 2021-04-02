import React, { Component } from 'react';
import { Layout, Menu, Icon } from 'antd';
import Link from 'umi/link';
import classNames from 'classnames';
import styles from './index.less';
const { Sider } = Layout;
const { SubMenu, Item } = Menu;

const MenuLogo = props => {
  const { collapsed } = props;
  return (
    <div className={styles['menu_logo_box']}>
      <span className={classNames('iconfont', styles[collapsed ? 'meun_logo_mini' : 'meun_logo'])} />
    </div>
  );
};

// 转化路径
const conversionPath = path => {
  if (path && path.indexOf('http') === 0) {
    return path;
  } else {
    return `/${path || ''}`.replace(/\/+/g, '/');
  }
};

// 获取子菜单
const getSubMenuItems = item => {
  return (
    <Item key={item.path}>
      <Link to={conversionPath(item.path)}>
        {!item.children && item.icon && <Icon type={item.icon} />}
        <span>{item.name}</span>
      </Link>
    </Item>
  );
};

// 获取一级菜单
const getNavMenuItems = menusData => {
  if (!menusData) {
    return [];
  }

  return menusData.map(item => {
    return !item.children ? (
      getSubMenuItems(item)
    ) : (
      <SubMenu
        key={item.path}
        title={
          <span>
            <Icon type={item.icon} />
            <span>{item.name}</span>
          </span>
        }
      >
        {item.children.map(sub => getSubMenuItems(sub))}
      </SubMenu>
    );
  });
};

class SiderMenu extends Component {
  constructor(props) {
    super(props);
    this.menus = props.menuData;
    this.state = {
      openKeys: [],
      defaultOpenKeys: [],
      defaultSelectedKeys: [],
    };
  }

  componentDidMount() {
    // 处理默认展开的menu
    this.initOpenKeys();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      // 处理默认展开的menu
      this.initOpenKeys();
    }
  }

  componentWillUnmount() {
  
  }

  // 处理默认展开的menu
  initOpenKeys = () => {
    const props = this.props;
    const { location, menuData } = props;
    // const pathnameArr = this.props.location.pathname.split('/');
    // this.setState({
    //   openKeys: pathnameArr.length > 2 ? ['/' + pathnameArr[1]] : []
    // });
    this.setDefaultMenu(location.pathname, menuData);
  };

  // 初始化Menu默认选项
  setDefaultMenu = (pathname, menuData) => {
    const condition = pathname === '/';
    let defaultOpenKeys = [];
    let defaultSelectedKeys = [];
    let openKeys = [];
    if (!this.props.collapsed) {
      defaultOpenKeys = condition ? ['/baseorigin'] : ['/' + pathname.split('/')[1]];

      defaultSelectedKeys = condition
        ? // ? ['/baseorigin/list']
        ['/login']
        : [pathname];
      let keysArr = defaultSelectedKeys[0].split('/');
      if (keysArr.length > 3) {
        defaultSelectedKeys = [keysArr.filter((item, index) => index < 3).join('/')];
      }
      for (let i = 0; i < menuData.length; i++) {
        const menu = menuData[i];
        if (menu.path == defaultOpenKeys[0] && !menu.children) {
          defaultSelectedKeys = defaultOpenKeys;
        }
      }
      const pathnameArr = this.props.location.pathname.split('/');
      openKeys = pathnameArr.length > 2 ? ['/' + pathnameArr[1]] : [];
    }

    if (defaultSelectedKeys.length > 0 && defaultSelectedKeys[0].indexOf('/oe/cmcover') > -1) {
      defaultSelectedKeys = ['/oe/cmcover/-1'];
    }

    this.setState({
      defaultOpenKeys,
      defaultSelectedKeys,
      openKeys,
    });
  };

  // 同时只展开一个父级menu
  onOpenChange = openKeys => {
    const len = openKeys.length;
    this.setState({ openKeys: openKeys.splice(len - 1, len) });
  };

  render() {
    const props = this.props;
    const { collapsed, onCollapse, cls, menuData } = props;
    const { defaultOpenKeys, defaultSelectedKeys, openKeys } = this.state;
    return (
      <>
      {/* 添加滚动条 */}
        <Sider style={{overflow: 'auto',height: '100vh'}} trigger={null} collapsible collapsed={collapsed} breakpoint="lg" onCollapse={onCollapse} width={160} className={cls}>
          <MenuLogo {...props} />
          <Menu
            theme="dark"
            mode="inline"
            // inlineCollapsed={props.collapsed}
            // collapsed={props.collapsed}
            defaultOpenKeys={defaultOpenKeys}
            defaultSelectedKeys={defaultSelectedKeys}
            selectedKeys={defaultSelectedKeys}
            openKeys={openKeys}
            onOpenChange={this.onOpenChange}
            inlineIndent={0}
            style={{ padding: '16px 0 16px 0', width: '100%' }}
          >
            {getNavMenuItems(menuData)}
          </Menu>
        </Sider>
      </>
    );
  }
}

export default SiderMenu;
