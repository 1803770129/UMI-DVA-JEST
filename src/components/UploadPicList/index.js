import React, {Component} from 'react';
import { Row, Icon, Divider, Spin } from 'antd';
import styles from './index.less';
import { PhotoSwipe } from 'react-photoswipe';
import { imgVert, changeFile, thumbnail, getPicSize, isEmpty } from '@/utils/tools';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import classNames from 'classnames';

const UploadButton = ({loading, noText}) => {
  if(loading) {
    return (
      <Spin />
    );
  }else{
    const _icon_props = {};
    // upload_card_box_middle 没有文字时上下居中
    return (
      <div className={classNames(styles.upload_card_box, {[styles.upload_card_box_middle]: noText})}>
        <Icon type="plus" {..._icon_props}/>
        {!noText && <div>上传图片</div>}
      </div>
    );
  }
};

const SortableItem = SortableElement(({value, _props}) => {
  return (
    <div className={styles.upload_list_box} {..._props}>
      <img src={thumbnail(value.url)} className={styles.upload_list_img} />
    </div>
  );
});

const SortableList = SortableContainer(({items, size, w, noText, loading, onPreview, onRemove, onChangeFile}) => {
  // 指定宽高度
  let _props = {};
  if(!isEmpty(w)) {
    _props.style = {
      width: w,
      height: w
    };
  }

  // 预览删除图标位置设定
  let _icon_props = {};
  if(noText) {
    _icon_props.style={
      margin: '4px 5px'
    };
  }
  return (
    <div className={styles.upload_list}>
      {items.map((value, index) => (
        <div className={styles.upload_list_item} key={value.uid}>
          <span className={styles.upload_icon_box}>
            <Icon type="eye" className={styles.upload_icon} onClick={() => onPreview(value, index)} {..._icon_props}/>
            <Icon type="delete" className={styles.upload_icon} onClick={() => onRemove(value)} {..._icon_props}/>
          </span>
          <SortableItem key={`item-${index}`} index={index} value={value} _props={_props}/>
        </div>
      ))}
      {
        items.length < size &&
                <label className={styles.upload_card} role="button" {..._props}>
                  <input type="file" accept="image/gif,image/jpeg,image/jpg,image/png" multiple style={{display: 'none'}} onChange={onChangeFile} disabled={loading}/>
                  <UploadButton loading={loading} noText={noText}/>
                </label>
      }
    </div>
  );
});

// 产品图片
export default class PartPic extends Component {

    state = {
      previewVisible: false,        // 图片预览模态框状态
      previewViewIndex: 0, 
      previewImgs: [],
      imgErrMsg: null
    }

    // 设定上传图片错误提示
    handleSetImgErrMsg = m => {
      this.setState({
        imgErrMsg: m
      });
    };

    // 上传图片预览
    handlePreview = async (file, index) => {     
      const { imgs } = this.props;
      let previewImgs = [];
      for (let i = 0; i < imgs.length; i++) {
        const img = imgs[i];
        let config = await getPicSize(img.url);
        previewImgs[i] = {...img, ...config};
      }
      this.setState(
        file 
          ? { previewVisible: true, previewViewIndex: index, previewImgs } 
          : { previewVisible: false }
      );
    };

    handleChangeFile = e => {
      const {imgs, size, onUpload } = this.props;
      const files = e.target.files ? Array.prototype.slice.call(e.target.files) : [];
      const len = files.length + imgs.length;
      // 清空错误信息
      this.handleSetImgErrMsg(null);
      // 图片数量验证
      if(len > size) {
        return this.handleSetImgErrMsg(`最多上传${size}张图片`);
      }

      // 上传文件验证
      const uploadList = files.filter(file => !imgVert(file));
      if(uploadList.length > 0) {
        return this.handleSetImgErrMsg('请上传不大于20MB，格式为 jpg | png | gif 格式的图片文件');
      }

      for(let i = 0; i < files.length; i++) {
        changeFile(files[i])
          .then(res => {
            onUpload(res.file, this.handleSetImgErrMsg);
          })
          .catch(err => {
            console.error(err);
            this.handleSetImgErrMsg('上传图片错误');
          });
      }
      e.target.value = null;
    };

    handleSortEnd = ({oldIndex, newIndex}) => {
      const {imgs, onUpdatePic } = this.props;
      onUpdatePic(arrayMove(imgs, oldIndex, newIndex));
    };

    handleRemove = img => {
      const {imgs, onUpdatePic } = this.props;
      onUpdatePic(imgs.filter(v => v.uid !== img.uid ));
    };

    render() {
      const {imgs = [], size, w, noText, loading } = this.props;
      const {previewVisible, previewViewIndex, previewImgs, imgErrMsg } = this.state;
      return (
        <Row gutter={16} className="m-t-10" style={{paddingLeft: 10}}>
          <SortableList items={imgs} w={w} noText={noText} size={size} loading={loading} axis={'x'} onSortEnd={this.handleSortEnd} onRemove={this.handleRemove} onPreview={this.handlePreview} onChangeFile={this.handleChangeFile} />
          <div className={styles.help}>{imgErrMsg}</div>
          {/* 图片预览 */}
          <PhotoSwipe isOpen={previewVisible} items={previewImgs} options={{index: previewViewIndex}} onClose={this.handlePreview}/>
          {!noText && <Divider style={{marginTop:10, marginBottom: 10}}/>}
        </Row>
      );
    }
}