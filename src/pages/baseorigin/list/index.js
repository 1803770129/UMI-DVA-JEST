import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Row, Form, Button, Divider, Table, Select, Modal } from 'antd';
import Link from 'umi/link';
import DetailModal from './components/DetailModal';
import { uniqueArr } from '@/utils/tools';
import carmodelBaseInfoConfig from '@/assets/json/carmodelBaseInfo.json';
import FilterForm from './components/ListFilterForm';
import msg from '@/utils/msg';
import './index.less';
import moment from 'moment';
const Option = Select.Option;
const FormItem = Form.Item;
const confirm = Modal.confirm;

// 表格标题设置
const TheadTitle = props => {return (<span className='f12 gray'>{props.text}</span>);};

class BaseListForm extends Component {

    state = {
      visible: false,
      modalType: ''
    };

    componentDidMount() {
      const { page, perpage ,fields} = this.props;
      console.log(this.props);
      this.pageInit();
      this.cmdListRecord(page, perpage,fields.review_status);
    }
    cmdListRecord=(page, perpage,rewiew_status)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:{
          page:page,
          perpage:perpage,
          rewiew_status:rewiew_status
        },
        record_page:'标准车型/标准车型',
        record_operations:'查看标准车型页面'
      };
      console.log(data);
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    componentWillUnmount() {
      // const { history, dispatch } = this.props;
      // const routeTo = history.location.pathname;
      // // 离开到非编辑页面，清理选择项目
      // if (routeTo.indexOf('/baseorigin/list/') == -1) {
      //   dispatch({ type: 'baseorigin/clearState' });
      // }
    }

    pageInit = async () => {
      const { fields, page, perpage, location } = this.props;
      // 获取品牌主机厂车型列表
      this.fetchBrandFacModList();
      // 获取车型属性列表
      await this.fetchCarmodelProList({type:'baseorigin'});
      // 初始化筛选项状态值【车型属性】
      if(fields.carmodelProListValue.length === 0) {
        const { carmodelProList } = this.props;
        if(carmodelProList.length > 0 ) {
          this.addCarmodelProList();
        }
      }
      let query = location.query;
      if(query.from == 'oe') {
        // 从oe页跳过来
        await this.fromOEpageInit(query);
        window.history.replaceState({}, 0, `${window.location.origin}/#/baseorigin/list`);
        // 获取标准车型列表
        await this.fetchList(page, perpage);
      } else {
        // 获取标准车型列表
        await this.fetchList(page, perpage);
      }
    };

    // 从OE管理跳转过来初始化
    fromOEpageInit = async (query) => {
      // query 的格式
      // {
      //     cm_brand : "克莱斯勒"
      //     cm_brand_country : "欧美车系"
      //     cm_car : ""
      //     cm_conf_level : "标准型"
      //     cm_countries : "美国"
      //     cm_displacement : "2.4L"
      //     cm_factory : "克莱斯勒（进口）"
      //     cm_model : "Grand Voyager [大捷龙]"
      //     cm_model_year : "2002"
      //     cm_origin : "liyang"
      //     from : "oe"
      //     review_status : "APPROVED"
      // }
      const { dispatch } = this.props;
      let p = []; // 筛选条件
      for(let k in query) {
        if(k == 'cm_model_year' || k == 'cm_displacement' || k =='cm_conf_level') {
          let obj = {
            cm_pro_column: k,
            cm_pro_value: query[k],
            key: new Date().getTime()
          };
          p.push(obj);
        }
      }
      let params = {
        cm_origin: '',
        cm_carmodel: [query.cm_brand, query.cm_factory, query.cm_model],
        review_status: query.review_status,
        carmodelProListValue: p,
        fields: {
          cm_origin: '',
          cm_carmodel: [query.cm_brand, query.cm_factory, query.cm_model],
          review_status: query.review_status,
          carmodelProListValue: p
        }
      };
      dispatch({ type: 'baseorigin/updateModel', payload: params });
    }

    // 获取车型属性列表
    fetchCarmodelProList = async payload => {
      const { dispatch } = this.props;
      return dispatch({ type: 'baseorigin/fetchCarmodelProList', payload });
    };

    // 获取品牌主机厂车型列表
    fetchBrandFacModList = async () => {
      const { dispatch } = this.props;
      if(this.props.carmodelList.length === 0) {
        await dispatch({ type: 'global/fetchBrandFacModList' });
      }
      await dispatch({ type: 'baseorigin/updateState', payload: { carmodelList: this.props.carmodelList } });
    };

    // 获取标准车型列表
    fetchList = async (page, perpage) => {

      // 初始化筛选项状态值
      const { dispatch, fields } = this.props;
      const query = this.createSearchParams(fields);
      // 获取标准车型列表接口
      await dispatch({ type: 'baseorigin/fetchList', payload: { page, perpage, query } });
    };

    // 添加车型属性列表
    addCarmodelProList = () => {
      const { dispatch, carmodelProList, fields } = this.props;
      const { carmodelProListValue } = fields;
      if(carmodelProListValue.length < 7) {
        let arr = [...carmodelProListValue];
        arr.push({
          cm_pro_column: carmodelProList[0].cm_pro_column,
          cm_pro_value: '',
          key: new Date().getTime()
        });
        dispatch({ type: 'baseorigin/updateState', payload: {  fields: { ...fields, carmodelProListValue: arr } } });
      }
    };


    // 更新车型属性列表
    updateCarmodelProList = (carmodelProListValue) => {
      const { dispatch, fields } = this.props;
      dispatch({ type: 'baseorigin/updateState', payload: {  fields: { ...fields, carmodelProListValue } } });
    };

    // 移除车型属性列表
    removeCarmodelProList = key => {
      const { dispatch, fields } = this.props;
      const { carmodelProListValue } = fields;
      dispatch({
        type: 'baseorigin/updateState',
        payload: {  fields: { ...fields, carmodelProListValue: carmodelProListValue.filter(v => v.key !== key) } }
      });
    }

    /***************************** 表格 ****************************************** */

    // 表格分页
    handleTableChange = page => {
      this.fetchList(page, this.props.perpage);
      this.props.dispatch({ type: 'baseorigin/updateState', payload: { approveList: [] } });
    };

    // 改变单页数量
    onShowSizeChange = (current, perpage) => {
      this.fetchList(1, perpage);
      this.props.dispatch({ type: 'baseorigin/updateState', payload: { approveList: [] } });
    };

    // 创建查询参数
    createSearchParams = values => {

      let obj = {};
      let res = {};
      for (const key in values) {
        const value = values[key];
        if (key.indexOf('carmodelPro') == -1) {
          if (key == 'cm_carmodel') {
            // 品牌/主机厂/车型
            obj.cm_brand = value[0];
            obj.cm_factory = value[1];
            obj.cm_model = value[2];
          } else {
            // 其他
            obj[key] = value;
          }
        }
      }
      const proList = values.carmodelProListValue;
      for(let i = 0; i < proList.length; i++) {
        const { cm_pro_column, cm_pro_value } = proList[i];
        obj[cm_pro_column] = cm_pro_value;
      }
      // 不取空值参数
      for (const k in obj) {
        const v = obj[k];
        if (v) {
          res[k] = v;
        }
      }
      return res;
    };
    /***************************** 表格 end ****************************************** */

    /***************************** 创建标准车型 ****************************************** */

    // 显示模态框
    showModal = async (e, type) => {
      this.setState({ visible: true, modalType: type });
      this.initCarmodelBaseInfo();
    };

    // 关闭模态框
    closeModal = () => {
      this.setState({ visible: false });
    };

    // 初始化标准车型添加数据
    initCarmodelBaseInfo = async () => {
      const { dispatch } = this.props;
      carmodelBaseInfoConfig.forEach(cate => {
        cate.list.forEach(sub => { sub.val = ''; });
      });
      dispatch({ type: 'baseorigin/updateState', payload: { carmodelBaseInfo: carmodelBaseInfoConfig } });
    }

    // 车型详情添加
    fetchBaseInfoAdd = async values => {
      const { dispatch, CARMODEL_ENGINEOIL_LEVEL, CARMODEL_ENGINEOIL_SAE } = this.props;
      // 整理提交数据
      let obj = {
        // 机油等级
        engineoil_levels: CARMODEL_ENGINEOIL_LEVEL.map(v => ({
          cm_engineoil_level_author: v.cm_engineoil_level_author,
          cm_engineoil_level_factory: v.cm_engineoil_level_factory,
          cm_engineoil_level_value: v.cm_engineoil_level_value,
        })),
        // 机油粘度
        engineoil_saes: CARMODEL_ENGINEOIL_SAE.map(v => ({
          cm_engineoil_sae: v.cm_engineoil_sae,
          cm_engineoil_index: v.cm_engineoil_index
        }))
      };

      carmodelBaseInfoConfig.forEach(cate => {
        obj[cate.key] = {};
        cate.list.forEach(sub => {
          obj[cate.key][sub.key] = '';
        });
      });

      for (const key in obj) {
        for (const k in obj[key]) {
          for (const vk in values) {
            if (vk == k) {
              obj[key][k] = values[vk];
            }
          }
        }
      }

      // 车型详情添加接口, 添加成功重新拉取标准车型列表
      dispatch({
        type: 'baseorigin/fetchBaseInfoAdd',
        payload: {
          data: obj,
          cb: res => {
            if(res.code === 0) {
              this.baseInfoAddOk();
              this.addCmListRecord(obj);
            }
          }
        }
      });

    };
    addCmListRecord=()=>{
      const { dispatch } = this.props;
      const data={
        record_obj:{
          'operation':'创建标准车型'
        },
        record_page:'标准车型/标准车型',
        record_operations:'创建标准车型'
      };
      console.log(data);
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    // 添加车型详情成功回调
    baseInfoAddOk = () => {
      const { page, perpage } = this.props;
      // 重新拉取列表
      this.fetchList(page, perpage);
      this.fetchBrandFacModList();
      this.closeModal();
    };


    // 审核数组
    carmodelApprove = () => {
      confirm({
        title: '确定执行批量操作？',
        content: '确认后不可恢复',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          const { dispatch, approveList, approveStatus } = this.props;

          // 审核不通过，不需要下面的check
          if(approveStatus === 'NONAPPROVED') {
            return this.fetchBaseOriginApprove();
          }

          // 审核通过操作
          dispatch({
            type: 'baseorigin/fetchCarmodelApproveCheck',
            payload:{
              cm_ids: approveList
            },
            callback: res => {
              // 车型检查不通过,没有车系
              if(res.code === 21028) {
                msg(res.msg);
              }

              // 待审核车型存在新车系
              if(res.code === 21029) {
                const dataSource = res.error;
                const columns = [{
                  title: '品牌',
                  dataIndex: 'cm_brand'
                }, {
                  title: '主机厂',
                  dataIndex: 'cm_factory'
                }, {
                  title: '车系',
                  dataIndex: 'cm_car'
                }];
                confirm({
                  title: '待审核车型包含新车系',
                  content: <Table className="m-t-15" dataSource={dataSource} bordered={true} showHeader={true} pagination={false} columns={columns} size="middle" rowKey={(item, index) => index} />,
                  okText: '确认（产生新车系）',
                  cancelText: '取消',
                  onOk: () => {
                    this.fetchBaseOriginApprove();
                  }
                });
              }

              if( res.code === 0 ){
                this.fetchBaseOriginApprove();
              }

            }
          });
        }
      });
    };

    // 标准车型审核通过
    fetchBaseOriginApprove = () => {
      const { dispatch, approveStatus, approveList, page, perpage } = this.props;
      dispatch({
        type: 'baseorigin/fetchBaseOriginApprove',
        payload:{
          cm_ids: approveList,
          review_status: approveStatus,
          goBackFlag: 1,
          cb: () => {
            dispatch({　type: 'baseorigin/updateState', payload: { approveList: [] } });
            // 重新拉取列表
            this.fetchList(page, perpage);
          }
        }
      });
    }

  // 标准车型clone
  fetchCarmodelClone = (cm_id, index) => {
    const { dispatch } = this.props;
    confirm({
      title: '确认复制此标准车型吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        dispatch({
          type: 'baseorigin/fetchCarmodelClone',
          payload: { cm_id },
          index
        });
      }
    });
  }

  /***************************** 创建标准车型 end ****************************************** */

    /** 机油等级 机油粘度 */
    // 更新标准车型机油等级
    updateCarmodelEngineoilLevel = (type, data, index) => {
      const { dispatch, CARMODEL_ENGINEOIL_LEVEL = [] } = this.props;
      let payload = [];
      if(type === 'add') {
        payload = [data, ...CARMODEL_ENGINEOIL_LEVEL];
      }else if(type === 'del') {
        payload = CARMODEL_ENGINEOIL_LEVEL.filter((v, idx) => idx !== index);
      }
      dispatch({
        type: 'baseorigin/updateCarmodelEngineoilLevel',
        payload
      });

    }
    updateCarmodelEngineoilLeveluserRecord=(payload)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:payload,
        record_page:' 标准车型/标准车型 编辑/审核',
        record_operations:' 更新标准车型机油等级'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }

    // 更新标准车型机油粘度
    updateCarmodelEngineoilSae = (type, data, index) => {
      const { dispatch, CARMODEL_ENGINEOIL_SAE = [] } = this.props;
      let payload = [];
      if(type === 'add') {
        payload = [data, ...CARMODEL_ENGINEOIL_SAE];
      }else if(type === 'del') {
        payload = CARMODEL_ENGINEOIL_SAE.filter((v, idx) => idx !== index);
      }
      dispatch({
        type: 'baseorigin/updateCarmodelEngineoilSae',
        payload
      });
    }

    /** 机油等级 机油粘度 end */

    render() {
      const { loading, dispatch, carmodelBaseList, perpage, page, approveList, carmodelBaseInfo, form, fields, carmodelList, carmodelProList, CARMODEL_ENGINEOIL_LEVEL, CARMODEL_ENGINEOIL_SAE } = this.props;
      const { carmodelProListValue } = fields;
      const { visible, modalType } = this.state;
      // 表格配置
      const tableList = carmodelBaseList.list.map(item => {
        let cm_carmodel = item.cm_brand + ' / ' + item.cm_factory + ' / ' + item.cm_model + ' / ' + item.cm_conf_level;
        return { ...item, cm_carmodel };
      });
        // 分页配置
      const pagination = {
        total: parseInt(carmodelBaseList.count, 10),
        pageSize: perpage,
        current: page,
        showSizeChanger: true,
        onShowSizeChange: this.onShowSizeChange,
        onChange: this.handleTableChange,
        showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`
      };
        // 表格选择操作配置
      const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
          dispatch({ type: 'baseorigin/updateState', payload: { approveList: selectedRowKeys } });
        },
        selectedRowKeys: approveList
      };
      // 提交搜索
      const handleSubmit = e => {
        e.preventDefault();
        const { dispatch, perpage, fields, form } = this.props;

        form.validateFields(async (err, values) => {
          let newFields = {...fields};
          for(let f in newFields) {
            if(f !== 'carmodelProListValue') {
              for(let v in values) {
                if(f == v) {
                  newFields[f] = values[v];
                }
              }
            }
          }
          if (!err) {
            dispatch({ type: 'baseorigin/updateState', payload: { approveList: [] } });
            await dispatch({ type: 'baseorigin/updateState', payload: { fields: newFields } });
            // 获取标准车型列表
            await this.fetchList(1, perpage);
          }
          searchListRecord(newFields);
        });
      };
      // 添加搜索操作记录
      const searchListRecord=(fields)=>{
        const { dispatch } = this.props;
        const data={
          record_obj:{
            fields:fields
          },
          record_page:'标准车型/标准车型',
          record_operations:'搜索标准车型'
        };
        console.log(data);
        dispatch({
          type:'managerRecord/fetchUserRecorListInsert',
          data:data
        });
      };
      // 审核动作【表格】
      const approve_status = [
        { key: '审核通过', val: 'APPROVED' },
        { key: '审核不通过', val: 'NONAPPROVED' }
      ];
      // list表格配置
      const tableTitle = [
        { title: '品牌/主机厂/车型/配置等级', dataIndex: 'cm_carmodel' },
        { title: '车系', dataIndex: 'cm_car' },
        { title: '排量', dataIndex: 'cm_displacement' },
        { title: '年款', dataIndex: 'cm_model_year', width: 60 },
        { title: '底盘号', dataIndex: 'cm_chassis_model' },
        { title: '发动机型号', dataIndex: 'cm_engine_model' },
        { title: '发动机启停', dataIndex: 'cm_engine_start_stop' },
        { title: '燃油类型', dataIndex: 'cm_fuel_type' },
        { title: '变速箱类型', dataIndex: 'cm_gearbox' },
        // { title: '变速箱模式', dataIndex: 'cm_gearbox_drywet' },
        // { title: '变速箱型号', dataIndex: 'cm_gearbox_model' },
        { title: '驱动方式', dataIndex: 'cm_driving_mode' },
        { title: '排放标准', dataIndex: 'cm_emission' },
        { title: '上市年份', dataIndex: 'cm_sales_year' },
        { title: '停产年份', dataIndex: 'cm_stop_year' },
        { title: '最大功率kW', dataIndex: 'cm_max_power' },
        { title: '数据来源', dataIndex: 'cm_origin' },
        { title: '克隆ID', dataIndex: 'cm_clone_id' },
        { title: '审核状态', dataIndex: 'carmodel_status' },
        { title: '更新时间', dataIndex: 'update_time' },
        { title: '操作', dataIndex: 'operating', width: 80, fixed: 'right' }
      ].map(item => {
        const config = {
          APPROVED_DELETED: '已审核，有车型删除',
          PENDING_ADD: '待审核',
          APPROVED_UPDATE: '已审核 关联车型有更新',
          APPROVED: '通过',
          NONAPPROVED: '不通过'
        };
        const originNames = {
          'liyang': '力洋',
          'easyepc': '精友',
          'sopei': '搜配'
        };

        const editClick=(id)=>{
          const { dispatch } = this.props;
          const data={
            record_obj:{
              cm_id:id
            },
            record_page:' 标准车型/标准车型 编辑/审核',
            record_operations:'编辑车型:'+id
          };
          dispatch({
            type:'managerRecord/fetchUserRecorListInsert',
            data:data
          });
        };
        item.title = <TheadTitle text={item.title} />;
        let obj = { ...item };
        if (obj.dataIndex == 'operating') {
          // 设定操作列数据
          obj.render = (text, record, index) => {
            return (
              <>
                <Link className='f12' onClick={()=>editClick(record.cm_id)} to={'/baseorigin/list/' + record.cm_id}>编辑</Link>
                <span className='f12 m-l-10 cur link' onClick={() => this.fetchCarmodelClone(record.cm_id, index)}>复制</span>
              </>
            );
          };
        } else if(obj.dataIndex == 'update_time') {
          obj.render = text => {
            return text ? moment(text).format('YYYY-MM-DD') : '-';
          };
        } else {
          // 处理无数据显示状态
          obj.render = (text, record, index) => {
            let classNames = 'f12 c3';
            if (obj.dataIndex == 'carmodel_status') {
              if (text == 'PENDING_ADD') {
                classNames += ' red3';
              }
              text = config[text];
            }
            if (obj.dataIndex == 'cm_origin') {
              text = text ? uniqueArr(text.split(',').map(item => originNames[item])) : '';
            }
            return <div className={classNames}>{text || ''}</div>;
          };
        }
        return obj;
      });
      return (
        <React.Fragment>
          <Card bordered={false} style={{ minHeight: 350 }}>
            {/* 筛选表单 */}
            <Card bordered={false} className="baseorigin_list" loading={loading['global/fetchBrandFacModList']}>
              <FilterForm
                form={form}
                fields={fields}
                carmodelList={carmodelList}
                carmodelProList={carmodelProList}
                carmodelProListValue={carmodelProListValue}
                addCarmodelProList={this.addCarmodelProList}
                updateCarmodelProList={this.updateCarmodelProList}
                removeCarmodelProList={this.removeCarmodelProList}
                handleSubmit={handleSubmit}
              />
            </Card>
            {/* 表格 */}
            <Divider style={{ marginBottom: 15 }} />
            <Form layout="inline">
              <Row className="text-right">
                <FormItem>
                  <Select defaultValue="审核通过"
                    onChange={(selectedRowKeys, selectedRows) => {
                      dispatch({ type: 'baseorigin/updateState', payload: { approveStatus: selectedRows.key } });
                    }}>
                    {
                      approve_status.map((item, index) => {
                        return <Option key={item.val} value={item.key}>{item.key}</Option>;
                      })
                    }
                  </Select>
                </FormItem>
                <FormItem>
                  <Button type="primary" disabled={approveList.length === 0} onClick={ this.carmodelApprove }>批量审核</Button>
                </FormItem>
                <FormItem>
                  <Button type="primary" onClick={e => { this.showModal(e, 'add'); }}>创建标准车型</Button>
                </FormItem>
              </Row>
            </Form>
            <Table
              loading={loading['baseorigin/fetchList']}
              className="baseorigin-list-table m-t-15 f12"
              rowSelection={rowSelection}
              columns={tableTitle}
              rowKey={(item, index) => item.cm_id}
              dataSource={tableList}
              pagination={pagination}
              scroll={{ x: 'max-content'}}
            />

            {/* 模态框 */}
            <DetailModal
              global_loading={loading}
              carmodelBaseInfo={carmodelBaseInfo}
              visible={visible}
              modalType={modalType}
              closeModal={this.closeModal}
              fetchBaseInfoAdd={this.fetchBaseInfoAdd}
              CARMODEL_ENGINEOIL_SAE={CARMODEL_ENGINEOIL_SAE}
              CARMODEL_ENGINEOIL_LEVEL={CARMODEL_ENGINEOIL_LEVEL}
              onUpdateCarmodelEngineoilLevel={this.updateCarmodelEngineoilLevel}
              onUpdateCarmodelEngineoilSae={this.updateCarmodelEngineoilSae}
            />
          </Card>
        </React.Fragment>
      );
    }
}

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.global,
  ...state.baseorigin
});
const baseList = Form.create()(BaseListForm);
export default connect(mapStateToProps)(baseList);
