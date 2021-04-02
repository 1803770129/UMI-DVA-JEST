import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Form, Button, Divider, Modal } from 'antd';
import { Prompt } from 'react-router-dom';
// import TreeNodeModal from './components/TreeNodeModal';
import TreeNodeModal from '@/components/TreeNodeModal';
import router from 'umi/router';
import { clone, isEmpty } from '@/utils/tools';
import DragDropPartTable from './components/DragDropPartTable';
import DetailForm from './components/DetailForm';
import PageLoading from '@/components/PageLoading/index';
import CategoryIconFont from '@/components/CategoryIconFont';
const FormItem = Form.Item;
const confirm = Modal.confirm;

// 页面组件
class $idFrom extends Component {

    state = {
      iconfontVisible: false,                             // 品类图标模态框显示标识
      pageLoading: false,
      treeData: [],                                       // 零件树数据
      treeCategoryInfo: {},                               // 零件树上的当前品类数据
      treeNodeModalVisible: false,                        // 零件树的模态框展示标识
      currentChangeIndex: undefined,                      // 当前表格的索引值【模态框时用】
      fields: {
        brand_category_name: '',
        brand_category_code: '',
        brand_category_image: '',
        brand_category_status: 'DISABLE',
        children: []
      },
      isAdd: null,                                       // 当前页是否为更新状态
      vaildFields: false,                                  // 表单是否合法【添加品类时用】
      expandedKeys: [],
      selectedKeys: [],
    };

    componentDidMount() { 
      this.pageInitFn();
    };

    componentWillUnmount() {
      this.props.dispatch({ type: 'category_brandparts_id/clearState' });
    };

    pageInitFn = () => {
      const { dispatch, location } = this.props;
      let { fields } = this.state;
      let paths = location.pathname.split('/');
      let brand_category_id = paths[paths.length - 1];
      this.setState({pageLoading: true});
      if(brand_category_id == -1) {
        // 创建
        let newFields = clone(fields);
        let newChildren = clone(fields.children);
        newChildren.push({
          id: 0,
          category_name: '',
          brand_category_code: '',
          brand_category_image: '',
          part_tree: '',
          brand_category_status: 'DISABLE'
        });
        newFields.children = [...newChildren];
        this.setState({ fields: newFields, isAdd: true, pageLoading: false });
      } else {
        // 编辑
        dispatch({
          type: 'category_brandparts_id/fetchBrandCategoryProductDetail',
          payload: {
            brand_category_id,
            cb: data => this.setState({ fields: data, isAdd: false })
          }
        });
      }
      dispatch({
        type: 'category_brandparts_id/fetchCategoryTree',
        payload: {
          cb: () => {
            this.setState({pageLoading: false});
          }
        }
      });
    }

    // 清空本地state数据
    clearState = () => {
      this.setState({
        pageLoading: false,
        treeData: [],                                       // 零件树数据
        treeCategoryInfo: {},                               // 零件树上的当前品类数据
        treeNodeModalVisible: false,                        // 零件树的模态框展示标识
        currentChangeIndex: undefined,                      // 当前表格的索引值【模态框时用】
        fields: {
          brand_category_image: '',
          brand_category_name: '',
          brand_category_code: '',
          brand_category_status: 'DISABLE',
          children: []
        },
        isAdd: false,                                       // 当前页是否为更新状态
        vaildFields: false                                  // 表单是否合法【添加品类时用】
      });
    }

    // 拖拽表格后
    handleSetDataSource = (dataSource, hoverIndex) => {
      const { isAdd, fields } = this.state;
      if(isAdd) {
        let newFields = clone(fields);
        newFields.children = [...dataSource];
        this.setState({ fields: newFields });
      } else {
        this.setState({pageLoading: true});
        this.props.dispatch({
          type: 'category_brandparts_id/dragTable',
          payload: {
            brand_category_id: dataSource[hoverIndex].brand_category_id,
            brand_category_index: parseInt(hoverIndex, 10) + 1,
            cb: res => {
              if(res.code === 0) {
                this.clearState();
                this.pageInitFn();
              } else {
                this.setState({pageLoading: false});
              }
            }
          }
        });
      }
    };

    // 点击添加按钮
    handleAdd = () => {
      const { fields } = this.state;
      let newFields = {...fields};
      newFields.children = [...newFields.children];
      newFields.children.push({
        id: fields.children.length,
        category_name: '',
        brand_category_code: '',
        part_tree: '',
        brand_category_status: 'DISABLE'
      });
      this.setState({ fields: newFields });
      this.handleHasChangeFn(true);
      
    };
    addBrandpartsUserRecordList=()=>{
      const { dispatch } = this.props;
      const data={
        record_obj:{
          'operation':'添加产品'
        },
        record_page:'品类产品/品牌件/编辑',
        record_operations:'添加产品'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    // 保存产品信息
    onHandleSaveFn = (text, record, index) => {
      this.setState({pageLoading: true});
      const { fields } = this.state;
      let target = fields.children[index];
      this.props.dispatch({
        type: 'category_brandparts_id/vaildProductNameAdd',
        payload: {
          brand_category_id: fields.brand_category_id,
          brand_productList: {
            brand_category_code: target.brand_category_code,
            category_id: target.category_id,
            brand_category_index: parseInt(index, 10) + 1,
            brand_category_status:  target.brand_category_status,
            category_name: target.category_name
          },
          vaildcb: res => {
            if(res.code == 0) {
              this.handleHasChangeFn(false);
            } else {
              this.setState({pageLoading: false});
              let newFields = clone(fields);
              let newChildren = clone(fields.children);
              newChildren[index].nameError = 'error';
              newChildren[index].nameHelp = '产品名称已被使用';
              newFields.children = [...newChildren];
              this.setState({fields: newFields});
            }
          },
          createcb: res => {
            if(res.code == 0) {
              this.handleHasChangeFn(false);
              this.clearState();
              this.pageInitFn();
            } else {
              this.setState({pageLoading: false});
            }
          }
        }
      });
      this.addBrandpartsUserRecordList();
    }

    // 删除产品信息
    onHandleDeleteProductFn = idx => {
      confirm({
        content: '确定删除当前产品么？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.setState({pageLoading: true});
          const { dispatch, brandCategoryProductDetail } = this.props;
          const { fields } = this.state;
          if(fields.children[idx].brand_category_id) {
            // 删除已有数据
            dispatch({
              type: 'category_brandparts_id/deleteBrandCategory',
              payload: {
                brand_category_id: brandCategoryProductDetail.children[idx].brand_category_id,
                cb: res => {
                  if(res.code === 0) {
                    this.pageInitFn();
                  } else {
                    this.setState({pageLoading: false});
                  }
                }
              }
            });
          } else {
            // 删除新建的新数据
            let newFields = {...fields};
            let newChildren = [...fields.children];
            newChildren.splice(idx, 1);
            newFields.children = [...newChildren];
            this.setState({ fields: newFields, pageLoading: false });
          }
        }
      });
      const { dispatch, brandCategoryProductDetail } = this.props;
      const data={
        record_obj:{
          'brand_category_id': brandCategoryProductDetail.children[idx].brand_category_id,
        },
        record_page:'品类产品/品牌件/编辑',
        record_operations:'删除产品信息'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    };

    // 输入产品编码【表格输入框】
    onHandleInputChangeFn = (val, idx, dataIndex) => {
      const { fields } = this.state;
      let newFields = clone(fields);
      let newChildren = clone(fields.children);
      newChildren[idx][dataIndex] = val;
      newFields.children = [...newChildren];
      this.setState({fields: newFields});
    };
    
    // 编辑产品编码
    onHandleInputBlurFn = (val, idx, dataIndex) => {
      const { fields } = this.state;
      const { dispatch, brandCategoryProductDetail } = this.props;
      if(fields.children[idx].brand_category_id) {
        if(brandCategoryProductDetail.children[idx].brand_category_code != val) {
          // 查看是否可用 - 成功后执行编辑接口
          dispatch({
            type: 'category_brandparts_id/vaildProductCodeUpdate',
            payload: {
              brand_category_id: brandCategoryProductDetail.brand_category_id,
              product_id: brandCategoryProductDetail.children[idx].brand_category_id,
              product_code: val,
              cb: res => {
                let newFields = clone(fields);
                let newChildren = clone(fields.children);
                if(res.code == 0) {
                  this.pageInitFn();
                } else {
                  newChildren[idx].error = 'error';
                  newChildren[idx].help = '该产品编码已被使用';
                  newFields.children = [...newChildren];
                }
                this.setState({fields: newFields});
              }
            }
          });
        }
      } else {
        // 【编辑的时候】添加功能 - 校验成功直接保存
        dispatch({
          type: 'category_brandparts_id/vaildProductCodeAdd',
          payload: {
            brand_category_id: brandCategoryProductDetail.brand_category_id,
            product_id: '',
            product_code: val,
            cb: res => {
              let newFields = {...fields};
              let newChildren = [...newFields.children];
              if(res.code == 0) {
                newChildren[idx][dataIndex] = val;
                newChildren[idx].error = '';
                newChildren[idx].help = '';
                this.setState({fields: newFields});
                this.checkTableVaild(newFields);
              } else {
                newChildren[idx].error = 'error';
                newChildren[idx].help = '该产品编码已被使用';
                newFields.children = [...newChildren];
              }
              this.setState({fields: newFields});
            }
          }
        });
      }
    };

    // 查看品类名是否可用
    onVaildCategoryNameFn = () => {
      const { dispatch, form, brandCategoryProductDetail } = this.props;
      const { getFieldValue } = form;
      const { fields, isAdd } = this.state;
      if(isAdd) {
        if(fields.brand_category_name != getFieldValue('brand_category_name')) {
          this.handleHasChangeFn(true);
          dispatch({
            type: 'category_brandparts_id/vaildCategoryNameAdd',
            payload: {
              brand_category_name: getFieldValue('brand_category_name'),
              cb: res => {
                let newFields = {...fields};
                if(res.code == 0) {
                  newFields.brand_category_name = getFieldValue('brand_category_name');
                  newFields.brand_category_name_error = '';
                  newFields.brand_category_name_help = '';
                } else {
                  newFields.brand_category_name_error = 'error';
                  newFields.brand_category_name_help = '品类名已被使用';
                }
                this.setState({ fields: newFields });
              }
            }
          });
        }
      } else {
        if(fields.brand_category_name != getFieldValue('brand_category_name')) {
          dispatch({
            type: 'category_brandparts_id/vaildCategoryNameUpdate',
            payload: {
              brand_category_id: brandCategoryProductDetail.brand_category_id,
              brand_category_name: getFieldValue('brand_category_name'),
              cb: res => {
                let newFields = {...fields};
                if(res.code == 0) {
                  newFields.brand_category_name = getFieldValue('brand_category_name');
                  newFields.brand_category_name_error = '';
                  newFields.brand_category_name_help = '';
                } else {
                  newFields.brand_category_name_error = 'error';
                  newFields.brand_category_name_help = '品类名已被使用';
                }
                this.setState({ fields: newFields });
              }
            }
          });
        }
      }
    };

    // 查看品类编码是否可用
    onVaildCategoryCodeFn = () => {
      const { dispatch, form, brandCategoryProductDetail } = this.props;
      const { getFieldValue } = form;
      const { fields, isAdd } = this.state;
      if(isAdd) {
        if(fields.brand_category_code != getFieldValue('brand_category_code')) {
          this.handleHasChangeFn(true);
          dispatch({
            type: 'category_brandparts_id/vaildCategoryCodeAdd',
            payload: {
              brand_category_code: getFieldValue('brand_category_code'),
              cb: res => {
                let newFields = {...fields};
                if(res.code == 0) {
                  newFields.brand_category_code = getFieldValue('brand_category_code');
                  newFields.brand_category_code_error = '';
                  newFields.brand_category_code_help = '';
                } else {
                  newFields.brand_category_code_error = 'error';
                  newFields.brand_category_code_help = '该品类编码已被使用';
                }
                this.setState({ fields: newFields });
              }
            }
          });
        }
      } else {
        if(fields.brand_category_code != getFieldValue('brand_category_code')) {
          dispatch({
            type: 'category_brandparts_id/vaildCategoryCodeUpdate',
            payload: {
              brand_category_id: brandCategoryProductDetail.brand_category_id,
              brand_category_code: getFieldValue('brand_category_code'),
              cb: res => {
                let newFields = {...fields};
                if(res.code == 0) {
                  newFields.brand_category_code = getFieldValue('brand_category_code');
                  newFields.brand_category_code_error = '';
                  newFields.brand_category_code_help = '';
                } else {
                  newFields.brand_category_code_error = 'error';
                  newFields.brand_category_code_help = '该品类编码已被使用';
                }
                this.setState({ fields: newFields });
              }
            }
          });
        }
      }
    };

    // 零件树模态框显示状态
    onHandleTreeNodeModalFn = async (visble, index) => {
      const { dispatch, treeData } = this.props;
      const { fields } = this.state;
      let key;
      const finds = (array) => {
        for(let i = 0; i < array.length; i++) {
          if(array[0].children) {
            finds(array[0].children);
          } else {
            key = array[0].key;
            break;
          }
        }
      };
      finds(treeData);
      if(visble == true) {
        // 重置check状态
        this.setState({checkedValue: ''});
      }
      if(index !== undefined) {
        // 当前修改表格行索引
        this.setState({currentChangeIndex: index});
        if(this.state.isAdd) {
          let category_id = null;
          if(fields.children[index].category_id) {
            category_id = fields.children[index].category_id;
          } else {
            category_id = key;
          }
          await dispatch({ type: 'category_brandparts_id/fetchCategoryInfo', payload: category_id });
        } else {
          let category_id = null;
          if(fields.children[index].category_id) {
            category_id = fields.children[index].category_id;
          } else {
            // 点击添加新增的产品项
            category_id = key;
          }
          await dispatch({ type: 'category_brandparts_id/fetchCategoryInfo', payload: category_id });
        }
      }
      // 模态框显示状态
      this.setState({treeNodeModalVisible: visble});

      // 更新模态框显示状态
      this.toggleTreeNodeModal(true);
    };

    // 检查表格是否合法
    checkTableVaild = fields => {
      if(!fields) return;
      let flag = true;
      let array = fields.children;
      for(let i = 0; i < array.length; i++) {
        let item = array[i];
        if(!item.brand_category_code || !item.category_id) {
          flag = false;
          break;
        }
      }
      return flag;
    }

    // 品类状态修改
    onChangeCategoryStatusFn = async checked => {
      const { dispatch } = this.props;
      const { isAdd, fields } = this.state;
      if(!isAdd) {
        dispatch({
          type: 'category_brandparts_id/modifyBrandStatus',
          payload: {
            brand_category_id: fields.brand_category_id,
            brand_category_status: checked ? 'ENABLE' : 'DISABLE',
            cb: res => {
              if(res.code === 0) {
                this.pageInitFn();
              }
            }
          }
        });
      }
    }

    // 品类模板说明修改
    onChangeUpdateBrandCategoryImptDesc = desc => {
      const { dispatch } = this.props;
      const { isAdd, fields } = this.state;
      if(!isAdd) {
        dispatch({
          type: 'category_brandparts_id/updateBrandCategoryImptDesc',
          payload: {
            brand_category_id: fields.brand_category_id,
            brand_category_impt_desc: desc,
            cb: this.pageInitFn
          }
        });
        const data={
          record_obj:{
            'operation':'品类模板说明修改'
          },
          record_page:'品类产品/品牌件/编辑',
          record_operations:'品类模板说明修改'
        };
        dispatch({
          type:'managerRecord/fetchUserRecorListInsert',
          data:data
        });
      }
    }

    // 点击底部保存【创建品类】
    handleSubmit = e => {
      const { dispatch, form } = this.props;
      const { fields } = this.state;
      e.preventDefault();
      form.validateFields((err, values) => {
        if (!err) {
          this.setState({pageLoading: true});
          let obj = {
            brand_category_image: fields.brand_category_image,
            brand_category_name: values.brand_category_name,
            brand_category_code: values.brand_category_code,
            brand_category_impt_desc: values.brand_category_impt_desc,
            brand_category_status: values.brand_category_status ? 'ENABLE' : 'DISABLE',
            brand_productList: []
          };
          for(let i = 0; i < fields.children.length; i++) {
            let item = fields.children[i];
            let o = {
              brand_category_code: item.brand_category_code,
              category_id: item.category_id,
              category_name: item.category_name,
              brand_category_status: item.brand_category_status
            };
            obj.brand_productList.push(o);
            obj.cb = res => {
              if(res.code === 0) {
                this.handleHasChangeFn(false);
                
                router.goBack();
              }
              this.setState({pageLoading: false});
            };
            this.saveBrandpartsUserRecordList(obj);
          }
          dispatch({ type: 'category_brandparts_id/createCategory', payload: obj });
          
        }
        
      });
    };
    saveBrandpartsUserRecordList=(obj)=>{
      const { dispatch } = this.props;
      const data={
        record_obj:obj,
        record_page:' 品类产品/ 品牌件/管理',
        record_operations:'创建品牌件'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }
    // 更新零件树节点
    handleTreeNode = (checkedValue, nodeName, category_name) => {
      const { dispatch, brandCategoryProductDetail } = this.props;
      let { currentChangeIndex, isAdd, fields } = this.state;
      let newFields = clone(fields);
      let newChildren = clone(fields.children);
      newChildren[currentChangeIndex].category_parent_path = nodeName[0];
      newChildren[currentChangeIndex].category_id = checkedValue;
      newChildren[currentChangeIndex].category_name = category_name;
      newFields.children = [...newChildren];
      this.setState({fields: newFields});
      if(!isAdd) {
        // 编辑
        if(fields.children[currentChangeIndex].brand_category_id) {
          // 编辑已有的，新增的没有校验需要的id参数，所以追加的在保存时才校验
          dispatch({
            type: 'category_brandparts_id/vaildProductNameUpdate',
            payload: {
              brand_category_id: brandCategoryProductDetail.children[currentChangeIndex].brand_category_id, // 编辑提交用
              category_id: checkedValue, // 编辑提交用
              check_product_id: brandCategoryProductDetail.children[currentChangeIndex].brand_category_id, // 校验提交用
              check_brand_category_id: brandCategoryProductDetail.brand_category_id, // 校验提交用
              product_name: nodeName[0],
              cb: res => {
                if(res.code == 0) {
                  setTimeout(() => { this.pageInitFn(); }, 100);
                } else {
                  let newFields = clone(fields);
                  let newChildren = clone(fields.children);
                  newChildren[currentChangeIndex].nameError = 'error';
                  newChildren[currentChangeIndex].nameHelp = '该产品名称已被使用';
                  newFields.children = [...newChildren];
                  this.setState({fields: newFields});
                }
              }
            }
          });
        }
      }
    }

    // 修改产品状态
    onHandleProductStatusFn = (brand_category_id, checked, index) => {
      let { fields } = this.state;
      if(fields.children[index].brand_category_id) {
        // 编辑
        this.props.dispatch({
          type: 'category_brandparts_id/updateBrandCategoryStatus',
          payload: {
            brand_category_id: brand_category_id,
            brand_category_status: checked ? 'ENABLE' : 'DISABLE',
            cb: () => this.pageInitFn()
          }
        });
      } else {
        // 添加
        let newFields = clone(fields);
        let newChildren = clone(fields.children);
        for(let i = 0; i < newChildren.length; i++) {
          if(index == i) {
            newChildren[i].brand_category_status = checked ? 'ENABLE' : 'DISABLE';
            break;
          }
        }
        newFields.children = [...newChildren];
        this.setState({fields: newFields});
      }
    }

    // 标识是否已修改
    handleHasChangeFn = flag => {
      this.props.dispatch({type: 'category_brandparts_id/updateIsChanged', payload: flag});
    }

    // 保存选中的图标
    onConfirmIconfontFn = key => {
      const { dispatch, brandCategoryProductDetail } = this.props;
      const { isAdd, fields } = this.state;
      if(isAdd) {
        // 创建时
        this.setState({fields: {...fields, brand_category_image: key}});
      } else {
        // 编辑时，直接修改图片
        dispatch({
          type: 'category_brandparts_id/updateCategoryLogo',
          payload: {
            brand_category_id: brandCategoryProductDetail.brand_category_id,
            brand_category_image: key
          }
        });
        this.setState({fields: {...fields, brand_category_image: key}});
      }
      this.onChangeIconfontVisibleFn(false);
    }

    // 操作品类图标模态框显示状态
    onChangeIconfontVisibleFn = flag => this.setState({ iconfontVisible: flag });

    /**
     * 零件树
     */
    // 树节点选择
    handleTreeSelect = (selectedKeys, e) => {
      const { treeData, treeCategoryInfo, dispatch } = this.props;
      const { selected } = e;
      const { pos, isLeaf } = e.node.props;
      // 获取品类信息
      if(isLeaf) {
        // 选择到产品更新右侧属性值
        const cate = getSelectCategory(pos)(treeData);
        dispatch({
          type: 'category_brandparts_id/fetchCategoryInfo',
          payload: cate.key
        });
      }else{
        // 选择目录禁用确定按钮
        dispatch({
          type: 'category_brandparts_id/updateCategoryInfo',
          payload: {
            ...treeCategoryInfo,
            isDis: true
          }
        });
      }
      // 更新展开、选中状态
      const keys = selectedKeys[0].split('-');
      this.setState({
        expandedKeys: selected ? selectedKeys : [keys.slice(0, keys.length - 1).join('-')],
        selectedKeys: selected ? selectedKeys : []
      });
    }

    // 零件树节点模态框 确定
    handleTreeNodeModalOk = () => {
      const { treeData, treeCategoryInfo } = this.props;
      const { selectedKeys } = this.state;
      const selectedKey = selectedKeys[0];
      const { categoryParams } = treeCategoryInfo;
      let category_names = ['零件树'];
      const loop = (data, init = []) => {
        data.forEach(v => {
          if(selectedKey.indexOf(v.keys) === 0) {
            category_names.push(v.title);
            v.children && loop(v.children, init);
          }
        });
      };
      loop(treeData);
      this.handleTreeNode(categoryParams.category_id, [category_names.join('/')], categoryParams.category_name);
      this.handleHasChangeFn(true);
      this.handleTreeNodeModalCancel();
    };

    // 零件树节点模态框 取消
    handleTreeNodeModalCancel = ()=> {
      this.toggleTreeNodeModal(false);
    }

    // 切换零件树模态框显示状态
    toggleTreeNodeModal = visble => {
      this.setState({ treeNodeModalVisible : visble});
    }
    // 搜索树节点
    handleTreeInputChange = e => {
      const { treeData } = this.props;
      const value = e.target.value;
      let expandedKeys = [];
      const filterTitle = (data, init = []) => {
        for(let i = 0; i < data.length; i++) {
          const it = data[i];
          if(value && it.title.indexOf(value) > -1) {
            expandedKeys.push(it.keys);
          }
          if(it.children) {
            filterTitle(it.children);
          }
        }
      };
      filterTitle(treeData);
      this.setState({ expandedKeys });
    }

    render() {
      const { dispatch, form, treeData, treeCategoryInfo, isChanged } = this.props;
      const { getFieldValue } = form;
      let { isAdd, fields, treeNodeModalVisible, pageLoading, expandedKeys, selectedKeys } = this.state;
      const treeNodeModalProps = {
        visible: treeNodeModalVisible,
        expandedKeys,
        selectedKeys,
        PAGE_TYPE: 'add',
        CATEGORY_TREE: treeData,
        CATEGORY_INFO: treeCategoryInfo,
        onOk: this.handleTreeNodeModalOk,
        onCancel: this.handleTreeNodeModalCancel,
        onInputChange: this.handleTreeInputChange,
        onTreeSelect: this.handleTreeSelect
      };
      return (
        <React.Fragment>
          <Card>
            <Form layout="inline" onSubmit={ e => {this.handleSubmit(e);}}>
              {/* 顶部表单 */}
              {
                this.state.isAdd !== null &&
                            <DetailForm
                              form={form}
                              isAdd={isAdd}
                              fields={fields}
                              onChangeCategoryStatusFn={this.onChangeCategoryStatusFn}
                              onVaildCategoryNameFn={this.onVaildCategoryNameFn}
                              onVaildCategoryCodeFn={this.onVaildCategoryCodeFn}
                              onChangeIconfontVisibleFn={this.onChangeIconfontVisibleFn}
                              onChangeUpdateBrandCategoryImptDesc={this.onChangeUpdateBrandCategoryImptDesc}
                            />
              }

              <Divider style={{ marginTop: 15, marginBottom: 15 }} />

              {/* 所属产品信息 */}
              <Row type="flex" justify="space-between" style={{marginBottom: 20}}>
                <Col className="f20">所属产品信息</Col>
                <Col>
                  <Button type="primary" icon="plus" ghost onClick={() => {this.handleAdd();}}>添加产品</Button>
                </Col>
              </Row>

              {/* 拖拽表格 */}
              <DragDropPartTable
                className={'m-t-15'}
                bordered={true}
                pagination={false}
                rowKey={item => item.id}
                isAdd={isAdd}
                fields={fields}
                dataSource={fields.children}
                handleSetDataSource={this.handleSetDataSource}
                onHandleProductStatusFn={this.onHandleProductStatusFn}
                onHandleInputBlurFn={this.onHandleInputBlurFn}
                onHandleInputChangeFn={this.onHandleInputChangeFn}
                onHandleDeleteProductFn={this.onHandleDeleteProductFn}
                onHandleTreeNodeModalFn={this.onHandleTreeNodeModalFn}
                onHandleSaveFn={this.onHandleSaveFn}
              />

              {/* 保存操作 */}
              <Row className='text-right m-t-15'>
                {
                  isAdd &&
                                <FormItem>
                                  <Button
                                    type='primary'
                                    htmlType='submit'
                                    disabled={
                                      !getFieldValue('brand_category_name') ||
                                            !getFieldValue('brand_category_code') ||
                                            !this.checkTableVaild(this.state.fields) ||
                                            fields.brand_category_image == '' ||
                                            fields.brand_category_name_error == 'error' ||
                                            fields.brand_category_code_error == 'error' }
                                  >保存</Button>
                                </FormItem>
                }
                <FormItem style={{marginRight: 0}}>
                  <Button type='primary' ghost onClick={router.goBack}>返回上一页</Button>
                </FormItem>
              </Row>
            </Form>

            {/* 零件树节点名编辑模态框 */}
            {/* {
              treeNodeModalVisible &&
                        <TreeNodeModal
                          treeData={treeData}
                          treeCategoryInfo={treeCategoryInfo}
                          treeNodeModalVisible={this.state.treeNodeModalVisible}
                          onHandleTreeNodeModalFn={this.onHandleTreeNodeModalFn}
                          dispatch={dispatch}
                          handleTreeNodeModalOk={(checkedValue, nodeName) => {
                            this.handleTreeNode(checkedValue, nodeName);
                            this.handleHasChangeFn(true);
                          }}
                        />
            } */}
            {/* 零件树模态框 */}
            <TreeNodeModal {...treeNodeModalProps} />
            {/* 品类图标选择模态框 */}
            {
              this.state.iconfontVisible &&
                        <CategoryIconFont
                          value={fields.brand_category_image}
                          onConfirmIconfontFn={this.onConfirmIconfontFn}
                          onChangeIconfontVisibleFn={this.onChangeIconfontVisibleFn}
                        />
            }
          </Card>
          { pageLoading && <PageLoading /> }
          <Prompt when={isChanged && isAdd} message={() => ('当前页有未保存的数据，确定要放弃修改吗')} />
        </React.Fragment>
      );
    }
}

const PartPropertyForm = Form.create()($idFrom);
const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.category_brandparts_id
});
export default connect(mapStateToProps)(PartPropertyForm);

// 通过pos获取对应的品类
function getSelectCategory(pos) {
  let cate = {};
  return function fn(data){
    for(let i = 0; i < data.length; i++) {
      const it = data[i];
      if(it.keys === pos) {
        cate = it;
        break;
      }
      if(it.children) {
        fn(it.children);
      }
    }
    return cate;
  };
}
