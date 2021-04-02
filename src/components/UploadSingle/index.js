import React, { Component } from 'react';
import { Upload, Icon, message } from 'antd';
import ENV from '@/utils/env';
import styles from './index.less';

// function getBase64(img, callback) {
//     const reader = new FileReader();
//     reader.addEventListener('load', () => callback(reader.result));
//     reader.readAsDataURL(img);
// }

/**
 * 插件传入两个参数：
 * imageUrl(String)：                       用来展示的图片url
 * saveUploadFileFn(Function)：             保存上传的文件
 */

class UploadSingle extends Component {

    state = {
        loading: false,
        imageUrl: ''
    };

    componentDidMount() {
        this.setState({imageUrl: this.props.imageUrl || ''});
    }

    handleChange = ({ file }) => {
        this.setState({ loading: true });
        // 上传文件验证
        const imgTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/bmp', 'image/svg+xml'];
        const isJPG = imgTypes.indexOf(file.type) > -1;
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isJPG) {
            return message.error('请选择图片格式的文件!');
        }
        if (!isLt5M) {
            return message.error('图片不能超过 5MB!');
        }
        // getBase64(file, imageUrl => this.setState({ imageUrl, loading: false }));
        this.props.saveUploadFileFn(file, imageUrl => this.setState({ imageUrl, loading: false }));
    }

    render() {
        const uploadButton = (
            <div>
                <Icon type={this.state.loading ? 'loading' : 'plus'} />
                {/* <div className="ant-upload-text">Upload</div> */}
            </div>
        );

        let imageUrl = '';
        const url = this.state.imageUrl;
        if(url.indexOf('http') === -1 && url.indexOf('data:image') === -1) {
            imageUrl = ENV.imgDomain + url;
        } else {
            imageUrl = url;
        }

        return (
            <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                accept='image/jpeg,image/jpg,image/png,image/bmp'
                onChange={this.handleChange}
                disabled={this.state.loading}
                beforeUpload={() => false} // 不加这一行，onChange的时候会自动上传到根目录下，放到线上环境就会报405错误。返回false，手动上传
            >
                {
                    // imageUrl ? <div className={styles.uploadContainer}><img src={imageUrl} alt="avatar" /></div> : uploadButton
                    this.state.loading ? uploadButton : imageUrl !== ENV.imgDomain ? 
                        <div className={styles.uploadContainer}>
                            <img src={imageUrl} alt="avatar" />
                        </div> : uploadButton
                }
            </Upload>
        );
    }
};

export default UploadSingle;