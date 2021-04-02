import { Icon } from 'antd';
import styles from './index.less';
export default ({title = '暂无数据', icon = 'table', style = {}}) => {
    return (
        <div className={styles.content} style={style}>
            <div className="text-center" style={{ display: 'inline-block'}}>
                <Icon type={icon} className={styles.icon} />
                <div className={styles.title}>{title}</div>
            </div>
        </div>
    );
};