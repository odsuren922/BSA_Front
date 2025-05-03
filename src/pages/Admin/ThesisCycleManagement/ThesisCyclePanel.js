import React, { useState, useEffect } from "react";
import { Tabs } from "antd";
import GradingSchemaManagement from "./GradingSchemaManegment"; // Fixed the typo here
import ThesisCycleManagement from "./ThesisCycleManagement";
import { useUser } from "../../../context/UserContext";
import api from "../../../context/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { TabPane } = Tabs;

const ThesisCyclePanel = () => {
  const [key, setKey] = useState("cycles");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [schemas, setSchemas] = useState([]);

  useEffect(() => {
    fetchGradingSchemas();
  }, []);

  const fetchGradingSchemas = async () => {
    setLoading(true);
    try {
      const response = await api.get("/grading-schemas", {
        params: { dep_id: user.dep_id }
      });
      setSchemas(response.data);
    } catch (error) {
      console.error("Error fetching schemas:", error);
      toast.error("Мэдээлэл авахад алдаа гарлаа!");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="p-6" style={{ padding: "15px", paddingRight: "48px" }}>
      <Tabs activeKey={key} onChange={setKey} type="card">
        <TabPane tab="Улирал" key="cycles">
          <ThesisCycleManagement
           onDataChange={handleRefresh} 
           user={user} 
           schemas={schemas}
           />
        </TabPane>
        <TabPane tab="Дүгнэх үе шат" key="grading">
          <GradingSchemaManagement
            refreshTrigger={refreshTrigger}
            user={user}
            schemas={schemas}
            setSchemas={setSchemas}
            fetchGradingSchemas={fetchGradingSchemas}
            loading={loading}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ThesisCyclePanel;
