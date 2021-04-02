import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Divider, Row, Col, Button, Modal } from 'antd';
import router from 'umi/router';
import PartLoading from '@/components/PartLoading';
import IndexSearchForm from './components/IndexSearchForm';
import IndexTableList from './components/IndexTableList';

const confirm = Modal.confirm;

class Brand extends Component {

  componentDidMount() {
    this.pageInitFn();
    const { dispatch, searchFields } = this.props;
    const data={
      record_obj:{
        'page': 1,
        'perpage': searchFields.perpage,
        'fms_brand_id': searchFields.indus_brand_id
              
      },
      record_page:'  行业码管理/行业协会',
      record_operations:'查看行业协会页面'
    };
    dispatch({
      type:'managerRecord/fetchUserRecorListInsert',
      data:data
    });
  }

    pageInitFn = () => {
      const { searchFields, cachedIndexFlag } = this.props;
      if(!cachedIndexFlag) {
        this.fetchFmsBrandsListFn({
          page: searchFields.page, 
          perpage: searchFields.perpage,
          indus_brand_status: searchFields.indus_brand_status,
          indus_brand_id: searchFields.indus_brand_id
        });
        this.fetchFmsBrandsDropListFn();
      }
    }

    // 获取大厂码列表数据
    fetchFmsBrandsListFn = params => {
      this.props.dispatch({ type: 'indus_list/fetchFmsBrandsList', payload: params });
    }

    // 获取大厂品牌下拉列表数据
    fetchFmsBrandsDropListFn = () => {
      this.props.dispatch({ type: 'indus_list/fetchFmsBrandsDropList' });
    }

    // 调整每页显示数量函数
    onHandlePageSizeChangeFn = (current, perpage) => {
      let params = { 
        ...this.props.searchFields,
        page: 1, 
        perpage,
        cb: () => {
          this.updateFmsBrandsParamsFn(params);
        }
      };
      this.fetchFmsBrandsListFn(params);
    }

    // 切换页面函数
    onHandlePageChangeFn = page => {
      let params = { 
        ...this.props.searchFields,
        page, 
        perpage: this.props.searchFields.perpage,
        cb: () => {
          this.updateFmsBrandsParamsFn(params);
        }
      };
      this.fetchFmsBrandsListFn(params);
    }
    
    // 点击跳转到详情页
    onGoFmsBrandDetailFn = indus_brand_id => {
      router.push('./industry/' + indus_brand_id + '?indus_brand_id=' + indus_brand_id);
      const { dispatch } = this.props;
      const data={
        record_obj:{
          'indus_brand_id': indus_brand_id
        },
        record_page:'  行业码管理/行业协会',
        record_operations:'编辑行业协会(跳转)'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }

    // 更新查询标准码列表参数
    updateFmsBrandsParamsFn = params => {
      const { dispatch, searchFields } = this.props;
      dispatch({ type: 'indus_list/saveFmsBrandsParamsFn', payload: {...searchFields, ...params} });
    }

    // 删除大厂品牌数据
    onDeleteFmsBrandFn = indus_brand_id => {
      confirm({
        title: '确认后不可恢复，是否删除？',
        content: '',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          const { dispatch , searchFields } = this.props;
          const data={
            record_obj:{
              'indus_brand_id': indus_brand_id
            },
            record_page:' 行业码管理/行业协会',
            record_operations:'删除行业协会'
          };
          dispatch({
            type:'managerRecord/fetchUserRecorListInsert',
            data:data
          });
          this.props.dispatch({
            type: 'indus_list/deleteFmsBrand',
            payload: { indus_brand_id }
          });
          dispatch({
            type: 'indus_list/fetchFmsBrandsList',
            payload: {
              page: 1,
              perpage: searchFields.perpage,
              indus_brand_status: searchFields.indus_brand_status,
              indus_brand_id:''
            }
          });
        }
      });
    }

    // 切换品牌
    onChangeBrandFn = indus_brand_id => {
      const { dispatch, searchFields } = this.props;
      dispatch({
        type: 'indus_list/fetchFmsBrandsList',
        payload: {
          page: 1,
          perpage: searchFields.perpage,
          indus_brand_status: searchFields.indus_brand_status,
          indus_brand_id
        }
      });
      const data={
        record_obj:{
          'page': 1,
          'perpage': searchFields.perpage,
          'fms_brand_id': indus_brand_id,
          'indus_brand_status': searchFields.indus_brand_status,
        },
        record_page:'  行业码管理/行业协会',
        record_operations:'通过品牌查询行业协会'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }

    // 切换状态
    onChangeStatusFn = indus_brand_status => {
      const { dispatch, searchFields } = this.props;
      dispatch({
        type: 'indus_list/fetchFmsBrandsList',
        payload: {
          page: 1,
          perpage: searchFields.perpage,
          indus_brand_status,
          indus_brand_id: searchFields.indus_brand_id
        }
      });
      const data={
        record_obj:{
          'page': 1,
          'perpage': searchFields.perpage,
          'fms_brand_id': searchFields.indus_brand_id,
          'indus_brand_status': indus_brand_status,
        },
        record_page:'  行业码管理/行业协会',
        record_operations:'通过状态查询行业协会'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }

    render() {
      const { loading, fmsBrandsList, fmsBrandDropList, searchFields } = this.props;
      return (
        <Card>
          <PartLoading loading={loading['indus_list/fetchFmsBrandsDropList']}>
            <IndexSearchForm 
              searchFields={searchFields}
              fmsBrandDropList={fmsBrandDropList}
              onChangeBrandFn={this.onChangeBrandFn}
              onChangeStatusFn={this.onChangeStatusFn}
            />
          </PartLoading>
          <Divider />
          <Row type="flex" justify="space-between">
            <Col className="f16">行业协会列表</Col>
            <Col>
              <Button type="primary" href="/#/industrycode/industry/-1">创建</Button>
            </Col>
          </Row>
          <IndexTableList 
            loading={loading['indus_list/fetchFmsBrandsList'] }
            searchFields={searchFields}
            fmsBrandsList={{...fmsBrandsList, list: formatFmsListFn(fmsBrandsList.list)}}
            onHandlePageSizeChangeFn={this.onHandlePageSizeChangeFn}
            onHandlePageChangeFn={this.onHandlePageChangeFn}
            onGoFmsBrandDetailFn={this.onGoFmsBrandDetailFn}
            onDeleteFmsBrandFn={this.onDeleteFmsBrandFn}
          />
        </Card>
      );
    }
}

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.indus_list
});

export default connect(mapStateToProps)(Brand);

// 格式化大厂码列表
function formatFmsListFn(list = []) {
  return list.map(item => {
    return {
      indus_brand_id: item.indus_brand_id,
      // 大厂品牌
      indus_brand_name: item.indus_brand_name,
      // 大厂品牌描述
      indus_brand_desc: item.indus_brand_desc,
      // 配件品类
      categoryNames: item.categoryNames,
      // 匹配有限级
      indus_brand_level: item.indus_brand_level,
      // 启用状态
      indus_brand_status: item.indus_brand_status == 'ENABLE' ? '启用' : '禁用',
      // 创建时间
      create_time: item.create_time
    };
  });
}
