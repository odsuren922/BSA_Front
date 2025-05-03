import React from "react";
import { Card, Button, Row, Col, Select ,Tag,Typography, Input} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const { Title, Text } = Typography;
//Комиссын group жагсаалт
const CommitteeList = ({
  committees,
  handleDeleteCommittee,
  handleDeleteMember,
  handleRoleChange,
  getCommitteeColor,
  editingCommitteeId,
  editingCommitteeName,
  handleNameClick,
  handleNameChange,
  handleNameBlur,
  newCommitteeName,
  setNewCommitteeName,
  handleCreateCommittee
}) => {

const renderCommitteeMembers = (committee) => {
    const rolePriority = {
      leader: 1,
      secretary: 2,
      member: 3,
    };
  
    const sortedMembers = [...(committee.members || [])].sort(
      (a, b) => (rolePriority[a.role] || 99) - (rolePriority[b.role] || 99)
    );
  
    return sortedMembers.map((member) => {
      const firstName = member.teacher?.firstname || "";
      const firstLetter = member.teacher?.lastname.charAt(0) || "";
      const role = member.role || "";
  
      return (
        <div
          key={member.id}
          style={{
            marginBottom: 5,
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{
              flex: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginRight: 8,
            }}
          >{`${firstLetter}. ${firstName}`}</span>
  
          <Select
            value={role}
            style={{ width: 100, marginRight: 3 }}
            onChange={(newRole) =>
              handleRoleChange(committee.id, member.id, newRole)
            }
            options={[
              { value: "member", label: "Гишүүн" },
              { value: "secretary", label: "Нарийн бичиг" },
              { value: "leader", label: "Удирдагч" },
            ]}
          />
          <Button
            type="link"
            danger
            onClick={() => handleDeleteMember(committee.id, member.id)}
            style={{ padding: 0 }}
          >
            <DeleteOutlined style={{ fontSize: "16px" }} />
          </Button>
        </div>
      );
    });
  };
  
const renderCommitteeStudentPrograms = (committee) => {
      const programCounts = {};
      const programColors = {
        CS: "geekblue",
        IT: "green",
        SE: "volcano",
        Тодорхойгүй: "default",
      };
  
      committee.students?.forEach((s) => {
        const program = s.student?.program || "Тодорхойгүй";
        programCounts[program] = (programCounts[program] || 0) + 1;
      });
  
      return Object.entries(programCounts).map(([program, count]) => (
        <Tag color={programColors[program]} key={program}>
          {count} {program}
        </Tag>
      ));
    };



  return (
    <div>
      <h3>Комисс</h3>
      
       <Row style={{ marginBottom: 16 }} gutter={8}>
                  <Col flex="auto">
                    <Input
                      value={newCommitteeName}
                      onChange={(e) => setNewCommitteeName(e.target.value)}
                      placeholder="Комиссийн нэр"
                    />
                  </Col>
                  <Col>
                    <Button type="primary" onClick={handleCreateCommittee}>
                      Create Committee
                    </Button>
                  </Col>
                </Row>
      <Row gutter={[16, 16]}>
        {committees.map((committee) => (
          <Col span={12} key={committee.id}>
            <Card
              style={{ borderLeft: `10px solid ${committee.color}` }}
              //   title={committee.name}
              title={
                editingCommitteeId === committee.id ? (
                  <input
                    value={editingCommitteeName}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleNameBlur();
                      }
                    }}
                    autoFocus
                    style={{
                      width: "100%",
                      padding: "2px 6px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                    }}
                  />
                ) : (
                  <span
                    onClick={() => handleNameClick(committee)}
                    style={{ cursor: "pointer", fontWeight: 500 }}
                    title="Нэрийг засах"
                  >
                    {committee.name}
                  </span>
                )
              }
              //
              extra={
                <div>
                  {/* <span> {committee.members?.length || 0} багш </span> */}
                   <Tag color="processing">
                                      {committee.members?.length} багш
                                    </Tag>
                  <Button
                    type="link"
                    danger
                    onClick={() => handleDeleteCommittee(committee.id)}
                    style={{ marginLeft: 10 }}
                  >
                    <DeleteOutlined style={{ fontSize: "16px" }} />
                  </Button>
                </div>
              }
            >
              {renderCommitteeMembers(committee)}
              {(!committee.members || committee.members.length === 0) && (
                <div style={{ color: "#999" }}>No members yet</div>
              )}
              <div style={{ marginTop: "10px" }}>
                {/* <span> {committee.students?.length || 0} сурагчид </span> */}
                <Tag color="orange">
                                    {committee.students?.length} оюутан
                                  </Tag>
              </div>
              <div style={{ marginTop: 16 }}>
                  <Text strong>Хөтөлбөрүүд:</Text>
                  <div style={{ marginTop: 8 }}>
                    {renderCommitteeStudentPrograms(committee)}
                  </div>
                </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CommitteeList;
