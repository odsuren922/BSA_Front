import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Splitter } from "antd";
const initialTeachers = [
  { id: 1, name: 'Б. Эрдэнэтуяа', color: '#FFD700' },
  { id: 2, name: 'Ц. Бат-Эрдэнэ', color: '#87CEEB' },
  { id: 3, name: 'Д. Сүхбаатар', color: '#98FB98' },
  { id: 4, name: 'Л. Ганцэцэг', color: '#FFB6C1' },
  { id: 5, name: 'Н. Төгсжаргал', color: '#DDA0DD' },
];
const colors = ['#FFD700', '#87CEEB', '#98FB98', '#FFB6C1', '#DDA0DD'];

const daysOfWeek = ['Дав', 'Мяг', 'Лха', 'Пүр', 'Баа', 'Бям', 'Ням'];
const timeSlots = [
  '07:40 - 08:25',
  '08:25 - 09:10',
  '09:20 - 10:05',
  '10:05 - 10:50',
  '11:00 - 11:45',
  '11:45 - 12:30',
  '12:40 - 13:25',
  '13:25 - 14:10',
  '14:20 - 15:05',
  '15:05 - 15:50',
  '16:00 - 16:45',
  '16:45 - 17:30',
  '17:40 - 18:25',
  '18:25 - 19:10',
  '19:20 - 20:05',
  '20:05 - 20:50'
];

const sampleSchedules = {
  1: { 
    'Дав': { 
      0: { subject: 'Математик', room: '201', grade: '10А' },
      3: { subject: 'Физик', room: 'Лаб 3', grade: '11Б' },
    },
    'Мяг': {
      2: { subject: 'Физик', room: 'Лаб 2', grade: '10Б' },
    },
    'Баа': { 
      0: { subject: 'Математик', room: '201', grade: '10А' },
      3: { subject: 'Физик', room: 'Лаб 3', grade: '11Б' },
    },
    'Пүр': { 
        0: { subject: 'Математик', room: '201', grade: '10А' },
        3: { subject: 'Физик', room: 'Лаб 3', grade: '11Б' },
      },
      'Лха': { 
        0: { subject: 'Математик', room: '201', grade: '10А' },
        3: { subject: 'Физик', room: 'Лаб 3', grade: '11Б' },
      },
      'Мяг': {
      2: { subject: 'Англи хэл', room: '203', grade: '10Б' },
    }
  },
  2: { 
    'Дав': {
      0: { subject: 'Монгол хэл', room: '105', grade: '9А' },
      3: { subject: 'Уран зохиол', room: '105', grade: '11В' }
    },
    'Мяг': {
      2: { subject: 'Англи хэл', room: '203', grade: '10Б' },
    }
    ,
    'Пүр': { 
        0: { subject: 'Математик', room: '201', grade: '10А' },
        3: { subject: 'Физик', room: 'Лаб 3', grade: '11Б' },
      },
      'Лха': { 
        0: { subject: 'Математик', room: '201', grade: '10А' },
        3: { subject: 'Физик', room: 'Лаб 3', grade: '11Б' },
      },
    
  },
  3: { 
    'Дав': {
      0: { subject: 'Түүх', room: '106', grade: '11А' },
    },
    'Пүр': { 
        0: { subject: 'Математик', room: '201', grade: '10А' },
        3: { subject: 'Физик', room: 'Лаб 3', grade: '11Б' },
      },
    'Баа': { 
      0: { subject: 'Математик', room: '201', grade: '10А' },
      3: { subject: 'Физик', room: 'Лаб 3', grade: '11Б' },
    },
    'Мяг': {
      2: { subject: 'Англи хэл', room: '203', grade: '10Б' },
    }
  },
  4: { 
    'Дав': {
      0: { subject: 'Түүх', room: '106', grade: '11А' },
    },
    'Пүр': { 
        0: { subject: 'Математик', room: '201', grade: '10А' },
        3: { subject: 'Физик', room: 'Лаб 3', grade: '11Б' },
      },
    'Баа': { 
      0: { subject: 'Математик', room: '201', grade: '10А' },
      3: { subject: 'Физик', room: 'Лаб 3', grade: '11Б' },
    },
    'Мяг': {
      2: { subject: 'Англи хэл', room: '203', grade: '10Б' },
    }
  }
};

const ScheduleGrid = () => {
  const [selectedTeacherIds, setSelectedTeacherIds] = React.useState([1, 2, 3]);

  const getTeachersAtTimeSlot = (day, timeIndex) => {
    return initialTeachers
      .filter(teacher => selectedTeacherIds.includes(teacher.id))
      .filter(teacher => sampleSchedules[teacher.id]?.[day]?.[timeIndex])
      .map(teacher => ({
        ...teacher,
        classInfo: sampleSchedules[teacher.id][day][timeIndex]
      }));
  };

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <h2 className="mb-3">Багш нарын цагийн хуваарь</h2>
        
        <div className="mb-3">
          <h5>Багш сонгох:</h5>
          <div className="d-flex flex-wrap gap-2">
            {initialTeachers.map(teacher => (
              <div key={teacher.id} className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`teacher-${teacher.id}`}
                  checked={selectedTeacherIds.includes(teacher.id)}
                  onChange={() => {
                    setSelectedTeacherIds(prev => 
                      prev.includes(teacher.id)
                        ? prev.filter(id => id !== teacher.id)
                        : [...prev, teacher.id]
                    );
                  }}
                />
                <label 
                  className="form-check-label" 
                  htmlFor={`teacher-${teacher.id}`}
                  style={{ color: teacher.color }}
                >
                  {teacher.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th className="bg-light" style={{minWidth: "110px"}}>Цаг</th>
              {daysOfWeek.map(day => (
                <th key={day} className="text-center bg-light">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time, timeIndex) => (
              <tr key={time}>
                <td className="text-wrap">{time}</td>
                {daysOfWeek.map(day => {
                  const teachers = getTeachersAtTimeSlot(day, timeIndex);
                  return (
                    <td key={day} className="p-1">
                      <div className="d-flex h-10">
                        {teachers.length > 0 ? (
                          teachers.map(teacher => (
                            <div 
                              key={teacher.id}
                              className="flex-grow-1  border rounded"
                              style={{ 
                                backgroundColor: `${teacher.color}40`,
                                borderColor: teacher.color,
                                minWidth: '5px',
                              }}
                            >
                              <div className="fw-bold" style={{ color: teacher.color }}>
                                {teacher.name}
                              </div>
                              <div>{teacher.classInfo.subject}</div>
                              <div>{teacher.classInfo.room}</div>
                              <small>{teacher.classInfo.grade}</small>
                            </div>
                          ))
                        ) : (
                          <div className="d-flex align-items-center justify-content-center h-100 w-100">
                            -
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleGrid;

