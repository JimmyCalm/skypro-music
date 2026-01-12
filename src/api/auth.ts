import { api } from './axios';
import {
  AuthResponse,
  SignUpResponse,
  TokenResponse,
  RefreshTokenResponse,
  ApiError,
  isApiError,
} from '@/sharedTypes/types';

interface ApiErrorResponse {
  response?: {
    status: number;
    data?: {
      message?: string;
      detail?: string;
    };
  };
  request?: unknown;
}

async function handleApiError(error: unknown): Promise<ApiError> {
  const err = error as ApiErrorResponse;

  if (err.response) {
    const status = err.response.status;
    const data = err.response.data;

    switch (status) {
      case 400:
        return {
          message: data?.message || data?.detail || 'Некорректный запрос',
          status: 400,
        };
      case 401:
        return {
          message: data?.message || data?.detail || 'Неверный email или пароль',
          status: 401,
        };
      case 403:
        return {
          message:
            data?.message || data?.detail || 'Пользователь уже существует',
          status: 403,
        };
      case 412:
        return {
          message:
            data?.message || data?.detail || 'Требуется повторная авторизация',
          status: 412,
        };
      case 500:
        return {
          message: data?.message || data?.detail || 'Ошибка сервера',
          status: 500,
        };
      default:
        return {
          message: data?.message || data?.detail || `Ошибка ${status}`,
          status,
        };
    }
  } else if (err.request) {
    return { message: 'Ошибка сети. Проверьте подключение к интернету.' };
  } else if (error instanceof Error) {
    return { message: error.message };
  } else {
    return { message: 'Произошла ошибка' };
  }
}

export async function signUp(
  email: string,
  password: string,
  username: string,
): Promise<SignUpResponse | ApiError> {
  try {
    const response = await api.post('/user/signup/', {
      email,
      password,
      username,
    });
    return response.data as SignUpResponse;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<AuthResponse | ApiError> {
  try {
    const response = await api.post('/user/login/', {
      email,
      password,
    });

    // Сохраняем данные пользователя и токены
    if (typeof window !== 'string') {
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data));

      // Вызываем событие для инициализации приложения
      window.dispatchEvent(new CustomEvent('user-logged-in'));
    }

    return response.data as AuthResponse;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function getTokens(
  email: string,
  password: string,
): Promise<TokenResponse | ApiError> {
  try {
    const response = await api.post('/user/token/', {
      email,
      password,
    });

    return response.data as TokenResponse;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function refreshToken(
  refreshToken: string,
): Promise<RefreshTokenResponse | ApiError> {
  try {
    const response = await api.post('/user/token/refresh/', {
      refresh: refreshToken,
    });

    return response.data as RefreshTokenResponse;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function logout(): Promise<{ success: boolean }> {
  if (typeof window !== 'string') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
  return { success: true };
}

export { isApiError };
