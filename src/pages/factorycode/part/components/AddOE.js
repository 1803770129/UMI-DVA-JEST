import React from 'react';
import { Row, Col, Input, Button, Table, Form, Popover, Icon } from 'antd';
import msg from '@/utils/msg';
import { getPartskuValues } from '@/utils/tools';
import styles from '../$id.less';
import classNames from 'classnames';
const InputGroup = Input.Group;
const FormItem = Form.Item;

// 通过OE码添加
const AddOE = props => {
  const { form, loading, carmodelOEFormatList, fmsCategoryProps, selectedRowKeys, onHandleSubmitByOEFn, onGoOEDetailFn, onPreviewImage, onChangeSelectedRow } = props;
  const { getFieldDecorator, validateFields } = form;
  // 点击查询
  const handleSubmit = e => {
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        onHandleSubmitByOEFn(values.oeCode.toUpperCase());
      } else {
        msg('出错啦，请重试');
      }
    });
  };

  // 列表标题
  const columns = [
    { title: 'OE信息', dataIndex: 'oe', width: 450 },
    { title: '适配车型', dataIndex: 'carmodel' }
  ];

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

  // 表格渲染格式化
  tableProps.columns.forEach(item => {
    item.render = (text, record, index) => {
      if (item.dataIndex == 'oe') {
        const { partsku_values, partsku_values_img } = getPartskuValues(fmsCategoryProps, record);
        const partsku_values_list = [...partsku_values, ...partsku_values_img];
        // OE信息
        return (
          <React.Fragment>
            <div>OE码：{record.info.oeCode}</div>
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
            {
              record.info.create_type == 'TENTENT' && record.info.oem_partsku_status == 'PENDING' &&
              <div className="red5">（此OE码暂未收录，可点击右侧链接“<span className='blue6 cur'>编辑OE码</span>”进行编辑）</div>
            }
          </React.Fragment>
        );
      } else {
        // 车型
        return (
          <React.Fragment>
            <div className='pull-left'>{text}</div>
            {
              record.search_cms.length > 1 &&
              <Popover
                placement="right"
                content={
                  record.search_cms.map((itm, idx) => <div key={idx}>{itm.cm_brand} {itm.cm_factory} {itm.cm_model} {itm.cm_model_year || ''} 款 {itm.cm_displacement || ''} {itm.cm_sales_year || ''} - {itm.cm_stop_year || ''} </div>)
                }
              >
                <span className="m-r-5">{record.carmodelInfo}</span>
                <Icon type='info-circle' className='cur gray' ></Icon>
              </Popover>
            }
            {
              record.info.create_type == 'TENTENT' && record.info.oem_partsku_status == 'PENDING' &&
              <div className='blue6 cur pull-right' onClick={() => onGoOEDetailFn(record.info.oem_partsku_id)}>编辑OE码</div>
            }
          </React.Fragment>
        );
      }
    };
  });

  return (
    <Form className={styles.addOE} layout="inline" onSubmit={e => { handleSubmit(e); }}>
      {/* 输入框 */}
      <Row>
        <Col span={12} offset={6}>
          <InputGroup>
            <Col span={12}>
              <FormItem>
                {
                  getFieldDecorator('oeCode', {
                    rules: [{ required: true, message: '请输入' }],
                    initialValue: []
                  })(
                    <Input style={{ width: '280px' }} placeholder="精确查询,请输入完整OE码" addonBefore="OE码：" />
                  )
                }
              </FormItem>
            </Col>
            <Col span={12}>
              <Button type="primary" htmlType="submit">查询</Button>
              <span className="gray m-l-15">精确查询,请输入完整OE码</span>
            </Col>
          </InputGroup>
        </Col>
      </Row>

      {/* 匹配表格 */}
      <Table {...tableProps} dataSource={carmodelOEFormatList} />
    </Form>
  );
};

const AddOEForm = Form.create()(AddOE);
export default AddOEForm;