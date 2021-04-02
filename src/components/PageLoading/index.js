import { Spin } from 'antd';
import styles from './index.less';

const PageLoading = () => {
    return (
        <div className={styles.maskLayer} style={{width: document.body.scrollWidth, height: document.body.scrollHeight}}>
            <div className='container-loading'>
                <Spin size="large" className="icon-loading" />
            </div>
        </div>
    );
};

export default PageLoading;