import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAPJeLZUENHaeRLUU254VWcA0i36XGMsQc",
  authDomain: "itsmarthire-774c4.firebaseapp.com",
  projectId: "itsmarthire-774c4",
  storageBucket: "itsmarthire-774c4.firebasestorage.app",
  // storageBucket: "itsmarthire-774c4.appspot.com",
  messagingSenderId: "572915404823",
  appId: "1:572915404823:web:bdff943dbda0f9bb77cc52",
  measurementId: "G-041WLYZ2P2"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export { storage, analytics, messaging, app };

// import { initializeApp } from "firebase/app";
// import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";
// import { getMessaging } from "firebase/messaging";

// // TODO: Thay thế bằng cấu hình Firebase project của bạn
// // Bạn có thể lấy các giá trị này từ Firebase Console:
// // Project settings > General > Your apps > Web app > SDK setup and configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDSSPBo1xMEqjPlsmscoXvAPat2rNR1s-M",
//   authDomain: "zalo-app-66612.firebaseapp.com",
//   databaseURL: "https://zalo-app-66612-default-rtdb.firebaseio.com",
//   projectId: "zalo-app-66612",
//   storageBucket: "zalo-app-66612.appspot.com",
//   messagingSenderId: "1075698897426",
//   appId: "1:1075698897426:web:4e8536e451ed77a0767ecb",
//   measurementId: "G-3C42XLGJ3E"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Cloud Storage and get a reference to the service
// const storage = getStorage(app);
// const analytics = getAnalytics(app);
// const messaging = getMessaging(app);

// export { storage, analytics, messaging }; 