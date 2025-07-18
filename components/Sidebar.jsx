
"use client"
import React, { useState } from 'react';
import { Bell, Home, Users, Shield, FileText, CreditCard, LogOut, Menu, X, ChevronLeft, ChevronRight, Key } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [expandedItem, setExpandedItem] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Dashboard', hasSubmenu: false, path: '/' },
    { icon: FileText, label: 'Master', hasSubmenu: true, subItems: [{ label: 'Employee', path: '/employee' }] },
    { icon: FileText, label: 'Attendance Report', hasSubmenu: false, path: '/attendance' },
    { icon: FileText, label: 'Leave Report', hasSubmenu: false, path: '/leave' },
    {icon: FileText, label: 'Activity Report', hasSubmenu: false, path:  '/activity-report' },
    { icon: Key, label: 'Change Password', hasSubmenu: false, path: '/change-password' },
    { icon: LogOut, label: 'Logout', hasSubmenu: false, action: 'logout' }

    
  ];

  const toggleSubmenu = (itemLabel) => {
    setExpandedItem(prev => (prev === itemLabel ? null : itemLabel));
  };

  const handleItemClick = (item) => {
    if (item.hasSubmenu) {
      toggleSubmenu(item.label);
    } else if (item.action === 'logout') {
      if (confirm('Are you sure you want to logout?')) {
        logout();
        console.log('Logout triggered'); // Debug log
      }
    } else if (item.path) {
      router.push(item.path);
      if (window.innerWidth < 1024) {
        toggleSidebar();
      }
    }
  };

  const handleSubItemClick = (subItem) => {
    if (subItem.path) {
      router.push(subItem.path);
      if (window.innerWidth < 1024) {
        toggleSidebar();
      }
    }
  };

  const isActive = (path) => pathname === path;
  const isParentActive = (item) => item.path ? pathname === item.path : item.subItems?.some(subItem => pathname === subItem.path) || false;
  const handleCollapse = () => setCollapsed(prev => !prev);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={toggleSidebar} />
      )}
      <div className={`fixed left-0 top-0 h-screen ${collapsed ? 'w-12 sm:w-16' : 'w-56 sm:w-64'} bg-blue-500 transform transition-all duration-300 ease-in-out z-50 overflow-y-auto custom-hide-scrollbar ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:z-auto sidebar-container`}>
        <div className="flex items-center justify-between p-2 sm:p-3 border-b border-blue-400 bg-white min-h-[60px] sm:min-h-[70px]">
          <button
            onClick={handleCollapse}
            className="text-blue-600 p-1 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} className="sm:w-5 sm:h-5" /> : <ChevronLeft size={16} className="sm:w-5 sm:h-5" />}
          </button>
          {!collapsed && (
            <div className="flex-1 flex justify-center px-2">
              <div className="relative w-full max-w-[200px] h-12 sm:h-14 md:h-16">
                <Image
                  src="/logo.png"
                  alt="SADANA Logo"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 640px) 150px, (max-width: 768px) 180px, 200px"
                />
              </div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-blue-600 p-1 hover:bg-blue-50 rounded flex-shrink-0"
            >
              <X size={16} className="sm:w-5 sm:h-5" />
            </button>
          )}
        </div>

        {!collapsed && (
          <div className="p-3 sm:p-4 border-b border-blue-400">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm sm:text-base">A</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-semibold text-sm sm:text-base truncate">Admin</h3>
                <p className="text-blue-200 text-xs sm:text-sm truncate">Administrator</p>
              </div>
            </div>
          </div>
        )}

        <nav className="p-1 sm:p-2">
          {menuItems.map((item) => (
            <div key={item.label} className="mb-1">
              <button
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 rounded-lg text-left transition-colors ${
                  isParentActive(item)
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-100 hover:bg-blue-400'
                } ${collapsed ? 'justify-center px-0' : ''}`}
              >
                <item.icon size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                {!collapsed && <span className="flex-1 text-sm sm:text-base truncate">{item.label}</span>}
                {item.hasSubmenu && !collapsed && (
                  <span className={`text-xs transition-transform flex-shrink-0 ${
                    expandedItem === item.label ? 'rotate-90' : ''
                  }`}>
                    ▶
                  </span>
                )}
              </button>
              {item.hasSubmenu && expandedItem === item.label && !collapsed && (
                <div className="ml-3 sm:ml-4 mt-1 space-y-1 text-white">
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.label}
                      onClick={() => handleItemClick(subItem)}
                      className={`w-full text-left px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors text-white truncate ${
                        isActive(subItem.path)
                          ? 'bg-blue-600 text-white'
                          : 'text-blue-200 hover:bg-blue-500 hover:text-white'
                      }`}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
