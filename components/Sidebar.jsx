"use client"
import React, { useState } from 'react'
import { Bell, Home, Users, Shield, FileText, CreditCard, LogOut, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [expandedItem, setExpandedItem] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', hasSubmenu: false },
    { 
      icon: Users, 
      label: 'Employee Location', 
      hasSubmenu: true,
      subItems: ['View Employees', 'Add Employee', 'Locations']
    },
    { 
      icon: Shield, 
      label: 'Security & Access', 
      hasSubmenu: true,
      subItems: ['Create Admin User', 'Access Permission', 'Security Settings']
    },
    { 
      icon: FileText, 
      label: 'Master', 
      hasSubmenu: true,
      subItems: ['Employee Master', 'Distributor Master', 'Distributor Market' , ' Relationship' , 'Product Master', 'Customer Master', 'Vendor Master' , ' Gift Master' , ' Hsn Sac Master' ,' Sales Target Management']
    },
    { 
      icon: FileText, 
      label: 'Reports', 
      hasSubmenu: true,
      subItems: ['Distributor Daily Stock', 'Primary Order', 'Secondary Order', ' Distributor Return' , ' Todays Order & Return' , 'Distributor Ledger' , 'Invoice Report' , 'Pending Order Product' , ' Pendeing Order Gift' , 'Marketing Yearly Report', 'Distributor Yearly Report']
    },
    { 
      icon: CreditCard, 
      label: 'Payment', 
      hasSubmenu: true,
      subItems: ['Payment History', 'Pending Payments', 'Payment Methods']
    },
    { icon: LogOut, label: 'Logout', hasSubmenu: false }
  ];

  const toggleSubmenu = (itemLabel) => {
    setExpandedItem(prev => (prev === itemLabel ? null : itemLabel));
  };

  const handleItemClick = (item) => {
    setActiveItem(item.label);
    if (item.hasSubmenu) {
      toggleSubmenu(item.label);
    }
  };

  const handleCollapse = () => setCollapsed((prev) => !prev);

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen ${collapsed ? 'w-16' : 'w-64'} bg-blue-500 transform transition-all duration-300 ease-in-out z-50 overflow-y-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:z-auto`}>
        {/* Collapse Button */}
        <div className="flex items-center justify-between p-3 border-b border-blue-500">
          <button
            onClick={handleCollapse}
            className="text-white p-1 hover:bg-blue-600 rounded transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          {!collapsed && (
            <h2 className="text-white font-bold text-lg">Hindusthan Chemicals</h2>
          )}
          {!collapsed && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-white p-1 hover:bg-blue-500 rounded"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* User Profile */}
        {!collapsed && (
          <div className="p-4 border-b border-blue-500">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">Admin</h3>
                <p className="text-blue-200 text-sm">Administrator</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-2">
          {menuItems.map((item) => (
            <div key={item.label} className="mb-1">
              <button
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeItem === item.label 
                    ? 'bg-blue-700 text-white' 
                    : 'text-blue-100 hover:bg-blue-400'
                } ${collapsed ? 'justify-center px-0' : ''}`}
              >
                <item.icon size={18} />
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {item.hasSubmenu && !collapsed && (
                  <span className={`text-xs transition-transform ${
                    expandedItem === item.label ? 'rotate-90' : ''
                  }`}>
                    ▶
                  </span>
                )}
              </button>
              {/* Submenu */}
              {item.hasSubmenu && expandedItem === item.label && !collapsed && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem}
                      onClick={() => setActiveItem(subItem)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        activeItem === subItem
                          ? 'bg-blue-800 text-white'
                          : 'text-blue-200 hover:bg-blue-500 hover:text-white'
                      }`}
                    >
                      {subItem}
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

export default Sidebar
