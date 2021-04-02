import React from 'react';
import { Row, Form } from 'antd';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
const FormItem = Form.Item;

export default ({ form, editorState, postFields, onHandleEditor, onUpdateEditor }) => {
    const { getFieldDecorator } = form;

    // 富文本编辑器属性
    const editorConfig = {
        localization: { locale: 'zh' },
        toolbarClassName: 'toolbarClassName',
        wrapperClassName: 'wrapperClassName',
        editorClassName: 'editorClassName',
        toolbar: {
            options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'colorPicker', 'link', 'image', 'remove', 'history'],
            inline: { inDropdown: true },
            list: { inDropdown: true },
            textAlign: { inDropdown: true },
            link: { inDropdown: true },
            history: { inDropdown: true },
            image: {
                uploadCallback: file => {
                    return new Promise((resolve, reject) => {
                        // resolve(pic);
                        resolve({
                            data: {
                                link:
                                    'http://cms-bucket.nosdn.127.net/b1be41af0b1d47e69c9072bb4d4f74bd20180510093531.jpeg?imageView&thumbnail=185y116&quality=85'
                            }
                        });
                    });
                },
                previewImage: true,
                inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
                urlEnabled: false
            }
        },
        editorState: editorState,
        onEditorStateChange: editorState => onUpdateEditor(editorState),
        onBlur: () => onHandleEditor()
    };
    return (
        <Row>
            <FormItem label="产品说明" style={{ display: 'block' }}>
                {
                    getFieldDecorator('fms_partsku_desc')(
                        <Editor {...editorConfig} />
                    )
                }
            </FormItem>
        </Row>
    );
};