import React, { Component } from 'react';
import { Card, Table , Button , Spin , Modal , Form, Input , Select , Row ,Col} from 'antd';
import styles from '../index.less';
import { connect } from 'dva';
import router from 'umi/router';
const { confirm } = Modal;
const FormItem = Form.Item;
const { Option } = Select;
class UserColor extends Component {
  state={
    page:this.props.COLORPAGES.page,
    pageCount:this.props.COLORPAGES.pageCount
  }
  componentDidMount() {
    const {COLORPAGES}=this.props;
    this.fetchThemeColors(COLORPAGES);
  }
    fetchThemeColors=async(parmas)=>{
      await this.props.dispatch({
        type:'personal/fetchThemeColors',
        payload:parmas
      });
    }

    delColor=(id)=>{
      confirm({
        content: '确定删除该颜色？',
        onOk:()=> {
          this.props.dispatch({
            type:'personal/fetchdeleteThemeColor',
            data:{app_theme_color_id:id}
          });
        },
        onCancel() {
          // console.log('Cancel');
        },
      });

    }
    exportColor=async()=>{
      await this.props.dispatch({
        type:'personal/fetchColorDownload',
        callback:(res)=>{
          const element = document.createElement('a');
          const file = new Blob([res.data], {type: 'text/wxss'});
          element.href = URL.createObjectURL(file);
          element.download = 'theme.wxss';
          document.body.appendChild(element);
          element.click();
        }
      });
    }
    searchColor=(e)=>{
      e.preventDefault();
      const { form } = this.props;
      form.validateFields(async(err, values) => {
        let parmas={
          page:this.state.page,
          pageCount:this.state.pageCount,
          app_theme_color_group:values.app_theme_color_group,
          // app_theme_color_code:values.app_theme_color_code,
          // app_theme_color_hex:values.app_theme_color_hex
        };
        this.fetchThemeColors(parmas);
      });
    }
    render() {
      const { COLORLIST,loading ,COLORPAGES,form} = this.props;
      const {getFieldDecorator}=form;
      const layout = {
        labelCol: { span: 2 },
        wrapperCol: { span: 14 },
      };
      let standard=[];
      if(COLORLIST['STANDARD']){
        for(let val in COLORLIST['STANDARD']){
          COLORLIST['STANDARD'][val].forEach(item=>{
            standard.push(item);
          });
        }
      }
      let grouplist=[];
      if(COLORLIST['STANDARD']){
        for(let st in COLORLIST['STANDARD']){
          grouplist.push(st);
        }
      }
      const columns = [
        {
          title: '颜色Id',
          dataIndex: 'app_theme_color_id',
          key: 'app_theme_color_id',
        },
        {
          title: '颜色分组',
          dataIndex: 'app_theme_color_group',
          key: 'app_theme_color_group',
        },
        {
          title: '颜色code',
          dataIndex: 'app_theme_color_code',
          key: 'app_theme_color_code ',
        },
        {
          title: 'HEX',
          dataIndex: 'app_theme_color_hex',
          key: 'app_theme_color_hex',
        },
        {
          title: '颜色展示',
          //   dataIndex: 'app_theme_color_hex',
          key: 'show_color',
          render:(record) =>(
            <div style={{width:30,height:30,backgroundColor:record.app_theme_color_hex}}></div>
          )
        },
        {
          title: '操作',
          key: 'action',
          render: (text, record) => (
            <div>
              {
                record.canEdit?
                  <span><a onClick={()=>router.push('usercolor/'+record.app_theme_color_id)}>编辑</a> | <a onClick={()=>this.delColor(record.app_theme_color_id)}>删除</a></span>
                  :
                  <span><span style={{color:'grey'}}>编辑</span> | <span style={{color:'grey'}}>删除</span></span>
              }
            </div>
          ),
        },
      ];
      const paginations={
        pageSize:this.state.pageCount,
        current:this.state.page,
        total: parseInt(COLORLIST.count,10),
        showSizeChanger: true,
        showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`,
        onShowSizeChange: (current, perpage) => onHandlePageSizeChangeFn(current, perpage),
        onChange: page => onHandlePageChangeFn(page)
      };
      const onHandlePageSizeChangeFn = (current, perpage) => {
        this.setState({
          pageCount:perpage
        });
        this.fetchThemeColors({...COLORPAGES, pageCount:perpage, page: 1});
      };
      const onHandlePageChangeFn = page => {
        this.setState({
          page:page
        });
        this.fetchThemeColors({pageCount:this.state.pageCount, page:page });
      };
      return (
        <Card className={styles.factoryCategoryList}>
          <Spin spinning={loading['personal/fetchThemeColors']}>
            <Button type="primary" style={{marginBottom:20}} onClick={()=>router.push('usercolor/-1')}>添加颜色</Button>
            <Button type="primary" style={{marginBottom:20,marginLeft:20}} onClick={()=>this.exportColor()}>导出颜色配置文件</Button>
            <div style={{marginBottom:10}}>官方基础版颜色（OFFICAL）：</div>
            {
              COLORLIST['OFFICAL']&&
              <Table dataSource={COLORLIST['OFFICAL']['SOPEI']} columns={columns} rowKey={(record, index) => index} bordered />
            }
            <div style={{marginBottom:10}}>可用的标准颜色（STANDARD）：</div>
            <Form layout="inline" style={{marginBottom:20}} autoComplete="off" onSubmit={e=>this.searchColor(e)}>
              <Row type="flex">
                <Col>
                  <FormItem label="颜色分组">
                    {
                      getFieldDecorator(
                        'app_theme_color_group'
                      )(
                        <Select style={{width:200}} allowClear>
                          {
                            grouplist.map((item,index)=>{
                              return(
                                <Option value={item} key={index}>{item}</Option>
                              );
                            })
                          }
                        </Select>
                      )
                    }

                  </FormItem>
                </Col>
                {/* <Col>
                  <FormItem label="颜色code">
                    {
                      getFieldDecorator(
                        'app_theme_color_code'
                      )(
                        <Input placeholder='请按照输入颜色code' allowClear />
                      )
                    }
                  </FormItem>
                </Col>
                <Col>
                  <FormItem label="HEX">
                    {
                      getFieldDecorator(
                        'app_theme_color_hex'
                      )(
                        <Input placeholder='请按照输入颜色hex值' allowClear />
                      )
                    }

                  </FormItem>
                </Col> */}
                <Col>
                  <FormItem wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
                    <Button htmlType="submit" style={{marginRight:'15px'}}>
                        搜索
                    </Button>
                  </FormItem>
                </Col>
              </Row>
            </Form>
            {
              standard.length!==0&&
              <Table dataSource={standard.length!==0?standard:COLORLIST} columns={columns} pagination={paginations} rowKey={(record, index) => index} bordered />
            }
          </Spin>

        </Card>
      );
    }
}
const mapStateToProps = state => {
  return {
    loading:state.loading.effects,
    ...state.personal
  };
};
const ColorId = Form.create()(UserColor);
export default connect(mapStateToProps)(ColorId);
