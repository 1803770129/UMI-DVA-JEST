import React from 'react';
import { Divider, Form, Button, Input, Radio, Modal } from 'antd';
import { thumbnail } from 'utils/tools';
import styles from './FeedbackCarmodelsModal.less';
import UploadPicList from '@/components/UploadPicList';
const FormItem = Form.Item;
const { TextArea } = Input;
const RadioGroup = Radio.Group;

// 回复模态框
const ReplyModal = ({ loading, form, visible, reply_imgs, cur_row, list, onOk, onCancel, onUploadPic, onUpdatePic, onReply, onPreviewImage }) => {
  const { getFieldDecorator, validateFields, setFieldsValue, getFieldValue } = form;
  // 回复
  const handleSubmit = e => {
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        onReply(values, () => {
          // 回复成功后清空表单
          setFieldsValue({process_content: ''});
        });
      }
    });
  };
  // 确定更新反馈状态
  const handleOk = () => {
    onOk(getFieldValue('feedback_status'));
  };

  // 初始化处理状态
  const init_feedback_status = (cur_row.feedback_cm_status === 'PENDING' || !cur_row.feedback_cm_status) ? 'PROCESSING' : cur_row.feedback_cm_status;

  let cur_row_imgs = cur_row.feedback_cm_images || [];
  cur_row_imgs = cur_row_imgs.map(v => v.feedback_cm_image_url).filter(url => !!url);
  return (
    <Modal destroyOnClose title="反馈处理" width={650} visible={visible} footer={null} onCancel={onCancel} className={styles.reply_modal}>
      <div className={styles.reply_content} id="carmodel_reply_content">
        {/* 反馈行 */}
        <div className={styles.issue}>
          <div className={styles.issue_title}>反馈车型</div>
          <div className={styles.issue_desc}>{cur_row.feedback_cm_car}</div>
          <div className={styles.issue_title}>问题描述</div>
          <div className={styles.issue_desc}>{cur_row.feedback_cm_content}</div>
          {
            cur_row_imgs.length > 0 && 
            <div className={styles.issue_pic} style={{ marginBottom: 10 }}>
              {
                cur_row_imgs.map((img, imgIdx) => {
                  return <div className={styles.issue_pic_box} key={imgIdx}><img src={thumbnail(img)} onClick={() => onPreviewImage(cur_row_imgs, imgIdx)}/></div>;
                })
              }
            </div>
          }
          <div className={styles.issue_bt}>
            <span>{cur_row.person_name} ({cur_row.feedback_cm_phone})</span><span className="m-l-15">{cur_row.feedback_cm_time}</span>
          </div>
        </div>
        <Divider style={{ marginTop: 5, marginBottom: 5 }} />
        {/* 回复行 */}

        {
          list.map((v, vIdx) => {
            // feedback_cm_process_content 反馈单处理内容(feedback_cm_process_stance > USER); 
            // feedback_cm_content 反馈内容 (feedback_cm_process_stance > SOPEI)
            const { feedback_cm_process_stance, feedback_cm_process_content, feedback_cm_images = [], person_name, feedback_cm_process_time } = v;
            const imgs = feedback_cm_images.map(img => img.feedback_cm_image_url).filter(url => !!url);
            return (
              <div key={vIdx}>
                <div className={styles.issue}>
                  <div className={styles.issue_desc}>{feedback_cm_process_content}</div>
                  {
                    imgs.length > 0 && 
                    <div className={styles.issue_pic} style={{ marginBottom: feedback_cm_process_stance === 'SOPEI' ? 10 : 0 }}>
                      {
                        imgs.map((img, imgIdx) => {
                          return <div className={styles.issue_pic_box} key={imgIdx}><img src={thumbnail(img)} onClick={() => onPreviewImage(imgs, imgIdx)}/></div>;
                        })
                      }
                    </div>
                  }
                  <div className={styles.issue_bt}>
                    <span>{person_name}</span> <span className="m-l-15">{feedback_cm_process_time}</span>
                  </div>
                </div>

                {vIdx !== list.length - 1 && <Divider style={{ marginTop: 5, marginBottom: 5 }} />}
              </div>
            );
          })
        }

      </div>

      <div className="m-t-10">
        <FormItem className="rel" style={{ marginBottom: 0 }}>
          {getFieldDecorator('process_content', {
            initialValue: '',
            rules: [
              { message: '必填项', required: true }
            ]
          })(
            <TextArea placeholder="请填写回复信息" rows={3} maxLength={100} className={styles.text_area} />
          )}
          <div className={styles.upload_box}>
            <UploadPicList imgs={reply_imgs} size={3} w={50} noText={true} loading={loading['feedbackManage/fetchFeedbackImages']} onUpload={onUploadPic} onUpdatePic={onUpdatePic} />
          </div>
          <Button type="default" onClick={handleSubmit} loading={loading['carmodelFeedback/fetchFeedbackReply']} className={styles.reply_btn}>回复</Button>
        </FormItem>
        <Form autoComplete="off" layout="inline">
          <FormItem label="处理状态" style={{ marginBottom: 0 }}>
            {getFieldDecorator('feedback_status', {
              initialValue: init_feedback_status
            })( 
              <RadioGroup>
                <Radio value="PROCESSING">处理中</Radio>
                <Radio value="OVER">已处理</Radio>
              </RadioGroup>
            )}
          </FormItem>
        </Form>
        <div className="text-center">
          <Button type="primary" onClick={handleOk}>确定</Button>
          <Divider type="vertical" style={{ marginLeft: 10, marginRight: 10 }} />
          <Button onClick={onCancel}>取消</Button>
        </div>
      </div>
    </Modal>
  );
};

export default Form.create()(ReplyModal);