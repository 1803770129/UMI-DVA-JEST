import React, { Component } from 'react';
import { Card , Form , Input , Button,message,Select} from 'antd';
import styles from '../index.less';
import router from 'umi/router';
import {connect} from 'dva';
import { ChromePicker } from 'react-color';
const FormItem = Form.Item;
const { Option } = Select;
class UserColorId extends Component {
  state={
    isAdd:false,
    color:'#fff',
    isNoCode:true,
  }
  componentDidMount() {
    const label_id=this.props.match.params.id;
    if(!this.props.COLORLIST['OFFICAL']){
      this.fetchThemeColors();
    }else{
      if(label_id!=='-1'){
        this.setColor();
      }
      
    }
    
    
    if(label_id==='-1'){
      this.setState({
        isAdd:true
      });
    }else{
      this.setState({isAdd:false});
      // const params={market_label_id:label_id};
      // this.fetchAppmanagerEdit(params);
    }
  }
  fetchThemeColors=async()=>{
    await this.props.dispatch({
      type:'personal/fetchThemeColors'
    });
    this.setColor();
  };
  setColor=()=>{
    const { COLORLIST}=this.props;
    const {isAdd }=this.state;
    let color=[];
    if(COLORLIST['OFFICAL']){
      for(let val in COLORLIST['OFFICAL']){
        COLORLIST['OFFICAL'][val].forEach(item=>{
          color.push(item);
        });
      }
      for(let st in COLORLIST['STANDARD']){
        COLORLIST['STANDARD'][st].forEach(item=>{
          color.push(item);
        });
      }
    }
    let colorItem=[];
    if(!isAdd){
      const label_id=this.props.match.params.id;
      colorItem=color.filter((item,index)=>{
        if(item.app_theme_color_id===label_id){
          return item;
        }
      });
    }
    this.setState({
      color:colorItem[0].app_theme_color_hex
    });
  }
  handleSubmit=e=>{
    e.preventDefault();
    const { form , dispatch } = this.props;
    const label_id=this.props.match.params.id;
    form.validateFields(async(err, values) => {
      if(!err&&this.state.isNoCode){
        if(this.state.isAdd){
          dispatch({
            type:'personal/fetchAddThemeColor',
            data:{app_theme_color_group:values.app_theme_color_group,app_theme_color_code:values.app_theme_color_code,app_theme_color_hex:this.state.color}
          });
        }else{
          dispatch({
            type:'personal/fetchUpdateThemeColor',
            data:{app_theme_color_group:values.app_theme_color_group,app_theme_color_code:values.app_theme_color_code,app_theme_color_hex:this.state.color,app_theme_color_id:label_id}
          });
        }
      }
    });
  }
  handleChangeComplete = (color, event) => {
    this.setState({ color: color.hex });
    console.log(color);
  };
  codeChange=(e)=>{
    const { COLORLIST}=this.props;
    this.setState({
      app_theme_color_code:e.target.value
    });
    let color=[];
    if(COLORLIST['OFFICAL']){
      for(let val in COLORLIST['OFFICAL']){
        COLORLIST['OFFICAL'][val].forEach(item=>{
          color.push(item);
        });
      }
      for(let st in COLORLIST['STANDARD']){
        COLORLIST['STANDARD'][st].forEach(item=>{
          color.push(item);
        });
      }
      color=color.map(item=>item.app_theme_color_code);
    }
    if(color.includes(e.target.value)){
      this.setState({
        isNoCode:false
      });
    }else{
      this.setState({
        isNoCode:true
      });
    }
  }
  render() {
    const {form, COLORLIST}=this.props;
    const {isAdd ,isNoCode}=this.state;
    const {getFieldDecorator}=form;
    const layout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 14 },
    };
    let grouplist=[];
    let color=[];
    if(COLORLIST['OFFICAL']){
      for(let val in COLORLIST['OFFICAL']){
        grouplist.push(val);
        COLORLIST['OFFICAL'][val].forEach(item=>{
          color.push(item);
        });
      }
      for(let st in COLORLIST['STANDARD']){
        grouplist.push(st);
        COLORLIST['STANDARD'][st].forEach(item=>{
          color.push(item);
        });
      }
    }
    let colorItem=[];
    if(!isAdd){
      const label_id=this.props.match.params.id;
      colorItem=color.filter((item,index)=>{
        if(item.app_theme_color_id===label_id){
          return item;
        }
      });
    }
    return (
      <>
        <Card className={styles.factoryCategoryList}>
          <Form {...layout} autoComplete="off" onSubmit={e=>this.handleSubmit(e)}>
            <FormItem label="颜色分组">
              {
                getFieldDecorator(
                  'app_theme_color_group',
                  {
                    initialValue:!isAdd&&colorItem.length!==0?colorItem[0].app_theme_color_group:'',
                    rules: [{ required: true, message: '必填' }],
                  },
                )(
                  <Select style={{width:200}} placeholder="请选择颜色分组">
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
            <FormItem label="颜色code">
              {
                getFieldDecorator(
                  'app_theme_color_code',
                  {
                    initialValue:!isAdd&&colorItem.length!==0?colorItem[0].app_theme_color_code:'',
                    rules: [{ required: true, message: '必填' }],
                  },
                )(
                  <Input placeholder='请按照 分组-数字格式填写 例：RED-6' onChange={this.codeChange} />

                )
              }
              {
                !isNoCode&&
                        <span style={{color:'red'}}>颜色code重复</span>
              }
            </FormItem>
            
            <FormItem label="颜色">
              <ChromePicker color={ this.state.color } onChangeComplete={ this.handleChangeComplete }  />
            </FormItem>
            <FormItem wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
              <Button htmlType="submit" style={{marginRight:'15px'}}>
                提交
              </Button>
              <Button onClick={()=>router.goBack()}>
                返回
              </Button>
            </FormItem>
          </Form>
        </Card>
      </>
    );
  }
}
const mapStateToProps = (state) =>{
  return{
    loading:state.loading.effects,
    ...state.personal
  };

};
const Id = Form.create()(UserColorId);
export default connect(mapStateToProps)(Id);
