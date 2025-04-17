import React from 'react';
import { Table ,Button} from 'antd';
import { useNavigate } from 'react-router-dom';
//Үнэлгээний схем
const GradingSchemaTable = ({ gradingSchema, thesisCycle, cycleId, score }) => {
    const navigate = useNavigate();
    const normalizedSchema = Array.isArray(gradingSchema) ? gradingSchema : [gradingSchema];
  
    const generateTableData = () => {
      if (!normalizedSchema || normalizedSchema.length === 0) return [];
   console.log(score)
      const calScheduleWeek = (week) => {
        const startDate = new Date(thesisCycle.start_date);
        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + (week - 1) * 7);
  
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
  
        return { start: weekStart, end: weekEnd };
      };
  
      return normalizedSchema.flatMap((schema) => {
        const scoreRow = {
          key: `score-${schema.id}`,
          rowType: "score",
          schemaId: schema.id,
          year: schema.year,
          name: schema.name,
        };
  
        const weekRow = {
          key: `week-${schema.id}`,
          rowType: "scheduled_week",
          schemaId: schema.id,
          year: "",
          name: "Товлосон 7 хоног",
        };
  
        const byWhoRow = {
          key: `bywho-${schema.id}`,
          rowType: "by_who",
          schemaId: schema.id,
          year: "",
          name: "Үнэлсэн",
        };
  
        schema.grading_components.forEach((component, index) => {
          scoreRow[`component_${index + 1}`] = component.score;
          weekRow[`component_${index + 1}`] = component.scheduled_week;
          byWhoRow[`component_${index + 1}`] = component.by_who;
  
          if (thesisCycle?.start_date) {
            const week = parseInt(component.scheduled_week);
            if (!isNaN(week)) {
              const { start, end } = calScheduleWeek(week);
              weekRow[`component_${index + 1}`] = 
                `${start.toISOString().split('T')[0].replace(/-/g, '.')} – ${end.toISOString().split('T')[0].replace(/-/g, '.')}`;
            }
          }
        });
  
        return [scoreRow, weekRow, byWhoRow];
      });
    };
  
    const generateColumns = () => {
      if (!normalizedSchema.length || !normalizedSchema[0]?.grading_components) return [];
  
      const baseColumns = [
        { title: "Нэр", dataIndex: "name", key: "name" }
      ];
  
      return [
        ...baseColumns,
        ...normalizedSchema[0].grading_components.map((component, index) => ({
          title: ` ${component.name} `,
          dataIndex: `component_${index + 1}`,
          key: `component_${index + 1}`,
          render: (value, record) => {
            if (record.rowType === "score") {
              return <div>{value ?? "N/A"}</div>;
            } else if (record.rowType === "scheduled_week") {
              return value ?? "-";
            } else if (record.rowType === "by_who") {
              return (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div>{value ?? "-"}</div>
                  {value === "committee" && (
                    <Button
                      size="small"
                      type="primary"
                      style={{ marginLeft: "8px" }}
                      onClick={() =>
                        navigate(
                          `/committees?cycleId=${cycleId}&schemaId=${record.schemaId}&component=${component.id}`
                        )
                      }
                    >
                      +
                    </Button>
                  )}
                </div>
              );
            }
            return value ?? "-";
          }
        }))
      ];
    };
  
    if (!normalizedSchema.length) {
      return <div>Үнэлгээний схем байхгүй байна.</div>;
    }
  
    return (
      <Table
        columns={generateColumns()}
        dataSource={generateTableData()}
        pagination={false}
        bordered
        className="mb-4"
      />
    );
  };
  

export default GradingSchemaTable;