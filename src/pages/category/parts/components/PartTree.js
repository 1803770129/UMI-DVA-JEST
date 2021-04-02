import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Col, Tree, Icon } from 'antd';
import './PartTree.less';
const TreeNode = Tree.TreeNode;

// 零件树子集
const loopChild = (data, searchVal, plusFn, minusFn) => data.map(item => {
  const { key, title, level, children } = item;
  const isMatch = searchVal && title.indexOf(searchVal) > -1 && level != 0;
  const minusStyels = {
    color: level == 0 && '#CCC',
    cursor: level == 0 && 'not-allowed'
  };
  const plusStyels = {
    color: level > 4 && '#CCC',
    cursor: level > 4 && 'not-allowed',
    marginLeft: '3px'
  };
  const titleRow = <Row type="flex" justify="space-between">
    <Col><span style={{color: isMatch ? 'red' : ''}}>{title}</span></Col>
    <Col>
      {!children && <Icon type="minus-circle" style={minusStyels} onClick={e => {e.stopPropagation(); minusFn(item);}} />}
      <Icon type="plus-circle" style={plusStyels} onClick={e => {e.stopPropagation(); plusFn(item);}} />
    </Col>
  </Row>;
  if (children) {
    return (<TreeNode key={key} title={titleRow}>{loopChild(children, searchVal, plusFn, minusFn)}</TreeNode>);
  }
  return <TreeNode key={key} title={titleRow} />;
});

// 零件树
class PartTree extends Component {

  render() {
    const { keys, autoExpandParent, onDrop, onExpand, onSelectTree, categoryTreeList = [], searchVal, plusFn, minusFn }  = this.props;

    const treeProps = {
      showLine: true,
      draggable: true,
      expandedKeys: keys,
      defaultCheckedKeys: keys,
      autoExpandParent,
      onDrop,
      onExpand,
      onSelect: selectedKeys => { 
        onSelectTree(selectedKeys);
      }
    };

    return (
      categoryTreeList.length > 0 && 
            <Tree {...treeProps} className="part-tree">
              {loopChild(categoryTreeList, searchVal, plusFn, minusFn)}
            </Tree>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.category_parts
});
export default connect(mapStateToProps)(PartTree);