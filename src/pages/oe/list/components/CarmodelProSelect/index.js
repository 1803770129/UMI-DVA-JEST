import React, { useState, useEffect } from 'react';
import { Select, Spin, Form, Button } from 'antd';
import styles from './index.less';
const { Option } = Select;

const PropsItem = ({ form, item, CARMODEL_PRO_LIST, isShowAddBtn, onAdd, onRemove, onChangeParent, onSelectChange }) => {
  const { getFieldDecorator, getFieldsValue } = form;
  const [parentValue, setParentValue] = useState();
  const [childrenValue, setChildrenValue] = useState();
  const [childrenList, setChildrenList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { cm_pro_column } = CARMODEL_PRO_LIST.find(v => v.cm_pro_id === parentValue) || {};

  const handleChangeParent = value => {
    setParentValue(value);
    const carmodelPro = CARMODEL_PRO_LIST.find(v => v.cm_pro_id === value);
    if (carmodelPro) {
      setIsLoading(true);
      onChangeParent(carmodelPro, result => {
        setIsLoading(false);
        if (result) {
          setChildrenList(result);
          onSelectChange(formatFields(value));
        }
      });
    }
  };

  /** 格式化返回表单属性 */
  const formatFields = value => {
    const fields = getFieldsValue();
    let obj = {};
    for (const key in fields) {
      const arr = key.split('__');
      if(arr.length === 2) {
        const v = arr[1] === cm_pro_column ? value : fields[key];
        if(v) {
          obj[arr[1]] = v;
        }
      }
    }
    return obj;
  };

  const handleChangeChildren = value => {
    // setChildrenValue(value);
    onSelectChange(formatFields(value));
  };

  const handleRemove = () => {
    onRemove(cm_pro_column);
    onSelectChange(formatFields());
  };

  useEffect(() => {
    if (CARMODEL_PRO_LIST.length > 0 && CARMODEL_PRO_LIST[0].cm_pro_id) {
      handleChangeParent(CARMODEL_PRO_LIST[0].cm_pro_id);
    }
    return () => {
      setParentValue();
      // setChildrenValue();
    };
  }, [item]);

  return (
    <Spin spinning={isLoading}>
      <span className="m-r-15">
        <span>
          {
            getFieldDecorator(item.key)(
              <Select className={styles.parentSelect} style={{ width: 120 }} onChange={handleChangeParent} placeholder="请选择">
                {CARMODEL_PRO_LIST.map(v => (
                  <Option key={v.cm_pro_id}>{v.cm_pro_name}</Option>
                ))}
              </Select>
            )
          }
        </span>
        <span>
          {
            getFieldDecorator(item.key + '__' + cm_pro_column)(
              <Select allowClear className={styles.childrenSelect} style={{ width: 180 }} onChange={handleChangeChildren} placeholder="请选择">
                {childrenList.filter(v => v[cm_pro_column]).map((v, idx) => {
                  const value = v[cm_pro_column];
                  return <Option key={idx} value={value}>{value}</Option>;
                })}
              </Select>
            )
          }
        </span>
        
        <Button className={styles.addBtn} icon="minus" onClick={handleRemove}></Button>
        {isShowAddBtn && <Button className={styles.addBtn} icon="plus" onClick={onAdd}></Button>}
      </span>
      <div className="m-b-10"></div>
    </Spin>
  );
};

const CarmodelProSelect = ({ form, CARMODEL_PRO_LIST, brand_fac_mod, onChangeParent, onSelectChange }) => {
  const [group, setGroup] = useState([]);
  useEffect(() => {
    if (CARMODEL_PRO_LIST.length > 0 && CARMODEL_PRO_LIST[0].cm_pro_id) {
      setGroup([{
        key: new Date().getTime()
      }]);
    }
  }, [CARMODEL_PRO_LIST]);

  useEffect(() => {
    setGroup([{
      key: new Date().getTime() + ''
    }]);
    onSelectChange(null);
  }, [brand_fac_mod]);

  const handleAddItem = () => {
    setGroup([...group, {
      key: new Date().getTime() + ''
    }]);
  };

  const handleRemoveItem = async key => {
    setGroup(group.filter(v => v.key !== key));
  };

  return (
    <>
      {
        group.map((v, idx) => {
          return <PropsItem key={v.key} form={form} item={v} CARMODEL_PRO_LIST={CARMODEL_PRO_LIST} isShowAddBtn={idx === group.length - 1} onAdd={handleAddItem} onChangeParent={onChangeParent} onSelectChange={onSelectChange} onRemove={() => handleRemoveItem(v.key)} />;
        })
      }
    </>
  );
};

export default Form.create()(CarmodelProSelect);
