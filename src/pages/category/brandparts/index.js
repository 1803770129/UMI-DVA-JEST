import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Button, Divider, Modal, message } from 'antd';
import IndexTableList from './components/IndexTableList';
import ListSearchForm from './components/ListSearchForm';
import PageLoading from '@/components/PageLoading/index';
import { clone } from '@/utils/tools';
import styles from './index.less';
const confirm = Modal.confirm;

// 页面组件
class BrandParts extends Component {

    state = {
      pageLoading: false
    };

    componentDidMount() {
      const { page, perpage ,fields} = this.props;
      this.pageInit();
      this.cmdBrandpartsUserRecordList({page, perpage,fields});
    };
    cmdBrandpartsUserRecordList=(list)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:list,
        record_page:' 品类产品/品牌件',
        record_operations:'查看品牌件页面'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    componentWillUnmount() {
      const { history, dispatch } = this.props;
      const routeTo = history.location.pathname;
      // 离开到非编辑页面，清理选择项目
      if (routeTo.indexOf('/category/brandparts/') == -1) {
        dispatch({ type: 'category_brandparts/clearState' });
      }
    }

    pageInit = () => {
      this.setState({pageLoading: true});
      const { dispatch, brand_category_id, category_name, page, perpage } = this.props;
      dispatch({
        type: 'category_brandparts/fetchListInitFn',
        payload: {
          brand_category_id,
          category_name,
          page,
          perpage,
          cb: () => this.setState({pageLoading: false})
        }
      });
    }

    // 抓取列表数据
    fetchList = (brand_category_id, category_name, page, perpage) => {
      this.setState({pageLoading: true});
      this.props.dispatch({
        type: 'category_brandparts/fetchBrandCategoryProductList',
        payload: {
          brand_category_id: brand_category_id,
          category_name: category_name,
          page: page,
          perpage: perpage,
          cb: () => this.setState({pageLoading: false})
        }
      });
    }

    // 表格分页
    onHandleTableChangeFn = page => {
      const { dispatch, brand_category_id, category_name, perpage } = this.props;
      dispatch({ type: 'category_brandparts/updatePage', payload: { page: page, perpage: perpage }});
      this.fetchList(brand_category_id, category_name, page, perpage);
    };

    // 改变单页数量
    onShowSizeChangeFn = (current, perpage) => {
      const { dispatch, brand_category_id, category_name } = this.props;
      dispatch({ type: 'category_brandparts/updatePage', payload: { page: 1, perpage: perpage }});
      this.fetchList(brand_category_id, category_name, 1, perpage);
    };
    onfetchOemCoverChangeFn=(id)=>{
       this.props.dispatch({
        type: 'oe_cmcover/fetchOemCoverChange',
        payload: { category_id:id }
      });
    }
    // ************************ 品类操作 ************************
    // 删除品类
    onRemoveCategoryFn = brand_category_id => {
      confirm({
        content: '确定删除当前品类么？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.props.dispatch({
            type: 'category_brandparts/deleteBrandCategory',
            payload: {
              brand_category_id: brand_category_id,
              cb: () => this.pageInit()
            }
          });
          this.RemoveCategoryUserRecordList(brand_category_id);
        }

      });

    }
    RemoveCategoryUserRecordList=(brand_category_id)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:{
          'brand_category_id':brand_category_id
        },
        record_page:' 品类产品/品牌件',
        record_operations:'删除品牌件'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    // 修改品类状态
    onChangeCategoryStatusFn = (checked, brand_category_id) => {
      // 更新品类状态【产品同步】
      const updateCategoryStatusFn = status => {
        let newBrandCategoryProductList = clone(brandCategoryProductList);
        let newList = clone(brandCategoryProductList.list);
        let index = 0;
        for(let i = 0; i < newList.length; i++) {
          if(newList[i].brand_category_id == brand_category_id) {
            index = i;
            break;
          }
        }
        newList[index].brand_category_status = status;
        if(newList[index].children) {
          let newChildren = [...newList[index].children];
          for(let i = 0; i < newChildren.length; i++) {
            newChildren[i].brand_category_status = status;
          }
          newList[index].children = [...newChildren];
          newBrandCategoryProductList.list = [...newList];

          dispatch({
            type: 'category_brandparts/updateBrandCategoryProductList',
            payload: newBrandCategoryProductList
          });

        }
      };

      const { dispatch, brandCategoryProductList } = this.props;
      dispatch({
        type: 'category_brandparts/updateBrandCategoryStatus',
        payload: {
          brand_category_id: brand_category_id,
          brand_category_status: checked ? 'ENABLE' : 'DISABLE',
          cb: res => {
            if(res.code === 0) {
              // 更新品类状态
              updateCategoryStatusFn(checked ? 'ENABLE' : 'DISABLE');
              message.success('状态更新成功');
              this.pageInit();
              this.ChangeCategoryStatusUserRecordList(checked, brand_category_id);
            } else {
              // 恢复品类状态
              updateCategoryStatusFn(!checked ? 'ENABLE' : 'DISABLE');
              message.error('状态更新失败');
            }
          }
        }
      });
    }
    ChangeCategoryStatusUserRecordList=(checked, brand_category_id)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:{
          'brand_category_id':brand_category_id,
          'brand_category_status':checked ? 'ENABLE' : 'DISABLE'
        },
        record_page:' 品类产品/品牌件',
        record_operations:'修改品类状态'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    // ************************ 产品操作 ************************
    // 修改产品状态
    onHandleChangeProductStatusFn = (checked, brand_category_id, index) => {
      const { dispatch, brandCategoryProductList } = this.props;
      dispatch({
        type: 'category_brandparts/updateBrandCategoryStatus',
        payload: {
          brand_category_id: brand_category_id,
          brand_category_status: checked ? 'ENABLE' : 'DISABLE',
          cb: res => {
            if(res.code == 0) {
              updateProductStatusFn(checked ? 'ENABLE' : 'DISABLE');
              message.success('状态更新成功');
              this.pageInit();
              this.ChangeProductStatusUserRecordList(checked, brand_category_id);
            } else {
              updateProductStatusFn(!checked ? 'ENABLE' : 'DISABLE');
              message.error('状态更新失败');
            }
          }
        }
      });

      const updateProductStatusFn = status => {
        let categoryIndex = 0;
        for(let i = 0; i < brandCategoryProductList.list.length; i++) {
          let cates = brandCategoryProductList.list[i].children;
          let flag = false;
          for(let j = 0; j < cates.length; j++) {
            if(cates[j].brand_category_id == brand_category_id) {
              categoryIndex = i;
              flag = true;
              break;
            }
          }
          if(flag) {
            break;
          }
        }
        let newBrandCategoryProductList = clone(brandCategoryProductList);
        let newList = clone(brandCategoryProductList.list);
        newList[categoryIndex].children[index].brand_category_status = status;
        newBrandCategoryProductList.list = [...newList];

        dispatch({
          type: 'category_brandparts/updateBrandCategoryProductList',
          payload: newBrandCategoryProductList
        });
      };
    }
    ChangeProductStatusUserRecordList=(checked, brand_category_id)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:{
          'brand_category_id':brand_category_id,
          'brand_category_status':checked ? 'ENABLE' : 'DISABLE'
        },
        record_page:' 品类产品/品牌件',
        record_operations:'修改产品状态'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    // 品牌件查询
    onHandleSubmitFn = values => {
      this.fetchList(values.brand_category_id, values.category_name, 1, 10);
      this.props.dispatch({ type: 'category_brandparts/updateFields', payload: values });
      this.searchBrandpartsUserRecordList(values);
    };
    searchBrandpartsUserRecordList=(value)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:value,
        record_page:' 品类产品/品牌件',
        record_operations:'搜索品牌件页面'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    render() {
      const { brandCategoryProductList, fields, brandCategoryList, page, perpage } = this.props;

      return (
        <React.Fragment>
          <Card className={styles.brandParts}>
            {/* ------------------ 搜索表单 ------------------ */}
            <ListSearchForm
              fields={fields}
              brandCategoryList={brandCategoryList}
              onHandleSubmitFn={this.onHandleSubmitFn}
            />
            {/* ------------------ 搜索表单 end ------------------ */}

            <Divider style={{ marginTop: 15, marginBottom: 15 }} />

            {/* 品牌件列表 */}
            <Row type="flex" justify="space-between">
              <Col className="f20">品牌件列表</Col>
              <Col>
                <Button href="/#/category/brandparts/-1" type="primary">创建</Button>
              </Col>
            </Row>

            <IndexTableList
              brandCategoryProductList={brandCategoryProductList}
              page={page}
              perpage={perpage}
              onHandleChangeProductStatusFn={this.onHandleChangeProductStatusFn}
              onChangeCategoryStatusFn={this.onChangeCategoryStatusFn}
              onRemoveCategoryFn={this.onRemoveCategoryFn}
              onShowSizeChange={this.onShowSizeChangeFn}
              onHandleTableChangeFn={this.onHandleTableChangeFn}
              onfetchOemCoverChange={this.onfetchOemCoverChangeFn}
            />
          </Card>
          { this.state.pageLoading && <PageLoading /> }
        </React.Fragment>
      );
    }
}

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.category_brandparts
});

export default connect(mapStateToProps)(BrandParts);
