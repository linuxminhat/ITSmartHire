import InterviewCalendar from '@/components/hr/InterviewCalendar';
import React from 'react';


const InterviewSchedulePage: React.FC = () => (
    <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Lịch phỏng vấn</h1>
        <InterviewCalendar />
    </div>
);

export default InterviewSchedulePage;
