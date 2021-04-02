
import React from 'react';
import { Form, Card, Select, Input, Row, Col, Button, Tooltip, Icon, Checkbox, Tag, Divider, Table } from 'antd';
import { groupFn, isEmpty } from '@/utils/tools';
import styles from './IdOeInfo.less';
import classNames from 'classnames';
import NoData from '@/components/NoData';
import Highlighter from 'react-highlight-words';
import ENV from '@/utils/env';
import UploadPicList from '@/components/UploadPicList';
import Editor from '@/components/Editor';
const FormItem = Form.Item;
const { Option } = Select;

const OeTooltipTitle = <>
  <div><strong>业务说明</strong></div>
  <div className="m-t-5">[拆分]：勾选部分OE编码后，点击“拆分”，勾选的OE编码将从此OE产品对应的编码中移除，并创建新的OE产品对应移除的OE编码，同时复制属性和适配车型。</div>
  <div className="m-t-5">[删除]：勾选部分OE编码后，点击“删除”勾选的OE编码将从此OE产品对应的编码中去掉，根据删除的OE编码不会再查到当前OE产品</div>
</>;

const columns = [...ENV.area_prices];

// 获取表单placeholder文字提示
const getPlaceholder = ({ category_pro_size, category_pro_type }) => {
  if (category_pro_size) {
    return `输入的字节长度不得超过${category_pro_size}`;
  }
  if (category_pro_type === 'NUMBER') {
    return '请输入数字';
  }
};

/**
 * category_type_forbids 全部类型
 * FUNC_IMPT_CODE:编码导入，
 * FUNC_IMPT_PIC:图片导入，
 * FUNC_ADD_CARMODEL_OE: 通过OE添加适配车型，
 * FUNC_ADD_CARMODEL_FMS: 通过大厂添加适配车型，
 * CONTENT_SKU_PRICE: 产品价格，
 * CONTENT_SKU_PIC: 产品图片',
 * CONTENT_SKU_EXCHANGE: 互换码信息，
 * CONTENT_SKU_DESC: 产品说明
 */


export default Form.create()(({ form, loading, codeVerify, oeCode, PAGE_TYPE, OEMSKU_PRICE, OE_INFO, OE_INFO_FIELDS, OE_CODES, EDITOR_STATE, original_img_desc, partsku_imgs, onOemskuCodeAdd, onOemskuCodeDelete, onOemskuCodeSplit, onCheckCode, onInputOecode, onSelectTreeNodeInput, onUpdatePropPic, onUploadPropPic, onUpdatePic, onUploadPic, onEditorChange, onEditorUpload }) => {
  const { getFieldDecorator } = form;
  const { categoryPros = [], carmodelBrand = '', categoryProsImages = [], category_type } = OE_INFO.data;
  const categoryProsGroup = groupFn(categoryPros);
  const { data: prices } = OEMSKU_PRICE;
  let pricesRow = {};
  columns.forEach(v => {
    // 构造行结构
    for (let i = 0; i < prices.length; i++) {
      const p = prices[i];
      if (v.dataIndex === p.oem_partsku_price_area_code) {
        pricesRow[v.dataIndex] = p;
      }
    }
    v.render = (row, record, index) => {
      return <>
        <FormItem>
          {
            getFieldDecorator(v.dataIndex, {
              initialValue: row.oem_partsku_price,
              rules: [{
                message: '价格格式错误',
                pattern: /^[0-9]+(.[0-9]{1,2})?$/
              }]
            })(
              <Input size="small" placeholder="输入价格" />
            )
          }
        </FormItem>
      </>;
    };
  });
  const dataSource = isEmpty(pricesRow) ? [] : [pricesRow];
  const FilterTxt = (text = '') => {
    return (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[oeCode]}
        autoEscape
        textToHighlight={text}
      />
    );
  };
  const isLoading = loading['oe_id/fetchCategoryTree'] || loading['oe_id/fetchOemskuEditTabInfo'] || loading['oe_id/fetchOemskuPrice'];
  return (
    <Card loading={isLoading}>
      <Form className={styles.oeInfoForm} autoComplete="off">

        {/* 基本信息 */}
        <Row style={{ fontWeight: '600' }} className="c9">基本信息</Row>
        {/* 零件树节点名 */}
        <Row gutter={16}>
          <Col span={6}>
            <FormItem label={<span className={classNames('c9')}>零件树节点名</span>} className={classNames(styles.formItem, styles.formItem_w120)}>
              {
                getFieldDecorator('category_name', {
                  initialValue: OE_INFO_FIELDS.category_name,
                  rules: [{ required: true, message: '必填项' }]
                })(
                  <Input placeholder="请选择" readOnly className='cur' onClick={onSelectTreeNodeInput} />
                )
              }
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem className={classNames(styles.formItem)}>
              <span className={classNames('c9')}> 车型品牌：{carmodelBrand === '' ? '审核后确定所属品牌' : carmodelBrand}</span>
            </FormItem>
          </Col>
        </Row>

        {/* OE组 */}
        <Row gutter={16}>
          <Col span={6}>
            <FormItem label={<span className={classNames('c9')}>OE组</span>} className={classNames(styles.formItem, styles.formItem_w120)} help={codeVerify}>
              <Input placeholder="请输入" value={oeCode} onChange={onInputOecode} />
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem className={styles.formItem}>
              <Button type='primary' className="m-r-15" onClick={onOemskuCodeAdd}>添加</Button>
              <span className="c9">请输入具有相同属性以及对应同品牌车型的OE</span>
            </FormItem>
          </Col>
          <Col span={8}>
            {
              PAGE_TYPE === 'edit' &&
              <FormItem className={classNames(styles.formItem, 'text-right')}>
                <Tooltip placement="leftTop" className="m-r-15 cur" title={OeTooltipTitle}>
                  <Icon type="info-circle-o" />
                </Tooltip>
                <Button className="m-r-15" type='primary' ghost onClick={onOemskuCodeSplit} disabled={OE_CODES.filter(v => v.checked).length === 0}>拆分</Button>
                <Button type='danger' onClick={onOemskuCodeDelete} disabled={OE_CODES.filter(v => v.checked).length === 0}>删除</Button>
              </FormItem>
            }
          </Col>
          <Col span={24}>
            <Card bordered={true} bodyStyle={{ padding: '12px 16px 0 16px', minHeight: '32px' }}>
              {/* 编辑时 且 oe码数组不为空 */}
              {
                PAGE_TYPE === 'edit' && OE_CODES.length > 0 &&
                OE_CODES.map((v, idx) => {
                  return (
                    <Checkbox key={idx} checked={v.checked} onChange={e => onCheckCode(e, idx)} className={styles.tagCheckbox}>
                      <Tag className={styles.tag}>{FilterTxt(v.oem_partsku_code)}</Tag>
                    </Checkbox>
                  );
                })

              }
              {/* 编辑时 且 oe码数组为空 */}
              {
                PAGE_TYPE === 'edit' && OE_CODES.length === 0 &&
                <Tag className={styles.tag}>虚拟OE码</Tag>
              }
              {/* 添加时 且 oe码数组不为空 */}
              {
                PAGE_TYPE === 'add' && OE_CODES.length > 0 &&
                OE_CODES.map((v, idx) => <Tag key={idx} className={styles.tag} closable={true} onClose={e => onCheckCode(e, idx)}>{FilterTxt(v.oem_partsku_code)}</Tag>)

              }
              {/* 添加时 且 oe码数组为空 */}
              {
                PAGE_TYPE === 'add' && OE_CODES.length === 0 &&
                <NoData title="请添加OE数据" />
              }
            </Card>
          </Col>
        </Row>
        <Divider style={{ marginTop: 0, marginBottom: 10 }} />

        {/* 属性信息 */}
        {
          categoryProsGroup.length > 0 && categoryProsGroup.map((group, idx) => {
            return (
              <div key={idx}>
                <Row style={{ fontWeight: '600' }} className={classNames('c9')}>{idx > 0 && '兼容'}属性信息</Row>
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
                          <FormItem label={<span className={classNames('c9')}>{category_pro_name}</span>} className={styles.formItem}>
                            {
                              category_pro_type !== 'ENUM' && getFieldDecorator(category_pro_id, {
                                initialValue: OE_INFO_FIELDS[category_pro_id],
                                rules: [rules]
                              })(
                                <Input addonAfter={category_pro_unit} placeholder={getPlaceholder(v)} />
                              )
                            }
                            {
                              category_pro_type === 'ENUM' && getFieldDecorator(category_pro_id, {
                                initialValue: OE_INFO_FIELDS[category_pro_id],
                                rules: [rules]
                              })(
                                <Select placeholder="请选择">
                                  {
                                    PAGE_TYPE === 'edit' &&
                                    v.category_pro_enum_val.map((it, itIdx) => <Option key={itIdx} value={it}>{it}</Option>)
                                  }
                                  {
                                    PAGE_TYPE === 'add' &&
                                    v.categoryProEnumParams.map((it, itIdx) => <Option key={it.category_pro_val_id} value={it.category_pro_val_value}>{it.category_pro_val_value}</Option>)
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

        <>
          {/* category_pro_type为IMAGE的属性，单独展示 */}
          {
            categoryProsImages.map((v, index) => {
              const { category_pro_name, category_pro_size, partsku_value_imgs = [] } = v;
              return (
                <div key={index}>
                  <Row style={{ fontWeight: '600' }} className={classNames('c9')}>{category_pro_name}</Row>
                  <UploadPicList imgs={partsku_value_imgs} size={category_pro_size} loading={loading['oe_id/fetchPropImageUpload']} onUpload={(file, callback) => onUploadPropPic(v, file, callback)} onUpdatePic={(imgs) => onUpdatePropPic(v, imgs)} />
                  
                </div>
              );
            })
          }
        </>

        {
          categoryProsGroup.length === 0 && PAGE_TYPE === 'add' &&
          <>
            <Row style={{ fontWeight: '600' }}>属性信息</Row>
            <NoData title="请选择零件树节点名显示适配的产品属性" />
          </>
        }

        {/* 产品价格 */}
        {
          // !category_type_forbids.includes('CONTENT_SKU_PRICE') &&
          <>
            <Row style={{ fontWeight: '600' }} className={classNames('c9')}>产品价格</Row>
            <Table bordered pagination={false} dataSource={dataSource} columns={columns} rowKey={(item, index) => index} className={styles.priceTable} />
          </>
        }

        {/* 产品图片 */}
        {
          // !category_type_forbids.includes('CONTENT_SKU_PIC') &&
          <>
            <Row style={{ fontWeight: '600' }} className={classNames('c9')}>
              产品图片：<span className="f12" style={{ fontWeight: 'normal' }}>最多9张800*800像素或以上的图片,支持.jpeg .png 格式</span>
            </Row>
            <Row className="m-t-10">
              <UploadPicList imgs={partsku_imgs} size={9} loading={loading['oe_id/fetchImageUpload']} onUpload={onUploadPic} onUpdatePic={onUpdatePic} />
            </Row>
            <Divider style={{ marginTop: 10, marginBottom: 10 }} />
          </>
        }


        {/* 产品说明 */}
        {
          // !category_type_forbids.includes('CONTENT_SKU_DESC') &&
          <>
            {/* 当产品的category_type 为：GUIDE指导的场合，“产品说明”增加长图生成功能 */}
            <Row style={{ fontWeight: '600' }} className={classNames('c9', 'm-b-10')}>产品说明</Row>
            <Editor initialContent={EDITOR_STATE.html.replace(/src=\"\/oem\/partsku\//g, 'src=\"' + ENV.imgDomain + '/oem/partsku/')} type="oem" isPreview={category_type === 'GUIDE'} original_img_desc={original_img_desc} onEditorChange={onEditorChange} onEditorUpload={onEditorUpload}/>
          </>
        }

      </Form>
    </Card>
  );
});
