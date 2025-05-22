import React, { useEffect, useRef, useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';

interface Props {
    unreadCount: number;
    fetch: () => Promise<void>;
    Panel: React.FC;      // panel component render list
    className?: string;
}

const GenericNotificationIcon: React.FC<Props> = ({ unreadCount, fetch, Panel, className }) => {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement>(null);
    const pnlRef = useRef<HTMLDivElement>(null);

    /* Chỉ fetch data khi component mount, không tự polling vì context đã xử lý */
    useEffect(() => { 
        // Chỉ fetch lần đầu khi component mount
        fetch(); 
        // Không cần interval ở đây nữa vì đã xử lý trong context
    }, [fetch]);

    /* click outside */
    useEffect(() => {
        const listener = (e: MouseEvent) => {
            if (!pnlRef.current || !btnRef.current) return;
            if (!pnlRef.current.contains(e.target as Node) && !btnRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', listener);
        return () => document.removeEventListener('mousedown', listener);
    }, []);

    return (
        <div className="relative">
            <button ref={btnRef} onClick={() => setOpen(o => !o)}
                className={`relative p-1 rounded-full hover:bg-gray-100 focus:outline-none ${className}`}>
                <BellIcon className="h-6 w-6 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-red-500 text-white
                           text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div ref={pnlRef} className="absolute right-0 z-20 mt-2 translate-x-1/4 shadow-lg">
                    <Panel />
                </div>
            )}
        </div>
    );
};
export default GenericNotificationIcon;
