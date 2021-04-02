import { Modal, Card, Divider, Row, Col, Form, Input, Select, Cascader, Radio, Button } from 'antd';
import { isEmpty } from '@/utils/tools';
import styles from './SearchForm.less';
import moment from 'moment';
const { Option } = Select;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    xxl: { span: 4 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xxl: { span: 20 },
    sm: { span: 18 },
  },
};
const formItemLayout_two = {
  labelCol: {
    xxl: { span: 8 },
    sm: { span: 12 },
  },
  wrapperCol: {
    xxl: { span: 16 },
    sm: { span: 12 },
  },
};

// Cascader搜索过滤
const handleCmFilter = (inputValue, selectedOptions) => {
  return selectedOptions.some(option => {
    const v = option.v || option.label || option.title || '';
    return v.toLowerCase().indexOf(inputValue.toLowerCase().trim()) > -1;
  });
};

// 格式化月份
const getMonths = num => {
  return moment().subtract(num, 'months').format('YY年MM月');
};

export default ({ form, oem_cover_rate, cover_rate_list = [], BRAND_FAC_MOD_APPROVED_LIST, CARMODEL_PROPERTIES, FIELDS, onSearch }) => {
  const { getFieldDecorator } = form;
  const excludes = ['cm_brand', 'cm_factory', 'cm_model', 'cm_model_year', 'cm_displacement', 'cm_engine_model'];
  const carmodel_properties = CARMODEL_PROPERTIES.filter(v => !excludes.includes(v.cm_pro_column));
  return (

    <div className={styles.form_content}>
      <Row>
        <FormItem label={<span className="c9">新增车型时间</span>} {...formItemLayout}>
          {getFieldDecorator('cm_create_month', {
            initialValue: FIELDS.cm_create_month || ''
          })(
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="BEFORELAST">{getMonths(2)}</Radio.Button>
              <Radio.Button value="LAST">{getMonths(1)}</Radio.Button>
              <Radio.Button value="CURRENT">本月</Radio.Button>
              <Radio.Button value="">全部</Radio.Button>
            </Radio.Group>
          )}
          <span className="c9 m-l-10">可筛选近3个月，默认为全部</span>
        </FormItem>
      </Row>
      <Row>
        <FormItem label={<span className="c9">品牌/主机厂/车型</span>} {...formItemLayout}>
          {getFieldDecorator('brand_fac_mod', {
            initialValue: !FIELDS.brand_fac_mod?[cover_rate_list[0].cm_brand]: FIELDS.brand_fac_mod,
            // rules: [{ required: true, message: '必填项' }]
          })(
            <Cascader
              fieldNames={{ label: 'l', value: 'v', children: 'c' }}
              options={BRAND_FAC_MOD_APPROVED_LIST}
              allowClear={true}
              placeholder='请选择品牌/主机厂/车型'
              showSearch={{ filter: handleCmFilter, matchInputWidth: true, limit: false }}
              changeOnSelect={true}
            />
          )}
        </FormItem>
      </Row>
      <Row>
          <Col span={12}>
          <FormItem label={<span className="c9">年款</span>} {...formItemLayout_two}>
            {getFieldDecorator('cm_model_year', {
              initialValue: FIELDS.cm_model_year
            })(
              <Input placeholder='请输入' allowClear/>
            )}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem label={<span className="c9">排量</span>} {...formItemLayout_two}>
            {getFieldDecorator('cm_displacement', {
              initialValue: FIELDS.cm_displacement
            })(
              <Input placeholder='请输入' allowClear/>
            )}
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <FormItem label={<span className="c9">发动机型号</span>} {...formItemLayout_two}>
            {getFieldDecorator('cm_engine_model', {
              initialValue: FIELDS.cm_engine_model
            })(
              <Input placeholder='请输入' allowClear/>
            )}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem label={<span className="c9">是否覆盖</span>} {...formItemLayout_two}>
            {getFieldDecorator('cover_flag', {
              initialValue: FIELDS.cover_flag
            })(
              <Select>
                <Option value="">全部</Option>
                <Option value="COVER">已覆盖</Option>
                <Option value="UNCOVER">未覆盖</Option>
              </Select>
            )}
          </FormItem>
        </Col>
      </Row>
      <Row>
        {
          carmodel_properties.map(v => {
            return (
              <Col span={12} key={v.cm_pro_id}>
                <FormItem label={<span className="c9">{v.cm_pro_name}</span>} {...formItemLayout_two}>
                  {getFieldDecorator(v.cm_pro_column, {
                    initialValue: FIELDS[v.cm_pro_column]
                  })(
                    <Input placeholder='请输入' allowClear />
                  )}
                </FormItem>
              </Col>
            );
          })
        }
      </Row>
      <Row>
        <FormItem colon={false} label={' '} {...formItemLayout}>
          <Button type="primary" onClick={onSearch}>查询</Button>
        </FormItem>

      </Row>
    </div>

  );
};
