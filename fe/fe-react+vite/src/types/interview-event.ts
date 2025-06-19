export interface IEvent {
    _id?: string;
    title: string;
    candidateEmail: string;
    start: string;
    end: string;
    tz?: string;
    meetLink?: string;
    note?: string;
    status?: 'pending' | 'accepted' | 'declined';
}
export interface FormValues {
    title: string;
    candidateEmail: string;
    meetLink?: string;
    note?: string;
    // thêm
    hrName: string;
    companyName: string;
    personalMessage?: string;
}
