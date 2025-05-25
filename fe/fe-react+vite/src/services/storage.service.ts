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

          resolve(downloadURL);
        }).catch(reject); // Thêm catch ở đây nếu getDownloadURL lỗi
      }
    );
  });
};
// import { storage } from '@/firebase.config'
// import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
// import { v4 as uuidv4 } from 'uuid'
// import { getAuth } from 'firebase/auth'

// /**
//  * Upload file lên Firebase Storage.
//  * @param file       File cần upload
//  * @param path       Thư mục lưu trữ (vd: 'company-logos')
//  * @param onProgress Callback theo dõi tiến trình (0-100)
//  * @returns          Promise<string> – URL download
//  */
// export const uploadFile = async (
//   file: File,
//   path: string,
//   onProgress?: (progress: number) => void
// ): Promise<string> => {
//   if (!file) throw new Error('No file provided for upload.')

//   /* 1️⃣ BẮT BUỘC ĐÃ ĐĂNG NHẬP */
//   const auth = getAuth()
//   if (!auth.currentUser) {
//     throw new Error('Bạn cần đăng nhập trước khi upload file.')
//   }

//   /* 2️⃣ TẠO TÊN FILE & THƯ MỤC LƯU */
//   const ext = file.name.split('.').pop() || 'bin'
//   const storageRef = ref(storage, `${path}/${uuidv4()}.${ext}`)

//   /* 3️⃣ THỰC HIỆN UPLOAD */
//   const uploadTask = uploadBytesResumable(storageRef, file)

//   return new Promise((resolve, reject) => {
//     uploadTask.on(
//       'state_changed',
//       snap => {
//         const pct = (snap.bytesTransferred / snap.totalBytes) * 100
//         onProgress?.(pct)
//       },
//       error => {
//         /* 4️⃣ XỬ LÝ LỖI */
//         console.error('Firebase Upload Error:', error)
//         const map: Record<string, string> = {
//           'storage/unauthorized': 'Bạn không có quyền ghi vào thư mục này',
//           'storage/canceled': 'Bạn đã hủy upload',
//           'storage/unknown': 'Lỗi không xác định từ Firebase Storage',
//         }
//         reject(map[error.code] || 'Upload failed')
//       },
//       () => {
//         /* 5️⃣ LẤY URL SAU KHI THÀNH CÔNG */
//         getDownloadURL(uploadTask.snapshot.ref)
//           .then(resolve)
//           .catch(reject)
//       }
//     )
//   })
// }