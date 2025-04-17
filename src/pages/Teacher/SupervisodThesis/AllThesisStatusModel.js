import React from 'react';
import { Modal, Table, Tag,Space } from 'antd';
import { 
  CheckOutlined, 
  CloseOutlined, 
  MinusOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';

const ThesisTableModal = ({ visible, onCancel, theses }) => {
  if (!theses || theses.length === 0) return null;

  const columns = [
    {
      title: 'Оюутан',
      dataIndex: ['student', 'lastname'],
      key: 'student',
      render: (_, record) => (
        `${record.student.lastname} ${record.student.firstname}`
      ),
      fixed: 'left',
      width: 150,
    },
    {
      title: 'Програм',
      dataIndex: ['student', 'program'],
      key: 'program',
      width: 120,
    },
    {
      title: 'Сэдэв (Монгол)',
      dataIndex: 'name_mongolian',
      key: 'name_mongolian',
      width: 200,
    },
    {
      title: 'Сэдэв (Англи)',
      dataIndex: 'name_english',
      key: 'name_english',
      width: 200,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>
          {status === 'active' ? 'Идэвхитэй' : 'Хүлээгдэж байна'}
        </Tag>
      ),
      width: 120,
    },
    {
      title: 'Оюутан илгээсэн',
      dataIndex: ['thesisPlanStatus', 'student_sent'],
      key: 'student_sent',
      render: (sent, record) => (
        record.thesisPlanStatus ? (
          sent ? (
            <Space>
              <CheckOutlined style={{ color: '#52c41a' }} />
              <span>Илгээсэн</span>
            </Space>
          ) : (
            <Space>
              <MinusOutlined />
              <span>Илгэээгүй</span>
            </Space>
          )
        ) : <span>-</span>
      ),
      width: 140,
    },
    {
      title: 'Удирдагч багш',
      dataIndex: ['thesisPlanStatus', 'teacher_status'],
      key: 'teacher_status',
      render: (status, record) => (
        record.thesisPlanStatus ? (
          <Space>
            {status === 'approved' ? (
              <CheckOutlined style={{ color: '#52c41a' }} />
            ) : status === 'returned' ? (
              <CloseOutlined style={{ color: '#f5222d' }} />
            ) : (
              <ClockCircleOutlined style={{ color: '#faad14' }} />
            )}
            <span>
              {status === 'approved' 
                ? 'Зөвшөөрсөн' 
                : status === 'returned' 
                ? 'Буцаагдсан' 
                : 'Хүлээгдэж байна'}
            </span>
          </Space>
        ) : <span>-</span>
      ),
      width: 160,
    },
    {
      title: 'Тэнхим',
      dataIndex: ['thesisPlanStatus', 'department_status'],
      key: 'department_status',
      render: (status, record) => (
        record.thesisPlanStatus ? (
          <Space>
            {status === 'approved' ? (
              <CheckOutlined style={{ color: '#52c41a' }} />
            ) : status === 'returned' ? (
              <CloseOutlined style={{ color: '#f5222d' }} />
            ) : (
              <ClockCircleOutlined style={{ color: '#faad14' }} />
            )}
            <span>
              {status === 'approved' 
                ? 'Зөвшөөрсөн' 
                : status === 'returned' 
                ? 'Буцаагдсан' 
                : 'Хүлээгдэж байна'}
            </span>
          </Space>
        ) : <span>-</span>
      ),
      width: 160,
    },
  ];

  return (
    <Modal
      title="БСА  мэдээлэл"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width="90%"
      style={{ top: 20 }}
    >
      <Table
        columns={columns}
        dataSource={theses}
        rowKey="id"
        scroll={{ x: 1500 }}
        bordered
        size="middle"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100']
        }}
      />
    </Modal>
  );
};

export default ThesisTableModal;