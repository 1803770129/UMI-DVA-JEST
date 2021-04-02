import React, { Component } from 'react';
import { Row, Col, Card, Modal, message, Table, Tag } from 'antd';
import PartTree from './PartTree';
import { uniqueArr } from '@/utils/tools';

// 过滤搜索项
const filterSearchVal = (searchValue, treeData, filtered = []) => {
  treeData.forEach(item => {
    if(item.title.indexOf(searchValue) == -1) {
      if(item.children) {
        filterSearchVal(searchValue, item.children, filtered);
      }
    } else {
      filtered.push(item.key);
      if(item.children) {
        filterSearchVal(searchValue, item.children, filtered);
      }
    }
  });

  return uniqueArr(filtered);
};

class TreeNodeModal extends Component {

    state = {
      searchVal: '',                      // 搜索输入框
      expandedKeys: [],
      autoExpandParent: true,
      checkedValue: '',                   // 选中零件树的值
      checkedId: ''                       // 选中零件树的id
    };

    componentDidMount() {
      this.pageInit();
    };

    pageInit = () => {
      const { treeCategoryInfo } = this.props;
      this.setState({
        expandedKeys: [treeCategoryInfo.categoryParams.category_id],
        checkedValue: [treeCategoryInfo.categoryParams.category_id]
      });
    };

    // 获取选择零件树节点名
    getPartNodeNames = checked => {
      const treeData = this.props.treeData;
      // 获取拼接零件树节点名
      let arr = [];
      const loopFn = (data, key) => {
        data.forEach(item => {
          if(key == item.key && item.level != '0') {
            arr.push(item.title);
          }
          item.children && loopFn(item.children, key);
        });
      };
        
      let checkedArr = checked.split('-');
      checkedArr.forEach((key, index) => {
        loopFn(treeData, checkedArr.slice(0, index + 1).join('-'));
      });

      return arr;
    };

    // 清除零件树节点搜索框的值
    onClearSearchTreeNodeFn = () => {
      this.setState({searchVal: ''});
    }

    // 搜索过滤零件树节点
    onFilterTreeNodeFn = val => {
      const searchVal =  val || '';
      const { treeData } = this.props;
      const res = filterSearchVal(searchVal, treeData);
      if(res.length != 0 && searchVal != '') {
        this.setState({ expandedKeys: res, autoExpandParent: true });
      }
      this.setState({searchVal});
    }

    // 切换树节点
    onSelectTreeNodeFn = (selectedKeys, info) => {
      if(selectedKeys.length !== 0) {
        // >0时，开启树节点
        // =0时，关闭树节点
        this.setState({checkedValue: selectedKeys[0]});
        const { dispatch } = this.props;
        dispatch({ type: 'category_brandparts_id/fetchCategoryInfo', payload: selectedKeys[0] });
      }
    }

    // 展开/收起树节点
    onExpandTreeNodeFn = expandedKeys => {
      this.setState({ expandedKeys, autoExpandParent: false });
    }

    render() {
      const { treeNodeModalVisible, onHandleTreeNodeModalFn, handleTreeNodeModalOk, treeData, treeCategoryInfo } = this.props;
      const { autoExpandParent, expandedKeys, searchVal, checkedValue } = this.state;
      // 模态框属性
      const modalProps = {
        title: '选择零件树节点',
        destroyOnClose: true,
        visible: treeNodeModalVisible,
        width: '1200px',
        onOk: () => {
          const { checkedValue } = this.state;
          let val = typeof checkedValue == 'string' ? checkedValue : checkedValue[0];
          if(val) {
            this.props.onHandleTreeNodeModalFn(false);
            const nodeName = this.getPartNodeNames(val);
            handleTreeNodeModalOk(val, nodeName);
          } else {
            message.error('请选择查询零件树节点名');
          }
        },
        onCancel: () => onHandleTreeNodeModalFn(false)
      };
        // 
      const columns = [
        { title: '排序', dataIndex: 'category_pro_index' },
        { title: '分组', dataIndex: 'category_pro_group' },
        { title: '名称', dataIndex: 'category_pro_name' },
        { title: '类型', dataIndex: 'category_pro_type' },
        { title: '长度', dataIndex: 'category_pro_size' },
        { title: '单位', dataIndex: 'category_pro_unit' },
        { title: '枚举', dataIndex: 'enums' }
      ];
        // 枚举
      let array = [...treeCategoryInfo.categoryProParams];
      for(let i = 0; i < array.length; i++) {
        let item = array[i];
        if(item.category_pro_type == 'ENUM' && item.categoryProEnumParams) {
          item.enums = '';
          for(let k = 0; k < item.categoryProEnumParams.length; k++) {
            item.enums += item.categoryProEnumParams[k].category_pro_val_value || '';
            if(k !== item.categoryProEnumParams.length - 1) {
              item.enums += ',';
            }
          }
        }
      }

      return (
        <Modal {...modalProps}>
          <Row gutter={16} className="tree-node-modal">
            <Col xl={10} xxl={8}>
              {/* 零件树 */}
              <PartTree
                treeData={treeData}
                autoExpandParent={autoExpandParent}
                expandedKeys={expandedKeys}
                searchVal={searchVal}
                checkedValue={checkedValue}
                onExpandTreeNodeFn={this.onExpandTreeNodeFn}
                onSelectTreeNodeFn={this.onSelectTreeNodeFn}
                onClearSearchTreeNodeFn={this.onClearSearchTreeNodeFn}
                onFilterTreeNodeFn={this.onFilterTreeNodeFn}
              />
            </Col>
            <Col xl={14} xxl={16}>
              {/* 零件属性 */}
              <Card className="tree-node-modal-card">
                <Row gutter={16} className="m-b-10">
                  <Col>
                    <b>零件名称：</b>{treeCategoryInfo.categoryParams.category_name}
                  </Col>
                </Row>
                <Row gutter={16} className="m-b-10">
                  <Col>
                    <b>零件图片：</b>
                    <span className="iconfont icon-shachepian" style={{fontSize: 30, verticalAlign:'middle'}}></span>
                  </Col>
                </Row>
                <Row gutter={16} className="m-b-10">
                  <Col span={24}>
                    <div className="m-b-10">
                      <b>车型属性：</b>
                    </div>
                    {
                      treeCategoryInfo.carmodelProParams.map(item => {
                        return <Tag key={item.cm_pro_id}>{item.cm_pro_name}</Tag>;
                      })
                    }
                  </Col>
                </Row>
                <Row gutter={16} className="m-b-10">
                  <Col span={24}>
                    <div>
                      <b>零件名称：</b>
                    </div>
                    <Table 
                      columns={columns}
                      key='key'
                      dataSource={array}
                      rowKey={(item, index) => index}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Modal>
      );
    };
};

export default TreeNodeModal;