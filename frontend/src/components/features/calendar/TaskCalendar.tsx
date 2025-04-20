import React, { useState, useMemo, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  ButtonGroup, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Chip,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Calendar, View, Views, momentLocalizer, SlotInfo } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css';
import moment from 'moment';
import {
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Today as TodayIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { Task } from '../../../services/taskService';
import TaskCalendarEvent from './TaskCalendarEvent';
import TaskDetailPopup from './TaskDetailPopup';

// Setup the localizer for the calendar
const localizer = momentLocalizer(moment);

interface TaskCalendarProps {
  tasks: Task[];
  flockMembers?: any[];
  onEventClick?: (task: Task) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  task: Task;
}

// Custom toolbar for the calendar
const CustomToolbar = ({ onView, onNavigate, label, views }: any) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Box sx={{ mb: 2, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ButtonGroup variant="outlined" size="small">
          <Button onClick={() => onNavigate('PREV')} startIcon={<PrevIcon />}>
            {!isMobile && 'Previous'}
          </Button>
          <Button onClick={() => onNavigate('TODAY')} startIcon={<TodayIcon />}>
            {!isMobile && 'Today'}
          </Button>
          <Button onClick={() => onNavigate('NEXT')} endIcon={<NextIcon />}>
            {!isMobile && 'Next'}
          </Button>
        </ButtonGroup>
      </Box>
      
      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
        {label}
      </Typography>
      
      <ButtonGroup variant="outlined" size="small">
        {views.map((view: string) => (
          <Button 
            key={view} 
            onClick={() => onView(view)}
          >
            {view === 'month' ? 'Month' : view === 'week' ? 'Week' : 'Day'}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
};

// Custom event component for the calendar
const EventComponent = ({ event }: { event: CalendarEvent }) => {
  return <TaskCalendarEvent task={event.task} />;
};

const TaskCalendar: React.FC<TaskCalendarProps> = ({ tasks, flockMembers = [], onEventClick }) => {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Convert tasks to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return tasks.filter(task => task.dueDate).map(task => ({
      id: task._id,
      title: task.title,
      start: new Date(task.dueDate as string),
      end: new Date(task.dueDate as string),
      task: task
    }));
  }, [tasks]);
  
  // Handle event selection
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedTask(event.task);
    setShowPopup(true);
    if (onEventClick) {
      onEventClick(event.task);
    }
  }, [onEventClick]);
  
  // Handle view change
  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);
  
  // Handle date navigation
  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);
  
  // Calculate available height for the calendar
  const calendarHeight = isMobile ? 500 : 700;
  
  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: calendarHeight }}
        views={['month', 'week', 'day']}
        view={view}
        date={date}
        onView={handleViewChange}
        onNavigate={handleNavigate}
        onSelectEvent={handleSelectEvent}
        components={{
          toolbar: CustomToolbar,
          event: EventComponent
        }}
        eventPropGetter={(event) => {
          const task = (event as CalendarEvent).task;
          return {
            className: `task-priority-${task.priority} task-status-${task.status}`,
          };
        }}
        popup
        dayLayoutAlgorithm="no-overlap"
      />
      
      {/* Task detail popup */}
      {selectedTask && (
        <TaskDetailPopup
          open={showPopup}
          task={selectedTask}
          onClose={() => setShowPopup(false)}
        />
      )}
    </Paper>
  );
};

export default TaskCalendar; 