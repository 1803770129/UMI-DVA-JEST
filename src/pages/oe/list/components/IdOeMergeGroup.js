
import React, { Component } from 'react';
import { Form, Card, Select, Input, Alert, Modal, Row, Col, Tag, Button, Divider, Table } from 'antd';
import styles from './IdOeMergeGroup.less';
import classNames from 'classnames';
import { isEmpty, isArray, getCarmodelStatusColor } from '@/utils/tools';
const { TextArea } = Input;
const FormItem = Form.Item;
const { Option } = Select;

const CartTitle = ({ PAGE_TYPE, OE_INFO_FIELDS, OE_CODES }) => {
  const { category_name = '' } = OE_INFO_FIELDS;
  return (
    <Row>
      <Col>
        <span className="c9">{category_name + '：'}&emsp;</span>
        {
          OE_CODES.length !== 0 &&
          OE_CODES.map((item, index) => <Tag className={classNames(styles.code_tag, 'f14')} key={index}>{item.oem_partsku_code}</Tag>)
        }
        {
          PAGE_TYPE !== 'add' && OE_CODES.length === 0 && <Tag className='f14'>虚拟OE码</Tag>
        }
      </Col>
    </Row>
  );
};

// 查询提示
const descConfig = {
  code: '已审核通过的相同品类相同车型品牌的OE，以及同品类待审核的OE',
  carmodel: '匹配审核通过，相同品类并且相同车型'
};


class IdOeMergeGroup extends Component {

  state = {
    oe_unmerge_des: '', // 不合作说明
    unMergeVisible: false, // 不合作说明模态框状态
    currentUnmergeRow: {}, // 当前缓存不合并行数据
    selectedRows: [] //表格selected项
  }

  // 显示不合并模态框
  showUnMergeModel = row => {
    this.setState({
      oe_unmerge_des: row.oem_exclude_reason,
      currentUnmergeRow: row,
      unMergeVisible: true
    });
  };

  // 隐藏不合并模态框
  hideUnMergeModel = () => {
    this.setState({
      unMergeVisible: false,
      currentUnmergeRow: {},
      oe_unmerge_des: ''
    });
  };

  // 表格select
  handleTableChange = (selectedRowKeys, selectedRows) => {
    this.handleSelectedRows(selectedRows.map(v => v.oem_partsku_id));
  };

  handleSubmit = () => {
    const { form, onFetchOemskuMergeSelect } = this.props;
    const { validateFields } = form;
    validateFields((err, values) => {
      if (!err) {
        let params = {};
        for (const k in values) {
          if (!isEmpty(values[k])) {
            params[k] = values[k];
          }
        }
        onFetchOemskuMergeSelect(params);
      }
    });
  };

  handleSelectedRows = selectedRows => {
    this.setState({
      selectedRows
    });
  }

  handleChangeType = type => {
    const { onFetchOemskuMergeSelect } = this.props;
    // 选择筛选范围时，自动查询列表
    onFetchOemskuMergeSelect({ type });
  }

  render() {
    const { form, loading, PAGE_TYPE, OE_INFO, OE_INFO_FIELDS, OE_CODES, OEMSKU_MERGE_SELECT, OEMSKU_MERGE_SELECT_TYPE, onUnMerge, onMerge, onPreviewImage } = this.props;
    const { selectedRows } = this.state;
    const { oem_partsku_status = '' } = OE_INFO.data;
    let list = [];
    const isLoading = loading['oe_id/fetchOemskuMergeSelect'];
    if (!isLoading) {
      if (OEMSKU_MERGE_SELECT_TYPE === 'code' && isArray(OEMSKU_MERGE_SELECT.data)) {
        list = OEMSKU_MERGE_SELECT.data;
      }
      if (OEMSKU_MERGE_SELECT_TYPE === 'carmodel' && isArray(OEMSKU_MERGE_SELECT.data.list)) {
        list = OEMSKU_MERGE_SELECT.data.list;
      }
    }
    const { carPro = [] } = OEMSKU_MERGE_SELECT.data;
    const { getFieldDecorator, getFieldValue, getFieldsValue } = form;
    // 不合并说明操作提示框
    const unMergeModelProps = {
      visible: this.state.unMergeVisible,
      title: '不合并说明',
      onCancel: this.hideUnMergeModel,
      destroyOnClose: true,
      footer: [
        <Button key='ok' className='ant-btn ant-btn-primary' disabled={isEmpty(this.state.oe_unmerge_des)} onClick={() => onUnMerge(getFieldsValue(), this.state.currentUnmergeRow, this.state.oe_unmerge_des, this.hideUnMergeModel)}>确定</Button>,
        <Button key='cancle' onClick={this.hideUnMergeModel}>取消</Button>
      ]
    };
    const columns = [
      {
        title: 'OE码',
        dataIndex: 'oem_partsku_codes',
        width: 120,
        render: (codes = [], row, index) => {
          return (
            <>
              {
                codes.length > 0 &&
                codes.map((code, idx) => {
                  return <div key={idx}>{code}</div>;
                })
              }
              {
                codes.length === 0 &&
                '虚拟OE'
              }
            </>
          );
        }
      },
      {
        title: 'OE属性',
        dataIndex: 'oem_partsku_values',
        render: (values, row, index) => {
          const partsku_values = values.filter(v => v.category_pro_type !== 'IMAGE');
          const partsku_values_imgs = values.filter(v => v.category_pro_type === 'IMAGE');
          return (
            <>
              {
                partsku_values.length > 0 &&
                partsku_values.map(v => `${v.category_pro_name}：${v.oem_partsku_value}${v.category_pro_unit && '(' + v.category_pro_unit + ')'}`).join('，')
              }
              {partsku_values_imgs.length > 0 && partsku_values.length > 0 && <>，</>}
              {
                partsku_values_imgs.length > 0 &&
                partsku_values_imgs.map((v, idx) => {
                  return (
                    <span key={idx}>
                      <span>{v.category_pro_name}：</span><span className={classNames(styles['title-head-img'], 'iconfont icon-photoa cur')} onClick={()=> onPreviewImage([v.oem_partsku_image_url])}></span>
                    </span>
                  );
                })
              }
              {
                partsku_values.length == 0 && partsku_values_imgs.length == 0 &&
                '-'
              }
            </>
          );
        }
      },
      {
        title: '审核状态',
        dataIndex: 'oem_partsku_status',
        width: 80,
        render: text => {
          const _className = getCarmodelStatusColor(text);
          return (
            <>
              {text === 'APPROVED' && <span className={_className}>审核通过</span>}
              {text === 'PENDING' && <span className={_className}>待审核</span>}
              {text === 'NONAPPROVED' && <span className={_className}>审核不通过</span>}
            </>
          );
        }
      },
      { title: '状态', dataIndex: 'merge_status', width: 80, render: text => text || '-' },
      { title: '说明', dataIndex: 'oem_exclude_reason', width: 300, render: text => text || '-' },
      {
        title: '操作',
        dataIndex: 'oe_opeating',
        width: 120,
        render: (text, row, index) => <span className='blue6 cur' onClick={() => this.showUnMergeModel(row)}>不合并</span>
      }
    ];


    const tableProps = {
      loading: isLoading,
      style: { marginTop: 15 },
      bordered: true,
      pagination: false,
      rowKey: (item, index) => index,
      rowSelection: {
        onChange: this.handleTableChange
      },
      columns
    };
    return (
      <>
        {/* 未审核状态 */}
        {
          oem_partsku_status !== 'APPROVED' &&
          <Card>
            <Alert style={{ marginTop: '20px' }} message='提示：' description=' 待审核和审核不通过OE禁止合并操作！' type='error' />
          </Card>
        }
        {/* 审核状态 */}
        {
          oem_partsku_status === 'APPROVED' &&
          <Card className={styles.content} title={<CartTitle PAGE_TYPE={PAGE_TYPE} OE_INFO_FIELDS={OE_INFO_FIELDS} OE_CODES={OE_CODES} />}>
            {/* 查询表单 */}
            <Form className={styles.form} autoComplete="off">
              <Row gutter={16}>
                <Col span={4}>
                  <FormItem colon={false} label={<span className="c9">筛选范围:</span>}>
                    {getFieldDecorator('type', {
                      initialValue: OEMSKU_MERGE_SELECT_TYPE
                    })(
                      // 选了全部，OE码可填，选了匹配相同车型，OE码不可填
                      <Select onChange={this.handleChangeType}>
                        <Option value='code'>全部</Option>
                        <Option value='carmodel'>匹配相同车型</Option>
                      </Select>
                    )}
                  </FormItem>
                </Col>
                {
                  <Col span={4}>
                    <FormItem colon={false} label={<span className="c9">OE码:</span>}>
                      {getFieldDecorator('oem_partsku_code', {
                        initialValue: '',
                        // rules: [{ message: 'OE码只能为字母和数字以及，；分隔符', pattern: /^[\dA-Za-z+ ,，;；]+$/ }]
                        rules: [{ message: 'OE码最少包含一个字符', pattern: /[0-9A-Za-z\u4e00-\u9fa5]/g }]
                      })(
                        <Input placeholder='多个OE码用，或者；分隔' allowClear disabled={getFieldValue('type') === 'carmodel'} />
                      )}
                    </FormItem>
                  </Col>
                }

                <Col span={16}>
                  <FormItem>
                    <Button type='primary' onClick={this.handleSubmit}>查询</Button> <span className='f14 c9'>（参考条件：{descConfig[getFieldValue('type')]}）</span>
                  </FormItem>
                </Col>
              </Row>
            </Form>

            <Divider style={{ marginTop: 0, marginBottom: 15 }} />
            <Row justify="space-between">
              <Col span={12}>可合并的OE</Col>
              <Col span={12} className="text-right">
                <Button type='primary' disabled={selectedRows.length === 0} onClick={() => onMerge(getFieldsValue(), selectedRows, () => this.handleSelectedRows([]))}>批量合并</Button>
              </Col>
            </Row>

            {/* table 全部 */}
            {
              OEMSKU_MERGE_SELECT_TYPE === 'code' &&
              <Table {...tableProps} dataSource={list} />
            }

            {/* table 匹配相同车型 */}
            {
              OEMSKU_MERGE_SELECT_TYPE === 'carmodel' && list.length === 0 &&
              <Table {...tableProps} dataSource={[]} />
            }
            {
              OEMSKU_MERGE_SELECT_TYPE === 'carmodel' && list.length > 0 && list.map((v, index) => {
                return <div key={index}>
                  <Table
                    {...tableProps}
                    dataSource={v.oemList}
                    key={index}
                    title={() => (
                      <Row>
                        {
                          carPro.map((cm, idx) => {
                            return (
                              <span key={idx}><span className="c9">{v.carmodelInfo[idx]['cm_pro_name']}：</span>{v.carmodelInfo[idx][cm.cm_pro_column] || '-'}&emsp;</span>
                            );
                          })
                        }

                      </Row>
                    )}
                  />
                </div>;
              })
            }

          </Card>
        }
        {/* 不合并填写说明框 */}
        <Modal {...unMergeModelProps}>
          <TextArea rows={4} value={this.state.oe_unmerge_des} onChange={(e) => { this.setState({ oe_unmerge_des: e.target.value }); }} />
        </Modal>
      </>
    );
  }
}

export default Form.create()(IdOeMergeGroup);