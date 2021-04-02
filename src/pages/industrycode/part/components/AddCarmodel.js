import { Button, Form, Table, Cascader, Row, Col, Icon, Popover } from 'antd';
import msg from '@/utils/msg';
import InputClose from '@/components/InputClose';
import { getPartskuValues } from '@/utils/tools';
import classNames from 'classnames';
import styles from '../$id.less';
const FormItem = Form.Item;

const AddCarmodel = props => {
  const { form, loading, carmodelApprovedList, carmodelParamsFormatList, fmsCategoryProps, selectedRowKeys, onHandleSubmitByParamsFn, onGoOEDetailFn, onPreviewImage, onChangeSelectedRow } = props;

  const { getFieldDecorator, setFieldsValue, getFieldValue, validateFields } = form;

  // 提交查询按钮
  const handleSubmit = e => {
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        onHandleSubmitByParamsFn(values);
      } else {
        msg('出错啦，请重试');
      }
    });
  };

  const columns = [
    {
      title: 'OE信息',
      dataIndex: 'oeInfo',
      width: 450,
      render: (text, record, index) => {
        const { partsku_values, partsku_values_img } = getPartskuValues(fmsCategoryProps, record);
        const partsku_values_list = [...partsku_values, ...partsku_values_img];
        return (
          <div>
            {
              record.info.oeCode == '' && <span className="blue6 cur" onClick={() => onGoOEDetailFn(record.info.oem_partsku_id)}>点击查看</span>
            }
            {
              record.info.oeCode != '' && <div>OE码：{record.info.oeCode}</div>
            }
            {/* 产品属性 */}
            <div>
              {
                partsku_values_list.map((v, vIdx) => {
                  const { oem_partsku_value, category_pro_name, category_pro_unit, oem_partsku_image_url } = v;
                  if (oem_partsku_image_url) {
                    return <span key={vIdx}><span className="vm">{category_pro_name}：</span><span className={classNames(styles['title-head-img'], 'iconfont icon-photoa cur vm')} onClick={() => onPreviewImage([oem_partsku_image_url])}></span></span>;
                  } else {
                    return <span key={vIdx}>{category_pro_name}：{oem_partsku_value}{category_pro_unit && `(${category_pro_unit})`} </span>;
                  }
                })
              }
            </div>
          </div>
        );
      }
    },
    {
      title: '适配车型',
      dataIndex: 'carmodel',
      render: (text, record, index) => {
        return (
          record.search_cms.length !== 0 &&
          <Popover
            placement="right"
            content={
              record.carmodel.map((itm, idx) => <div key={idx}>{itm.cm_brand} {itm.cm_factory} {itm.cm_model} {itm.cm_model_year || ''} 款 {itm.cm_displacement || ''} {itm.cm_sales_year || ''} - {itm.cm_stop_year || ''} </div>)
            }
          >
            <span className="m-r-5">{record.carmodelInfo}</span>
            <Icon type='info-circle' className='cur gray' ></Icon>
          </Popover>
        );
      }
    }
  ];

  // 车型搜索过滤
  const handleCarmodelFilter = (inputValue, selectedOptions) => selectedOptions.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase().trim()) > -1);

  const tableProps = {
    loading,
    className: 'm-t-15',
    bordered: true,
    pagination: false,
    rowKey: 'std_partsku_id',
    columns,
    rowSelection: {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        onChangeSelectedRow(selectedRowKeys);
      }
    }
  };

  return (
    <div className="add-carmodel">
      <Form layout="inline" onSubmit={e => { handleSubmit(e); }}>
        <Row type="flex" align="middle" justify="space-between">
          <Col>
            <FormItem label="品牌/主机厂/车型">
              {
                getFieldDecorator('brandFacModelList', {
                  rules: [{ required: true, message: '请选择' }],
                  initialValue: []
                })(
                  <Cascader
                    options={carmodelApprovedList}
                    placeholder="请选择"
                    showSearch={{ filter: handleCarmodelFilter, limit: false }}
                    changeOnSelect={false}
                    style={{ width: 450 }}
                    fieldNames={{ label: 'label', value: 'v', children: 'c' }}
                  />
                )
              }
            </FormItem>

            <FormItem label="年款">
              {
                getFieldDecorator('cm_model_year')(
                  <div style={{ width: 120 }}>
                    <InputClose onClear={() => setFieldsValue({ 'cm_model_year': '' })} field={getFieldValue('cm_model_year')} />
                  </div>
                )
              }
            </FormItem>

            <FormItem label="排量">
              {
                getFieldDecorator('cm_displacement')(
                  <div style={{ width: 120 }}>
                    <InputClose onClear={() => setFieldsValue({ 'cm_displacement': '' })} field={getFieldValue('cm_displacement')} />
                  </div>
                )
              }
            </FormItem>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit">查询</Button>
          </Col>
        </Row>
      </Form>
      <Table
        {...tableProps}
        scroll={carmodelParamsFormatList.length > 5 ? { y: 300 } : {}}
        dataSource={carmodelParamsFormatList}
      />
    </div>
  );
};

const AddCarmodelForm = Form.create()(AddCarmodel);
export default AddCarmodelForm;
