import React from 'react';
import { Row, Col, Switch } from 'antd';
import router from 'umi/router';

// 表格头设置
export default ({ item, onRemoveCategoryFn, onChangeCategoryStatusFn ,dispatch }) => {

  return (
    <Row type="flex" justify="space-between" align="middle" key={item.brand_category_id}>
      <Col>
        <span className="gray">品类logo：</span>
        {
          // 无数据时
          item.brand_category_image == '' &&
                    <span className="m-r-10 cur blue6" onClick={() => router.push('/category/brandparts/' + item.brand_category_id)}>请选择品类logo</span>
        }
        {
          // 有数据时
          item.brand_category_image && 
                    <span className={'m-r-10 sopei_category sopei_category-' + item.brand_category_image} style={{fontSize: 36, verticalAlign: 'middle'}}></span>
        }

        <span className="gray">品类名称：</span>
        <b>{item.brand_category_name}</b> &emsp; 

        <span className="gray">品类编号：</span>
        <b>{item.brand_category_code}</b>
      </Col>
      <Col>
        <span className="gray">启用状态：</span>
        <Switch 
          checkedChildren='开' 
          unCheckedChildren='关'
          defaultChecked={item.brand_category_status == 'ENABLE' ? true : false} 
          checked={item.brand_category_status == 'ENABLE' ? true : false} 
          onChange={checked => {onChangeCategoryStatusFn(checked, item.brand_category_id);}}
        /> &emsp;
        <span className="blue6 cur" onClick={ () => { 
          router.push('/category/brandparts/' + item.brand_category_id); 
        }}>编 辑</span> &nbsp;&nbsp;
        <span className="red5 cur" onClick={ brand_category_id => {onRemoveCategoryFn(item.brand_category_id);}}>删 除</span>
      </Col>
    </Row>
  );
};
