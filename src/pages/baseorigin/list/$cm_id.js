import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Button, Table, Form, Modal ,Divider } from 'antd';
import DetailModal from './components/DetailModal';
import carmodelBaseInfoConfig from '@/assets/json/carmodelBaseInfo.json';
import router from 'umi/router';
import { clone, isArray, isObject, uniqueArr, isEmpty } from '@/utils/tools';
import searchForm from './components/DetailSearchForm';
import PartLoading from '@/components/PartLoading/index';
import styles from './$cm_id.less';
import msg from '@/utils/msg';
const confirm = Modal.confirm;

// 关联源车型Title
let carmodelOriginTitle = [
  { name: '数据源', dataIndex: 'cm_origin', width: 140 },
  { name: '销售名称/俗称', dataIndex: 'cm_sales_name', width: 300 },
  { name: '品牌/主机厂/车型/配置等级', dataIndex: 'cm_carmodel', width: 300 },
  { name: '车系', dataIndex: 'cm_car', width: 140 },
  { name: '车系国别', dataIndex: 'cm_brand_country', width: 140 },
  { name: '国别', dataIndex: 'cm_countries', width: 140 },
  { name: '国产合资进口', dataIndex: 'cm_producer_type', width: 140 },
  { name: '排量', dataIndex: 'cm_displacement', width: 140 },
  { name: '年款', dataIndex: 'cm_model_year', width: 140 },
  { name: '底盘号', dataIndex: 'cm_chassis_model', width: 140 },
  { name: '发动机型号', dataIndex: 'cm_engine_model', width: 140 },
  { name: '发动机启停', dataIndex: 'cm_engine_start_stop', width: 140 },
  { name: '动力类型（燃油类型）', dataIndex: 'cm_fuel_type', width: 180 },
  { name: '变速箱类型（手动，自动）', dataIndex: 'cm_trans_type', width: 200 },
  { name: '变速箱类型', dataIndex: 'cm_gearbox', width: 180 },
  // { name: '变速箱模式', dataIndex: 'cm_gearbox_drywet', width: 180 },
  { name: '变速箱型号', dataIndex: 'cm_gearbox_model', width: 140 },
  { name: '发动机位', dataIndex: 'cm_engine_position', width: 140 },
  { name: '驱动方式', dataIndex: 'cm_driving_mode', width: 140 },
  { name: '气缸容积', dataIndex: 'cm_cylinder', width: 140 },
  { name: '进气形式', dataIndex: 'cm_intake_form', width: 140 },
  { name: '燃油标号', dataIndex: 'cm_fuel_label', width: 140 },
  { name: '最大马力', dataIndex: 'cm_engine_horsepower', width: 140 },
  { name: '气缸排列', dataIndex: 'cm_cylinder_arrangement', width: 140 },
  { name: '气缸数（个）', dataIndex: 'cm_cylinder_num', width: 140 },
  { name: '每缸气门数（个）', dataIndex: 'cm_per_cylinder_num', width: 140 },
  { name: '档位数', dataIndex: 'cm_block_num', width: 140 },
  { name: '排放标准', dataIndex: 'cm_emission', width: 140 },
  { name: '上市年份', dataIndex: 'cm_sales_year', width: 140 },
  { name: '上市月份', dataIndex: 'cm_sales_month', width: 140 },
  { name: '停产年份', dataIndex: 'cm_stop_year', width: 140 },
  { name: '生产状态', dataIndex: 'cm_product_status', width: 140 },
  { name: '最大功率kW', dataIndex: 'cm_max_power', width: 140 },
  { name: '车辆类型', dataIndex: 'cm_car_type', width: 140 },
  { name: '前制动器类型', dataIndex: 'cm_front_brake_type', width: 140 },
  { name: '后制动器类型', dataIndex: 'cm_rear_brake_type', width: 140 },
  { name: '助力类型', dataIndex: 'cm_support_type', width: 140 },
  { name: '驻车制动类型', dataIndex: 'cm_park_brake_type', width: 140 },
  { name: '轴距（mm）', dataIndex: 'cm_body_wheelbase', width: 140 },
  { name: '车门数', dataIndex: 'cm_door_num', width: 140 },
  { name: '车座数（个）', dataIndex: 'cm_seat_num', width: 140 },
  { name: '前轮胎规格', dataIndex: 'cm_front_wheel', width: 140 },
  { name: '后轮胎规格', dataIndex: 'cm_rear_wheel', width: 140 },
  { name: '前轮毂规格', dataIndex: 'cm_front_wheel_hub', width: 140 },
  { name: '后轮毂规格', dataIndex: 'cm_rear_wheel_hub', width: 140 },
  { name: '轮毂材料', dataIndex: 'cm_hub_material', width: 140 },
  { name: '备胎规格', dataIndex: 'cm_spare_wheel', width: 140 },
  { name: '电动天窗', dataIndex: 'cm_electric_skylight', width: 140 },
  { name: '全景天窗', dataIndex: 'cm_panoramic_sunroof', width: 140 },
  { name: '近光灯', dataIndex: 'cm_near_lamp', width: 140 },
  { name: '远光灯', dataIndex: 'cm_far_lamp', width: 140 },
  { name: '前雾灯', dataIndex: 'cm_front_fog', width: 140 },
  { name: '后雨刷', dataIndex: 'cm_rear_wiper', width: 140 },
  { name: '空调控制方式（自动，手动）', dataIndex: 'cm_air_control_mode', width: 200 },
  { name: '源车辆指导价', dataIndex: 'cm_origin_price', width: 140 },
  { name: '车辆指导价', dataIndex: 'cm_model_price', width: 140 },
  { name: '前悬挂类型', dataIndex: 'cm_front_suspension_type', width: 140 },
  { name: '后悬挂类型', dataIndex: 'cm_rear_suspension_type', width: 140 },
  { name: '转向机形式', dataIndex: 'cm_steering_engine_form', width: 140 },
  { name: 'ABS防抱死', dataIndex: 'cm_abs_antilock', width: 140 },
  { name: '基础油类型', dataIndex: 'cm_engineoil_type', width: 140 },
  { name: '保养加注量', dataIndex: 'cm_engineoil_volume', width: 140 },
  { name: '制动液(刹车油)加注量', dataIndex: 'cm_brakeoil_volume', width: 200 },
  { name: '转向助力液加注量', dataIndex: 'cm_steeroil_volume', width: 200 },
  { name: '空调制冷剂加注量', dataIndex: 'cm_airrefrigerant_volume', width: 200 },
  { name: '冷却液加注量', dataIndex: 'cm_coolant_volume', width: 200 },
  { name: '制动液(刹车油)规格', dataIndex: 'cm_brakeoil_standard', width: 200 },
  { name: '转向助力液规格', dataIndex: 'cm_steeroil_standard', width: 200 },
  { name: '空调制冷剂规格', dataIndex: 'cm_airrefrigerant_standard', width: 200 },
  { name: '冷却液规格', dataIndex: 'cm_coolant_standard', width: 200 },
  { name: '状态', dataIndex: 'cm_origin_status', width: 100, fixed: 'right' },
  { name: '操作', dataIndex: 'operation', width: 100, fixed: 'right' }
];

// 待审核标准车型Title
let listByCmidTitle = [
  { name: '品牌/主机厂/车型/配置等级', dataIndex: 'cm_carmodel', width: 300 },
  { name: '车系', dataIndex: 'cm_car', width: 140 },
  { name: '车系国别', dataIndex: 'cm_brand_country', width: 140 },
  { name: '国别', dataIndex: 'cm_countries', width: 140 },
  { name: '国产合资进口', dataIndex: 'cm_producer_type', width: 140 },
  { name: '排量', dataIndex: 'cm_displacement', width: 140 },
  { name: '年款', dataIndex: 'cm_model_year', width: 140 },
  { name: '底盘号', dataIndex: 'cm_chassis_model', width: 140 },
  { name: '发动机型号', dataIndex: 'cm_engine_model', width: 140 },
  { name: '发动机启停', dataIndex: 'cm_engine_start_stop', width: 140 },
  { name: '动力类型（燃油类型）', dataIndex: 'cm_fuel_type', width: 140 },
  { name: '变速箱类型（手动，自动）', dataIndex: 'cm_trans_type', width: 200 },
  { name: '变速箱类型', dataIndex: 'cm_gearbox', width: 180 },
  { name: '变速箱模式', dataIndex: 'cm_gearbox_drywet', width: 180 },
  { name: '变速箱型号', dataIndex: 'cm_gearbox_model', width: 140 },
  { name: '发动机位', dataIndex: 'cm_engine_position', width: 140 },
  { name: '驱动方式', dataIndex: 'cm_driving_mode', width: 140 },
  { name: '气缸容积', dataIndex: 'cm_cylinder', width: 140 },
  { name: '进气形式', dataIndex: 'cm_intake_form', width: 140 },
  { name: '燃油标号', dataIndex: 'cm_fuel_label', width: 140 },
  { name: '最大马力', dataIndex: 'cm_engine_horsepower', width: 140 },
  { name: '气缸排列', dataIndex: 'cm_cylinder_arrangement', width: 140 },
  { name: '气缸数（个）', dataIndex: 'cm_cylinder_num', width: 140 },
  { name: '火花塞数量', dataIndex: 'cm_spark_plug_num', width: 200 },
  { name: '每缸气门数（个）', dataIndex: 'cm_per_cylinder_num', width: 140 },
  { name: '档位数', dataIndex: 'cm_block_num', width: 140 },
  { name: '排放标准', dataIndex: 'cm_emission', width: 140 },
  { name: '上市年份', dataIndex: 'cm_sales_year', width: 140 },
  { name: '上市月份', dataIndex: 'cm_sales_month', width: 140 },
  { name: '停产年份', dataIndex: 'cm_stop_year', width: 140 },
  { name: '生产状态', dataIndex: 'cm_product_status', width: 140 },
  { name: '最大功率kW', dataIndex: 'cm_max_power', width: 140 },
  { name: '车辆类型', dataIndex: 'cm_car_type', width: 140 },
  { name: '前制动器类型', dataIndex: 'cm_front_brake_type', width: 140 },
  { name: '后制动器类型', dataIndex: 'cm_rear_brake_type', width: 140 },
  { name: '助力类型', dataIndex: 'cm_support_type', width: 140 },
  { name: '驻车制动类型', dataIndex: 'cm_park_brake_type', width: 140 },
  { name: '轴距（mm）', dataIndex: 'cm_body_wheelbase', width: 140 },
  { name: '车门数', dataIndex: 'cm_door_num', width: 140 },
  { name: '车座数（个）', dataIndex: 'cm_seat_num', width: 140 },
  { name: '前轮胎规格', dataIndex: 'cm_front_wheel', width: 140 },
  { name: '后轮胎规格', dataIndex: 'cm_rear_wheel', width: 140 },
  { name: '前轮毂规格', dataIndex: 'cm_front_wheel_hub', width: 140 },
  { name: '后轮毂规格', dataIndex: 'cm_rear_wheel_hub', width: 140 },
  { name: '轮毂材料', dataIndex: 'cm_hub_material', width: 140 },
  { name: '备胎规格', dataIndex: 'cm_spare_wheel', width: 140 },
  { name: '电动天窗', dataIndex: 'cm_electric_skylight', width: 140 },
  { name: '全景天窗', dataIndex: 'cm_panoramic_sunroof', width: 140 },
  { name: '近光灯', dataIndex: 'cm_near_lamp', width: 140 },
  { name: '远光灯', dataIndex: 'cm_far_lamp', width: 140 },
  { name: '前雾灯', dataIndex: 'cm_front_fog', width: 140 },
  { name: '后雨刷', dataIndex: 'cm_rear_wiper', width: 140 },
  { name: '空调控制方式（自动，手动）', dataIndex: 'cm_air_control_mode', width: 200 },
  { name: '车辆指导价', dataIndex: 'cm_model_price', width: 140 },
  { name: '前悬挂类型', dataIndex: 'cm_front_suspension_type', width: 140 },
  { name: '后悬挂类型', dataIndex: 'cm_rear_suspension_type', width: 140 },
  { name: '转向机形式', dataIndex: 'cm_steering_engine_form', width: 140 },
  { name: 'ABS防抱死', dataIndex: 'cm_abs_antilock', width: 140 },
  { name: '基础油类型', dataIndex: 'cm_engineoil_type', width: 140 },
  { name: '保养加注量', dataIndex: 'cm_engineoil_volume', width: 140 },

  { name: '制动液(刹车油)加注量', dataIndex: 'cm_brakeoil_volume', width: 200 },
  { name: '转向助力液加注量', dataIndex: 'cm_steeroil_volume', width: 200 },
  { name: '空调制冷剂加注量', dataIndex: 'cm_airrefrigerant_volume', width: 200 },
  { name: '冷却液加注量', dataIndex: 'cm_coolant_volume', width: 200 },
  { name: '制动液(刹车油)规格', dataIndex: 'cm_brakeoil_standard', width: 200 },
  { name: '转向助力液规格', dataIndex: 'cm_steeroil_standard', width: 200 },
  { name: '空调制冷剂规格', dataIndex: 'cm_airrefrigerant_standard', width: 200 },
  { name: '冷却液规格', dataIndex: 'cm_coolant_standard', width: 200 },

  { name: '操作', dataIndex: 'cm_handle', width: 180, fixed: 'right' }
];

// 合并标准车型Title
let listBySearchTitle = [
  { name: '品牌/主机厂/车型/配置等级', dataIndex: 'cm_carmodel', width: 300 },
  { name: '车系', dataIndex: 'cm_car', width: 140 },
  { name: '车系国别', dataIndex: 'cm_brand_country', width: 140 },
  { name: '国别', dataIndex: 'cm_countries', width: 140 },
  { name: '国产合资进口', dataIndex: 'cm_producer_type', width: 140 },
  { name: '排量', dataIndex: 'cm_displacement', width: 140 },
  { name: '年款', dataIndex: 'cm_model_year', width: 140 },
  { name: '底盘号', dataIndex: 'cm_chassis_model', width: 140 },
  { name: '发动机型号', dataIndex: 'cm_engine_model', width: 140 },
  { name: '发动机启停', dataIndex: 'cm_engine_start_stop', width: 140 },
  { name: '动力类型（燃油类型）', dataIndex: 'cm_fuel_type', width: 140 },
  { name: '变速箱类型（手动，自动）', dataIndex: 'cm_trans_type', width: 200 },
  { name: '变速箱类型', dataIndex: 'cm_gearbox', width: 180 },
  { name: '变速箱模式', dataIndex: 'cm_gearbox_drywet', width: 180 },
  { name: '变速箱型号', dataIndex: 'cm_gearbox_model', width: 140 },
  { name: '发动机位', dataIndex: 'cm_engine_position', width: 140 },
  { name: '驱动方式', dataIndex: 'cm_driving_mode', width: 140 },
  { name: '气缸容积', dataIndex: 'cm_cylinder', width: 140 },
  { name: '进气形式', dataIndex: 'cm_intake_form', width: 140 },
  { name: '燃油标号', dataIndex: 'cm_fuel_label', width: 140 },
  { name: '最大马力', dataIndex: 'cm_engine_horsepower', width: 140 },
  { name: '气缸排列', dataIndex: 'cm_cylinder_arrangement', width: 140 },
  { name: '气缸数（个）', dataIndex: 'cm_cylinder_num', width: 140 },
  { name: '火花塞数量', dataIndex: 'cm_spark_plug_num', width: 200 },
  { name: '每缸气门数（个）', dataIndex: 'cm_per_cylinder_num', width: 140 },
  { name: '档位数', dataIndex: 'cm_block_num', width: 140 },
  { name: '排放标准', dataIndex: 'cm_emission', width: 140 },
  { name: '上市年份', dataIndex: 'cm_sales_year', width: 140 },
  { name: '上市月份', dataIndex: 'cm_sales_month', width: 140 },
  { name: '停产年份', dataIndex: 'cm_stop_year', width: 140 },
  { name: '生产状态', dataIndex: 'cm_product_status', width: 140 },
  { name: '最大功率kW', dataIndex: 'cm_max_power', width: 140 },
  { name: '车辆类型', dataIndex: 'cm_car_type', width: 140 },
  { name: '前制动器类型', dataIndex: 'cm_front_brake_type', width: 140 },
  { name: '后制动器类型', dataIndex: 'cm_rear_brake_type', width: 140 },
  { name: '助力类型', dataIndex: 'cm_support_type', width: 140 },
  { name: '驻车制动类型', dataIndex: 'cm_park_brake_type', width: 140 },
  { name: '轴距（mm）', dataIndex: 'cm_body_wheelbase', width: 140 },
  { name: '车门数', dataIndex: 'cm_door_num', width: 140 },
  { name: '车座数（个）', dataIndex: 'cm_seat_num', width: 140 },
  { name: '前轮胎规格', dataIndex: 'cm_front_wheel', width: 140 },
  { name: '后轮胎规格', dataIndex: 'cm_rear_wheel', width: 140 },
  { name: '前轮毂规格', dataIndex: 'cm_front_wheel_hub', width: 140 },
  { name: '后轮毂规格', dataIndex: 'cm_rear_wheel_hub', width: 140 },
  { name: '轮毂材料', dataIndex: 'cm_hub_material', width: 140 },
  { name: '备胎规格', dataIndex: 'cm_spare_wheel', width: 140 },
  { name: '电动天窗', dataIndex: 'cm_electric_skylight', width: 140 },
  { name: '全景天窗', dataIndex: 'cm_panoramic_sunroof', width: 140 },
  { name: '近光灯', dataIndex: 'cm_near_lamp', width: 140 },
  { name: '远光灯', dataIndex: 'cm_far_lamp', width: 140 },
  { name: '前雾灯', dataIndex: 'cm_front_fog', width: 140 },
  { name: '后雨刷', dataIndex: 'cm_rear_wiper', width: 140 },
  { name: '空调控制方式（自动，手动）', dataIndex: 'cm_air_control_mode', width: 200 },
  { name: '车辆指导价', dataIndex: 'cm_model_price', width: 140 },
  { name: '前悬挂类型', dataIndex: 'cm_front_suspension_type', width: 140 },
  { name: '后悬挂类型', dataIndex: 'cm_rear_suspension_type', width: 140 },
  { name: '转向机形式', dataIndex: 'cm_steering_engine_form', width: 140 },
  { name: 'ABS防抱死', dataIndex: 'cm_abs_antilock', width: 140 },
  { name: '基础油类型', dataIndex: 'cm_engineoil_type', width: 140 },
  { name: '保养加注量', dataIndex: 'cm_engineoil_volume', width: 140 },

  { name: '制动液(刹车油)加注量', dataIndex: 'cm_brakeoil_volume', width: 200 },
  { name: '转向助力液加注量', dataIndex: 'cm_steeroil_volume', width: 200 },
  { name: '空调制冷剂加注量', dataIndex: 'cm_airrefrigerant_volume', width: 200 },
  { name: '冷却液加注量', dataIndex: 'cm_coolant_volume', width: 200 },
  { name: '制动液(刹车油)规格', dataIndex: 'cm_brakeoil_standard', width: 200 },
  { name: '转向助力液规格', dataIndex: 'cm_steeroil_standard', width: 200 },
  { name: '空调制冷剂规格', dataIndex: 'cm_airrefrigerant_standard', width: 200 },
  { name: '冷却液规格', dataIndex: 'cm_coolant_standard', width: 200 },

  { name: '状态', dataIndex: 'carmodel_status', width: 80, fixed: 'right' },
  { name: '操作', dataIndex: 'cm_handle', width: 120, fixed: 'right' }
];

// 审核动作
const approveStatus = { APPROVED: 'APPROVED', NONAPPROVED: 'NONAPPROVED' };

class Edit extends Component {
    state = {
      visible: false,             // 车型详情模态框显示标识
      modalType: '',
      cm_origin: null,
      type:'',
      arr:[],
      arr1:[],
      marr:[],
      marr1:[],
      columsa:[],
      mcolumsa:[],
      visiblea:false,
      params:{},
      status:'',
      redList:[],
      mergeList:[],
      record:{}
    };
    // tableRef1=React.createRef()
    // tableRef2=React.createRef()
    // modalRef=React.createRef()
    componentDidMount() {
      this.pageInit();
      // 待选车型&合并车型表格横向滚动条同步配置
      var tableBody = $('.ant-table-body');
      const handleScroll = (targetIdx, handleIdx) => {
        let xPos = $(tableBody[targetIdx]).scrollLeft();
        $(tableBody[handleIdx]).scrollLeft(xPos);
      };
      $(tableBody[0]).scroll(() => handleScroll(0, 1));
      $(tableBody[0]).scroll(() => handleScroll(0, 2));
      $(tableBody[1]).scroll(() => handleScroll(1, 0));
      $(tableBody[2]).scroll(() => handleScroll(2, 0));
      // -- 原
      $(tableBody[1]).scroll(() => handleScroll(1, 2));
      $(tableBody[2]).scroll(() => handleScroll(2, 1));

    };
    componentWillUnmount() {
      this.props.dispatch({　type: 'baseorigin_id/clearState' });
      // 移除横向滚动条的监听
      var tableBody = $('.ant-table-body');
      $(tableBody[0]).scroll = $(tableBody[1]).scroll = $(tableBody[2]).scroll = null;
    };
    //WARNING! To be deprecated in React v17. Use componentDidUpdate instead.
    componentDidUpdate(prevProps, prevState) {
      if(prevProps.match.url !== this.props.location.pathname) {
        this.pageInit();
      }
    };

    pageInit = async () => {
      const { match } = this.props;
      const cm_id = match.params.cm_id;
      // 获取关联源车型
      await this.fechCarmodelOriginList(cm_id);
      // 初始化待审核标准车型
      await this.fechListByCmid(cm_id);
      // 获取品牌主机厂车型列表
      await this.fetchBrandFacModList();
      // 获取合并车型列表
      this.fechListBySearch();
    };

    /***************************** 关联源车型 ****************************************** */
    // 源车型列表 - 初始化表格头
    initCarmodelOriginTitle = () => {
      const { carmodelOriginList } = this.props;
      const config = {
        PENDING_ADD: '新车型',
        PENDING_UPDATE: '有更新',
        APPROVED: '通过',
        NONAPPROVED: '不通过',
        DELETED: '删除',
        PENDING_DELETED: '待删除'
      };
      const originNames = {
        easyepc: '精友',
        liyang: '力洋',
        sopei: '搜配'
      };

      // 取出每列key对应的值，长度是否大于1，如果是的话，title用红色标出来
      let initObj = {};
      carmodelOriginList.forEach(item => {
        item.cm_carmodel = item.cm_brand + ' / ' + item.cm_factory + ' / ' + item.cm_model + ' / ' + item.cm_conf_level;
        for (const key in item) {
          let val = '';
          if(!isEmpty(item[key]) && item[key] !== '—' && item[key] !== '-') { // '—'和'-'也属于空数据，不进行对比
            val = item[key];
          }
          if(!initObj[key]){
            initObj[key] = [val];
          } else {
            initObj[key].push(val);
          }
        }
      });

      for (const key in initObj) {
        initObj[key] = uniqueArr(initObj[key]);
      }
      carmodelOriginTitle.forEach((item, colIdx) => {
        let styles = initObj[item.dataIndex] && initObj[item.dataIndex].length > 1 ? {display: 'block', color: '#fff', backgroundColor: '#f00'} : {};
        item.title = <span className="f12" style={styles}>{item.name}</span>;
        item.render = (text, record, index) => {
          let classNames = 'f12';
          if(item.dataIndex == 'operation') {
            if(record.cm_origin_status == 'PENDING_DELETED') {
              return (
                <React.Fragment>
                  <span className='f12 blue6 cur' onClick={e => { this.showModal(e, 'origin_detail', record,'查看关联源车型详情'); }}>详细</span>
                  {
                    // carmodelOriginList.length > 1 &&
                    <span className='f12 blue6 cur m-l-10' onClick={() => this.handleDeleteOriginFn(record.cm_id, record.cm_origin_id)}>删除</span>
                  }
                </React.Fragment>
              );
            } else {
              return (<span className='f12 blue6 cur' onClick={e => { this.showModal(e, 'origin_detail', record,'查看关联源车型详情'); }}>详细</span>);
            }
          }
          classNames += ' c3';
          if (item.dataIndex == 'cm_origin_status') {
            if (text == 'PENDING_DELETED') {
              classNames += ' red6';
            } else if (text == 'PENDING_UPDATE') {
              classNames += ' gold6';
            } else if (text == 'DELETED') {
              classNames += ' gray line-through';
            }
            text = config[text];
          }
          if (item.dataIndex == 'cm_origin') {
            text = originNames[text];
          }
          return <div className={classNames}>{text || ''}</div>;
        };

      });
    };
    // 关联源车型 - 删除
    handleDeleteOriginFn = (cm_id, cm_origin_id) => {
      confirm({
        title: '数据删除后不可恢复，是否继续？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {

          this.props.dispatch({
            type: 'baseorigin_id/delCarmodelOrigin',
            payload: { cm_id, cm_origin_id }
          });
        }
      });
    }

    // 待审核标准车型列表 - 初始化表格头
    initListByCmidTitle = () => {
      const { carmodelOriginList, listByCmid } = this.props;
      // 取出每列key对应的值，长度是否大于1，如果是的话，title用红色标出来
      let initObj = {};
      carmodelOriginList.forEach(item => {
        item.cm_carmodel = item.cm_brand + ' / ' + item.cm_factory + ' / ' + item.cm_model + ' / ' + item.cm_conf_level;
        for (const key in item) {
          let val = '';
          if(!isEmpty(item[key]) && item[key] !== '—' && item[key] !== '-') { // '—'和'-'也属于空数据，不进行对比
            val = item[key];
          }
          if(!initObj[key]){
            initObj[key] = [val];
          } else {
            initObj[key].push(val);
          }
        }
      });

      listByCmid.forEach((item) => {
        item.cm_carmodel = item.cm_brand + ' / ' + item.cm_factory + ' / ' + item.cm_model + ' / ' + item.cm_conf_level;
        for(let key in item) {
          let val = '';
          if(!isEmpty(item[key]) && item[key] !== '—' && item[key] !== '-') { // '—'和'-'也属于空数据，不进行对比
            val = item[key];
          }
          if(!initObj[key]) {
            initObj[key] = [val];
          } else {
            initObj[key].push(val);
          }
        }
      });

      for (const key in initObj) {
        initObj[key] = uniqueArr(initObj[key]);
      }

      listByCmidTitle.forEach(item => {
        let styles = initObj[item.dataIndex] && initObj[item.dataIndex].length > 1 ? {display: 'block', color: '#fff', backgroundColor: '#f00'} : {};
        item.title = <span className="f12" style={styles}>{item.name}</span>;
        item.render = (text, record, index) => {
          let classNames = 'f12';
          let handleClassNames = 'f12 blue6 cur m-r-10 pull-left';
          if(item.dataIndex == 'cm_handle') {
            return (
              <div className='clearfix'>
                <div className={handleClassNames} onClick={ e => { this.showModal(e, 'edit', record,'编辑待审核标准车型'); }}>编辑</div>
                <div className={handleClassNames} onClick={ () => { this.fetchBaseOriginApprove(record,index, 'APPROVED', approveStatus.APPROVED); }}>通过</div>
                {/* 数据源为搜配，不显示不通过 */}
                {!record.cm_origin.includes('sopei') && <div className={handleClassNames} onClick={ () => { this.fetchBaseOriginApprove(record,index, 'NONAPPROVED', approveStatus.NONAPPROVED); }}>不通过</div>}
                <div className={handleClassNames} onClick={ e => { this.fetchBaseInfoDelete(e, record.cm_id); }}>删除</div>
              </div>
            );
          }
          classNames += ' c3';
          return <div className={classNames}>{text || ''}</div>;
        };
      });
    };

    // 获取关联源车型列表
    fechCarmodelOriginList = async cm_id => {
      const { dispatch } = this.props;
      await dispatch({
        type: 'baseorigin_id/fetchCarmodelOriginList',
        payload: {
          cm_id,
          cb: () => this.initCarmodelOriginTitle() // 初始化关联源车型表格头
        }
      });
      const { carmodelOriginList } = this.props;
      if (carmodelOriginList.length == 0) return;
      dispatch({
        type: 'baseorigin_id/updateState',
        payload: {
          carmodelOriginList: carmodelOriginList.map(item => {
            let cm_carmodel = item.cm_brand + ' / ' + item.cm_factory + ' / ' + item.cm_model + ' / ' + item.cm_conf_level;
            return { ...item, cm_carmodel };
          })
        }
      });
    };

    // 获取关联源车型详情数据
    fetchCarmodelOriginInfo = async (cm_origin_id, cm_origin) => {
      const { dispatch } = this.props;
      let res = await dispatch({ type: 'baseorigin_id/fetchCarmodelOriginInfo', payload: { cm_origin_id, cm_origin } });
      const carmodelBaseInfo = this.formatBaseInfo(res.stdCarmodel);
      dispatch({ type: 'baseorigin_id/updateState', payload: {  carmodelBaseInfo } });
      dispatch({ type: 'baseorigin_id/updateState', payload: { carmodelOriginInfo: res.originCarmodel } });
    };

    // 解除标准车型和源车型关系
    fechBaseOriginMappingDelete = () => {
      const { dispatch, match, carmodelOriginList, removeOriginList } = this.props;
      const cm_id = match.params.cm_id;
      if (removeOriginList.length > 0) {
        // 解除关联前确定一次
        confirm({
          title: '确定解除源车型和标准车型关联关系么？',
          content: '认真核实后点击确定按钮',
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            // 构造提交参数
            let newCarmodelOriginList = clone(carmodelOriginList);
            for (let i = 0; i < removeOriginList.length; i++) {
              const key = removeOriginList[i];
              newCarmodelOriginList[key].checked = true;
            }
            let originList = newCarmodelOriginList.filter(item => item.checked).map(item => ({ cm_origin: item.cm_origin, cm_origin_id: item.cm_origin_id }));
            dispatch({
              type: 'baseorigin_id/fetchBaseOriginMappingDelete',
              payload: {
                cm_id,
                originList,
                cb: res => {
                  if(res.code === 0) {
                    let carmodelOriginList = newCarmodelOriginList.filter(item => !item.checked);
                    dispatch({ type: 'baseorigin_id/updateState', payload: { carmodelOriginList: carmodelOriginList } });
                    dispatch({ type: 'baseorigin_id/updateState', payload: { removeOriginList: [] } });
                  }
                }
              }
            });
          }
        });
      }
    }
    /***************************** 关联源车型 end ****************************************** */

    /***************************** 待审核标准车型 ****************************************** */
    // 初始化待审核标准车型
    fechListByCmid = async cm_id => {
      const { dispatch } = this.props;
      await dispatch({
        type: 'baseorigin_id/fetchListByCmid',
        payload: {
          query: { cm_id },
          cb: () => {
            // 初始化审核标准车型表格头
            this.initListByCmidTitle();
            // 初始化合并标准车型
            const { dispatch, listByCmid } = this.props; // 如果listByCmid写在上面可能会取不到值
            // 赋值给合并标准车型的搜索表单
            console.log(listByCmid);
            dispatch({
              type: 'baseorigin_id/updateState',
              payload: {
                fields: {
                  cm_carmodel: [listByCmid[0].cm_brand, listByCmid[0].cm_factory, listByCmid[0].cm_model],
                  cm_engine_model: listByCmid[0].cm_engine_model,
                  cm_displacement: listByCmid[0].cm_displacement,
                  cm_model_year: listByCmid[0].cm_model_year,
                  cm_trans_type: listByCmid[0].cm_trans_type,
                  yearFlag: listByCmid[0].cm_model_year ? true : false,
                  displacementFlag: listByCmid[0].cm_displacement ? true : false,
                  engineFlag: listByCmid[0].cm_engine_model ? true : false
                }
              }
            });
          }
        }
      });
    };

    // 删除标准车型
    fetchBaseInfoDelete = (e, cm_id) => {
      e.preventDefault();
      // 删除前确定一次
      confirm({
        title: '确定删除此标准车型么？',
        content: '删除后此数据将不能恢复',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          const { dispatch } = this.props;
          const data={
            record_obj:{
              cm_id:cm_id,
            },
            record_page:'标准车型/标准车型 编辑/审核',
            record_operations:'删除待审核标准车型'
          };
          dispatch({
            type:'managerRecord/fetchUserRecorListInsert',
            data:data
          });
          this.props.dispatch({ type: 'baseorigin_id/fetchBaseInfoDelete', payload: { cm_id } });
        }
      });
    };
    /***************************** 待审核标准车型 end ****************************************** */

    /***************************** 合并标准车型 ****************************************** */
    // 初始化合并标准车型
    fechListBySearch = () => {
      const { dispatch, match, fields, carmodelApprovedList } = this.props;
      const cm_id = match.params.cm_id;
      const get_cm_carmodel = (data, idx = 0, carmodel = []) => {
        for(let i = 0; i < data.length; i++) {
          if(data[i].v === fields.cm_carmodel[idx]) {
            carmodel.push(data[i].v);
            idx++;
            if(data[i].c) {
              get_cm_carmodel(data[i].c, idx, carmodel);
            }
          }
        }
        return carmodel;
      };
      const query = {cm_displacement:fields.cm_displacement,
        cm_carmodel:fields.cm_carmodel,
        cm_model_year:fields.cm_model_year,
        cm_trans_type:fields.cm_trans_type,
        displacementFlag:fields.displacementFlag,
        engineFlag:fields.engineFlag,
        yearFlag:fields.yearFlag,
        cm_carmodel: get_cm_carmodel(carmodelApprovedList)};
      console.log(fields);
      dispatch({
        type: 'baseorigin_id/fetchListBySearch',
        payload: {
          query: this.createSearchParams(query),
          filterCmIdList: [cm_id],
          cb: () => {
            // 初始化合并标准车型表格头
            this.initListBySearchTitle();
            dispatch({ type: 'baseorigin_id/saveListBySearchSelected', payload: [] });
          }
        }
      });
    };

    // 创建查询参数
    createSearchParams = values => {
      let obj = {};
      let res = {};
      for (const key in values) {
        const value = values[key];
        if (key == 'cm_carmodel') {
          // 品牌/主机厂/车型
          obj.cm_brand = value[0];
          obj.cm_factory = value[1];
          obj.cm_model = value[2];
        } else {
          if(key.indexOf('Flag') == -1) { // 不包括自定义的三个flag
            // 其他
            obj[key] = value;
          }
        }
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

    // 初始化合并标准车型表格头
    initListBySearchTitle = () => {
      const config = {
        PENDING_ADD: '待审核',
        APPROVED_UPDATE: '已审核 关联车型有更新',
        APPROVED: '通过',
        NONAPPROVED: '不通过'
      };

      const { carmodelOriginList, listBySearch } = this.props;
      // 取出每列key对应的值，长度是否大于1，如果是的话，title用红色标出来
      let initObj = {};
      carmodelOriginList.forEach(item => {
        item.cm_carmodel = item.cm_brand + ' / ' + item.cm_factory + ' / ' + item.cm_model + ' / ' + item.cm_conf_level;
        for (const key in item) {
          let val = '';
          if(!isEmpty(item[key]) && item[key] !== '—' && item[key] !== '-') { // '—'和'-'也属于空数据，不进行对比
            val = item[key];
          }
          if(!initObj[key]){
            initObj[key] = [val];
          } else {
            initObj[key].push(val);
          }
        }
      });


      listBySearch.forEach((item) => {
        item.cm_carmodel = item.cm_brand + ' / ' + item.cm_factory + ' / ' + item.cm_model + ' / ' + item.cm_conf_level;
        for(let key in item) {
          let val = item[key] == null ? '' : item[key];
          if(!initObj[key]) {
            initObj[key] = [val];
          } else {
            initObj[key].push(val);
          }
        }
      });

      for (const key in initObj) {
        initObj[key] = uniqueArr(initObj[key]);
      }

      listBySearchTitle.forEach(item => {
        // console.log(item)
        let styles = initObj[item.dataIndex] && initObj[item.dataIndex].length > 1 ? {display: 'block', color: '#fff', backgroundColor: '#f00'} : {};
        item.title = <span className="f12" style={styles}>{item.name}</span>;
        item.render = (text, record, index) => {
          let classNames = 'f12 c3';
          let handleClassNames = 'f12 blue6 cur m-r-10';
          if(item.dataIndex == 'cm_carmodel') {
            return <span className="f12 blue6 cur" onClick={ () => router.push('/baseorigin/list/' + record.cm_id) } title="点击跳转到对应的车型编辑页">{record.cm_carmodel}</span>;
          }
          if(item.dataIndex == 'cm_handle') {
            return (
              <React.Fragment>
                <span className={handleClassNames} onClick={e => { this.showModal(e, 'edit', record,'编辑合并标准车型'); }}>编辑</span>
                <span className={handleClassNames} onClick={() => this.fetchBaseOriginApprove(record,index, 'merge', approveStatus.APPROVED)}>合并审核</span>
              </React.Fragment>
            );
          }
          if (item.dataIndex == 'carmodel_status') {
            if (text == 'PENDING_ADD') {
              classNames += ' green5';
            }
            text = config[text];
          }
          return <div className={classNames}>{text || ''}</div>;
        };
      });
    };

    // 获取品牌主机厂车型列表【合并车型 - 已通过】
    fetchBrandFacModList = () => {
      const { dispatch, carmodelApprovedList } = this.props;
      if(carmodelApprovedList.length === 0) {
        return dispatch({ type: 'global/fetchBrandFacModListApproved' });
      }
      // if (carmodelList.length) {
      //     dispatch({ type: 'baseorigin_id/updateState', payload: { carmodelList: carmodelList } });
      // }
    };
    // 标准车型审核(合并)通过

    fetchBaseOriginApprove = (record,indexa, type, status,item) => {
      this.setState({
        record:record
      });
      const { dispatch, match ,carmodelOriginList ,listByCmid ,listBySearch } = this.props;
      const cm_id = match.params.cm_id;
      let initObj={};
      this.setState({
        status:status
      });
      if(type == 'merge') {
        this.setState({
          type:'merge',
          params :{ cm_ids: cm_id, target_cm_id: record.cm_id }
        });
      }
      if(type == 'APPROVED') {
        this.setState({
          type:'APPROVED',
          params :{ cm_ids: [cm_id] }
        });
      }
      if(type == 'NONAPPROVED') {
        this.setState({
          type:'NONAPPROVED',
          params :{ cm_ids: [cm_id] }
        });
      }
      carmodelOriginList.forEach(item => {
        item.cm_carmodel = item.cm_brand + ' / ' + item.cm_factory + ' / ' + item.cm_model + ' / ' + item.cm_conf_level;
        for (const key in item) {
          let val = '';
          if(!isEmpty(item[key]) && item[key] !== '—' && item[key] !== '-') { // '—'和'-'也属于空数据，不进行对比
            val = item[key];
          }
          if(!initObj[key]){
            initObj[key] = [val];
          } else {
            initObj[key].push(val);
          }
        }
      });
      listByCmid.forEach((item) => {
        item.cm_carmodel = item.cm_brand + ' / ' + item.cm_factory + ' / ' + item.cm_model + ' / ' + item.cm_conf_level;
        for(let key in item) {
          let val = '';
          if(!isEmpty(item[key]) && item[key] !== '—' && item[key] !== '-') { // '—'和'-'也属于空数据，不进行对比
            val = item[key];
          }
          if(!initObj[key]) {
            initObj[key] = [val];
          } else {
            initObj[key].push(val);
          }
        }
      });
      for (const key in initObj) {
        initObj[key] = uniqueArr(initObj[key]);
      }
      // 获取不相符的属性名
      const redItem=listByCmidTitle.map(item=>{
        if(initObj[item.dataIndex] && initObj[item.dataIndex].length > 1 ){
          return item;
        }
      });
      const redList = redItem.filter(un=>un!==undefined);
      const redId=redList.map(diffId=>diffId.dataIndex);

      let arr=[];
      carmodelOriginList.forEach((item,index)=>{
        let obj1={};
        obj1['SN']=index+1;
        for(let i=0;i<redId.length;i++){
          obj1[redId[i]]=item[redId[i]];
          // obj1['index']=index+1
        }
        arr.push(obj1);

      });

      let arr1=[];
      listByCmid.forEach((item,index)=>{
        let obj2={};
        obj2['SN']=index+1;
        for(let i=0;i<redId.length;i++){
          obj2[redId[i]]=item[redId[i]];
          // obj2['index']=index+1
        }
        arr1.push(obj2);
      });
      const columsa=redList.map(item=>{
        return{
          title:item.name,
          dataIndex:item.dataIndex

        };
      });
      columsa.unshift({title:'序号',dataIndex:'SN'});
      this.setState({
        arr:arr,
        arr1:arr1,
        columsa:columsa
      });
      carmodelOriginList.forEach(item => {
        item.cm_carmodel = item.cm_brand + ' / ' + item.cm_factory + ' / ' + item.cm_model + ' / ' + item.cm_conf_level;
        for (const key in item) {
          let val = '';
          if(!isEmpty(item[key]) && item[key] !== '—' && item[key] !== '-') { // '—'和'-'也属于空数据，不进行对比
            val = item[key];
          }
          if(!initObj[key]){
            initObj[key] = [val];
          } else {
            initObj[key].push(val);
          }
        }
      });
      listBySearch.forEach((item) => {
        item.cm_carmodel = item.cm_brand + ' / ' + item.cm_factory + ' / ' + item.cm_model + ' / ' + item.cm_conf_level;
        for(let key in item) {
          let val = item[key] == null ? '' : item[key];
          if(!initObj[key]) {
            initObj[key] = [val];
          } else {
            initObj[key].push(val);
          }
        }
      });

      for (const key in initObj) {
        initObj[key] = uniqueArr(initObj[key]);
      }
      const mergeItem=listBySearchTitle.map(item=>{
        if(initObj[item.dataIndex] && initObj[item.dataIndex].length > 1 ){
          return item;
        }
      });
      const mergeList = mergeItem.filter(un=>un!==undefined);
      const mergeId=mergeList.map(diffId=>diffId.dataIndex);

      this.setState({
        redList:redList,
        mergeList:mergeList
      });
      let marr=[];
      carmodelOriginList.forEach((item,index)=>{
        let mobj1={};
        mobj1['SN']=index+1;
        for(let i=0;i<mergeId.length;i++){
          mobj1[mergeId[i]]=item[mergeId[i]];
          // mobj1['index']=index+1
        }
        marr.push(mobj1);
      });

      let marr1=[];

      listBySearch.forEach((item,index)=>{
        let mobj2={};
        mobj2['SN']=index+1;
        for(let i=0;i<mergeId.length;i++){
          mobj2[mergeId[i]]=item[mergeId[i]];
        }
        // console.log(record)
        marr1.push(mobj2);

      });
      let marra=marr1.map(item=>{
        if(item.SN-1===indexa){
          return item;
        }
      });
      let marrList = marra.filter(un=>un!==undefined);
      const mcolumsa=mergeList.map(item=>{
        return{
          items:'type',
          title:item.name,
          dataIndex:item.dataIndex

        };
      });
      mcolumsa.unshift({title:'序号',dataIndex:'SN'});
      this.setState({
        mcolumsa:mcolumsa,
        marr:marr,
        marr1:marrList
      });
      setTimeout(()=>{
        this.state.type==='APPROVED' && this.state.redList.length>0 || ( this.state.type==='merge'&& this.state.mergeList.length>0 &&carmodelOriginList.length !==0)?
          this.setState({
            visiblea:true
          })
          :
          confirm({
            title: this.state.type==='APPROVED'?'确定审核通过此车型么？':this.state.type==='merge'?(carmodelOriginList.length===0?'没有关联原车型，确定合并此车型么？':'确定合并此车型么？'):'确定不通过此车型么？',
            content: '认真核实后点击确定按钮',
            onOk:(record)=> {
              this.handleOk(record.cm_id,type);
              Modal.destroyAll();
            },
            onCancel() {
              console.log('Cancel');
            },
          });
      },0);

      // 合并前确定一次
      setTimeout(()=>{
        var tableBody1 = $('.ant-table-body');
        const handleScroll = (targetIdx, handleIdx) => {
          let xPos = $(tableBody1[targetIdx]).scrollLeft();
          $(tableBody1[handleIdx]).scrollLeft(xPos);
        };
        $(tableBody1[3]).scroll(() => handleScroll(3, 4));
        $(tableBody1[4]).scroll(() => handleScroll(4, 3));
        // -- 原

      },0);

    };

    handleCancel = () => {
      this.setState({
        visiblea: false,
      });
    };

    handleOk=(id,type) => {
      const {dispatch , match} = this.props;
      const cm_id = match.params.cm_id;
      const approveFn = ()=> {
        this.state.params.review_status = this.state.status;
        dispatch({
          type: 'baseorigin_id/fetchBaseOriginApprove',
          payload: {
            data: this.state.params,
            cb: res => {
              if(res.code === 0) {
                router.goBack();
              }
            }
          },
        });
      };
      this.approveUserListRecord(id,type);
      // 审核不通过，不需要下面的check
      if(this.state.type === 'NONAPPROVED' || this.state.type === 'merge') {
        approveFn();

      }
      // this.approveUserListRecord(record.cm_id)
      // 审核通过操作
      if(type==='APPROVED'){
        console.log('hahaha');
        dispatch({
          type: 'baseorigin/fetchCarmodelApproveCheck',
          payload:{
            cm_ids: [cm_id]
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
                  approveFn();
                // this.approveUserListRecord(id,type);
                }
              });
            }

            if( res.code === 0 ){
              approveFn();
            }

          }
        });
      }
    }
    approveUserListRecord=(id,type)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:{
          'cm_id':id,
          'operation':type==='APPROVED'?'通过待审核标准车型':type==='merge'?'合并标准车型':'不通过待审核标准车型'
        },
        record_page:' 标准车型/标准车型 编辑/审核',
        record_operations:type==='APPROVED'?'通过待审核标准车型':type==='merge'?'合并标准车型':'不通过待审核标准车型'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    // 提交搜索
    handleSubmit = values => this.fechListBySearch(values);
    /***************************** 合并标准车型 end ****************************************** */

    /***************************** 模态框 ****************************************** */
    // 获取标准车型详情数据
    fechCarmodelBaseInfo = async record => {
      const { dispatch } = this.props;
      const { cm_id, cm_brand, cm_factory } = record;
      // 获取同品牌同主机厂下的车系
      dispatch({ type: 'baseorigin_id/fetchCarmodelCar', payload: { cm_brand, cm_factory } });

      let res = await dispatch({ type: 'baseorigin_id/fetchCarmodelBaseInfo', payload: { cm_id } });
      await dispatch({ type: 'baseorigin_id/updateState', payload: { carmodelBaseInfo: this.formatBaseInfo(res) } });
    };

    // 车型详情更新
    fetchBaseInfoUpdate = (data,list) => {
      // 车型详情更新接口
      this.props.dispatch({
        type: 'baseorigin_id/fetchBaseInfoUpdate',
        payload: {
          data,
          cb: () => this.fechListBySearch()
        },
      });
      this.updateCmUserListRecord(data,list);
    };
    // 编辑标准车型修改记录
    updateCmUserListRecord=(dataList,list)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:dataList,
        record_page:' 标准车型/标准车型 编辑/审核',
        record_operations:`编辑车型，修改了 · ${list.type_name}/${list.list_name} · 属性`
      };
      // console.log(data);
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    // 显示模态框
    showModal = async (e, type, record,msg) => {
      e.preventDefault();
      this.setState({ modalType: type, visible: true, cm_origin: record.cm_origin });
      this.props.dispatch({ type: 'baseorigin_id/updateState', payload: { showModalCmid: record.cm_id } });
      if(type == 'edit') {
        this.fetchHistory(record.cm_id);
        this.fechCarmodelBaseInfo(record);

        // 获取机油等级数据
        this.fetchCarmodelEngineoilLevel(record.cm_id);
        this.fetchCarmodelEngineoilSae(record.cm_id);
        this.clickEdit(msg,record.cm_id);
      }else if (type == 'detail') {
        this.fechCarmodelBaseInfo(record);
      }else if (type == 'origin_detail') { //详细
        this.fetchCarmodelOriginInfo(record.cm_origin_id, record.cm_origin);
        this.clickEdit(msg,record.cm_id);

      }

    };
    fetchHistory=async(id)=>{
      await this.props.dispatch({ type: 'baseorigin_id/fetchCarmodelOriginRecordList', payload: {cm_id:id }});
    }
    // FetchCarmodelHistiry=(id)=>{
    //   const {dispatch}=this.props
    //   dispatch({ type: 'baseorigin_id/fetchCarmodelEngineoilLevelAdd', payload: id });
    // }
    clickEdit=(msg,id)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:{
          'operation':msg,
          'cm_id':id
        },
        record_page:' 标准车型/标准车型 编辑/审核',
        record_operations:msg+id
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    // 关闭模态框
    closeModal = () => {
      if (this.state.modalType == 'edit') {
        // 重新拉取审核标准车型
        this.fechListByCmid(this.props.match.params.cm_id);
      }
      this.setState({ visible: false });
    };
    /***************************** 模态框 end ****************************************** */

    // 格式化标准车型详情数据，对应中文name
    formatBaseInfo = carmodelBaseInfo => {
      let baseInfo = clone(carmodelBaseInfoConfig);
      baseInfo.forEach(cate => {
        for(const key in carmodelBaseInfo) {
          const item = carmodelBaseInfo[key];
          let d = {};
          if (isArray(item) && item.length) {
            d = item[0];
          }
          if (isObject(item)) {
            d = item;
          }
          if (cate.key == key) {
            cate.list.forEach(sub => {
              for (const k in d) {
                const val = d[k];
                if (k == sub.key) {
                  sub.val = val || '';
                  sub.edit = false;
                }
              }
            });
          }
        }
      });
      return baseInfo;
    };

    // 获取机油等级数据
    fetchCarmodelEngineoilLevel = (cm_id) => {
      const { dispatch } = this.props;
      dispatch({
        type: 'baseorigin_id/fetchCarmodelEngineoilLevel',
        payload: { cm_id }
      });
    }

    // 添加标准车型机油等级
    fetchCarmodelEngineoilLevelAdd = payload => {
      const { dispatch } = this.props;
      dispatch({
        type: 'baseorigin_id/fetchCarmodelEngineoilLevelAdd',
        payload
      });
      this.CarmodelEngineoilLevelAdduserRecord(payload);
    }
    CarmodelEngineoilLevelAdduserRecord=(payload)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:payload,
        record_page:' 标准车型/标准车型 编辑/审核',
        record_operations:' 添加标准车型机油等级'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }

    // 更新标准车型机油等级
    fetchCarmodelEngineoilLevelUpdate = payload => {
      const { dispatch } = this.props;
      dispatch({
        type: 'baseorigin_id/fetchCarmodelEngineoilLevelUpdate',
        payload
      });
      this.CarmodelEngineoilLevelUpdateuserRecord(payload);
    }
    CarmodelEngineoilLevelUpdateuserRecord=(payload)=>{
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

    // 删除标准车型机油等级
    fetchCarmodelEngineoilLevelDel = payload => {
      const { dispatch } = this.props;
      dispatch({
        type: 'baseorigin_id/fetchCarmodelEngineoilLevelDel',
        payload
      });
      this.CarmodelEngineoilLevelDeluserRecord(payload);
    }
    CarmodelEngineoilLevelDeluserRecord=(payload)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:payload,
        record_page:' 标准车型/标准车型 编辑/审核',
        record_operations:' 删除标准车型机油等级'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    // 获取机油粘度数据
    fetchCarmodelEngineoilSae = (cm_id) => {
      const { dispatch } = this.props;
      dispatch({
        type: 'baseorigin_id/fetchCarmodelEngineoilSae',
        payload: { cm_id }
      });
    }

    // 添加标准车型机油粘度
    fetchCarmodelEngineoilSaeAdd = payload => {
      const { dispatch } = this.props;
      dispatch({
        type: 'baseorigin_id/fetchCarmodelEngineoilSaeAdd',
        payload
      });
      this.CarmodelEngineoilSaeAdduserRecord(payload);
    }
    CarmodelEngineoilSaeAdduserRecord=(payload)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:payload,
        record_page:' 标准车型/标准车型 编辑/审核',
        record_operations:' 添加标准车型机油粘度'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    // 更新标准车型机油粘度
    fetchCarmodelEngineoilSaeUpdate = payload => {
      const { dispatch } = this.props;
      dispatch({
        type: 'baseorigin_id/fetchCarmodelEngineoilSaeUpdate',
        payload
      });
      this.CarmodelEngineoilSaeUpdateuserRecord(payload);
    }
    CarmodelEngineoilSaeUpdateuserRecord=(payload)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:payload,
        record_page:' 标准车型/标准车型 编辑/审核',
        record_operations:' 更新标准车型机油粘度'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    // 删除标准车型机油粘度
    fetchCarmodelEngineoilSaeDel = payload => {

      const { dispatch } = this.props;
      dispatch({
        type: 'baseorigin_id/fetchCarmodelEngineoilSaeDel',
        payload
      });
      this.CarmodelEngineoilSaeDeluserRecord(payload);
    }
    CarmodelEngineoilSaeDeluserRecord=(payload)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:payload,
        record_page:' 标准车型/标准车型 编辑/审核',
        record_operations:' 标准车型机油粘度'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    render() {

      const { modalType, visible, cm_origin } = this.state;
      const {
        loading,
        dispatch,
        CARMODEL_CAR,
        carmodelOriginList,
        removeOriginList,
        listByCmid,
        listBySearch,
        listBySearchSelectedList,
        carmodelBaseInfo,
        carmodelOriginInfo,
        showModalCmid,
        carmodelOriginHistoryList,
        // carmodelList,
        carmodelApprovedList,
        fields,
        CARMODEL_ENGINEOIL_LEVEL,
        CARMODEL_ENGINEOIL_SAE
      } = this.props;

      // 关联源车型表格选择操作配置
      const baseOriginRowSelection = {
        onChange: (selectedRowKeys, selectedRows) => dispatch({ type: 'baseorigin_id/updateState', payload: { removeOriginList: selectedRowKeys } }),
        selectedRowKeys: removeOriginList,
        fixed: true
      };

      // 合并车型表格选择操作配置
      const listBySearchRowSelection = {
        onChange: (selectedRowKeys, selectedRows) => dispatch({ type: 'baseorigin_id/saveListBySearchSelected', payload: selectedRowKeys }),
        selectedRowKeys: listBySearchSelectedList,
        fixed: true
      };

      const carmodelOriginTitleWidth = carmodelOriginTitle.reduce((init, v) => v.fixed ? init : init += v.width, 0);
      const listByCmidTitleWidth = listByCmidTitle.reduce((init, v) => v.fixed ? init : init += v.width, 0);
      const listBySearchTitleWidth = listBySearchTitle.reduce((init, v) => v.fixed ? init : init += v.width, 0);
      return (
        <React.Fragment>
          <Card bordered={false} className="baseorigin_detail">
            {/* 关联源车型 */}
            <Row align="middle" type="flex">
              <Col span={12} className="f20">关联源车型</Col>
              <Col span={12} className="text-right">
                <Button type="primary" disabled={removeOriginList.length == 0} onClick={this.fechBaseOriginMappingDelete}>解除关联</Button>
              </Col>
            </Row>
            <Table
              loading={loading['baseorigin_id/fetchCarmodelOriginList']}
              className={'baseorigin-list-table m-t-15'}
              pagination={false}
              rowSelection={baseOriginRowSelection}
              columns={carmodelOriginTitle}
              rowKey={(item, index) => index}
              dataSource={carmodelOriginList}
              scroll={ {x: carmodelOriginTitleWidth, y: 185} }
            />

            {/* 待审核标准车型 */}
            <Row align="middle" type="flex" className="m-t-15">
              <Col className="f20">待审核标准车型</Col>
            </Row>
            <Table
              loading={loading['baseorigin_id/fetchListByCmid']}
              className={'baseorigin-list-table m-t-15'}
              pagination={false}
              columns={listByCmidTitle}
              rowKey={(item, index) => index}
              dataSource={listByCmid}
              scroll={{ x: listByCmidTitleWidth }}
            />

            {/* 合并标准车型 */}
            <Row align="middle" type="flex" className="m-t-15" style={{justifyContent: 'space-between'}}>
              <div style={{float: 'left'}} className="f20">合并标准车型</div>
              <div style={{float: 'right', verticalAlign: 'middle'}}>
                <PartLoading loading={loading['global/fetchBrandFacModListApproved']}>
                  <SearchFormRow
                    dispatch={dispatch}
                    carmodelApprovedList={carmodelApprovedList}
                    fields={fields}
                    handleSubmit={this.handleSubmit}
                  />
                </PartLoading>
              </div>
            </Row>
            <Table
              loading={loading['baseorigin_id/fetchListBySearch']}
              className={'baseorigin-list-table hideSelectAll m-t-15'}
              pagination={false}
              rowSelection={listBySearchRowSelection}
              columns={listBySearchTitle}
              rowKey={(item, index) => index}
              dataSource={listBySearch}
              scroll={ listBySearch.length > 4 ? { x: listBySearchTitleWidth, y: 185 } : { x: listBySearchTitleWidth }}
              rowClassName={(record, index) => {
                let classname = '';
                for(let i = 0; i < listBySearchSelectedList.length; i++) {
                  if(index == listBySearchSelectedList[i]) {
                    classname = styles.selectedTr;
                    break;
                  }
                }
                return classname;
              }}
            />

            {/* 返回按钮 */}
            <Row className="text-center m-t-15">
              <Button type="dashed" onClick={router.goBack}>返回列表</Button>
            </Row>

            <Modal width={this.state.type==='NONAPPROVED' || this.state.redList.length===0 || this.state.mergeList.length===0?'25%':'60%'} bodyStyle={{padding:'10px'}} visible={this.state.visiblea} onOk={()=>this.handleOk(this.state.record.cm_id,this.state.type)} onCancel={()=>this.handleCancel()}
              title={this.state.type==='APPROVED'?'确定审核通过此车型么？':this.state.type==='merge'?'确定合并此车型么？':'确定不通过此车型么？'}
              forceRender={true}
            >
              {
                this.state.type==='APPROVED'?
                  <div><Table title={()=>'源车型'} scroll={{ x: 'max-content' }} columns={this.state.columsa} dataSource={this.state.arr} bordered={true} showHeader={true} pagination={false} size="middle" rowKey={(item, index) => index} >a</Table>
                    <Divider dashed />
                    <Table title={()=>'标准车型'} scroll={{ x: 'max-content' }} columns={this.state.columsa} dataSource={this.state.arr1} bordered={true} showHeader={true} pagination={false} size="middle" rowKey={(item, index) => index} >a</Table>
                  </div>
                  :
                  this.state.type==='merge'?
                    <div><Table title={()=>'源车型'} scroll={{ x: 'max-content' }} columns={this.state.mcolumsa} dataSource={this.state.marr} bordered={true} showHeader={true} pagination={false} size="middle" rowKey={(item, index) => index} >a</Table>
                      <Divider dashed /><Table title={()=>'合并车型'} scroll={{ x: 'max-content' }} columns={this.state.mcolumsa} dataSource={this.state.marr1} bordered={true} showHeader={true} pagination={false} size="middle" rowKey={(item, index) => index} >a</Table></div>
                    :
                    <p>认真核实后点击确定按钮</p>
              }
            </Modal>
            {/* 模态框 */}
            {
              this.state.visible &&
                        <DetailModal
                          global_loading={loading}
                          loading={modalType == 'origin_detail' ? loading['baseorigin_id/fetchCarmodelOriginInfo'] : loading['baseorigin_id/fetchCarmodelBaseInfo']}
                          loadings={loading['baseorigin_id/fetchBaseInfoUpdate','baseorigin_id/fetchCarmodelOriginRecordList']}
                          CARMODEL_CAR={CARMODEL_CAR}
                          carmodelBaseInfo={carmodelBaseInfo}
                          visible={visible}
                          modalType={modalType}
                          showModalCmid={showModalCmid}
                          carmodelOriginInfo={carmodelOriginInfo}
                          cm_origin={cm_origin}
                          CARMODEL_ENGINEOIL_LEVEL={CARMODEL_ENGINEOIL_LEVEL}
                          CARMODEL_ENGINEOIL_SAE={CARMODEL_ENGINEOIL_SAE}
                          closeModal={this.closeModal}
                          fetchBaseInfoUpdate={this.fetchBaseInfoUpdate}
                          onFetchCarmodelEngineoilLevelAdd={this.fetchCarmodelEngineoilLevelAdd}
                          onFetchCarmodelEngineoilLevelUpdate={this.fetchCarmodelEngineoilLevelUpdate}
                          onFetchCarmodelEngineoilLevelDel={this.fetchCarmodelEngineoilLevelDel}
                          onFetchCarmodelEngineoilSaeAdd={this.fetchCarmodelEngineoilSaeAdd}
                          onFetchCarmodelEngineoilSaeUpdate={this.fetchCarmodelEngineoilSaeUpdate}
                          onFetchCarmodelEngineoilSaeDel={this.fetchCarmodelEngineoilSaeDel}
                          onfetchHistory={this.fetchHistory}
                          carmodelOriginHistoryList={carmodelOriginHistoryList}
                        />
            }

          </Card>
        </React.Fragment>
      );
    }
}

const SearchFormRow = Form.create()(searchForm);

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.global,
  ...state.baseorigin_id
});
export default connect(mapStateToProps)(Edit);
