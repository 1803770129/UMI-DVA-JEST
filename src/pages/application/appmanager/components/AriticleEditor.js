import React, { Component } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftjstohtml from 'draftjs-to-html';

export default class ArticleEditor extends Component {
    state = {
      editorState:'',
      contentState:''
    }
    render() {
      return (
        <div>
          <Editor
            editorState={this.state.editorState}
            toolbarClassName="toolbarClassName"
            wrapperClassName="wrapperClassName"
            editorClassName="editorClassName"
            onEditorStateChange={this.onEditorStateChange}
            onContentStateChange= {this.onContentStateChange}
            onBlur={this.onBlur}
          />

        </div>
      );
    }
    onEditorStateChange= (editorState)=>{
      this.setState({
        editorState //同步输入状态
      });
    }
    onContentStateChange=  (contentState)=>{
      this.setState({
        contentState //为了将来转成html
      });
    }
}
