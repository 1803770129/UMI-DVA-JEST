import React from 'react';
import { Form, Modal, Table, Select, Button, Input } from 'antd';
import UploadSingle from '@/components/UploadSingle';
const FormItem = Form.Item;
const Option = Select.Option;

export default props => {

  const {
    configSubmitInfo,
    carmodelBrandInfo,
    modalVisible,
    onHandleConfirmModalFn,
    onHandleDisplayModalFn,
    onUpdateConfigSubmitInfoFn,
    onUpdateCarmodelBrandInfoFn,
    saveUploadFileFn,
    onChangeIndexFn
  } = props;

  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 18 },
    style: { marginBottom: 10 }
  };

  // 点击删除
  const deleteCarmodelFn = cm_factory_id => {
    // 更新要提交的数据
    let del_cm_factory_ids = [...configSubmitInfo.del_cm_factory_ids];
    del_cm_factory_ids.push(cm_factory_id);
    onUpdateConfigSubmitInfoFn({...configSubmitInfo, del_cm_factory_ids});
    // 更新要展示的数据
    let newFactory = carmodelBrandInfo.cm_factorys.filter(item => item.cm_factory_id != cm_factory_id);
    onUpdateCarmodelBrandInfoFn({...carmodelBrandInfo, cm_factorys: newFactory});
  };

  const columns = [
    { title: '名称', dataIndex: 'cm_factory_name' },
    {
      title: '排列顺序',
      dataIndex: 'cm_factory_index',
      width: 90,
      render: (text, record, index) => <Input defaultValue={record.cm_factory_index} onChange={e => onChangeIndexFn(record.cm_factory_id, e.target.value)} />
    },
    { title: '车型数', dataIndex: 'count', width: 100 },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 100,
      render: (text, record, index) => record.count == 0 ? <span className="blue6 cur" onClick={() => deleteCarmodelFn(record.cm_factory_id)}>删除</span> : ''
    }
  ];

  const modalProps = {
    title: '车型品牌设置',
    visible: modalVisible,
    closable: true,
    width: 800,
    onCancel: () => onHandleDisplayModalFn(),
    footer: [
      <Button key='cancle' onClick={ () => {onHandleDisplayModalFn();}}>取消</Button>,
      <Button key='ok' type='primary' onClick={ () => {onHandleConfirmModalFn();}}>确定</Button>
    ]
  };

  const tableProps = {
    className: 'm-t-15',
    bordered: true,
    dataSource: carmodelBrandInfo.cm_factorys,
    columns,
    rowKey: (item, index) => index,
    pagination: false
  };

  // 切换热门/普通
  const handleFlagFn = flag => onUpdateConfigSubmitInfoFn({...configSubmitInfo, cm_hot_flag: flag});

  // 切换车系国别
  const handleCountry = flag => onUpdateConfigSubmitInfoFn({...configSubmitInfo, cm_brand_country: flag});

  // 切换品牌禁用状态
  const handleStatus = flag => onUpdateConfigSubmitInfoFn({...configSubmitInfo, cm_brand_status: flag});


  return (
    <Modal {...modalProps}>
      <Form>
        <FormItem label="品牌名称：" {...formItemLayout}>
          <strong>{carmodelBrandInfo.cm_brand_name}</strong>
        </FormItem>
        <FormItem label="车系国别" {...formItemLayout}>
          <Select style={{width: 150}} value={configSubmitInfo.cm_brand_country} onChange={e => handleCountry(e)} placeholder="请选择">
            {/* <Option key="1" value="国产车系">国产车系</Option>
            <Option key="2" value="欧美车系">欧美车系</Option>
            <Option key="3" value="日韩车系">日韩车系</Option>
            <Option key="4" value="">暂停使用</Option> */}
            <Option key={1} value="国产">国产</Option>
            <Option key={2} value="日系">日系</Option>
            <Option key={3} value="韩系">韩系</Option>
            <Option key={4} value="欧系">欧系</Option>
            <Option key={5} value="美系">美系</Option>
          </Select>
        </FormItem>
        <FormItem label="品牌禁用状态" {...formItemLayout}>
          <Select style={{width: 150}} value={configSubmitInfo.cm_brand_status} onChange={e => handleStatus(e)} placeholder="请选择">
            <Option key={'ENABLE'} value="ENABLE">启用</Option>
            <Option key={'DISABLE'} value="DISABLE">禁用</Option>
          </Select>
        </FormItem>
        <FormItem label="logo图片：" {...formItemLayout} extra={<span className="red6">建议尺寸 120 * 120 px</span>}>
          {
            carmodelBrandInfo.cm_brand_image_url != undefined &&
            <UploadSingle
              imageUrl={carmodelBrandInfo.cm_brand_image_url}
              saveUploadFileFn={saveUploadFileFn}
            />
          }

        </FormItem>
        <FormItem label="品牌标识" {...formItemLayout}>
          <Select style={{width: 150}} value={configSubmitInfo.cm_hot_flag} onChange={e => handleFlagFn(e)}>
            <Option key="1" value="HOT">热门</Option>
            <Option key="2" value="NORMAL">普通</Option>
          </Select>
        </FormItem>
        <FormItem label="主机厂" {...formItemLayout}>
          <Table {...tableProps}></Table>
        </FormItem>
      </Form>
    </Modal>
  );
};
