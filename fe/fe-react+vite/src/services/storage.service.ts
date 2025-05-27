import { storage } from "@/firebase.config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid'; // Cần cài đặt uuid: npm install uuid @types/uuid

/**
 * Upload file lên Firebase Storage
 * @param file File cần upload
 * @param path Thư mục lưu trữ trên Firebase (ví dụ: 'company-logos')
 * @param onProgress Callback để theo dõi tiến trình upload (optional)
 * @returns Promise chứa URL của file đã upload
 */
export const uploadFile = (
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject("No file provided for upload.");
      return;
    }

    // Tạo tên file duy nhất
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const storagePath = `${path}/${uniqueFileName}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // console.log("Upload is " + progress + "% done");
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        // Handle unsuccessful uploads
        console.error("Firebase Upload Error:", error);
        let errorMessage = "Could not upload file.";
        switch (error.code) {
          case 'storage/unauthorized':
            errorMessage = "User doesn't have permission to access the object";
            break;
          case 'storage/canceled':
            errorMessage = "User canceled the upload";
            break;
          case 'storage/unknown':
            errorMessage = "Unknown error occurred, inspect error.serverResponse";
            break;
        }
        reject(errorMessage);
      },
      () => {
        // Handle successful uploads on complete
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          //   console.log("File available at", downloadURL);
          resolve(downloadURL);
        }).catch(reject); // Thêm catch ở đây nếu getDownloadURL lỗi
      }
    );
  });
}; 