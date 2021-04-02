import React, { Component } from 'react';
import { Card , Form , Input , Button,message} from 'antd';
import styles from './index.less';
import router from 'umi/router';
import {connect} from 'dva';
import tenlabel from '../../../models/tenlabel';
const FormItem = Form.Item;
const { TextArea } = Input;
class LabelId extends Component {
  state={
    isAdd:false
  }
  componentDidMount() {
    const label_id=this.props.match.params.id;
    if(label_id==='-1'){
      this.setState({isAdd:true});
    }else{
      this.setState({isAdd:false});
      // const params={market_label_id:label_id};
      // this.fetchAppmanagerEdit(params);
    }
  }

  handleSubmit=e=>{
    e.preventDefault();
    const { form , dispatch } = this.props;
    const label_id=this.props.match.params.id;
    form.validateFields(async(err, values) => {
      if(!err){
        if(this.state.isAdd){
          await dispatch({
            type:'label/fetchLabelCheck',
            payload:{ten_label_name:values.ten_label_name}
          })
          if(this.props.CHECK.check==='HAS-TEN-LABEL-NAME'){
            message.error('已存在该标签')
          }else{
            dispatch({
              type: 'label/fetchLabelInsert',
              payload:{...values}
            });
          }
        }else{
          await dispatch({
            type:'label/fetchLabelCheck',
            payload:{ten_label_name:values.ten_label_name,ten_label_id:label_id}
          })
          const data={
            ...values,
            ten_label_id:this.props.match.params.id,
          };
          if(this.props.CHECK.check==='HAS-TEN-LABEL-NAME'){
            message.error('已存在该标签')
          }else{
            dispatch({
              type: 'label/fetchLabelEdit',
              data:data
            });
          }

        }
      }
    });
  }
  render() {
    const {form }=this.props;
    const {isAdd}=this.state;
    const {getFieldDecorator}=form;
    const layout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 14 },
    };

    return (
      <>
        <Card className={styles.factoryCategoryList}>
          <Form {...layout} autoComplete="off" onSubmit={e=>this.handleSubmit(e)}>
            <FormItem label="标签名称">
              {
                getFieldDecorator(
                  'ten_label_name',
                  {
                    initialValue:isAdd?'':this.props.location.query.ten_label_name,
                    rules: [{ required: true, message: '必填' }],
                  },
                )(
                  <Input placeholder='请输入标签名称' maxLength={50} />
                )
              }

            </FormItem>
            <FormItem label="标签描述">
              {
                getFieldDecorator(
                  'ten_label_memo',
                  {
                    initialValue:isAdd?'':this.props.location.query.ten_label_memo,
                    rules: [{ required: true, message: '必填' }],
                  },
                )(
                  <TextArea  placeholder='请输入标签描述' maxLength={50} />
                )
              }

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
    ...state.label,
    ...tenlabel
  };

};
const Id = Form.create()(LabelId);
export default connect(mapStateToProps)(Id);
