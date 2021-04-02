import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Divider, Modal, message } from 'antd';
import IndexSearchForm from './components/IndexSearchForm';
import IndexTableList from './components/IndexTableList';
import ConfigModal from './components/ConfigModal';

const confirm = Modal.confirm;

class CarmodelBrand extends Component {

    state = {
      modalVisible: false
    };
    componentDidMount() {
    
      this.fetchCarmodelBrandsFn(this.props.searchFields);
      this.cmdUserListRecord(this.props.searchFields);
    }
    cmdUserListRecord=(searchFields)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:searchFields,
        record_page:'标准车型/车型品牌',
        record_operations:'查看车型品牌页面'
      };
      console.log(data);
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    // 搜索栏 - 点击查询
    onSubmitFn = values => {
      this.fetchCarmodelBrandsFn({...this.props.searchFields, ...values, page: 1});
      this.searchCarmodelbrandUserList({...this.props.searchFields, ...values, page: 1});
    }
    searchCarmodelbrandUserList=(list)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:list,
        record_page:'标准车型/车型品牌',
        record_operations:'搜索车型品牌页面'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    // 列表 - 获取车型品牌列表
    fetchCarmodelBrandsFn = params => this.props.dispatch({ type: 'carmodel_brand/fetchCarmodelBrands', payload: params });

    // 列表 - 分页
    onHandlePageSizeChangeFn = (current, perpage) => this.fetchCarmodelBrandsFn({...this.props.searchFields, perpage, page: 1});

    // 列表 - 翻页
    onHandlePageChangeFn = page => this.fetchCarmodelBrandsFn({...this.props.searchFields, page});

    // 列表 - 点击设置
    onClickSetFn = cm_brand_id => {
      this.props.dispatch({ type: 'carmodel_brand/fetchCarmodelBrandInfo', payload: { cm_brand_id, cb: () => this.onHandleDisplayModalFn() } });
      this.setupCarmodelbrandUserRecordList(cm_brand_id);
    }
    setupCarmodelbrandUserRecordList=(cm_brand_id)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:{
          'cm_brand_id':cm_brand_id
        },
        record_page:'标准车型/车型品牌',
        record_operations:'设置车型品牌'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    // 列表 - 点击删除
    onClickDelFn = cm_brand_id => {
      confirm({
        title: '删除后不可恢复，是否继续？',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          this.props.dispatch({ type: 'carmodel_brand/delCarmodelBrand', payload: { cm_brand_id } });
          this.ClickDelCarmodelbrandUserRecordList(cm_brand_id);
        }
      });
    }
    ClickDelCarmodelbrandUserRecordList=cm_brand_id=>{
      const { dispatch } = this.props;
      const data={
        record_obj:{
          'cm_brand_id':cm_brand_id
        },
        record_page:'标准车型/车型品牌',
        record_operations:'删除车型品牌'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    // 模态框 - 点击确认 - 保存设置
    onHandleConfirmModalFn = () => {
      const { dispatch, configSubmitInfo, searchFields } = this.props;
      dispatch({
        type: 'carmodel_brand/updateCarmodelBrand',
        payload: {
          cm_brand_image_url: configSubmitInfo.logoImg,
          cm_brand_id: configSubmitInfo.cm_brand_id,
          cm_hot_flag: configSubmitInfo.cm_hot_flag,
          cm_brand_country: configSubmitInfo.cm_brand_country,
          del_cm_factory_ids: configSubmitInfo.del_cm_factory_ids,
          cm_brand_status: configSubmitInfo.cm_brand_status,
          cb: () => {
            this.onHandleDisplayModalFn();
            this.fetchCarmodelBrandsFn(searchFields);
            message.success('设置成功');
          }
        }
      });
      this.ConfirmModalUserRecordList({cm_brand_image_url: configSubmitInfo.logoImg,
        cm_brand_id: configSubmitInfo.cm_brand_id,
        cm_hot_flag: configSubmitInfo.cm_hot_flag,
        cm_brand_country: configSubmitInfo.cm_brand_country,
        del_cm_factory_ids: configSubmitInfo.del_cm_factory_ids,
        cm_brand_status: configSubmitInfo.cm_brand_status,});
    }
    ConfirmModalUserRecordList=(list)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:list,
        record_page:'标准车型/车型品牌',
        record_operations:'设置并保存车型品牌'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    // 模态框 - 控制是否显示
    onHandleDisplayModalFn = () => {
      this.setState({modalVisible: !this.state.modalVisible});
      // 清空
      if(!this.state.modalVisible) {
        const { dispatch } = this.props;
        dispatch({ type: 'carmodel_brand/saveCarmodelBrandInfo' });
        dispatch({ type: 'carmodel_brand/saveConfigSubmitInfo' });
      }
    }

    // 更新要提交的数据
    onUpdateConfigSubmitInfoFn = params => this.props.dispatch({ type: 'carmodel_brand/saveConfigSubmitInfo', payload: params });

    // 更新模态框展示的数据
    onUpdateCarmodelBrandInfoFn = params => this.props.dispatch({ type: 'carmodel_brand/saveCarmodelBrandInfo', payload: params });

    // 保存上传后的图片文件
    saveUploadFileFn = (file, callback) => {
      const { dispatch, configSubmitInfo } = this.props;
      dispatch({
        type: 'carmodel_brand/carmodelBrandImageUpload',
        payload: {
          image: file,
          cb: imageUrl => {
            callback(imageUrl);
            dispatch({
              type: 'carmodel_brand/saveConfigSubmitInfo',
              payload: { ...configSubmitInfo, logoImg: imageUrl }
            });
          }
        }
      });
    }

    // 切换列表筛选表单
    onChangeSearchParamsFn = (key, val) => {
      const { dispatch, searchFields } = this.props;
      let newFields = {...searchFields, [key]: val, page: 1};
      dispatch({ type: 'carmodel_brand/saveSearchFields', payload: newFields });
      this.fetchCarmodelBrandsFn(newFields);
    }

    // 改变排列顺序
    onChangeIndexFn = (cm_factory_id, cm_factory_index) => {
      if(cm_factory_index) {
        this.props.dispatch({ 
          type: 'carmodel_brand/carmodelFactory', 
          payload: { cm_factory_id, cm_factory_index }
        });
      }
    }

    render() {
      
      const { loading, searchFields, carmodelBrandList, carmodelBrandInfo, configSubmitInfo } = this.props;

      return (
        <React.Fragment>
          <Card>
            <IndexSearchForm 
              searchFields={searchFields}
              onSubmitFn={this.onSubmitFn}
              onChangeSearchParamsFn={this.onChangeSearchParamsFn}
            />
            <Divider />
            <IndexTableList 
              loading={loading['carmodel_brand/fetchCarmodelBrands']}
              searchFields={searchFields}
              carmodelBrandList={{...carmodelBrandList, list: formatCarmodelBrandList(carmodelBrandList.list)}}
              onClickSetFn={this.onClickSetFn}
              onClickDelFn={this.onClickDelFn}
              onHandlePageSizeChangeFn={this.onHandlePageSizeChangeFn}
              onHandlePageChangeFn={this.onHandlePageChangeFn}
            />
          </Card>
          {
            this.state.modalVisible && 
                    <ConfigModal 
                      configSubmitInfo={configSubmitInfo}
                      carmodelBrandInfo={carmodelBrandInfo}
                      modalVisible={this.state.modalVisible}
                      onHandleConfirmModalFn={this.onHandleConfirmModalFn}
                      onHandleDisplayModalFn={this.onHandleDisplayModalFn}
                      onUpdateConfigSubmitInfoFn={this.onUpdateConfigSubmitInfoFn}
                      // update
                      onUpdateCarmodelBrandInfoFn={this.onUpdateCarmodelBrandInfoFn}
                      saveUploadFileFn={this.saveUploadFileFn}
                      onChangeIndexFn={this.onChangeIndexFn}
                    />
          }
        </React.Fragment>
      );
    }
};

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.carmodel_brand
});
export default connect(mapStateToProps)(CarmodelBrand);

// 格式化车型品牌列表
function formatCarmodelBrandList(list) {
  const cm_hot_flag = {
    'NORMAL': '普通',
    'HOT': '热门'
  };
  return list.map(item => {
    return {
      cm_brand_id: item.cm_brand_id,
      // 品牌
      cm_brand_name: item.cm_brand_name,
      // 主机厂
      cm_factory_name: item.cm_factory_name,
      // 车型数量
      count: item.count,
      // 品牌标识
      cm_hot_flag: cm_hot_flag[item.cm_hot_flag],
      // 车系国别
      cm_brand_country: item.cm_brand_country || '',
      // 品牌禁用状态
      cm_brand_status: item.cm_brand_status || ''
    };
  });
}