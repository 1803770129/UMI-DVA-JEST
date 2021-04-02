import React from 'react';
import { Row, Form, Input, Button, Table, Tooltip, Icon, Modal, Divider } from 'antd';
import styles from './AddEngineoilSae.less';
import classNames from 'classnames';
const FormItem = Form.Item;
const confirm = Modal.confirm;
const regexp = /^[\d]+$/;

const AddEngineoilSae = ({ form, loading, modalType, CARMODEL_ENGINEOIL_SAE, cm_id, onFetchCarmodelEngineoilSaeAdd,onFetchCarmodelEngineoilSaeUpdate, onFetchCarmodelEngineoilSaeDel, onUpdateCarmodelEngineoilSae }) => {
  const { getFieldDecorator, setFields, getFieldsValue, setFieldsValue } = form;
  const Operator = JSON.parse(localStorage.getItem('account'));
  // 添加标准车型机油等级(此处form的继承设计不合理，暂时先手动验证表单)
  const handleSubmit = () => {

    const values = getFieldsValue();
    const { cm_engineoil_sae, cm_engineoil_index } = values;
    if(!cm_engineoil_sae) {
      return setFields({
        cm_engineoil_sae: {
          value: '',
          errors: [new Error('必填')]
        },
      });
    }else if(!cm_engineoil_index) {
      return setFields({
        cm_engineoil_index: {
          value: '',
          errors: [new Error('必填')]
        },
      });
    }else if(!regexp.test(cm_engineoil_index)) {
      return false;
    }else{
      if(modalType === 'add') {
        // 添加标准车型
        onUpdateCarmodelEngineoilSae('add', { cm_engineoil_sae, cm_engineoil_index ,  cm_engineoil_sae_id: new Date().getTime() });
      }else{
        // 编辑标准车型
        onFetchCarmodelEngineoilSaeAdd({
          cm_id, cm_engineoil_sae, cm_engineoil_index
        });
      }
      // 清空表单
      setFieldsValue({
        cm_engineoil_sae: '',
        cm_engineoil_index: ''
      });
    }
  };

  // 更新标准车型机油等级(此处form的继承设计不合理，暂时先手动验证表单)
  const handleUpdate = (cm_engineoil_sae_id, cm_id, index,row) => {
    const values = getFieldsValue();
    const cm_engineoil_sae = values['cm_engineoil_sae_' + cm_engineoil_sae_id];
    const cm_engineoil_index = values['cm_engineoil_index_' + cm_engineoil_sae_id];
    if(!cm_engineoil_sae) {
      return setFields({
        ['cm_engineoil_sae_' + cm_engineoil_sae_id]: {
          value: '',
          errors: [new Error('必填')]
        },
      });
    }else if(!cm_engineoil_index) {
      return setFields({
        ['cm_engineoil_index_' + cm_engineoil_sae_id]: {
          value: '',
          errors: [new Error('必填')]
        },
      });
    }else if(!regexp.test(cm_engineoil_index)) {
      return false;
    }else{
      // 重置错误状态
      setFields({
        ['cm_engineoil_sae_' + cm_engineoil_sae_id]: {
          value: cm_engineoil_sae
        },
        ['cm_engineoil_index_' + cm_engineoil_sae_id]: {
          value: cm_engineoil_index
        },
      });
    }
    console.log();
    const params = {
      cm_engineoil_sae,
      cm_engineoil_index,
      cm_engineoil_sae_id,
      cm_engineoil_sae_old: row.cm_engineoil_sae,
      cm_engineoil_index_old:row.cm_engineoil_index ,
      cm_id
    };
    // 编辑标准车型
    onFetchCarmodelEngineoilSaeUpdate(params);

  };

  // 删除标准车型机油等级
  const handleDel = (cm_engineoil_sae_id, cm_id, index,row) => {

    confirm({
      title: '确认删除？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        if(modalType === 'add') {
          // 添加标准车型
          onUpdateCarmodelEngineoilSae('del', null, index);
        }else{
          console.log(row);
          // 编辑标准车型   ,
          onFetchCarmodelEngineoilSaeDel({ cm_engineoil_sae_id, cm_id , cm_engineoil_sae_old: row.cm_engineoil_sae, cm_engineoil_index_old:row.cm_engineoil_index });
        }

      }
    });
  };

  const columns = [
    {
      title: '车型发动机油SAE值',
      dataIndex: 'cm_engineoil_sae',
      render: (text, row, index) => {
        const { cm_engineoil_sae_id } = row;
        return (
          <FormItem>
            {
              modalType !== 'add' ? getFieldDecorator('cm_engineoil_sae_' + cm_engineoil_sae_id, {
                initialValue: text,
              })(
                <Input size="small"  autocomplete="off" />
              ) : <>{text}</>
            }
          </FormItem>
        );
      }
    },
    {
      title: '发动机油SAE优先级',
      dataIndex: 'cm_engineoil_index',
      render: (text, row, index) => {
        const { cm_engineoil_sae_id } = row;
        return (
          <FormItem>
            {
              modalType !== 'add' ? getFieldDecorator('cm_engineoil_index_' + cm_engineoil_sae_id, {
                initialValue: text,
                rules: [{ message: '只能数字', pattern: regexp},{ pattern: '^.{0,3}$', message: '超过限定值'}]
              })(
                <Input size="small"  autocomplete="off" />
              ) : <>{text}</>
            }
          </FormItem>
        );
      }
    },
    {
      title: <>操作 {modalType !== 'add' && <Tooltip placement="topLeft" title="注意：整行更新">
        <Icon type="info-circle-o" />
      </Tooltip>}</>,
      dataIndex: 'operating',
      render: (text, row, index) => {
        const { cm_engineoil_sae_id, cm_id } = row;
        return (
          <FormItem>
            {
              modalType !== 'add' &&
              <>
                <Button type="primary" size="small" ghost onClick={() => handleUpdate(cm_engineoil_sae_id, cm_id, index,row)}>更新</Button>
                <Divider type="vertical" />
              </>
            }
            <Button type="danger" size="small" ghost onClick={() => handleDel(cm_engineoil_sae_id, cm_id, index,row)}>删除</Button>
          </FormItem>
        );
      }
    },
  ];
  return (
    <>
    <Row className={styles.search_form}>
      <FormItem label="车型发动机油SAE值">
        {
          getFieldDecorator('cm_engineoil_sae', {
            initialValue: '',
          })(
            <Input  autocomplete="off" />
          )
        }
      </FormItem>
      <FormItem label="发动机油SAE优先级">
        {
          getFieldDecorator('cm_engineoil_index', {
            initialValue: '',
            rules: [{ message: '只能数字', pattern: regexp},{ pattern: '^.{0,3}$', message: '超过限定值'}]
          })(
            <Input  autocomplete="off" />
          )
        }
      </FormItem>
      <FormItem>
        <Button type="primary" onClick={handleSubmit}>添加机油粘度</Button>
      </FormItem>
    </Row>
    <Row className={classNames(styles.table_content, 'm-t-15')}>
      <Table bordered pagination={false} loading={modalType !== 'add' && loading['baseorigin_id/fetchCarmodelEngineoilLevel']} rowKey={v => v.cm_engineoil_sae_id} dataSource={CARMODEL_ENGINEOIL_SAE} columns={columns} />
    </Row>
    </>
  );
};

export default Form.create()(AddEngineoilSae);
