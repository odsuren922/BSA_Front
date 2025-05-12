import React from "react";
import { Statistic, Col, Card} from "antd";
import {
    TeamOutlined,
} from "@ant-design/icons";
const StudentCount =( {studentCounts}) =>{
    return (
        <>
         {studentCounts.map((item, index) => (
            <Col key={index} xs={24} sm={12} md={8} lg={6}>
                <Card hoverable>
                    <Statistic
                        title={item.program}
                        value={item.student_count}
                        prefix={<TeamOutlined />}
                        valueStyle={{ color: "#1890ff" }}
                    />
                </Card>
            </Col>
        ))}
        </>
       

    );

};
export default StudentCount;