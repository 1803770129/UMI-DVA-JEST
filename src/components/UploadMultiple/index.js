import React from 'react';
import { Upload, Icon, Modal, message } from 'antd';
import { thumbnail, originalImage } from '@/utils/tools';
// import styles from './index.less';

/*
    // 一、传入的参数：
    // 1、imageUrlList[Array]：                        展示的图片数组 [xxx_id: '', xxx_url: '']
    // 2、saveUploadFileListFn[Function]:              保存上传图片的函数
    // 3、removeFileFn[Function]                       移除图片的函数

    // 保存上传的图片文件
    saveUploadFileListFn = (file, fileList, callback) => {

    }
    // 移除上传的图片文件
    removeFileFn = (target, callback) => {

    }
    
    // 格式化上传图片路径
    function formatUploadImageUrlListFn(fileList) {
        if(fileList.length !== 0) {
            fileList.forEach(elem => {
                if(elem.oem_partsku_image_url.indexOf('http') === -1 && elem.oem_partsku_image_url.indexOf('data:image') === -1) {
                    elem.oem_partsku_image_url = ENV.imgDomain + elem.oem_partsku_image_url;
                }
            });
        }
        return fileList;
    }

    // 调用
    <UploadMultiple 
        imageUrlList={formatUploadImageUrlListFn([...oeInfo.oemImage])}
        saveUploadFileListFn={this.saveUploadFileListFn}
        removeFileFn={this.removeFileFn}
    />
*/

class UploadMultiple extends React.Component {
    state = {
        previewVisible: false,
        previewImage: '',
        fileList: [],
        // fileList: [{
        //     uid: '-1',
        //     name: 'xxx.png',
        //     status: 'done',
        //     url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        // }],
    };

    componentDidMount() {
        this.formatImageUrlListFn();
    };

    formatImageUrlListFn = () => {
        let newFileList = this.props.imageUrlList.map((item, index) => {
            let obj = { uid: '-' + index };
            for(let key in item) {
                if(typeof item[key] == 'string' && item[key].indexOf('_url') !== 0) { // 蹩脚 - 为了通用，url的地址的key值必须带上_url三个关键字母
                    obj.url = thumbnail(item[key]);
                    obj.ori = originalImage(item[key]);
                }
                obj[key] = item[key];
            }
            return obj;
        });
        this.setState({fileList: newFileList});
    }

    handleCancel = () => this.setState({ previewVisible: false })

    handlePreview = file => {        
        this.setState({
            previewImage: file.ori || file.thumbUrl,
            previewVisible: true,
        });
    }

    handleChange = ({ file, fileList }) => {
        if(file.status !== 'removed') {
            // 上传文件验证
            const imgTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/bmp'];
            const isJPG = imgTypes.indexOf(file.type) > -1;
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isJPG) {
                return message.error('请选择图片格式的文件!');
            }
            if (!isLt5M) {
                return message.error('图片不能超过 5MB!');
            }
            this.setState({ fileList });
            this.props.saveUploadFileListFn(file, fileList, () => {
                this.formatImageUrlListFn();
            });
        } else {
            this.setState({ fileList });
        }
    }

    handleRemove = file => {
        this.props.removeFileFn(file, () => {
            this.formatImageUrlListFn();
            return true;
        });
    }

    render() {
        const { previewVisible, previewImage, fileList } = this.state;
        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">Upload</div>
            </div>
        );
        return (
            <div className="clearfix">
                <Upload
                    accept='image/jpeg,image/jpg,image/png,image/bmp'
                    multiple={true}
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={this.handlePreview}
                    onChange={this.handleChange}
                    onRemove={this.handleRemove}
                    beforeUpload={() => false} // 不加这一行，onChange的时候会自动上传到根目录下，放到线上环境就会报405错误。返回false，手动上传
                >
                    {fileList.length >= 9 ? null : uploadButton}
                </Upload>
                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
            </div>
        );
    }
}
export default UploadMultiple;