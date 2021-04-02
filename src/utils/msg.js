import { notification, message } from 'antd';

const errMsg = (res, type) => {
  if(typeof(res) == 'string') {
    return message.success(res);
  }
  if(res.code != -1) {
    // 系统提示错误
    notification.info({
      message: res.msg
    });
  }
};

export default errMsg;