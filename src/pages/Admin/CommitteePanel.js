import React , {useEffect, useState} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs ,Button} from "antd";
import api from "../../context/api_helper";
import { UserProvider, useUser } from "../../context/UserContext";

import TeacherCommittee from "./CommiteeManagment/TeacherCommittee";
import StudentCommittee from "./CommiteeManagment/StudentCommittee";
import Calculator from "./CommiteeManagment/CommitteeManagement";
import { Container } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const CommitteePanel = () => {
      const { user } = useUser();
    
    const [searchParams] = useSearchParams();
    const cycleId = searchParams.get('cycleId');
      const schemaId = searchParams.get('schemaId');
      const componentId = searchParams.get('component');
        const [loading, setLoading] = useState(true);
        const [committees, setCommittees] = useState([]);
        const [customStudentCount, setCustomStudentCount] = useState(0);
        const [studentCounts, setStudentCounts] = useState([]);
      
    //  console.log({ cycleId, schemaId, componentId });
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ committeesRes] = await Promise.all([
          api.get(
            `/thesis-cycles/${cycleId}/grading-components/${componentId}/committees`
          ),
        ]);

        setCommittees(committeesRes.data.data);
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
    
    <Tabs defaultActiveKey="teachers">
    <Tabs.TabPane tab="Комисс" key="committee">
      <Calculator cycleId={cycleId} componentId={componentId}  user={user}/>
      </Tabs.TabPane>

      <Tabs.TabPane tab="Багш" key="teachers" >
        <TeacherCommittee  cycleId={cycleId} componentId={componentId} committees={committees} setCommittees={setCommittees} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Оюутан" key="students">
      <StudentCommittee cycleId={cycleId} componentId={componentId} committees={committees} setCommittees={setCommittees}  />
      </Tabs.TabPane>
      
    </Tabs>
    </Container>
    </>
  );
};

export default CommitteePanel;
