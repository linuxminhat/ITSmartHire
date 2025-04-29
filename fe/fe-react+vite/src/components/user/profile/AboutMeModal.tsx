import React, { useState, useEffect } from 'react';

interface AboutMeModalProps {
  visible: boolean;
  initialValue?: string;
  onCancel: () => void;
  onOk: (values: { aboutMe: string }) => Promise<void>;
  loading: boolean;
}

const AboutMeModal: React.FC<AboutMeModalProps> = ({ visible, initialValue, onCancel, onOk, loading }) => {
  const [currentValue, setCurrentValue] = useState(initialValue || '');

  useEffect(() => {
    if (visible) {
      setCurrentValue(initialValue || '');
    }
  }, [visible, initialValue]);

  const handleOk = async () => {
    try {
      // No form validation needed for a simple textarea
      await onOk({ aboutMe: currentValue });
    } catch (errorInfo) {
      console.error('Save Failed:', errorInfo);
    }
  };

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    if (visible) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onCancel]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative transform transition-all duration-300 ease-in-out scale-100">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Đóng"
          disabled={loading}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-xl font-semibold text-gray-800 mb-4">Giới thiệu bản thân</h3>
        
        <div className="mb-4">
          <label htmlFor="aboutMeTextarea" className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả điểm mạnh, kinh nghiệm làm việc nổi bật của bạn...
          </label>
          <textarea
            id="aboutMeTextarea"
            rows={6}
            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder="Ví dụ: Chuyên viên phát triển phần mềm với 5 năm kinh nghiệm trong lĩnh vực Thương mại điện tử, thành thạo React và Node.js..."
            value={currentValue}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCurrentValue(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleOk}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutMeModal; 