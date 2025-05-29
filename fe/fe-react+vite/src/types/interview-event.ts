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

/* giá trị form trong modal */
export interface FormValues {
    title: string;
    candidateEmail: string;
    meetLink?: string;
    note?: string;
}
