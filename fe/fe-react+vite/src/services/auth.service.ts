import { IBackendRes, IAccount, IUser, IGetAccount } from '@/types/backend';
import axios from '@/config/axios-customize';

/**
 *
Module Auth
 */
export const callRegister = (
  name: string,
  email: string,
  password: string,
  age: number,
  gender: string,
  address: string,
  role: string
) => {
    return axios.post<IBackendRes<IUser>>(
      '/api/v1/auth/register',
      { name, email, password, age, gender, address, role }
    )
}

export const callLogin = (username: string, password: string) => {
    return axios.post<IBackendRes<IAccount>>('/api/v1/auth/login', { username, password })
}

export const callFetchAccount = () => {
    return axios.get<IBackendRes<IGetAccount>>('/api/v1/auth/account')
}

export const callRefreshToken = () => {
    return axios.get<IBackendRes<IAccount>>('/api/v1/auth/refresh')
}

export const callLogout = () => {
    return axios.post<IBackendRes<string>>('/api/v1/auth/logout')
} 