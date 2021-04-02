import { Form, Select, Button } from 'antd';
import styles from './TopFrom.less';
import InputClose from '@/components/InputClose';
const FormItem = Form.Item;
const { Option } = Select;

export default ({ form, FIELDS, OEM_TMP_PARTNAME, OEM_TMP_CMBRAND, onSubmit }) => {
  const { getFieldDecorator, setFieldsValue, getFieldValue } = form;
  return (
    <Form layout="inline" autoComplete="off">
      <FormItem label="产品">
        {getFieldDecorator('oem_tmp_partsku_partname', {
          initialValue: FIELDS.oem_tmp_partsku_partname
        })(
          <Select allowClear placeholder='请选择' style={{ width: 200 }}>
            {
              OEM_TMP_PARTNAME.map(v => <Option key={v.oem_tmp_partsku_partname}>{v.oem_tmp_partsku_partname}</Option>)
            }
          </Select>
        )}
      </FormItem>
      <FormItem label="车型品牌">
        {getFieldDecorator('oem_tmp_partsku_cmbrand', {
          initialValue: FIELDS.oem_tmp_partsku_cmbrand
        })(
          <Select showSearch allowClear placeholder='请选择' style={{ width: 200 }}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          >
            {
              OEM_TMP_CMBRAND.map(v => <Option key={v.oem_tmp_partsku_cmbrand}>{v.oem_tmp_partsku_cmbrand}</Option>)
            }
          </Select>
        )}
      </FormItem>
      <FormItem label="OE码">
        {getFieldDecorator('oem_tmp_partsku_code', {
          initialValue: FIELDS.oem_tmp_partsku_code
        })(
          <span>
            <InputClose onClear={() => setFieldsValue({ 'oem_tmp_partsku_code': '' })} field={getFieldValue('oem_tmp_partsku_code')} />
          </span>
        )}
      </FormItem>
      <FormItem>
        <Button className="m-r-10" type="primary" onClick={onSubmit}>查询</Button>
      </FormItem>
    </Form>
  );
};
