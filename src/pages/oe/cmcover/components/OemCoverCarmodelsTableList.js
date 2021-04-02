import React, { Component } from 'react';
import { Modal, Card, Divider, Row, Col, Form, Input, Table, List, Icon } from 'antd';
import { isEmpty } from '@/utils/tools';
import styles from './OemCoverCarmodelsTableList.less';

export default class OemCoverCarmodelsTableList extends Component {

    state = {
       
    }

    // 获取表格columns设置
    getColumns = () => {
      const { CARMODEL_PROPERTIES, onShowSelectOeModal } = this.props;
      return [{
        title: '品牌',
        dataIndex: 'cm_brand',
        width: 100
      }, {
        title: '主机厂',
        dataIndex: 'cm_factory',
        width: 150
      }, {
        title: '车型',
        dataIndex: 'cm_model',
        width: 100
      }, {
        title: '年款',
        dataIndex: 'cm_model_year',
        width: 60
      }, {
        title: '上市年份',
        dataIndex: 'cm_sales_year',
        width: 100,
        render: (text, record, index) => {
          
          if(!record.cm_sales_year && !record.cm_stop_year) {
            return '-';
          }else{
            const cm_sales_year = record.cm_sales_year || '~';
            const cm_stop_year = record.cm_stop_year || '~';
            return `${cm_sales_year}-${cm_stop_year}`;
          }
          
        }
      }, {
        title: '排量',
        dataIndex: 'cm_displacement',
        width: 60,
        render: (text, record, index) => {
          return text || '-';
        }
      }, {
        title: '发动机型号',
        dataIndex: 'cm_engine_model',
        width: 100,
        render: (text, record, index) => {
          return text || '-';
        }
      }, {
        title: '其他属性',
        dataIndex: 'cm_other',
        render: (text, record, index) => {
          const excludes = ['cm_ids', 'oem_partsku_ids', 'cm_brand_id', 'cm_brand', 'cm_factory', 'cm_model', 'cm_model_year', 'cm_displacement', 'cm_engine_model', 'cm_sales_year', 'cm_stop_year'];
          const arr = [];
          for (const k in record) {
            const el = record[k];
            // 取不在固定列表，并且有值的属性信息
            if(!excludes.includes(k) && !isEmpty(el)) {
              const cm_pro = CARMODEL_PROPERTIES.find(v => v.cm_pro_column === k) || {};
              const pros = {
                cm_pro_column: k,
                cm_pro_val: el,
              };
              arr.push({...pros, ...cm_pro});
            }
          }
          return (
                    <>
                        {
                          arr.length > 0 ? arr.map(v => `${v.cm_pro_name}：${v.cm_pro_val}`).join('，') : '-'
                        }
                    </>
          );
        }
      }, {
        title: '产品',
        dataIndex: 'oem_partsku_ids',
        width: 130,
        render: (text, record, index) => {
          const len = text.length;
          return (
                    <>
                     <span className="cur link" onClick={() => onShowSelectOeModal(record) }>{len > 0 ? `${len}个OE产品` : '无产品，点击添加'}</span>
                    </>
                    
          );
        }
      }];
    };

    render() {
      const { isDataLoading, OEM_COVER_CARMODELS, FIELDS, onHandlePageSizeChange, onHandlePageChange } = this.props;
      const { data = [], count = 0 } = OEM_COVER_CARMODELS;
      const columns = this.getColumns();
      // 分页配置
      const pagination = {
        total: parseInt(count, 10),
        pageSize: FIELDS.perpage,
        current: FIELDS.page,
        showSizeChanger: true,
        onShowSizeChange: (current, perpage) => onHandlePageSizeChange(current, perpage),
        onChange: page => onHandlePageChange(page),
        showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`
      };
      const tableProps = {
        className: styles.table_content,
        bordered: true,
        rowKey: (v, idx) => idx,
        loading: isDataLoading,
        pagination,
        columns,
        dataSource: data
      };
      return(
        <Table {...tableProps}/>
      );
    }
}
