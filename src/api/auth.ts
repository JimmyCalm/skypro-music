import {
  AuthResponse,
  SignUpResponse,
  TokenResponse,
  RefreshTokenResponse,
  ApiError,
  isApiError,
} from '@/sharedTypes/types';

const BASE_URL = 'https://webdev-music-003b5b991590.herokuapp.com';

// Универсальная функция для обработки ответов от API
async function handleResponse<T>(response: Response): Promise<T | ApiError> {
  try {
    const data = await response.json();

    if (!response.ok) {
      // Если сервер вернул структурированную ошибку
      if (typeof data === 'object' && data !== null) {
        if ('message' in data) {
          return { message: String(data.message) };
        }
        if ('detail' in data) {
          return { message: String(data.detail) };
        }
      }
      // Стандартные HTTP ошибки
      return { message: `Ошибка ${response.status}: ${response.statusText}` };
    }

    return data as T;
  } catch (error) {
    // Ошибка парсинга JSON
    return {
      message:
        'Ошибка при обработке ответа сервера. Проверьте подключение к интернету.',
    };
  }
}

/**
 * Регистрация нового пользователя
 */
export async function signUp(
  email: string,
  password: string,
  username: string,
): Promise<SignUpResponse | ApiError> {
  try {
    const response = await fetch(`${BASE_URL}/user/signup/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, username }),
      cache: 'no-store', // Не кешируем запросы авторизации
    });

    return handleResponse<SignUpResponse>(response);
  } catch (error) {
    // Ошибка сети
    return {
      message:
        error instanceof Error
          ? error.message
          : 'Ошибка сети. Проверьте подключение к интернету',
    };
  }
}

/**
 * Авторизация пользователя
 */
export async function signIn(
  email: string,
  password: string,
): Promise<AuthResponse | ApiError> {
  try {
    const response = await fetch(`${BASE_URL}/user/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    return handleResponse<AuthResponse>(response);
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : 'Ошибка сети. Проверьте подключение к интернету',
    };
  }
}

/**
 * Получение JWT токенов (Access и Refresh)
 */
export async function getTokens(
  email: string,
  password: string,
): Promise<TokenResponse | ApiError> {
  try {
    const response = await fetch(`${BASE_URL}/user/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    return handleResponse<TokenResponse>(response);
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : 'Ошибка получения токенов',
    };
  }
}

/**
 * Обновление Access токена с помощью Refresh токена
 */
export async function refreshToken(
  refreshToken: string,
): Promise<RefreshTokenResponse | ApiError> {
  try {
    const response = await fetch(`${BASE_URL}/user/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
      cache: 'no-store',
    });

    return handleResponse<RefreshTokenResponse>(response);
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : 'Ошибка обновления токена',
    };
  }
}

/**
 * Проверка валидности токена (опционально)
 */
export async function validateToken(
  accessToken: string,
): Promise<boolean | ApiError> {
  try {
    const response = await fetch(`${BASE_URL}/user/token/verify/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ token: accessToken }),
    });

    return response.ok;
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : 'Ошибка проверки токена',
    };
  }
}

/**
 * Выход из системы (опционально, если API поддерживает)
 */
export async function logout(
  refreshToken: string,
  accessToken: string,
): Promise<{ success: boolean } | ApiError> {
  try {
    const response = await fetch(`${BASE_URL}/user/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      return { message: 'Ошибка при выходе из системы' };
    }

    return { success: true };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : 'Ошибка сети',
    };
  }
}

// Экспортируем type guard для удобства использования
export { isApiError };
