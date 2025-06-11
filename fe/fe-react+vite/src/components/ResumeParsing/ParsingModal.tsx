import React from 'react';

const ParsingModal: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center flex flex-col items-center">
                {/* Cute Robot SVG */}
                <svg
                    className="w-32 h-32 mb-6"
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <style>{`
                        .robot-arm, .robot-eye { animation: blink 2s infinite ease-in-out; }
                        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                        .antenna-light { animation: pulse 1s infinite; }
                        @keyframes pulse { 0% { r: 2; } 50% { r: 3; } 100% { r: 2; } }
                    `}</style>
                    {/* Head */}
                    <rect x="30" y="20" width="40" height="30" rx="5" fill="#d1d5db" />
                    {/* Eyes */}
                    <circle className="robot-eye" cx="45" cy="35" r="4" fill="#1f2937" />
                    <circle className="robot-eye" cx="55" cy="35" r="4" fill="#1f2937" style={{ animationDelay: '0.2s' }} />
                    {/* Antenna */}
                    <line x1="50" y1="20" x2="50" y2="10" stroke="#9ca3af" strokeWidth="2" />
                    <circle className="antenna-light" cx="50" cy="8" r="2" fill="#f59e0b" />
                    {/* Body */}
                    <rect x="25" y="50" width="50" height="40" rx="5" fill="#e5e7eb" />
                    {/* Screen on body */}
                    <rect x="35" y="60" width="30" height="20" rx="3" fill="#9ca3af" />
                    {/* Arms */}
                    <rect className="robot-arm" x="15" y="55" width="10" height="20" rx="3" fill="#d1d5db" />
                    <rect className="robot-arm" x="75" y="55" width="10" height="20" rx="3" fill="#d1d5db" style={{ animationDelay: '0.5s' }} />
                    {/* Wheels/Legs */}
                    <circle cx="35" cy="95" r="5" fill="#6b7280" />
                    <circle cx="65" cy="95" r="5" fill="#6b7280" />
                </svg>

                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                    Đang phân tích hồ sơ...
                </h3>
                <p className="text-gray-600 max-w-sm">
                    Quá trình trích xuất CV đang được diễn ra, bạn vui lòng chờ.
                </p>
            </div>
        </div>
    );
};

export default ParsingModal;
