import React, { Component } from 'react';
import { Card , Form, Input, Button , Select  , Spin , message , Table , Modal , Icon } from 'antd';
import styles from './index.less';
import {connect} from 'dva';
import EditableTagGroup from './components/EditableTagGroup';
// import { getOriginalImgDesc } from '@/utils/tools';
import router from 'umi/router';
import Editor from './components/Editor';
const { Option } = Select;
const FormItem = Form.Item;
const confirm=Modal.confirm
class AppmanagerId extends Component {
  state={
    tags:[],//添加的tag
    isAdd:false,
    valueArr:[],//编辑的tage
    html:'',//富文本内容
    nameValue:'',
    codeValue:'',
    nameCheck:'',//检测应用名称是否重复标识
    codeCheck:'', //检测应用code是否重复标识
    visible:false,//添加配置模态框
    visibleEdit:false,//编辑配置模态框
    enumList: [{ key: 'enumName' + new Date().getTime(),val: '',keys:'enumVal'+new Date().getTime(), vals:''}], //存储枚举值数据结构
    addstatus:'ENUM', //添加的配置类型
    configIndex:'',//点击编辑所对应的下标
    editStatus:'ENUM',//编辑的配置类型
    editStatusa:''//编辑的配置类型
  }
  componentDidMount() {

    const app_id=this.props.match.params.id;
    if(app_id==='-1'){
      this.setState({isAdd:true});
      // this.updateModalData()
    }else{
      this.setState({isAdd:false});
      // this.updateModalData()
      const params={market_app_id:app_id};
      this.fetchAppmanagerEdit(params);
      const {MARKETPAGES}=this.props;
      this.getMarketsTenantsList(MARKETPAGES);
    }
  }
  updateModalData=()=>{
    this.props.dispatch({
      type:'appmanager_id/updateModalData'
    })
  }
  // 获取编辑应用信息
  fetchAppmanagerEdit=params=>{
    const app_id=this.props.match.params.id;
    this.props.dispatch({
      type:'appmanager_id/fetchAppmanagerEditList',
      payload:params,
      callback:(res)=>{
        if(res[0].market_app_open_type!=='ALL_TENANT'){
          this.props.dispatch({
            type:'appmanager_id/fetchRangeNum',
            payload:{market_app_id:app_id,market_app_open_type:res[0].market_app_open_type}
          });
        }

        this.props.dispatch({
          type:'appmanager_id/updateAppFeather',
          payload:res[0].market_app_feature.split(',')
        });
        this.setState({
          valueArr:res[0].market_app_feature.split(',')
        });
      }
    });
  }
  componentWillUnmount(){
    this.props.dispatch({
      type:'appmanager_id/clearAppFeather',
    });
    this.props.dispatch({
      type:'appmanager_id/updateRangeNum',
    });
  }
  getMarketsTenantsList = params => {
    const { dispatch } = this.props;
    dispatch({
      type: 'markets/fetchMarketsTenantsWeappList',
      payload:params,
    });
  };
  componentWillUnmount(){
    // 离开页面时清空编辑信息与配置列表
    this.props.dispatch({ type: 'appmanager_id/clearState' });
    this.props.dispatch({ type: 'appmanager_id/clearCheck' });
    this.props.dispatch({ type: 'appmanager_id/clearModalData' });
  }
  // 更新富文本函数
  handleEditorUpload = (info, uploadParam) => {
    const { dispatch } = this.props;
    return dispatch({ type: 'appmanager_id/fetchEditorUpload', payload: info });
  };
  // 编辑富文本
  handleEditorChange = (editorState, editorStateHtml) => {
    this.setState({
      html:editorStateHtml
    });
    const { dispatch, APP_EDITOR_STATE } = this.props;
    // 实时更新 EDITOR_STATE的model值，保存时方便获取
    dispatch({ type: 'appmanager_id/updateEditorState', payload: { ...APP_EDITOR_STATE, data: editorState, html: editorStateHtml } });
  };


  // 子传父，获取tag值
  getTags=(val)=>{
    this.setState({
      tags:val
    });
  };
  // 子传父，获取已有的tag
  getValues=(val)=>{
    this.setState({
      valueArr:val
    });
  };
  nameChange=e=>{
    this.setState({
      nameValue:e.target.value
    });
  }
  codeChange=e=>{
    this.setState({
      codeValue:e.target.value
    });
  }
  ChangeAddStatus=val=>{
    this.setState({
      addstatus:val
    });
  }
  ChangeEditStatus=val=>{
    this.setState({
      editStatusa:val,
      editStatus:val
    });
  }
  // 应用名称失去焦点时检测函数
  nameBlur= async () => {
    if(this.state.nameValue===''){
      return;
    }else{
      if(this.state.isAdd){
        await this.props.dispatch({
          type:'appmanager_id/fetchMarketCheck',
          payload:{market_app_name:this.state.nameValue,market_app_insert_edit:'CREATE'}
        });
        this.setState({
          nameCheck:this.props.check.check
        });
      }else{
        await this.props.dispatch({
          type:'appmanager_id/fetchMarketCheck',
          payload:{market_app_name:this.state.nameValue,market_app_insert_edit:'EDIT',market_app_id:this.props.match.params.id}
        });
        this.setState({
          nameCheck:this.props.check.check
        });
      }
    }

  }
  // 应用code失去焦点时检测函数
  codeBlur= async () => {
    if(this.state.codeValue===''){
      return;
    }else{
      if(this.state.isAdd){
        await this.props.dispatch({
          type:'appmanager_id/fetchMarketCheck',
          payload:{market_app_code:this.state.codeValue,market_app_insert_edit:'CREATE'}
        });
        this.setState({
          codeCheck:this.props.check.check
        });
      }else{
        await this.props.dispatch({
          type:'appmanager_id/fetchMarketCheck',
          payload:{market_app_code:this.state.codeValue,market_app_insert_edit:'EDIT',market_app_id:this.props.match.params.id}
        });
        this.setState({
          codeCheck:this.props.check.check
        });
      }
    }
  }
  // 添加应用配置
  handleOk = e => {
    e.preventDefault();
    const {form}=this.props;
    form.validateFields(async(err,values)=>{
      // 复制配置列表
      let newModalData=this.props.MODALDATA.concat();
      if(values.confige_name){
        if(this.state.addstatus==='ENUM'){
          let nameList = [];
          let valList = [];
          // 存枚举值的数组
          for (let key in values) {
            if (key.indexOf('enumName') !== -1) {
              if (values[key]) {
                nameList.push(values[key]);
              }
            }
            if (key.indexOf('enumVal') !== -1) {
              if (values[key]) {
                valList.push(values[key]);
              }
            }
          }
          if(nameList.length===valList.length && nameList.length!==0 && valList.length!==0){
            for (let key in values) {
              let objEnum={};
              if (key.indexOf('enumName') !== -1) {
                objEnum['market_app_cfg_enum_name']=values[key];
              }
              if (key.indexOf('enumVal') !== -1) {
                objEnum['market_app_cfg_enum_value']=values[key];
              }
            }
            let enumList=[];
            nameList.forEach((item,index)=>{
              let objEnum={};
              objEnum['market_app_cfg_enum_name']=item;
              objEnum['market_app_cfg_enum_value']=valList[index];
              objEnum['market_app_cfg_enum_index']=index+1;
              enumList.push(objEnum);
            });
            let formate={};
            formate['market_app_cfg_name']=values.confige_name;
            formate['market_app_cfg_type']=values.confige_type;
            formate['config_value']=enumList;
            newModalData.push(formate);
            // 更新到缓存中的配置列表中
            await this.props.dispatch({
              type:'appmanager_id/updateModalData',
              payload:newModalData
            });
            this.setState({
              visible: false,
              addstatus:'ENUM',
              enumList:[{ key: 'enumName' + new Date().getTime(),val: '',keys:'enumVal'+new Date().getTime(), vals:''}]
            });
          }else{
            message.warning('请将配置枚举值填写完整');
          }


        }else if(this.state.addstatus==='NUMBER'){
          let formate={};
          formate['market_app_cfg_name']=values.confige_name;
          formate['market_app_cfg_type']=values.confige_type;
          formate['market_app_cfg_tip']=values.cfgNumTip;
          newModalData.push(formate);
          await this.props.dispatch({
            type:'appmanager_id/updateModalData',
            payload:newModalData
          });
          this.setState({
            visible: false,
            addstatus:'ENUM',
            enumList:[{ key: 'enumName' + new Date().getTime(),val: '',keys:'enumVal'+new Date().getTime(), vals:''}]
          });
        }else if(this.state.addstatus==='STRING'){
          let formate={};
          formate['market_app_cfg_name']=values.confige_name;
          formate['market_app_cfg_type']=values.confige_type;
          formate['market_app_cfg_tip']=values.cfgStrTip;
          newModalData.push(formate);
          await this.props.dispatch({
            type:'appmanager_id/updateModalData',
            payload:newModalData
          });
          this.setState({
            visible: false,
            addstatus:'ENUM',
            enumList:[{ key: 'enumName' + new Date().getTime(),val: '',keys:'enumVal'+new Date().getTime(), vals:''}]
          });
        }

      }else{
        message.warning('请填写配置名称');
      }


    });
  };
  // 删除缓存中对应index的配置
  delConfigModal=(record,index)=>{
    confirm({
      title: '确认删除该配置？',
      onOk:async()=> {
        let newModalData=[...this.props.MODALDATA];
        newModalData.splice(index,1);
        await this.props.dispatch({
          type:'appmanager_id/updateModalData',
          payload:newModalData
        });
      },
      onCancel() {

      },
    });
  }
  handleCancel = e => {
    this.setState({
      visible: false,
      addstatus:'ENUM',
      enumList:[{ key: 'enumName' + new Date().getTime(),val: '',keys:'enumVal'+new Date().getTime(), vals:''}]
    });
  };
  // 点击编辑时弹框
  EditEnumModals=(record,index)=>{
    const {MODALDATA}=this.props;
    this.setState({
      visibleEdit:true,
      configIndex:index,
      editStatus:MODALDATA[index].market_app_cfg_type,//将对应下标的配置类型赋值，用于样式切换标识
      // enumList:MODALDATA[index]
    });
    // 将获取的配置枚举值，转换成前端所需数据结构，并复制给state中的enumList
    setTimeout(()=>{
      if(this.state.editStatus==='ENUM'){
        let List = [];
        MODALDATA[index].config_value.forEach((item,v)=>{
          let obj={};
          obj['key']='enumName' + v;
          obj['val']=item['market_app_cfg_enum_name'];
          obj['keys']='enumVal'+v;
          obj['vals']=item['market_app_cfg_enum_value'];
          List.push(obj);
        });
        this.setState({
          enumList:List,
        });
      }
    });

  }
  // 编辑应用配置模态框
  handleOkEdit = e => {
    e.preventDefault();
    const {form}=this.props;
    form.validateFields(async(err,values)=>{
      let newModalData=[...this.props.MODALDATA];
      if(values.confige_nameEdit){
        if(this.state.editStatus==='ENUM'){
          let nameList = [];
          let valList = [];
          // 存枚举值的数组
          for (let key in values) {
            if (key.indexOf('enumName') !== -1) {
              if (values[key]) {
                nameList.push(values[key]);
              }
            }
            if (key.indexOf('enumVal') !== -1) {
              if (values[key]) {
                valList.push(values[key]);
              }
            }
          }
          if(nameList.length===valList.length && nameList.length!==0 && valList.length!==0){
            for (let key in values) {
              let objEnum={};
              if (key.indexOf('enumName') !== -1) {
                objEnum['market_app_cfg_enum_name']=values[key];
              }
              if (key.indexOf('enumVal') !== -1) {
                objEnum['market_app_cfg_enum_value']=values[key];
              }
            }
            let enumList=[];
            nameList.forEach((item,index)=>{
              let objEnum={};
              objEnum['market_app_cfg_enum_name']=item;
              objEnum['market_app_cfg_enum_value']=valList[index];
              objEnum['market_app_cfg_enum_index']=index+1;
              enumList.push(objEnum);
            });
            let formate={};
            formate['market_app_cfg_name']=values.confige_nameEdit;
            formate['market_app_cfg_type']=values.confige_typeEdit;
            formate['config_value']=enumList;
            // 找到当前点击编辑数据的下标，替换对应数据，并存入缓存中
            let Data=newModalData.map((item,index)=>index==this.state.configIndex?formate:item);
            await this.props.dispatch({
              type:'appmanager_id/updateModalData',
              payload:Data
            });
            this.setState({
              visibleEdit: false,
              editstatus:'',
              enumList:[{ key: 'enumName' + new Date().getTime(),val: '',keys:'enumVal'+new Date().getTime(), vals:''}],
              configIndex:''
            });
          }else{
            message.warning('请将配置枚举值填写完整');
          }


        }else if(this.state.editStatus==='NUMBER'){
          let formate={};
          formate['market_app_cfg_name']=values.confige_nameEdit;
          formate['market_app_cfg_type']=values.confige_typeEdit;
          formate['market_app_cfg_tip']=values.cfgEditNumTip;
          let Data=newModalData.map((item,index)=>index==this.state.configIndex?formate:item);
          await this.props.dispatch({
            type:'appmanager_id/updateModalData',
            payload:Data
          });
          this.setState({
            visibleEdit: false,
            editstatus:'',
            enumList:[{ key: 'enumName' + new Date().getTime(),val: '',keys:'enumVal'+new Date().getTime(), vals:''}],
            configIndex:''
          });
        }else if(this.state.editStatus==='STRING'){
          let formate={};
          formate['market_app_cfg_name']=values.confige_nameEdit;
          formate['market_app_cfg_type']=values.confige_typeEdit;
          formate['market_app_cfg_tip']=values.cfgEditStrTip;
          let Data=newModalData.map((item,index)=>index==this.state.configIndex?formate:item);
          await this.props.dispatch({
            type:'appmanager_id/updateModalData',
            payload:Data
          });
          this.setState({
            visibleEdit: false,
            editstatus:'',
            enumList:[{ key: 'enumName' + new Date().getTime(),val: '',keys:'enumVal'+new Date().getTime(), vals:''}],
            configIndex:''
          });
        }

      }else{
        message.warning('请填写配置名称');
      }


    });

  };

  handleCancelEdit = e => {
    this.setState({
      visibleEdit: false,
      enumList:[{ key: 'enumName' + new Date().getTime(),val: '',keys:'enumVal'+new Date().getTime(), vals:''}],
      configIndex:''
    });
  };

  addEnumModals=()=>{
    this.setState({
      visible:true
    });
  }
  // 保存应用
  handleSubmit = async(e,tagas) => {
    e.preventDefault();
    const { form , dispatch } = this.props;
    let configList=[...this.props.MODALDATA];
    // 当缓存中有check时
    if(this.props.check){
      if(this.state.nameValue===''){
        form.validateFields(async(err, values) => {
          if(!err){
            // 当check为HASCODE或HASNAME时禁止保存
            if(this.props.check&&this.props.check.check==='HAS-CODE'|| this.props.check&&this.props.check.check==='HAS-NAME'){
              message.warning('请检查应用信息填写是否有误');
              return;

            }else{
              // 在新建应用的情况下
              if(this.state.isAdd){
                const data={
                  market_app_code:values.market_app_code,
                  market_app_introduce:values.market_app_introduce,
                  market_app_name:values.market_app_name,
                  market_app_open_type:values.market_app_open_type,
                  market_app_pay_type:values.market_app_pay_type,
                  market_app_feature:this.state.tags,
                  market_app_desc:this.state.html,
                  market_app_cfg:configList
                };
                dispatch({
                  type: 'appmanager_id/fetchAppmanagerListInsert',
                  data:data
                });
              }else{ //在编辑的情况下
                // 当编辑的应用特点为空时，传递的参数为当前填入的特点值
                if(this.props.FEATHER.length==0){
                  const data={
                    market_app_code:values.market_app_code,
                    market_app_introduce:values.market_app_introduce,
                    market_app_name:values.market_app_name,
                    market_app_open_type:values.market_app_open_type,
                    market_app_pay_type:values.market_app_pay_type,
                    market_app_feature:tagas,
                    market_app_id:this.props.match.params.id,
                    market_app_desc:this.state.html,
                    market_app_cfg:configList
                  };
                  await dispatch({
                    type: 'appmanager_id/fetchAppmanagerUpdateList',
                    data:data
                  });
                }else{
                  // 否则传入的是当前编辑的特点值
                  const data={
                    market_app_code:values.market_app_code,
                    market_app_introduce:values.market_app_introduce,
                    market_app_name:values.market_app_name,
                    market_app_open_type:values.market_app_open_type,
                    market_app_pay_type:values.market_app_pay_type,
                    market_app_feature:this.state.valueArr,
                    market_app_id:this.props.match.params.id,
                    market_app_desc:this.state.html,
                    market_app_cfg:configList
                  };

                  await dispatch({
                    type: 'appmanager_id/fetchAppmanagerUpdateList',
                    data:data
                  });

                }

              }
            }
          }
        });
        return;
      }else{ //当缓存中没有check时，需要同步调用check接口，防止操作人员在修改名称后没有进行失焦操作，直接点击提交按钮保存应用
        if(this.state.isAdd){
          await this.props.dispatch({
            type:'appmanager_id/fetchMarketCheck',
            payload:{market_app_name:this.state.nameValue,market_app_insert_edit:'CREATE'}
          });
          this.setState({
            nameCheck:this.props.check.check
          });
        }else{
          await this.props.dispatch({
            type:'appmanager_id/fetchMarketCheck',
            payload:{market_app_name:this.state.nameValue,market_app_insert_edit:'EDIT',market_app_id:this.props.match.params.id}
          });
          this.setState({
            nameCheck:this.props.check.check
          });
        }
      }
      form.validateFields(async(err, values) => {
        if(!err){
          if(this.props.check&&this.props.check.check==='HAS-CODE'|| this.props.check&&this.props.check.check==='HAS-NAME'){
            message.warning('请检查应用信息填写是否有误');
            return;

          }else{
            if(this.state.isAdd){
              const data={
                market_app_code:values.market_app_code,
                market_app_introduce:values.market_app_introduce,
                market_app_name:values.market_app_name,
                market_app_open_type:values.market_app_open_type,
                market_app_pay_type:values.market_app_pay_type,
                market_app_feature:this.state.tags,
                market_app_desc:this.state.html,
                market_app_cfg:configList
              };
              dispatch({
                type: 'appmanager_id/fetchAppmanagerListInsert',
                data:data
              });
            }else{
              if(this.props.FEATHER.length==0){
                const data={
                  market_app_code:values.market_app_code,
                  market_app_introduce:values.market_app_introduce,
                  market_app_name:values.market_app_name,
                  market_app_open_type:values.market_app_open_type,
                  market_app_pay_type:values.market_app_pay_type,
                  market_app_feature:tagas,
                  market_app_id:this.props.match.params.id,
                  market_app_desc:this.state.html,
                  market_app_cfg:configList
                };

                await dispatch({
                  type: 'appmanager_id/fetchAppmanagerUpdateList',
                  data:data
                });
              }else{
                const data={
                  market_app_code:values.market_app_code,
                  market_app_introduce:values.market_app_introduce,
                  market_app_name:values.market_app_name,
                  market_app_open_type:values.market_app_open_type,
                  market_app_pay_type:values.market_app_pay_type,
                  market_app_feature:this.state.valueArr,
                  market_app_id:this.props.match.params.id,
                  market_app_desc:this.state.html,
                  market_app_cfg:configList
                };

                await dispatch({
                  type: 'appmanager_id/fetchAppmanagerUpdateList',
                  data:data
                });

              }

            }
          }
        }
      });
    }else{
      form.validateFields(async(err, values) => {
        if(!err){
          if(this.props.check&&this.props.check.check==='HAS-CODE'|| this.props.check&&this.props.check.check==='HAS-NAME'){
            message.warning('请检查应用信息填写是否有误');
            return;

          }else{
            if(this.state.isAdd){
              const data={
                market_app_code:values.market_app_code,
                market_app_introduce:values.market_app_introduce,
                market_app_name:values.market_app_name,
                market_app_open_type:values.market_app_open_type,
                market_app_pay_type:values.market_app_pay_type,
                market_app_feature:this.state.tags,
                market_app_desc:this.state.html,
                market_app_cfg:configList
              };
              dispatch({
                type: 'appmanager_id/fetchAppmanagerListInsert',
                data:data
              });
            }else{
              if(this.props.FEATHER.length==0){
                const data={
                  market_app_code:values.market_app_code,
                  market_app_introduce:values.market_app_introduce,
                  market_app_name:values.market_app_name,
                  market_app_open_type:values.market_app_open_type,
                  market_app_pay_type:values.market_app_pay_type,
                  market_app_feature:tagas,
                  market_app_id:this.props.match.params.id,
                  market_app_desc:this.state.html,
                  market_app_cfg:configList
                };

                await dispatch({
                  type: 'appmanager_id/fetchAppmanagerUpdateList',
                  data:data
                });
              }else{
                const data={
                  market_app_code:values.market_app_code,
                  market_app_introduce:values.market_app_introduce,
                  market_app_name:values.market_app_name,
                  market_app_open_type:values.market_app_open_type,
                  market_app_pay_type:values.market_app_pay_type,
                  market_app_feature:this.state.valueArr,
                  market_app_id:this.props.match.params.id,
                  market_app_desc:this.state.html,
                  market_app_cfg:configList
                };

                await dispatch({
                  type: 'appmanager_id/fetchAppmanagerUpdateList',
                  data:data
                });

              }

            }
          }
        }
      });
    }
  }

  // 删除应用配置枚举值
  remove = key => {
    const { enumList } = this.state;
    let newEnums = [...enumList];
    for (let i = 0; i < newEnums.length; i++) {
      if (newEnums[i].key == key) {
        newEnums.splice(i, 1);
      }
    }
    this.setState({ enumList: newEnums });
  };

  // 添加枚举值
  add = () => {
    const { enumList } = this.state;
    enumList.push({ key: 'enumName' + new Date().getTime(),val: '',keys:'enumVal'+new Date().getTime(), vals:''});
    this.setState({ enumList });
  };

  changeEnumName=()=>{

  }
  changeEnumVal=()=>{

  }

  render() {
    const {form,APPMANAGEREDITLIST  ,loading , MODALDATA}=this.props;
    const {isAdd , enumList}=this.state;
    const {getFieldDecorator}=form;
    let ids=this.props.TENANT_MARKETS.tenMarkets.filter(item=>item.market_app_id==this.props.match.params.id);
    const layout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 14 },
    };
    const layout1 = {
      labelCol: { span: 4 },
      wrapperCol: { span: 12 },
    };
    const app_id=this.props.match.params.id;
    const { market_app_feature } = APPMANAGEREDITLIST.length && APPMANAGEREDITLIST[0];
    const tagas = market_app_feature ? market_app_feature.split(',') : [];
    const columns=[
      {
        title: '配置名称',
        dataIndex: 'market_app_cfg_name',
        key: 'market_app_cfg_name ',
      },
      {
        title: '配置类型',
        dataIndex: 'market_app_cfg_type',
        key: 'market_app_cfg_type',
      },
      {
        title: '配置枚举值',
        dataIndex: 'config_value',
        key: 'config_value',
        render:(text,record)=>{
          // 处理配置枚举值的显示样式
          if(record.market_app_cfg_type==='ENUM'){
            let textName=text.map(item=>item.market_app_cfg_enum_name);
            let textValue=text.map(item=>item.market_app_cfg_enum_value);
            let textList=[];
            textName.map((item,index)=>{
              textList.push(`${item}(${textValue[index]})`);
            });
            let textString=textList.join('，');
            return (
              <span>{textString}</span>
            );
          }else{
            return(
              <span>{text}</span>
            );
          }

        }
      },
      {
        title: '提示信息',
        dataIndex: 'market_app_cfg_tip',
        key: 'market_app_cfg_tip',
      },
      {
        title: '操作',
        key: 'action',
        width:100,
        render: (text, record,index) => {
          // 编辑时---只有在已开通应用列表中没有当前编辑应用时，才可以进行编辑和删除操作
          let ids=this.props.TENANT_MARKETS.tenMarkets.filter(item=>item.market_app_id==this.props.match.params.id);
          if(ids.length===0){
            return(
              <div>
                <a onClick={()=>this.EditEnumModals(record,index)}>编辑</a> | <a style={{color:'red'}} onClick={()=>this.delConfigModal(record,index)}>删除</a>
              </div>
            );
          }else{
            return(
              <span></span>
            );
          }

        }

      },
    ];
    // 配置枚举值的input组
    const enumss = enumList.map((k, index) => {
      return (
        <div style={{display:'flex',justifyContent:'space-between'}}>
          <FormItem key={k.key}>
            {
              getFieldDecorator(k.key, {
                initialValue: k.val
              })(
                <Input placeholder="枚举值名称" style={{ marginRight: 8 }} autoComplete="off" onChange={()=>this.changeEnumName()} />
              )
            }
          </FormItem>
          <div style={{marginLeft:'5px',marginRight:'5px'}}>—</div>
          <FormItem key={k.keys}>
            {
              getFieldDecorator(k.keys, {
                initialValue: k.vals
              })(
                <Input placeholder="枚举值code" style={{ marginRight: 8 }} autoComplete="off" onChange={()=>this.changeEnumVal()} />
              )
            }
          </FormItem>

          {
            index!==0 &&
          <>
            {enumList.length > 1 ? (<Icon className="create-property-modal-delbtn"style={{marginLeft:'5px',marginTop:'12px'}} type="minus-circle-o" disabled={enumList.length === 1} onClick={() => this.remove(k.key)} />) : ''}
         </>
          }

        </div>
      );
    });
    return (
      <>
        <Card className={styles.factoryCategoryList}>
          <Spin spinning={isAdd?false:loading['appmanager_id/fetchRangeNum','appmanager_id/fetchAppmanagerEditList']}>
            <Form {...layout} autoComplete="off" onSubmit={e=>this.handleSubmit(e,tagas)}>

              <FormItem label="应用名称">
                {
                  getFieldDecorator(
                    'market_app_name',
                    {
                      initialValue:isAdd?'':APPMANAGEREDITLIST.length&&APPMANAGEREDITLIST[0].market_app_name,
                      rules: [{ required: true, message: '必填' },{ pattern: '^.{0,15}$', message: '最多只能输入12个字符'}],
                    },
                  )(
                    <Input placeholder='请输入最多12个字符' maxLength={12} onChange={this.nameChange} onBlur={this.nameBlur} />
                  )
                }

                {
                  this.props.check&&
                        <span style={{color:'red'}}>
                          {
                            this.state.nameCheck==='HAS-NAME' && this.state.nameValue!==''?
                              '与已存在应用名称重复'
                              :
                              ''
                          }
                        </span>

                }
              </FormItem>
              <FormItem label="应用code">
                {
                  getFieldDecorator(
                    'market_app_code',
                    {
                      initialValue:isAdd?'':APPMANAGEREDITLIST.length&&APPMANAGEREDITLIST[0].market_app_code,
                      rules: [{ required: true, message: '必填' }],
                    },
                  )(
                    <Input placeholder='请输入应用code' disabled={isAdd?false:true} maxLength={12} onChange={this.codeChange} onBlur={this.codeBlur} />
                  )

                }
                {
                  this.props.check&&
                        <span style={{color:'red'}}>
                          {
                            this.state.codeCheck==='HAS-CODE' && this.state.codeValue!==''?
                              '与已存在应用code重复'
                              :
                              ''
                          }
                        </span>

                }
              </FormItem>
              <FormItem label="付费方式">
                {
                  getFieldDecorator(
                    'market_app_pay_type',
                    {
                      initialValue:isAdd?'':APPMANAGEREDITLIST.length&&APPMANAGEREDITLIST[0].market_app_pay_type,
                      rules: [{ required: true, message: '必填' }],
                    },
                  )(
                    <Select shop={{ width: 120 }} allowClear disabled={isAdd?false:true}>
                      <Option value="TENANT">按商户付费</Option>
                      <Option value="BRAND">按品牌付费</Option>
                      <Option value="CATEGORY">按品类付费</Option>
                    </Select>
                  )
                }
              </FormItem>
              <FormItem label="开放范围">
                {
                  getFieldDecorator(
                    'market_app_open_type',
                    {
                      initialValue:isAdd?'':APPMANAGEREDITLIST.length&&APPMANAGEREDITLIST[0].market_app_open_type,
                      rules: [{ required: true, message: '必填' }],
                    },
                  )(
                    <Select shop={{ width: 120 }} allowClear disabled={isAdd?false:true}>
                      <Option value="ALL_TENANT">开放所有商户</Option>
                      <Option value="SOME_TENANT">特定商户开放</Option>
                      <Option value="LABEL_TENANT">特定标签的商户开放</Option>
                    </Select>
                  )
                }
                {
                  APPMANAGEREDITLIST.length&&APPMANAGEREDITLIST[0].market_app_open_type==='SOME_TENANT'?
                    <div>
                      <div style={{color:'grey'}}>{`已选${this.props.RANGENUM&&this.props.RANGENUM}个商户`}</div>
                      <Button type='primary' onClick={()=>router.push(`/application/checktenant/${this.props.match.params.id}`)}>添加商户</Button>
                    </div>
                    :
                    APPMANAGEREDITLIST.length&&APPMANAGEREDITLIST[0].market_app_open_type==='LABEL_TENANT'?
                      <div>
                        <div style={{color:'grey'}}>{`已选${this.props.RANGENUM&&this.props.RANGENUM}个标签`}</div>
                        <Button type='primary' onClick={()=>router.push(`/application/checklabel/${this.props.match.params.id}`)}>请选择标签</Button>
                      </div>
                      :''
                }
              </FormItem>
              {
                app_id!=='-1'?
                  APPMANAGEREDITLIST.length?
                    <FormItem name='market_app_feature' label="应用特点">
                      <EditableTagGroup getTags={this.getTags.bind(this)} getValues={this.getValues.bind(this)}  isAdd={app_id==='-1'?'true':false} tagas={tagas} tip={<span className="c9">请添加产品特点，每个标签最多6个字符</span>}></EditableTagGroup>
                    </FormItem>
                    :''
                  :
                  <FormItem name='market_app_feature' label="应用特点">
                    <EditableTagGroup getTags={this.getTags.bind(this)} getValues={this.getValues.bind(this)} isAdd={app_id==='-1'?'true':false} tagas={tagas} tip={<span className="c9">请添加产品特点，每个标签最多6个字符</span>}></EditableTagGroup>
                  </FormItem>

              }

              <FormItem label="应用简介">
                {
                  getFieldDecorator(

                    'market_app_introduce',
                    {
                      initialValue:isAdd?'':APPMANAGEREDITLIST.length&&APPMANAGEREDITLIST[0].market_app_introduce,
                      rules: [{ required: true, message: '必填' }],
                    },
                  )(
                    <Input.TextArea placeholder='请输入最多30个字符' maxLength={30} />
                  )
                }

              </FormItem>
              <FormItem label="应用配置">
                <br></br>
                <Button onClick={()=>this.addEnumModals()} disabled={ids.length===0?false:true}>添加配置</Button>
                <Table columns={columns} dataSource={MODALDATA} bordered pagination={false} rowKey={(record,index)=>index}></Table>
              </FormItem>
              {
                app_id!=='-1'?
                  APPMANAGEREDITLIST.length?
                    <FormItem name='market_app_desc`' label="图文详情">
                      {/* 富文本 */}
                      <Editor type="appmanager" onEditorUpload={this.handleEditorUpload} onEditorChange={this.handleEditorChange} initialContent={APPMANAGEREDITLIST[0].market_app_desc} />
                    </FormItem>
                    :''
                  :
                  <FormItem name='market_app_desc`' label="图文详情">
                    {/* 富文本 */}
                    <Editor type="appmanager" onEditorUpload={this.handleEditorUpload} onEditorChange={this.handleEditorChange} />
                  </FormItem>
              }
              <FormItem wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
                <Button htmlType="submit" style={{marginRight:'15px'}} disabled={this.state.codeCheck==='HAS-CODE'||this.state.nameCheck==='HAS-NAME'?true:false}>
                  提交
                </Button>
                <Button onClick={()=>router.goBack()}>
                  返回
                </Button>
              </FormItem>
            </Form>
          </Spin>
          {/* 添加应用配置模态框 */}
          {
            this.state.configIndex===''&&
            <Modal
              title="添加应用配置"
              visible={this.state.visible}
              onOk={this.handleOk}
              onCancel={this.handleCancel}
              destroyOnClose={true}
              width={'40%'}
            >
              <Form {...layout1} onSubmit={this.handleOk}>
                <FormItem label={<span><span style={{color:'red'}}>* </span><span>配置名称</span></span>} className="m-b-5">
                  {
                    getFieldDecorator('confige_name', {
                    })(
                      <Input  autoComplete="off" />
                    )
                  }
                </FormItem>
                <FormItem  label="配置类型" className="m-b-5">
                  {
                    getFieldDecorator('confige_type', {
                      initialValue:'ENUM'
                    })(
                      <Select style={{ width: 120 }} onChange={this.ChangeAddStatus}>
                        <Option value="ENUM">枚举</Option>
                        <Option value="NUMBER">数值</Option>
                        <Option value="STRING">字符串</Option>
                      </Select>
                    )
                  }
                </FormItem>
                {
                  this.state.addstatus==='ENUM'&&
                <FormItem className="m-b-5" label="配置枚举值">
                  {enumss}
                  <Button type="dashed" onClick={() => { this.add(); }} style={{ width: '60%' }} >
                    <Icon type="plus" /> 添加枚举值
                  </Button>
                </FormItem>
                }
                {
                  this.state.addstatus==='NUMBER'&&
                <FormItem className="m-b-5" label="提示信息">
                  {
                    getFieldDecorator('cfgNumTip', {
                      initialValue:'',
                    })(
                      <Input placeholder="请填写配置提示信息" autoComplete="off" />
                    )
                  }
                </FormItem>
                }
                {
                  this.state.addstatus==='STRING'&&
                <FormItem className="m-b-5" label="提示信息">
                  {
                    getFieldDecorator('cfgStrTip', {
                      initialValue:'',
                    })(
                      <Input placeholder="请填写配置提示信息" autoComplete="off" />
                    )
                  }
                </FormItem>
                }
              </Form>
            </Modal>
          }

          {/* 编辑应用配置模态框 */}
          {
            this.state.configIndex!==''&&
            <Modal
              title="编辑应用配置"
              visible={this.state.visibleEdit}
              onOk={this.handleOkEdit}
              onCancel={this.handleCancelEdit}
              destroyOnClose={true}
              width={'40%'}
            >
              <Form {...layout1}>
                <FormItem label={<span><span style={{color:'red'}}>* </span><span>配置名称</span></span>} className="m-b-5">
                  {
                    getFieldDecorator('confige_nameEdit', {
                      initialValue:MODALDATA.length!==0?MODALDATA[this.state.configIndex].market_app_cfg_name:'',
                    })(
                      <Input  autoComplete="off" />
                    )
                  }
                </FormItem>
                <FormItem  label="配置类型" className="m-b-5">
                  {
                    getFieldDecorator('confige_typeEdit', {
                      initialValue:MODALDATA.length!==0?MODALDATA[this.state.configIndex].market_app_cfg_type:''
                    })(
                      <Select style={{ width: 120 }} onChange={this.ChangeEditStatus}>
                        <Option value="ENUM">枚举</Option>
                        <Option value="NUMBER">数值</Option>
                        <Option value="STRING">字符串</Option>
                      </Select>
                    )
                  }
                </FormItem>
                {
                  this.state.editStatus==='ENUM'&&
                <FormItem className="m-b-5" label="配置枚举值">
                  {enumss}
                  <Button type="dashed" onClick={() => { this.add(); }} style={{ width: '60%' }} >
                    <Icon type="plus" /> 添加枚举值
                  </Button>
                </FormItem>
                }
                {
                  this.state.editStatus==='NUMBER'&&
                <FormItem className="m-b-5" label="提示信息">
                  {
                    getFieldDecorator('cfgEditNumTip', {
                      initialValue:this.state.editStatusa!=='NUMBER'&&MODALDATA.length!==0?MODALDATA[this.state.configIndex].market_app_cfg_tip:'',
                    })(
                      <Input placeholder="请填写配置提示信息" autoComplete="off" />
                    )
                  }
                </FormItem>
                }
                {
                  this.state.editStatus==='STRING'&&
                <FormItem className="m-b-5" label="提示信息">
                  {
                    getFieldDecorator('cfgEditStrTip', {
                      initialValue:this.state.editStatusa!=='STRING'&&MODALDATA.length!==0?MODALDATA[this.state.configIndex].market_app_cfg_tip:'',
                    })(
                      <Input placeholder="请填写配置提示信息" autoComplete="off" />
                    )
                  }
                </FormItem>
                }
              </Form>
            </Modal>
          }
        </Card>
      </>
    );
  }
}
const mapStateToProps = (state) =>{
  return{
    loading:state.loading.effects,
    ...state.appmanager_id,
    ...state.markets,
    // ...state.application
  };

};
const Id = Form.create()(AppmanagerId);
export default connect(mapStateToProps)(Id);
