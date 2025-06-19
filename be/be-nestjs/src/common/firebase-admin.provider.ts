import { readFileSync } from 'fs';
import { initializeApp, cert, App, getApps } from 'firebase-admin/app';
import { Provider } from '@nestjs/common';

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN';

export const FirebaseAdminProvider: Provider<App> = {
    provide: FIREBASE_ADMIN,
    useFactory() {
        if (getApps().length) {
            return getApps()[0];
            //Đã khởi tạo Firebase Admin trước đó -> trả về mảng không rỗng. Provider trả về instance đầu tiên thay vì tạo mới tránh bug ! 
        }
        const serviceAccountPath = process.cwd() + '/config/service-account.json';
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

        return initializeApp({
            credential: cert(serviceAccount),
        });
    },
};
