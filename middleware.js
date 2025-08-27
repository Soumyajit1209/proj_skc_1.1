import { NextResponse } from 'next/server';

function decodeJWT(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding JWT in middleware:', error);
    return null;
  }
}

function isTokenExpired(token) {
  if (!token) return true;

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  console.log('Middleware: Checking token for path', pathname);

  // Allow access to login and forgot-password
  if (pathname === '/login' || pathname === '/forgot-password') {
    if (token && !isTokenExpired(token)) {
      console.log('Middleware: Valid token found, redirecting to appropriate dashboard');
      const role = request.cookies.get('role')?.value;
      if (role === 'superadmin') {
        return NextResponse.redirect(new URL('/superadmin', request.url));
      } else if (role === 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    return NextResponse.next();
  }

  // Protect superadmin routes and root (/)
  if (pathname === '/' || pathname.startsWith('/superadmin')) {
    if (!token || isTokenExpired(token)) {
      console.log('Middleware: No valid token, redirecting to login');
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.set('token', '', { path: '/', expires: new Date(0) });
      response.cookies.set('role', '', { path: '/', expires: new Date(0) });
      response.cookies.set('user_data', '', { path: '/', expires: new Date(0) });
      return response;
    }

    const role = request.cookies.get('role')?.value;

    // Restrict /superadmin routes to superadmins
    if (pathname.startsWith('/superadmin') && role !== 'superadmin') {
      console.log('Middleware: Access denied to superadmin route');
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Allow / for admins and superadmins
    if (pathname === '/' && role !== 'admin' && role !== 'superadmin') {
      console.log('Middleware: Access denied to root route');
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  console.log('Middleware: Allowing access');
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};