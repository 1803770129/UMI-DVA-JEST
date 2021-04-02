
import React from 'react';
import { Form, Card, Select, Input, Row, Col, Button, Tooltip, Icon, Checkbox, Tag, Divider, Table } from 'antd';
import { groupFn, isEmpty } from '@/utils/tools';
import styles from './IdPartInfo.less';
import classNames from 'classnames';
import NoData from '@/components/NoData';
import UploadPicList from '@/components/UploadPicList';
import Editor from '@/components/Editor';
import ENV from '@/utils/env';
const FormItem = Form.Item;
const { Option } = Select;

// 获取表单placeholder文字提示
const getPlaceholder = ({ category_pro_size, category_pro_type }) => {
  if (category_pro_size) {
    return `输入的字节长度不得超过${category_pro_size}`;
  }
  if (category_pro_type === 'NUMBER') {
    return '请输入数字';
  }
};

export default Form.create()(({ form, loading, partsku_imgs, STD_SKU_ID_FIELDS, STDSKU_INFO, EDITOR_STATE, original_img_desc, onUploadPic, onUpdatePic, onEditorChange, onEditorUpload, onUploadPropPic, onUpdatePropPic }) => {
  const { getFieldDecorator } = form;
  const { data = {} } = STDSKU_INFO;
  const { partsku_vals = [], partsku_val_imgs = [], category_type } = data;
  const categoryProsGroup = groupFn(partsku_vals);
  const { category_name = '-', std_partsku_code = '', partsku_prices = [] } = STD_SKU_ID_FIELDS;
  const std_partsku_price = partsku_prices.length > 0 ? partsku_prices[0].std_partsku_price : '';
  return (
    <Card loading={loading['std_sku_id/fetchCategoryPro']}>
      <Form className={styles.partInfo} autoComplete="off">

        {/* 基本信息 */}
        <Row className="c9" style={{ fontWeight: '600' }}>基本信息</Row>
        {/* 零件树节点名 */}
        <Row gutter={16}>
          <Col span={6}>
            <FormItem label={<span className="c9">产品</span>} className={classNames(styles.formItem, styles.formItem_w120)}>
              {category_name}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label={<span className="c9">标准码</span>} className={styles.formItem}>
              {std_partsku_code}
            </FormItem>
          </Col>
        </Row>

        <Divider style={{ marginTop: 0, marginBottom: 10 }} />

        {/* 属性信息 */}
        {
          categoryProsGroup.length > 0 && categoryProsGroup.map((group, idx) => {
            return (
              <div key={idx}>
                <Row className="c9" style={{ fontWeight: '600' }}>{idx > 0 && '兼容'}属性信息</Row>
                <Row gutter={16}>
                  {
                    group.map((v, idx) => {
                      let rules = {};
                      const { category_pro_size, category_pro_name, category_pro_id, category_pro_type, category_pro_unit } = v;

                      if (category_pro_size !== '') {
                        rules.max = parseInt(category_pro_size, 10);
                        rules.message = `只允许输入${category_pro_size}个字符`;
                      }
                      // if (category_pro_type === 'NUMBER') {
                      //   rules.message = '请输入数字';
                      //   rules.pattern = /^[0-9]+(.[0-9]{1,2})?$/;
                      // }
                      return (
                        <Col span={6} key={category_pro_id}>
                          <FormItem label={<span className="c9">{category_pro_name}</span>} className={styles.formItem}>
                            {
                              category_pro_type !== 'ENUM' && getFieldDecorator(category_pro_id, {
                                initialValue: STD_SKU_ID_FIELDS[category_pro_id],
                                rules: [rules]
                              })(
                                <Input addonAfter={category_pro_unit} placeholder={getPlaceholder(v)} />
                              )
                            }
                            {
                              category_pro_type === 'ENUM' && getFieldDecorator(category_pro_id, {
                                initialValue: STD_SKU_ID_FIELDS[category_pro_id],
                                rules: [rules]
                              })(
                                <Select placeholder="请选择" >
                                  {
                                    v.category_pro_enum_val.map((it, itIdx) => <Option key={itIdx} value={it}>{it}</Option>)

                                  }
                                </Select>
                              )
                            }
                          </FormItem>
                        </Col>
                      );
                    })
                  }
                </Row>
                <Divider style={{ marginTop: 5, marginBottom: 10 }} />
              </div>
            );
          })
        }
        {
          categoryProsGroup.length === 0 &&
          <>
            <Row className="c9" style={{ fontWeight: '600' }}>属性信息</Row>
            <NoData title="暂无属性信息" />
          </>
        }

        <>
          {/* category_pro_type为IMAGE的属性，单独展示 */}
          {
            partsku_val_imgs.map((v, index) => {
              const { category_pro_name, category_pro_size, partsku_value_imgs = [] } = v;
              return (
                <div key={index}>
                  <Row style={{ fontWeight: '600' }} className={classNames('c9')}>{category_pro_name}</Row>
                  <UploadPicList imgs={partsku_value_imgs} size={category_pro_size} loading={loading['std_sku_id/fetchPropImageUpload']} onUpload={(file, callback) => onUploadPropPic(v, file, callback)} onUpdatePic={(imgs) => onUpdatePropPic(v, imgs)} />
                </div>
              );
            })
          }
        </>

        {/* 产品价格 */}
        {
          // !category_type_forbids.includes('CONTENT_SKU_PRICE') &&
          <>
            <Row className="c9" style={{ fontWeight: '600' }}>产品价格</Row>
            <Row gutter={16}>
              <Col span={6}>
                <FormItem label={<span className="c9">参考价格</span>} className={styles.formItem}>
                  {getFieldDecorator('std_partsku_price', {
                    initialValue: std_partsku_price,
                    rules: [{
                      message: '请输入数字',
                      pattern: /^[0-9]+(.[0-9]{1,2})?$/
                    }]
                  })(
                    <Input placeholder="请输入" addonAfter="元" />
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem>
                  <span className="c9">搜配官方参考价格</span>
                </FormItem>
              </Col>
            </Row>
          </>
        }

        {/* 产品图片 */}
        {
          // !category_type_forbids.includes('CONTENT_SKU_PIC') &&
          <>
            <Row className="c9" style={{ fontWeight: '600' }}>
              产品图片：<span className="f12 c9" style={{ fontWeight: 'normal' }}>最多9张800*800像素或以上的图片,支持.jpeg .png 格式</span>
            </Row>
            <Row className="m-t-10">
              {/* 图片上传子组件 */}
              <UploadPicList imgs={partsku_imgs} size={9} loading={loading['std_sku_id/fetchImageUpload']} onUpload={onUploadPic} onUpdatePic={onUpdatePic} />
            </Row>
            <Divider style={{ marginTop: 10, marginBottom: 10 }} />
          </>
        }


        {/* 产品说明 */}
        {
          // !category_type_forbids.includes('CONTENT_SKU_DESC') &&
          <>
            <Row className="c9 m-b-10" style={{ fontWeight: '600' }}>产品说明</Row>
            {/* 当产品的category_type 为：GUIDE指导的场合，“产品说明”增加长图生成功能 */}
            <Editor initialContent={EDITOR_STATE.html.replace(/src=\"\/std\/partsku\//g, 'src=\"' + ENV.imgDomain + '/std/partsku/')} type="std" isPreview={category_type === 'GUIDE'} original_img_desc={original_img_desc} onEditorChange={onEditorChange} onEditorUpload={onEditorUpload} />
          </>
        }
        
      </Form>
    </Card>
  );
});
