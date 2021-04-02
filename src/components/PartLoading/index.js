import React from 'react';
import { Spin } from 'antd';
import styles from './index.less';

export default ({ children, loading }) => {
    return (
        <React.Fragment>
            {
                loading && 
                <div className={styles.spinContainer}>
                    <Spin />
                </div>
            }
            { !loading && children }
        </React.Fragment>
    );
};
