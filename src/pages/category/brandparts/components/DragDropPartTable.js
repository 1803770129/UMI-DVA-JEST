import React, { Component } from 'react';
import { Form, Input, Switch } from 'antd';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import { Table } from 'antd';
import styles from './DragDropPartTable.less';
const FormItem = Form.Item;

function dragDirection(
  dragIndex,
  hoverIndex,
  initialClientOffset,
  clientOffset,
  sourceClientOffset
) {
  const hoverMiddleY = (initialClientOffset.y - sourceClientOffset.y) / 2;
  const hoverClientY = clientOffset.y - sourceClientOffset.y;
  if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY) {
    return 'downward';
  }
  if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY) {
    return 'upward';
  }
}

let BodyRow = props => {
  const {
    isOver,
    connectDragSource,
    connectDropTarget,
    moveRow,
    dragRow,
    clientOffset,
    sourceClientOffset,
    initialClientOffset,
    ...restProps
  } = props;
  const style = { ...restProps.style, cursor: 'move' };

  let className = restProps.className;
  if (isOver && initialClientOffset) {
    const direction = dragDirection(
      dragRow.index,
      restProps.index,
      initialClientOffset,
      clientOffset,
      sourceClientOffset
    );
    if (direction === 'downward') {
      className += ' drop-over-downward';
    }
    if (direction === 'upward') {
      className += ' drop-over-upward';
    }
  }

  return connectDragSource(
    connectDropTarget(
      <tr {...restProps} className={className} style={style} />
    )
  );
};

const rowSource = {
  beginDrag(props) {
    return {
      index: props.index
    };
  }
};

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;
    // 不可替换当前拖拽行
    if (dragIndex === hoverIndex) {
      return;
    }
    props.moveRow(dragIndex, hoverIndex);
    monitor.getItem().index = hoverIndex;
  }
};

BodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  sourceClientOffset: monitor.getSourceClientOffset()
}))(
  DragSource('row', rowSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    dragRow: monitor.getItem(),
    clientOffset: monitor.getClientOffset(),
    initialClientOffset: monitor.getInitialClientOffset()
  }))(BodyRow)
);

class PartTable extends Component {

    components = {
      body: {
        row: BodyRow
      }
    };

    moveRow = (dragIndex, hoverIndex) => {
      const { dataSource, handleSetDataSource } = this.props;
      const dragRow = dataSource[dragIndex];
      const newDataSource = update(dataSource, {
        $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]]
      });
        // 重新设定排序号
      newDataSource.forEach((item, index) => {
        item.sort = index + 1;
      });
      // 改变表格状态值
      handleSetDataSource(newDataSource, hoverIndex);
    };

    render() {
      const { dataSource, isAdd, fields, onHandleProductStatusFn, onHandleInputBlurFn, onHandleInputChangeFn, onHandleTreeNodeModalFn, onHandleDeleteProductFn, onHandleSaveFn } = this.props;
      // 表格属性
      const columns = [
        { title: '产品名称', dataIndex: 'category_name', width: 200 }, 
        { title: '产品编码', dataIndex: 'brand_category_code', width: 200 }, 
        { title: '零件树节点名', dataIndex: 'category_parent_path' }, 
        {
          title: '启用状态',
          dataIndex: 'brand_category_status',
          width: 120,
          render: (text, record, index) => {
            return <Switch 
              checkedChildren='开' 
              unCheckedChildren='关'
              disabled={isAdd}
              defaultChecked={record.brand_category_status == 'ENABLE' ? true : false}
              checked={record.brand_category_status == 'ENABLE' ? true : false}
              onChange={ 
                checked => { 
                  onHandleProductStatusFn(record.brand_category_id, checked, index); 
                }
              } 
            />;
          }
        }, { title: '操作', dataIndex: 'operating', width: 120 }
      ];
          
      columns.forEach(item => {
        // 产品名称的input输入框
        if(item.dataIndex == 'category_name') {
          item.render = (text, record, index) => {
            return (<FormItem validateStatus={record.nameError} help={record.nameHelp}>{text}</FormItem>);
          };
        }

        // 产品编码为input输入框
        if(item.dataIndex == 'brand_category_code') {
          item.render = (text, record, index) => {
            return (
              <FormItem validateStatus={record.error} help={record.help}>
                <Input placeholder="输入编码" 
                  value={text} 
                  onBlur={ e => onHandleInputBlurFn(e.target.value, index, item.dataIndex)} 
                  onChange={ e => onHandleInputChangeFn(e.target.value, index, item.dataIndex)}
                  style={{ width: 150 }} 
                  disabled={!isAdd && !!record.brand_category_id}
                />
              </FormItem>
            );
          };
        }

        // 零件树节点为点击触发模态框编辑
        if(item.dataIndex == 'category_parent_path') {
          item.render = (text, record, index) => {
            if(isAdd || !record.brand_category_id) {
              return <span className="cur link" onClick={() => onHandleTreeNodeModalFn(true, index)}>{text || '点击选择'}</span>;
            } else {
              return <span>{text}</span>;
            }
          };
        }

        // 操作栏
        if(item.dataIndex == 'operating') {
          item.render = (text, record, index) => {
            const item = fields.children[index];
            return (
              <React.Fragment>
                { <span className="cur link" onClick={() => onHandleDeleteProductFn(index)} >删除&nbsp;&nbsp;</span> }
                {
                  (!record.brand_category_id && !isAdd) && 
                                <span className="cur link" 
                                  disabled={!item.brand_category_code || !item.category_name || item.error == 'error'} 
                                  onClick={ () => onHandleSaveFn(text, record, index)}>保存</span>
                }
              </React.Fragment>
            );
          };
        }
      });

      return (
        <Table 
          className={styles.customTable}
          bordered={true}
          pagination={false}
          columns={columns}
          dataSource={dataSource}
          components={this.components}
          onRow={(record, index) => ({
            index,
            moveRow: this.moveRow
          })}
          rowKey={(item, index) => index}
        />
      );
    }
}

const DragDropPartTable = DragDropContext(HTML5Backend)(PartTable);

export default DragDropPartTable;
