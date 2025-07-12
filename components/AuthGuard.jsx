
"use client"
import { useAuth } from '../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from './Sidebar';

const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== '/login') {
        router.push('/login');
      } else if (user && pathname === '/login') {
        router.push('/');
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return null;
  }

  if (!user && pathname !== '/login') {
    return null;
  }

  if (user && pathname === '/login') {
    return null;
  }

  return (
    <div className="flex">
      {user && pathname !== '/login' && !document.querySelector('.sidebar-container') && (
        <Sidebar isOpen={true} toggleSidebar={() => {}} className="sidebar-container" />
      )}
      <main className={user && pathname !== '/login' ? 'flex-1' : 'w-full'}>
        {children}
      </main>
    </div>
  );
};

export default AuthGuard;


// "use client"
// import { useAuth } from '../contexts/AuthContext';
// import { useRouter, usePathname } from 'next/navigation';
// import { useEffect } from 'react';

// const AuthGuard = ({ children }) => {
//   const { user, loading } = useAuth();
//   const router = useRouter();
//   const pathname = usePathname();

//   useEffect(() => {
//     if (!loading) {
//       if (!user && pathname !== '/login') {
//         router.push('/login');
//       } else if (user && pathname === '/login') {
//         router.push('/');
//       }
//     }
//   }, [user, loading, router, pathname]);

//   // If loading, show nothing or a minimal loading indicator to avoid FOUC
//   if (loading) {
//     return null; // Prevent rendering children during loading
//   }

//   // If not authenticated and trying to access a protected route, return null (redirect handled by useEffect)
//   if (!user && pathname !== '/login') {
//     return null;
//   }

//   // If authenticated and on login page, return null (redirect handled by useEffect)
//   if (user && pathname === '/login') {
//     return null;
//   }

//   return children;
// };

// export default AuthGuard;

