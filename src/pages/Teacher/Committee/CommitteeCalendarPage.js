import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { Button, Typography } from 'antd';
import api from '../../../context/api_helper';

const { Title } = Typography;
const DragAndDropCalendar = withDragAndDrop(Calendar);
const localizer = momentLocalizer(moment);

const CommitteeCalendarPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [committee, setCommittee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/committees/${id}`);
        setCommittee(response.data.data);
        
        const committeeEvents = response.data.data.schedules.map(schedule => ({
          id: schedule.id,
          title: `${response.data.data.name}: ${schedule.notes}`,
          start: new Date(schedule.start_datetime),
          end: new Date(schedule.end_datetime),
          location: schedule.location,
          room: schedule.room,
          notes: schedule.notes,
        }));
        
        setEvents(committeeEvents);
      } catch (error) {
        console.error("Error fetching committee calendar:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <Button onClick={() => navigate(`/committees/${id}`)}>← Буцах</Button>
      <Title level={3}>{committee?.name} - Календар</Title>
      
      <DndProvider backend={HTML5Backend}>
        <DragAndDropCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          // Add other calendar props as needed
        />
      </DndProvider>
    </div>
  );
};

export default CommitteeCalendarPage;