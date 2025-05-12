import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "../../context/api_helper.js";
import { useUser } from "../../context/UserContext";
import ThesisCard from "./ThesisCard.js";
import { Spinner } from "reactstrap";
import { Alert } from "reactstrap";
import { Typography } from "antd";


const { Title } = Typography;

const App = () => {
  const [data, setData] = useState([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/theses`);
      //   const examineTheses = await api.get(`/examine/theses`);
      //   SetGradingTheses(examineTheses.data)
      setData(response.data.thesis);
    } catch (error) {
      console.error("Error fetching theses:", error);
      setError("Failed to load thesis data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <div className="p-4 bg-transparent">
        <header className="text-left mb-4">
          <Title level={3}>Бакалаврын судалгааны ажил</Title>
        </header>

        {loading ? (
          <div className="text-center my-5">
            <Spinner color="primary" />
            <p className="mt-2">Төслүүдийг ачаалж байна...</p>
          </div>
        ) : error ? (
          <Alert color="danger">
            {error}
            <button className="btn btn-link p-0 ml-2" onClick={fetchTasks}>
              Дахин оролдох
            </button>
          </Alert>
        ) : (
          < >
     
            <ThesisCard data={data} loading={loading} />,
          </>
        )}
      </div>
    </React.Fragment>
  );
};

export default App;
