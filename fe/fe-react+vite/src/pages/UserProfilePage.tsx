import React, { useState, useEffect } from 'react';
import UserDashboardSidebar from '@/layouts/components/UserDashboardSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { 
    callGetUserProfile, 
    callUpdateUserProfile, 
    callAddEducation,
    callUpdateEducation,
    callDeleteEducation,
    IEducationPayload,
    callAddExperience,
    callUpdateExperience,
    callDeleteExperience,
    IExperiencePayload,
    callUpdateUserSkills,
    IUserSkillsUpdatePayload,
    callAddProject,
    callUpdateProject,
    callDeleteProject,
    IProjectPayload,
    callAddCertificate,
    callUpdateCertificate,
    callDeleteCertificate,
    ICertificatePayload,
    callAddAward,
    callUpdateAward,
    callDeleteAward,
    IAwardPayload
} from '@/services/user.service';
import { IUser, IEducation, IExperience, IProject, ICertificate, IAward, IUserProfileUpdatePayload } from '@/types/backend';
import Spinner from '@/components/Spinner';
import { 
    UserCircleIcon, 
    EnvelopeIcon, 
    PencilSquareIcon, 
    DevicePhoneMobileIcon, 
    CakeIcon, 
    MapPinIcon, 
    LinkIcon, 
    InformationCircleIcon,
    PlusCircleIcon,
    TrashIcon,
    ArrowPathIcon,
    BuildingOfficeIcon, 
    CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import AboutMeModal from '@/components/user/profile/AboutMeModal';
import AboutMeSection from '@/components/user/profile/AboutMeSection';
import EducationModal from '@/components/user/profile/EducationModal';
import EducationSection from '@/components/user/profile/EducationSection';
import ExperienceModal from '@/components/user/profile/ExperienceModal';
import ExperienceSection from '@/components/user/profile/ExperienceSection';
import SkillsModal from '@/components/user/profile/SkillsModal';
import SkillsSection from '@/components/user/profile/SkillsSection';
import ProjectModal from '@/components/user/profile/ProjectModal';
import ProjectSection from '@/components/user/profile/ProjectSection';
import CertificateModal from '@/components/user/profile/CertificateModal';
import CertificateSection from '@/components/user/profile/CertificateSection';
import AwardModal from '@/components/user/profile/AwardModal';
import AwardSection from '@/components/user/profile/AwardSection';
import BasicInfoModal from '@/components/user/profile/BasicInfoModal';
import CVTemplateSelectionModal from '@/components/cv/CVTemplateSelectionModal';

// Placeholder component for sections that are not yet implemented
const PlaceholderSection: React.FC<{ title: string; description: string; onAdd?: () => void }> = ({ title, description, onAdd }) => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
    <div className="flex justify-between items-center mb-3">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      {onAdd && (
        <button onClick={onAdd} className="p-1 text-indigo-600 hover:text-indigo-800">
          <PlusCircleIcon className="h-6 w-6" />
        </button>
      )}
       {!onAdd && (
         <button className="p-1 text-gray-400 cursor-not-allowed">
             <PencilSquareIcon className="h-5 w-5"/>
         </button>
       )} 
    </div>
    <p className="text-sm text-gray-500">{description}</p>
    {/* Add placeholder content or illustration if desired */}
  </div>
);

// --- ProfileCompletionSidebar Component ---

interface ProfileCompletionSidebarProps {
    percentage: number;
    suggestions: string[];
    onOpenCvModal: () => void;
}

const ProfileCompletionSidebar: React.FC<ProfileCompletionSidebarProps> = ({ 
    percentage, 
    suggestions,
    onOpenCvModal
}) => {
    // Determine color based on percentage
    let progressBarColor = 'bg-red-500';
    let progressBgColor = 'bg-red-200';
    let textColor = 'text-red-600';

    if (percentage >= 70) {
        progressBarColor = 'bg-green-500';
        progressBgColor = 'bg-green-200';
        textColor = 'text-green-600';
    } else if (percentage >= 40) {
        progressBarColor = 'bg-yellow-500';
        progressBgColor = 'bg-yellow-200';
        textColor = 'text-yellow-600';
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-800">Độ hoàn thiện hồ sơ</h3>
            {/* Progress bar */}
            <div className="relative pt-1">
                 <div className="flex mb-2 items-center justify-between">
                    <div>
                    <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${textColor} ${progressBgColor}`}>
                        {percentage}% Hoàn thành
                    </span>
                    </div>
                </div>
                <div className={`overflow-hidden h-2 mb-4 text-xs flex rounded ${progressBgColor}`}>
                    <div style={{ width: `${percentage}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${progressBarColor}`}></div>
                </div>
            </div>
            {percentage < 70 && (
                <p className="text-xs text-gray-600 bg-blue-50 p-2 rounded-md border border-blue-200">
                    Nâng cấp hồ sơ của bạn lên <strong className="font-semibold">70%</strong> để bắt đầu tạo mẫu CV dành cho chuyên gia IT.
                </p>
            )}
            {suggestions.length > 0 && (
                <> 
                    <p className="text-sm font-medium text-gray-700">Gợi ý cải thiện:</p>
                    <ul className="text-sm text-gray-700 space-y-2">
                        {suggestions.slice(0, 4).map((suggestion, index) => ( // Show max 4 suggestions
                            <li key={index} className="flex items-center">
                                <PlusCircleIcon className="h-4 w-4 mr-2 text-indigo-500 flex-shrink-0"/> 
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                 </>
            )}
            <button 
                onClick={onOpenCvModal}
                disabled={percentage < 70} // Disable if profile not complete enough
                className={`w-full mt-4 py-2 px-4 font-semibold rounded-md transition duration-200 ${percentage < 70 ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                Xem và Tải CV
            </button>
        </div>
    );
};
// -----------------------------------------

// Helper functions for profile completion calculation
const calculateProfileCompletion = (user: IUser | null): { percentage: number; suggestions: string[] } => {
    if (!user) return { percentage: 0, suggestions: [] };

    const criteria = [
        { key: 'phone', label: 'số điện thoại', weight: 10, filled: !!user.phone?.trim() },
        { key: 'address', label: 'địa chỉ', weight: 10, filled: !!user.address?.trim() },
        { key: 'aboutMe', label: 'giới thiệu bản thân', weight: 10, filled: !!user.aboutMe?.trim() },
        { key: 'education', label: 'học vấn', weight: 10, filled: (user.education?.length || 0) > 0 },
        { key: 'experience', label: 'kinh nghiệm làm việc', weight: 10, filled: (user.experience?.length || 0) > 0 },
        { key: 'skills', label: 'kỹ năng', weight: 10, filled: (user.skills?.length || 0) > 0 },
        { key: 'projects', label: 'dự án', weight: 10, filled: (user.projects?.length || 0) > 0 },
        { key: 'certificates', label: 'chứng chỉ', weight: 10, filled: (user.certificates?.length || 0) > 0 },
        { key: 'awards', label: 'giải thưởng', weight: 10, filled: (user.awards?.length || 0) > 0 },
         // Add name check (usually always present) - maybe assign initial %?
         { key: 'name', label: 'tên', weight: 10, filled: !!user.name?.trim() },
    ];

    let currentPercentage = 0;
    const suggestions: string[] = [];

    criteria.forEach(item => {
        if (item.filled) {
            currentPercentage += item.weight;
        } else {
            suggestions.push(`Thêm ${item.label}`);
        }
    });

    // Ensure percentage is between 0 and 100
    const percentage = Math.max(0, Math.min(100, currentPercentage));

    return { percentage, suggestions };
};

const UserProfilePage: React.FC = () => {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for About Me Modal
  const [isAboutMeModalVisible, setIsAboutMeModalVisible] = useState(false);
  const [isSavingAboutMe, setIsSavingAboutMe] = useState(false);

  // State for Education Modal
  const [isEducationModalVisible, setIsEducationModalVisible] = useState(false);
  const [editingEducation, setEditingEducation] = useState<IEducation | null>(null);
  const [isSavingEducation, setIsSavingEducation] = useState(false);
  const [isDeletingEducationId, setIsDeletingEducationId] = useState<string | null>(null);

  // State for Experience Modal
  const [isExperienceModalVisible, setIsExperienceModalVisible] = useState(false);
  const [editingExperience, setEditingExperience] = useState<IExperience | null>(null);
  const [isSavingExperience, setIsSavingExperience] = useState(false);
  const [isDeletingExperienceId, setIsDeletingExperienceId] = useState<string | null>(null);

  // Skills
  const [isSkillsModalVisible, setIsSkillsModalVisible] = useState(false);
  const [isSavingSkills, setIsSavingSkills] = useState(false);

  // State for Project Modal
  const [isProjectModalVisible, setIsProjectModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<IProject | null>(null);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isDeletingProjectId, setIsDeletingProjectId] = useState<string | null>(null);

  // State for Certificate Modal
  const [isCertificateModalVisible, setIsCertificateModalVisible] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<ICertificate | null>(null);
  const [isSavingCertificate, setIsSavingCertificate] = useState(false);
  const [isDeletingCertificateId, setIsDeletingCertificateId] = useState<string | null>(null);

  // State for Award Modal
  const [isAwardModalVisible, setIsAwardModalVisible] = useState(false);
  const [editingAward, setEditingAward] = useState<IAward | null>(null);
  const [isSavingAward, setIsSavingAward] = useState(false);
  const [isDeletingAwardId, setIsDeletingAwardId] = useState<string | null>(null);

  // State for Basic Info Modal
  const [isBasicInfoModalVisible, setIsBasicInfoModalVisible] = useState(false);
  const [isSavingBasicInfo, setIsSavingBasicInfo] = useState(false);

  // State for CV Template Selection Modal
  const [isCvModalVisible, setIsCvModalVisible] = useState(false);

  // Calculate completion state - Initialize suggestions as string[]
  const [profileCompletion, setProfileCompletion] = useState<{ percentage: number; suggestions: string[] }>({ percentage: 0, suggestions: [] });

  const fetchProfile = async () => {
    if (!authLoading && authUser) {
        setIsLoading(true);
        setError(null);
        try {
            const res = await callGetUserProfile();
            if (res && res.data) {
                setProfileData(res.data);
                // Calculate completion after setting data
                setProfileCompletion(calculateProfileCompletion(res.data)); 
            } else {
                const errorMsg = res?.message || "Không thể tải thông tin hồ sơ.";
                setError(errorMsg);
                toast.error(errorMsg);
                setProfileCompletion({ percentage: 0, suggestions: [] }); // Reset on error
            }
        } catch (err: any) {
            setError("Lỗi tải thông tin hồ sơ.");
            toast.error("Lỗi tải thông tin hồ sơ.");
            console.error("Fetch Profile Error:", err);
            setProfileCompletion({ percentage: 0, suggestions: [] }); // Reset on error
        } finally {
            setIsLoading(false);
        }
    }
  };

  // Update completion whenever profileData changes (after saves/deletes)
  useEffect(() => {
      setProfileCompletion(calculateProfileCompletion(profileData));
  }, [profileData]);

  useEffect(() => {
    if (!authLoading && !authUser) {
        setIsLoading(false);
        setError("Người dùng chưa được xác thực.");
         setProfileCompletion({ percentage: 0, suggestions: [] }); // Reset if not authenticated
    } else if (authUser) { // Ensure authUser exists before fetching
        fetchProfile();
    }
  }, [authUser, authLoading]);

  // Handler to open About Me modal
  const handleEditAboutMe = () => {
    setIsAboutMeModalVisible(true);
  };

  // Handler to save About Me data
  const handleSaveAboutMe = async (values: { aboutMe: string }) => {
    setIsSavingAboutMe(true);
    try {
      const payload: IUserProfileUpdatePayload = { aboutMe: values.aboutMe };
      const res = await callUpdateUserProfile(payload);
      
      if (res && res.data) {
         setProfileData(res.data);
         toast.success("Cập nhật giới thiệu thành công!");
         setIsAboutMeModalVisible(false);
      } else {
         const errorMsg = res?.message || "Có lỗi xảy ra khi cập nhật.";
         toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error("Update About Me Error:", err);
      toast.error(err?.response?.data?.message || "Lỗi cập nhật giới thiệu.");
    } finally {
      setIsSavingAboutMe(false);
    }
  };

  // --- Education Handlers ---
  const handleAddEducationClick = () => {
    setEditingEducation(null);
    setIsEducationModalVisible(true);
  };

  const handleEditEducationClick = (edu: IEducation) => {
    setEditingEducation(edu);
    setIsEducationModalVisible(true);
  };

  const handleSaveEducation = async (values: IEducationPayload | Partial<IEducationPayload>) => {
    setIsSavingEducation(true);
    try {
      let res;
      if (editingEducation?._id) {
        res = await callUpdateEducation(editingEducation._id, values as Partial<IEducationPayload>);
      } else {
        res = await callAddEducation(values as IEducationPayload);
      }

      if (res && res.data) {
        setProfileData(res.data);
        toast.success(editingEducation ? "Cập nhật học vấn thành công!" : "Thêm học vấn thành công!");
        setIsEducationModalVisible(false);
      } else {
        toast.error(res?.message || "Có lỗi xảy ra.");
      }
    } catch (err: any) {
      console.error("Save Education Error:", err);
      toast.error(err?.response?.data?.message || "Lỗi lưu thông tin học vấn.");
    } finally {
      setIsSavingEducation(false);
    }
  };

  const handleDeleteEducation = async (eduId: string) => {
    if (!eduId) return;
    setIsDeletingEducationId(eduId);
    try {
      const res = await callDeleteEducation(eduId);
      if (res && res.data) {
        setProfileData(res.data);
        toast.success("Xóa mục học vấn thành công!");
      } else {
        toast.error(res?.message || "Có lỗi xảy ra khi xóa.");
      }
    } catch (err: any) {
      console.error("Delete Education Error:", err);
      toast.error(err?.response?.data?.message || "Lỗi xóa thông tin học vấn.");
    } finally {
      setIsDeletingEducationId(null);
    }
  };
  // ------------------------

  // --- Experience Handlers ---
  const handleAddExperienceClick = () => {
    setEditingExperience(null);
    setIsExperienceModalVisible(true);
  };

  const handleEditExperienceClick = (exp: IExperience) => {
    setEditingExperience(exp);
    setIsExperienceModalVisible(true);
  };

  const handleSaveExperience = async (values: IExperiencePayload | Partial<IExperiencePayload>) => {
    setIsSavingExperience(true);
    try {
      let res;
      if (editingExperience?._id) {
        res = await callUpdateExperience(editingExperience._id, values as Partial<IExperiencePayload>);
      } else {
        res = await callAddExperience(values as IExperiencePayload);
      }

      if (res && res.data) {
        setProfileData(res.data);
        toast.success(editingExperience ? "Cập nhật kinh nghiệm thành công!" : "Thêm kinh nghiệm thành công!");
        setIsExperienceModalVisible(false);
      } else {
        toast.error(res?.message || "Có lỗi xảy ra.");
      }
    } catch (err: any) {
      console.error("Save Experience Error:", err);
      toast.error(err?.response?.data?.message || "Lỗi lưu thông tin kinh nghiệm.");
    } finally {
      setIsSavingExperience(false);
    }
  };

  const handleDeleteExperience = async (expId: string) => {
    if (!expId) return;
    setIsDeletingExperienceId(expId);
    try {
      const res = await callDeleteExperience(expId);
      if (res && res.data) {
        setProfileData(res.data);
        toast.success("Xóa mục kinh nghiệm thành công!");
      } else {
        toast.error(res?.message || "Có lỗi xảy ra khi xóa.");
      }
    } catch (err: any) {
      console.error("Delete Experience Error:", err);
      toast.error(err?.response?.data?.message || "Lỗi xóa thông tin kinh nghiệm.");
    } finally {
      setIsDeletingExperienceId(null);
    }
  };

  // Skills Handlers
  const handleEditSkills = () => {
    setIsSkillsModalVisible(true);
  };

  const handleSaveSkills = async (payload: IUserSkillsUpdatePayload) => {
    setIsSavingSkills(true);
    try {
        const res = await callUpdateUserSkills(payload);
        if (res && res.data) {
            setProfileData(res.data);
            toast.success("Cập nhật kỹ năng thành công!");
            setIsSkillsModalVisible(false);
        } else {
            toast.error(res?.message || "Có lỗi xảy ra khi cập nhật kỹ năng.");
        }
    } catch (err: any) {
        console.error("Save Skills Error:", err);
        toast.error(err?.response?.data?.message || "Lỗi lưu thông tin kỹ năng.");
    } finally {
        setIsSavingSkills(false);
    }
  };

  // --- Project Handlers ---
  const handleAddProjectClick = () => {
    setEditingProject(null);
    setIsProjectModalVisible(true);
  };

  const handleEditProjectClick = (project: IProject) => {
    setEditingProject(project);
    setIsProjectModalVisible(true);
  };

  const handleSaveProject = async (values: IProjectPayload | Partial<IProjectPayload>) => {
    setIsSavingProject(true);
    try {
      let res;
      if (editingProject?._id) {
        res = await callUpdateProject(editingProject._id, values as Partial<IProjectPayload>);
      } else {
        res = await callAddProject(values as IProjectPayload);
      }

      if (res && res.data) {
        setProfileData(res.data);
        toast.success(editingProject ? "Cập nhật dự án thành công!" : "Thêm dự án thành công!");
        setIsProjectModalVisible(false);
      } else {
        toast.error(res?.message || "Có lỗi xảy ra.");
      }
    } catch (err: any) {
      console.error("Save Project Error:", err);
      toast.error(err?.response?.data?.message || "Lỗi lưu thông tin dự án.");
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!projectId) return;
    setIsDeletingProjectId(projectId);
    try {
      const res = await callDeleteProject(projectId);
      if (res && res.data) {
        setProfileData(res.data);
        toast.success("Xóa dự án thành công!");
      } else {
        toast.error(res?.message || "Có lỗi xảy ra khi xóa.");
      }
    } catch (err: any) {
      console.error("Delete Project Error:", err);
      toast.error(err?.response?.data?.message || "Lỗi xóa thông tin dự án.");
    } finally {
      setIsDeletingProjectId(null);
    }
  };

  // --- Certificate Handlers ---
  const handleAddCertificateClick = () => {
    setEditingCertificate(null);
    setIsCertificateModalVisible(true);
  };

  const handleEditCertificateClick = (cert: ICertificate) => {
    setEditingCertificate(cert);
    setIsCertificateModalVisible(true);
  };

  const handleSaveCertificate = async (values: ICertificatePayload | Partial<ICertificatePayload>) => {
    setIsSavingCertificate(true);
    try {
      let res;
      if (editingCertificate?._id) {
        res = await callUpdateCertificate(editingCertificate._id, values as Partial<ICertificatePayload>);
      } else {
        res = await callAddCertificate(values as ICertificatePayload);
      }

      if (res && res.data) {
        setProfileData(res.data);
        toast.success(editingCertificate ? "Cập nhật chứng chỉ thành công!" : "Thêm chứng chỉ thành công!");
        setIsCertificateModalVisible(false);
      } else {
        toast.error(res?.message || "Có lỗi xảy ra.");
      }
    } catch (err: any) {
      console.error("Save Certificate Error:", err);
      toast.error(err?.response?.data?.message || "Lỗi lưu thông tin chứng chỉ.");
    } finally {
      setIsSavingCertificate(false);
    }
  };

  const handleDeleteCertificate = async (certId: string) => {
    if (!certId) return;
    setIsDeletingCertificateId(certId);
    try {
      const res = await callDeleteCertificate(certId);
      if (res && res.data) {
        setProfileData(res.data);
        toast.success("Xóa chứng chỉ thành công!");
      } else {
        toast.error(res?.message || "Có lỗi xảy ra khi xóa.");
      }
    } catch (err: any) {
      console.error("Delete Certificate Error:", err);
      toast.error(err?.response?.data?.message || "Lỗi xóa thông tin chứng chỉ.");
    } finally {
      setIsDeletingCertificateId(null);
    }
  };

  // --- Award Handlers ---
  const handleAddAwardClick = () => {
    setEditingAward(null);
    setIsAwardModalVisible(true);
  };

  const handleEditAwardClick = (award: IAward) => {
    setEditingAward(award);
    setIsAwardModalVisible(true);
  };

  const handleSaveAward = async (values: IAwardPayload | Partial<IAwardPayload>) => {
    setIsSavingAward(true);
    try {
      let res;
      if (editingAward?._id) {
        res = await callUpdateAward(editingAward._id, values as Partial<IAwardPayload>);
      } else {
        res = await callAddAward(values as IAwardPayload);
      }

      if (res && res.data) {
        setProfileData(res.data);
        toast.success(editingAward ? "Cập nhật giải thưởng thành công!" : "Thêm giải thưởng thành công!");
        setIsAwardModalVisible(false);
      } else {
        toast.error(res?.message || "Có lỗi xảy ra.");
      }
    } catch (err: any) {
      console.error("Save Award Error:", err);
      toast.error(err?.response?.data?.message || "Lỗi lưu thông tin giải thưởng.");
    } finally {
      setIsSavingAward(false);
    }
  };

  const handleDeleteAward = async (awardId: string) => {
    if (!awardId) return;
    setIsDeletingAwardId(awardId);
    try {
      const res = await callDeleteAward(awardId);
      if (res && res.data) {
        setProfileData(res.data);
        toast.success("Xóa giải thưởng thành công!");
      } else {
        toast.error(res?.message || "Có lỗi xảy ra khi xóa.");
      }
    } catch (err: any) {
      console.error("Delete Award Error:", err);
      toast.error(err?.response?.data?.message || "Lỗi xóa thông tin giải thưởng.");
    } finally {
      setIsDeletingAwardId(null);
    }
  };

  // --- Basic Info Handlers ---
  const handleEditBasicInfoClick = () => {
      setIsBasicInfoModalVisible(true);
  };

  // Corrected handleSaveBasicInfo to match previous implementation
  const handleSaveBasicInfo = async (payload: IUserProfileUpdatePayload) => {
      setIsSavingBasicInfo(true);
      try {
          // We reuse the callUpdateUserProfile service function
          const res = await callUpdateUserProfile(payload);
          if (res && res.data) {
              setProfileData(res.data); // Update local state
              toast.success("Cập nhật thông tin thành công!");
              setIsBasicInfoModalVisible(false); // Close modal on success
          } else {
              toast.error(res?.message || "Có lỗi xảy ra khi cập nhật thông tin.");
          }
      } catch (err: any) {
          console.error("Update Basic Info Error:", err);
          toast.error(err?.response?.data?.message || "Lỗi cập nhật thông tin.");
      } finally {
          setIsSavingBasicInfo(false);
      }
  };

  // --- Handler to open CV Template Modal ---
  const handleOpenCvModal = () => {
    if (profileCompletion.percentage >= 70) {
        setIsCvModalVisible(true);
    } else {
        toast.warn("Hồ sơ của bạn cần đạt ít nhất 70% để tạo CV.");
    }
  };
  // ----------------------------------------

  if (isLoading || authLoading) {
      return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Spinner /></div>;
  }

  if (error || !profileData) {
      return <div className="p-6 text-center text-red-500">{error || 'Không thể tải hồ sơ.'}</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Sidebar Column */}
          <div className="md:col-span-1 lg:col-span-1">
            <UserDashboardSidebar user={authUser} />
          </div>

          {/* Main Content Column */}
          <div className="md:col-span-3 lg:col-span-4 space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 items-start">
                {/* Left part of content area */}
                <div className="xl:col-span-2 space-y-6 md:space-y-8">
                    {/* Profile Header Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 relative">
                        {/* Edit Button - Added onClick handler */}
                        <button 
                            onClick={handleEditBasicInfoClick}
                            className="absolute top-4 right-4 p-1 text-gray-500 hover:text-indigo-600"
                            aria-label="Chỉnh sửa thông tin cơ bản"
                        >
                            <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <div className="flex flex-col sm:flex-row items-center gap-5">
                            <div className="flex-shrink-0">
                                <UserCircleIcon className="h-20 w-20 text-gray-400" /> 
                            </div>
                            <div className="flex-grow text-center sm:text-left">
                                <h1 className="text-2xl font-bold text-gray-800 mb-1">{profileData.name}</h1>
                                <p className="text-sm text-gray-500 mb-2">
                                    <span 
                                        className="hover:text-indigo-600 cursor-pointer transition-colors"
                                        onClick={() => setIsDesignationModalOpen(true)}
                                    >
                                        {profileData.designation || 'Cập nhật chức danh'}
                                    </span>
                                </p>
                                <p className="text-sm text-gray-600 flex items-center justify-center sm:justify-start mb-1">
                                    <EnvelopeIcon className="h-4 w-4 mr-1.5 flex-shrink-0" /> {profileData.email}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start mb-1">
                                     <DevicePhoneMobileIcon className="h-4 w-4 mr-1.5 flex-shrink-0" /> {profileData.phone || <span className='text-gray-400 italic'>Chưa cập nhật</span>}
                                </p>
                            </div>
                        </div>
                        {/* Additional Info Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                             <div className="flex items-center">
                                 <CakeIcon className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0"/> Ngày sinh: {profileData.age ? `${profileData.age} tuổi` : <span className='text-gray-400 italic'>Chưa rõ</span>} {/* Display age for now */}
                             </div>
                             <div className="flex items-center">
                                 <CheckBadgeIcon className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0"/> Giới tính: {profileData.gender === 'male' ? 'Nam' : profileData.gender === 'female' ? 'Nữ' : profileData.gender || <span className='text-gray-400 italic'>Chưa rõ</span>}
                             </div>
                             <div className="flex items-center">
                                  <MapPinIcon className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0"/> Địa chỉ: {profileData.address || <span className='text-gray-400 italic'>Chưa rõ</span>}
                             </div>
                              <div className="flex items-center">
                                  <LinkIcon className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0"/> <span className='hover:text-indigo-600 cursor-pointer'>Link cá nhân</span>
                             </div>
                        </div>
                         {/* Info Box */} 
                         <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-700 text-sm rounded-r-md flex items-start">
                             <InformationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0"/>
                             <span>Email trong hồ sơ của bạn hiện đã được đồng bộ với email của tài khoản và không thể thay đổi.</span>
                         </div>
                    </div>

                    {/* === About Me Section === */}
                    <AboutMeSection 
                        aboutMe={profileData.aboutMe}
                        onEdit={handleEditAboutMe}
                    />

                    {/* === Education Section === */}
                    <EducationSection 
                        education={profileData.education}
                        onAdd={handleAddEducationClick}
                        onEdit={handleEditEducationClick}
                        onDelete={handleDeleteEducation}
                        isDeletingId={isDeletingEducationId}
                    />

                    {/* === Experience Section === */}
                    <ExperienceSection 
                        experience={profileData.experience}
                        onAdd={handleAddExperienceClick}
                        onEdit={handleEditExperienceClick}
                        onDelete={handleDeleteExperience}
                        isDeletingId={isDeletingExperienceId}
                    />

                    {/* === Skills Section === */}
                    <SkillsSection 
                        skills={profileData.skills}
                        onEdit={handleEditSkills}
                    />

                    {/* === Projects Section === */}
                    <ProjectSection 
                        projects={profileData.projects}
                        onAdd={handleAddProjectClick}
                        onEdit={handleEditProjectClick}
                        onDelete={handleDeleteProject}
                        isDeletingId={isDeletingProjectId}
                    />

                    {/* === Certificates Section === */}
                    <CertificateSection
                        certificates={profileData.certificates}
                        onAdd={handleAddCertificateClick}
                        onEdit={handleEditCertificateClick}
                        onDelete={handleDeleteCertificate}
                        isDeletingId={isDeletingCertificateId}
                    />

                    {/* === Awards Section === */}
                    <AwardSection
                        awards={profileData.awards}
                        onAdd={handleAddAwardClick}
                        onEdit={handleEditAwardClick}
                        onDelete={handleDeleteAward}
                        isDeletingId={isDeletingAwardId}
                    />
                </div>

                {/* Right Sidebar of content area */}
                 <div className="xl:col-span-1">
                    <ProfileCompletionSidebar
                        percentage={profileCompletion.percentage}
                        suggestions={profileCompletion.suggestions}
                        onOpenCvModal={handleOpenCvModal}
                    />
                 </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render Modals */}
      <AboutMeModal
        visible={isAboutMeModalVisible}
        initialValue={profileData.aboutMe}
        onCancel={() => setIsAboutMeModalVisible(false)}
        onOk={handleSaveAboutMe}
        loading={isSavingAboutMe}
      />

      <EducationModal
        visible={isEducationModalVisible}
        initialData={editingEducation}
        onCancel={() => setIsEducationModalVisible(false)}
        onOk={handleSaveEducation}
        loading={isSavingEducation}
      />

      <ExperienceModal
        visible={isExperienceModalVisible}
        initialData={editingExperience}
        onCancel={() => setIsExperienceModalVisible(false)}
        onOk={handleSaveExperience}
        loading={isSavingExperience}
      />

      <SkillsModal 
        visible={isSkillsModalVisible}
        initialSkills={profileData.skills}
        onCancel={() => setIsSkillsModalVisible(false)}
        onOk={handleSaveSkills}
        loading={isSavingSkills}
      />

      {/* Render Project Modal */}
      <ProjectModal
          visible={isProjectModalVisible}
          initialData={editingProject}
          onCancel={() => setIsProjectModalVisible(false)}
          onOk={handleSaveProject}
          loading={isSavingProject}
      />

      {/* Render Certificate Modal */}
      <CertificateModal
          visible={isCertificateModalVisible}
          initialData={editingCertificate}
          onCancel={() => setIsCertificateModalVisible(false)}
          onOk={handleSaveCertificate}
          loading={isSavingCertificate}
      />

      {/* Render Award Modal */}
      <AwardModal
          visible={isAwardModalVisible}
          initialData={editingAward}
          onCancel={() => setIsAwardModalVisible(false)}
          onOk={handleSaveAward}
          loading={isSavingAward}
      />

      {/* Render Basic Info Modal */}
      <BasicInfoModal
          visible={isBasicInfoModalVisible}
          initialData={profileData}
          onCancel={() => setIsBasicInfoModalVisible(false)}
          onOk={handleSaveBasicInfo}
          loading={isSavingBasicInfo}
      />

      {/* Render CV Template Selection Modal */}
      <CVTemplateSelectionModal
          visible={isCvModalVisible}
          profileData={profileData}
          onCancel={() => setIsCvModalVisible(false)}
      />

    </div>
  );
};

export default UserProfilePage; 