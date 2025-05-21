import { readFileSync } from 'fs';
import { initializeApp, cert, App } from 'firebase-admin/app';
import { Provider } from '@nestjs/common';

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN';

export const FirebaseAdminProvider: Provider<App> = {
    provide: FIREBASE_ADMIN,
    useFactory() {
        // Đường tuyệt đối tới file JSON
        const serviceAccountPath = process.cwd() + '/config/service-account.json';
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

        return initializeApp({
            credential: cert(serviceAccount),
        });
    },
};
