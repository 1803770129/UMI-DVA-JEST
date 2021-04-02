import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Input, Row, Col, Button, Icon, Select, Modal } from 'antd';
import './CreatePropertyModal.less';
const FormItem = Form.Item;
const Option = Select.Option;

// *************************** 模态框样式
const formItemLayout = {
  labelCol: {
    xs: { span: 24 }, sm: { span: 4 }
  },
  wrapperCol: {
    xs: { span: 24 }, sm: { span: 20 }
  }
};

const formItemLayout1 = {
  labelCol: {
    xs: { span: 24 }, sm: { span: 8 }
  },
  wrapperCol: {
    xs: { span: 24 }, sm: { span: 16 }
  }
};

const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 }, sm: { span: 20, offset: 4 }
  }
};
// ***************************
class CreatePropertyModalForm extends Component {

  state = {
    category_pro_group: '',
    category_pro_name: '',
    category_pro_type: 'NUMBER',
    category_pro_size: '',
    category_pro_unit: '',
    category_pro_tip:'',
    enumList: [],
    categoryProEnumParams: []
  };

  componentDidMount() {
    this.pageInit();
  };

  pageInit = () => {
    const { isAddModal, modalInfo, form } = this.props;
    if (isAddModal) {
      // 创建属性时
      this.setState({ enumList: [...this.state.enumList, { key: 'enum0', val: '' }] });
    } else {
      // 更新属性时
      let obj = {
        category_pro_group: modalInfo.category_pro_group,
        category_pro_name: modalInfo.category_pro_name,
        category_pro_type: modalInfo.category_pro_type,
        category_pro_size: modalInfo.category_pro_size,
        category_pro_tip:modalInfo.category_pro_tip,
        category_pro_unit: modalInfo.category_pro_unit,
        categoryProEnumParams: modalInfo.categoryProEnumParams || [],
        enumList: []
      };
      let arr = obj.categoryProEnumParams;
      if (arr.length !== 0) {
        for (let i = 0; i < arr.length; i++) {
          obj.enumList.push({ key: 'enum' + i, val: arr[i].category_pro_val_value });
        }
      } else {
        this.add();
      }
      form.setFieldsValue({ 'category_pro_name': modalInfo.category_pro_name });
      this.setState({ ...obj });
    }
  }

  // 移除枚举值
  remove = key => {
    const { enumList } = this.state;
    let newEnums = [...enumList];
    for (let i = 0; i < newEnums.length; i++) {
      if (newEnums[i].key == key) {
        newEnums.splice(i, 1);
      }
    }
    this.setState({ enumList: newEnums });
  };

  // 添加枚举值
  add = () => {
    const { enumList } = this.state;
    enumList.push({ key: 'enum' + new Date().getTime(), val: '' });
    this.setState({ enumList });
  };

  // 点击确定
  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form, categoryList, isAddModal, currentCategoryListIndex, handleModalFn, modalInfo } = this.props;
    form.validateFields((err, values) => {
      /**
          values
          {
              category_pro_group:"0",
              category_pro_name:"属性名称",
              category_pro_size:"1",
              category_pro_type:"NUMBER",
              category_pro_unit:"套",
              enum0:"A", // 如果有填枚举值
              enum1:"B", // 如果有填枚举值
              ...
          }
       */
      let newCategoryList = [...categoryList];
      if (isAddModal) {
        // 创建零件属性
        let list = []; // 存枚举值的数组
        for (let key in values) {
          if (key.indexOf('enum') !== -1) {
            if (values[key]) {
              list.push(values[key]);
            }
          }
        }
        let obj = {
          category_pro_name: values.category_pro_name,
          category_pro_type: values.category_pro_type,
          category_pro_unit: values.category_pro_unit,
          category_pro_size: values.category_pro_size,
          category_pro_tip:values.category_pro_tip,
          category_pro_group: values.category_pro_group,
          category_pro_enum_val: list.join(','),
          categoryProEnumParams: list.map((item, index) => {
            return { category_pro_val_value: item };
          })
        };
        switch (values.category_pro_type) {
          case 'NUMBER':
            obj.category_pro_size = '';
            obj.category_pro_enum_val = '';
            obj.categoryProEnumParams = [];
            break;
          case 'STRING':
            obj.category_pro_unit = '';
            obj.category_pro_enum_val = '';
            obj.categoryProEnumParams = [];
            break;
          case 'ENUM':
            obj.category_pro_unit = '';
            obj.category_pro_size = '';
            break;
          default:
        }
        newCategoryList.push(obj);
      } else {
        // 编辑零件属性
        if (this.handleComparePropsIsChangeFn(newCategoryList[currentCategoryListIndex], values)) {
          newCategoryList[currentCategoryListIndex].updated = 1;
        }
        let list = []; // 存枚举值的数组
        for (let key in values) {
          if (key.indexOf('enum') !== -1) {
            list.push(values[key]);
          }
        }
        let obj = {
          category_pro_name: values.category_pro_name,
          category_pro_type: values.category_pro_type,
          category_pro_unit: values.category_pro_unit,
          category_pro_size: values.category_pro_size,
          category_pro_tip:values.category_pro_tip,
          category_pro_group: values.category_pro_group,
          category_pro_enum_val: ''
        };
        // 找出被删除的枚举项
        if (modalInfo.categoryProEnumParams && modalInfo.categoryProEnumParams.length !== 0) {
          for (let i = 0; i < modalInfo.categoryProEnumParams.length; i++) {
            let modal = modalInfo.categoryProEnumParams[i];
            let flag = false;
            for (let j = 0; j < list.length; j++) {
              if (modal.category_pro_val_value == list[j]) {
                flag = true;
                break;
              }
            }
            if (!flag) {
              // 已删除
              modal.deleted = 1;
            }
          }
          // 找出新增的枚举项
          let newAdd = [];
          for (let i = 0; i < list.length; i++) {
            let flag = false;
            for (let j = 0; j < modalInfo.categoryProEnumParams.length; j++) {
              let modal = modalInfo.categoryProEnumParams[j];
              if (modal.category_pro_val_value == list[i]) {
                flag = true;
                break;
              }
            }
            if (!flag) {
              newAdd.push(list[i]);
            }
          }
          // 合并枚举项
          for (let i = 0; i < newAdd.length; i++) {
            modalInfo.categoryProEnumParams.push({
              category_pro_index: modalInfo.categoryProEnumParams.length + i,
              category_pro_val_value: newAdd[i]
            });
          }
          obj.categoryProEnumParams = modalInfo.categoryProEnumParams;
          obj.category_pro_enum_val = modalInfo.categoryProEnumParams.filter(item => item.deleted != 1).map(item => item.category_pro_val_value).join(',');
        } else {
          obj.categoryProEnumParams = [];
          for (let i = 0; i < list.length; i++) {
            obj.categoryProEnumParams.push({
              category_pro_index: i,
              category_pro_val_value: list[i]
            });
          }
          obj.category_pro_enum_val = list.join(',');
        }
        switch (values.category_pro_type) {
          case 'NUMBER':
            obj.category_pro_size = '';
            obj.category_pro_enum_val = '';
            obj.categoryProEnumParams = [];
            break;
          case 'STRING':
            obj.category_pro_unit = '';
            obj.category_pro_enum_val = '';
            obj.categoryProEnumParams = [];
            break;
          case 'ENUM':
            obj.category_pro_unit = '';
            obj.category_pro_size = '';
            break;
          default:
        }
        for (let i = 0; i < newCategoryList.length; i++) {
          if (currentCategoryListIndex == i) {
            if (!newCategoryList[i].categoryProEnumParams) {
              newCategoryList[i].categoryProEnumParams = [];
            }
            for (let key in newCategoryList[i]) {
              for (let k in obj) {
                if (key == k) {
                  newCategoryList[i][key] = obj[k];
                }
              }
            }
            break;
          }
        }
      }
      dispatch({ type: 'category_parts/updateCategoryList', payload: newCategoryList });
      handleModalFn({ visible: false });
    });
  };

  // 选择类型下拉框
  changeType = val => this.setState({ category_pro_type: val });

  // 点击模态框的确定键时，判断是否有更改数据
  // 有更改数据时，需要告知后台，与改品类是否被引用相关
  handleComparePropsIsChangeFn = (origin, news) => {
    let flag = false; // false未更改，true已更改
    if (origin.category_pro_type != news.category_pro_type) {
      flag = true;
    } else {
      if (origin.category_pro_name != news.category_pro_name || origin.category_pro_group != news.category_pro_group) {
        flag = true;
      } else {
        if (origin.category_pro_type == 'NUMBER' && origin.category_pro_unit != news.category_pro_unit) {
          flag = true;
        } else if (origin.category_pro_type == 'STRING' && origin.category_pro_size != news.category_pro_size) {
          flag = true;
        } else if (origin.category_pro_type == 'ENUM') {
          let olist = origin.category_pro_enum_val.split(',');
          let nlist = [];
          for (let key in news) {
            if (key.indexOf('enum')) {
              nlist.push(news[key]);
            }
          }
          if (olist.join() !== nlist.join()) {
            flag = true;
          }
        }
      }
    }
    return flag;
  }

  render() {
    const { form, visible, handleModalFn } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { category_pro_group, category_pro_name, category_pro_type, category_pro_size, category_pro_tip,category_pro_unit, enumList } = this.state;
    // 字符串正则
    const stringRegx = /^([1-9]\d?|100)$/;
    // 分组
    const groups = [
      { key: '无', val: '' },
      { key: '1', val: '1' },
      { key: '2', val: '2' },
      { key: '3', val: '3' },
      { key: '4', val: '4' }
    ];
    // 属性类型
    const categoryTypes = [
      { key: '数字', val: 'NUMBER' },
      { key: '枚举', val: 'ENUM' },
      { key: '字符串', val: 'STRING' },
      { key: '图片', val: 'IMAGE' }
    ];
    // 单位
    const categoryUnit = [
      { key: '无', val: '' },
      { key: '毫米', val: '毫米' },
      { key: 'mm', val: 'mm' },
      { key: '升', val: '升' },
      { key: 'L', val: 'L' },
      { key: '千克', val: '千克' },
      { key: 'kg', val: 'kg' },
      { key: '克', val: '克' },
      { key: 'g', val: 'g' },
      { key: '个', val: '个' },
      { key: '只', val: '只' },
      { key: '根', val: '根' },
      { key: '组', val: '组' },
      { key: '套', val: '套' },
      { key: '副', val: '副' },
      { key: '盘', val: '盘' },
      { key: '对', val: '对' },
      { key: '包', val: '包' },
      { key: '台', val: '台' },
      { key: '架', val: '架' },
      { key: '条', val: '条' },
      { key: '片', val: '片' },
      { key: '听', val: '听' },
      { key: '瓶', val: '瓶' },
      { key: '罐', val: '罐' },
      { key: '支', val: '支' },
      { key: '米', val: '米' },
      { key: '盒', val: '盒' },
      { key: '箱', val: '箱' },
      { key: '张', val: '张' },
      { key: '伏特', val: '伏特' },
      { key: 'A', val: 'A' },
      { key: 'Ah', val: 'Ah' },
      { key: '安培', val: '安培' },
      { key: 'V', val: 'V' },
      { key: 'kw', val: 'kw' },
    ];
    // 枚举
    const enumss = enumList.map((k, index) => {
      return (
        <FormItem key={k.key}>
          {
            getFieldDecorator(k.key, {
              initialValue: k.val
            })(
              <Input placeholder="请输入枚举值" style={{ width: '60%', marginRight: 8 }} disabled={category_pro_type != 'ENUM'} autocomplete="off" />
            )
          }
          {enumList.length > 1 ? (<Icon className="create-property-modal-delbtn" type="minus-circle-o" disabled={enumList.length === 1} onClick={() => this.remove(k.key)} />) : null}
        </FormItem>
      );
    });

    // 创建属性模态框
    const modalProps = {
      title: '属性项目',
      destroyOnClose: true,
      maskClosable: false,
      visible,
      onCancel: () => handleModalFn({ visible: false }),
      footer: [
        <Button key='ok'
          className="ant-btn ant-btn-primary"
          onClick={e => { this.handleSubmit(e); }}
          disabled={
            !getFieldValue('category_pro_name') ||
            getFieldValue('category_pro_type') == 'ENUM' && (this.state.enumList && this.state.enumList.map(item => item.key).map(itm => getFieldValue(itm)).filter(i => !!i).length === 0) ||
            getFieldValue('category_pro_type') == 'STRING' && !stringRegx.test(getFieldValue('category_pro_size'))
          }>确定</Button>,
        <Button key='cancle' onClick={() => handleModalFn({ visible: false })}>取消</Button>
      ]
    };

    return (
      <Modal {...modalProps} className="modalProperty">
        <Form>
          {/* 分组 */}
          <FormItem {...formItemLayout} label="分组" className="m-b-5">
            {
              getFieldDecorator('category_pro_group', {
                initialValue: category_pro_group
              })(
                <Select placeholder="如多组尺寸时，选择分组">
                  {
                    groups.map((item, index) => {
                      return <Option key={index} value={item.val}>{item.key}</Option>;
                    })
                  }
                </Select>
              )
            }
          </FormItem>
          {/* 属性名称 */}
          <FormItem {...formItemLayout} label="属性名称" className="m-b-5">
            {
              getFieldDecorator('category_pro_name', {
                initialValue: category_pro_name,
                rules: [{ required: true, message: '必填项' }]
              })(
                <Input  autocomplete="off" />
              )
            }
          </FormItem>
          {/* 属性类型 */}
          <Row>
            <Col span={12}>
              <FormItem {...formItemLayout1} label="属性类型" className="m-b-5">
                {
                  getFieldDecorator('category_pro_type', {
                    initialValue: category_pro_type,
                    rules: [{ required: true, message: '必填项' }]
                  })(
                    <Select onChange={this.changeType}>
                      {
                        categoryTypes.map((item, index) => {
                          return <Option key={index} value={item.val}>{item.key}</Option>;
                        })
                      }
                    </Select>
                  )
                }
              </FormItem>
            </Col>
            {/* 单位 */}
            <Col span={12}>
              <FormItem {...formItemLayout1} label="单位" className="m-b-5">
                {
                  getFieldDecorator('category_pro_unit', {
                    initialValue: category_pro_unit
                  })(
                    <Select disabled={category_pro_type != 'NUMBER'}>
                      {
                        categoryUnit.map((item, index) => {
                          return <Option key={index} value={item.val}>{item.key}</Option>;
                        })
                      }
                    </Select>
                  )
                }
              </FormItem>
            </Col>
          </Row>
          {/* 字符串 */}
          <FormItem {...formItemLayout} label="长度大小" className="m-b-5">
            {
              getFieldDecorator('category_pro_size', {
                initialValue: category_pro_size,
                rules: [{ pattern: stringRegx, message: '填写1~100之间的整数' }]
              })(
                <Input placeholder="1~100" disabled={category_pro_type != 'STRING' && category_pro_type != 'IMAGE'} />
              )
            }
          </FormItem>
          {/* 默认值 */}
          <FormItem {...formItemLayout} label="提示内容" className="m-b-5">
            {
              getFieldDecorator('category_pro_tip', {
                initialValue: category_pro_tip,
              })(
                <Input placeholder="请输入提示内容" disabled={category_pro_type != 'STRING'}/>
              )
            }
          </FormItem>
          {/* 枚举列表 */}
          <Row className="enumClassName" style={{ maxHeight: 130, overflowY: 'auto', marginLeft: 80 }}>{enumss}</Row>
          {/* 添加枚举按钮 */}
          <FormItem {...formItemLayoutWithOutLabel} className="m-b-5">
            <Button type="dashed" onClick={() => { this.add(); }} style={{ width: '60%' }} disabled={category_pro_type != 'ENUM'}>
              <Icon type="plus" /> 添加枚举值
            </Button>
          </FormItem>
        </Form>
      </Modal>
    );
  }
};

const CreatePropertyModal = Form.create()(CreatePropertyModalForm);

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.category_parts
});
export default connect(mapStateToProps)(CreatePropertyModal);
