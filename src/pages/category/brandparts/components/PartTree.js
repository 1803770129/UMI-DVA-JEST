import React from 'react';
import { Row, Tree, Radio, Card, Input, Icon } from 'antd';
const RadioGroup = Radio.Group;
const TreeNode = Tree.TreeNode;

// 零件树子集
const loopChild = (data, searchVal) => data.map(item => {
    const { key, title, level, children } = item;
    const isMatch = searchVal && title.indexOf(searchVal) > -1 && level != 0;
    const titleRow = <Row>
        {
            !item.children &&  
            <Radio value={item.key}>
                <span style={{color: isMatch ? 'red' : '#333'}}>{title}</span>
            </Radio> 
        }
        {
            item.children && <span style={{color: isMatch ? 'red' : '#333'}}>{title}</span>
        }

    </Row>;
    if (children) {
        return (
            <TreeNode key={key} title={titleRow} disabled={!!item.children}>
                {loopChild(children, searchVal)}
            </TreeNode>
        );
    }
    return <TreeNode key={key} title={titleRow}/>;
});

// 零件树
export default props => {
    const { 
        treeData,                           // 零件树数据
        autoExpandParent,                   // 是否自动展开标识
        onExpandTreeNodeFn,                 // 展开收起节点函数
        onSelectTreeNodeFn,                 // 切换节点函数
        expandedKeys,                       // 展开的节点key数组
        searchVal,                          // 搜索零件树节点的值
        checkedValue,                       // 选中单选框的节点key值
        onClearSearchTreeNodeFn,            // 清空搜索框值函数
        onFilterTreeNodeFn                  // 过滤树节点的函数
    } = props;
    const treeProps = {
        showLine: true,
        onExpand: onExpandTreeNodeFn,
        onSelect: onSelectTreeNodeFn,
        expandedKeys,
        defaultCheckedKeys: expandedKeys,
        autoExpandParent
    };
    // 零件树搜索框
    const searchInput = <Input 
        value={searchVal}
        placeholder={'输入查询零件名称'}
        onChange={e => {onFilterTreeNodeFn(e.target.value);}}
        suffix={<Icon type="close-circle" className="gray cur" onClick={() => { onClearSearchTreeNodeFn(); } } />}
    />;
    return (
        <Card title={searchInput} className="tree-node-modal-card">
            <RadioGroup value={typeof checkedValue == 'string' ? checkedValue : checkedValue[0]}>
                <Tree {...treeProps}>
                    {loopChild(treeData, searchVal)}
                </Tree>
            </RadioGroup>
        </Card>
    );
};