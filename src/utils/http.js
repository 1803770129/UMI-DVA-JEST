import axios from 'axios';
import { notification } from 'antd';
import { routerRedux } from 'dva/router';
import * as services from '../services';
import { isFormData, checkEmoji } from '@/utils/tools';

// axios 配置
axios.defaults.timeout = 50000;
axios.defaults.baseURL = '/api/manager/v2.0/';
// 跨域配置
axios.defaults.withCredentials = true;

// 拦截器
axios.interceptors.request.use(
  config => config,
  error => Promise.reject(error)
);

axios.interceptors.response.use(
  async response => {
    // 开发环境
    if (process.env.NODE_ENV !== 'production') {
      console.groupCollapsed(`response info: ${response.config.url}`);
      console.log(
        '%c request url',
        'color: #9E9E9E; font-weight: bold',
        response.config.url + ' => state:' + response.status
      );
      console.log(
        '%c request params',
        'color: #4CAF50; font-weight: bold',
        response.config.params
      );
      if (response.config.data) {
        console.log(
          '%c request data',
          'color: #ACF9BF; font-weight: bold',
          response.config.data
        );
      }
      console.log(
        '%c response data',
        'color: #03A9F4; font-weight: bold',
        response.data
      );
      console.groupEnd();
    }

    return response;
  },
  error => {
    return Promise.resolve(error.response);
  }
);

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。'
};

function checkStatus(response) {
  if (response && (response.status === 200 || response.status === 304 || response.status === 400)) {
    return checkLogin(response.data);
  }
  const errortext = codeMessage[response.status] || response.statusText;
  notification.info({
    message: `请求错误 ${response.status}: ${response.config.url}`,
    description: errortext
  });
  const error = new Error(errortext);
  error.code = -1;
  error.msg = errortext;
  error.name = response.status;
  error.response = response;
  throw error;
}

let timer;
function checkLogin(res) {
  const { dispatch } = window.g_app._store;
  if (res.code == 21001) {
    if (!timer) {
      timer = setTimeout(() => {
        // notification.info({
        //     message: '没有登录',
        //     description: '请登录后进行操作'
        // });
        clearTimeout(timer);
        timer = null;
        dispatch(routerRedux.push('/login'));
      }, 100);
    }
    return {
      code: -1,
      msg: '没有登录'
    };
  }
  return res;
}

function errCallback(e) {
  const { dispatch } = window.g_app._store;
  const status = e.name;
  if (status === 401) {
    dispatch({
      type: 'user/logout'
    });
    return e;
  }

  return e;

  // if (status === 403) {
  //     dispatch(routerRedux.push('/403'));
  //     return e;
  // }
  // if (status <= 504 && status >= 500) {
  //     dispatch(routerRedux.push('/500'));
  //     return e;
  // }
  // if (status >= 404 && status < 422) {
  //     dispatch(routerRedux.push('/404'));
  //     return e;
  // }
}

/**
 * Requests a URL, returning a promise.
 *
 */
export const fetchData = options => {
  // 数据库暂不支持emoji字符存储，需要验证
  if (options.method === 'post') {
    const str = JSON.stringify(options.data);
    if (checkEmoji(str)) {
      const name = 'emoji';
      const code = 9999;
      return Promise.resolve({ code, name, msg: '含有非法字符(emoji表情、特殊符号等)，请重新输入' });
    }
  }

  return axios(options)
    .then(res => checkStatus(res))
    .then(res => res)
    .catch(err => errCallback(err));
};

/**
 * 通用请求接口
 * @param fnName   services请求函数名
 * @param params   search参数
 * @param data     data参数
 */
export const request = ({ fnName, params={}, data={}}) => {
  return services[fnName]({data, params});
};

/**
 * 公用post请求
 * @param url       接口地址
 * @param data      请求参数
 */

export const post = (url, {data = {}, params = {}, headers = {}}) => {
  return fetchData({ method: 'post', url, params: formatParams(params), data: formatParams(data), headers });
};


/**
 * 公用get请求
 * @param url       接口地址
 * @param params    接口参数
 */
export const get = (url, {params = {}, headers = {}} = {}) => {
  return fetchData({ method: 'get', url, params: formatParams(params), headers });
};

function formatParams(params) {
  if(isFormData(params)) {
    return params;
  }else{
    let _params = {};
    for (const key in params) {
      const val = params[key];
      if(val !== undefined) {
        _params[key] = val;
      }
    }
    return _params;
  }
}