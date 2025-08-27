"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';

const AuthGuard = ({ children }) => {
  const { user, loading, isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const routePermissions = {
    '/': { roles: ['admin', 'superadmin'], redirect: '/login' },
    '/superadmin': { roles: ['superadmin'], redirect: '/unauthorized' },
    '/admin': { roles: ['admin'], redirect: '/unauthorized' },
    '/employees': { roles: ['admin', 'superadmin'], redirect: '/unauthorized' },
    '/attendance': { roles: ['admin', 'superadmin'], redirect: '/unauthorized' },
    '/leave': { roles: ['admin', 'superadmin'], redirect: '/unauthorized' },
    '/activity-report': { roles: ['admin', 'superadmin'], redirect: '/unauthorized' },
    '/profile': { roles: ['admin', 'superadmin'], redirect: '/unauthorized' },
    '/login': { roles: [], redirect: null },
    '/unauthorized': { roles: [], redirect: null }
  };

  useEffect(() => {
    console.log('AuthGuard: Checking route', { pathname, user, loading });
    
    if (loading) return;

    const currentRoute = routePermissions[pathname] || { roles: ['admin', 'superadmin'], redirect: '/login' };
    const requiredRoles = currentRoute.roles;
    const redirectTo = currentRoute.redirect;

    if (!user && pathname !== '/login' && pathname !== '/unauthorized') {
      console.log('AuthGuard: No user, redirecting to /login');
      router.push('/login');
      return;
    }

    if (user && pathname === '/login') {
      console.log('AuthGuard: User logged in, redirecting from /login');
      if (user.role === 'superadmin') {
        router.push('/superadmin');
      } else if (user.role === 'admin') {
        router.push('/');
      }
      return;
    }

    if (user && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      console.log('AuthGuard: Role mismatch, redirecting to', redirectTo);
      router.push(redirectTo || '/unauthorized');
      return;
    }

    if (user && pathname === '/' && user.role === 'superadmin') {
      console.log('AuthGuard: Superadmin on root, redirecting to /superadmin');
      router.push('/superadmin');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && pathname !== '/login' && pathname !== '/unauthorized') {
    return null;
  }

  if (user && pathname === '/login') {
    return null;
  }

  if (pathname === '/unauthorized') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <div className="space-y-2">
            <button
              onClick={() => router.back()}
              className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => {
                if (user?.role === 'superadmin') {
                  router.push('/superadmin');
                } else if (user?.role === 'admin') {
                  router.push('/');
                } else {
                  router.push('/login');
                }
              }}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const shouldShowLayout = user && user.role === 'admin' && pathname !== '/login' && pathname !== '/unauthorized';

  if (shouldShowLayout) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen">
        <Sidebar
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          className="md:block hidden"
        />
        <div className="flex flex-col flex-1">
          <Header toggleSidebar={toggleSidebar} />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return children;
};

export default AuthGuard;