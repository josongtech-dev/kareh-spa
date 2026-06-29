import React, { useState, useContext, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { AdminThemeContext } from '../../pages/admin/AdminLayout';
import { appointmentApi } from '../../api/appointments';
import type { EventClickArg } from '@fullcalendar/core';

interface AppointmentCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    status: string;
    customer_name: string;
    staff_name: string;
    appointment_code: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#ffc107',
  confirmed: '#0d6efd',
  cancelled: '#dc3545',
  completed: '#198754',
};

interface AppointmentsCalendarProps {
  onAppointmentClick?: (appointment: any) => void;
}

const AppointmentsCalendar: React.FC<AppointmentsCalendarProps> = ({ onAppointmentClick }) => {
  const themeContext = useContext(AdminThemeContext);
  const isDarkMode = (themeContext as any)?.isDarkMode ?? false;
  const [events, setEvents] = useState<AppointmentCalendarEvent[]>([]);

  const fetchEvents = useCallback(async (start: string, end: string) => {
    try {
      const res = await appointmentApi.getByDateRange(start, end);
      const data = res.data?.data ?? res.data ?? [];
      const calendarEvents: AppointmentCalendarEvent[] = (Array.isArray(data) ? data : []).map((apt: any) => {
        const status = (apt.status || 'pending').toLowerCase();
        const color = STATUS_COLORS[status] || '#6c757d';
        const startTime = `${apt.appointment_date}T${apt.appointment_time || '09:00'}`;
        const endDate = new Date(startTime);
        endDate.setHours(endDate.getHours() + 1);
        const endTime = endDate.toISOString();
        return {
          id: String(apt.id),
          title: `${apt.customer_name} - ${apt.service_name || ''}`,
          start: startTime,
          end: endTime,
          backgroundColor: color,
          borderColor: color,
          textColor: '#fff',
          extendedProps: {
            status,
            customer_name: apt.customer_name,
            staff_name: apt.staff_name || 'Any Available',
            appointment_code: apt.appointment_code,
          },
        };
      });
      setEvents(calendarEvents);
    } catch (err) {
      console.error('Failed to fetch calendar events:', err);
    }
  }, []);

  const handleDatesSet = (arg: { start: Date; end: Date }) => {
    const start = arg.start.toISOString().split('T')[0];
    const end = arg.end.toISOString().split('T')[0];
    fetchEvents(start, end);
  };

  const handleEventClick = (arg: EventClickArg) => {
    if (onAppointmentClick) {
      const rawId = arg.event.id;
      const apt = {
        id: parseInt(rawId, 10),
        customer_name: arg.event.extendedProps.customer_name,
        staff_name: arg.event.extendedProps.staff_name,
        appointment_code: arg.event.extendedProps.appointment_code,
        status: arg.event.extendedProps.status,
      };
      onAppointmentClick(apt);
    }
  };

  return (
    <div className={isDarkMode ? 'fc-dark' : ''}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, bootstrap5Plugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        themeSystem="bootstrap5"
        events={events}
        datesSet={handleDatesSet}
        eventClick={handleEventClick}
        height="auto"
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        nowIndicator={true}
        editable={false}
        selectable={false}
      />
    </div>
  );
};

export default AppointmentsCalendar;
