import React from 'react';
import msg from '@/utils/msg';
import { imgVert, changeFile, dataURLtoFile, originalImage } from 'utils/tools';

// 引入编辑器以及编辑器样式
import 'braft-polyfill';
import BraftEditor from 'braft-editor';
import 'braft-editor/dist/braft.css';

import Html2ImgModal from '@/components/Html2ImgModal';

// 生成图片预览
const PreviewButton = ({ onShowModal }) => <button type="button" title="预览" className="control-item button" style={{ margin: 0 }} onClick={onShowModal}><span className="braft-control-text">预览</span></button>;

class Editor extends React.Component {

  state = {
    previewModalvisible: false
  }

  componentDidMount() {

  }
  /** 编辑器生成图片预览 */
  showPreviewModal = () => {
    this.setState({
      previewModalvisible: true
    });
  };

  hidePreviewModal = () => {
    this.setState({ previewModalvisible: false });
  };
  /** 编辑器生成图片预览 end */


  handleRawChange = rawContent => {
    this.editorInstance && this.props.onEditorChange(rawContent, this.editorInstance.getContent('html'));
  };

  render() {
    const { previewModalvisible } = this.state;
    const { isPreview = false, type, original_img_desc, onEditorUpload } = this.props;
    const getContent = this.editorInstance && this.editorInstance.getContent;
    let editorProps = {
      height: 500,
      contentFormat: 'html',
      controls: [
        'source', 'undo', 'redo', 'split',
        'headings', 'font-size', 'font-family', 'line-height', 'letter-spacing', 'indent', 'text-color', 'bold', 'italic', 'underline', 'strike-through', 'superscript', 'subscript', 'remove-styles', 'emoji', 'text-align', 'split',
        'list_ul', 'list_ol', 'blockquote', 'code', 'split',
        'link', 'split',
        'hr', 'split',
        'media', 'clear', 'split'
      ],
      excludeControls: ['emoji', 'font-size', 'headings', 'letter-spacing', 'font-family', 'line-height', 'code', 'superscript', 'subscript', 'blockquote', 'link'], // 排除显示
      pasteMode: 'text', // 只粘贴文本内容
      imageControls: [
        'float-left', // 设置图片左浮动
        'float-right', // 设置图片右浮动
        'align-left', // 设置图片居左
        'align-center', // 设置图片居中
        'align-right', // 设置图片居右
        // 'link', // 设置图片超链接
        'size', // 设置图片尺寸
        'remove' // 删除图片
      ],
      media: {
        allowPasteImage: false, // 是否允许直接粘贴剪贴板图片（例如QQ截图等）到编辑器
        image: true, // 开启图片插入功能
        video: false, // 开启视频插入功能
        audio: false, // 开启音频插入功能
        externals: {
          image: false,
          video: false,
          audio: false,
          embed: false
        },
        validateFn: (file) => {
          const vert = imgVert(file, errMsg => {
            msg(errMsg);
          });
          return vert;
        }, // 指定本地校验函数
        uploadFn: param => {
          changeFile(param.file)
            .then(res => {
              onEditorUpload({ file: dataURLtoFile(res.base64, param.file.name) }).then(result => {
                if (result.code === 0) {
                  param.success({
                    url: originalImage(result.data[type + '_partsku_image_url']) + '?' + type + '_partsku_image_id=' + result.data[type + '_partsku_image_id']
                  });
                } else {
                  msg(result.code);
                  param.error(err => {
                    console.log(err);
                    return err;
                  });
                }
              });

            })
            .catch(err => {
              console.error(err);
              msg('压缩图片错误');
            });

        }   // 指定上传函数
      },
      initialContent: this.props.initialContent,
      onChange: this.handleChange,
      onRawChange: this.handleRawChange
    };
    // 预览
    if (isPreview) {
      editorProps.extendControls = [
        {
          key: 'Preview-component',
          type: 'component',
          component: <PreviewButton onShowModal={this.showPreviewModal} />
        }
      ];
    };
    return (
      <div style={{ border: 'solid 1px #DDD' }}>
        <BraftEditor {...editorProps} ref={instance => this.editorInstance = instance} />
        {/* 编辑器生成图片预览模态框 */}
        <Html2ImgModal visible={previewModalvisible} original_img_desc={original_img_desc} onGetContent={getContent} onCancel={this.hidePreviewModal} />
      </div>
    );
  }
}

export default Editor;
