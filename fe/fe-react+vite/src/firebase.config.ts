import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAPJeLZUENHaeRLUU254VWcA0i36XGMsQc",
  authDomain: "itsmarthire-774c4.firebaseapp.com",
  projectId: "itsmarthire-774c4",
  storageBucket: "itsmarthire-774c4.firebasestorage.app",
  messagingSenderId: "572915404823",
  appId: "1:572915404823:web:bdff943dbda0f9bb77cc52",
  measurementId: "G-041WLYZ2P2"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export { storage, analytics, messaging };