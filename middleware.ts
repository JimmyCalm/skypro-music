// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Получаем токен из cookies
  const accessToken = request.cookies.get('accessToken')?.value;

  // Защищенные маршруты
  const protectedRoutes = ['/favorites', '/profile'];

  // Проверяем, является ли текущий путь защищенным
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  // Если маршрут защищенный и нет токена, перенаправляем на страницу входа
  if (isProtectedRoute && !accessToken) {
    const signInUrl = new URL('/signin', request.url);
    // Добавляем returnUrl для возможности вернуться после авторизации
    signInUrl.searchParams.set('returnUrl', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Если пользователь уже авторизован и пытается зайти на страницы входа/регистрации,
  // перенаправляем на главную
  const authRoutes = ['/signin', '/signup'];
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
