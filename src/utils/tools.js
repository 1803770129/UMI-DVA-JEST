import ENV from '@/utils/env';
import lrz from 'lrz';

// 验证是否为空值（包含 null, [],{}, undefined ）
export function isEmpty(obj) {
  if (obj === null) {
    return true;
  }
  if (isArray(obj) || isString(obj)) {
    return obj.length === 0;
  }

  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }

  if (!isNaN(obj)) {
    return false;
  }

  return true;
}
// 验证字符串
export function isString(obj) {
  return toString.call(obj) === '[object String]';
}

// 验证数组
export function isArray(obj) {
  // return obj instanceof Array;
  return toString.call(obj) === '[object Array]';
}
// 验证函数
export function isFunction(obj) {
  return typeof obj === 'function';
  // return toString.call(obj) === '[object Function]';
}
// 验证对象
export function isObject(obj) {
  return obj === Object(obj) && !isArray(obj);
  // return obj instanceof Object;
  // return typeOf(obj, 'object');
}

// 验证FormData格式
export function isFormData(v) {
  return Object.prototype.toString.call(v) === '[object FormData]';
}

// 验证空对象{}
export function isEmptyObject(obj) {
  if (isObject(obj)) {
    for (let name in obj) {
      return false;
    }
    return true;
  } else {
    return false;
  }
}

// 表单验证-手机号码验证
export function validateTel(value) {
  let regExp = /^(13[0-9]|15[012356789]|17[0-9]|18[0-9]|14[57])[0-9]{8}$/;
  return regExp.test(value);
}

// 去左右空格及双引号、换行符
export function trim(s) {
  return typeof s === 'string'
    ? s.replace(/(^ +)|(["'\f\n\r\t\v])|( +$)/g, '')
    : s;
}

// 根据传入的key对数组排序
export function arrSort(arr, key) {
  arr.sort(function(a, b) {
    // return a[key] - b[key];
    return a[key].localeCompare(b[key]);
  });
  return arr;
}

// 设置本地存储
export function setLocal(key, data) {
  window.localStorage.setItem(key, JSON.stringify(data));
}

// 获取本地存储
export function getLocal(key) {
  return JSON.parse(localStorage.getItem(key));
}

// 移除本地存储
export function removeLocal(key) {
  window.localStorage.removeItem(key);
}

/**
 * 原生js addClass removeClass hasClass
 */
export function hasClass(elem, cls) {
  cls = cls || '';
  if (cls.replace(/\s/g, '').length === 0) return false; //当cls没有参数时，返回false
  return new RegExp(' ' + cls + ' ').test(' ' + elem.className + ' ');
}

export function addClass(ele, cls) {
  if (!hasClass(ele, cls)) {
    ele.className = ele.className === '' ? cls : ele.className + ' ' + cls;
  }
}

export function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    var newClass = ' ' + ele.className.replace(/[\t\r\n]/g, '') + ' ';
    while (newClass.indexOf(' ' + cls + ' ') >= 0) {
      newClass = newClass.replace(' ' + cls + ' ', ' ');
    }
    ele.className = newClass.replace(/^\s+|\s+$/g, '');
  }
}

// 获取当前css样式属性值
export function getStyle(obj, attr) {
  if (obj.currentStyle) {
    return obj.currentStyle[attr];
  } else {
    return document.defaultView.getComputedStyle(obj, null)[attr];
    //   return window.getComputedStyle(obj, null)[attr];
  }
}

// 判断传入对象的每个key是否为空对象、空数组或者空字符串，返回非空的序列
export function returnNonEmpty(obj) {
  let _o = {};
  for (let key in obj) {
    if (
      obj[key] !== '' ||
            (isArray(obj[key]) && obj.length > 0) ||
            isEmptyObject(obj[key])
    ) {
      _o[key] = obj[key];
    }
  }
  return _o;
}

// 模拟休眠
export function sleep(timeountMS) {
  return new Promise(resolve => {
    setTimeout(resolve, timeountMS);
  });
}

// 数组去重
export function uniqueArr(arr) {
  let res = Array.from(new Set(arr)).sort();
  return res;
}

// 深拷贝引用类型数据
export function clone(initialObj, finalObj) {
  function _deepClone(initialObj, finalObj, conflict) {
    var i;
    if (
      initialObj &&
            typeof initialObj === 'object' &&
            (i = [Object, Array].indexOf(initialObj.constructor)) !== -1
    ) {
      if (!finalObj) {
        finalObj = initialObj.constructor === Array ? [] : {};
      }
      if (conflict) {
        i = conflict.k.indexOf(initialObj);
        if (i !== -1) {
          return conflict.v[i];
        }
        conflict.k.push(initialObj);
        conflict.v.push(finalObj);
      }
      for (var key in initialObj) {
        finalObj[key] = _deepClone(
          initialObj[key],
          finalObj[key],
          conflict
        );
      }
      return finalObj;
    }
    return initialObj;
  }
  return _deepClone(initialObj, finalObj, {
    k: [],
    v: []
  });
}

// 判断url
export function isUrl(path) {
  /* eslint no-useless-escape:0 */
  const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/g;
  return reg.test(path);
}

// 计算字符串的字节长度
export function getBytesLength(string) {
  if(!string) return;
  var bytesCount = 0;
  for (var i = 0; i < string.length; i++) {
    var c = string.charAt(i);
    // eslint-disable-next-line
        if (/^[\u0000-\u00ff]$/.test(c)) {
      //匹配双字节
      bytesCount += 1;
    } else {
      bytesCount += 2;
    }
  }
  return bytesCount;
}

// 转换VIN编码格式
export const convertVinCode = code => {
  if(isEmpty(code)) return '';
  // vin码去除-符、空格和中文字符
  const match = code.match(/[a-zA-Z0-9\-]/g);
  let matchCode = match ? match.join('') : '';
  matchCode = matchCode.toUpperCase();
  // 匹配字符长度，不超过20 （包括-符号）
  if (matchCode.length > 17) {
    matchCode = matchCode.substring(0, 20);
  }
  // 替换-符号再匹配
  const vinCode = matchCode.replace(/-/g, '');
  // 返回格式化字符串  1234-5678-90AB-CDEFG
  const re = /^[0-9a-zA-Z]+$/;
  let res;
  if (re.test(vinCode)) {
    res = (function format(s, c) {
      if (c < 3 && s.length > 4) {
        return s.substr(0, 4) + '-' + format(s.substr(4), c + 1);
      }
      return s;
    })(vinCode, 0);
  } else {
    res = '';
  }
  return res.substring(0, 20);
};

// 返回缩略图
export function thumbnail(url, noPicStr) {
  const noPic = noPicStr || ENV.noPic;
  if(isEmpty(url) || !isString(url)) return noPic;
  // type=thumbnail 缩略图参数
  return ENV.imgDomain + url + '?type=thumbnail';
}

// 返回原图
export function originalImage(url, noPicStr) {
  const noPic = noPicStr || ENV.noPic;
  if(isEmpty(url) || !isString(url)) return noPic;
  return ENV.imgDomain + url;
}

// base64url转file
export const dataURLtoFile = (dataurl, filename) => {
  let arr = dataurl.split(',');
  let mime = arr[0].match(/:(.*?);/)[1];
  let suffix = mime.split('/')[1];
  let bstr = atob(arr[1]);
  let n = bstr.length;
  let u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename || `file.${suffix}`, {type: mime});
};

// 压缩图片
export function changeFile(file) {

  return new Promise((resolve, reject) => {
    if (!file) return reject('没有选择图片');
    // 判断图片格式
    let noImgFile = isObject(file) && !/image\/\w+/.test(file.type);
    let noImgBase64 = isString(file) && file.indexOf('data:image') != 0;
    if (noImgFile || noImgBase64) {
      return reject('只支持jpg、png、bitmap格式的图片！');
    }

    lrz(file, {
      // width: w || 1500,
      // height: h || 1500,
      quality: 0.7
    })
      .then(success => {
        resolve(success);
      })
      .catch(error => {
        reject(error);
      });
  });
}

// 图片效验
export const imgVert = (file, errFn, s) => {
  const imgTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/bmp'];
  const isJPG = imgTypes.indexOf(file.type) > -1;
  const SIZE = s || 20;
  const isLtSize = file.size / 1024 / 1024 < SIZE;
  let flag = true;
  if (!isJPG) {
    errFn && errFn('请选择图片格式的文件!');
    flag = false;
  }else if(!isLtSize) {
    errFn && errFn('图片不能超过' +  SIZE + 'MB!');
    flag = false;
  }
  return flag;
};

// 通过category_pro_group对产品属性进行分组
export function groupFn(partskuVals) {
  let group = {};
  partskuVals.forEach(partsku => {
    let key = isEmpty(partsku.category_pro_group) ? '-1' : partsku.category_pro_group;
    if (!group[key]) {
      group[key] = [];
    }
    group[key].push({ ...partsku,
      category_pro_name: key !== '-1' ? partsku.category_pro_name + '[' + key + ']' : partsku.category_pro_name
    });
  });
  let arr = [];
  if (group['-1']) {
    //未分组数据排列在前面
    arr.push(group['-1']);
  }
  for (const k in group) {
    if (k !== '-1') {
      arr.push(group[k]);
    }
  }
  return arr;
};

// 离开页面清空当前页面缓存数据
export function clearState(dispatch, model_key, is_model_key) {
  const oeIdModels = window.g_app._models.filter(v => v.namespace === model_key);
  if(oeIdModels.length > 0) {
    const { reducers } = oeIdModels[0];
    for (const k in reducers) {
      dispatch({ type: is_model_key? k.replace(`${model_key}/`, '') : k });
    }
  }
}

// 获取审核状态的样式名称
export function getCarmodelStatusColor(status) {
  let str = '';
  if(status == 'PENDING') {
    str = 'red5';
  }else if(status == 'APPROVED') {
    str = 'green5';
  }
  return str;
}

// 获取图片真实尺寸
export function getPicSize(url) {
  let img = new Image();
  const noPicObj = {
    w: 100,
    h: 100,
    src: ENV.noPic,
    thumbnail: ENV.noPic,
    title: ''
  };
  return new Promise(resolve => {
    const _w = document.body.clientWidth;
    if(url.indexOf('nopic.png') > -1 || isEmpty(url)){
      resolve(noPicObj);
    }
    const imgSrc = originalImage(url);
    img.src = imgSrc;
    img.onerror = function() {
      resolve(noPicObj);
    };
    img.onload = function() {
      if (img.complete) {
        resolve({
          w: _w,
          h: parseInt((_w * img.height) / img.width, 10),
          src: imgSrc,
          thumbnail: thumbnail(url),
          title: ''
        });
      }
    };
  });
}


// 适配车型显示：处理产品属性(产品属性包括正常属性和IMAGE类型属性)
export function getPartskuValues(cateProps = [], std) {
  const { oem_partsku_vals = [] } = std;
  const partsku_values_all = cateProps.map(val => {
    const fil = oem_partsku_vals.filter(prop => val.category_pro_id === prop.category_pro_id);
    return { ...fil[0], ...val };
  });
  const partsku_values = partsku_values_all.filter(val => !isEmpty(val.oem_partsku_value));
  const partsku_values_img = partsku_values_all.filter(val => !isEmpty(val.oem_partsku_image_url));
  return { partsku_values, partsku_values_img };
}

// 生成长图前预先读取图片
export async function loadingAllDescImgs(imgs) {
  const loadingImgs = img => {
    return new Promise((resolve, reject) => {
      img.onerror = () => {
        resolve('图片加载错误');
      };
      img.onload = () => {
        if (img.complete) {
          resolve('Image loaded:' + img.src);
        }
      };
    });
  };
  let promise_all = [];
  for (let i = 0; i < imgs.length; i++) {
    promise_all.push(loadingImgs(imgs[i]));
  }
  await Promise.all(promise_all).then(values => {
    //  console.log(values);
  }).catch(err => {
    console.log(err);
  });
}

// 替换无水印图
export function getOriginalImgDesc (_html, url_str) {
  //匹配图片（g表示匹配所有结果i表示区分大小写）
  const imgReg = /<img.*?(?:>|\/>)/gi;
  //匹配src属性
  const srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
  // 匹配id串
  const idReg = /\/\d+/g;
  let matchArr = _html.match(imgReg);
  let original_img_desc = _html;
  if (matchArr) {
    for (let i = 0; i < matchArr.length; i++) {
      let src = matchArr[i].match(srcReg);
      if (src[1]) {
        let image_url = src[1].replace(idReg, '').replace(url_str, url_str + 'desc/');
        // 替换图片为无水印原图
        original_img_desc = original_img_desc.replace(src[1], image_url.includes(ENV.imgDomain) ? image_url : ENV.imgDomain + image_url);
      }
    }
  }
  return original_img_desc;
};

// 验证Emoji
export function checkEmoji (str) {
  // https://mths.be/emoji
  const reg = /\u{1F3F4}\u{E0067}\u{E0062}(?:\u{E0077}\u{E006C}\u{E0073}|\u{E0073}\u{E0063}\u{E0074}|\u{E0065}\u{E006E}\u{E0067})\u{E007F}|(?:\u{1F9D1}\u{1F3FB}\u200D\u{1F91D}\u200D\u{1F9D1}|\u{1F469}\u{1F3FC}\u200D\u{1F91D}\u200D\u{1F469})\u{1F3FB}|\u{1F468}(?:\u{1F3FC}\u200D(?:\u{1F91D}\u200D\u{1F468}\u{1F3FB}|[\u{1F33E}\u{1F373}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FF}\u200D(?:\u{1F91D}\u200D\u{1F468}[\u{1F3FB}-\u{1F3FE}]|[\u{1F33E}\u{1F373}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FE}\u200D(?:\u{1F91D}\u200D\u{1F468}[\u{1F3FB}-\u{1F3FD}]|[\u{1F33E}\u{1F373}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FD}\u200D(?:\u{1F91D}\u200D\u{1F468}[\u{1F3FB}\u{1F3FC}]|[\u{1F33E}\u{1F373}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u200D(?:\u2764\uFE0F\u200D(?:\u{1F48B}\u200D)?\u{1F468}|[\u{1F468}\u{1F469}]\u200D(?:\u{1F466}\u200D\u{1F466}|\u{1F467}\u200D[\u{1F466}\u{1F467}])|\u{1F466}\u200D\u{1F466}|\u{1F467}\u200D[\u{1F466}\u{1F467}]|[\u{1F468}\u{1F469}]\u200D[\u{1F466}\u{1F467}]|[\u2695\u2696\u2708]\uFE0F|[\u{1F466}\u{1F467}]|[\u{1F33E}\u{1F373}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|(?:\u{1F3FB}\u200D[\u2695\u2696\u2708]|\u{1F3FF}\u200D[\u2695\u2696\u2708]|\u{1F3FE}\u200D[\u2695\u2696\u2708]|\u{1F3FD}\u200D[\u2695\u2696\u2708]|\u{1F3FC}\u200D[\u2695\u2696\u2708])\uFE0F|\u{1F3FB}\u200D[\u{1F33E}\u{1F373}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]|[\u{1F3FB}-\u{1F3FF}])|\u{1F9D1}(?:\u{1F3FF}\u200D\u{1F91D}\u200D\u{1F9D1}[\u{1F3FB}-\u{1F3FF}]|\u200D\u{1F91D}\u200D\u{1F9D1})|\u{1F469}(?:\u{1F3FE}\u200D(?:\u{1F91D}\u200D\u{1F468}[\u{1F3FB}-\u{1F3FD}\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FD}\u200D(?:\u{1F91D}\u200D\u{1F468}[\u{1F3FB}\u{1F3FC}\u{1F3FE}\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FC}\u200D(?:\u{1F91D}\u200D\u{1F468}[\u{1F3FB}\u{1F3FD}-\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FB}\u200D(?:\u{1F91D}\u200D\u{1F468}[\u{1F3FC}-\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u200D(?:\u2764\uFE0F\u200D(?:\u{1F48B}\u200D[\u{1F468}\u{1F469}]|[\u{1F468}\u{1F469}])|[\u{1F33E}\u{1F373}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FF}\u200D[\u{1F33E}\u{1F373}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|(?:\u{1F9D1}\u{1F3FE}\u200D\u{1F91D}\u200D\u{1F9D1}|\u{1F469}\u{1F3FF}\u200D\u{1F91D}\u200D[\u{1F468}\u{1F469}])[\u{1F3FB}-\u{1F3FE}]|(?:\u{1F9D1}\u{1F3FD}\u200D\u{1F91D}\u200D\u{1F9D1}|\u{1F469}\u{1F3FE}\u200D\u{1F91D}\u200D\u{1F469})[\u{1F3FB}-\u{1F3FD}]|(?:\u{1F9D1}\u{1F3FC}\u200D\u{1F91D}\u200D\u{1F9D1}|\u{1F469}\u{1F3FD}\u200D\u{1F91D}\u200D\u{1F469})[\u{1F3FB}\u{1F3FC}]|\u{1F469}\u200D\u{1F469}\u200D(?:\u{1F466}\u200D\u{1F466}|\u{1F467}\u200D[\u{1F466}\u{1F467}])|\u{1F469}\u200D\u{1F466}\u200D\u{1F466}|\u{1F469}\u200D\u{1F469}\u200D[\u{1F466}\u{1F467}]|(?:\u{1F441}\uFE0F\u200D\u{1F5E8}|\u{1F469}(?:\u{1F3FF}\u200D[\u2695\u2696\u2708]|\u{1F3FE}\u200D[\u2695\u2696\u2708]|\u{1F3FD}\u200D[\u2695\u2696\u2708]|\u{1F3FC}\u200D[\u2695\u2696\u2708]|\u{1F3FB}\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|[\u{1F3C3}\u{1F3C4}\u{1F3CA}\u{1F46E}\u{1F471}\u{1F473}\u{1F477}\u{1F481}\u{1F482}\u{1F486}\u{1F487}\u{1F645}-\u{1F647}\u{1F64B}\u{1F64D}\u{1F64E}\u{1F6A3}\u{1F6B4}-\u{1F6B6}\u{1F926}\u{1F937}-\u{1F939}\u{1F93D}\u{1F93E}\u{1F9B8}\u{1F9B9}\u{1F9CD}-\u{1F9CF}\u{1F9D6}-\u{1F9DD}][\u{1F3FB}-\u{1F3FF}]\u200D[\u2640\u2642]|[\u26F9\u{1F3CB}\u{1F3CC}\u{1F575}](?:\uFE0F\u200D[\u2640\u2642]|[\u{1F3FB}-\u{1F3FF}]\u200D[\u2640\u2642])|\u{1F3F4}\u200D\u2620|[\u{1F3C3}\u{1F3C4}\u{1F3CA}\u{1F46E}\u{1F46F}\u{1F471}\u{1F473}\u{1F477}\u{1F481}\u{1F482}\u{1F486}\u{1F487}\u{1F645}-\u{1F647}\u{1F64B}\u{1F64D}\u{1F64E}\u{1F6A3}\u{1F6B4}-\u{1F6B6}\u{1F926}\u{1F937}-\u{1F939}\u{1F93C}-\u{1F93E}\u{1F9B8}\u{1F9B9}\u{1F9CD}-\u{1F9CF}\u{1F9D6}-\u{1F9DF}]\u200D[\u2640\u2642])\uFE0F|\u{1F469}\u200D\u{1F467}\u200D[\u{1F466}\u{1F467}]|\u{1F3F3}\uFE0F\u200D\u{1F308}|\u{1F469}\u200D\u{1F467}|\u{1F469}\u200D\u{1F466}|\u{1F415}\u200D\u{1F9BA}|\u{1F1FD}\u{1F1F0}|\u{1F1F6}\u{1F1E6}|\u{1F1F4}\u{1F1F2}|\u{1F9D1}[\u{1F3FB}-\u{1F3FF}]|\u{1F469}[\u{1F3FB}-\u{1F3FF}]|\u{1F1FF}[\u{1F1E6}\u{1F1F2}\u{1F1FC}]|\u{1F1FE}[\u{1F1EA}\u{1F1F9}]|\u{1F1FC}[\u{1F1EB}\u{1F1F8}]|\u{1F1FB}[\u{1F1E6}\u{1F1E8}\u{1F1EA}\u{1F1EC}\u{1F1EE}\u{1F1F3}\u{1F1FA}]|\u{1F1FA}[\u{1F1E6}\u{1F1EC}\u{1F1F2}\u{1F1F3}\u{1F1F8}\u{1F1FE}\u{1F1FF}]|\u{1F1F9}[\u{1F1E6}\u{1F1E8}\u{1F1E9}\u{1F1EB}-\u{1F1ED}\u{1F1EF}-\u{1F1F4}\u{1F1F7}\u{1F1F9}\u{1F1FB}\u{1F1FC}\u{1F1FF}]|\u{1F1F8}[\u{1F1E6}-\u{1F1EA}\u{1F1EC}-\u{1F1F4}\u{1F1F7}-\u{1F1F9}\u{1F1FB}\u{1F1FD}-\u{1F1FF}]|\u{1F1F7}[\u{1F1EA}\u{1F1F4}\u{1F1F8}\u{1F1FA}\u{1F1FC}]|\u{1F1F5}[\u{1F1E6}\u{1F1EA}-\u{1F1ED}\u{1F1F0}-\u{1F1F3}\u{1F1F7}-\u{1F1F9}\u{1F1FC}\u{1F1FE}]|\u{1F1F3}[\u{1F1E6}\u{1F1E8}\u{1F1EA}-\u{1F1EC}\u{1F1EE}\u{1F1F1}\u{1F1F4}\u{1F1F5}\u{1F1F7}\u{1F1FA}\u{1F1FF}]|\u{1F1F2}[\u{1F1E6}\u{1F1E8}-\u{1F1ED}\u{1F1F0}-\u{1F1FF}]|\u{1F1F1}[\u{1F1E6}-\u{1F1E8}\u{1F1EE}\u{1F1F0}\u{1F1F7}-\u{1F1FB}\u{1F1FE}]|\u{1F1F0}[\u{1F1EA}\u{1F1EC}-\u{1F1EE}\u{1F1F2}\u{1F1F3}\u{1F1F5}\u{1F1F7}\u{1F1FC}\u{1F1FE}\u{1F1FF}]|\u{1F1EF}[\u{1F1EA}\u{1F1F2}\u{1F1F4}\u{1F1F5}]|\u{1F1EE}[\u{1F1E8}-\u{1F1EA}\u{1F1F1}-\u{1F1F4}\u{1F1F6}-\u{1F1F9}]|\u{1F1ED}[\u{1F1F0}\u{1F1F2}\u{1F1F3}\u{1F1F7}\u{1F1F9}\u{1F1FA}]|\u{1F1EC}[\u{1F1E6}\u{1F1E7}\u{1F1E9}-\u{1F1EE}\u{1F1F1}-\u{1F1F3}\u{1F1F5}-\u{1F1FA}\u{1F1FC}\u{1F1FE}]|\u{1F1EB}[\u{1F1EE}-\u{1F1F0}\u{1F1F2}\u{1F1F4}\u{1F1F7}]|\u{1F1EA}[\u{1F1E6}\u{1F1E8}\u{1F1EA}\u{1F1EC}\u{1F1ED}\u{1F1F7}-\u{1F1FA}]|\u{1F1E9}[\u{1F1EA}\u{1F1EC}\u{1F1EF}\u{1F1F0}\u{1F1F2}\u{1F1F4}\u{1F1FF}]|\u{1F1E8}[\u{1F1E6}\u{1F1E8}\u{1F1E9}\u{1F1EB}-\u{1F1EE}\u{1F1F0}-\u{1F1F5}\u{1F1F7}\u{1F1FA}-\u{1F1FF}]|\u{1F1E7}[\u{1F1E6}\u{1F1E7}\u{1F1E9}-\u{1F1EF}\u{1F1F1}-\u{1F1F4}\u{1F1F6}-\u{1F1F9}\u{1F1FB}\u{1F1FC}\u{1F1FE}\u{1F1FF}]|\u{1F1E6}[\u{1F1E8}-\u{1F1EC}\u{1F1EE}\u{1F1F1}\u{1F1F2}\u{1F1F4}\u{1F1F6}-\u{1F1FA}\u{1F1FC}\u{1F1FD}\u{1F1FF}]|[#\*0-9]\uFE0F\u20E3|[\u{1F3C3}\u{1F3C4}\u{1F3CA}\u{1F46E}\u{1F471}\u{1F473}\u{1F477}\u{1F481}\u{1F482}\u{1F486}\u{1F487}\u{1F645}-\u{1F647}\u{1F64B}\u{1F64D}\u{1F64E}\u{1F6A3}\u{1F6B4}-\u{1F6B6}\u{1F926}\u{1F937}-\u{1F939}\u{1F93D}\u{1F93E}\u{1F9B8}\u{1F9B9}\u{1F9CD}-\u{1F9CF}\u{1F9D6}-\u{1F9DD}][\u{1F3FB}-\u{1F3FF}]|[\u26F9\u{1F3CB}\u{1F3CC}\u{1F575}][\u{1F3FB}-\u{1F3FF}]|[\u261D\u270A-\u270D\u{1F385}\u{1F3C2}\u{1F3C7}\u{1F442}\u{1F443}\u{1F446}-\u{1F450}\u{1F466}\u{1F467}\u{1F46B}-\u{1F46D}\u{1F470}\u{1F472}\u{1F474}-\u{1F476}\u{1F478}\u{1F47C}\u{1F483}\u{1F485}\u{1F4AA}\u{1F574}\u{1F57A}\u{1F590}\u{1F595}\u{1F596}\u{1F64C}\u{1F64F}\u{1F6C0}\u{1F6CC}\u{1F90F}\u{1F918}-\u{1F91C}\u{1F91E}\u{1F91F}\u{1F930}-\u{1F936}\u{1F9B5}\u{1F9B6}\u{1F9BB}\u{1F9D2}-\u{1F9D5}][\u{1F3FB}-\u{1F3FF}]|[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55\u{1F004}\u{1F0CF}\u{1F18E}\u{1F191}-\u{1F19A}\u{1F1E6}-\u{1F1FF}\u{1F201}\u{1F21A}\u{1F22F}\u{1F232}-\u{1F236}\u{1F238}-\u{1F23A}\u{1F250}\u{1F251}\u{1F300}-\u{1F320}\u{1F32D}-\u{1F335}\u{1F337}-\u{1F37C}\u{1F37E}-\u{1F393}\u{1F3A0}-\u{1F3CA}\u{1F3CF}-\u{1F3D3}\u{1F3E0}-\u{1F3F0}\u{1F3F4}\u{1F3F8}-\u{1F43E}\u{1F440}\u{1F442}-\u{1F4FC}\u{1F4FF}-\u{1F53D}\u{1F54B}-\u{1F54E}\u{1F550}-\u{1F567}\u{1F57A}\u{1F595}\u{1F596}\u{1F5A4}\u{1F5FB}-\u{1F64F}\u{1F680}-\u{1F6C5}\u{1F6CC}\u{1F6D0}-\u{1F6D2}\u{1F6D5}\u{1F6EB}\u{1F6EC}\u{1F6F4}-\u{1F6FA}\u{1F7E0}-\u{1F7EB}\u{1F90D}-\u{1F93A}\u{1F93C}-\u{1F945}\u{1F947}-\u{1F971}\u{1F973}-\u{1F976}\u{1F97A}-\u{1F9A2}\u{1F9A5}-\u{1F9AA}\u{1F9AE}-\u{1F9CA}\u{1F9CD}-\u{1F9FF}\u{1FA70}-\u{1FA73}\u{1FA78}-\u{1FA7A}\u{1FA80}-\u{1FA82}\u{1FA90}-\u{1FA95}]|[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299\u{1F004}\u{1F0CF}\u{1F170}\u{1F171}\u{1F17E}\u{1F17F}\u{1F18E}\u{1F191}-\u{1F19A}\u{1F1E6}-\u{1F1FF}\u{1F201}\u{1F202}\u{1F21A}\u{1F22F}\u{1F232}-\u{1F23A}\u{1F250}\u{1F251}\u{1F300}-\u{1F321}\u{1F324}-\u{1F393}\u{1F396}\u{1F397}\u{1F399}-\u{1F39B}\u{1F39E}-\u{1F3F0}\u{1F3F3}-\u{1F3F5}\u{1F3F7}-\u{1F4FD}\u{1F4FF}-\u{1F53D}\u{1F549}-\u{1F54E}\u{1F550}-\u{1F567}\u{1F56F}\u{1F570}\u{1F573}-\u{1F57A}\u{1F587}\u{1F58A}-\u{1F58D}\u{1F590}\u{1F595}\u{1F596}\u{1F5A4}\u{1F5A5}\u{1F5A8}\u{1F5B1}\u{1F5B2}\u{1F5BC}\u{1F5C2}-\u{1F5C4}\u{1F5D1}-\u{1F5D3}\u{1F5DC}-\u{1F5DE}\u{1F5E1}\u{1F5E3}\u{1F5E8}\u{1F5EF}\u{1F5F3}\u{1F5FA}-\u{1F64F}\u{1F680}-\u{1F6C5}\u{1F6CB}-\u{1F6D2}\u{1F6D5}\u{1F6E0}-\u{1F6E5}\u{1F6E9}\u{1F6EB}\u{1F6EC}\u{1F6F0}\u{1F6F3}-\u{1F6FA}\u{1F7E0}-\u{1F7EB}\u{1F90D}-\u{1F93A}\u{1F93C}-\u{1F945}\u{1F947}-\u{1F971}\u{1F973}-\u{1F976}\u{1F97A}-\u{1F9A2}\u{1F9A5}-\u{1F9AA}\u{1F9AE}-\u{1F9CA}\u{1F9CD}-\u{1F9FF}\u{1FA70}-\u{1FA73}\u{1FA78}-\u{1FA7A}\u{1FA80}-\u{1FA82}\u{1FA90}-\u{1FA95}]\uFE0F|[\u261D\u26F9\u270A-\u270D\u{1F385}\u{1F3C2}-\u{1F3C4}\u{1F3C7}\u{1F3CA}-\u{1F3CC}\u{1F442}\u{1F443}\u{1F446}-\u{1F450}\u{1F466}-\u{1F478}\u{1F47C}\u{1F481}-\u{1F483}\u{1F485}-\u{1F487}\u{1F48F}\u{1F491}\u{1F4AA}\u{1F574}\u{1F575}\u{1F57A}\u{1F590}\u{1F595}\u{1F596}\u{1F645}-\u{1F647}\u{1F64B}-\u{1F64F}\u{1F6A3}\u{1F6B4}-\u{1F6B6}\u{1F6C0}\u{1F6CC}\u{1F90F}\u{1F918}-\u{1F91F}\u{1F926}\u{1F930}-\u{1F939}\u{1F93C}-\u{1F93E}\u{1F9B5}\u{1F9B6}\u{1F9B8}\u{1F9B9}\u{1F9BB}\u{1F9CD}-\u{1F9CF}\u{1F9D1}-\u{1F9DD}]/gu;
  const r = reg.test(str);
  return r;
}
