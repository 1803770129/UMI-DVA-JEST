import React, { Component } from 'react';
import { Modal, Table, Button, Form, Row, Col, Cascader, Icon, Checkbox, List, Input,message  } from 'antd';
import { isEmpty, getLocal, setLocal } from '@/utils/tools';
import { sortBy, uniqBy } from 'lodash';
import Highlighter from 'react-highlight-words';
import styles from './IdAddCarmodel.less';
const _searchInput = {};
let engineValue;
// Cascader搜索过滤
const handleCmFilter = (inputValue, selectedOptions) => {
  return selectedOptions.some(option => {
    const v = option.v || option.label || option.title || '';
    return v.toLowerCase().indexOf(inputValue.toLowerCase().trim()) > -1;
  });
};

// 表头筛选高亮显示
const formatFilterText = (text, columnSearchKeys) => {
  return text ?
    <Highlighter
      highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
      searchWords={[columnSearchKeys]}
      autoEscape
      textToHighlight={text}
    />
    : null;
};

// 给禁用checkbox添加title说明
const addTitle = () => {
  const disList = document.getElementsByClassName('ant-checkbox-disabled');
  if(disList.length > 0) {
    for (let i = 0; i < disList.length; i++) {
      const v = disList[i];
      v.title = '此条车型已经添加';
    }
  }
};

class IdAddCarmodel extends Component {

    state = {
      carmodelPropsModalVisible: false,  // 展示更多车型列模态框状态
      selectedRowKeys: [], // 表格select操作
      columnSearchKeys: {}, //表格头过滤
      inputValue: '' // 筛选输入框
    };

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState) {
      const { addCarmodelModalVisible, carmodelModelType} = this.props;
      // 编辑适配车型模态框打开时，
      if(prevProps.addCarmodelModalVisible !== addCarmodelModalVisible && addCarmodelModalVisible === true && carmodelModelType === 'edit') {
        // 默认选中全部行
        this.handleSetSelectAll();
      }
    };

    // 展示更多车型列模态框显示
    showCarmodelPropsModal = () => {
      this.setState({ carmodelPropsModalVisible: true });
    }
    // 展示更多车型列模态框隐藏
    hideCarmodelPropsModal = () => {
      this.setState({
        carmodelPropsModalVisible: false
      });
    }

    // 确定更多车型列
    handleExpandColumns = () => {

      const { form, carmodelModelType, PAGE_TYPE, OE_INFO_FIELDS, CARMODEL_PRO_LIST, CARMODEL_KEYVALUE_LIST, onCarmodelKeyvalueList, onOemskuCarmodelEdit } = this.props;
      const { category_id } = OE_INFO_FIELDS;
      const { getFieldValue } = form;
      const checked_expand_columns = getFieldValue('checked_expand_columns');

      // 本地存储列配置
      const local_expand_columns = getLocal('local_expand_columns') || {};
      setLocal('local_expand_columns', {...local_expand_columns, [category_id]:  checked_expand_columns});
      const expand_columns = CARMODEL_PRO_LIST.filter(v => checked_expand_columns.includes(v.cm_pro_id));
      if(carmodelModelType === 'add') {
        // 重新拉取适配车型数据
        this.handleSearch();
      }

      // 拉取oe适配车型编辑查询
      if(carmodelModelType === 'edit') {
        // 清空selectedRowKeys后再拉取数据，避免checkbox状态错误
        this.setState({ selectedRowKeys: [] }, () =>{
          onOemskuCarmodelEdit(expand_columns, this.clearColumnSearchKeys);
        });
      }

      // 隐藏模态框
      this.hideCarmodelPropsModal();
    }

    // 清除扩展列
    handleClearExpandColumns = () => {
      const { form } = this.props;
      const { setFieldsValue } = form;
      // 确定查询后才会更新本地存储
      setFieldsValue({'checked_expand_columns': []});
    };

    // 因为onChange方法无法获取当前选中列，所以更新状态通过select方法处理
    handleTableSelect = (record, selected, selectedRows, nativeEvent) => {
      const { CARMODEL_KEYVALUE_LIST, onUpdateCarmodelKeyvalueList } = this.props;
      const { selectedRowKeys } = this.state;

      // 取消选中列，需要重置扩展列checkbox状态
      const list = CARMODEL_KEYVALUE_LIST.map((cm, cmIdx) => {
        if(record.timeStamp === cm.timeStamp) {
          return selected ? cm : {...cm, cm_extends: []};
        }else{
          return cm;
        }
      });
      onUpdateCarmodelKeyvalueList(list);

      // 改变select状态
      this.setState({
        selectedRowKeys: selected ? [...selectedRowKeys, record.timeStamp] : selectedRowKeys.filter(key => key !== record.timeStamp)
      });
    }

    handleTableSelectAll = format_list => {
      const { CARMODEL_KEYVALUE_LIST, onUpdateCarmodelKeyvalueList } = this.props;
      const selected = format_list.filter( v => !v.selected).length === this.state.selectedRowKeys.length ? false : true;

      // 取消选中列，需要重置扩展列checkbox状态
      const list = CARMODEL_KEYVALUE_LIST.map((cm, cmIdx) => {
        // 取得selectedRowKeys, 方便更新选中项
        return selected ? cm : {...cm, cm_extends: []};
      });
      onUpdateCarmodelKeyvalueList(list);
      if(selected) {
        // 全选当前已经过滤数据
        this.setState({ selectedRowKeys: format_list.filter(v => !v.selected).map(v => v.timeStamp) });
      }else{
        this.handleSetSelectAll('clear');
      }

    }

    // 调整扩展列checkbox状态
    handleChangeCheckbox = (checked, cm_pro, timeStamp) => {
      const { CARMODEL_KEYVALUE_LIST, onUpdateCarmodelKeyvalueList } = this.props;
      const { selectedRowKeys } = this.state;
      const list = CARMODEL_KEYVALUE_LIST.map((cm, cmIdx) => {
        const _props = {...cm_pro, checked, oem_carmodel_extend_val: cm[cm_pro.cm_pro_column]};
        let cm_extends = cm.cm_extends;
        const isExist = cm.cm_extends.filter(v => cm_pro.cm_pro_id === v.cm_pro_id).length > 0;
        if(!isExist) {
          cm_extends = [cm_pro, ...cm.cm_extends];
        }
        cm_extends = cm_extends.map(v => v.cm_pro_id === cm_pro.cm_pro_id ? _props : v);
        if(timeStamp === cm.timeStamp) {
          const isChecked = cm_extends.some(v => v.checked === true);
          // 如果扩展列有选中任意一项，则联动整行的checked状态
          // 如果全部取消扩展列的选中状态，不联动整行的checked状态
          if(isChecked) {
            this.setState({selectedRowKeys: [...selectedRowKeys, cm.timeStamp]});
          }
          return {
            ...cm,
            cm_extends
          };
        }else{
          return cm;
        }
      });
      onUpdateCarmodelKeyvalueList(list);
    }

    // 默认全部select选中
    handleSetSelectAll = (clear) => {
      const { CARMODEL_KEYVALUE_LIST } = this.props;
      let selectedRowKeys = [];
      if(!clear){
        selectedRowKeys = CARMODEL_KEYVALUE_LIST.filter(v => !v.selected).map(v => v.timeStamp);
      }
      this.setState({ selectedRowKeys });
      // 给禁用checkbox添加title说明
      addTitle();
    }

    // 添加适配车型
    handleAddCarmodel = () => {
      const { onCarmodelAdd } = this.props;
      const { selectedRowKeys } = this.state;
      onCarmodelAdd(selectedRowKeys, this.clearColumnSearchKeys);
    }

    // 编辑适配车型
    handleEditCarmodel = () => {
      const { onCarmodelEdit } = this.props;
      const { selectedRowKeys } = this.state;
      onCarmodelEdit(selectedRowKeys, this.clearColumnSearchKeys);
    }

    // 特殊说明模态框
    showDescModal = (text, index, isSelected) => {
      const { onShowDescModal } = this.props;
      onShowDescModal(text, index, isSelected);
    }

    // 表格头筛选
    handleSetFilter = (dataIndex, selectedKey, confirm) => {
      const columnSearchKeys = {...this.state.columnSearchKeys};
      if(!selectedKey) {
        delete columnSearchKeys[dataIndex];
        // 点×清理过滤列
        this.setState({
          columnSearchKeys
        });
      }else{
        // 设定筛选列数据
        this.setState({
          columnSearchKeys: { ...this.state.columnSearchKeys, [dataIndex]: selectedKey }
        });
        // 筛选时清理checked状态, 避免选中项操作误差
        this.setState({ selectedRowKeys: [] });
        confirm();

      }
    };

    // 根据条件过滤列表显示数据
    formatList = list => {
      const { columnSearchKeys } = this.state;
      return list.filter(v => {
        // 无筛选条件，直接返回全部数据
        if(isEmpty(columnSearchKeys)) return true;
        // 有筛选条件，遍历过滤
        let flag = true;
        for (const key in columnSearchKeys) {
          let text = v[key];
          if(key === 'cm_sales_year') {
            text = (v.cm_sales_year || '') + '~' + (v.cm_stop_year || '');
          }
          if(columnSearchKeys[key] !== text) {
            flag = false;
            break;
          }
        }
        return flag;
      });

    };

    // 筛选输入
    handleInputChange = e => {
      const { value } = e.target;
      this.setState({ inputValue: value });
    };

    // 可选择的筛选下拉列表
    filterInputList = (list, dataIndex) => {
      const dataSource = list.map(it => dataIndex === 'cm_sales_year' ? (it.cm_sales_year || '') + '~' + (it.cm_stop_year || '') : it[dataIndex]).filter( v => !isEmpty(v));
      return sortBy(uniqBy(dataSource).filter(v =>　(isEmpty(v) ? '' : v).toUpperCase().indexOf(this.state.inputValue.toUpperCase()) > -1));
    };

    // 清空筛选项columnSearchKeys
    clearColumnSearchKeys = () => {
      this.setState({
        columnSearchKeys: {}
      });
    }

    //根据条件查询车型数据
    handleSearch = () => {
      const {form ,CARMODEL_PRO_LIST, location, PAGE_TYPE, OE_INFO_FIELDS, dispatch} = this.props;
      let payload = {};
      form.validateFields((err, values) => {
        const [cm_brand, cm_factory, cm_model] =  values.car_fac_model;
        const { getFieldValue } = form;
        const { query } = location;
        const checked_expand_columns = getFieldValue('checked_expand_columns');
        const expand_columns = CARMODEL_PRO_LIST.filter(v => checked_expand_columns.includes(v.cm_pro_id));
        const cm_pro_columns = expand_columns.map(v => v.cm_pro_column).join(',');
        const { category_id } = OE_INFO_FIELDS;
        payload = { category_id, cm_brand, cm_factory, cm_model, cm_gearbox_model_m: values.cm_gearbox_model,
          cm_engine_model_m: values.cm_engine_model,cm_pro_columns, cm_chassis_model: values.cm_chassis_model };
        const { oem_partsku_id } = query;
        if (PAGE_TYPE === 'edit') {
          payload.oem_partsku_id = oem_partsku_id;
        }
        if((payload.cm_gearbox_model_m||payload.cm_engine_model_m||payload.cm_chassis_model)&& cm_brand||cm_model){
          dispatch({
            type: 'oe_id/fetchCarmodelKeyvalueList',
            payload,
            PAGE_TYPE
          });
        }else{
          message.info('请选择品牌和发动机型号与变速箱型号其中一个，或者只选择具体车型进行查询');
        }
      });

    };

    render() {
      // carmodelModelType, PAGE_TYPE 注意两个状态区别， carmodelModelType只针对对应车型模态框是编辑还是添加状态， PAGE_TYPE 是创建OE或者编辑OE状态

      const { loading, form, addCarmodelModalVisible, carmodelModelType, currentEditCarmodel, PAGE_TYPE, CARMODEL_INFO, OE_INFO_FIELDS, BRAND_FAC_MOD_APPROVED_LIST, CARMODEL_KEYVALUE_LIST, CARMODEL_PRO_LIST, CATEGORY_INFO, onCarmodelKeyvalueList, onHideCarmodelModal } = this.props;

      const { carPro = [] } = CARMODEL_INFO.data;
      const { getFieldDecorator, getFieldValue } = form;
      const { carmodelProParams = [] } = CATEGORY_INFO;
      const { category_id, category_name } = OE_INFO_FIELDS;
      const { selectedRowKeys } = this.state;
      const dataSource = [...CARMODEL_KEYVALUE_LIST];
      const list = this.formatList(dataSource);
      const form_checked_expand_columns = getFieldValue('checked_expand_columns') || [];
      // 品类默认属性
      const cmProps = PAGE_TYPE === 'add' ? carmodelProParams : carPro;

      // 获取关键属性的key
      const fixedProps = cmProps.map(v => v.cm_pro_column);
      // 获取本地存储的扩展列配置，按品类分
      const local_expand_columns = getLocal('local_expand_columns') || {};
      const category_expand_columns = local_expand_columns[category_id] || [];

      const filter_expand_columns = CARMODEL_PRO_LIST.filter(v => category_expand_columns.includes(v.cm_pro_id));
      const row = CARMODEL_KEYVALUE_LIST[0] ? CARMODEL_KEYVALUE_LIST[0] : {};
      const column_strs = filter_expand_columns.map(v => row[v.cm_pro_column]).filter(v => v);
      let expand_columns = [];
      if(carmodelModelType === 'add') {
        expand_columns = filter_expand_columns;
      }else if(carmodelModelType === 'edit') {
        // 单行车型编辑初始化时，取已经存在的cm_extends作为扩展列
        if(column_strs.length === filter_expand_columns) {
          expand_columns = filter_expand_columns;
        }else{
          const merge_expand_columns = [...filter_expand_columns, ...currentEditCarmodel.cm_extends].map(v => ({ ...v, oem_carmodel_extend_val: row[v.cm_pro_column]})).filter(v => v.oem_carmodel_extend_val);
          let fil = [];
          for(let i = 0; i < merge_expand_columns.length; i++) {
            if(merge_expand_columns[i].checked) {
              fil.push(merge_expand_columns[i]);
            }
          }

          expand_columns = merge_expand_columns.map(v => {
            const f = fil.some(c => c.cm_pro_id === v.cm_pro_id);
            return f ? null : v;
          }).filter(v => v !== null);
          expand_columns = [...fil, ...expand_columns];
        }
      }
      const columnsList = CARMODEL_KEYVALUE_LIST.length === 0 ? cmProps : [...cmProps, ...expand_columns, {cm_pro_name: '特殊说明', cm_pro_column: 'oem_carmodel_comment_desc'} ];
      // 这里的品牌和主机厂都是相同的，不做显示
      let columnsFilterList = columnsList.filter( v => !['cm_brand', 'cm_factory', 'cm_stop_year'].includes(v.cm_pro_column));
      columnsFilterList = columnsFilterList.map(v => {

        if(columnsFilterList.length < 7) {
          let obj = {...v};
          obj.width = 150;
          // 处理列数少时，表格变形
          return obj;

        }else{
          let width = 150;
          switch (v.cm_pro_column) {
            case 'cm_fuel_type':
            case 'cm_dimensions':
            case 'cm_per_cylinder_num':
            case 'cm_air_control_mode':
            case 'cm_trans_type':
              width = 150;
              break;
            case 'cm_model':
            case 'cm_sales_year':
            case 'cm_fuel_type':
            case 'cm_chassis_model':
              width = 150;
              break;
            case 'cm_model_year':
            case 'cm_displacement':
              width = 90;
              break;
            default:
              break;
          }
          return {
            ...v,
            width
          };
        }

      });
      const columns = columnsFilterList.map((v, idx) => {
        const isExpand = !v.category_cmpro_id ? true : false; // 标识是否为扩展列
        const _width = v.cm_pro_name.length * 18;
        return {
          ...v,
          width: _width < 150 ? 150 : _width,
          title: v.cm_pro_name,
          dataIndex: v.cm_pro_column,
          fixed: v.cm_pro_column === 'oem_carmodel_comment_desc' && columnsFilterList.length > 7 ? 'right' : false,
          render: (text, record, index) => {
            // 标注是否选中
            const isSelected = selectedRowKeys.includes(record.timeStamp);
            // 特殊说明
            if(v.cm_pro_column === 'oem_carmodel_comment_desc') {
              return (
                            <>
                                <span className={styles.desc_text}>{text}</span> <Icon type="edit" title={ isSelected ? '点击编辑特殊说明' : '未勾选此车型不可编辑'} className={isSelected ? styles.edit_icon : styles.edit_icon_dis} onClick={ () =>  this.showDescModal(text, record.timeStamp, isSelected)} />
                            </>
              );
            }
            // 为空，且不为扩展列
            if(isEmpty(text) && !isExpand) {
              return '-';
            }

            if(isExpand) {
              let checked = false;
              const fil = record.cm_extends.filter(ex => ex.cm_pro_column === v.cm_pro_column);
              let oldVal;
              const newVal = record[v.cm_pro_column];
              if(fil.length > 0){
                checked = fil[0].checked;
                oldVal = fil[0].oem_carmodel_extend_val;
              }

              // 扩展列
              return (
                            <>
                                {newVal && <Checkbox checked={checked} disabled={record.selected > 0} onChange={e => this.handleChangeCheckbox(e.target.checked, v, record.timeStamp)}>{newVal}</Checkbox>}
                                {/* 备注的扩展字段值，如果与当前车型该字段值不同的场合，红色标识出原备注的字段值 */}
                                {
                                  oldVal && oldVal !== newVal && <div className="red5 f12">注：{oldVal}</div>
                                }
                            </>
              );
            }else{
              const dataIndex = v.cm_pro_column;
              const { columnSearchKeys } = this.state;
              // 正常显示
              return formatFilterText(dataIndex === 'cm_sales_year' ? (record.cm_sales_year || '') + '~' + (record.cm_stop_year || '') : text, columnSearchKeys[dataIndex]);
            }

          }
        };
      }).map(v => {
        // 表格头筛选处理
        const _inc = cmProps.map(v => v.cm_pro_column);
        const { columnSearchKeys } = this.state;
        return _inc.includes(v.dataIndex) ? {
          ...v,
          title: <>{v.title} {columnSearchKeys[v.dataIndex]　&& <Icon type="close" className={styles.icon_close} onClick={() => this.handleSetFilter(v.dataIndex)} />}</>,
          filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
            // 获取筛选下拉列表数据
            // 去重排序 过滤input输入
            const _dataSource = this.filterInputList(list, v.dataIndex);
            return (
              <div className={styles['column-search-props']}>
                <Input
                  ref={node => { _searchInput[v.dataIndex] = node; }}
                  placeholder="输入筛选关键词"
                  onChange={ this.handleInputChange }
                  style={{display: 'block' }}
                />
                <List
                  className={styles['column-search-props__list']}
                  size="small"
                  bordered
                  dataSource={_dataSource}
                  renderItem={text => (<List.Item onClick={()=> this.handleSetFilter(v.dataIndex, text, confirm)}>{text}</List.Item>)}
                />

              </div>
            );
          },
          // 浮动表头无效，自行处理过滤
          filterIcon: filtered => {
            return columnSearchKeys[v.dataIndex]　? <></> : <Icon type="search" />;
          },
          onFilterDropdownVisibleChange: visible => {
            if (visible) {
              setTimeout(() => _searchInput[v.dataIndex] && _searchInput[v.dataIndex].select());
            }
          }
        } : v;
      });

      // 更多车型属性，扩展列
      const expandProps = CARMODEL_PRO_LIST.filter(v => !fixedProps.includes(v.cm_pro_column))
        .map(v => {
          return {
            ...v,
            title: v.cm_pro_name,
            dataIndex: v.cm_pro_column,
            width: 150,
            checked: category_expand_columns.some(it => v.cm_pro_id === it.cm_pro_id)
          };
        });

      // 展示更多车型列模态框
      const carmodelPropsModal = {
        title: '展示更多车型列',
        destroyOnClose: true,
        maskClosable: false,
        visible: this.state.carmodelPropsModalVisible,
        bodyStyle:{height: 400, overflowY: 'auto'},
        style: {top: 30},
        onCancel: this.hideCarmodelPropsModal,
        footer: <Row justify="space-between" type="flex">
          <Col>
            <Button type="primary" ghost onClick={ this.handleClearExpandColumns } disabled={form_checked_expand_columns.length === 0}>清除</Button>
          </Col>
          <Col>
            <Button onClick={ this.hideCarmodelPropsModal }>取消</Button>
            <Button type="primary" onClick={this.handleExpandColumns}>确定</Button>
          </Col>
        </Row>
      };

      // 表格配置
      const isLoading = carmodelModelType === 'add' ? loading['oe_id/fetchCarmodelKeyvalueList'] : loading['oe_id/fetchOemskuCarmodelEditList'];
      let tableProps = {
        className: 'm-t-15',
        pagination: false,
        bordered: true,
        rowKey: (v, index) => v.timeStamp,
        rowClassName: record => parseInt(record.selected) === 1 ? styles.is_row_disabled : '',
        loading: isLoading,
        rowSelection: {
          getCheckboxProps: record => ({
            disabled: parseInt(record.selected) === 1,
          }),
          selectedRowKeys: list.map((v, idx) => selectedRowKeys.includes(v.timeStamp) ? v.timeStamp : null).filter(v => v !== null),
          onSelect: this.handleTableSelect,
          onSelectAll: () => this.handleTableSelectAll(list),
          fixed: columns.length > 7
        },
        columns,
        dataSource: list
      };
      tableProps.scroll = {};
      if(columns.length > 7) {
        tableProps.scroll = { x: columns.reduce((init, item) => init += item.width, 0) + 68};
      }
      tableProps.scroll.y = 435;

      // 添加适配车型模态框属性
      const isAddCarmodelLoading = carmodelModelType === 'add' ? loading['oe_id/fetchCarmodelKeyvalueList'] : loading['oe_id/fetchOemskuCarmodelEditList'];
      const addCarmodelModalProps = {
        title: `${carmodelModelType === 'add' ? '添加' : '编辑'}适配车型（产品：${category_name}）`,
        destroyOnClose: true,
        maskClosable: false,
        visible: addCarmodelModalVisible,
        width: 1300,
        bodyStyle:{height: 600, overflowY: 'auto'},
        style: {top: 30},
        onCancel: () => onHideCarmodelModal(this.clearColumnSearchKeys),
        footer: <>
                <Button onClick={ () => onHideCarmodelModal(this.clearColumnSearchKeys) }>取消</Button>
                {
                  carmodelModelType === 'add' &&
                    <Button type="primary" disabled={selectedRowKeys.length === 0} onClick={this.handleAddCarmodel} loading={isAddCarmodelLoading}>添加</Button>
                }
                {
                  carmodelModelType === 'edit' &&
                    <Button type="primary" onClick={this.handleEditCarmodel} loading={isAddCarmodelLoading}>保存</Button>
                }
            </>
      };

      return (
        <Modal {...addCarmodelModalProps}>
          <Row className={styles.formRow} gutter={16} justify="space-between" type="flex">

            <Col span={16} style={{width:'95%'}}>
              <Form layout="inline" >
                {
                  carmodelModelType === 'add' &&
                  <>
                  <Form.Item>车型：</Form.Item>
                  <Form.Item>
                    {getFieldDecorator('car_fac_model', {
                      initialValue: []
                    })(
                      <Cascader
                        className={styles.cascader}
                        fieldNames={{ label: 'l'  , value: 'v', children: 'c' }}
                        options={BRAND_FAC_MOD_APPROVED_LIST}
                        placeholder='请选择品牌/主机厂/车型'
                        showSearch={{ filter: handleCmFilter, matchInputWidth: true, limit: false }}
                        changeOnSelect={true}
                      />
                    )}
                  </Form.Item>
                  </>
                }
                {/* 变速箱型号 */}
                <>
                <Form.Item>变速箱型号：</Form.Item>
                <Form.Item>
                  {getFieldDecorator('cm_gearbox_model', {
                    initialValue: ''
                  })(
                    <Input style={{width: 120}} />
                  )}
                </Form.Item>
                </>

                {
                  carmodelModelType === 'edit' &&
                  ''
                }
                <Form.Item>发动机型号：</Form.Item>
                <Form.Item>
                  {getFieldDecorator('cm_engine_model', {
                    initialValue: ''
                  })(
                    <Input style={{width: 120}} />
                  )}
                </Form.Item>

                {
                  carmodelModelType === 'edit' &&
                  ''
                }
                <Form.Item>底盘号：</Form.Item>
                <Form.Item>
                  {getFieldDecorator('cm_chassis_model', {
                    initialValue: ''
                  })(
                    <Input style={{width: 120}} />
                  )}
                </Form.Item>
                <Form.Item>
                  <Button type="primary" onClick={this.handleSearch}>查询</Button>
                </Form.Item>
              </Form>

            </Col>

            <Col span={8} style={{width:'5%',top:'1px'}} className="text-right">

              <Icon type="bars" style={{ fontSize: '20px' }} className="cur" onClick={this.showCarmodelPropsModal} title="展示更多车型列"  />
            </Col>
          </Row>
          <div className={(list.length > 0 &&  columns.length > 7)? styles.table_content : styles.table_content_isData} id="idAddCarmodel_table">
            <Table {...tableProps} />
          </div>
          {/* 展示更多车型列模态框 */}
          <Modal {...carmodelPropsModal}>
            {getFieldDecorator('checked_expand_columns', {
              initialValue: category_expand_columns
            })(
              <Checkbox.Group style={{ width: '100%' }}>
                <Row>
                  {
                    expandProps.map(v => {
                      return (
                        <Col key={v.cm_pro_id} className={styles.expandColumns_col}>
                          <Checkbox value={v.cm_pro_id} style={{display: 'block'}} >
                            {v.cm_pro_name}
                          </Checkbox>
                        </Col>
                      );
                    })
                  }
                </Row>
              </Checkbox.Group>
            )}
          </Modal>

        </Modal>
      );
    }
}

export default Form.create()(IdAddCarmodel);
