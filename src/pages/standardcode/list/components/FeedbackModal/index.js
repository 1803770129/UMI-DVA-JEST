import { Row, Col, Table, Card } from 'antd';
import styles from './index.less';
import { isEmpty } from '@/utils/tools';

const columns1 = [
    { title: '品牌', dataIndex: 'cm_brand', width: 100 },
    { title: '主机厂', dataIndex: 'cm_factory', width: 200 },
    { title: '车型', dataIndex: 'cm_model', width: 100 },
    { title: '年款', dataIndex: 'cm_model_year', width: 60 },
    { title: '排量', dataIndex: 'cm_displacement', width: 60 },
    { title: '其他属性', dataIndex: 'cm_other' }
];

const columns2 = [
    { title: '商户品牌', dataIndex: 'ten_brand_name', width: 100 },
    { title: '产品编码', dataIndex: 'ten_partsku_code', width: 100 },
    { title: '产品信息', dataIndex: 'partsku_vals' }
];

/**
 * 格式化商户反馈模态框数据
 */
// 格式化oem车型信息
/**
 * 传入对象 {carmodelList: [], carPro: []}
 * 返回格式化后的数组
 */
function formatOemSkuCarmodelFn(object) {
    const { carmodelList = [], carPro = [] } = object;
    return carmodelList.map(item => {
        let obj = {};
        obj.cm_ids = item.cm_ids;
        // 品牌
        obj.cm_brand = item.cm_brand;
        // 主机厂
        obj.cm_factory = item.cm_factory;
        // 车型
        obj.cm_model = item.cm_model;
        // 年款
        obj.cm_model_year = item.cm_model_year;
        // 排量
        obj.cm_displacement = item.cm_displacement;
        // 其他属性
        obj.cm_other = '';
        for(let i = 0; i < carPro.length; i++) {
            let pro = carPro[i];
            if(pro.cm_pro_name != '品牌' && pro.cm_pro_name != '主机厂' && pro.cm_pro_name != '车型' && pro.cm_pro_name != '年款' && pro.cm_pro_name != '排量') {
                obj.cm_other += pro.cm_pro_name + '：' + (item[pro.cm_pro_column] || '');
                if(i !== carPro.length - 1) {
                    obj.cm_other += '；';
                }
            }
        }
        return obj;
    });
}

// 格式化oe产品信息
function formatOeInfoFn(object) {
    const { categoryPros = [], category_name, oemCode = [] } = object;
    let obj = {};
    obj.category_name = category_name;
    obj.oemCode = oemCode.map(item => item.oem_partsku_code).join(',');
    obj.categoryPros = '';
    categoryPros.filter(v => !isEmpty(v.oem_partsku_value)).forEach((item, index) => {
        switch(item.category_pro_type) {
            case 'NUMBER':
                // 数字 - NUMBER
                obj.categoryPros += item.category_pro_name + '：' + (item.oem_partsku_value || '') + '（' + item.category_pro_unit + '）';
                break;
            case 'ENUM':
                // 枚举 - ENUM
                obj.categoryPros += item.category_pro_name + '：' + (item.category_pro_enum_val.join() || '');
                break;
            default:
                // 字符串 - STRING
                obj.categoryPros += item.category_pro_name + '：' + (item.oem_partsku_value || '');
                break;
        }
        if(index !== categoryPros.length - 1) {
            obj.categoryPros += '；';
        }
    });
    return obj;
}

// 格式化商户反馈不匹配oe产品信息

function formatOemSkuFilterFn(list) {
    return list.map(item => {
        let obj = {};
        obj.ten_brand_id = item.ten_brand_id;
        // // 反馈类型
        // obj.ten_partsku_status = item.ten_partsku_status == 1 ? '商户反馈' : '这里不知道显示什么'; // 暂时去掉
        // 商户品牌
        obj.ten_brand_name = item.ten_brand_name;
        // 产品编码
        obj.ten_partsku_code = item.ten_partsku_code;
        // 产品信息
        obj.partsku_vals = '';
        obj.partsku_vals = item.partsku_vals.map((itm, idx) => {
            let str = itm.category_pro_name + '：' + itm.ten_partsku_value;
            if(idx != item.partsku_vals.length - 1) {
                str += '，';
            }
            return str;
        });
        return obj;
    });
}

export default props => {
    const { isLoading, OEMSKU_INFO, OEMSKU_CARMODEL, OEMSKU_FILTER } = props;
    const oem_sku_info = formatOeInfoFn(OEMSKU_INFO);
    const oem_sku_carmodel = formatOemSkuCarmodelFn(OEMSKU_CARMODEL);
    const oem_sku_filter = formatOemSkuFilterFn(OEMSKU_FILTER);
    console.log();
    
    return (
        <div className={styles.feedbackModal}>
            {/* OE码覆盖车型信息： */}
            <Row className="f16 m-b-10">OE码覆盖车型信息：</Row>
            <Table 
                loading={isLoading}
                rowKey={item => item.cm_ids}
                columns={columns1}
                dataSource={oem_sku_carmodel}
                pagination={false}
                scroll={{ y: 150 }}
                bordered={true}
            />
            {/* OE码产品信息： */}
            <Row className="f16 m-t-10">OE码产品信息：</Row>
            <Card className={styles.oeInfo} loading={isLoading}>
                <Row className="m-b-5">
                    <Col>
                        <b className="c9">产品：</b>{oem_sku_info.category_name}&emsp;
                        <b className="c9">OE码：</b>{oem_sku_info.oemCode} 
                    </Col>
                    <Col>
                        <b className="c9">产品信息：</b>{oem_sku_info.categoryPros}
                    </Col>
                </Row>
            </Card>
            {/* 商户反馈不匹配OE产品信息： */}
            <Row className="f16 m-b-10">商户反馈不匹配OE产品信息：</Row>
            <Table 
                loading={isLoading}
                rowKey={item => item.ten_part_id}
                columns={columns2}
                dataSource={oem_sku_filter}
                pagination={false}
                scroll={{ y: 150 }}
                bordered={true}
            />
        </div>
    );
};
