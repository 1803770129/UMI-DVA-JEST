import React from 'react';
import { Table, Row } from 'antd';
import { getCarmodelStatusColor } from '@/utils/tools';
import ENV from '@/utils/env';

const columns = [
  { title: '产品', dataIndex: 'category_name' },
  { title: '标准码', dataIndex: 'std_partsku_code' },
  { title: '覆盖OE码', dataIndex: 'oem_partsku_codes' },
  { title: '创建人', dataIndex: 'create_origin', width: 90 },
  { title: '创建时间', dataIndex: 'create_time', width: 100 },
  { title: '数据状态', dataIndex: 'std_partsku_status', width: 80 },
  { title: '商户反馈', dataIndex: 'feedback', width: 90 },
  { title: '合并提示', dataIndex: 'merge_id' },
  { title: '审查结果', dataIndex: 'std_partsku_exception_desc' },
  { title: '操作', dataIndex: 'operation', width: 90 }
];

const IndexTableList = ({ loading, searchFields, stdSkuList, onHandlePageSizeChangeFn, onHandlePageChangeFn, onGoStdSkuDetailFn, onCopy}) => {
  // render配置
  const renderContent = col => {
    switch (col.dataIndex) {
      // 数据状态
      case 'std_partsku_status':
        col.render = (text, record, index) => {
          switch (text) {
            case 'OPEN':
              return '开放共享';
            case 'PRIVATE':
              return '商户私有';
            case 'PENDING':
              return <span className="red5">待审核</span>;
            default:
              break;
          }
        };
        break;
        // 商户反馈
      case 'feedback':
        col.render= (text, record, index) => {
          return (
                        <>
                        {
                          record.unsolve_count > 0 &&
                            <span>{record.unsolve_count + '条未查看'}</span>
                        }
                        {
                          record.solve_count > 0 &&
                            <span>{record.solve_count + '条已查看'}</span>
                        }
                        {
                          record.solve_count === 0 && record.unsolve_count === 0 &&
                            '-'
                        }
                        </>
          );
        };
        break;
        // 操作
      case 'operation':
        col.render = (text, record, index) => {
          return record.std_partsku_status !== 'PRIVATE' ? 
                    <>
                        <span className="blue6 cur" onClick={() => onCopy(record.std_partsku_id, record.category_id) }>复制</span>
                        &nbsp;
                        <span className="blue6 cur" onClick={() => onGoStdSkuDetailFn(record.std_partsku_id) }>编辑</span>
                    </> :
                    <>
                        <span className="gray cur-notAllowed">复制</span>
                        &nbsp;
                        <span className="gray cur-notAllowed">编辑</span>
                    </>
          ;
        };
        break;
        // 操作
      case 'merge_id':
        col.render = (text, record, index) => {
          return text === null ? '-' : '可合并'; 
        };
        break;
      default:
        col.render = (text, record, index) => text || '-';
        break;
    }
  };
  columns.forEach(renderContent);

  // 表格配置
  const pagination = {
    total: parseInt(stdSkuList.count, 10),
    pageSize: searchFields.perpage,
    current: searchFields.page,
    showSizeChanger: true,
    onShowSizeChange: (current, perpage) => onHandlePageSizeChangeFn(current, perpage),
    onChange: page => onHandlePageChangeFn(page),
    showTotal: (total, range) => `当前 ${range[0]}-${range[1]}, 共 ${total} 条数据`
  };
  return (
    <React.Fragment>
      <Row className="f20 m-b-15">
                标准码列表{' '}
        <span className="c9 f12">商户私有状态的标准码不可编辑</span>
      </Row>

      <Table 
        loading={loading}
        rowKey={item => item.std_partsku_id}
        columns={columns}
        dataSource={stdSkuList.list}
        pagination={pagination}
        bordered={true}
      />
    </React.Fragment>
  );
};

export default IndexTableList;