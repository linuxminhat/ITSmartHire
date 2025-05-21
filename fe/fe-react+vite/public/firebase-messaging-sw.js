
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyAPJeLZUENHaeRLUU254VWcA0i36XGMsQc",
    authDomain: "itsmarthire-774c4.firebaseapp.com",
    projectId: "itsmarthire-774c4",
    storageBucket: "itsmarthire-774c4.firebasestorage.app",
    messagingSenderId: "572915404823",
    appId: "1:572915404823:web:bdff943dbda0f9bb77cc52",
    measurementId: "G-041WLYZ2P2"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
}); 