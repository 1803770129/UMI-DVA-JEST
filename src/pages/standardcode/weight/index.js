import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Divider } from 'antd';
import IndexSearchForm from './components/IndexSearchForm';
import IndexTableList from './components/IndexTableList';
import StdSkuWeightModal from './components/StdSkuWeightModal';

class WeightList extends Component {

    state = {
      currentStdWeightObj: {},                        // 当前std_weight对象【打开设置通用状态配置模态框用】
      commonWeightModalVisible: false                 // 通用权重模态框
    }

    componentDidMount() {
      const { dispatch, searchFields } = this.props;
      // 获取通用权重列表数据
      // this.fetchStdSkuWeightListFn({ page: searchFields.page, perpage: searchFields.perpage, std_weight_type: searchFields.std_weight_type });
      // 获取品牌名称下拉框数据
      this.fetchPartSkuBrandFn(searchFields.std_weight_type);
      // 获取零件树数据
      dispatch({ type: 'std_sku_weight_list/fetchCategoryTree' });
    }

    // 获取权重列表
    fetchStdSkuWeightListFn = params => {
      this.props.dispatch({ type: 'std_sku_weight_list/fetchStdSkuWeightList', payload: params });
    }

    // 根据通用依据的值，获取对应的品牌名
    fetchPartSkuBrandFn = std_weight_type => {
      this.props.dispatch({ type: 'std_sku_weight_list/fetchPartSkuBrand', payload: { std_weight_type } });
    }

    // ************* IndexSearchForm ******************** //


    // ************* IndexTableList ******************** //

    // 搜索表单查询
    onHandleSubmitFn = ({ all_brand_id, std_weight_type, category_id, std_weight_num_min, std_weight_num_max }) => {
      let params = {
        ...this.props.searchFields,
        all_brand_id, 
        std_weight_type, 
        category_id: category_id[category_id.length - 1],
        std_weight_num_min, 
        std_weight_num_max,
        page: 1,
        perpage: this.props.searchFields.perpage,
        cb: () => this.saveStdSkuWeightListParams(params)
      };
      this.fetchStdSkuWeightListFn(params);
      const {dispatch} = this.props;
      const data={
        record_obj:params,
        record_page:'标准码管理/通用权重设置',
        record_operations:'查询通用权限设置列表'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }

    // 通用权重模态框展示标识
    onHandleCommonWeightModalFn = target => {
      if(target) {
        // 打开模态框
        this.setState({currentStdWeightObj: target});
      } 
      this.setState({commonWeightModalVisible: !this.state.commonWeightModalVisible});
    };

    // 调整每页显示数量函数
    onHandlePageSizeChangeFn = (current, perpage) => {
      let params = { 
        ...this.props.searchFields,
        page: 1, 
        perpage,
        cb: () => this.saveStdSkuWeightListParams(params)
      };
      this.fetchStdSkuWeightListFn(params);
    }

    // 切换页面函数
    onHandlePageChangeFn = page => {
      let params = { 
        ...this.props.searchFields,
        page, 
        perpage: this.props.searchFields.perpage,
        cb: () => this.saveStdSkuWeightListParams(params)
      };
      this.fetchStdSkuWeightListFn(params);
    }

    // 更新通用权重列表查询参数
    saveStdSkuWeightListParams = params => {
      const { dispatch, searchFields } = this.props;
      dispatch({
        type: 'std_sku_weight_list/saveStdSkuWeightListParams',
        payload: {...searchFields, ...params}
      });
    }

    // 点击确认修改通用权重
    onHandleConfirmWeightModalFn = (std_weight_id, std_weight_num) => {
      this.props.dispatch({
        type: 'std_sku_weight_list/updateStdSkuWeight', 
        payload: { 
          std_weight_id, 
          std_weight_num,
          cb: () => this.onHandleCommonWeightModalFn()
        }
      });
      const {dispatch} = this.props;
      const data={
        record_obj:{
          'std_weight_id':std_weight_id, 
          'std_weight_num':std_weight_num,
        },
        record_page:'标准码管理/通用权重设置',
        record_operations:'编辑通用权重'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    
      
    }

    render() {
      const { loading, partSkuBrand, categoryTree, stdSkuWeightList, searchFields } = this.props;
      const { currentStdWeightObj, commonWeightModalVisible } = this.state;

      return (
        <Card>
          {/* 搜索表单 */}
          <IndexSearchForm 
            partSkuBrand={partSkuBrand}
            categoryTree={categoryTree}
            onHandleSubmitFn={this.onHandleSubmitFn}
            fetchPartSkuBrandFn={this.fetchPartSkuBrandFn}
          />

          <Divider />

          {/* 表格 */}
          <IndexTableList
            loading={loading['std_sku_weight_list/fetchStdSkuWeightList']}
            searchFields={searchFields}
            stdSkuWeightList={{ ...stdSkuWeightList, list: formatWeightListFn(stdSkuWeightList.list) }}
            onHandleCommonWeightModalFn={this.onHandleCommonWeightModalFn}
            onHandlePageSizeChangeFn={this.onHandlePageSizeChangeFn}
            onHandlePageChangeFn={this.onHandlePageChangeFn}
          />

          {/* 编辑通用权重模态框 */}
          {
            commonWeightModalVisible && 
                    <StdSkuWeightModal 
                      currentStdWeightObj={currentStdWeightObj}
                      commonWeightModalVisible={commonWeightModalVisible}
                      onHandleCommonWeightModalFn={this.onHandleCommonWeightModalFn}
                      onHandleConfirmWeightModalFn={this.onHandleConfirmWeightModalFn}
                    />
          }
        </Card>
      );
    }
}

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.std_sku_weight_list
});
export default connect(mapStateToProps)(WeightList);

// 格式化通用权重列表
function formatWeightListFn(list) {
  return list.map(item => {
    return {
      std_weight_id: item.std_weight_id,
      // 通用依据：TENANT - 商户码； INDUSTRY - D码；FAMOUS - 大厂码；
      std_weight_type: item.std_weight_type == 'TENANT' ? '商户码' : item.std_weight_type == 'FAMOUS' ? '大厂码' : 'D码',
      // 品牌名称
      all_brand_name: item.all_brand_name || '',
      // 产品
      category_name: item.category_name || '',
      // 通用权重
      std_weight_num: item.std_weight_num
    };
  });
}