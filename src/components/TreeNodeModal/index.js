import React from 'react';
import { Row, Col, Tree, Input, Card, Modal, Table, Tag, Button, Icon } from 'antd';
import classNames from 'classnames';
import { isEmpty } from '@/utils/tools';
import styles from './index.less';
import NoData from '@/components/NoData';
import ENV from '@/utils/env';
const DirectoryTree = Tree.DirectoryTree;
const { TreeNode } = Tree;

// 零件树子集
const loopChild = data => data.map(item => {
  const { keys, title, children } = item;
  if (children) {
    return (<TreeNode key={keys} title={title}>{loopChild(children)}</TreeNode>);
  } else {
    return <TreeNode key={keys} title={title} isLeaf />;
  }
});


export default ({ visible, expandedKeys, selectedKeys, PAGE_TYPE, CATEGORY_TREE, CATEGORY_INFO, onOk, onCancel, onInputChange, onTreeSelect }) => {
  const { carmodelProParams = [], categoryParams = {}, categoryProParams = [], isDis = false } = CATEGORY_INFO;
  const isDisBtn = isEmpty(categoryParams) || isDis;
  // 模态框属性
  const modalProps = {
    title: PAGE_TYPE === 'add' ? '选择零件树节点' : '查看零件属性',
    destroyOnClose: true,
    visible: visible,
    width: 1200,
    bodyStyle: { minHeight: 600 },
    style: { top: 30 },
    onCancel: onCancel,
    footer: PAGE_TYPE === 'add' &&
      <>选择 <Icon type="file" /> 图标对应的产品名称才可确定选择&emsp; <Button type="primary" onClick={onOk} disabled={isDisBtn}>确定</Button><Button onClick={onCancel}>取消</Button></>
  };
  // 零件树配置
  const treeProps = {
    onSelect: onTreeSelect,
    filterTreeNode: (node) => {
      const { pos, selected } = node.props;
      return expandedKeys.includes(pos) && !selected;
    },
    autoExpandParent: true, // 是否自动展开父节点
    expandedKeys,
    selectedKeys
  };
  // 零件名称表格
  const columns = [
    { title: '排序', dataIndex: 'category_pro_index' },
    { title: '分组', dataIndex: 'category_pro_group' },
    { title: '名称', dataIndex: 'category_pro_name' },
    { title: '类型', dataIndex: 'category_pro_type' },
    { title: '长度', dataIndex: 'category_pro_size' },
    { title: '单位', dataIndex: 'category_pro_unit' },
    { title: '枚举', dataIndex: 'enums' }
  ];
  const dataSource = categoryProParams.map(v => {
    const { category_pro_type, categoryProEnumParams } = v;
    return category_pro_type === 'ENUM' && categoryProEnumParams ? { ...v, enums: categoryProEnumParams.map(it => it.category_pro_val_value).join(',') } : v;
  });
  // 是否有初始化数据
  const isNodata = isEmpty(categoryParams);
  const stys = isNodata ? { display: 'flex', alignItems: 'center', justifyContent: 'center' } : {};
  // 零件类型名称转换
  const category_type_obj = ENV.category_types.find(v => v.key === categoryParams.category_type);
  return (
    <Modal {...modalProps}>
      <Row gutter={16}>
        {
          PAGE_TYPE === 'add' &&
          <Col xl={PAGE_TYPE === 'add' ? 10 : 24} xxl={PAGE_TYPE === 'add' ? 8 : 24} style={{ height: 600, overflowY: 'auto' }}>
            <Card bodyStyle={{ minHeight: 475, paddingTop: 10, paddingBottom: 10 }} title={
              <Input onChange={onInputChange} allowClear placeholder={'输入查询零件名称'} />
            }>
              <DirectoryTree className={styles.tree} {...treeProps}>{loopChild(CATEGORY_TREE)}</DirectoryTree>
            </Card>
          </Col>
        }
        <Col xl={PAGE_TYPE === 'add' ? 14 : 24} xxl={PAGE_TYPE === 'add' ? 16 : 24} style={{ height: 600, overflowY: 'auto' }}>
          <Card bodyStyle={{ minHeight: 540, ...stys }}>
            {
              isNodata &&
              <NoData title="请选择左侧零件树" />
            }
            {
              !isNodata &&
              <>
                <Row gutter={16} className="m-b-10">
                  <Col>
                    <b>零件名称：</b>{categoryParams.category_name}
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col>
                    <b>零件图片：</b>
                    <span className={classNames('sopei_category', categoryParams.category_image ? 'sopei_category-' + categoryParams.category_image : 'sopei_category-jiyoulvqingqi')} style={{ fontSize: 30, verticalAlign: 'middle' }}></span>
                  </Col>
                </Row>
                <Row gutter={16} className="m-b-10">
                  <Col>
                    <b>零件类型：</b>{category_type_obj ? category_type_obj.name : ''}
                  </Col>
                </Row>
                <Row gutter={16} className="m-b-10">
                  <Col span={24}>
                    <div className="m-b-10"><b>车型属性：</b></div>
                    {
                      carmodelProParams.map(item => {
                        return <Tag key={item.cm_pro_id} className={styles.tag}>{item.cm_pro_name}</Tag>;
                      })
                    }
                  </Col>
                </Row>
                <Row gutter={16} className="m-b-10">
                  <Col span={24}>
                    <div className="m-b-10"><b>零件名称：</b></div>
                    <Table
                      columns={columns}
                      pagination={false}
                      key={'key'}
                      dataSource={dataSource}
                      rowKey={(item, index) => index}
                    />
                  </Col>
                </Row>
              </>
            }

          </Card>
        </Col>
      </Row>
    </Modal>
  );
};