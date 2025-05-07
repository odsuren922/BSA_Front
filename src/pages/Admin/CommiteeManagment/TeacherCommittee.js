import React, { useState, useEffect } from "react";
import {
  Button,
  Checkbox,
  Row,
  Col,
  Input,
  Tag,
  Select,
  message,
  Space,
  Dropdown,
  Affix,
  Radio,
} from "antd";
//import { useAuth } from "../../../context/AuthContext";
import { UserProvider, useUser } from "../../../context/UserContext";
import { DownOutlined } from "@ant-design/icons";
import api from "../../../context/api_helper";
import TeacherList from "./Lists/TeacherList";
import CommitteeList from "./Lists/CommiteeList";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteConfirmModal from "../../../components/Common/DeleteConfirmModal";

const TeacherCommittee = ({ cycleId, componentId ,committees, setCommittees}) => {
  //   console.log("Cycle ID:", cycleId);
  //   console.log("Component ID:", componentId);

  const { user } = useUser();
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
//   const [committees, setCommittees] = useState([]);
  const [newCommitteeName, setNewCommitteeName] = useState("");
  const [selectedCommitteeId, setSelectedCommitteeId] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("member"); // default role
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [committeeToDelete, setCommitteeToDelete] = useState(null);
  //Change committee name
  const [editingCommitteeId, setEditingCommitteeId] = useState(null);
  const [editingCommitteeName, setEditingCommitteeName] = useState("");

  // Filter states for TeacherList
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [teachersRes,] = await Promise.all([
          api.get(`/teachers/${user.dep_id}`),
    
        ]);

        console.log(teachersRes);
        setTeachers(teachersRes.data);

      } catch (error) {
        message.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTeacherCommittees = (teacherId) => {
    return committees
      .filter((committee) =>
        (committee.members || []).some(
          (member) => member.teacher?.id === teacherId
        )
      )
      .map((committee) => committee.name);
  };

  //Шинээр комисс үүсгэх
  const handleCreateCommittee = async () => {
    if (!newCommitteeName.trim()) {
      toast.warning("Комиссын нэр оруулна уу?");
      return;
    }
    const color = getCommitteeColor();
    try {
      const response = await api.post("/committees", {
        name: newCommitteeName,
        dep_id: user.dep_id,
        grading_component_id: componentId,
        thesis_cycle_id: cycleId,
        color: color,
      });
      const newCommittee = response.data.data || response.data;
      //newCommittee.color = color;
      setCommittees([...committees, newCommittee]);
      setNewCommitteeName("");

      toast.success(" амжилттай үүсгэсэн!");
    } catch (error) {
      toast.error("Failed to create committee");
    }
  };


  //Багшийг комиссын гишүүнрүү нэмэх
  const handleAddToCommittee = async () => {
    if (!selectedCommitteeId) {
      toast.warning("Please select a committee!");
      return;
    }
    if (selectedTeacherIds.length === 0) {
      toast.warning("Please select at least one teacher");
      return;
    }
    const validTeacherIds = selectedTeacherIds.filter(
      (teacherId) => getTeacherCommittees(teacherId).length === 0
    );
    if (validTeacherIds.length === 0) {
      message.warning("Selected teachers are already in committees");
    }
    try {
      const res = await api.post(`/committees/${selectedCommitteeId}/members`, {
        teacher_ids: selectedTeacherIds,
        role: selectedRole,
      });

      console.log("res teacher", res);
      setCommittees((prev) =>
        prev.map((committee) => {
          if (committee.id === selectedCommitteeId) {
            return {
              ...committee,
              members: [...(committee.members || []), ...res.data.data],
            };
          }
          return committee;
        })
      );
      setSelectedTeacherIds([]);
      toast.success("Teachers added to committee");
    } catch (error) {
      message.error("Failed to add teachers to committee");
    }
  };
  const handleNameClick = (committee) => {
    setEditingCommitteeId(committee.id);
    setEditingCommitteeName(committee.name);
  };

  const handleNameChange = (e) => {
    setEditingCommitteeName(e.target.value);
  };

  const handleNameBlur = async () => {
    try {
      if (editingCommitteeName.trim()) {
        await api.patch(`/committees/${editingCommitteeId}`, {
          name: editingCommitteeName.trim(),
        });
        setCommittees((prev) =>
          prev.map((committee) =>
            committee.id === editingCommitteeId
              ? { ...committee, name: editingCommitteeName.trim() }
              : committee
          )
        );
        toast.success("Комиссын нэр амжилттай шинэчлэгдлээ");
      }
    } catch (error) {
      message.error("Комиссын нэр шинэчлэхэд алдаа гарлаа");
    } finally {
      setEditingCommitteeId(null);
      setEditingCommitteeName("");
    }
  };

  const columns = [
    {
      title: "Сонгох",
      dataIndex: "id",
      render: (id) => (
        <Checkbox
          checked={selectedTeacherIds.includes(id)}
          onChange={(e) => handleSelect(e.target.checked, id)}
          disabled={getTeacherCommittees(id).length > 1}
        />
      ),
    },

    {
      title: "Нэр",
      key: "name",
      render: (_, record) => {
        const teacherCommittees = committees.filter((committee) =>
          (committee.members || []).some(
            (member) => member.teacher?.id === record.id
          )
        );

        const fullName = `${record.lastname} ${record.firstname}`;

        return (
          <div>
            <span
              style={{
                color: teacherCommittees.length > 0 ? "#1890ff" : "inherit",
                fontWeight: teacherCommittees.length > 0 ? 500 : "normal",
              }}
            >
              {fullName}
            </span>
            <div style={{ marginTop: 4 }}>
              {teacherCommittees.map((committee) => {
                const member = (committee.members || []).find(
                  (m) => m.teacher?.id === record.id
                );
                if (!member) return null;

                return (
                  <Tag
                    key={committee.id}
                    color="#1890ff"
                    closable
                    onClose={(e) => {
                      e.preventDefault(); // prevent default close behavior
                      handleDeleteMember(committee.id, member.id);
                    }}
                    style={{ margin: "2px 4px 2px 0", cursor: "pointer" }}
                  >
                    {committee.name}
                  </Tag>
                );
              })}
            </div>
          </div>
        );
      },
    },

    {
      title: "Superior",
      key: "superior",
      render: (_, record) => {
        const superior = record.superior ?? "";
        return <div>{superior}</div>;
      },
    },
  ];

  const handleSelect = (checked, teacherId) => {
    if (checked) {
      setSelectedTeacherIds((prev) => [...prev, teacherId]);
    } else {
      setSelectedTeacherIds((prev) => prev.filter((id) => id !== teacherId));
    }
  };
  const handleDeleteClick = (committeeId) => {
    setCommitteeToDelete(committeeId);
    setShowDeleteModal(true);
  };

  const handleDeleteCommittee = async (committeeId) => {
    try {
      await api.delete(`/committees/${committeeId}`);
      setCommittees((prev) => prev.filter((c) => c.id !== committeeId));
      toast.success("Committee deleted successfully");
    } catch (error) {
      message.error("Failed to delete committee");
    } finally {
      setShowDeleteModal(false);
      setCommitteeToDelete(null);
    }
  };
  const confirmDeleteCommittee = async () => {
    try {
      await api.delete(`/committees/${committeeToDelete}`);
      setCommittees((prev) => prev.filter((c) => c.id !== committeeToDelete));
      toast.success("Committee deleted successfully");
    } catch (error) {
      message.error("Failed to delete committee");
    } finally {
      setShowDeleteModal(false);
      setCommitteeToDelete(null);
    }
  };

  const handleDeleteMember = async (committeeId, memberId) => {
    try {
      await api.delete(`/committee-members/${memberId}`);
      setCommittees((prev) =>
        prev.map((committee) => {
          if (committee.id === committeeId) {
            return {
              ...committee,
              members: committee.members.filter((m) => m.id !== memberId),
            };
          }
          return committee;
        })
      );
      toast.success("Member removed from committee successfully");
    } catch (error) {
      message.error("Failed to remove member from committee");
    }
  };

  const handleRoleChange = async (committeeId, memberId, newRole) => {
    try {
      await api.patch(`/committee-members/${memberId}/role`, { role: newRole });
      setCommittees((prev) =>
        prev.map((committee) => {
          if (committee.id === committeeId) {
            return {
              ...committee,
              members: committee.members.map((m) =>
                m.id === memberId ? { ...m, role: newRole } : m
              ),
            };
          }
          return committee;
        })
      );
      toast.success("Role updated successfully");
    } catch (error) {
      message.error("Failed to update role");
    }
  };

  const getCommitteeColor = () => {
    const softColors = [
      "rgba(245, 34, 45, 0.15)", // red
      "rgba(250, 173, 20, 0.15)", // gold
      "rgba(19, 194, 194, 0.15)", // cyan
      "rgba(82, 196, 26, 0.15)", // green
      "rgba(250, 84, 28, 0.15)", // volcano
      // "rgba(47, 84, 235, 0.15)",    // blue
      "rgba(114, 46, 209, 0.15)", // purple
      "rgba(255, 215, 0, 0.15)", // yellow/gold
      "rgba(0, 0, 0, 0.05)", // light gray
      "rgba(24, 144, 255, 0.15)", // geekblue
      "rgba(255, 192, 203, 0.15)", // pink
    ];

    const index = Math.floor(Math.random() * softColors.length);
    return softColors[index];
  };

  const rowStyle = (record) => {
    const teacherCommittees = committees.filter((committee) =>
      (committee.members || []).some(
        (member) => member.teacher?.id === record.id
      )
    );

    if (teacherCommittees.length > 0) {
      const primaryCommittee = teacherCommittees[0];

      return {
        style: {
          backgroundColor: primaryCommittee.color || "#f0f9ff",
          borderLeft: `4px solid ${primaryCommittee.color || "#1890ff"}`,
        },
      };
    }

    return {
      style: {},
    };
  };

  const committeeMenu = {
    items: committees.map((committee) => ({
      key: committee.id,
      label: committee.name,
      onClick: () => setSelectedCommitteeId(committee.id),
    })),
  };

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={16}>
        {/* Left Column: Teacher List and Add to Committee */}
        <Col span={12}>
          <Row style={{ marginBottom: 16 }} gutter={8}>
        

            <Col span={24}>
              <Space direction="vertical" style={{ width: "100%" }}>
                {/* Committee Selection with Radio Buttons */}
                <Col span={24}>
                  <Radio.Group
                    value={selectedCommitteeId}
                    onChange={(e) => setSelectedCommitteeId(e.target.value)}
                    optionType="button"
                    buttonStyle="solid"
                  >
                    {committees.map((c) => (
                      <Radio.Button key={c.id} value={c.id}>
                        <span
                          style={{
                            display: "inline-block",
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: c.color || "#1890ff",
                            border: "1px solid rgba(0,0,0,0.1)",
                            marginRight: 7,
                          }}
                        ></span>
                        {c.name} ({(c.students || []).length})
                      </Radio.Button>
                    ))}
                  </Radio.Group>
                </Col>

                {/* Add to Committee Button */}
                <Button
                  type="primary"
                  onClick={handleAddToCommittee}
                  disabled={
                    selectedTeacherIds.length === 0 || !selectedCommitteeId
                  }
                  style={{ width: "80%" }}
                >
                  {selectedCommitteeId
                    ? ` ${
                        committees.find((c) => c.id === selectedCommitteeId)
                          ?.name
                      } -д хуваарилах`
                    : "Хуваарилах"}{" "}
                  ({selectedTeacherIds.length})
                </Button>
              </Space>
            </Col>
          </Row>
          <TeacherList
            teachers={teachers}
            filterName={filterName}
            setFilterName={setFilterName}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            columns={columns}
            loading={loading}
            rowStyle={rowStyle}
            getTeacherCommittees={getTeacherCommittees}
          />

          <Col span={8}>
            <Select
              style={{ width: "100%" }}
              placeholder="Select committee"
              onChange={(value) => setSelectedCommitteeId(value)}
              options={committees.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />
            <Button
              type="primary"
              onClick={handleAddToCommittee}
              disabled={!selectedCommitteeId || selectedTeacherIds.length === 0}
              style={{ marginTop: 16 }}
            >
              Add Selected Teachers to Committee ({selectedTeacherIds.length})
            </Button>
          </Col>
        </Col>
        {/* Right Column: Committee List */}
        <Col span={12}>
          {/* ORDER */}
          <CommitteeList
            committees={committees}
            handleDeleteCommittee={handleDeleteClick}
            handleDeleteMember={handleDeleteMember}
            handleRoleChange={handleRoleChange}
            getCommitteeColor={getCommitteeColor}
            editingCommitteeId={editingCommitteeId}
            editingCommitteeName={editingCommitteeName}
            handleNameClick={handleNameClick}
            handleNameChange={handleNameChange}
            handleNameBlur={handleNameBlur}
            newCommitteeName={newCommitteeName}
            setNewCommitteeName={setNewCommitteeName}
            handleCreateCommittee={handleCreateCommittee}
          />

          <DeleteConfirmModal
            show={showDeleteModal}
            onHide={() => setShowDeleteModal(false)}
            onConfirm={confirmDeleteCommittee}
            title="Комисс устгах"
            message="Энэ комиссыг устгахдаа итгэлтэй байна уу?"
            confirmText="Тийм, устгах"
            cancelText="Үгүй"
          />
        </Col>
      </Row>
    </div>
  );
};

export default TeacherCommittee;
