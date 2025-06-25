import React, { useEffect, useState } from 'react';
import {
  BriefcaseIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { 
  hrDashboardService, 
  HrDashboardStats, 
  TopPosition, 
  ApplicationStatusDistribution, 
  MonthlyGrowth 
} from '../../services/hr-dashboard.service';
import { toast } from 'react-toastify';
import Spinner from '@/components/Spinner';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend
);

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-lg shadow p-5 flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, { bg: string; border: string }> = {
    'pending': { bg: 'rgba(251, 191, 36, 0.5)', border: 'rgb(251, 191, 36)' },
    'reviewed': { bg: 'rgba(59, 130, 246, 0.5)', border: 'rgb(59, 130, 246)' },
    'accepted': { bg: 'rgba(34, 197, 94, 0.5)', border: 'rgb(34, 197, 94)' },
    'rejected': { bg: 'rgba(239, 68, 68, 0.5)', border: 'rgb(239, 68, 68)' },
    'offered': { bg: 'rgba(168, 85, 247, 0.5)', border: 'rgb(168, 85, 247)' }
  };
  return colors[status] || { bg: 'rgba(156, 163, 175, 0.5)', border: 'rgb(156, 163, 175)' };
};

const translateStatus = (status: string) => {
  const translations: Record<string, string> = {
    'pending': 'Chờ xử lý',
    'reviewed': 'Đã xem',
    'accepted': 'Chấp nhận',
    'rejected': 'Từ chối',
    'offered': 'Đã offer'
  };
  return translations[status] || status;
};

const HrDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<HrDashboardStats | null>(null);
  const [topPositions, setTopPositions] = useState<TopPosition[]>([]);
  const [appStatus, setAppStatus] = useState<ApplicationStatusDistribution[]>([]);
  const [jobGrowth, setJobGrowth] = useState<MonthlyGrowth[]>([]);
  const [interviewGrowth, setInterviewGrowth] = useState<MonthlyGrowth[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [
          statsRes,
          positionsRes,
          statusRes,
          jobGrowthRes,
          interviewGrowthRes
        ] = await Promise.all([
          hrDashboardService.getStats(),
          hrDashboardService.getTopPositions(),
          hrDashboardService.getApplicationStatus(),
          hrDashboardService.getJobGrowth(),
          hrDashboardService.getInterviewGrowth()
        ]);

        console.log('HR Dashboard Data:', {
          statsRes,
          positionsRes,
          statusRes,
          jobGrowthRes,
          interviewGrowthRes
        });

        setStats(statsRes);
        setTopPositions(positionsRes || []);
        setAppStatus(statusRes || []);
        setJobGrowth(jobGrowthRes || []);
        setInterviewGrowth(interviewGrowthRes || []);

      } catch (error) {
        console.error('Error fetching HR dashboard data:', error);
        toast.error('Có lỗi khi tải dữ liệu dashboard cho HR');
        setStats({ totalJobs: 0, activeJobs: 0, totalApplications: 0, totalInterviews: 0 });
        setTopPositions([]);
        setAppStatus([]);
        setJobGrowth([]);
        setInterviewGrowth([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  const topPositionsChartConfig = {
    data: {
      labels: Array.isArray(topPositions) ? topPositions.map(p => p.name || 'Không xác định') : [],
      datasets: [{
        label: 'Số lượng CV',
        data: Array.isArray(topPositions) ? topPositions.map(p => p.count) : [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' as const },
        title: { display: true, text: 'Top 5 Vị Trí Nhận Nhiều CV Nhất' }
      },
      scales: {
        x: {
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    }
  };

  const appStatusChartConfig = {
    data: {
      labels: Array.isArray(appStatus) ? appStatus.map(s => translateStatus(s.status)) : [],
      datasets: [{
        label: 'Số lượng hồ sơ',
        data: Array.isArray(appStatus) ? appStatus.map(s => s.count) : [],
        backgroundColor: Array.isArray(appStatus) ? appStatus.map(s => getStatusColor(s.status).bg) : [],
        borderColor: Array.isArray(appStatus) ? appStatus.map(s => getStatusColor(s.status).border) : [],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' as const },
        title: { display: true, text: 'Tình Trạng Hồ Sơ Ứng Viên' }
      }
    }
  };
  
  const jobGrowthChartConfig = {
    data: {
      labels: Array.isArray(jobGrowth) ? jobGrowth.map(g => formatMonth(g.month)) : [],
      datasets: [{
        label: 'Số lượng công việc',
        data: Array.isArray(jobGrowth) ? jobGrowth.map(g => g.count) : [],
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' as const },
        title: { display: true, text: 'Số Lượng Công Việc Tạo Theo Tháng' }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  };

  const interviewGrowthChartConfig = {
    data: {
      labels: Array.isArray(interviewGrowth) ? interviewGrowth.map(g => formatMonth(g.month)) : [],
      datasets: [{
        label: 'Số lượng phỏng vấn',
        data: Array.isArray(interviewGrowth) ? interviewGrowth.map(g => g.count) : [],
        fill: true,
        backgroundColor: 'rgba(234, 179, 8, 0.2)',
        borderColor: 'rgb(234, 179, 8)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' as const },
        title: { display: true, text: 'Số Cuộc Phỏng Vấn Theo Tháng' }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-800">Bảng Điều Khiển Nhà Tuyển Dụng</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Tổng số việc làm" value={stats.totalJobs} icon={BriefcaseIcon} color="bg-blue-500" />
        <StatCard title="Việc làm đang tuyển" value={stats.activeJobs} icon={CheckCircleIcon} color="bg-green-500" />
        <StatCard title="Tổng số hồ sơ" value={stats.totalApplications} icon={DocumentTextIcon} color="bg-purple-500" />
        <StatCard title="Tổng số cuộc phỏng vấn" value={stats.totalInterviews} icon={CalendarDaysIcon} color="bg-yellow-500" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow">
          {topPositions.length > 0 ? (
            <div className="h-80 relative">
              <Bar data={topPositionsChartConfig.data} options={topPositionsChartConfig.options} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-80 text-center text-gray-500">
              <p>Chưa có dữ liệu vị trí tuyển dụng</p>
            </div>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          {appStatus.length > 0 ? (
            <div className="h-80 relative">
              <Bar data={appStatusChartConfig.data} options={appStatusChartConfig.options} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-80 text-center text-gray-500">
              <p>Chưa có dữ liệu trạng thái hồ sơ</p>
            </div>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          {jobGrowth.length > 0 ? (
            <div className="h-80 relative">
              <Bar data={jobGrowthChartConfig.data} options={jobGrowthChartConfig.options} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-80 text-center text-gray-500">
              <p>Chưa có dữ liệu công việc được tạo</p>
            </div>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          {interviewGrowth.length > 0 ? (
            <div className="h-80 relative">
              <Line data={interviewGrowthChartConfig.data} options={interviewGrowthChartConfig.options} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-80 text-center text-gray-500">
              <p>Chưa có dữ liệu phỏng vấn</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HrDashboardPage;
