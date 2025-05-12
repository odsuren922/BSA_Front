import React, { useState } from 'react';
import { Modal, Form, Alert, Button } from 'react-bootstrap';

const CommitteeCalculator = ({ 
  show, 
  onClose, 
  onCreate, 
  availableTeachers, 
  availableStudents 
}) => {
  const [numCommittees, setNumCommittees] = useState(0);
  const [manualTeachersPer, setManualTeachersPer] = useState(null);
  const [manualStudentsPer, setManualStudentsPer] = useState(null);

  // Calculate values
  const calculatedTeachersPer = numCommittees > 0 
    ? Math.floor(availableTeachers / numCommittees) 
    : 0;
  const calculatedStudentsPer = numCommittees > 0 
    ? Math.floor(availableStudents / numCommittees) 
    : 0;

  // Use manual values if set, otherwise calculated
  const teachersPer = manualTeachersPer ?? calculatedTeachersPer;
  const studentsPer = manualStudentsPer ?? calculatedStudentsPer;

  // Remaining counts
  const remainingTeachers = availableTeachers - (teachersPer * numCommittees);
  const remainingStudents = availableStudents - (studentsPer * numCommittees);

  // Validation
  const isValid = numCommittees > 0 && 
    teachersPer >= 1 && 
    studentsPer >= 1 &&
    remainingTeachers >= 0 &&
    remainingStudents >= 0;

  // Handle manual committee change
  const handleCommitteeChange = (value) => {
    const newValue = Math.max(0, value);
    setNumCommittees(newValue);
    setManualTeachersPer(null);
    setManualStudentsPer(null);
  };

  // Handle manual teachers per committee change
  const handleTeachersPerChange = (value) => {
    const newValue = Math.max(1, value);
    setManualTeachersPer(newValue);
    
    // Auto-adjust committee count
    const maxPossible = Math.floor(availableTeachers / newValue);
    if (numCommittees > maxPossible) {
      setNumCommittees(maxPossible);
    }
  };

  // Handle manual students per committee change
  const handleStudentsPerChange = (value) => {
    const newValue = Math.max(1, value);
    setManualStudentsPer(newValue);
    
    // Auto-adjust committee count
    const maxPossible = Math.floor(availableStudents / newValue);
    if (numCommittees > maxPossible) {
      setNumCommittees(maxPossible);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Комисc Тооны машин</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Комиссын тоо</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={numCommittees}
              onChange={(e) => handleCommitteeChange(parseInt(e.target.value) || 0)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Комисс бүрт багшийн тоо</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={teachersPer}
              onChange={(e) => handleTeachersPerChange(parseInt(e.target.value) || 1)}
              disabled={numCommittees === 0}
            />
            <Form.Text className="text-muted">
              Утгыг өөрчлөхөд комиссын тоо автоматаар тохируулагдана
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Комисс бүрт оюутны тоо</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={studentsPer}
              onChange={(e) => handleStudentsPerChange(parseInt(e.target.value) || 1)}
              disabled={numCommittees === 0}
            />
            <Form.Text className="text-muted">
              Утгыг өөрчлөхөд комиссын тоо автоматаар тохируулагдана
            </Form.Text>
          </Form.Group>
        </Form>

        <Alert variant={isValid ? "info" : "danger"}>
          <div>Нийт багш: {availableTeachers}</div>
          <div>Нийт оюутан: {availableStudents}</div>

          {numCommittees > 0 && (
            <>
              <hr />
              <div>
                Нийт шаардагдах багш: {teachersPer * numCommittees} / {availableTeachers}
              </div>
              <div>
                Нийт шаардагдах оюутан: {studentsPer * numCommittees} / {availableStudents}
              </div>
              
              <div className="mt-2">
                1 комиссод: {teachersPer} багш, {studentsPer} оюутан
              </div>
              
              {(remainingTeachers > 0 || remainingStudents > 0) && (
                <div className="mt-2 text-warning">
                  үлдэгдэл: {remainingTeachers} багш, {remainingStudents} оюутан
                </div>
              )}
            </>
          )}
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Хаах</Button>
        <Button 
  variant="primary" 
  onClick={() => onCreate(numCommittees)}
  disabled={!isValid}
>
  Комисс үүсгэх
</Button>

      </Modal.Footer>
    </Modal>
  );
};

export default CommitteeCalculator;