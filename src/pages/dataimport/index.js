import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Input, Upload, Button, Icon, message, DatePicker } from 'antd';
import styles from './index.less';
import importImg from '@/assets/img/dataimport.png';
import export2Excel from '@/utils/export2Excel';
import moment from 'moment';
const FormItem = Form.Item;

// 上传表单模板
const UploadFromTemp = ({ field, index, onMessage }) => {

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 }, sm: { span: 4 }
    },
    wrapperCol: {
      xs: { span: 24 }, sm: { span: 16 }
    },
  };

  const submitItemLayout = {
    xs: { span: 24, offset: 0 }, sm: { span: 16, offset: 4 }
  };

  // 上传组件配置
  const config = {
    accept: '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel,.wps',
    fileList: field.fileList,
    beforeUpload: () => { return false; },
    onChange: info => onMessage({ type: 'change', data: { info, field, index } })
  };

  return (
    <Card className={styles.content} style={{ overflow: 'hidden' }} title={field.title}>
      <Form style={{ width: '50%', float: 'left' }}>
        <FormItem label="version版本号" {...formItemLayout}>
          <Input placeholder='请输入version版本号' value={field.version} onChange={event => onMessage({ type: 'version', data: { event, field, index } })} />
        </FormItem>
        <FormItem label="文件导入" {...formItemLayout}>
          <Upload {...config} >
            <Button><Icon type="upload" /> 选择文件</Button>
          </Upload>
        </FormItem>
        <FormItem wrapperCol={submitItemLayout}>
          <Button className="upload-demo-start" type="primary" onClick={() => onMessage({ type: 'upload', data: { field, index } })} disabled={field.fileList.length === 0 || !field.version} loading={field.uploading}>
            {field.uploading ? '文件上传中...' : '数据导入'}
          </Button>
        </FormItem>
      </Form>
      {
        field.origin == 'liyang' &&
        <div style={{ width: '50%', float: 'left' }}>
          <p>版本号：V+当前年份 + 月份 + 日期 例如：V20180530</p>
          <img src={importImg} />
        </div>
      }
    </Card>
  );
};

const emptyFields = [
  {
    title: '力扬车型数据导入',
    fileList: [],
    version: 'V' + getDateFn(),
    origin: 'liyang',
    uploading: false
  },
  {
    title: '精友车型数据导入',
    fileList: [],
    version: 'V' + getDateFn(),
    origin: 'easyepc',
    uploading: false
  }
];

// 车型数据导入
class Dataimport extends Component {
  state = {
    fields: emptyFields,
    create_time: ''
  };

  // 修改版本号
  handleVersion = ({ event, field, index }) => {
    let fields = [...this.state.fields];
    field = { ...field };
    field.version = event.target.value;
    fields[index] = field;
    this.setState({ fields });
  };

  // 获取上传文件
  handleChange = ({ info, field, index }) => {
    let fields = [...this.state.fields];
    let fileList = info.fileList;
    fileList = fileList.slice(0, 1);
    fileList[0].name = info.file.name;
    fields[index].fileList = fileList;
    fields[index].file = info.file;
    this.setState({ fields });
  };

  // 改变数据状态
  setStateFn = (fields, field, index) => {
    fields[index] = field;
    this.setState({ fields });
  };

  // 上传文件
  handleUpload = ({ field, index }) => {
    let fields = [...this.state.fields];
    // 加载处理
    field.uploading = true;
    this.setStateFn(fields, field, index);

    this.props.dispatch({
      type: 'dataimport/fetchImport',
      payload: {
        file: field.file,
        version: field.version,
        origin: field.origin,
        cb: code => {
          if (code === 0) {
            message.success('上传成功');
            this.setStateFn(fields, { uploading: false, version: 'V' + getDateFn(), origin: field.origin, fileList: [] }, index);
          } else {
            field.uploading = false;
            message.error('上传失败');
            this.setStateFn(fields, field, index);
          }
        }
      }
    });
  };

  // 子组件通知
  onMessage = msg => {
    let fnName = {
      version: 'handleVersion',
      change: 'handleChange',
      upload: 'handleUpload',
    };
    this[fnName[msg.type]](msg.data);
  };

  handleChangeDatePicker = (date, dateString) => {
    this.setState({ create_time: dateString });
  }
  handleDownloadVinJzRecords = () => {
    const { dispatch } = this.props;
    const { create_time } = this.state;
    let params = {};
    if(create_time) {
      params.create_time = create_time;
    }

    dispatch({
      type: 'dataimport/fetchVinJzRecords',
      payload: params,
      callback: (tHeader, tbody) => {
        export2Excel(tHeader, tbody, '力洋精准接口返回多个车型_' + moment().format('YYYY_MM_DD') + '.xls');
      }
    });


  }

  render() {
    const { loading } = this.props;
    return (
      <>
        {/*<Card className={styles.content} style={{ overflow: 'hidden' }} title={'力洋精准接口返回多个车型'} >*/}
        {/*  <DatePicker onChange={this.handleChangeDatePicker} />*/}
        {/*  <Button className="m-l-15" type="primary" onClick={this.handleDownloadVinJzRecords} loading={loading['dataimport/fetchVinJzRecords']}>点击下载</Button>*/}
        {/*</Card>*/}

        {
          this.state.fields.map((field, index) => {
            return (
              <UploadFromTemp key={index} field={field} index={index} onMessage={this.onMessage} />
            );
          })
        }
      </>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.loading.effects,
  ...state.dataimport
});

export default connect(mapStateToProps)(Dataimport);

// 获取当前日期【20181204】
function getDateFn() {
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  month = month > 9 ? '' + month : '0' + month;
  let day = date.getDate();
  day = day > 9 ? day : '0' + day;
  return year + month + day;
}
