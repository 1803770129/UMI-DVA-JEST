import React from 'react';
import { Row, Col, Button, Affix, Checkbox } from 'antd';
import router from 'umi/router';


// OE管理 - 底部保存按钮
export default ({PAGE_TYPE, OE_INFO, OE_INFO_FIELDS, form = {}, onSubmit, onOemskuApprove, onOemskuDelete, onshowSaveApproveModal}) => {
  const { data = {} } = OE_INFO;
  const{ oem_partsku_status, create_type } = data;    
  const { getFieldDecorator } = form;
  return (
    <Affix offsetBottom={0}>
      <Row type="flex" align="middle" justify="space-between" style={{padding: '15px 32px 15px 0', background: 'rgba(255,255,255, 0.1)'}}>
        <Col></Col>
        <Col>
          <span className="m-r-10">
            {
              getFieldDecorator && getFieldDecorator('std_pic_pro', {
                initialValue: OE_INFO_FIELDS.std_pic_pro
              })(
                <Checkbox>同步标准码属性和图片</Checkbox>
              )
            }
          </span>

          {/* 保存 */}
          <Button type="primary" onClick={ () => onSubmit('save') }  disabled={false}>保存</Button>
                    
          {/* 保存并审核 */}
          {oem_partsku_status !== 'NONAPPROVED' &&  <Button type="primary" onClick={ onshowSaveApproveModal } className="m-l-15" disabled={false}>保存并审核</Button>}

          {/* 审核通过 - 【编辑】 */}
          {/* {(PAGE_TYPE === 'edit' && oem_partsku_status === 'PENDING') && <Button type="primary" onClick={ () => onOemskuApprove('APPROVED') } className="m-l-15">审核通过</Button>}  */}
                    
          {/* 审核不通过 - 【编辑 && 状态不能为审核通过 && 创建人不为1（系统）】 oem_partsku_status != 'APPROVED' create_type != 'SYSTEM'*/}
          {
            PAGE_TYPE === 'edit' && 
                        oem_partsku_status !== 'APPROVED' && 
                        create_type !== 'SYSTEM' && 
                        <Button type="danger" onClick={ () => onOemskuApprove('NONAPPROVED') } className="m-l-15">审核不通过</Button>
          }

          {/* 删除 - 【编辑】 */}
          {PAGE_TYPE === 'edit' && <Button type="danger" onClick={ onOemskuDelete } className="m-l-15">删除</Button>}

          {/* 返回上一页 */}
          <Button type="primary" ghost onClick={ () => router.goBack() } className="m-l-15">返回上一页</Button>
        </Col>
      </Row>
    </Affix>
  );
};