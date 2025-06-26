import React, { useState, useEffect, useRef } from 'react';
import { IJob, ISkill, ICategory, ICompany, IApiResponse } from '@/types/backend';
import { callCreateJob, callUpdateJob } from '@/services/job.service';
import { toast } from 'react-toastify';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Editor } from '@tinymce/tinymce-react';
import { AxiosResponse } from 'axios';
import { uploadFile } from '@/services/storage.service';

interface IProvince {
  name: string;
  code: number;
}

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataInit: IJob | null;
  refetch: () => void;
  listSkills: ISkill[];
  listCategories: ICategory[];
  listCompanies: ICompany[];
  listProvinces: IProvince[];
}

const inputFieldClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100";
const textareaClass = `${inputFieldClass} min-h-[80px]`;
const dateInputClass = `${inputFieldClass} appearance-none`;

const JobModal: React.FC<JobModalProps> = ({ 
    isOpen, onClose, dataInit, refetch, 
    listSkills, listCategories, listCompanies, listProvinces 
}) => {
  const [name, setName] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [category, setCategory] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [level, setLevel] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const editorRef = useRef<any>(null);

  const formatDateForInput = (date: Date | string | undefined): string => {
    if (!date) return '';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            console.warn("Invalid date received:", date);
            return '';
        }
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error("Error formatting date:", date, error);
        return '';
    }
  };

  useEffect(() => {
    if (isOpen) {
        if (dataInit) {
            setName(dataInit.name || '');
            setSelectedSkills(Array.isArray(dataInit.skills) ? dataInit.skills.map(skill => typeof skill === 'object' ? skill._id! : skill) : []);
            setCategory(typeof dataInit.category === 'object' ? dataInit.category._id! : dataInit.category || '');
            setCompany(typeof dataInit.company === 'object' ? dataInit.company._id! : dataInit.company || '');
            setLocation(dataInit.location || '');
            setSalary(dataInit.salary?.toString() || '');
            setQuantity(dataInit.quantity?.toString() || '');
            setLevel(dataInit.level || '');
            setDescription(dataInit.description || '');
            setStartDate(formatDateForInput(dataInit.startDate));
            setEndDate(formatDateForInput(dataInit.endDate));
            setIsActive(dataInit.isActive !== undefined ? dataInit.isActive : true);
        } else {
            setName('');
            setSelectedSkills([]);
            setCategory('');
            setCompany('');
            setLocation('');
            setSalary('');
            setQuantity('');
            setLevel('');
            setDescription('');
            setStartDate('');
            setEndDate('');
            setIsActive(true);
        }
    }
  }, [dataInit, isOpen]);

  useEffect(() => {
      if (editorRef.current && editorRef.current.setContent && editorRef.current.getContent() !== description) {
          editorRef.current.setContent(description);
      }
  }, [description]);

   const handleSkillChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const options = e.target.options;
      const value: string[] = [];
      for (let i = 0, l = options.length; i < l; i++) {
          if (options[i].selected) {
              value.push(options[i].value);
          }
      }
      setSelectedSkills(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const currentDescription = description;

    if (!name || !category || !company || !location || !salary || !quantity || !level || !currentDescription || !startDate || !endDate || selectedSkills.length === 0) {
        toast.error("Vui lòng điền đầy đủ tất cả các trường bắt buộc.");
        setIsLoading(false);
        return;
      }
      
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (end <= start) {
        toast.error("Ngày kết thúc phải sau ngày bắt đầu.");
        setIsLoading(false);
        return;
    }
      
    const selectedCompanyObject = listCompanies.find(c => c._id === company);
    if (!selectedCompanyObject) {
      toast.error("Lỗi: Không tìm thấy thông tin công ty đã chọn.");
      setIsLoading(false);
      return;
    }
    
    const payload: Partial<IJob> = {
        name,
        skills: selectedSkills, 
        category,
        company: { 
          _id: selectedCompanyObject._id,
          name: selectedCompanyObject.name || '', 
          logo: selectedCompanyObject.logo || ''  
        },
        location,
        salary: parseInt(salary),
        quantity: parseInt(quantity),
        level,
        description: currentDescription, 
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive,
      };

    try {
      if (dataInit?._id) {
        const res: IApiResponse = await callUpdateJob(dataInit._id, payload);
        if (res && res.statusCode && String(res.statusCode).startsWith('2')) {
          toast.success(res.message || 'Cập nhật việc làm thành công!'); 
          refetch();
          onClose();
        } else {
           const errorMsg = res?.message || 'Có lỗi xảy ra khi cập nhật việc làm.';
           if (Array.isArray(errorMsg)) { 
               errorMsg.forEach(msg => toast.error(msg));
           } else {
               toast.error(errorMsg);
           }
        }
      } else {
         const res: IApiResponse = await callCreateJob(payload);
         if (res && res.statusCode === 201) { 
          toast.success(res.message || 'Thêm mới việc làm thành công!'); 
          refetch();
          onClose();
        } else {
           const errorMsg = res?.message || 'Có lỗi xảy ra khi thêm mới việc làm.';
            if (Array.isArray(errorMsg)) { 
                errorMsg.forEach(msg => toast.error(msg));
            } else {
                toast.error(errorMsg);
            }
        }
      }
    } catch (error: any) {
      console.error("Submit Job Error:", error);
      const backendMessage = error?.message;
      if (Array.isArray(backendMessage)) {
          backendMessage.forEach(msg => toast.error(msg));
      } else {
          toast.error(backendMessage || 'Đã có lỗi xảy ra.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 ${isOpen ? 'block' : 'hidden'} z-50 overflow-y-auto`}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 relative transform transition-all">
          <div className="flex justify-between items-center p-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {dataInit?._id ? 'Chỉnh sửa Việc làm' : 'Thêm mới Việc làm'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-150px)] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên việc làm <span className="text-red-500">*</span></label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputFieldClass} disabled={isLoading} required />
              </div>

              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">Kỹ năng <span className="text-red-500">*</span></label>
                <select id="skills" value={selectedSkills} onChange={handleSkillChange} multiple className={`${inputFieldClass} min-h-[100px]`} disabled={isLoading} required>
                  {listSkills.map(skill => (
                    <option key={skill._id} value={skill._id}>{skill.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Giữ Ctrl/Cmd để chọn nhiều kỹ năng.</p>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Danh mục <span className="text-red-500">*</span></label>
                <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputFieldClass} disabled={isLoading} required>
                  <option value="">-- Chọn danh mục --</option>
                  {listCategories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Công ty <span className="text-red-500">*</span></label>
                <select id="company" value={company} onChange={(e) => setCompany(e.target.value)} className={inputFieldClass} disabled={isLoading} required>
                  <option value="">-- Chọn công ty --</option>
                  {listCompanies.map(comp => (
                    <option key={comp._id} value={comp._id}>{comp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Địa điểm <span className="text-red-500">*</span></label>
                <select 
                  id="location" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  className={inputFieldClass} 
                  disabled={isLoading} 
                  required
                >
                   <option value="">-- Chọn Tỉnh/Thành phố --</option>
                   {listProvinces.map(province => (
                     <option key={province.code} value={province.name}>
                       {province.name}
                     </option>
                   ))}
                </select>
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">Lương (VNĐ) <span className="text-red-500">*</span></label>
                <input type="number" id="salary" value={salary} onChange={(e) => setSalary(e.target.value)} className={inputFieldClass} disabled={isLoading} required min="0" />
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Số lượng <span className="text-red-500">*</span></label>
                <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputFieldClass} disabled={isLoading} required min="1" />
              </div>

              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">Trình độ <span className="text-red-500">*</span></label>
                <input type="text" id="level" value={level} onChange={(e) => setLevel(e.target.value)} className={inputFieldClass} disabled={isLoading} required />
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu <span className="text-red-500">*</span></label>
                <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={dateInputClass} disabled={isLoading} required />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc <span className="text-red-500">*</span></label>
                <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={dateInputClass} disabled={isLoading} required />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:bg-gray-100"
                    disabled={isLoading}
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Kích hoạt (Hiển thị cho người dùng tìm kiếm)
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết <span className="text-red-500">*</span></label>
                <Editor
                  apiKey='oducrvb3a7ndeljpciy4zm29ohdf7ynkgw0rfwm1ezlu44tq'
                  onInit={(evt, editor) => editorRef.current = editor}
                  initialValue={description}
                  onEditorChange={(newValue, editor) => setDescription(newValue)}
                  init={{
                    height: 400,
                    menubar: 'file edit view insert format tools table help',
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'help', 'wordcount',
                      'imagetools'
                    ],
                    toolbar: 'undo redo | formatselect | ' +
                      'bold italic underline | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                      'image link | table | code',
                    automatic_uploads: true,
                    images_reuse_filename: true,
                    images_upload_handler: function (blobInfo, progress) {
                      return new Promise((resolve, reject) => {
                        const file = new File([blobInfo.blob()], blobInfo.filename());
                        uploadFile(file, 'job-descriptions', (p) => {
                          progress(p);
                        })
                          .then(url => {
                            resolve(url);
                          })
                          .catch(err => {
                            reject('Upload thất bại: ' + err.message);
                          });
                      });
                    },
                    paste_data_images: true,
                    file_picker_types: 'image',
                    image_title: true,
                    image_caption: true,
                    font_formats:
                      'Arial=arial,helvetica,sans-serif;Courier New=courier new,courier;' +
                      'Georgia=georgia,palatino;Tahoma=tahoma,arial,helvetica,sans-serif;' +
                      'Times New Roman=times new roman,times;Verdana=verdana,geneva;',
                    fontsize_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',
                    file_picker_callback: function (callback, value, meta) {
                      if (meta.filetype === 'image') {
                        const input = document.createElement('input');
                        input.setAttribute('type', 'file');
                        input.setAttribute('accept', 'image/*');

                        input.onchange = function () {
                          if (input.files?.[0]) {
                            const file = input.files[0];
                            const uploadingText = `Đang tải lên ${file.name}...`;
                            callback(uploadingText, { title: file.name });
                            uploadFile(file, 'job-descriptions', () => { })
                              .then(url => {
                                callback(url, { title: file.name });
                              })
                              .catch(err => {
                                console.error('Lỗi upload ảnh:', err);
                                callback('', { title: 'Upload thất bại' });
                              });
                          }
                        };
                        input.click();
                      }
                    }
                  }}
                />
                {!description && <p className="text-xs text-red-500 mt-1">Mô tả không được để trống.</p>} 
              </div>
            </div>

            <div className="flex justify-end items-center p-5 border-t border-gray-200 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 mr-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isLoading}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (dataInit?._id ? 'Lưu thay đổi' : 'Tạo mới')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobModal;