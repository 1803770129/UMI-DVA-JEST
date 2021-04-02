
/**
 * 注意调用此组件时，使用一个<span></span>标签包裹一下
 */
import { Input, Icon } from 'antd';
import styles from './index.less';
export default ({ placeholder='请输入', disabled=false, type ='text', style = {}, addonBefore='', addonAfter='', field=undefined, onClear=null, onChange=null}) => {
  const handelMouseEnter = e => {
    const closeIcon = e.currentTarget.querySelector('.ant-input-suffix');
    if(closeIcon) {
      closeIcon.style.display = 'block';
    }
        
  };
  const handelMouseLeave = e => {
    const closeIcon = e.currentTarget.querySelector('.ant-input-suffix');
    if(closeIcon) {
      closeIcon.style.display = 'none';
    }
  };
  const handelChange = e => {
    if(e.target.value !== undefined ) {
      const closeIcon = e.target.nextSibling;
      if(closeIcon && closeIcon.style.display !== 'block') {
        closeIcon.style.display = 'block';
      }
      if(onChange) {
        onChange(e.target.value);
      }
    }
  };

  const suffix = field ? <Icon type="close-circle" style={{color: '#CCC', cursor: 'pointer'}} onClick={onClear} /> : <span />;
  return (
    <div onMouseEnter={handelMouseEnter} onMouseLeave={handelMouseLeave} className={styles.content}>
      <Input type={type} addonBefore={addonBefore} addonAfter={addonAfter} value={field} placeholder={placeholder} style={style} onChange={handelChange} disabled={disabled} suffix={suffix}/>
    </div>
  );
};
// 动态改变 prefix/suffix 时，Input 会失去焦点， 所以增加<span />
// https://ant.design/components/input-cn/#FAQ