import React, { Component } from 'react';
import { Tag, Input, Tooltip } from 'antd';
// import { PlusOutlined } from '@ant-design/icons';

export default class EditableTagGroup extends Component {
  state = {
    tags: [],
    inputVisible: false,
    inputValue: '',
    editInputIndex: -1,
    editInputValue: '',
    err_msg: '',
  };
  componentWillMount() {
    const {tagas,isAdd}=this.props;
    if(isAdd){
      this.setState({
        tags:[]
      });
    }else{
      this.setState({
        tags:tagas
      });
    }
  }

  componentDidMount() {


  }

  handleClose = removedTag => {
    const tags = this.state.tags.filter(tag => tag !== removedTag);
    this.setState({ tags });
    this.props.getValues(tags);
  };

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  handleInputChange = e => {
    this.setState({ inputValue: e.target.value });

  };

  handleInputConfirm = () => {
    const { inputValue } = this.state;
    let { tags } = this.state;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }
    const tag_str = tags.join('');
    const tag_str_len = tag_str.length;
    this.props.getTags(tags);
    this.props.getValues(tags);
    if(tag_str_len > 18) {
      this.setState({
        err_msg: tag_str_len > 18 ? '超出最大字符数': ''
      });
    }else{
      this.setState({
        tags,
        inputVisible: false,
        inputValue: '',
        err_msg: '',
      });
    }
  };

  handleEditInputChange = e => {
    this.setState({ editInputValue: e.target.value });
  };

  handleEditInputConfirm = () => {
    this.setState(({ tags, editInputIndex, editInputValue }) => {
      const newTags = [...tags];
      newTags[editInputIndex] = editInputValue;
      this.props.getValues(newTags);
      return {
        tags: newTags,
        editInputIndex: -1,
        editInputValue: '',
      };
    });
  };

  saveInputRef = input => {
    this.input = input;
  };

  saveEditInputRef = input => {
    this.editInput = input;
  };

  render() {
    const { tip } = this.props;
    const { tags, inputVisible, inputValue, editInputIndex, editInputValue , err_msg} = this.state;
    return (
      <>
        {tags.map((tag, index) => {
          if (editInputIndex === index) {
            return (
              <Input
                ref={this.saveEditInputRef}
                key={tag}
                size="small"
                className="tag-input"
                style={{maxWidth:'100px'}}
                maxLength={6}
                value={editInputValue}
                onChange={this.handleEditInputChange}
                onBlur={this.handleEditInputConfirm}
                onPressEnter={this.handleEditInputConfirm}
              />
            );
          }

          const isLongTag = tag.length > 20;

          const tagElem = (
            <Tag
              className="edit-tag"
              key={tag}
              closable={true}
              onClose={() => this.handleClose(tag)}
            >
              <span
                onDoubleClick={e => {
                  this.setState({ editInputIndex: index, editInputValue: tag }, () => {
                    this.editInput.focus();
                  });
                  e.preventDefault();

                }}
              >
                {isLongTag ? `${tag.slice(0, 20)}...` : tag}
              </span>
            </Tag>
          );
          return isLongTag ? (
            <Tooltip title={tag} key={tag}>
              {tagElem}
            </Tooltip>
          ) : (
            tagElem
          );
        })}
        {inputVisible && (
          <Input
            ref={this.saveInputRef}
            type="text"
            size="small"
            className="tag-input"
            style={{maxWidth:'100px'}}
            maxLength={6}
            value={inputValue}
            onChange={this.handleInputChange}
            onBlur={this.handleInputConfirm}
            onPressEnter={this.handleInputConfirm}
          />
        )}
        {!inputVisible && tags.length <=2 && (
          <Tag className="site-tag-plus" onClick={this.showInput}>
             + 添加
          </Tag>
        )}
        <span>{tip}</span>
        {
          err_msg && <span className="red6 m-l-5">{'（' + err_msg + '）'}</span>
        }
      </>
    );
  }
}
