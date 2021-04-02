import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Divider, Row, Col } from 'antd';
import IndexSearchForm from './components/IndexSearchForm';
import IndexTableList from './components/IndexTableList';
import router from 'umi/router';
import styles from './index.less';

class Category extends Component {

  componentDidMount() {
    this.pageInitFn();
    const { dispatch, searchFields } = this.props;
    const data={
      record_obj:{
        'page': 1,
        'perpage': searchFields.perpage,
        'indus_category_id': searchFields.indus_category_id
              
      },
      record_page:'行业码管理/品类管理',
      record_operations:'查看行业品类管理页面'
    };
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  }

    pageInitFn = () => {
      const { cachedIndexFlag, dispatch } = this.props;
      if(!cachedIndexFlag) {
        dispatch({ type: 'indus_category_list/fetchPageInit' });
      }
    }

    // 获取大厂品类列表数据
    fetchFmsCategoriesFn = params => this.props.dispatch({ type: 'indus_category_list/fetchFmsCategoriesList', payload: params });

    // 获取大厂品牌下拉列表
    fetchFmsBrandsDropListFn = () => this.props.dispatch({ type: 'indus_category_list/fetchFmsBrandsDropList' });

    // 调整每页显示数量函数
    onHandlePageSizeChangeFn = (current, perpage) => {
      let params = { 
        ...this.props.searchFields,
        page: 1, 
        perpage,
        cb: () => this.updateFmsCategoriesParamsFn(params)
      };
      this.fetchFmsCategoriesFn(params);
    }

    // 切换页面函数
    onHandlePageChangeFn = page => {
      const { searchFields } = this.props;
      let params = { 
        ...searchFields,
        page, 
        perpage: searchFields.perpage,
        cb: () => this.updateFmsCategoriesParamsFn(params)
      };
      this.fetchFmsCategoriesFn(params);
    }

    // 去产品管理页
    onGoFmsCategoryDetailFn = (category_id, indus_brand_id, indus_category_id, indus_part_id) => {
      router.push({
        pathname: '/industrycode/part',
        query: { category_id, indus_brand_id, indus_category_id, indus_part_id }
      });
      const { dispatch } = this.props;
      const data={
        record_obj:{
          'category_id':category_id, 
          'indus_brand_id':indus_brand_id, 
          'indus_category_id':indus_category_id, 
          'indus_part_id':indus_part_id
        },
        record_page:' 行业码管理/品类管理',
        record_operations:'去产品管理页'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }

    // 更新查询大厂品类列表参数
    updateFmsCategoriesParamsFn = params => {
      const { dispatch, searchFields } = this.props;
      dispatch({
        type: 'indus_category_list/saveFmsCategoriesParamsFn',
        payload: {...searchFields, ...params}
      });
    }

    // 更新大厂品类启用状态
    onChangeCategoryStatusFn = (indus_category_id, checked) => {
      this.props.dispatch({
        type: 'indus_category_list/updateCategoryStatus',
        payload: {
          indus_category_id,
          indus_category_status: checked ? 'ENABLE' : 'DISABLE'
        }
      });
      const data={
        record_obj:{
          'indus_category_id':indus_category_id,
          'indus_category_status': checked ? 'ENABLE' : 'DISABLE'
        },
        record_page:' 行业码管理/品类管理',
        record_operations:'更新行业品类启用状态'
      };
      const {dispatch}=this.props;
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    
    // 更新大厂产品启用状态
    onChangePartStatusFn = (indus_category_id, indus_part_id, checked) => {
      this.props.dispatch({
        type: 'indus_category_list/updatePartStatus',
        payload: {
          indus_category_id,
          indus_part_id,
          indus_part_status: checked ? 'ENABLE' : 'DISABLE'
        }
      });
      const data={
        record_obj:{
          'indus_part_id':indus_part_id,
          'indus_part_status': checked ? 'ENABLE' : 'DISABLE'
        },
        record_page:' 行业码管理/品类管理',
        record_operations:'更新行业产品启用状态'
      };
      const {dispatch}=this.props;
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }

    // 切换大厂品牌
    onChangeFmsBrandFn = indus_brand_id => {
      const { dispatch, searchFields } = this.props;
      // 1、切换对应列表数据
      dispatch({
        type: 'indus_category_list/fetchFmsCategoriesList',
        payload: {
          page: 1,
          perpage: searchFields.perpage,
          indus_brand_id,
          indus_category_id: ''
        }
      });
      // 2、切换对应大厂品类数据
      dispatch({ 
        type: 'indus_category_list/fetchFmsCategoriesDropList', 
        payload: { indus_brand_id }
      });
      const data={
        record_obj:{
          'page': 1,
          'perpage': searchFields.perpage,
          'indus_brand_id': indus_brand_id
        },
        record_page:'  行业码管理/品类管理',
        record_operations:'通过行业品牌搜索品类'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }

    // 切换大厂品类
    onChangeFmsCategoryFn = indus_category_id => {
      const { dispatch, searchFields } = this.props;
      dispatch({
        type: 'indus_category_list/fetchFmsCategoriesList',
        payload: {
          page: 1,
          perpage: searchFields.perpage,
          indus_brand_id: searchFields.indus_brand_id,
          indus_category_id
        }
      });
      const data={
        record_obj:{
          'page': 1,
          'perpage': searchFields.perpage,
          'indus_category_id': indus_category_id
        },
        record_page:'  行业码管理/品类管理',
        record_operations:'通过行业协会品类搜索'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    };

    render() {
      const { loading, fmsCategoriesList, searchFields, fmsBrandsDropList, fmsCategoriesDropList } = this.props;
      return (
        <Card className={styles.factoryCategoryList}>
          <IndexSearchForm 
            searchFields={searchFields}
            fmsBrandsDropList={fmsBrandsDropList}
            fmsCategoriesDropList={fmsCategoriesDropList}
            onChangeFmsBrandFn={this.onChangeFmsBrandFn}
            onChangeFmsCategoryFn={this.onChangeFmsCategoryFn}
          />
          <Divider />
          <Row type="flex" justify="space-between">
            <Col className="f16 m-b-15">行业协会品类列表</Col>
          </Row>
          <IndexTableList 
            loading={loading['indus_category_list/fetchPageInit']}
            searchFields={searchFields}
            fmsCategoriesList={{...fmsCategoriesList, list: formatCategoriesListFn(fmsCategoriesList.list)}}
            onHandlePageChangeFn={this.onHandlePageChangeFn}
            onHandlePageSizeChangeFn={this.onHandlePageSizeChangeFn}
            onGoFmsCategoryDetailFn={this.onGoFmsCategoryDetailFn}
            onChangeCategoryStatusFn={this.onChangeCategoryStatusFn}
            onChangePartStatusFn={this.onChangePartStatusFn}
          />
        </Card>
      );
    }
}

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.indus_category_list
});
export default connect(mapStateToProps)(Category);

// 格式化大厂品类列表数据
function formatCategoriesListFn(list = []) {
  return list.map(item => {
    // 品类
    let obj = {};
    obj.indus_brand_id = item.indus_brand_id;
    obj.indus_category_id = item.indus_category_id;
    obj.brand_category_id = item.brand_category_id;
    // 品牌
    obj.indus_brand_name = item.indus_brand_name;
    // 品类
    obj.brand_category_name = item.brand_category_name;
    // 启用状态
    obj.indus_category_status = item.indus_category_status == 'ENABLE' ? true : false;
    // 产品
    let list = item.parts.map(itm => {
      let o = {};
      o.category_id = itm.category_id;
      o.brand_category_id = itm.brand_category_id;
      o.indus_brand_id = itm.indus_brand_id;
      o.indus_part_id = itm.indus_part_id;
      o.indus_category_id = itm.indus_category_id;
      // 产品名
      o.category_name = itm.category_name;
      // 产品数量
      o.count = itm.count;
      // 产品启用状态
      o.indus_part_status = itm.indus_part_status == 'ENABLE' ? true : false;
      return o;
    });
    return { categoryInfo: obj, parts: list};
  });
}
