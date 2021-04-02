import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Select, Radio  } from 'antd';
import { clone } from '@/utils/tools';
import DragDropPartTable from './DragDropPartTable';
import CreatePropertyModal from './CreatePropertyModal';
import CategoryIconFont from '@/components/CategoryIconFont';
import ENV from '@/utils/env';
import './PartPropertyForm.less';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const defaultCarmodelList = ['品牌', '主机厂', '车型', '年款', '上市年份', '停产年份', '排量', '发动机型号'];

// 零件树属性
class PartProperty extends Component {
  state = {
    iconfontVisible: false,                         // 品类图标模态框是否展示标识
    carPropertyValidate: '',                        // 车型属性校验【error有错误提示和红色边框】
    carPropertyHelp: '',                            // 车型属性提示文案
    categoryNameValidate: '',                       // 品类名称校验【error有错误提示和红色边框】
    categoryNameHelp: '',                           // 品类名称提示文案
    modalVisible: false,                            // 是否显示模态框
    defaultCarmodel: defaultCarmodelList
  };

  // 车型属性选择
  handleCarPropertyChange = values => {
    const { onChangeCarmodelListFn, onChangeAnyValueFn } = this.props;
    if (values.length > 20) {
      this.setState({ carPropertyValidate: 'error', carPropertyHelp: '最多可选择20项车型属性' });
    } else {
      onChangeCarmodelListFn(values);
      this.setState({ carPropertyValidate: '', carPropertyHelp: '' });
      onChangeAnyValueFn(true);
    }
  }

  // 表单提交
  handleSubmit = e => {
    e.preventDefault();
    const { form, onSavePropsFn } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onSavePropsFn(values);
      }
    });
  };

  // 点击 创建属性
  handleAddCategoryPropsFn = () => {
    const { dispatch, categoryList } = this.props;
    dispatch({ type: 'category_parts/updateModalInfo', payload: { enums: [''] } });
    dispatch({ type: 'category_parts/updateCurrentCategoryListIndex', payload: categoryList.length });
    dispatch({ type: 'category_parts/updateIsAddModal', payload: true });
    this.handleModalFn({ visible: true });
  }

  // 点击 列表 - 编辑操作
  onUpdateCategoryPropsFn = index => {
    const { dispatch, categoryList } = this.props;
    let newCategoryList = categoryList.filter(item => !item.deleted); // 去掉已被移除的
    dispatch({ type: 'category_parts/updateModalInfo', payload: newCategoryList[index] });
    dispatch({ type: 'category_parts/updateCurrentCategoryListIndex', payload: index });
    dispatch({ type: 'category_parts/updateIsAddModal', payload: false });
    this.handleModalFn({ visible: true });
  }

  // 点击 列表 - 删除操作
  /** 
   * 添加时，removeParams == index；
   * 编辑时，removeParams == category_pro_name
   */
  onRemoveCategoryPropsFn = (removeParams, category_pro_id) => {
    const { dispatch, isAddTree, categoryList, onChangeAnyValueFn } = this.props;
    // 1、深拷贝方法
    // const newFields = clone(fields);
    // newFields.categoryPro[index].deleted = 1;
    // 2、immutability-helper 方法
    // const newFields = {...fields};
    // const newDataSource = update(fields.categoryPro, {
    //     $splice: [[index, 1, {...fields.categoryPro[index], deleted: 1}]]
    // });
    // 3、浅拷贝，无副作用拷贝副本方法
    if (isAddTree) {
      let newList = [...categoryList];
      newList.splice(removeParams, 1);
      dispatch({ type: 'category_parts/updateCategoryList', payload: newList });
    } else {
      let newList = [...categoryList];
      let newcategoryList = [];
      if (category_pro_id) {
        // 删除已有的
        newcategoryList = newList.map(item => item.category_pro_id === category_pro_id ? { ...item, deleted: 1 } : item);
      } else {
        // 删除追加的
        newcategoryList = newList.map(item => item.category_pro_name === removeParams ? { ...item, deleted: 1 } : item);
      }
      dispatch({ type: 'category_parts/updateCategoryList', payload: newcategoryList });
    }
    onChangeAnyValueFn(true);
  }

  // 模态框控制
  handleModalFn = param => {
    const { dispatch, categoryList, isAddTree, currentCategoryListIndex, onChangeAnyValueFn } = this.props;
    const { values, visible } = param;
    // 点击模态框的确定键
    if (values) {
      if (isAddTree) {
        // 添加 - 点击保存
        categoryList.push(values);
        dispatch({ type: 'category_parts/updateCategoryList', payload: categoryList });
      } else {
        // 更新 - 点击保存
        let news = clone(categoryList);
        let item = news[currentCategoryListIndex];
        let val = { ...item, ...values };
        news[currentCategoryListIndex] = val;
        dispatch({ type: 'category_parts/updateCategoryList', payload: news });
      }
      onChangeAnyValueFn(true);
    }
    this.setState({ modalVisible: visible });
  };

  // 检验，并存储品类名称
  handleValidCategoryNameFn = (val, id) => {
    const { dispatch, categoryInfo, onChangeVaildCategoryNameFn, onChangeAnyValueFn } = this.props;
    onChangeVaildCategoryNameFn(val, id || '', res => {
      if (res.code === 0) {
        this.setState({ categoryNameValidate: '', categoryNameHelp: '' });
      } else {
        this.setState({ categoryNameValidate: 'error', categoryNameHelp: '该名称已被使用' });
      }
      dispatch({ type: 'category_parts/updateCategoryInfo', payload: { ...categoryInfo, category_name: val } });
      onChangeAnyValueFn(true);
    });
  }

  // 保存选中的图标
  onConfirmIconfontFn = key => {
    const { dispatch, categoryInfo } = this.props;
    dispatch({
      type: 'category_parts/updateCategoryInfo',
      payload: { ...categoryInfo, category_image: key }
    });
    this.onChangeIconfontVisibleFn(false);
  }

  // 操作品类图标模态框显示状态
  onChangeIconfontVisibleFn = flag => {
    this.setState({ iconfontVisible: flag });
  }

  render() {
    const { form, carmodelProList, categoryList, isAddTree, currentCategoryInTree, categoryInfo, carmodelList, handleSetDataSource } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { carPropertyValidate, carPropertyHelp, categoryNameValidate, categoryNameHelp } = this.state;
    let tableList = [...categoryList];
    if (isAddTree) {
      tableList = tableList.filter(item => item.deleted !== 1);
    } else {
      tableList = tableList.filter(item => item.deleted !== 1);
      for (let i = 0; i < tableList.length; i++) {
        let item = tableList[i];
        if (!item.category_pro_enum_val) {
          item.category_pro_enum_val = '';
          if (item.categoryProEnumParams) {
            for (let i = 0; i < item.categoryProEnumParams.length; i++) {
              item.category_pro_enum_val += item.categoryProEnumParams[i].category_pro_val_value;
              if (i != item.categoryProEnumParams.length - 1) {
                item.category_pro_enum_val += ',';
              }
            }
          } else {
            item.category_pro_enum_val = '';
          }
        }
      }
    }

    return (
      <React.Fragment>
        {/* 创建树节点 */}
        {
          isAddTree &&
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
            创建节点 / {currentCategoryInTree.categoryParams.category_name} / {getFieldValue('category_name')}
          </h3>
        }
        {/* 查看树节点 */}
        {
          !isAddTree &&
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
            编辑节点 /  {categoryInfo.category_name}
          </h3>
        }
        <Form onSubmit={e => { this.handleSubmit(e); }} className='part-property-form'>
          {/* 零件名称 */}
          <FormItem label='零件名称' validateStatus={categoryNameValidate} help={categoryNameHelp}>
            {
              getFieldDecorator('category_name', {
                initialValue: categoryInfo.category_name,
                rules: [{ required: true, message: '必填项' }]
              })(
                <Input placeholder='请输入'  autocomplete="off" onBlur={e => { this.handleValidCategoryNameFn(e.target.value, categoryInfo.category_id); }} />
              )
            }
          </FormItem>

          {/* 零件图片 */}
          <FormItem label='&nbsp;&nbsp;&nbsp;零件图片'>
            {
              // 有值
              categoryInfo.category_image &&
              <span className={'cur sopei_category sopei_category-' + categoryInfo.category_image} style={{ fontSize: 36 }} onClick={() => this.onChangeIconfontVisibleFn(true)}></span>
            }
            {
              // 无值
              categoryInfo.category_image == '' &&
              <span className="cur blue6" onClick={() => this.onChangeIconfontVisibleFn(true)}>请选择零件图片</span>
            }
          </FormItem>

          {/* 零件类型 */}
          <FormItem label='&nbsp;&nbsp;&nbsp;零件类型'>
            {
              getFieldDecorator('category_type', {
                initialValue: categoryInfo.category_type || 'PRODUCT'   // 默认为'PRODUCT'
              })(
                <RadioGroup>
                  {
                    ENV.category_types.map(v => <Radio key={v.key} value={v.key}>{v.name}</Radio>)
                  }

                </RadioGroup>
              )
            }
          </FormItem>

          {/* 车型属性 */}
          <FormItem label='&nbsp;&nbsp;&nbsp;车型属性' validateStatus={carPropertyValidate} help={carPropertyHelp}>
            {
              getFieldDecorator('carmodelProParams', {
                initialValue: carmodelList
              })(
                <Select mode='multiple' placeholder='最多可选择20项车型属性' onChange={values => { this.handleCarPropertyChange(values); }}>
                  {carmodelProList.map(item => (
                    <Option
                      key={item.cm_pro_id}
                      value={item.cm_pro_name}
                      disabled={this.state.defaultCarmodel.indexOf(item.cm_pro_name) != -1}>{item.cm_pro_name}
                    </Option>
                  )
                  )}
                </Select>
              )
            }
          </FormItem>

          {/* 创建属性按钮 */}
          <FormItem label='&nbsp;&nbsp;&nbsp;零件属性' className='text-right m-b-10'>
            <Button type='primary' ghost onClick={() => this.handleAddCategoryPropsFn()}>创建属性</Button>
          </FormItem>

          {/* 拖拽表格 */}
          <FormItem>
            <DragDropPartTable
              isAddTree={isAddTree}
              dataSource={tableList}
              onUpdateCategoryPropsFn={this.onUpdateCategoryPropsFn}
              onRemoveCategoryPropsFn={this.onRemoveCategoryPropsFn}
              handleSetDataSource={handleSetDataSource}
            />
          </FormItem>

          {/* 保存按钮 */}
          <FormItem className='text-right' colon={false}>
            <Button
              type='primary'
              className='m-l-15'
              htmlType='submit'
              disabled={!getFieldValue('category_name') || this.state.categoryNameValidate == 'error' || this.state.carPropertyValidate == 'error'}
            >
              保存
            </Button>
          </FormItem>

        </Form>
        {/* 创建属性模态框 */}
        {
          this.state.modalVisible &&
          <CreatePropertyModal
            visible={this.state.modalVisible}
            handleModalFn={this.handleModalFn}
          />
        }
        {/* 品类图标选择模态框 */}
        {
          this.state.iconfontVisible &&
          <CategoryIconFont
            value={categoryInfo.category_image}
            onConfirmIconfontFn={this.onConfirmIconfontFn}
            onChangeIconfontVisibleFn={this.onChangeIconfontVisibleFn}
          />
        }
      </React.Fragment>
    );
  }
};

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.category_parts
});

const PartPropertyForm = Form.create()(PartProperty);
export default connect(mapStateToProps)(PartPropertyForm);
