import React, { useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';

import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import viLocale from '@fullcalendar/core/locales/vi';

import InterviewEventModal from './InterviewEventModal';
import { getEvents, createEvent, updateEvent, deleteEvent } from '@/services/event.service';
import { FormValues } from '@/types/interview-event';
import { DateSelectArg, DatesSetArg, EventApi, EventInput } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';

const InterviewCalendar: React.FC = () => {
    const [events, setEvents] = useState<EventInput[]>([]);
    const [modal, setModal] = useState<{
        open: boolean;
        range?: { start: Date; end: Date };
        event?: EventApi;
    }>({ open: false });

    const rangeRef = useRef<{ start: Date; end: Date } | null>(null);

    const fetchRange = useCallback(async (start: Date, end: Date) => {
        rangeRef.current = { start, end };
        const { data } = await getEvents(start, end);
        setEvents(
            data.map(ev => ({
                id: ev._id!,
                title: ev.title,
                start: ev.start,
                end: ev.end,
                backgroundColor:
                    ev.status === 'accepted'
                        ? '#22c55e'
                        : ev.status === 'declined'
                            ? '#ef4444'
                            : '#3b82f6',
                extendedProps: ev,
            }))
        );
    }, []);

    const reload = () => {
        if (rangeRef.current) {
            fetchRange(rangeRef.current.start, rangeRef.current.end);
        }
    };

    const handleDatesSet = (arg: DatesSetArg) => fetchRange(arg.start, arg.end);
    // 1) Xử lý click đơn vào ô trống
    const handleDateClick = (arg: DateClickArg) => {
        const start = arg.date;
        // ví dụ: mặc định end = start + 30 phút
        const end = new Date(start.getTime() + 30 * 60000);
        setModal({ open: true, range: { start, end } });
    };
    const handleDateSelect = (info: DateSelectArg) =>
        setModal({ open: true, range: { start: info.start, end: info.end } });
    const handleEventClick = (info: EventApi) =>
        setModal({ open: true, event: info });

    return (
        <>
            <div className="p-6 bg-white rounded-2xl shadow-xl w-full h-[85vh]">
                <h2 className="text-xl font-semibold mb-4">Quản lý lịch phỏng vấn</h2>
                <FullCalendar
                    plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                    locale={viLocale}
                    initialView="timeGridWeek"
                    height="100%"
                    selectable
                    events={events}
                    datesSet={handleDatesSet}
                    select={handleDateSelect}
                    dateClick={handleDateClick}
                    eventClick={(arg: any) => handleEventClick(arg.event)}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                />
            </div>

            {modal.open &&
                ReactDOM.createPortal(
                    <InterviewEventModal
                        isOpen={modal.open}
                        onClose={() => setModal({ open: false })}
                        defaultRange={modal.range}
                        defaultValues={
                            modal.event
                                ? {
                                    title: modal.event.title,
                                    candidateEmail: modal.event.extendedProps.candidateEmail,
                                    meetLink: modal.event.extendedProps.meetLink,
                                    note: modal.event.extendedProps.note,
                                    // thêm:
                                    hrName: modal.event.extendedProps.hrName,
                                    companyName: modal.event.extendedProps.companyName,
                                    personalMessage: modal.event.extendedProps.personalMessage,
                                }
                                : undefined
                        }

                        mode={modal.event ? 'edit' : 'create'}
                        onCreate={async (data: FormValues) => {
                            if (!modal.range) return;
                            await createEvent({
                                ...data,
                                start: modal.range.start.toISOString(),
                                end: modal.range.end.toISOString(),
                                tz: '+07:00',
                            });
                            setModal({ open: false });
                            reload();
                        }}
                        onUpdate={async (data: FormValues) => {
                            if (!modal.event) return;
                            await updateEvent(modal.event.id as string, data);
                            setModal({ open: false });
                            reload();
                        }}
                        onDelete={async () => {
                            if (!modal.event) return;
                            await deleteEvent(modal.event.id as string);
                            setModal({ open: false });
                            reload();
                        }}
                    />,
                    document.body
                )}
        </>
    );
};

export default InterviewCalendar;