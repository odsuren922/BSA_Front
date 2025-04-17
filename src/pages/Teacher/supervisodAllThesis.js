import React, { useState, useEffect } from "react";
import { Row, Container } from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "../../context/api_helper.js";
import { useAuth } from "../../context/AuthContext.js";
import Breadcrumbs from "../../components/Common/Breadcrumb.js";
import ThesisCard from "./ThesisCard.js";

const App = () => {
  const [data, setData] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/theses`);
      setData(response.data.thesis); // Verify API response structure
      setLoading(false);
    } catch (error) {
      console.error("Error fetching theses:", error);
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container>
        <Breadcrumbs breadcrumbItem="Бакалаврын судалгааны ажил" />

            <ThesisCard data={data} />
            

   
        </Container>
        
      </div>
    </React.Fragment>
  );
};

export default App;