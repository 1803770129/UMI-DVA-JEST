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
        'fms_brand_id': searchFields.fms_brand_id
              
      },
      record_page:' 大厂码管理/大厂管理',
      record_operations:'查看大厂管理页面'
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
          fms_brand_status: searchFields.fms_brand_status,
          fms_brand_id: searchFields.fms_brand_id
        });
        this.fetchFmsBrandsDropListFn();
      }
    }

    // 获取大厂码列表数据
    fetchFmsBrandsListFn = params => {
      this.props.dispatch({ type: 'fms_list/fetchFmsBrandsList', payload: params });
    }

    // 获取大厂品牌下拉列表数据
    fetchFmsBrandsDropListFn = () => {
      this.props.dispatch({ type: 'fms_list/fetchFmsBrandsDropList' });
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
    onGoFmsBrandDetailFn = fms_brand_id => {
      router.push('./factory/' + fms_brand_id + '?fms_brand_id=' + fms_brand_id);
      const { dispatch } = this.props;
      const data={
        record_obj:{
          'fms_brand_id': fms_brand_id
        },
        record_page:' 大厂码管理/ 大厂管理/创建 / 编辑',
        record_operations:'编辑大厂(跳转)'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }

    // 更新查询标准码列表参数
    updateFmsBrandsParamsFn = params => {
      const { dispatch, searchFields } = this.props;
      dispatch({ type: 'fms_list/saveFmsBrandsParamsFn', payload: {...searchFields, ...params} });
    }

    // 删除大厂品牌数据
    onDeleteFmsBrandFn = fms_brand_id => {
      confirm({
        title: '确认后不可恢复，是否删除？',
        content: '',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          const { dispatch , searchFields} = this.props;
          const data={
            record_obj:{
              'fms_brand_id': fms_brand_id
            },
            record_page:' 大厂码管理/大厂管理',
            record_operations:'删除大厂'
          };
          dispatch({
            type:'managerRecord/fetchUserRecorListInsert',
            data:data
          });
          this.props.dispatch({
            type: 'fms_list/deleteFmsBrand',
            payload: { fms_brand_id }
          });
          dispatch({
            type: 'fms_list/fetchFmsBrandsList',
            payload: {
              page: 1,
              perpage: searchFields.perpage,
              fms_brand_status: searchFields.fms_brand_status,
              fms_brand_id:''
            }
          });
        }
      });
    }

    // 切换品牌
    onChangeBrandFn = fms_brand_id => {
      const { dispatch, searchFields } = this.props;
      dispatch({
        type: 'fms_list/fetchFmsBrandsList',
        payload: {
          page: 1,
          perpage: searchFields.perpage,
          fms_brand_status: searchFields.fms_brand_status,
          fms_brand_id
        }
      });
      const data={
        record_obj:{
          'page': 1,
          'perpage': searchFields.perpage,
          'fms_brand_status': searchFields.fms_brand_status,
          'fms_brand_id': fms_brand_id  
        },
        record_page:' 大厂码管理/大厂管理',
        record_operations:'通过大厂品牌查询大厂'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }

    // 切换状态
    onChangeStatusFn = fms_brand_status => {
      const { dispatch, searchFields } = this.props;
      dispatch({
        type: 'fms_list/fetchFmsBrandsList',
        payload: {
          page: 1,
          perpage: searchFields.perpage,
          fms_brand_status,
          fms_brand_id: searchFields.fms_brand_id
        }
      });
      const data={
        record_obj:{
          'fms_brand_status':fms_brand_status,
          'page': 1,
          'perpage': searchFields.perpage,
          'fms_brand_id': searchFields.fms_brand_id
              
        },
        record_page:' 大厂码管理/大厂管理',
        record_operations:'通过启用状态搜索大厂'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    setupFactorycode=()=>{
      const { dispatch } = this.props;
      const data={
        record_obj:{
          'operation':'创建大厂',
              
        },
        record_page:' 大厂码管理/ 大厂管理/创建 / 编辑',
        record_operations:'创建大厂'
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
          <PartLoading loading={loading['fms_list/fetchFmsBrandsDropList']}>
            <IndexSearchForm 
              searchFields={searchFields}
              fmsBrandDropList={fmsBrandDropList}
              onChangeBrandFn={this.onChangeBrandFn}
              onChangeStatusFn={this.onChangeStatusFn}
            />
          </PartLoading>
          <Divider />
          <Row type="flex" justify="space-between">
            <Col className="f16">大厂列表</Col>
            <Col>
              <Button type="primary" href="/#/factorycode/factory/-1" onClick={()=>this.setupFactorycode()}>创建</Button>
            </Col>
          </Row>
          <IndexTableList 
            loading={loading['fms_list/fetchFmsBrandsList'] }
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
  ...state.fms_list
});

export default connect(mapStateToProps)(Brand);

// 格式化大厂码列表
function formatFmsListFn(list = []) {
  return list.map(item => {
    return {
      fms_brand_id: item.fms_brand_id,
      // 大厂品牌
      fms_brand_name: item.fms_brand_name,
      // 大厂品牌描述
      fms_brand_desc: item.fms_brand_desc,
      // 配件品类
      categoryNames: item.categoryNames,
      // 匹配优先级【商户端导入产品数据是根据优先级优先匹配】
      fms_brand_level: item.fms_brand_level,
      // 启用状态
      fms_brand_status: item.fms_brand_status == 'ENABLE' ? '启用' : '禁用',
      // 创建时间
      create_time: item.create_time,
    };
  });
}
