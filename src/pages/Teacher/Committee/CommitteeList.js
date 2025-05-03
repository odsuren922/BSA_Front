import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Tag, Typography, Spin, Layout, Tabs } from "antd";
import api from "../../../context/api_helper";
import moment from "moment";
import CommitteeDetailsPage from "./CommitteeDetailPage";
const { Text } = Typography;
const { Title } = Typography;
const { Content } = Layout;

const CommitteeListPage = () => {
  const [committees, setCommittees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const programColors = {
    CS: "geekblue",
    IT: "green",
    SE: "volcano",
    Тодорхойгүй: "default",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/committees/by-teacher/1`);
        console.log(response.data.data);
        setCommittees(response.data.data);
      } catch (error) {
        console.error("Error fetching committees:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const data = committees.map((committee) => {
    const lastSchedule = committee.schedules?.[committee.schedules.length - 1];
    const programCounts = {};

    committee.students?.forEach((s) => {
      const program = s.student?.program || "Тодорхойгүй";
      programCounts[program] = (programCounts[program] || 0) + 1;
    });

    return {
      key: committee.id,
      time: lastSchedule
        ? `${moment(lastSchedule.start_datetime).format(
            "YYYY/MM/DD HH:mm"
          )} - ${moment(lastSchedule.end_datetime).format("HH:mm")}`
        : "–",
      location: lastSchedule
        ? `${lastSchedule.location}, ${lastSchedule.room} тоот`
        : "–",
      component: committee.grading_component?.name || "–",
      name: committee.name,
      status: committee.status,
      thesis_cycle: committee.thesis_cycle,
      grading_component: committee.grading_component,
      programs: Object.entries(programCounts).map(([program, count]) => ({
        program,
        count,
      })),
    };
  });

  const columns = [
    {
      title: "Компонент",
      dataIndex: "component",
      key: "component",
    },
    {
      title: "Комисс",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Цаг",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Байршил",
      dataIndex: "location",
      key: "location",
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    // {
    //   title: "Оюутнууд (хөтөлбөрөөр)",
    //   dataIndex: "programs",
    //   key: "programs",
    //   render: (programs) =>
    //     programs.map(({ program, count }) => (
    //       <Tag key={program} color={programColors[program]}>
    //         {count} {program}
    //       </Tag>
    //     )),
    // },
    {
      title: "Төлөв",
      dataIndex: "status",
      key: "status",
    },
  ];

  if (isLoading) {
    return <Spin size="large" />;
  }

  return (
    <div className="p-4 bg-transparent">
      <header className="text-left mb-4">
        <Title level={3}>Комиссын жагсаалт</Title>
      </header>

      <Layout className="bg-white rounded-lg p-4">
        <Content className="p-4">
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                label: "Комиссын жагсаалт",
                key: "1",
                children: (
                  <Table
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    onRow={(record) => ({
                      //   onClick: () => navigate(`/teacher/committees/detail/${record.key}`),
                      onClick: () =>
                        navigate(`/teacher/committees/detail/${record.key}`, {
                          state: {
                            grading_component: record.component,
                            thesis_cycle: record.thesis_cycle,
                          },
                        }),
                    })}
                    rowClassName="hoverable-row"
                  />
                ),
              },
              {
                key: "2",
                label: "Шүүмж өгөх судалгааны ажил",
                children: (
                  <Table
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    onRow={(record) => ({
                      //   onClick: () => navigate(`/teacher/committees/detail/${record.key}`),
                      onClick: () =>
                        navigate(`/teacher/committees/detail/${record.key}`, {
                          state: {
                            grading_component: record.component,
                            thesis_cycle: record.thesis_cycle,
                          },
                        }),
                    })}
                    rowClassName="hoverable-row"
                  />
                ),
              },
            ]}
          />
        </Content>
      </Layout>
    </div>
  );
};

export default CommitteeListPage;
