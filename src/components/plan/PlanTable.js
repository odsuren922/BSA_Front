import React, { useState } from "react";
import { Table } from "reactstrap";
import { Trash } from "lucide-react";
import DeleteConfirmModal from "../Common/DeleteConfirmModal";

const PlanTable = ({
  data,
  handleInputChange,
  handleSubProjectChange,
  handleAddSubProject,
  handleDeleteSubProject,
  handleDeleteRow,
  isEditable = true,
}) => {
  const [deleteRowIndex, setDeleteRowIndex] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="table-container">
      {data.length > 0 ? (
        <Table className="table mb-0 font">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Хийх ажил</th>
              <th>Дэд хийх ажил</th>

              <th>Эхлэх өдөр</th>
              <th>Дуусах өдөр</th>
              <th>Тайлбар</th>
              {isEditable && <th>Устгах</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => {
              // Ensure each project has at least one subproject
              if (!item.subtasks || item.subtasks.length === 0) {
                item.subtasks = [
                  {
                    name: "",
                    start_date: "",
                    end_date: "",
                    description: "",
                  },
                ];
              }

              return (
                <tr key={rowIndex}>
                  <td>{rowIndex + 1}</td>

                  {/* Project Name */}
                  <td>
                    {isEditable ? (
                      <input
                        type="text"
                        className="form-control font"
                        style={{ fontSize: "12px" }}
                        value={item.name}
                        onChange={(e) =>
                          handleInputChange(rowIndex, "name", e.target.value)
                        }
                        placeholder="Ажлын нэр"
                      />
                    ) : (
                      <span>{item.name}</span>
                    )}
                  </td>

                  {/* Sub task */}
                  <td>
                    {item.subtasks.map((sub, subIndex) =>
                      isEditable ? (
                        <input
                          key={subIndex}
                          type="text"
                          className="form-control mb-1 font"
                          style={{ fontSize: "12px" }}
                          value={sub.name}
                          onChange={(e) =>
                            handleSubProjectChange(
                              rowIndex,
                              subIndex,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder={`Дэд ажил ${subIndex + 1}`}
                        />
                      ) : (
                        <div key={subIndex} className="mb-1">
                          {sub.name}
                        </div>
                      )
                    )}
                    {isEditable && (
                      <>
                        <button
                          className="btn btn-secondary btn-sm font"
                          style={{ marginLeft: "10px" }}
                          onClick={() => handleAddSubProject(rowIndex)}
                        >
                          +
                        </button>
                        <button
                          className="btn btn-secondary btn-sm font"
                          style={{ marginLeft: "10px" }}
                          onClick={() => handleDeleteSubProject(rowIndex)}
                        >
                          -
                        </button>
                      </>
                    )}
                  </td>

                  {/* Start Date */}
                  <td>
                    {item.subtasks.map((sub, subIndex) =>
                      isEditable ? (
                        <input
                          key={subIndex}
                          type="date"
                          className="form-control mb-1"
                          style={{ fontSize: "11px" }}
                          value={sub.start_date}
                          onChange={(e) =>
                            handleSubProjectChange(
                              rowIndex,
                              subIndex,
                              "start_date",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <div key={subIndex} className="mb-1">
                          {sub.start_date || "-"}
                        </div>
                      )
                    )}
                  </td>

                  {/* End Date */}
                  <td>
                    {item.subtasks.map((sub, subIndex) =>
                      isEditable ? (
                        <input
                          key={subIndex}
                          type="date"
                          className="form-control mb-1"
                          style={{ fontSize: "11px" }}
                          value={sub.end_date}
                          onChange={(e) =>
                            handleSubProjectChange(
                              rowIndex,
                              subIndex,
                              "end_date",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <div key={subIndex} className="mb-1">
                          {sub.end_date || "-"}
                        </div>
                      )
                    )}
                  </td>

                  {/* Description */}
                  <td>
                    {item.subtasks.map((sub, subIndex) => (
                      <textarea
                        key={subIndex}
                        type="text"
                        className="form-control mb-1"
                        style={{ fontSize: "11px" }}
                        value={sub.description}
                        onChange={(e) =>
                          handleSubProjectChange(
                            rowIndex,
                            subIndex,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Тайлбар"
                      />
                    ))}
                  </td>

                  {/* Action */}
                  <td>
                    {isEditable && (
                      <button
                        className="btn btn-danger btn-sm font"
                        style={{ fontSize: "10px" }}
                        onClick={() => {
                          setDeleteRowIndex(rowIndex);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash size={17} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <p className="text-danger">No data available</p>
      )}

      <DeleteConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={() => {
          handleDeleteRow(deleteRowIndex); // delete the row
          setShowDeleteModal(false); // close modal
        }}
        title="Устгах баталгаажуулалт"
        message="Та энэ ажлыг устгахдаа итгэлтэй байна уу?"
        confirmText="Тийм, устгах"
        cancelText="Болих"
      />
    </div>
  );
};

export default PlanTable;
