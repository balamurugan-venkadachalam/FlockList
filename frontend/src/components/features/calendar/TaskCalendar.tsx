import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, View, Views, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css';
import moment from 'moment';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

// Rule applied: Use absolute imports for all files @/...
import { Task } from '@/services/taskService';
import TaskCalendarEvent from './TaskCalendarEvent';
import TaskDetailPopup from './TaskDetailPopup';

// Rule applied: Use Shadcn UI components
import { Card } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { cn } from '@/lib/utils';

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
  const isMobile = window.innerWidth < 640;
  
  return (
    <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div className="flex items-center gap-1">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onNavigate('PREV')}
            className="rounded-r-none"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {!isMobile && 'Previous'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onNavigate('TODAY')}
            className="rounded-none border-x-0"
          >
            <CalendarIcon className="h-4 w-4 mr-1" />
            {!isMobile && 'Today'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onNavigate('NEXT')}
            className="rounded-l-none"
          >
            {!isMobile && 'Next'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      
      <h2 className="text-lg font-medium">
        {label}
      </h2>
      
      <div className="flex items-center">
        {views.map((view: string) => (
          <Button 
            key={view} 
            variant="outline"
            size="sm"
            onClick={() => onView(view)}
            className={cn(
              "rounded-none first:rounded-l last:rounded-r border-r-0 last:border-r",
              view === 'month' ? 'Month' : view === 'week' ? 'Week' : 'Day'
            )}
          >
            {view === 'month' ? 'Month' : view === 'week' ? 'Week' : 'Day'}
          </Button>
        ))}
      </div>
    </div>
  );
};

// Custom event component for the calendar
const EventComponent = ({ event }: { event: CalendarEvent }) => {
  return <TaskCalendarEvent task={event.task} />;
};

const TaskCalendar: React.FC<TaskCalendarProps> = ({ tasks, onEventClick }) => {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  
  const isMobile = window.innerWidth < 640;
  
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
    <Card className="p-6 h-full">
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
    </Card>
  );
};

export default TaskCalendar;
