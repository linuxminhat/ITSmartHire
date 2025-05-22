// import { readFileSync } from 'fs';
// import { initializeApp, cert, App } from 'firebase-admin/app';
// import { Provider } from '@nestjs/common';

// export const FIREBASE_ADMIN = 'FIREBASE_ADMIN';

// export const FirebaseAdminProvider: Provider<App> = {
//     provide: FIREBASE_ADMIN,
//     useFactory() {
//         // Đường tuyệt đối tới file JSON
//         const serviceAccountPath = process.cwd() + '/config/service-account.json';
//         const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

//         return initializeApp({
//             credential: cert(serviceAccount),
//         });
//     },
// };

// src/common/firebase-admin.provider.ts
import { readFileSync } from 'fs';
import { initializeApp, cert, App, getApps } from 'firebase-admin/app';
import { Provider } from '@nestjs/common';

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN';

export const FirebaseAdminProvider: Provider<App> = {
    provide: FIREBASE_ADMIN,
    useFactory() {
        /** Nếu app đã khởi tạo, trả lại app đầu tiên */
        if (getApps().length) {
            return getApps()[0];
        }

        // Chưa khởi tạo → đọc service-account và init
        const serviceAccountPath = process.cwd() + '/config/service-account.json';
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

        return initializeApp({
            credential: cert(serviceAccount),
        });
    },
};
