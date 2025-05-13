import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAPJeLZUENHaeRLUU254VWcA0i36XGMsQc",
  authDomain: "itsmarthire-774c4.firebaseapp.com",
  projectId: "itsmarthire-774c4",
  storageBucket: "itsmarthire-774c4.firebasestorage.app",
  // storageBucket: "itsmarthire-774c4.appspot.com", // Sửa đúng tên bucket
  messagingSenderId: "572915404823",
  appId: "1:572915404823:web:bdff943dbda0f9bb77cc52",
  measurementId: "G-041WLYZ2P2"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Dịch vụ Firebase cần dùng
const storage = getStorage(app);
const analytics = getAnalytics(app);

// Export các dịch vụ bạn cần
export { storage, analytics };
