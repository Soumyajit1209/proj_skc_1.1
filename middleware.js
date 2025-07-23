
import { NextResponse } from 'next/server';

// Helper function to decode JWT token
function decodeJWT(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding JWT in middleware:', error);
    return null;
  }
}

// Helper function to check if token is expired
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

  // If accessing login page
  if (pathname === '/login') {
    // If user has valid token, redirect to home
    if (token && !isTokenExpired(token)) {
      console.log('Middleware: Valid token found, redirecting to home');
      return NextResponse.redirect(new URL('/', request.url));
    }
    // If no token or expired token, allow access to login
    return NextResponse.next();
  }

  // For all other protected routes
  if (!token) {
    console.log('Middleware: No token found, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    console.log('Middleware: Token expired, clearing cookies and redirecting to login');
    
    // Create response with redirect
    const response = NextResponse.redirect(new URL('/login', request.url));
    
    // Clear the expired cookies
    response.cookies.set('token', '', {
      path: '/',
      expires: new Date(0)
    });
    response.cookies.set('role', '', {
      path: '/',
      expires: new Date(0)
    });
    
    return response;
  }

  console.log('Middleware: Valid token, allowing access');
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};