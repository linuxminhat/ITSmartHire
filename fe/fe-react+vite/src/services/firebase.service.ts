import { messaging } from '@/firebase.config';
import { getToken, onMessage } from 'firebase/messaging';
import axios from '@/config/axios-customize';


const VAPID_KEY = 'BKiqKllMZuJ-bNSIiHZdHU9tXTsKPx-_rnNmrgrmpZ-OWJVQzndlW7x4yEAVefF79VBOtQppenE_2rlOSzuyq44';

export const requestNotificationPermission = async () => {
    try {
        if (!('Notification' in window)) {
            console.log('Trình duyệt này không hỗ trợ thông báo.');
            return null;
        }
        const permission = await Notification.requestPermission();

        if (permission !== 'granted') {
            console.log('Quyền thông báo bị từ chối.');
            return null;
        }

        const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });

        if (currentToken) {
            await registerDeviceToken(currentToken);
            return currentToken;
        } else {
            console.log('Không thể lấy token. Yêu cầu quyền thông báo lại.');
            return null;
        }
    } catch (error) {
        console.error('Lỗi khi yêu cầu quyền thông báo:', error);
        return null;
    }
};

export const registerDeviceToken = async (token: string) => {
    try {
        await axios.post('/api/v1/notifications/register-device', { token });
        console.log('Đăng ký token thành công');
    } catch (error) {
        console.error('Lỗi khi đăng ký token:', error);
    }
};

export const setupForegroundNotifications = (callback: (payload: any) => void) => {
    return onMessage(messaging, (payload) => {
        console.log('Nhận thông báo khi ứng dụng đang mở:', payload);
        callback(payload);
    });
}; 