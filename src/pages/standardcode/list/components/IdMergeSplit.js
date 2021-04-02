
import React, { Component } from 'react';
import { Form, Card, Select, Input, Row, Col, Button, Tooltip, Icon, Checkbox, Tag, Divider, Table, Modal, Radio, Badge } from 'antd';
import { getBytesLength, getCarmodelStatusColor } from '@/utils/tools';
import styles from './IdMergeSplit.less';
import classNames from 'classnames';
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const { TextArea } = Input;
const FormItem = Form.Item;
const { Option } = Select;
const OeTooltipTitle = <>
    <div><strong>两种模式：</strong></div>
    <div className="m-t-5">1. 保留关联关系，用于适应商户反馈；</div>
    <div className="m-t-5">2. 不保留关联关系，用于 OE通用性错误的情况。</div>
</>;

const tableProps = {
  className: 'm-t-15',
  bordered: true,
  pagination: false,
  rowKey: (item, index) => index
};

const modalProps = {
  destroyOnClose: true,
  maskClosable: false,
  footer: null
};
const opts_std = [
  { label: '标准码文字属性', value: 'copy_pros' },
  { label: '标准码属性图片 & 标准码产品图片', value: 'copy_images' },
];
const opts_oe = [
  { label: 'OE文字属性', value: 'copy_pros' },
  { label: 'OE属性图片 & OE产品图片', value: 'copy_images' },
];
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 }
};
const extra = <Row className="f12">
  <Col>
    <b>推&emsp;荐：</b>表示一个标准码匹配商户配件时，系统自动推荐另一个标准码覆盖的OE码。
  </Col>
  <Col>
    <b>不推荐：</b>表示一个标准码匹配商户配件时，另一个标准码不论通用度多高，系统都不推荐。
  </Col>
</Row>;
class IdMergeSplit extends Component {

    state = {
      oeSelectedRows: [], // 标准码所覆盖OE码 select项
      stdSelectedRows: [], // 合并标准码       select项
      splitModalVisible: false, // 拆分操作模态框
      updateOePropsModalVisible: false, // 更新OE属性为标准码属性模态框
      copyOePropsModalVisible: false, // 复制OE属性模态框
      commonConfigModalVisible: false // 代用设置模态框
    }

    handleSubmit = () => {
      const { form, onFetchStdskuMatch } = this.props;
      const { validateFields } = form;
      validateFields((err, values) => {
        if (!err) {
          onFetchStdskuMatch(values);
        }
      });
    };

    handleChange = e => {
      const { form, onFetchStdskuMatch } = this.props;
      const { setFieldsValue } = form;
      if(e === 'COMMON') {
        onFetchStdskuMatch();
        setFieldsValue({ code: '' });
      }
    };

    handleRowSelection = (key, rows) => {
      this.setState({ [key]: rows });
    }

    // 隐藏拆分模态框
    hideSplitModal = () => {
      this.setState({ splitModalVisible: false });
    }

    // 显示拆分模态框
    showSplitModal = () => {
      this.setState({ splitModalVisible: true });
    }

    // 隐藏更新OE属性为标准码属性 模态框
    hideOePropsModal = () => {
      this.setState({ updateOePropsModalVisible: false }); 
    }

    // 显示更新OE属性为标准码属性 模态框
    showOePropsModal = () => {
      this.setState({ updateOePropsModalVisible: true });
    }

    // 隐藏复制OE属性 模态框
    hideCopyOePropsModalModal = () => {
      this.setState({ copyOePropsModalVisible: false });
      // 清空select状态
      this.handleRowSelection('oeSelectedRows', []);
    }

    // 显示复制OE属性 模态框
    showCopyOePropsModalModal = row => {
      this.setState({ copyOePropsModalVisible: true });
      // 缓存oeSelectedRows状态
      this.handleRowSelection('oeSelectedRows', [row]);
    }

    // 隐藏代用设置　模态框
    hideCommonConfigModal = () => {
      this.setState({ commonConfigModalVisible: false });
    }

    // 显示代用设置　模态框
    showCommonConfigModal = () => {
      this.setState({ commonConfigModalVisible: true });
    }
    
    // 更新oe属性为标准码属性
    fetchStdskuOesku = () => {
      const { form, onFetchStdskuOesku, onFetchStdskuOe } = this.props;
      const { getFieldValue } = form;
      const { oeSelectedRows } = this.state;
      const stdsku_oesku_types = getFieldValue('stdsku_oesku_types');
      onFetchStdskuOesku(stdsku_oesku_types, oeSelectedRows, () => {
        // 隐藏模态框
        this.hideOePropsModal();
        // 清空select状态
        this.handleRowSelection('oeSelectedRows', []);
        // 重新获取标准码对应的oe信息
        onFetchStdskuOe(true);
      });
    }

    // 复制OE属性
    fetchOeskuStdsku = () => {
      const { form, onFetchOeskuStdsku, onFetchStdskuInfo } = this.props;
      const { getFieldValue } = form;
      const { oeSelectedRows } = this.state;
      const oesku_stdsku_types = getFieldValue('oesku_stdsku_types');
      onFetchOeskuStdsku(oesku_stdsku_types, oeSelectedRows, () => {
        // 隐藏模态框
        this.hideCopyOePropsModalModal();
        // 重新获取标准码信息
        onFetchStdskuInfo(true);
      });
    }
    

    // 标准码和oe拆分
    fetchStdsSkuOeSplit = () => {
      const { form, onFetchStdsSkuOeSplit, onFetchStdskuOe } = this.props;
      const { getFieldValue } = form;
      const { oeSelectedRows } = this.state;
      const stdsku_oe_split_type = getFieldValue('stdsku_oe_split_type');
      onFetchStdsSkuOeSplit(stdsku_oe_split_type, oeSelectedRows, () => {
        // 隐藏模态框
        this.hideSplitModal();
        // 清空select状态
        this.handleRowSelection('oeSelectedRows', []);
        // 重新获取标准码对应的oe信息
        onFetchStdskuOe(true);
      });
    }

    // 标准码合并
    fetchStdskuMerge = ()=> {
      const { onFetchStdskuMerge, onFetchStdskuOe } = this.props;
      const { stdSelectedRows } = this.state;
      onFetchStdskuMerge(stdSelectedRows, ()=> {
        // 清空select状态
        this.handleRowSelection('stdSelectedRows', []);
        // 重新获取标准码对应的oe信息
        onFetchStdskuOe(true);
      });
    }

    // 设置代用状态
    fetchStdskuMatchPost = () => {
      const { form, onFetchStdskuMatchPost, onFetchStdskuMatch } = this.props;
      const { getFieldsValue, setFieldsValue } = form;
      const { stdSelectedRows } = this.state;
      const fields = getFieldsValue();
      onFetchStdskuMatchPost(stdSelectedRows, fields, ()=> {
        // 清空select状态
        this.handleRowSelection('stdSelectedRows', []);
        // 隐藏模态框
        this.hideCommonConfigModal();
        // 获取合并标准码列表(设置完毕后，接口参数调用 代用状态 全部)
        onFetchStdskuMatch({
          type: 'MATCH',
          std_match_status: ''
        });
        setFieldsValue({type: 'MATCH', std_match_status: ''});
      }); 
        
    }

    render() {
      const { form, loading, STDSKU_INFO, STDSKU_OE, STDSKU_MATCH, CATEGORIES_FORBID, onPreviewImage, onRouteToOe, onRouteToStdSku, onShowFeedbackModal } = this.props;
      const { oeSelectedRows, stdSelectedRows, splitModalVisible, updateOePropsModalVisible, copyOePropsModalVisible, commonConfigModalVisible } = this.state;
      // 定义STDSKU_INFO别名
      const { data: stdsku_info = {} } = STDSKU_INFO;
      const { std_partsku_status = '' } = stdsku_info;
      // 定义STDSKU_OE别名
      const { data: stdsku_oe = [] } = STDSKU_OE;
      // 定义STDSKU_MATCH别名
      const { data: stdsku_match = [] } = STDSKU_MATCH;
      const { getFieldDecorator, getFieldValue } = form;
      const isLoading = loading['std_sku_id/fetchStdskuOe'] || loading['std_sku_id/std_sku_id/fetchStdskuMatch'];
      const type = getFieldValue('type');
      // 禁用项
      // const category_forbid_content = CATEGORIES_FORBID.filter(v => v.category_type_forbid_type === 'CONTENT');
      // const category_type_forbids = category_forbid_content.map(v => v.category_type_forbid_obj);
      // 标准码所覆盖OE码 列配置
      let columns = [{
        title: '车型品牌',
        dataIndex: 'cm_brand_name',
        key: 'cm_brand_name',
        width: 100,
        render: (text, record, index) => {
          return (
                    <>{ text || '-'}</>
          );
        }
      }, {
        title: 'OE码',
        dataIndex: 'oem_partsku_codes',
        key: 'oem_partsku_codes',
        width: 200,
        render: (text, record, index) => {
          return (
            <span className="cur link" onClick={ () => onRouteToOe(record.oem_partsku_id) }>
              {text.length > 0 ? text.map((v, idx) => <div key={idx}>{v}</div>) : '虚拟OE'}
            </span>
          );
        }
      }, {
        title: '产品属性',
        dataIndex: 'partsku_values',
        key: 'partsku_values',
        render: (text, record, index) => {
          const partsku_values = text.filter(v => v.category_pro_type !== 'IMAGE');
          const partsku_values_imgs = text.filter(v => v.category_pro_type === 'IMAGE');
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
      }, {
        title: '产品图片',
        dataIndex: 'partsku_images',
        key: 'partsku_images',
        width: 85,
        render: (text, record, index) => {
          const count = text.length > 1 ? text.length : 0; // 1张图不显示数量
          return (
                    <>
                        { text.length > 0 &&
                            <Badge count={count}><span className={classNames(styles['title-head-pic'], 'iconfont icon-photoa cur')} onClick={()=> onPreviewImage(text.map(v => v.oem_partsku_image_url))}></span></Badge>
                        }
                        {
                          text.length === 0 &&
                            '-'
                        }
                    </>
          );
        }
      }, {
        title: '创建人',
        dataIndex: 'create_origin',
        key: 'create_origin',
        width: 85,
      }, {
        title: '审核状态',
        dataIndex: 'oem_partsku_status',
        key: 'oem_partsku_status',
        width: 85,
        render: (text, record, index) => {
          const _className = getCarmodelStatusColor(text);
          return (
                    <>
                        {text === 'APPROVED' && <span className={_className}>审核通过</span>}
                        {text === 'PENDING' && <span className={_className}>待审核</span>}
                        {text === 'NONAPPROVED' && <span className={_className}>审核不通过</span>}
                    </>
          );
        }
      }, {
        title: '商户反馈',
        dataIndex: 'feedback',
        key: 'feedback',
        width: 120,
        render: (text, record, index) => {
          return (
                    <>
                    {
                      record.unsolve_count > 0 &&
                        <span className='blue6 cur' onClick={ () => onShowFeedbackModal(record) }>{record.unsolve_count + '条未查看'}</span>
                    }
                    {
                      record.solve_count > 0 &&
                        <span>{record.solve_count + '条已查看'}</span>
                    }
                    {
                      record.solve_count === 0 && record.unsolve_count === 0 &&
                        '-'
                    }
                    </>
          );
        }
      }, {
        title: '标准码属性',
        dataIndex: 'operation',
        key: 'operation',
        width: 120,
        render: (text, record, index) => {
          return (
            <span className="cur link" onClick={() => this.showCopyOePropsModalModal(record)}>复制OE属性</span>
          );
        }
      }];
        // 不显示category_type_forbids处理
        // .filter(v => v.key === 'partsku_images' ? !category_type_forbids.includes('CONTENT_SKU_PIC') : true);

      // 标准码 列配置
      const columns_1 = [{
        title: '产品',
        dataIndex: 'category_name',
        key: 'category_name',
      },{
        title: '标准码',
        dataIndex: 'std_partsku_code',
        key: 'std_partsku_code'
      },{
        title: '创建人',
        dataIndex: 'create_origin',
        key: 'create_origin'
      },{
        title: '创建时间',
        dataIndex: 'create_time',
        key: 'create_time',
      },{
        title: '更新时间',
        dataIndex: 'update_time',
        key: 'update_time',
      },{
        title: '数据状态',
        dataIndex: 'std_partsku_status',
        key: 'std_partsku_status',
        render: (text, record, index) => {
          switch (text) {
            case 'OPEN':
              return '开放共享';
            case 'PRIVATE':
              return '商户私有';
            case 'PENDING':
              return '待审核';
            default:
              break;
          }
        }
      }];

      const columns_2 = [{
        title: '标准码',
        dataIndex: 'std_partsku_code',
        key: 'std_partsku_code',
        width: 210,
        render: (text, record, index) => {
          return (
            <span className="cur link" onClick={ () => onRouteToStdSku(record.std_partsku_id) }>
              {text}
            </span>
          );
        }
      },{
        title: 'OE码',
        dataIndex: 'oem_partsku_codes',
        key: 'oem_partsku_codes',
        width: 180,
        render: (text = [], record, index) => {
          return (
                    <>{text.length > 0 && text.map((v, idx) => <div className={styles.code_row} key={idx}>{v}</div>)}</>
          );
        }
      },{
        title: '创建人',
        dataIndex: 'create_origin',
        key: 'create_origin',
        width: 70,
      },{
        title: '商户反馈',
        dataIndex: 'feedback',
        key: 'feedback',
        width: 120,
        render: (text, record, index) => {
          return (
                    <>
                    {
                      record.unsolve_count > 0 &&
                        <span>{record.unsolve_count + '条未查看'}</span>
                    }
                    {
                      record.solve_count > 0 &&
                        <span>{record.solve_count + '条已查看'}</span>
                    }
                    {
                      record.solve_count === 0 && record.unsolve_count === 0 &&
                        '-'
                    }
                    </>
          );
        }
      },{
        title: '更新时间',
        dataIndex: 'update_time',
        key: 'update_time',
        width: 100,
      },{
        title: '通用指数',
        dataIndex: 'std_match_number',
        key: 'std_match_number',
        width: 80,
      },{
        title: '通用状态',
        dataIndex: 'std_match_status',
        key: 'std_match_status',
        width: 80,
        render: (text, record, index) => {
          return (
                    <>
                    {
                      text === 'RECOMMEND' &&
                        <span>推荐</span>
                    }
                    {
                      text === 'NORECOMMEND' &&
                        <span>不推荐</span>
                    }
                    {
                      text !== 'RECOMMEND' && text !== 'NORECOMMEND' &&
                        '-'
                    }
                    </>
          );
        }
      },{
        title: '状态说明',
        dataIndex: 'std_match_desc',
        key: 'std_match_desc'
      }];

      const rowSelection_oe = {
        onChange: (selectedRowKeys, selectedRows) => {
          this.handleRowSelection('oeSelectedRows', selectedRows);
                
        },
        selectedRowKeys: this.state.oeSelectedRows.map(v => v.oem_partsku_id)
      };

      const rowSelection_std = {
        onChange: (selectedRowKeys, selectedRows) => {
          this.handleRowSelection('stdSelectedRows', selectedRows);
        },
        selectedRowKeys: this.state.stdSelectedRows.map(v => v.std_partsku_id)
      };

      return (
        <Card className={styles.content} loading={isLoading}>
          {/* 标准码所覆盖OE码 */}
          <Row type="flex" justify="space-between" gutter={8} className={styles.row_title}>
            <Col>
              <strong className="f16">标准码所覆盖OE码</strong>
            </Col>
            <Col>
              <Tooltip placement="leftTop" className="m-r-10 cur" title={'更新已勾选OE的属性和图片为标准码的属性和图片'}>
                <Icon type="info-circle-o" />
              </Tooltip>
              <Button className="m-r-15" type='primary' disabled={oeSelectedRows.length === 0} onClick={this.showOePropsModal}>更新OE属性为标准码属性</Button>
              <Tooltip placement="leftTop" className="m-r-10 cur" title={OeTooltipTitle}>
                <Icon type="info-circle-o" />
              </Tooltip>
              <Button type='primary' disabled={oeSelectedRows.length === 0} onClick={this.showSplitModal}>拆分</Button>
            </Col>
          </Row>
          <Table {...tableProps} scroll={{ y: 250 }} rowKey={record => record.oem_partsku_id} rowSelection={rowSelection_oe} dataSource={stdsku_oe} columns={columns} />

          {/* 标准码 */}
          <Row type="flex" justify="space-between" gutter={8} className={classNames(styles.row_title, 'm-t-15')}>
            <Col>
              <strong className="f16">标准码</strong>
            </Col>
          </Row>
          <Table {...tableProps} dataSource={[stdsku_info]} columns={columns_1} />
          <Row className="m-t-10">
            <Form layout="inline">
              {/* 通用指数(COMMON),自定义筛选(CUSTOM,如果是自定义一定要传oe码或者std码), */}
              {/* 默认条件：通用指数筛选，此时 后边的两个控件，以及“查询”按钮禁用 */}
              <FormItem label={<span className="c9">筛选条件</span>}>
                {getFieldDecorator('type', { 
                  initialValue: 'COMMON'
                })(
                  <Select style={{minWidth: 150}} onChange={this.handleChange} disabled={std_partsku_status === 'PENDING'}>
                    <Option value="COMMON">通用指数筛选</Option>
                    <Option value="CUSTOM">自定义筛选</Option>
                    <Option value="MATCH">代用状态</Option>
                  </Select>
                )}
              </FormItem>
              {
                type === 'MATCH' && 
                            <FormItem>
                              {getFieldDecorator('std_match_status', { 
                                initialValue: ''
                              })(
                                <Select style={{minWidth: 150}}>
                                  <Option value="">全部</Option>
                                  <Option value="RECOMMEND">推荐</Option>
                                  <Option value="NORECOMMEND">不推荐</Option>
                                </Select>
                              )}
                            </FormItem>
              }
              {   
                type === 'CUSTOM' && 
                            <>
                                <FormItem>
                                  {getFieldDecorator('code_type', { 
                                    initialValue: 'std_partsku_code',
                                    rules: [{ required: true, message: '必填项' }]
                                  })(
                                    <Select style={{minWidth: 150}}>
                                      <Option value="std_partsku_code">标准码</Option>
                                      <Option value="oem_partsku_code">OE码</Option>
                                    </Select>
                                  )}
                                </FormItem>
                                <FormItem>
                                  {getFieldDecorator('code', { 
                                    initialValue: '',
                                    // rules: [{ required: true, message: '必填项' }, { message: '只能为字母和数字', pattern: /^[\dA-Za-z]+$/}]
                                    rules: [{ required: true, message: '必填项' }]
                                  })(
                                    <Input placeholder="请输入" style={{width: 220}} allowClear/>
                                  )}
                                </FormItem>
                            </>
              }
              {
                (type === 'CUSTOM' || type === 'MATCH') &&
                            <FormItem>
                              <Button type="primary" onClick={this.handleSubmit}>查询</Button>
                            </FormItem>
              }
              <FormItem><span className="c9">提示：待审核状态的标准码禁止代用设置和通用合并操作</span></FormItem>
            </Form>
          </Row>
          <Divider style={{marginTop:10, marginBottom: 10}}/>

          {/* 合并标准码 */}
          <Row type="flex" justify="space-between" gutter={8} className={classNames(styles.row_title, 'm-t-15')}>
            <Col>
              <strong className="f16">合并标准码</strong>
            </Col>
            <Col>
                        
              <Button className="m-r-15" type='primary' ghost disabled={ stdSelectedRows.length === 0 || std_partsku_status === 'PENDING' }　onClick={this.showCommonConfigModal}>代用设置</Button>
              <Button type='primary' ghost disabled={ stdSelectedRows.length === 0 || std_partsku_status === 'PENDING' } onClick={this.fetchStdskuMerge}>通用合并</Button>
            </Col>
          </Row>
          <Table scroll={{ y: 250 }} {...tableProps} rowKey={record => record.std_partsku_id} rowSelection={rowSelection_std} dataSource={stdsku_match} columns={columns_2} />

          {/* 模态框 */}
          {/* 拆分 模态框 */}
          <Modal title='选择拆分模式' {...modalProps} visible={splitModalVisible} onCancel={this.hideSplitModal}>
            {getFieldDecorator('stdsku_oe_split_type', { 
              initialValue: ''
            })(
              <RadioGroup>
                <Radio value={'KEEP'}><b>保留关联关系</b></Radio>
                <div className={styles.radio_list}>
                  <div>1. 删除 拆分出的OE码与反馈商户之间记录的排除关联关系；</div>
                  <div>2. 创建新标准码关联到 未反馈并且关联当前标准码的商品。</div>
                </div>
                <Radio value={'DELETE'} className="m-t-5"><b>不保留关联关系</b></Radio>
                <div className={styles.radio_list}>
                  <div>1. 删除拆分出的OE码与商户产品的过滤关系记录；</div>
                  <div>2. 创建新的标准码，关联拆分出的OE</div>
                </div>
              </RadioGroup>
            )}
            <div className="text-center m-t-10">
              <Button type="primary" disabled={!getFieldValue('stdsku_oe_split_type')} onClick={this.fetchStdsSkuOeSplit}>执行拆分操作</Button>
            </div>
          </Modal>
          {/* 更新OE属性为标准码属性 模态框 */}
          <Modal title='更新OE属性为标准码属性' {...modalProps} visible={updateOePropsModalVisible} onCancel={this.hideOePropsModal}>
            {getFieldDecorator('stdsku_oesku_types', { 
              initialValue: []
            })(
              <CheckboxGroup style={{ width: '100%' }}>
                <Row>
                  {
                    opts_std.map((opt, optIdx) => <Col span={optIdx === 0 ? 8 : 14} key={optIdx}><Checkbox value={opt.value}><strong>{opt.label}</strong></Checkbox></Col>)
                  }
                </Row>
              </CheckboxGroup>
            )}
                    
            <div className="m-t-5">可根据实际情况需要，选择单独复制属性，图片，或二者都复制。</div>
            <div className="m-t-5">目的：方便补充标准码下的OE属性和图片，不用逐个OE编辑属性，上传图片。</div>
            <div className="text-center m-t-10">
              <Button type="primary" disabled={getFieldValue('stdsku_oesku_types').length === 0} onClick={this.fetchStdskuOesku}>执行更新操作</Button>
            </div>
          </Modal>
          {/* 更新OE属性为标准码属性 模态框 */}
          <Modal title='复制OE属性' {...modalProps} visible={copyOePropsModalVisible} onCancel={this.hideCopyOePropsModalModal}>
            {getFieldDecorator('oesku_stdsku_types', { 
              initialValue: []
            })(
              <CheckboxGroup style={{ width: '100%' }} onChange={()=> {}}>
                <Row>
                  {
                    opts_oe.map((opt, optIdx) => <Col span={optIdx === 0 ? 8 : 14} key={optIdx}><Checkbox value={opt.value}><strong>{opt.label}</strong></Checkbox></Col>)
                  }
                </Row>
              </CheckboxGroup>
            )}
            <div className="m-t-10">可根据实际情况需要，选择单独复制属性，图片，或二者都复制。</div>
            <div className="m-t-10">目的：当OE已经有属性或图片的场合，标准码的属性和图片可以直接复制OE的属性和图片。</div>
            <div className="text-center m-t-10">
              <Button type="primary" disabled={getFieldValue('oesku_stdsku_types').length === 0} onClick={this.fetchOeskuStdsku}>执行更新操作</Button>
            </div>
          </Modal>

          {/* 设置通用状态模态框 */}
          <Modal title='设置标准码通用状态' {...modalProps} visible={commonConfigModalVisible} onCancel={this.hideCommonConfigModal}>
            <Form layout="horizontal">
              <FormItem label="通用关系" {...formItemLayout} extra={extra}>
                {getFieldDecorator('std_match_status', {
                  initialValue: 'RECOMMEND'
                })(
                  <Select>
                    <Option value="RECOMMEND">推荐</Option>
                    <Option value="NORECOMMEND">不推荐</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label="状态说明" {...formItemLayout}>
                {getFieldDecorator('std_match_desc', {
                  initialValue: ''
                })(
                  <TextArea rows={4} placeholder="请输入50个汉字以内的内容" />
                )}
              </FormItem>
              <FormItem colon={false} label=" " {...formItemLayout}>
                <Button type="primary"　disabled={getBytesLength(getFieldValue('std_match_desc')) > 100} onClick={this.fetchStdskuMatchPost}>确认</Button>
              </FormItem>
            </Form>
          </Modal>
        </Card>
      );
    }
}

export default Form.create()(IdMergeSplit);