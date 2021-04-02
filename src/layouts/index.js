import React, { Component } from 'react';
import { connect } from 'dva';
import withRouter from 'umi/withRouter';
import SimpleLayout from '@/layouts/SimpleLayout';
import DocumentTitle from 'react-document-title';
import { ConfigProvider, Layout, Icon, Badge, Menu, Dropdown } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { enquireScreen } from 'enquire-js';
import { ContainerQuery } from 'react-container-query';
import breadcrumb from '@/common/breadcrumb';
import SiderMenu from '@/components/SiderMenu';
import classNames from 'classnames';
import styles from './index.less';
import simplePages from '@/common/simplePages';
import Redirect from 'umi/redirect';
import MainHeaderLayout from './MainHeaderLayout';
import { getLocal } from '@/utils/tools';
const { Header, Content } = Layout;

let isMobile;
enquireScreen(b => {
  isMobile = b;
});

const query = {
  'screen-xs': {
    maxWidth: 575
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1365
  },
  'screen-xl': {
    minWidth: 1366,
    maxWidth: 1919
  },
  'screen-xxl': {
    minWidth: 1920
  }
};

class MainLayout extends Component {
    state = {
      isMobile
    };

    componentDidMount() {
      // console.log('componentDidMount');
      enquireScreen(mobile => {
        this.setState({
          isMobile: mobile,
        });
      });

    }

    setPageTitle = (pageTitle)=> {
      return pageTitle ? pageTitle + ' - 搜配' : '审核后台 - 搜配';
    };

    handleMenuCollapse = collapsed => {
      this.props.dispatch({
        type: 'main/changeMainLayoutCollapsed',
        payload: collapsed,
      });
    };


    // 构造面包屑数据
    getBreadcrumbData = () => {
      const {location} = this.props;
      let res = breadcrumb.filter(item => item.regexp.test(location.pathname));
      return this.getMeunName(res);
    };

    // 获取menuname
    getMeunName = (currentMatch) => {
      let pageTitle = '';
      let breadcrumbData = [];
      if(currentMatch.length > 0) {
        if(currentMatch[0].list){
          breadcrumbData = currentMatch[0].list.map(item => {
            return {
              breadcrumbName: item[0],
              path: item[1]
            };
          });
        }
        pageTitle = currentMatch[0].title;
      }
      return {pageTitle, breadcrumbData};
    };

    render() {
      const { children, collapsed, location, MESSAGES = [], MENU_DATA } = this.props;
      if(location.pathname === '/') {
        return <Redirect to="/login" />;
      }
      const {pageTitle, breadcrumbData} = this.getBreadcrumbData();
      if(simplePages.includes(location.pathname)){
        // 非mainLayouts布局的页面
        return (
          <div><SimpleLayout {...this.props} pageTitle={this.setPageTitle(pageTitle)} breadcrumbData={breadcrumbData}>{ children }</SimpleLayout></div>
        );
      }

      // 消息总数(需要过滤掉权限外的消息数量)
      const msgCount = MESSAGES.map(v => parseInt(v.count, 10)).reduce((accumulator, currentValue)=> accumulator += currentValue, 0);
      //退出登录
      const signOut = () => {
        localStorage.clear();
        this.props.dispatch({
          type:'main/loginOut'
        });
        window.location.replace('/#/login');
      };
      const updatePassword = () =>{
        this.props.history.push('/updatepassword');
      };
      const msgMenu = (
        <Menu>
          {
            MESSAGES.map((item, idx) => {
              const count = parseInt(item.count, 10);
              return (
                <Menu.Item key={item.msg_type_identification}>
                  <a href={`/#/message?active=${item.msg_type_identification}`}>
                    {count > 0 ? <Badge count={count} title={`${item.count}条未读消息`}>
                      {item.msg_title}&nbsp;&nbsp;&nbsp;
                    </Badge> : <>{item.msg_title}&nbsp;&nbsp;&nbsp;</>}
                  </a>
                </Menu.Item>
              );
            })
          }
          <Menu.Item onClick={updatePassword}>修改密码</Menu.Item>
          <Menu.Item onClick={signOut}>退出登录</Menu.Item>
        </Menu>
      );

      const { isMobile } = this.state;
      let LayoutStyle = !isMobile ? {'marginLeft': collapsed ? 80 : 170} : {};
      const layout = <Layout>
        {/* 侧边栏 */}
        <SiderMenu menuData={MENU_DATA} collapsed={collapsed} location={location} isMobile={isMobile} onCollapse={this.handleMenuCollapse}/>
        {/* 右侧布局 */}
        <Layout style={LayoutStyle}>
          {/* Header */}
          <Header className={styles.header}>
            {isMobile &&
                    <span>
                      <span className={classNames(styles['header_logo'], 'iconfont icon-lingxing')}></span>
                      <span className={styles.divider}></span>
                    </span>
            }

            <Icon className={classNames(styles.trigger, 'cur')} type={collapsed ? 'menu-unfold' : 'menu-fold'} onClick={()=>this.handleMenuCollapse(!collapsed)} />

            {/* 右侧menu */}
            <span className={styles.topRight}>
              <Badge offset={[-40,20]} count={msgCount} title={`${msgCount}条未读消息`}>
                <Dropdown overlay={msgMenu} placement="bottomCenter">
                  <span className={styles.dropDownMenu + ' link cur'}><Icon type="user" className={classNames(styles.messageIcon, 'cur')} /></span>
                </Dropdown>
              </Badge>
            </span>

          </Header>
          {/* Content */}
          <MainHeaderLayout pageTitle={pageTitle} breadcrumbData={breadcrumbData}>
            <Content className={styles.content}>
              {children}
            </Content>
          </MainHeaderLayout>
        </Layout>
      </Layout>;
      return (
        <ConfigProvider locale={zhCN}>
          <DocumentTitle title={this.setPageTitle(pageTitle)}>
            <ContainerQuery query={query}>
              {params =>(
                <div className={classNames(params)}>{layout}</div>
              )}
            </ContainerQuery>
          </DocumentTitle>
        </ConfigProvider>
      );
    }
}

const mapStateToProps = state => ({
  collapsed: state.main.collapsed,
  ...state.FEEDBACK_MSG,
  MENU_DATA: state.global.MENU_DATA
});
export default withRouter(connect(mapStateToProps)(MainLayout));
