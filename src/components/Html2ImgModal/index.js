import React from 'react';
import { Modal } from 'antd';
// 转换html为图片
import domtoimage from 'dom-to-image';
import styles from './index.less';

let timer;
const returnFalse = () => {
  return false;
};

// 图片预览模态框
class Html2ImgModal extends React.Component {

  state = {
    imageCompleted: false,
    imgUrl: '',
    viewHtml: ''
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(!prevProps.visible && this.props.visible){
      // console.log(this.props.onGetContent('html'));
      this.setState({
        viewHtml: this.props.original_img_desc
      }, this.init);
    }
  }

  init = () => {
    timer = setTimeout(() => {
      if (this.view_modal_content) {
        this.view_modal_content.oncontextmenu = returnFalse;
        this.view_modal_content.oncopy = returnFalse;
        this.view_modal_content.oncut = returnFalse;
        this.view_modal_content.onselect = returnFalse;
        this.view_modal_content.ondragstart = returnFalse;
        clearTimeout(timer);
        domtoimage.toPng(this.view_modal_content)
          .then(dataUrl => {
            this.setState({
              imgUrl: dataUrl,
              imageCompleted: true
            });
          })
          .catch(function (error) {
            console.error('oops, something went wrong!', error);
          });
      } else {
        this.init();
      }
    }, 200);
  };

  handleCancal = () => {
    const { onCancel } = this.props;
    this.setState({
      imageCompleted: false,
      imgUrl: '',
      viewHtml: ''
    }, onCancel);
  };

  render() {
    const { imageCompleted, imgUrl, viewHtml } = this.state;
    const { visible } = this.props;
    
    return (
      <Modal style={{top: 10}} title="" visible={visible} footer={null} onCancel={this.handleCancal} width={426} destroyOnClose wrapClassName="html_2_img_modal">
        <div className={styles.scroll_box}>
          <div ref={el => this.view_modal_content = el} className={styles.content} >
            {
              imageCompleted ?
                <div>
                  <img src={imgUrl} />
                </div>
                : <div className={styles.view_html} dangerouslySetInnerHTML={{__html: viewHtml}}></div>
            }
          </div>
        </div>
      </Modal>
    );
  }
}

export default Html2ImgModal;