import React, { useState, useEffect, useRef } from 'react';
import { ICompany, ISkill } from '@/types/backend';
import { callCreateCompany, callUpdateCompany } from '@/services/company.service';
import { toast } from 'react-toastify';
import { XMarkIcon, ArrowUpTrayIcon, PhotoIcon, MapPinIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Editor } from '@tinymce/tinymce-react';
import { uploadFile } from '@/services/storage.service';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataInit: ICompany | null;
  refetch: () => void;
  listSkills: ISkill[];
}

const CompanyModal: React.FC<CompanyModalProps> = ({ isOpen, onClose, dataInit, refetch, listSkills }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [fetchedLatitude, setFetchedLatitude] = useState<number | null>(null);
  const [fetchedLongitude, setFetchedLongitude] = useState<number | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [specializationDescription, setSpecializationDescription] = useState('');
  const [companyModel, setCompanyModel] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [country, setCountry] = useState('');
  const [workingTime, setWorkingTime] = useState('');

  const companyModelOptions = ["Product", "Outsourcing", "Hybrid", "Khác"];
  const countryOptions = ["Việt Nam", "Hoa Kỳ", "Nhật Bản", "Singapore", "Úc", "Châu Âu", "Khác"];

  useEffect(() => {
    if (dataInit) {
      setName(dataInit.name || '');
      setAddress(dataInit.address || '');
      setFetchedLatitude(dataInit.latitude ?? null);
      setFetchedLongitude(dataInit.longitude ?? null);
      setEditorContent(dataInit.description || '');
      setLogoUrl(dataInit.logo || '');
      setPreviewUrl(dataInit.logo || null);
      setSelectedFile(null);
      setSelectedSkills(Array.isArray(dataInit.skills) ? dataInit.skills.map(skill => (typeof skill === 'object' ? skill._id! : skill)) : []);
      setSpecializationDescription(dataInit.specializationDescription || '');
      setCompanyModel(dataInit.companyModel || '');
      setIndustry(dataInit.industry || '');
      setCompanySize(dataInit.companySize || '');
      setCountry(dataInit.country || '');
      setWorkingTime(dataInit.workingTime || '');
    } else {
      setName('');
      setAddress('');
      setFetchedLatitude(null);
      setFetchedLongitude(null);
      setEditorContent('');
      setLogoUrl('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setSelectedSkills([]);
      setSpecializationDescription('');
      setCompanyModel('');
      setIndustry('');
      setCompanySize('');
      setCountry('');
      setWorkingTime('');
      setIsFetchingLocation(false);
    }
    setIsUploading(false);
    setUploadProgress(0);
  }, [dataInit, isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setLogoUrl('');
    } else {
      setSelectedFile(null);
      setPreviewUrl(dataInit?.logo || null);
    }
  };

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt của bạn không hỗ trợ lấy vị trí.");
      return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFetchedLatitude(latitude);
        setFetchedLongitude(longitude);
        toast.success("Lấy vị trí hiện tại thành công!");
        setIsFetchingLocation(false);
      },
      (error) => {
        let errorMessage = "Không thể lấy vị trí: ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Bạn đã từ chối quyền truy cập vị trí.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Thông tin vị trí không có sẵn.";
            break;
          case error.TIMEOUT:
            errorMessage += "Yêu cầu lấy vị trí đã hết hạn.";
            break;
          default:
            errorMessage += "Lỗi không xác định.";
            break;
        }
        toast.error(errorMessage);
        setIsFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

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

    if (!name || !address || !editorContent) {
      toast.error('Vui lòng điền đầy đủ tên, địa chỉ và mô tả.');
      setIsLoading(false);
      return;
    }
    if (fetchedLatitude === null || fetchedLongitude === null) {
      toast.error('Vui lòng lấy vị trí công ty.');
      setIsLoading(false);
      return;
    }

    let finalLogoUrl = logoUrl;

    if (selectedFile) {
      setIsUploading(true);
      setUploadProgress(0);
      try {
        finalLogoUrl = await uploadFile(
          selectedFile,
          'company-logos',
          (progress: number) => setUploadProgress(progress)
        );
        setLogoUrl(finalLogoUrl);
        toast.info(`Upload logo thành công!`);
      } catch (error: any) {
        console.error("Upload Error:", error);
        toast.error(`Lỗi upload logo: ${error}`);
        setIsUploading(false);
        setIsLoading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    if (!finalLogoUrl) {
      toast.error('Vui lòng cung cấp logo công ty.');
      setIsLoading(false);
      return;
    }

    const payload: Partial<ICompany> = {
      name,
      address,
      description: editorContent,
      logo: finalLogoUrl,
      latitude: fetchedLatitude,
      longitude: fetchedLongitude,
      skills: selectedSkills,
      specializationDescription,
      companyModel,
      industry,
      companySize,
      country,
      workingTime,
    };

    try {
      if (dataInit?._id) {
        const res = await callUpdateCompany(dataInit._id, payload);
        if (res && res.data) {
          toast.success('Cập nhật công ty thành công!');
          refetch();
          onClose();
        } else {
          toast.error(res.message || 'Có lỗi xảy ra khi cập nhật.');
        }
      } else {
        const res = await callCreateCompany(payload);
        if (res && res.data) {
          toast.success('Thêm mới công ty thành công!');
          refetch();
          onClose();
        } else {
          toast.error(res.message || 'Có lỗi xảy ra khi thêm mới.');
        }
      }
    } catch (error: any) {
      console.error("Submit Company Error:", error);
      toast.error(error.message || 'Đã có lỗi xảy ra.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const isSubmitDisabled = isLoading || isUploading || fetchedLatitude === null || fetchedLongitude === null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {dataInit?._id ? 'Cập nhật Công ty' : 'Thêm mới Công ty'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="md:col-span-2">
              <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">Tên công ty</label>
              <input
                type="text"
                id="company-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="company-address" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
              <input
                type="text"
                id="company-address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
              />
            </div>
            <div className="md:col-span-2 border-t pt-4 mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Vị trí công ty (Tọa độ)</label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={handleFetchLocation}
                  disabled={isFetchingLocation || isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFetchingLocation ? (
                    <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  ) : (
                    <MapPinIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  )}
                  {isFetchingLocation ? 'Đang lấy vị trí...' : 'Lấy vị trí hiện tại'}
                </button>
                <div className="text-sm text-gray-600">
                  {fetchedLatitude !== null && fetchedLongitude !== null ? (
                    <span>
                      Lat: {fetchedLatitude.toFixed(6)}, Lon: {fetchedLongitude.toFixed(6)}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">Chưa có thông tin vị trí</span>
                  )}
                </div>
              </div>
              {!isFetchingLocation && fetchedLatitude === null && fetchedLongitude === null && <p className="mt-2 text-xs text-red-600">Vị trí là bắt buộc. Vui lòng nhấn nút để lấy vị trí.</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo công ty</label>
              <div className="mt-1 flex items-center space-x-4">
                <span className="inline-block h-20 w-20 rounded-md overflow-hidden bg-gray-100 border border-gray-300 flex items-center justify-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Logo preview" className="h-full w-full object-contain" />
                  ) : (
                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isUploading}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowUpTrayIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                  <span>{selectedFile ? 'Thay đổi logo' : 'Chọn logo'}</span>
                  <input
                    ref={fileInputRef}
                    id="logo-upload"
                    name="logo-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                    disabled={isLoading || isUploading}
                  />
                </button>
              </div>
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-500">Đã chọn: {selectedFile.name}</p>
              )}
              {isUploading && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              {!selectedFile && !logoUrl && <p className="mt-1 text-xs text-red-600">Logo là bắt buộc.</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <Editor
                apiKey="nxdd2bqfluksusq6r978zthgxs1fy7u37qyu343ew2r05qiq"
                value={editorContent}
                onEditorChange={(content) => setEditorContent(content)}
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
                      uploadFile(file, 'company-content', (p) => {
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
                          uploadFile(file, 'company-content', () => { })
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
                disabled={isLoading || isUploading}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Kỹ năng nổi bật</label>
              <select
                multiple
                id="company-skills"
                value={selectedSkills}
                onChange={handleSkillChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 h-32"
              >
                {listSkills.map(skill => (
                  <option key={skill._id} value={skill._id}>{skill.name}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Giữ Ctrl (hoặc Cmd trên Mac) để chọn nhiều kỹ năng.</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chuyên môn</label>
              <textarea
                id="company-specialization"
                rows={4}
                value={specializationDescription}
                onChange={(e) => setSpecializationDescription(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô hình công ty</label>
              <select
                id="company-model"
                value={companyModel}
                onChange={(e) => setCompanyModel(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
              >
                <option value="" disabled>-- Chọn mô hình --</option>
                {companyModelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lĩnh vực</label>
              <input
                type="text"
                id="company-industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quy mô</label>
              <input
                type="text"
                id="company-size"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian làm việc</label>
              <input
                type="text"
                id="company-working-time"
                value={workingTime}
                onChange={(e) => setWorkingTime(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quốc gia</label>
              <select
                id="company-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
              >
                <option value="" disabled>-- Chọn quốc gia --</option>
                {countryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-5 border-t flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isUploading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="min-w-[100px] px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                isUploading ? `Đang tải lên (${uploadProgress.toFixed(0)}%)...` : 'Đang lưu...'
              ) : (
                dataInit?._id ? 'Cập nhật' : 'Thêm mới'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyModal; 