import { Divider, Row, Col, Form, Input, Badge, Table, Button, Icon } from 'antd';
import classNames from 'classnames';
import styles from './SelectOeModal.less';
import router from 'umi/router';
const FormItem = Form.Item;

const columns = [{
  title: '车型品牌',
  dataIndex: 'cm_brand',
  width: 150
},{
  title: 'OE号',
  dataIndex: 'oem_partsku_codes',
  width: 150
},{
  title: '图片',
  dataIndex: 'oem_partsku_images',
  width: 85
},{
  title: '产品信息',
  dataIndex: 'oem_partsku_values',
},{
  title: '操作',
  dataIndex: 'operating',
  width: 60
}];

const tableProsp = {
  bordered: true,
  pagination: false,
  scroll: { y: 306 },
  rowKey: v => v.oem_partsku_id
};

const SelectOeModal = ({ loading, form, category, onHideSelectOeModal, OEM_COVER_PARTSKUS, OEM_COVER_PARTSKUS_SEARCH, onFetchOemCoverPartskusSearch, onPreviewImage, onRemove, onAdd, onSave }) => {
  const { validateFields, getFieldDecorator } = form;
  const { category_name } = category;
  const handleSubmit = () => {
    validateFields((err, values) => {
      if (!err) {
        const { code_keyword } = values;
        if(code_keyword.length >= 4){
          onFetchOemCoverPartskusSearch(code_keyword);
          // setFieldsValue({code_keyword: ''});
        }
      }
    });
  };
  const _columns = columns.map(v => {
    switch (v.dataIndex) {
      case 'oem_partsku_codes':
        return {
          ...v,
          render: (text, record, index) => {
            return (
              <span className="cur link" onClick={ () => router.push('/oe/list/' + record.oem_partsku_id + '?oem_partsku_id=' + record.oem_partsku_id)}>
                {
                  text.length > 0 ? text.join('；') : '-'
                }
              </span>
            );
          }
        };    
      case 'oem_partsku_values':
        return {
          ...v,
          render: (text, record, index) => {
            return (
                            
                            <>
                                {
                                  text.length > 0 ?
                                    text.map(pro => `${pro.category_pro_name}：${pro.oem_partsku_value}${pro.category_pro_unit && '(' + pro.category_pro_unit +')'}`).join('；') 
                                    : '-'
                                }
                            </>
            );
          }
        };    
      case 'oem_partsku_images':
        return {
          ...v,
          render: (text, record, index) => {
            const count = text.length > 1 ? text.length : 0; // 1张图不显示数量
            return (
                            <>
                                { text.length > 0 &&
                                    <Badge count={count}><span className={classNames(styles['title-head-pic'], 'iconfont icon-photoa cur')} onClick={()=> onPreviewImage(text)}></span></Badge>
                                }
                                {
                                  text.length === 0 &&
                                    '-'
                                }
                            </>
            );
          }
        };          
      default:
        return v;
    }
  });

  const columns_1 = _columns.map(v => {
    switch (v.dataIndex) {
      case 'operating':
        return {
          ...v,
          render: (text, record, index) => {
            return record.isDis ? <Icon type="plus-circle" theme="filled" className="gray cur-notAllowed f18" title="此数据已存在"/> : <Icon type="plus-circle" theme="filled" className="cur c6 f18" onClick={() => onAdd(record)} />;
          }
        };
      default:
        return v;
    }
  });

  const columns_2 = _columns.map(v => {
    switch (v.dataIndex) {
      case 'operating':
        return {
          ...v,
          render: (text, record, index) => {
            return <Icon type="minus-circle" theme="filled" className="cur c6 f18" onClick={() => onRemove(record)} />;
          }
        };          
      default:
        return v;
    }
  });

  return (
        <>
            <Row>
              <Form layout="inline" autoComplete="off">
                <FormItem label={<span className="c9">{category_name}</span>}>
                  {getFieldDecorator('code_keyword', {
                    initialValue: ''
                  })(
                    <Input placeholder='必须超过4个（字母/数字）才允许查询' style={{ width: 280}} allowClear />
                  )}
                </FormItem>
                <FormItem>
                  <Button type="primary" ghost onClick={handleSubmit}>查询</Button>
                </FormItem>
                <FormItem>
                  <span className="c9">查询范围：属于当前车型品牌的已审核通过的OE产品</span>
                </FormItem>
              </Form>
            </Row>
            
            <Row className="m-t-10 m-b-10">待匹配OE产品</Row>
            <Table className={styles.table_content_header} loading={loading['oe_cmcover/fetchOemCoverPartskusSearch']} dataSource={[]} {...tableProsp} columns={columns_1} />
            <Table className={styles.table_content} loading={loading['oe_cmcover/fetchOemCoverPartskusSearch']}  showHeader={false} dataSource={OEM_COVER_PARTSKUS_SEARCH} {...tableProsp} columns={columns_1} />

            <Row className="m-t-10 m-b-10">已匹配OE产品</Row>
            <Table className={styles.table_content_header} loading={loading['oe_cmcover/fetchOemCoverPartskus']} dataSource={[]} {...tableProsp} columns={columns_2} />
            <Table className={styles.table_content} loading={loading['oe_cmcover/fetchOemCoverPartskus']}  showHeader={false} dataSource={OEM_COVER_PARTSKUS} {...tableProsp} columns={columns_2}  />

            <Row type="flex" justify="space-between" className="m-t-10 m-b-10">
              <Col span={12}><span className="gold6">提示：匹配关系如需备注说明，请点击OE号到OE的适配车型页面操作；</span></Col>
              <Col span={12} className="text-right">
                <Button onClick={onHideSelectOeModal}>取消</Button>
                <Divider type="vertical" />
                <Button type="primary" onClick={onSave}>保存</Button>
              </Col>
            </Row>
        </>
  );
};

const SelectOeModalForm = Form.create()(SelectOeModal);
export default SelectOeModalForm;
