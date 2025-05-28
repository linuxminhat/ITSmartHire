import React, { useEffect, useState } from 'react';
import {
  UsersIcon,
  BuildingOffice2Icon,
  BriefcaseIcon,
  CheckCircleIcon
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
  PointElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { dashboardService, DashboardStats, TopSkill, TopCompany, TopCategory, UserGrowth } from '../../services/dashboard.service';
import { toast } from 'react-toastify';
import Spinner from '@/components/Spinner';

// Đăng ký Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
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

const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topSkills, setTopSkills] = useState<TopSkill[]>([]);
  const [topCompanies, setTopCompanies] = useState<TopCompany[]>([]);
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowth[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [
        statsRes,
        skillsRes,
        companiesRes,
        categoriesRes,
        growthRes
      ] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getTopSkills(),
        dashboardService.getTopCompanies(),
        dashboardService.getTopCategories(),
        dashboardService.getUserGrowth()
      ]);
      console.log('DEBUG:', {
        statsRes,
        skillsRes,
        companiesRes,
        categoriesRes,
        growthRes
      });

      setStats(statsRes);               // Nếu statsRes là { data: ... } thì giữ nguyên
      setTopSkills(skillsRes);               // BỎ .data
      setTopCompanies(companiesRes);         // BỎ .data
      setTopCategories(categoriesRes);       // BỎ .data
      setUserGrowth(growthRes);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setTopSkills([]);         // Reset về array rỗng
      setTopCompanies([]);
      setTopCategories([]);
      setUserGrowth([]);
      toast.error('Có lỗi khi tải dữ liệu dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  // Chart configurations
  const skillsChartConfig = {
    data: {
      labels: Array.isArray(topSkills) ? topSkills.map(skill => skill.name) : [],
      datasets: [{
        label: 'Số lượng công việc',
        data: Array.isArray(topSkills) ? topSkills.map(skill => skill.count) : [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' as const },
        title: {
          display: true,
          text: 'Top 5 Skills Được Yêu Cầu Nhiều Nhất'
        }
      }
    }
  };

  const companiesChartConfig = {
    data: {
      labels: Array.isArray(topCompanies) ? topCompanies.map(company => company.name) : [],
      datasets: [{
        label: 'Số lượng việc làm',
        data: Array.isArray(topCompanies) ? topCompanies.map(company => company.jobCount) : [],
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' as const },
        title: {
          display: true,
          text: 'Top Công Ty Đăng Tuyển Nhiều Nhất'
        }
      }
    }
  };

  const categoriesChartConfig = {
    data: {
      labels: Array.isArray(topCategories) ? topCategories.map(category => category.name) : [],
      datasets: [{
        label: 'Số lượng công việc',
        data: Array.isArray(topCategories) ? topCategories.map(category => category.count) : [],
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' as const },
        title: {
          display: true,
          text: 'Top 5 Danh Mục Công Việc'
        }
      }
    }
  };

  const userGrowthChartConfig = {
    data: {
      labels: Array.isArray(userGrowth) ? userGrowth.map(data => data.month) : [],
      datasets: [{
        label: 'Số lượng người dùng',
        data: Array.isArray(userGrowth) ? userGrowth.map(data => data.count) : [],
        fill: true,
        backgroundColor: 'rgba(234, 179, 8, 0.2)',
        borderColor: 'rgb(234, 179, 8)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' as const },
        title: {
          display: true,
          text: 'Tăng Trưởng Người Dùng Theo Tháng'
        }
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Bảng Điều Khiển</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng số Người dùng"
          value={stats.totalUsers}
          icon={UsersIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Số nhà tuyển dụng"
          value={stats.totalRecruiters}
          icon={BuildingOffice2Icon}
          color="bg-purple-500"
        />
        <StatCard
          title="Tổng số việc làm"
          value={stats.totalJobs}
          icon={BriefcaseIcon}
          color="bg-green-500"
        />
        <StatCard
          title="Việc làm đang hoạt động"
          value={stats.activeJobs}
          icon={CheckCircleIcon}
          color="bg-yellow-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow">
          <Bar data={skillsChartConfig.data} options={skillsChartConfig.options} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <Bar data={companiesChartConfig.data} options={companiesChartConfig.options} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <Bar data={categoriesChartConfig.data} options={categoriesChartConfig.options} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <Line data={userGrowthChartConfig.data} options={userGrowthChartConfig.options} />
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 