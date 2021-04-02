import React from 'react';
import { Row, Form, Input, Button, Table, Tooltip, Icon, Modal, Divider } from 'antd';
import styles from './AddEngineoilLevel.less';
import classNames from 'classnames';
const FormItem = Form.Item;
const confirm = Modal.confirm;

const AddEngineoilLevel = ({ form, loading, modalType, CARMODEL_ENGINEOIL_LEVEL, cm_id, onFetchCarmodelEngineoilLevelAdd, onFetchCarmodelEngineoilLevelUpdate, onFetchCarmodelEngineoilLevelDel, onUpdateCarmodelEngineoilLevel }) => {
  const { getFieldDecorator, setFields, getFieldsValue, setFieldsValue } = form;
  // 添加标准车型机油等级
  const handleSubmit = () => {
    const values = getFieldsValue();
    const { cm_engineoil_level_author, cm_engineoil_level_factory, cm_engineoil_level_value, cm_engineoil_level_desc } = values;
    // 同时保证 cm_engineoil_level_author，cm_engineoil_level_value 有值，或者cm_engineoil_level_factory，cm_engineoil_level_value 有值
    if (!cm_engineoil_level_value) {
      return setFields({
        cm_engineoil_level_value: {
          value: '',
          errors: [new Error('认证等级值必填')]
        },
      });
    } else if (!cm_engineoil_level_author) {
      return setFields({
        cm_engineoil_level_author: {
          value: '',
          errors: [new Error('认证机构必填')]
        },
      });
    } else {
      if (modalType === 'add') {
        // 添加标准车型
        onUpdateCarmodelEngineoilLevel('add', { cm_engineoil_level_author, cm_engineoil_level_factory, cm_engineoil_level_value, cm_engineoil_level_desc, cm_engineoil_level_id: new Date().getTime() });
      } else {
        // 编辑标准车型
        onFetchCarmodelEngineoilLevelAdd({
          cm_id, cm_engineoil_level_author, cm_engineoil_level_factory, cm_engineoil_level_value, cm_engineoil_level_desc
        });
      }
      // 清空表单
      setFieldsValue({
        cm_engineoil_level_author: '',
        cm_engineoil_level_factory: '',
        cm_engineoil_level_value: '',
        cm_engineoil_level_desc: '',
      });
    }


  };

  // 更新标准车型机油等级
  const handleUpdate = (cm_engineoil_level_id, cm_id, index) => {
    const values = getFieldsValue();
    const cm_engineoil_level_author = values['cm_engineoil_level_author_' + cm_engineoil_level_id];
    const cm_engineoil_level_factory = values['cm_engineoil_level_factory_' + cm_engineoil_level_id];
    const cm_engineoil_level_value = values['cm_engineoil_level_value_' + cm_engineoil_level_id];
    const cm_engineoil_level_desc = values['cm_engineoil_level_desc_' + cm_engineoil_level_id];

    if(!cm_engineoil_level_value) {
      return setFields({
        ['cm_engineoil_level_value_' + cm_engineoil_level_id]: {
          value: '',
          errors: [new Error('认证等级值必填')]
        },
      });
    }else if(!cm_engineoil_level_author) {
      return setFields({
        ['cm_engineoil_level_author_' + cm_engineoil_level_id]: {
          value: '',
          errors: [new Error('认证机构必填')]
        },
      });
    }else{
      // 重置错误状态
      setFields({
        ['cm_engineoil_level_author_' + cm_engineoil_level_id]: {
          value: cm_engineoil_level_author
        },
        ['cm_engineoil_level_factory_' + cm_engineoil_level_id]: {
          value: cm_engineoil_level_factory
        },
        ['cm_engineoil_level_value_' + cm_engineoil_level_id]: {
          value: cm_engineoil_level_value
        },
        ['cm_engineoil_level_desc_' + cm_engineoil_level_id]: {
          value: cm_engineoil_level_desc
        },
      });
    }

    // 编辑标准车型
    const params = {
      cm_engineoil_level_author,
      cm_engineoil_level_factory,
      cm_engineoil_level_value,
      cm_engineoil_level_author_old:row.cm_engineoil_level_author,
      cm_engineoil_level_factory_old:row.cm_engineoil_level_factory,
      cm_engineoil_level_value_old:row.cm_engineoil_level_value,
      cm_engineoil_level_desc,
      cm_engineoil_level_id,
      cm_id
    };
    onFetchCarmodelEngineoilLevelUpdate(params);

  };

  // 删除标准车型机油等级
  const handleDel = (cm_engineoil_level_id, cm_id, index,row) => {
    confirm({
      title: '确认删除？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        if (modalType === 'add') {
          // 添加标准车型
          onUpdateCarmodelEngineoilLevel('del', null, index);
        } else {
          // 编辑标准车型
          onFetchCarmodelEngineoilLevelDel({ cm_engineoil_level_id, cm_id ,cm_engineoil_level_author_old:row.cm_engineoil_level_author , cm_engineoil_level_factory_old:row.cm_engineoil_level_factory , cm_engineoil_level_value_old:row.cm_engineoil_level_value});
        }
      }
    });
  };

  const columns = [
    {
      title: '认证机构',
      dataIndex: 'cm_engineoil_level_author',
      render: (text, row, index) => {
        const { cm_engineoil_level_id } = row;
        return (
          <FormItem>
            {
              modalType !== 'add' ? getFieldDecorator('cm_engineoil_level_author_' + cm_engineoil_level_id, {
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
      title: '认证主机厂',
      dataIndex: 'cm_engineoil_level_factory',
      render: (text, row, index) => {
        const { cm_engineoil_level_id } = row;
        return (
          <FormItem>
            {
              modalType !== 'add' ? getFieldDecorator('cm_engineoil_level_factory_' + cm_engineoil_level_id, {
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
      title: '认证等级值',
      dataIndex: 'cm_engineoil_level_value',
      render: (text, row, index) => {
        const { cm_engineoil_level_id } = row;
        return (
          <FormItem>
            {
              modalType !== 'add' ? getFieldDecorator('cm_engineoil_level_value_' + cm_engineoil_level_id, {
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
      title: '机油等级描述',
      dataIndex: 'cm_engineoil_level_desc',
      render: (text, row, index) => {
        const { cm_engineoil_level_id } = row;
        return (
          <FormItem>
            {
              modalType !== 'add' ? getFieldDecorator('cm_engineoil_level_desc_' + cm_engineoil_level_id, {
                initialValue: text,
              })(
                <Input size="small" />
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
        const { cm_engineoil_level_id, cm_id } = row;
        return (
          <>
            {
              modalType !== 'add' &&
              <>
                <Button type="primary" size="small" ghost onClick={() => handleUpdate(cm_engineoil_level_id, cm_id, index,row)}>更新</Button>
                <Divider type="vertical" />
              </>
            }
            <Button type="danger" size="small" ghost onClick={() => handleDel(cm_engineoil_level_id, cm_id, index,row)}>删除</Button>
          </>
        );
      }
    },
  ];
  return (
    <>
      <Row className={styles.search_form}>
        <FormItem label="认证机构">
          {
            getFieldDecorator('cm_engineoil_level_author', {
              initialValue: '',
            })(
              <Input style={{width: 120}} autocomplete="off" />
            )
          }
        </FormItem>
        <FormItem label="认证主机厂">
          {
            getFieldDecorator('cm_engineoil_level_factory', {
              initialValue: '',
            })(
              <Input style={{width: 120}} autocomplete="off" />
            )
          }
        </FormItem>
        <FormItem label="认证等级值">
          {
            getFieldDecorator('cm_engineoil_level_value', {
              initialValue: '',
            })(
              <Input style={{width: 120}} autocomplete="off" />
            )
          }
        </FormItem>
        <FormItem label="机油等级描述">
          {
            getFieldDecorator('cm_engineoil_level_desc', {
              initialValue: '',
            })(
              <Input style={{width: 120}} autocomplete="off" />
            )
          }
        </FormItem>
        <FormItem>
          <Button type="primary" onClick={handleSubmit}>添加机油等级</Button>
        </FormItem>
      </Row>
      <Row className={classNames(styles.table_content, 'm-t-15')}>
        <Table bordered pagination={false} loading={modalType !== 'add' && loading['baseorigin_id/fetchCarmodelEngineoilLevel']} rowKey={v => v.cm_engineoil_level_id} dataSource={CARMODEL_ENGINEOIL_LEVEL} columns={columns} />
      </Row>
    </>
  );
};

export default Form.create()(AddEngineoilLevel);
