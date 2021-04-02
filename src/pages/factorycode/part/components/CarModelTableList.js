import React from 'react';
import { Row, Col, Table } from 'antd';
import classNames from 'classnames';
import styles from '../$id.less';

export default ({ fmsCarmodelList, onHandleDeleteFmsCarmodelFn, onPreviewImage }) => {

  const columns = [
    { title: '品牌', dataIndex: 'cm_brand', width: 200 },
    { title: '主机厂', dataIndex: 'cm_factory', width: 200 },
    { title: '车型', dataIndex: 'cm_model' },
    { title: '年款', dataIndex: 'cm_model_year' },
    { title: '排量', dataIndex: 'cm_displacement' },
    { title: '其他属性', dataIndex: 'cm_other' }
  ];

  const TitleHeader = ({ std_partsku_id, oem_partsku_codes, oem_partsku_vals, matchFlag, partsku_values, partsku_values_img }) => {
    const partsku_values_list = [...partsku_values, ...partsku_values_img];
    return (
      <Row type="flex" justify="space-between" align="middle">
        <Col span={16}>
          <div><strong>OE码：</strong>{oem_partsku_codes.join('，')}</div>
          {/* 产品属性 */}
          <div>
            <strong className="vm">属性：</strong>
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
        </Col>
        <Col span={8} className="text-right">
          <div className="blue6 cur" onClick={() => onHandleDeleteFmsCarmodelFn(std_partsku_id)}>删除</div>
          {
            matchFlag == 'unmatch' &&
            <div className="red5">系统提醒：OE配件尺寸与产品基本属性信息不一致，可能不适配</div>
          }
        </Col>
      </Row>
    );
  };

  const tableProps = {
    className: 'm-t-15',
    bordered: true,
    pagination: false,
    columns
  };

  return (
    <React.Fragment>
      {/* 有数据时 */}
      {
        fmsCarmodelList.length !== 0 &&
        fmsCarmodelList.map((item, index) => {
          return (
            <Table
              {...tableProps}
              key={index}
              dataSource={item.carmodelList}
              rowKey={(itm, idx) => idx}
              title={() => <TitleHeader
                std_partsku_id={item.std_partsku_id}
                oem_partsku_codes={item.oem_partsku_codes}
                oem_partsku_vals={item.oem_partsku_vals}
                matchFlag={item.matchFlag}
                partsku_values={item.partsku_values}
                partsku_values_img={item.partsku_values_img}
              />}
            />
          );
        })
      }
      {/* 无数据时 */}
      {
        fmsCarmodelList.length === 0 &&
        <Table {...tableProps} dataSource={[]} />
      }
    </React.Fragment>
  );
};