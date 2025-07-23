
"use client"
import { useAuth } from '../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useState } from 'react';

const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle route protection - simplified to avoid loops
  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== '/login') {
        router.push('/login');
      } else if (user && pathname === '/login') {
        router.push('/');
      }
    }
  }, [user, loading, pathname, router]);

  // Show loading spinner while checking auth status
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

  // Don't render anything while redirecting
  if (!user && pathname !== '/login') {
    return null;
  }

  if (user && pathname === '/login') {
    return null;
  }

return (
  <div className="flex flex-col md:flex-row min-h-screen">
    {user && pathname !== '/login' && (
      <>
        <Sidebar
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          className="md:block hidden" // hide sidebar on small screens
        />
      </>
    )}

    <div className="flex flex-col flex-1">
      {user && pathname !== '/login' && (
        <Header toggleSidebar={toggleSidebar} />
      )}
      <main className="flex-1">
        {children}
      </main>
    </div>
  </div>
);


};

export default AuthGuard;
