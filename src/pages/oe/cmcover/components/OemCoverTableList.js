import React, { Component } from 'react';
import { Modal, Card, Divider, Row, Col, Form, Input, Table, List, Icon } from 'antd';
import classNames from 'classnames';
import styles from './OemCoverTableList.less';

export default class OemCoverTableList extends Component {

    state = {
      filterDropdownVisible: false,
      filter_cm_brand_id: '',
      filter_search_value: null
    }

    // 确定筛选项
    handleFilterBrand = v => {
      this.setState({ 
        filter_cm_brand_id: v.cm_brand_id,
        filterDropdownVisible: false,
        filter_search_value: null
      });
    }

    // 输入筛选项
    handleChangeSearch = e => {
      this.setState({ filter_search_value: e.target.value });
    }

    // 获取表格columns设置
    getColumns = cover_rate_list => {
      const { onChangeCmBrand } = this.props;
      const { filterDropdownVisible, filter_cm_brand_id, filter_search_value } = this.state;
      return [{
        title: '汽车品牌',
        dataIndex: 'cm_brand',
        render: (text, record, index) => {
          return (
            <span className="cur link" onClick={() => onChangeCmBrand(record)}>{text}</span>
          );
        },
        filterDropdown: () => {
          // 获取筛选下拉列表数据
          return (
            <div className={styles['filter_content']}>
              <Input
                placeholder="输入筛选关键词"
                onChange={ this.handleChangeSearch }
                style={{display: 'block' }}
              />
              <List
                className={styles['filter_list']}
                size="small"
                bordered
                dataSource={filter_search_value ? cover_rate_list.filter( v => v.cm_brand.indexOf(filter_search_value) > -1 ) : cover_rate_list}
                renderItem={v => (<List.Item className="cur" onClick={()=> this.handleFilterBrand(v)}>{v.cm_brand}</List.Item>)}
              />
                        
            </div>
          );
        },
        filterIcon: () => {
          return filter_cm_brand_id ? <Icon type="close" style={{color: '#1a82d2'}} /> : <Icon type="search" />;
        },
        filterDropdownVisible,
        onFilterDropdownVisibleChange: visible => {
          if(!visible) {
            // 点击空白区域隐瞒菜单
            this.setState({ 
              filterDropdownVisible: false
            });
            return false;
          }

          if(filter_cm_brand_id) {
            this.setState({ 
              filterDropdownVisible: false,
              filter_cm_brand_id: null
            });
          }else{
            this.setState({ 
              filterDropdownVisible: true,
              filter_cm_brand_id: null
            });
          }
                
        }
      }, {
        title: '覆盖率',
        dataIndex: 'oem_cover_rate',
        width: 100,
        sorter: true,
        render: text => `${text}%`
      }];
    };

    render() {
      const { isDataLoading, data = [], onTableChange } = this.props;
      const { filter_cm_brand_id } = this.state;
      const { cover_rate_list = [], oem_cover_rate } = data;
      const columns = this.getColumns(cover_rate_list);
      const tableProps = {
        bordered: true,
        pagination: false,
        rowKey: v => v.cm_brand_id,
        scroll: { y: 307 },
        loading: isDataLoading,
        columns,
        dataSource: filter_cm_brand_id ? cover_rate_list.filter(v => v.cm_brand_id === filter_cm_brand_id) : cover_rate_list,
        onChange: onTableChange
      };
      return(
            <>
                <Table {...tableProps} dataSource={[]} className={styles.table_content_header} />
                <Table {...tableProps} showHeader={false} className={styles.table_content}/>
            </>
      );
    }
}
