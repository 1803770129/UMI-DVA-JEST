import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Input, Icon, Modal } from 'antd';
import { Prompt } from 'react-router-dom';
import PartTree from './components/PartTree';
import PartPropertyForm from './components/PartPropertyForm';
import PageLoading from '@/components/PageLoading/index';
import { uniqueArr, clone } from '@/utils/tools';
import './index.less';
const confirm = Modal.confirm;
const defaultCarmodelList = ['品牌', '主机厂', '车型', '年款', '上市年份', '停产年份', '排量', '发动机型号'];

const emptyCategoryInfo = {
  category_id: '',
  category_image: '',
  category_index: '',
  category_level: '',
  category_name: '',
  category_parent_id: '',
  category_parent_path: ''
};

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

class Parts extends Component {
    state = {
      pageLoading: true,
      dataSource: [],
      searchVal: '',              // 搜索零件树的值
      expandedKeys: [],           // 展开的零件树的key的列表
      autoExpandParent: true,     // 自动展开零件树的标识
    };

    componentDidMount() {
      this.pageInit();
      this.cmdParts();
    };
    cmdParts=()=>{
      const { dispatch } = this.props;
      const data={
        record_obj:{
          'type':'category'
        },
        record_page:' 品类产品/零件树',
        record_operations:'查看零件树'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    componentWillUnmount() {
      const { history, dispatch } = this.props;
      const routeTo = history.location.pathname;
      // 离开到非编辑页面，清理选择项目
      if (routeTo.indexOf('/category/parts/') == -1) {
        dispatch({ type: 'category_parts/clearState' });
      }
    }

    pageInit = () => {
      this.props.dispatch({
        type: 'category_parts/fetchPageInitFn',
        payload: {
          cb: category_id => {
            this.setState({pageLoading: false});
            this.setState({expandedKeys: [category_id]}); // 只展开第一层
          }
        }
      });
    }

    // ******************************* 品类树 操作 ***************************************

    // 删除品类节点
    minusFn = target => {
      console.log(target);
      // 删除前确定一次
      confirm({
        title: '确定删除此节点么？',
        content: '确认后不可恢复',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.props.dispatch({ type: 'category_parts/deleteCategory', payload: { category_id: target.key } });
          this.deleteCategoryUserRecordList(target);
        }
      });
    }
    deleteCategoryUserRecordList=(target)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:{
          'category_id':target.key
        },
        record_page:' 品类产品/零件树',
        record_operations:'删除品类节点'+target.title
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    // 添加品类节点
    plusFn = target => {
      if(target.level >= 5) return; // 不允许大于五层
      const { dispatch, categoryInfo, isChanged } = this.props;
      const addTreeNodeFn = () => {
        dispatch({
          type: 'category_parts/addCategoryTreeNode',
          payload: {
            fetchCategoryInfo: target.key,
            updateCategoryId: categoryInfo.category_id,
            updateIsAddTree: true,
            categoryInfo: emptyCategoryInfo,
            carmodelList: defaultCarmodelList,
            categoryList: []
          }
        });
      };
      if(isChanged) {
        confirm({
          title: '当前页有未保存信息，确定要放弃修改吗？',
          content: '确认后不可恢复',
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            this.onChangeAnyValueFn(false);
            addTreeNodeFn();
          }
        });
      } else {
        addTreeNodeFn();
      }
    }

    // 选择品类树节点获取品类信息
    onSelectTree = target => {
      const { dispatch, isChanged } = this.props;
      // 切换节点
      const switchTreeNodeFn = () => {
        /**
             * 切换品类时，要判断下是否有当前状态需要处理
             */
        if(target.length !== 0) {
          dispatch({ type: 'category_parts/fetchCategoryInfo', payload: target[0] });
        }
      };
      if(isChanged) {
        confirm({
          title: '当前页有未保存信息，确定要放弃修改吗？',
          content: '确认后不可恢复',
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            this.onChangeAnyValueFn(false);
            switchTreeNodeFn();
          }
        });
      } else {
        switchTreeNodeFn();
      }
    }

    // tree展开动作
    onExpand = expandedKeys => {
      this.props.dispatch({ type: 'category_parts/updateIsAddTree', payload: { isAddTree: false } });
      this.setState({ expandedKeys: expandedKeys, autoExpandParent: false });
    }

    // tree拖动
    onDrop = info => {
      const dropKey = info.node.props.eventKey;
      const dragKey = info.dragNode.props.eventKey;
      const dropPos = info.node.props.pos.split('-');
      const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

      // 顶层节点不可改变 或者 子节点超过5层
      if(dropKey == 0 || dropPos.length > 6) return;

      const loop = (data, key, callback) => {
        data.forEach((item, index, arr) => {
          if (item.key === key) {
            return callback(item, index, arr);
          }
          if (item.children) {
            return loop(item.children, key, callback);
          }
        });
      };
      const { dispatch, categoryTreeList } = this.props;
      const data = clone(categoryTreeList);
      let dragObj;
      loop(data, dragKey, (item, index, arr) => {
        arr.splice(index, 1);
        dragObj = item;
      });
      if (info.dropToGap) {
        let ar;
        let i;
        loop(data, dropKey, (item, index, arr) => {
          ar = arr;
          i = index;
        });
        if (dropPosition === -1) {
          ar.splice(i, 0, dragObj);
        } else {
          ar.splice(i + 1, 0, dragObj);
        }
      } else {
        // 拖动到文件夹时默认放在底部
        loop(data, dropKey, (item) => {
          item.children = item.children || [];
          item.children.push(dragObj);
        });
      }

      let targetNode = null;
      let targetIndex = null;
      let parentNode = null;

      const findParent = (dragKey, obj) => {
        if(obj.key == dragKey) {
          parentNode = obj;
        } else if(obj.children) {
          let array = obj.children;
          for(let i = 0; i < array.length; i++) {
            let item = array[i];
            if(item.key == dragKey) {
              parentNode = obj;
              break;
            } else if(item.children) {
              findParent(dragKey, item);
            }
          }
        }
      };

      const findTarget = array => {
        for(let i = 0; i < array.length; i++) {
          let item = array[i];
          if(dragKey == item.key) {
            targetNode = item;
            targetIndex = i;
            findParent(dragKey, data[0]);
          } else if(item.children) {
            findTarget(item.children);
          }
        }
      };

      findTarget(data);

      if(targetNode && parentNode) {
        dispatch({
          type: 'category_parts/updateTreeNode',
          payload: {
            category_parent_id: parentNode.key,
            category_id: dragKey,
            category_index: parseInt(targetIndex, 10) + 1
          }
        });
      }
    };

    // 搜索输入框change
    handleChangeSearchVal = val => {
      const searchVal =  val || '';
      const { categoryTreeList } = this.props;
      const res = filterSearchVal(searchVal, categoryTreeList);
      if(res.length != 0 && searchVal != '') {
        this.setState({ searchVal, expandedKeys: res, autoExpandParent: true });
      } else {
        this.setState({searchVal, expandedKeys: [categoryTreeList[0].key]});
      }
    };

    // ******************************* 品类树 操作 end ***************************************

    // 改变表格状态值
    handleSetDataSource = dataSource => {
      this.props.dispatch({ type: 'category_parts/updateCategoryList', payload: dataSource });
      this.setState({dataSource});
    };

    // 更新车型属性
    onChangeCarmodelListFn = newCarmodelList => this.props.dispatch({type: 'category_parts/updateCarmodelList', payload: newCarmodelList });

    // 校验 - 更新品类名称
    onChangeVaildCategoryNameFn = (val, id, callback) => {
      this.props.dispatch({
        type: 'category_parts/validCategoryName',
        payload: {
          category_name: val,
          category_id: id,
          cb: res => callback(res)
        }
      });
    }

    // 保存零件树属性
    onSavePropsFn = values => {
      this.setState({pageLoading: true});
      const {
        dispatch,
        isAddTree,                      // 是否添加树节点标识
        categoryList,                   // model 缓存零件属性【表格】
        currentCategoryInTree,          // 当前展开的品类信息【调用接口时组装数据用】
        carmodelProList,                // 车型属性列表
        categoryInfo,
        carmodelList
      } = this.props;
      const { categoryParams, carmodelProParams } = currentCategoryInTree; // 原始数据
      // console.log(categoryList); // 判断是否有长度，有的话，还要判断deleted是否等于1
      // console.log(carmodels); // 判断这个长度 > 9
      // console.log(categoryInfo);  // {category_name: "", category_image: ""} 这两有值
      if(isAddTree) {
        // 创建处理
        let obj = {
          categoryParams: {
            category_type: values.category_type,
            category_name: values.category_name,
            category_parent_id: categoryParams.category_id,
            category_image: categoryInfo.category_image,
          },
          categoryProParams: [],
          carmodelProParams: [],
          cb: () => this.setState({pageLoading: false})
        };
        // 零件属性【表格】
        for(let i = 0; i < categoryList.length; i++) {
          let item = categoryList[i];
          if(!item.deleted) {
            // 创建时，不提交已记上被删除的标识
            let o = {
              category_pro_type: item.category_pro_type,
              category_pro_name: item.category_pro_name,
              category_pro_unit: item.category_pro_unit,
              category_pro_size: item.category_pro_size,
              category_pro_group: item.category_pro_group,
              category_pro_tip:item.category_pro_tip,
              categoryProEnumParams: []
            };
            for(let j = 0; j < item.categoryProEnumParams.length; j++) {
              o.categoryProEnumParams.push({category_pro_val_value: item.categoryProEnumParams[j].category_pro_val_value});
            }
            obj.categoryProParams.push(o);
          }
        }
        // 车型属性
        for(let i = 0; i < carmodelProList.length; i++) {
          for(let j = 0; j < carmodelList.length; j++) {
            if(carmodelList[j] == carmodelProList[i].cm_pro_name) {
              let carAttr = {
                cm_pro_id: carmodelProList[i].cm_pro_id,
                category_cmpro_index: parseInt(i, 10) + 1
              };
              if(defaultCarmodelList.indexOf(carmodelList[j]) > -1) {
                carAttr.category_cmpro_rank = 'DEFAULT';
              } else {
                carAttr.category_cmpro_rank = 'EXTRA';
              }
              obj.carmodelProParams.push(carAttr);
              break;
            }
          }
        }
        // 上传的图片文件
        // obj.uploadFile = this.state.uploadFile;
        // 回调方法 - 移除上传的图片数据，错误提示及清除loading
        obj.cb = () => this.setState({pageLoading: false});
        dispatch({ type: 'category_parts/createCategory', payload: obj });
        this.addTreeUserRecordList(obj);
      } else {
        // 更新处理
        let obj = {
          category_id: categoryInfo.category_id,
          categoryParams: {
            category_type: values.category_type,
            category_name: values.category_name,
            category_level: categoryInfo.category_level,
            category_index: categoryInfo.category_index,
            category_parent_id: categoryInfo.category_parent_id,
            category_parent_path: categoryInfo.category_parent_path,
            category_image: categoryInfo.category_image
          },
          category_pro_update: false, // 如果品类属性的字段有更改，或者删除，则传入这个值，为true，默认传false就可以
          categoryProParams: [],
          carmodelProParams: [],
          cb: () => this.setState({pageLoading: false})
        };
        // 零件属性【表格】
        for(let i = 0; i < categoryList.length; i++) {
          let item = categoryList[i];
          let o = {
            category_pro_id: item.category_pro_id,
            category_pro_type: item.category_pro_type,
            category_pro_name: item.category_pro_name,
            category_pro_unit: item.category_pro_unit,
            category_pro_size: item.category_pro_size,
            category_pro_group: item.category_pro_group,
            category_pro_tip:item.category_pro_tip,
            categoryProEnumParams: item.categoryProEnumParams
          };
          if(item.deleted) {
            o.deleted = 1; // 编辑时接口需要
            obj.category_pro_update = true; // 被移除的，传true
          }
          // if(!item.category_id) {
          //     obj.category_pro_update = true; // 有追加属性的，传true
          // }
          obj.categoryProParams.push(o);
          if(item.updated) {
            obj.category_pro_update = true; // 有属性被修改了的，传true
          }
        }
        // 车型属性
        // 整理出需要操作的车型属性
        // 1、对比原车型属性与本页的state数据确定所需提交的数据 carsubmit
        // 2、取的1的数组后对比model的数据，取出要delete的数据 delList
        let carsubmit = [];
        for(let i = 0; i < carmodelProList.length; i++) {
          for(let j = 0; j < carmodelList.length; j++) {
            if(carmodelList[j] == carmodelProList[i].cm_pro_name) {
              let carAttr = {
                cm_pro_name: carmodelProList[i].cm_pro_name,
                cm_pro_id: carmodelProList[i].cm_pro_id
              };
              // 对比，默认属性传 DEFAULT ，其他传 EXTRA
              if(defaultCarmodelList.indexOf(carmodelList[j]) > -1) {
                carAttr.category_cmpro_rank = 'DEFAULT';
              } else {
                carAttr.category_cmpro_rank = 'EXTRA';
              }
              carsubmit.push(carAttr);
              break;
            }
          }
        }
        // 对比原始数据，加上要移除的车型属性
        let delList = [];
        for(let i = 0; i < carmodelProParams.length; i++) {
          let flag = false;
          for(let j = 0; j < carsubmit.length; j++) {
            if(carsubmit[j].cm_pro_name == carmodelProParams[i].cm_pro_name) {
              carsubmit[j].category_cmpro_id = carmodelProParams[i].category_cmpro_id;
              flag = true;
              break;
            }
          }
          if(!flag) {
            delList.push({
              deleted: 1,
              category_cmpro_id: carmodelProParams[i].category_cmpro_id,
              category_cmpro_rank: 'EXTRA'
            });
          }
        }
        let result = [...carsubmit, ...delList];
        obj.carmodelProParams = result;
        dispatch({ type: 'category_parts/updateCategory', payload: obj });
        this.updateTreeUserRecordList(obj);
      }
    }
    addTreeUserRecordList=(obj)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:obj,
        record_page:' 品类产品/零件树',
        record_operations:'创建零件树节点'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    updateTreeUserRecordList=(obj)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:obj,
        record_page:' 品类产品/零件树',
        record_operations:'编辑零件树节点'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    // 只要数据修改了，就判定该页有修改
    onChangeAnyValueFn = status => this.props.dispatch({ type: 'category_parts/updateIsChanged', payload: status });

    render() {
      const { categoryTreeList, loading, isChanged } = this.props;
      const { expandedKeys, autoExpandParent, searchVal, pageLoading } = this.state;
      // 零件树搜索框
      const TreeSearchForm =
      // 动态改变 prefix/suffix 时，Input 会失去焦点， 所以增加<span />
      // https://ant.design/components/input-cn/#FAQ
            <Input
              value={searchVal}
              placeholder={'输入查询零件名称'}
              onChange={e => {this.handleChangeSearchVal(e.target.value);}}
              suffix={
                searchVal ? <Icon type="close-circle" className="gray cur" onClick={e => {this.handleChangeSearchVal(e.target.value);}} /> : <span />
              }
            />;

      const fetchCategoryInfo = loading['category_parts/fetchCategoryInfo'];                   // 抓取品类接口时，销毁PartPropertyForm组件【切换品类时用】
      const fetchCurrentCategoryInfo = loading['category_parts/fetchCurrentCategoryInfo'];     // 抓取品类接口时，销毁PartPropertyForm组件【新增新节点时用】
      return (
        <React.Fragment>
          <Row gutter={16} className="category-parts">
            <Col xl={8} xxl={6}>
              {/* 零件树 */}
              <Card title={ TreeSearchForm } className="category-parts-card">
                <PartTree
                  categoryTreeList={categoryTreeList}
                  keys={expandedKeys}
                  autoExpandParent={autoExpandParent}
                  searchVal={searchVal}
                  onExpand={this.onExpand}
                  onDrop={this.onDrop}
                  onSelectTree={this.onSelectTree}
                  plusFn={this.plusFn}
                  minusFn={this.minusFn}
                />
              </Card>
            </Col>
            <Col xl={16} xxl={18}>
              {/* 零件属性 */}
              <Card className="category-parts-card" loading={fetchCategoryInfo || fetchCurrentCategoryInfo}>
                {
                  this.props.currentCategoryInTree &&
                                <PartPropertyForm
                                  onChangeAnyValueFn={this.onChangeAnyValueFn}
                                  onSavePropsFn={this.onSavePropsFn}
                                  onChangeVaildCategoryNameFn={this.onChangeVaildCategoryNameFn}
                                  onChangeCarmodelListFn={this.onChangeCarmodelListFn}
                                  handleSetDataSource={this.handleSetDataSource}
                                  pageInit={this.pageInit}
                                />
                }
              </Card>
            </Col>
          </Row>
          { pageLoading && <PageLoading /> }
          <Prompt when={isChanged} message={() => ('当前页有未保存的数据，确定要放弃修改吗')} />
        </React.Fragment>
      );
    }
}

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.category_parts
});
export default connect(mapStateToProps)(Parts);
