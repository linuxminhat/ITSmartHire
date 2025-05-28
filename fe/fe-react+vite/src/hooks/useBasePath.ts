// src/hooks/useBasePath.ts
import { useAuth } from '@/contexts/AuthContext';

export default function useBasePath() {
    const { user } = useAuth();
    const role = user?.role?.name;
    return role === 'ADMIN' ? '/admin' : '/hr';
}
