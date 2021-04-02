import React from 'react';
import { Modal } from 'antd';
const config = {
  err_appids: '上传失败',
  err_submit_appids: '提交审核失败',
  submit_appids: '提交审核成功',
  up_appids: '上传成功',
  err_appid: '回退失败',
  success_appids: '回退成功'
};

/** 批量操作提示模态框 */
export default function PromptModal({ visible, data, onClose }) {
  const list = Object.entries(data).filter(v => v[1] && v[1].length > 0).map(v => ({ msg: config[v[0]] || v[0], appids: v[1] }));
  return (
    <Modal
      title="操作提示"
      visible={visible}
      onCancel={onClose}
      footer={false}
    >
      {
        list.map((v, idx) => {
          return <p key={idx}><b className="c6">{v.msg}：</b>{v.appids}</p>;
          // return console.log(v)
        })
      }
    </Modal>
  );
}
