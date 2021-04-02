import React from 'react';
import { Divider, Form, Modal } from 'antd';
import { thumbnail } from 'utils/tools';
import styles from './ReplyModal.less';
import moment from 'moment';

// 回复模态框
const ReplyModal = ({ visible, cur_row, FEEDBACK_PROCESS, onCancel, onPreviewImage }) => {

  // 反馈数据图片
  const cur_row_imgs = cur_row.ten_feedback_images || [];
  return (
    <Modal destroyOnClose title="反馈处理" width={650} visible={visible} footer={null} onCancel={onCancel} className={styles.reply_modal}>
      <div className={styles.reply_content} id="reply_content">

        {/* 反馈行 */}
        <div className={styles.issue}>
          <div className={styles.issue_title}>问题描述</div>
          {cur_row.ten_feedback_content && <div className={styles.issue_desc}>{cur_row.ten_feedback_content}</div>}
          {
            cur_row_imgs.length > 0 && 
            <div className={styles.issue_pic}>
              {
                cur_row_imgs.map((img, imgIdx) => {
                  return <div className={styles.issue_pic_box} key={imgIdx}><img src={thumbnail(img.ten_feedback_image_url)} className="cur" onClick={() => onPreviewImage(cur_row_imgs.map(v => v.ten_feedback_image_url), imgIdx)} /></div>;
                })
              }
            </div>
          }
          <div className={styles.issue_bt}>
            <span>{`${cur_row.person_name} (${cur_row.ten_feedback_phone})`}</span><span className="m-l-15">{moment(new Date(cur_row.ten_feedback_time)).format('YYYY.MM.DD')}</span>
          </div>
        </div>
        <Divider style={{ marginTop: 5, marginBottom: 5 }} />

        {/* 回复行 */}
        {
          FEEDBACK_PROCESS.map((v, vIdx) => {
            const { ten_feedback_process_content, ten_feedback_images = [], person_name, ten_feedback_process_time } = v;
            const imgs = ten_feedback_images.map(v => v.ten_feedback_image_url);
            return (
              <div key={vIdx}>
                <div className={styles.issue}>
                  {ten_feedback_process_content && <div className={styles.issue_desc}>{ten_feedback_process_content}</div>}
                  {
                    imgs.length > 0 && 
                    <div className={styles.issue_pic}>
                      {
                        imgs.map((img, imgIdx) => {
                          return <div className={styles.issue_pic_box} key={imgIdx}><img src={thumbnail(img)} key={imgIdx} onClick={() => onPreviewImage(imgs, imgIdx)} /></div>;
                        })
                      }
                    </div>
                  }
                  
                  <div className={styles.issue_bt}>
                    <span>{person_name}</span><span className="m-l-15">{moment(new Date(ten_feedback_process_time)).format('YYYY.MM.DD')}</span>
                  </div>
                </div>

                {vIdx !== FEEDBACK_PROCESS.length - 1 && <Divider style={{ marginTop: 5, marginBottom: 5 }} />}
              </div>
            );
          })
        }

      </div>

    </Modal>
  );
};

export default Form.create()(ReplyModal);