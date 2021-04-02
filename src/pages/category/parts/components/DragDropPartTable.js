import React, { Component } from 'react';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import { Table } from 'antd';
import './DragDropPartTable.less';

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
      handleSetDataSource(newDataSource);
    };

    render() {
      const { isAddTree, dataSource, onUpdateCategoryPropsFn, onRemoveCategoryPropsFn } = this.props;

      const columns = [
        { title: '排序', dataIndex: 'category_pro_index', width: 60 },
        { title: '分组', dataIndex: 'category_pro_group', width: 60 },
        { title: '名称', dataIndex: 'category_pro_name' },
        { title: '类型', dataIndex: 'category_pro_type', width: 90 },
        { title: '长度', dataIndex: 'category_pro_size', width: 60 },
        { title: '单位', dataIndex: 'category_pro_unit', width: 60 },
        { title: '枚举值', dataIndex: 'category_pro_enum_val' },
        { title: '提示内容', dataIndex: 'category_pro_tip' },
        { title: '操作', dataIndex: 'operating', width: 100 }
      ].map(item => {
        let obj = { ...item };
        if(obj.dataIndex == 'operating') {
          obj.render = (text, record, index) => (
            <React.Fragment>
              <span className={'f12 blue6 cur'} onClick={()=> onUpdateCategoryPropsFn(index)}>编辑</span>
              { !isAddTree && <span className={'f12 red5 m-l-10 cur'} onClick={()=> onRemoveCategoryPropsFn(record.category_pro_name, record.category_pro_id)}>删除</span> }
              { isAddTree && <span className={'f12 red5 m-l-10 cur'} onClick={()=> onRemoveCategoryPropsFn(index)}>删除</span> }
            </React.Fragment>
          );
        }
        return obj;
      });

      return (
        <Table
          className={'drag-drop-part-table'}
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
