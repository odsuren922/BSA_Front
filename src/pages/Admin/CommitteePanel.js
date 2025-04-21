import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs ,Button} from "antd";
import TeacherCommittee from "./CommiteeManagment/TeacherCommittee";
import StudentCommittee from "./CommiteeManagment/StudentCommittee";
import Calculator from "./CommiteeManagment/CommitteeManagement";
import { Container } from "react-bootstrap";
const CommitteePanel = () => {
    const [searchParams] = useSearchParams();
    const cycleId = searchParams.get('cycleId');
      const schemaId = searchParams.get('schemaId');
      const componentId = searchParams.get('component');
    //  console.log({ cycleId, schemaId, componentId });

    const navigate = useNavigate();

const handleBack = () => {
  navigate(-1); 
};

  return (
    <>
       <Container className="mt-5">

     <Button onClick={() => navigate(-1)} type="primary" className="mb-3">
        ← Back
      </Button>
      {/* <h2>Committee Panel</h2> */}
    
    <Tabs defaultActiveKey="committee">
    <Tabs.TabPane tab="Комисс" key="committee">
      <Calculator cycleId={cycleId} componentId={componentId} />
      </Tabs.TabPane>

      <Tabs.TabPane tab="Багш" key="teachers" >
        <TeacherCommittee  cycleId={cycleId} componentId={componentId}/>
      </Tabs.TabPane>
      <Tabs.TabPane tab="Оюутан" key="students">
      <StudentCommittee cycleId={cycleId} componentId={componentId} />
      </Tabs.TabPane>
      
    </Tabs>
    </Container>
    </>
  );
};

export default CommitteePanel;
