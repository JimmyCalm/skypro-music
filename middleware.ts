// middleware.ts (в корне проекта)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Пути, которые требуют авторизации
  const protectedPaths = ['/favorites', '/profile'];
  const { pathname } = request.nextUrl;

  // Проверяем, защищен ли путь
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path),
  );

  if (isProtectedPath) {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      // Перенаправляем на страницу входа
      const url = new URL('/signin', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // TODO: Проверять валидность токена через API
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
