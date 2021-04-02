
import React, { Component, Fragment } from 'react';
import { Card, Row, Col, Tag, Table, Affix, Input, List, Icon, Button, Checkbox, Divider } from 'antd';
import styles from './IdCarModel.less';
import classNames from 'classnames';
import router from 'umi/router';
import ENV from '@/utils/env';
import { isEmpty, getCarmodelStatusColor } from '@/utils/tools';
import LazyLoad from 'react-lazyload';
import Highlighter from 'react-highlight-words';
import { sortBy, uniqBy } from 'lodash';
import shallowequal from 'shallowequal';
let _searchInput = {};


const PlaceholderLoading = () => {
  return (
    <div className={styles.p_loading}><span className="iconfont icon-jiazaizhong"></span></div>
  );
};

const CartTitle = ({PAGE_TYPE, OE_INFO_FIELDS, OE_CODES}) => {
  const { category_name = '' } = OE_INFO_FIELDS;
  return (
    <Row>
      <Col>
        <span>{category_name + '：'}&emsp;</span>
        { 
          OE_CODES.length !== 0 && 
                    OE_CODES.map((item, index) => <Tag className={classNames(styles.code_tag, 'f14')} key={index}>{item.oem_partsku_code}</Tag>) 
        }
        { 
          !PAGE_TYPE === 'add' && OE_CODES.length === 0 && <Tag className='f14'>虚拟OE码</Tag>
        }
      </Col>
    </Row>
  );
};

// 表格头设置
const TableTitle = ({PAGE_TYPE, title, cmIds, onShowCarmodelModal, onOemskuCarmodelDelete, onOemskuCarmodelSplit}) => {

  return (
    <Row type='flex' justify='space-between' align='middle' className="m-t-10 m-b-10">
      <Col>
        {
          title && 
                    <>
                        <span className='gray'>车型品牌：</span>
                        <b>{title}</b>
                    </>
        }
      </Col>

      <Col>
        <Button type='primary' onClick={() => onShowCarmodelModal('add')}>添加适配车型</Button>
        <Divider type="vertical" style={{marginLeft: 20, marginRight: 20}} />
        {
          PAGE_TYPE === 'edit' 
                    &&  <Button className="m-r-15" type='primary' ghost disabled={cmIds.length === 0} onClick={ () => onOemskuCarmodelSplit(cmIds) }>拆分</Button>
        }
        <Button type="danger" disabled={cmIds.length === 0} onClick={ () => onOemskuCarmodelDelete(cmIds) }>删除</Button>
      </Col>
    </Row>
  );
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

export default class IdCarModel extends Component {

    state = {
      inputValue: ''
    }

    shouldComponentUpdate(nextProps, nextState) {
      const { CARMODEL_LIST, OE_CODES, columnSearchKeys, loading } = this.props;
      const { inputValue } = this.state;
      const isLoading = loading['oe_id/fetchOemskuCarmodelTabInfo'] || loading['oe_id/fetchBrandFacModListApproved'] || loading['oe_id/fetchCarmodelProList'];
      if(!isLoading) {
        return !shallowequal(CARMODEL_LIST, nextProps.CARMODEL_LIST) || !shallowequal(columnSearchKeys, nextProps.columnSearchKeys) || !shallowequal(OE_CODES, nextProps.OE_CODES) || !shallowequal(inputValue, nextState.inputValue);
      }else{
        return true;
      }
       
    }

    // 筛选输入
    handleInputChange = e => {
      const { value } = e.target;
      this.setState({ inputValue: value });
    };

    // 可选择的筛选下拉列表
    filterInputList = (carmodelList, dataIndex) => {
      const dataSource = carmodelList.reduce((init, cm) => init.concat(cm.list.map(it => dataIndex === 'cm_sales_year' ? `${it.cm_sales_year}~${it.cm_stop_year}` : it[dataIndex])), []);
      const _l = sortBy(uniqBy(dataSource).filter(v =>　(isEmpty(v) ? '' : v).toUpperCase().indexOf(this.state.inputValue.toUpperCase()) > -1));
      return _l.filter(v => !!v);
    };

    // 根据条件过滤列表显示数据
    formatList = carmodelList => {
      const { columnSearchKeys } = this.props;
      return carmodelList.map(brand => {
        return {
          ...brand,
          list: brand.list.filter(v => {
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
          })
        };
      }).filter(v => v.list.length > 0);
    };

    // 选中全部适配车型行
    handleAllChecked = (e, ckList) => {
      const { CARMODEL_LIST, onUpdateCarmodelList } = this.props;
      const { checked } = e.target;
      const timeStamps = ckList.map( v => v.timeStamp);
      const payload = CARMODEL_LIST.map(brand => {
        return {
          ...brand,
          list: brand.list.map(cm => {
            return {
              ...cm,
              // checked: cm.unsolve_count > 0 || !timeStamps.includes(cm.timeStamp) ? false : checked
              checked: !timeStamps.includes(cm.timeStamp) ? false : checked
            };
          })
        };
      });
        // 更新适配车型列表
      onUpdateCarmodelList(payload);
    }

    // 选中适配车型行
    handleChecked = (e, row) => {
      const { CARMODEL_LIST, onUpdateCarmodelList } = this.props;
      const { checked } = e.target;
      const payload = CARMODEL_LIST.map(brand => {
        return {
          ...brand,
          list: brand.list.map(cm => {
            return row.timeStamp === cm.timeStamp ? { ...cm, checked} : cm;
          })
        };
      });
      onUpdateCarmodelList(payload);
        
    };

    // 配置columns
    getColumns = (carmodelList = []) => {
      const { PAGE_TYPE, CARMODEL_INFO, CATEGORY_INFO, columnSearchKeys, onSetFilter, onShowFeedbackModal } = this.props;
      const { carPro = [] } = CARMODEL_INFO.data;
      const { carmodelProParams = [] } = CATEGORY_INFO;
      // 是否全选状态
      const reduceList = carmodelList.reduce((init, v) => init.concat(v.list), []);
      const ckList = reduceList;
      // const ckList = PAGE_TYPE === 'edit' ? reduceList.filter(v => v.unsolve_count === 0) : reduceList;
      const checkedListLen = ckList.filter(v => v.checked).length;
      const isCheckedAll = ckList.length > 0 && ckList.every(v => v.checked);
      // 品类默认属性
      const cmProps = PAGE_TYPE === 'add' ? carmodelProParams : carPro;
      return [
        { 
          title: <Checkbox checked={isCheckedAll} disabled={ckList.length === 0} indeterminate={checkedListLen !== 0 && ckList.length !== checkedListLen} onChange={e => this.handleAllChecked(e, ckList)}/>, 
          dataIndex: 'cm_checkbox', 
          width: 30,
          render: (text, row, index) => {
            // 存在未处理 用户反馈时，不允许删除
            // return <Checkbox disabled={row.unsolve_count > 0} checked={row.checked} onChange={e => this.handleChecked(e, row)}/>;
            return <Checkbox checked={row.checked} onChange={e => this.handleChecked(e, row)}/>;
          }
        },
        { 
          title: '品牌', 
          dataIndex: 'cm_brand', 
          width: 70,
          render: (text, row, index) => {
            const dataIndex = 'cm_brand';
            const _t = formatFilterText(text, columnSearchKeys[dataIndex]);
            return <span>{_t}</span> ;
          }
        },
        { 
          title: '主机厂', 
          dataIndex: 'cm_factory', 
          width: 105,
          render: (text, row, index) => {
            const dataIndex = 'cm_factory';
            const _t = formatFilterText(text, columnSearchKeys[dataIndex]);
            return <span>{_t}</span> ;
          }
        },
        { 
          title: '车型', 
          dataIndex: 'cm_model', 
          width: 105,
          render: (text, row, index) => {
            const dataIndex = 'cm_model';
            const _t = formatFilterText(text, columnSearchKeys[dataIndex]);
            if(PAGE_TYPE === 'add') {
              return <span>{_t}</span> ;
            }
                    
            if(PAGE_TYPE === 'edit') {             
              const params = cmProps.map(v => ({key: [v.cm_pro_column], value: row[v.cm_pro_column]}))
                .filter(v => v.value)
                .reduce((total, current) => total += `&${current.key}=${current.value}`, `?from=oe&review_status=${row.oem_carmodel_status}`);
              return <span className='blue6 cur' onClick={ () => router.push('/baseorigin/list' + params) }>{_t}</span>;
            }
    
          } 
        },
        { 
          title: '年款', 
          dataIndex: 'cm_model_year', 
          width: 65,
          render: (text, row, index) => {
            const dataIndex = 'cm_model_year';
            const _t = formatFilterText(text, columnSearchKeys[dataIndex]);
            return <span>{_t}</span> ;
          }
        },
        { 
          title: '上市年份', 
          dataIndex: 'cm_sales_year', 
          width: 87,
          render: (text, row, index) => {
            const dataIndex = 'cm_sales_year';
            // 合并上市年份、停产年份到一列
            return formatFilterText((row.cm_sales_year || '') + '~' + (row.cm_stop_year || ''), columnSearchKeys[dataIndex]);
          }
        },
        { 
          title: '排量', 
          dataIndex: 'cm_displacement', 
          width: 65,
          render: (text, row, index) => {
            const dataIndex = 'cm_displacement';
            const _t = formatFilterText(text, columnSearchKeys[dataIndex]);
            return <span>{_t}</span> ;
          }
        },
        { 
          title: '发动机型号', 
          dataIndex: 'cm_engine_model', 
          width: 99,
          render: (text, row, index) => {
            const dataIndex = 'cm_engine_model';
            const _t = formatFilterText(text, columnSearchKeys[dataIndex]);
            return <span>{_t}</span> ;
          }
        },
        { 
          title: '其他属性', 
          dataIndex: 'cm_other',
          render: (text, row, index) => {
            const exclude = ['cm_brand', 'cm_factory', 'cm_model', 'cm_model_year', 'cm_displacement', 'cm_sales_year', 'cm_stop_year', 'cm_engine_model'];
            const _list = cmProps.map(v => ({...v, value: row[v.cm_pro_column]}))
              .filter(v => !exclude.includes(v.cm_pro_column) && !isEmpty(v.value));
            return (
                        <>
                        {
                          _list.map((v, idx) => {
                            return (
                              <span key={idx}>
                                {`${v.cm_pro_name}：${v.value}`}{idx < _list.length - 1 && '，'}
                              </span>
                            );
                          })
                        }
                        </>
            );
                    
          }
        },
        { 
          title: '匹配源', 
          dataIndex: 'oem_carmodel_origin',
          width: 55,
          render: (text, row, index) => {
            if(PAGE_TYPE === 'add') {
              return <span>系统</span>;
            }
            if(PAGE_TYPE === 'edit') {
              // 匹配来源 系统:SYSTEM 商户:TENANT 采集:COLLECTION
              return <span>{ENV.oemCarmodelOrigin[text]}</span>;
            }
          }
        },
        { 
          title: '审核状态', 
          dataIndex: 'oem_carmodel_status',
          width: 65,
          render: (text, row, index) => {
            const _className = getCarmodelStatusColor(text);
            if(PAGE_TYPE === 'add') {
              return <span className={_className}>待审核</span>;
            }
            if(PAGE_TYPE === 'edit') {

              return <span className={_className}>{text == 'PENDING' ? '待审核' : text == 'APPROVED' ? '已通过' : '不通过'}</span>;
            }
          }
        },
        { 
          title: '用户反馈', 
          dataIndex: 'user_feedback',
          width: 80,
          render: (text, row, index) => {
                     
            if(PAGE_TYPE === 'add') {
              return <span>-</span>;
            }
            if(PAGE_TYPE === 'edit') {
              /**
                         * 用户反馈
                         * solve_count 处理的条数，unsolve_count 未处理的条数。
                         * 1、如果有未处理的就显示未处理的条数，2、如果没有未处理的但是有处理的条数，就显示已处理，3、要不然就显示空白 
                        */ 
              return (
                <div>
                  {/* 未处理 */}
                  { row.unsolve_count > 0 && <span className='blue6 cur' key={index} onClick={ () => onShowFeedbackModal(row) }>{row.unsolve_count + '条未处理'}</span> }
                  {/* 已处理 */}
                  { row.solve_count > 0 && <span key={index}>已处理</span> }
                  { (row.unsolve_count === 0 && row.solve_count === 0) && <span>-</span> }
                </div>
              );
            }
          }
        },
        { 
          title: '备注信息', 
          dataIndex: 'oem_carmodel_comment_desc',
          width: 140,
          render: (text, row, index) => {
            const cm_extends = row.cm_extends.filter(v => v.checked );
                    
            const getText = ()=> {
              let _t = '';
              // 扩展属性
              if(cm_extends.length > 0) {
                _t += cm_extends.map(v => `${v.cm_pro_name}：${v.oem_carmodel_extend_val}`).join('，') + '，';
              }
              // 特殊说明
              if(text) {
                _t +=`备注：${text}`;
              }
              return _t;
            };

                    
            return (
              <div>
                <span className="ell vm" style={{width: 100, display: 'inline-block'}} title={getText()}>
                  {getText()}
                </span>
                <Icon type="edit" title={'点击编辑'} className="cur vm" onClick={() => this.handleEdit(row)} />
              </div>
            );
          }
        }
      ].map(v => {
        // 表格头筛选处理
        const _inc = ['cm_brand', 'cm_factory', 'cm_model', 'cm_model_year', 'cm_sales_year', 'cm_displacement', 'cm_engine_model'];
        return _inc.includes(v.dataIndex) ? {
          ...v,
          title: <>{v.title} {columnSearchKeys[v.dataIndex]　&& <Icon type="close" className={styles.icon_close} onClick={() => onSetFilter(v.dataIndex)} />}</>,
          filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
            // 获取筛选下拉列表数据
            // 去重排序 过滤input输入
            const dataSource = this.filterInputList(carmodelList, v.dataIndex);
            return (
              <div className={styles['column-search-props']}>
                <Input
                  ref={node => { _searchInput[v.dataIndex] = node; }}
                  placeholder="输入筛选关键词"
                  value={this.state.inputValue}
                  onChange={ this.handleInputChange }
                  style={{display: 'block' }}
                />
                <List
                  className={styles['column-search-props__list']}
                  size="small"
                  bordered
                  dataSource={dataSource}
                  renderItem={text => (<List.Item onClick={()=> onSetFilter(v.dataIndex, text, confirm)}>{text}</List.Item>)}
                />
                            
              </div>
            );
          },
          // 浮动表头无效，自行处理过滤
          filterIcon: filtered => {
            return columnSearchKeys[v.dataIndex]　? <> </> : <Icon type="search" />;
          },
          onFilterDropdownVisibleChange: visible => {
            if (visible) {
              setTimeout(() => _searchInput[v.dataIndex] && _searchInput[v.dataIndex].select());
            }else{
              this.setState({inputValue: ''});
            }
          }
        } : v;
      });
    }

    // 点击编辑
    handleEdit = (row) => {
      const { PAGE_TYPE, onShowCarmodelModal } = this.props;
      onShowCarmodelModal('edit', row);
    }

    render() {
      const { loading, PAGE_TYPE, OE_INFO_FIELDS, OE_CODES, CARMODEL_INFO, CARMODEL_LIST, onShowCarmodelModal, onOemskuCarmodelDelete, onOemskuCarmodelSplit } = this.props;
      const { carmodelBrand = '' } = CARMODEL_INFO.data;
      const list = this.formatList(CARMODEL_LIST);
      const columns = this.getColumns(list);
      const isLoading = loading['oe_id/fetchOemskuCarmodelTabInfo'] || loading['oe_id/fetchBrandFacModListApproved'] || loading['oe_id/fetchCarmodelProList'];
      // 全部选中的cms_id
      const checkedCmIds = CARMODEL_LIST.reduce((init, v) => init.concat(v.list), []).filter(v => v.checked).map(v => v.cm_ids).reduce((init,v) => init.concat(v), []);
      return (
        <Card loading={isLoading} className={styles.content} title={<CartTitle PAGE_TYPE={PAGE_TYPE} OE_INFO_FIELDS={OE_INFO_FIELDS} OE_CODES={OE_CODES}/>}>
          {/* 拆分 删除 操作区 */}
          <TableTitle PAGE_TYPE={PAGE_TYPE} title={carmodelBrand === '' ? '审核后确定所属品牌' : carmodelBrand} onShowCarmodelModal={onShowCarmodelModal} onOemskuCarmodelDelete={onOemskuCarmodelDelete} onOemskuCarmodelSplit={onOemskuCarmodelSplit} cmIds={checkedCmIds}/>

          {/* 适配车型 固定表头 */}
          <Affix>
            <Table bordered={true} columns={columns} className={list.length > 0 ? styles.table_header : ''}/>
          </Affix>
          {
            list.map((item, idx) => {
              return <Fragment key={idx} >
                <LazyLoad  height={200} once={false} offset={100} placeholder={<PlaceholderLoading />} debounce={100} throttle={100} >
                  <Table 
                    className={'m-b-15'}
                    bordered={true}
                    columns={columns}
                    pagination={false}
                    showHeader={false}
                    rowKey={(itm, idx) => idx}
                    dataSource={item.list}
                  />
                </LazyLoad>
              </Fragment>;
            })
          }

        </Card>
      );
    
    }
}

