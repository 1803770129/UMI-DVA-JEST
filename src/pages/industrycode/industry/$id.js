import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Select, Button, Input, Tag, Popover, message, InputNumber } from 'antd';
import router from 'umi/router';
import styles from './$id.less';
import UploadSingle from '@/components/UploadSingle';
const CheckableTag = Tag.CheckableTag;
const FormItem = Form.Item;
const Option = Select.Option;
const TextArea = Input.TextArea;

class FmsBrandDetail extends Component {

    state = {
      isAdd: false,
      indus_brand_id: '',
      fields: {
        indus_brand_level: '',
        indus_brand_id: '',
        indus_brand_name: '',
        indus_brand_imageurl: '',
        indus_brand_desc: '',
        categories: [],
        indus_brand_status: 'ENABLE',
      },
      vaildCategories: '',                    // 开通品类检验
      vaildBrandNameStatus: '',               // 品牌名称校验状态
      vaildBrandNameHelp: '',                 // 品牌名称校验提示
      vaildLogoStatus: '',                    // 品牌logo校验状态
      vaildLogoHelp: ''                       // 品牌logo校验提示
    }

    componentDidMount() {
      let paths = this.props.location.pathname.split('/');
      let indus_brand_id = paths[paths.length - 1];
      if(indus_brand_id == -1) {
        this.setState({ isAdd: true });
        this.pageCreateInitFn();
      } else {
        this.setState({ indus_brand_id, isAdd: false });
        this.pageEditInitFn(indus_brand_id);
      }
    }

    // 创建初始化
    pageCreateInitFn = () => this.fetchCategoriesPartsFn();

    // 编辑初始化
    pageEditInitFn = indus_brand_id => {
      this.props.dispatch({ 
        type: 'indus_id/fetchPageEditInit', 
        payload: {
          indus_brand_id,
          cb: (detail, categoriesList) => this.setState({ fields: { ...formatFmsBrandDetail(detail), categories: formatFmsCategoriesFn(categoriesList) } })
        }
      });
    }

    // 获取产品品类数据
    fetchCategoriesPartsFn = () => this.props.dispatch({ type: 'indus_id/fetchFmsCategoriesParts' });

    // 提交表单
    handleSubmit = e => {
      e.preventDefault();
      const { form, dispatch, fmsBrandDetail } = this.props;
      if(this.state.vaildBrandNameStatus == 'error') return;
      form.validateFields((err, values) => {
        if (!err) {
          const { fields, isAdd, indus_brand_id } = this.state;
          if(!fmsBrandDetail.indus_brand_imageurl) {
            // 品牌logo的检查
            this.setState({ vaildLogoStatus: 'error', vaildLogoHelp: '请上传品牌logo' });
          } else if (fields.categories.length === 0) {
            // 开通品类的检查
            this.setState({vaildCategories: 'error'});
          } else {
            this.setState({ vaildCategories: '', vaildLogoStatus: '', vaildLogoHelp: '' });
            let list = [...fields.categories].filter(item => !item.disabled).map(item => {
              return { brand_category_id: item.brand_category_id, parts: item.parts };
            });
            let params = {...values, categories: list};
            params.indus_brand_imageurl = fmsBrandDetail.indus_brand_imageurl;
            if(isAdd) {
              // 创建
              dispatch({ type: 'indus_id/createFmsBrands', payload: params });
            } else {
              // 编辑
              params.indus_brand_id = indus_brand_id;
              dispatch({ type: 'indus_id/updateFmsBrands', payload: params });
            }
          }
        } else {
          if(err.indus_brand_name) {
            let help = '';
            if(form.getFieldValue('indus_brand_name')) {
              help = '该品牌名称已存在';
            } else {
              help = '请输入';
            }
            this.setState({ vaildBrandNameStatus: 'error', vaildBrandNameHelp: help });
          }
        }
      });
      const { isAdd } = this.state;
      const data={
        record_obj:{
          'operation':isAdd?'创建行业协会':'编辑行业协会',
        },
        record_page:' 行业协会码管理/ 行业协会管理/创建 / 编辑',
        record_operations:isAdd?'保存创建的行业协会':'保存编辑后的行业协会'
      };
      dispatch({
        type:'managerRecord/fetchUserRecorListInsert',
        data:data
      });
    }

    // 添加/删除 - 已开通品类
    handleTagChange = (target, checked) => {
      if(target.disabled) return; // 已开通的品类不允许删除
      let newList = [...this.state.fields.categories];
      if(checked) {
        // 追加
        newList.push({brand_category_id: target.brand_category_id, brand_category_name: target.brand_category_name, parts: target.parts});
        this.setState({ fields: {...this.state.fields, categories: newList}, vaildCategories: '' });
      } else {
        // 移除
        this.handleClose(target);
      }
    }

    // 删除已开通品类
    handleClose = target => {
      let newList = [...this.state.fields.categories];
      let index = newList.map(item => item.brand_category_id).indexOf(target.brand_category_id);
      newList.splice(index, 1);
      this.setState({ fields: {...this.state.fields, categories: newList} });
    }

    // 离开焦点时，校验品牌名称
    checkBrandNameFn = () => {
      const { dispatch, form } = this.props;
      let indus_brand_name = form.getFieldValue('indus_brand_name');
      if(indus_brand_name) {
        dispatch({
          type: 'indus_id/fmsBrandCheck',
          payload: {
            indus_brand_id: this.state.indus_brand_id || '',
            indus_brand_name: indus_brand_name,
            cb: flag => {
              let status = '';
              let help = '';
              if(!flag) {
                // 品牌名称已重复
                status = 'error';
                help = '该品牌名称已存在';
                message.error('该品牌名称已存在');
              }
              this.setState({ vaildBrandNameStatus: status, vaildBrandNameHelp: help });
            }
          }
        });
      }
    }

    // 保存上传后的图片文件
    saveUploadFileFn = (info, callback) => {
      const { dispatch, fmsBrandDetail } = this.props;
      dispatch({
        type: 'indus_id/brandImageUpload',
        payload: {
          image: info,
          cb: imageUrl => {
            callback(imageUrl);
            dispatch({ type: 'indus_id/saveFmsBrandDetail', payload: {...fmsBrandDetail, indus_brand_imageurl: imageUrl} });
            this.setState({ vaildLogoStatus: '', vaildLogoHelp: '' });
          }
        }
      });
    }

    render() {
      const { fields, vaildBrandNameStatus, vaildBrandNameHelp, vaildLogoStatus, vaildLogoHelp } = this.state;
      const { loading, form, fmsCategoriesParts } = this.props;
      const { getFieldDecorator } = form;

      const formItemLayout = {
        labelCol: { 
          xs: { span: 24 }, sm: { span: 4 } 
        },
        wrapperCol: { 
          xs: { span: 24 }, sm: { span: 16 } 
        }
      };

      const tailFormItemLayout = {
        wrapperCol: {
          xs: { span: 24, offset: 0 }, sm: { span: 16, offset: 4 }
        }
      };

      const categoryExtra = (this.state.vaildCategories == 'error' && (<div className="m-t-5 red5">至少选择一个品类</div>));

      return (
        <Card loading={loading['indus_id/fetchPageEditInit']}>
          <Form onSubmit={e => this.handleSubmit(e)}>
            {/* 行业协会名称 */}
            <FormItem {...formItemLayout} label="行业协会名称" validateStatus={vaildBrandNameStatus} help={vaildBrandNameHelp}>
              {
                getFieldDecorator('indus_brand_name', {
                  initialValue: fields.indus_brand_name,
                  rules: [{ required: true, message: '请输入' }]
                })(
                  <Input placeholder='请输入' onBlur={() => this.checkBrandNameFn()} maxLength={50} autocomplete="off" />
                )
              }
            </FormItem>
                    
            {/* 行业协会logo */}
            <FormItem {...formItemLayout} validateStatus={vaildLogoStatus} help={vaildLogoHelp} label={<React.Fragment><span className={styles.redPoint}>*</span><span>行业协会logo</span></React.Fragment>}>
              <UploadSingle 
                imageUrl={this.props.fmsBrandDetail.indus_brand_imageurl}
                saveUploadFileFn={this.saveUploadFileFn}
              />
            </FormItem>

            {/* 行业协会描述 */}
            <FormItem {...formItemLayout} label="行业协会描述">
              {
                getFieldDecorator('indus_brand_desc', {
                  initialValue: fields.indus_brand_desc,
                  rules: [{ required: true, message: '请输入' }]
                })(
                  <TextArea rows={4} placeholder='请输入' maxLength="1024" />
                )
              }
            </FormItem>

            {/* 产品品类 */}
            <FormItem {...formItemLayout} label="产品品类">
              {
                formatFmsCategoriesPartsFn(fmsCategoriesParts, fields.categories).map(item => (
                  <Popover placement="topLeft" title={'产品包括'} content={item.parts.map(itm => itm.category_name).join('，')} overlayStyle={{ maxWidth: 300 }} key={item.brand_category_id}>
                    <CheckableTag
                      className="f14"
                      style={{ lineHeight: '30px', height: '30px', border: 'solid 1px #ddd' }}
                      key={item.brand_category_id}
                      checked={item.checked}
                      disabled={item.disabled}
                      onChange={checked => this.handleTagChange(item, checked)}
                    >
                      {item.brand_category_name}
                    </CheckableTag>
                  </Popover>
                ))
              }
            </FormItem>

            {/* 开通品类 */}
            <FormItem {...formItemLayout} label={<React.Fragment><i className={styles.redPoint}>*</i><span>开通品类</span></React.Fragment>} extra={categoryExtra}>
              <Card style={{ borderColor: this.state.vaildCategories ? '#f5222d' : '' }} bodyStyle={{ padding: '15px 10px' }}>
                {
                  fields.categories.length !== 0 && 
                                fields.categories.map(item => (
                                  <Tag
                                    className="f14"
                                    style={{ lineHeight: '30px', height: '30px' }}
                                    color="blue"
                                    closable={item.disabled ? false : true}
                                    onClose={() => this.handleClose(item)}
                                    key={item.brand_category_id}
                                  >
                                    {item.brand_category_name}
                                  </Tag>
                                ))
                }
                {
                  fields.categories.length === 0 && <div style={{color: '#999'}}>请选择要开通的产品品类</div>
                }
              </Card>
            </FormItem>

            {/* 启用状态 */}
            <FormItem {...formItemLayout} label="启用状态">
              {
                getFieldDecorator('indus_brand_status', {
                  initialValue: fields.indus_brand_status,
                  rules: [{ required: true, message: '必填项' }]
                })(
                  <Select style={{ width: 150 }}>
                    <Option value="ENABLE">启用</Option>
                    <Option value="DISABLE">禁用</Option>
                  </Select>
                )
              }
            </FormItem>

            {/* 匹配优先级 */}
            <FormItem {...formItemLayout} label="匹配优先级">
              {
                getFieldDecorator('indus_brand_level', {
                  initialValue: fields.indus_brand_level,
                  rules: [{required: true, message: '必填项'}]
                })(
                  <InputNumber min={1} />
                )
              }
            </FormItem>

            <FormItem {...tailFormItemLayout}>
              <Button type="primary" htmlType="submit" className="m-r-15">保存</Button>
              <Button type="primary" ghost onClick={() => router.goBack()}>返回上一页</Button>
            </FormItem>
          </Form>
        </Card>
      );
    }
}

const $id = Form.create()(FmsBrandDetail);
const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.indus_id
});

export default connect(mapStateToProps)($id);

// 格式化行业协会码详情数据
function formatFmsBrandDetail(o) {
  return {
    indus_brand_id: o.indus_brand_id,
    // 行业协会名称
    indus_brand_name: o.indus_brand_name,
    // 行业协会Logo
    indus_brand_imageurl: o.indus_brand_imageurl,
    // 行业协会描述
    indus_brand_desc: o.indus_brand_desc,
    // 开通品类
    categories: [],
    // 启用状态
    indus_brand_status: o.indus_brand_status,
    // 匹配优先级
    indus_brand_level: o.indus_brand_level
  };
}

// 格式化开通品类数据
function formatFmsCategoriesPartsFn(list, categories) {
  return list.map(item => {
    let obj = {};
    obj.brand_category_id = item.brand_category_id;
    // 品类名
    obj.brand_category_name = item.brand_category_name;
    // 是否已开通
    obj.checked = item.checked;
    obj.disabled = item.disabled;
    // 子产品
    obj.parts = item.parts.map(itm => { 
      return { 
        brand_category_id: itm.brand_category_id,
        category_id: itm.category_id,
        category_name: itm.category_name 
      }; 
    });
    // 是否被勾选
    if(categories.map(itm => itm.brand_category_id).includes(item.brand_category_id)) {
      obj.checked = true;
    }
    return obj;
  });
}

// 格式化已开通品类数据
function formatFmsCategoriesFn(list) {
  return list.map(item => {
    let obj = {};
    obj.brand_category_id = item.brand_category_id;
    // 品类名
    obj.brand_category_name = item.brand_category_name;
    // 子产品
    obj.parts = item.parts.map(itm =>  { 
      return { category_id: itm.category_id, brand_category_id: itm.brand_category_id }; 
    });
    obj.disabled = true; // 已开通的品类不允许删除
    return obj;
  });
}