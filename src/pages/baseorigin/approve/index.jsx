import React, { useCallback, useMemo, useState, useEffect, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Row, Form, Col, Divider, Table, Modal, Button, Radio } from 'antd';
import msg from '@/utils/msg';
import Link from 'umi/link';
import classNames from 'classnames';
const { confirm } = Modal;

const BaseoriginApprove = ({ dispatch, form, loading, CARMODEL_ORIGIN_PENDING_LIST, CARMODEL_ORIGIN_PENDING_COUNT }) => {
  const { fields, count } = CARMODEL_ORIGIN_PENDING_LIST;
  const { page, perpage, filterColumn } = fields;
  const { addCount, deleteCount, updateCountArr = [] } = CARMODEL_ORIGIN_PENDING_COUNT;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const { getFieldValue, setFieldsValue, getFieldDecorator } = form;
  /** 获取待审核源车型列表  */
  const fetchCarmodelOriginPendingList = useCallback(payload => {
    dispatch({
      type: 'baseorigin/fetchCarmodelOriginPendingList',
      payload
    });
    // 清空选中状态
    selectedRowKeys.length > 0 && setSelectedRowKeys([]);
    getFieldValue('carmodel_origin_pending_count') && setFieldsValue({ carmodel_origin_pending_count: undefined });
  }, [selectedRowKeys]);

  /** 获取待审核源车型属性变更的数量  */
  const fetchCarmodelOriginPendingCount = useCallback(payload => {
    dispatch({
      type: 'baseorigin/fetchCarmodelOriginPendingCount',
      payload
    });
  }, []);

  const pageInit = useCallback(() => {

    // 获取待审核源车型列表
    const obj = {
      cm_origin: 'liyang',
      page,
      perpage
    };
    if(filterColumn) {
      obj.filterColumn = filterColumn;
    };

    fetchCarmodelOriginPendingList(obj);
    // 获取待审核源车型属性变更的数量
    fetchCarmodelOriginPendingCount({ cm_origin: 'liyang' });
  }, [selectedRowKeys, fields]);

  /** 初始化 */
  useEffect(() => {
    pageInit();
    return () => {
      setSelectedRowKeys([]);
    };
  }, []);

  /** 审核操作 */
  const handleApprove = useCallback((type) => {

    let title = '', content = '';
    if (type === 'approve') {
      title = '审核通过';
      content = '所选源车型将导入系统源车型库，并从待审核库中删掉。';
    } else if (type === 'unapprove') {
      title = ' 审核不通过';
      content = '所选源车型将从待审核库中删掉，无法找回。';
    }

    let payload = { cm_origin: 'liyang' };
    const value = getFieldValue('carmodel_origin_pending_count');
    if (value) {
      payload.filterColumn = value;
    } else if (selectedRowKeys.length > 0) {
      payload.cm_levelids = selectedRowKeys;
    } else {
      msg('请选择需要审核的车型');
      return;
    }

    confirm({
      title,
      content,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        if (type === 'approve') {
          dispatch({
            type: 'baseorigin/fetchCarmodelOriginApproved',
            payload,
            callback: () => {
              pageInit();
            }
          });
        } else if (type === 'unapprove') {
          dispatch({
            type: 'baseorigin/fetchCarmodelOriginUnapproved',
            payload,
            callback: () => {
              pageInit();
            }
          });
        }
      }
    });

  }, [selectedRowKeys]);

  /**
   * 车型属性数量Radio选中
   * Radio和列表Checkbox的选中状态为互斥关系
   */
  const handleChangeRadio = useCallback(() => {
    setSelectedRowKeys([]);
  }, []);

  const columns = useMemo(() => {
    return [{
      title: '品牌 / 主机厂 / 车型',
      dataIndex: 'carmodel',
      render: (text, record) => {
        const { cm_brand, cm_factory, cm_model } = record;
        return [cm_brand, cm_factory, cm_model].filter(v => Boolean(v)).join(' ');
      }
    },{
      title: '销售名称',
      dataIndex: 'cm_sales_name'
    },
    {
      title: '车系',
      dataIndex: 'cm_car'
    },
    {
      title: '年款',
      dataIndex: 'cm_model_year'
    },
    {
      title: '排量',
      dataIndex: 'cm_displacement'
    },
    {
      title: '更新数据',
      dataIndex: 'updateColumn',
      render: (text = [], record) => {
        return text.map(v => {
          const { cm_pro_column, cm_pro_name, cm_pro_value_before, cm_pro_value_after } = v;
          return (
            <div key={cm_pro_column}>
              <strong className={classNames('m-r-15', {'red6': !record.updateFlag})}>{cm_pro_name}</strong>
              {
                !['一致', '新增', '删除'].includes(cm_pro_name) &&
                <>
                  <span className="m-r-15">
                    <span className="c9">更新前：</span>{cm_pro_value_before || '""'}
                  </span>
                  <span className="m-r-15">
                    <span className="c9">更新后：</span>{cm_pro_value_after || '""'}
                  </span>
                </>
              }

            </div>
          );
        });
      }
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 60,
      render: (text, record) => <span className="blue6 cur"><Link to={'/baseorigin/approve/' + record.cm_levelid}>详情</Link></span>
    }];
  }, [CARMODEL_ORIGIN_PENDING_LIST.data]);

  /** 分页 */
  const paginations = useMemo(() => {
    return {
      pageSize: perpage,
      current: page,
      total: count,
      showSizeChanger: true,
      showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`,
      onShowSizeChange: (current, perpage) => {
        fetchCarmodelOriginPendingList({
          ...fields,
          perpage,
          page: 1
        });
      },
      onChange: curPage => {
        fetchCarmodelOriginPendingList({
          ...fields,
          page: curPage
        });
      }
    };
  }, [CARMODEL_ORIGIN_PENDING_LIST]);

  /** 行选中 */
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
      // Radio和列表Checkbox的选中状态为互斥关系
      setFieldsValue({ carmodel_origin_pending_count: undefined });
    }
  };

  /** 审核按钮禁用状态 */
  const btnDisabled = selectedRowKeys.length === 0 && !Boolean(getFieldValue('carmodel_origin_pending_count'));
  const isBtnLoading = loading['baseorigin/fetchCarmodelOriginApproved'] || loading['baseorigin/fetchCarmodelOriginUnapproved'];

  const getTitle = useCallback((e) => {
    const find = [addCount, deleteCount, ...updateCountArr.map(v => ({...v, cm_pro_name: '更新车型（' + v.cm_pro_name + '）'}))].find(v => v.cm_pro_column === filterColumn);
    return find ? find.cm_pro_name : '全部车型';
  }, [CARMODEL_ORIGIN_PENDING_LIST, CARMODEL_ORIGIN_PENDING_COUNT]);

  return (
    <Card loading={loading['baseorigin/fetchCarmodelOriginPendingCount']}>
      <Row className="f18 m-b-15">{getTitle()}</Row>
      {getFieldDecorator('carmodel_origin_pending_count', {
        rules: [],
      })(<Radio.Group style={{ display: 'block' }} onChange={handleChangeRadio}>
        <Row type="flex" gutter={16}>
          <Col><strong>新增车型</strong></Col>
          <Col>
            {(!addCount.count || addCount.count === 0) && <span className="c9">暂无</span>}
            {addCount.count > 0 && <> <span className={classNames('cur blue6 m-r-5', {'underline': filterColumn === 'add'})} title="点击筛选车型" onClick={() => fetchCarmodelOriginPendingList({
              ...fields,
              page: 1,
              filterColumn: addCount.cm_pro_column,
            })}>{addCount.count}</span>条<Radio className="m-l-10" value={addCount.cm_pro_column} /></>}
          </Col>
          <Col><Divider type="vertical" /></Col>
          <Col><strong>删除车型</strong></Col>
          <Col>
            {(!deleteCount.count || deleteCount.count === 0) && <span className="c9">暂无</span>}
            {deleteCount.count > 0 && <><span className={classNames('cur blue6 m-r-5', {'underline': filterColumn === 'delete'})} title="点击筛选车型" onClick={() => fetchCarmodelOriginPendingList({
              ...fields,
              page: 1,
              filterColumn: deleteCount.cm_pro_column
            })}>{deleteCount.count}</span>条<Radio className="m-l-10" value={deleteCount.cm_pro_column} /></>}
          </Col>
          <Col><Divider type="vertical" /></Col>
          <Col><span className={classNames('blue6 m-r-5 cur', {'underline': filterColumn === undefined})} title="点击筛选车型" onClick={() => fetchCarmodelOriginPendingList({
            cm_origin: 'liyang',
            page: 1,
            perpage
          })}>查看全部</span></Col>
        </Row>
        <Row type="flex" gutter={16} className="m-t-15">
          <Col><strong>更新车型</strong></Col>
          <Col>
            {updateCountArr.length === 0 && <span className="c9">暂无</span>}
            {
              updateCountArr.length > 0 &&
              updateCountArr.map(v => {
                return <Fragment key={v.cm_pro_column}> {v.cm_pro_name}：<span className={classNames('cur blue6 m-r-5', {'underline': filterColumn === v.cm_pro_column} )} title="点击筛选车型" onClick={() => fetchCarmodelOriginPendingList({
                  ...fields,
                  page: 1,
                  filterColumn: v.cm_pro_column
                })}>{v.count}</span>条<Radio className="m-l-10" value={v.cm_pro_column} /></Fragment>;
              })
            }
          </Col>
        </Row>
      </Radio.Group>)}

      <Divider style={{ marginTop: 15, marginBottom: 15 }} />
      <Row>
        <Button type="primary" size="small" onClick={() => handleApprove('approve')} disabled={btnDisabled} loading={isBtnLoading}>审核通过</Button>
        <Divider type="vertical" />
        <Button type="danger" size="small" onClick={() => handleApprove('unapprove')} disabled={btnDisabled} loading={isBtnLoading}>审核不通过</Button>
      </Row>
      <Table className="m-t-15" bordered loading={loading['baseorigin/fetchCarmodelOriginPendingList']} columns={columns} dataSource={CARMODEL_ORIGIN_PENDING_LIST.data} rowSelection={rowSelection} pagination={paginations} rowKey="cm_levelid" />
    </Card>
  );
};

const mapStateToProps = state => ({
  loading: state.loading.effects,
  CARMODEL_ORIGIN_PENDING_LIST: state.baseorigin.CARMODEL_ORIGIN_PENDING_LIST,
  CARMODEL_ORIGIN_PENDING_COUNT: state.baseorigin.CARMODEL_ORIGIN_PENDING_COUNT
});

export default connect(mapStateToProps)(Form.create()(BaseoriginApprove));
