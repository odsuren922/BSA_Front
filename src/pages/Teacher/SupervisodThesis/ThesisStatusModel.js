import React from 'react';
import { Modal, Descriptions, Divider, Space, Typography } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  MinusOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const ThesisStatusModal = ({ visible, onCancel, thesis }) => {
  if (!thesis) return null;

  return (
    <Modal
      title="Төлөвлөгөөний төлөв"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Оюутан">
          {`${thesis.student.lastname} ${thesis.student.firstname}`}
        </Descriptions.Item>
        <Descriptions.Item label="Сэдэв (Монгол)">
          {thesis.name_mongolian}
        </Descriptions.Item>
        <Descriptions.Item label="Сэдэв (Англи)">
          {thesis.name_english}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Төлөвлөгөөний төлөв</Divider>

      <Descriptions bordered column={1}>
        <Descriptions.Item label="Оюутан ">
          {thesis.thesisPlanStatus?.student_sent ? (
            <Space>
              <CheckOutlined style={{ color: '#52c41a' }} />
              <Text>Илгээсэн</Text>
              {thesis.thesisPlanStatus.student_sent_at && (
                <Text type="secondary">
                  ({new Date(thesis.thesisPlanStatus.student_sent_at).toLocaleString()})
                </Text>
              )}
            </Space>
          ) : (
            <Space>
              <MinusOutlined />
              <Text>Илгэээгүй</Text>
            </Space>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Удирдагч багш">
          {thesis.thesisPlanStatus ? (
            <Space>
              {thesis.thesisPlanStatus.teacher_status === 'approved' ? (
                <CheckOutlined style={{ color: '#52c41a' }} />
              ) : thesis.thesisPlanStatus.teacher_status === 'rejected' ? (
                <CloseOutlined style={{ color: '#f5222d' }} />
              ) : (
                <ClockCircleOutlined style={{ color: '#faad14' }} />
              )}
              <Text>
                {thesis.thesisPlanStatus.teacher_status === 'approved'
                  ? 'Зөвшөөрсөн'
                  : thesis.thesisPlanStatus.teacher_status === 'rejected'
                  ? 'Татгалзсан'
                  : 'Хүлээгдэж байна'}
              </Text>
              {thesis.thesisPlanStatus.teacher_status_updated_at && (
                <Text type="secondary">
                  ({new Date(thesis.thesisPlanStatus.teacher_status_updated_at).toLocaleString()})
                </Text>
              )}
            </Space>
          ) : (
            <Text type="secondary">Мэдээлэл байхгүй</Text>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Тэнхим">
          {thesis.thesisPlanStatus ? (
            <Space>
              {thesis.thesisPlanStatus.department_status === 'approved' ? (
                <CheckOutlined style={{ color: '#52c41a' }} />
              ) : thesis.thesisPlanStatus.department_status === 'rejected' ? (
                <CloseOutlined style={{ color: '#f5222d' }} />
              ) : (
                <ClockCircleOutlined style={{ color: '#faad14' }} />
              )}
              <Text>
                {thesis.thesisPlanStatus.department_status === 'approved'
                  ? 'Зөвшөөрсөн'
                  : thesis.thesisPlanStatus.department_status === 'rejected'
                  ? 'Татгалзсан'
                  : 'Хүлээгдэж байна'}
              </Text>
              {thesis.thesisPlanStatus.department_status_updated_at && (
                <Text type="secondary">
                  ({new Date(thesis.thesisPlanStatus.department_status_updated_at).toLocaleString()})
                </Text>
              )}
            </Space>
          ) : (
            <Text type="secondary">Мэдээлэл байхгүй</Text>
          )}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ThesisStatusModal;