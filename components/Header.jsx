import React from 'react'
import { Bell, Home, Users, Shield, FileText, CreditCard, LogOut, Menu, X } from 'lucide-react';

const Header = ({ toggleSidebar }) => (
  <header className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 rounded-md hover:bg-gray-100"
      >
        <Menu size={20} />
      </button>
      
    </div>
    <div className="flex items-center space-x-4">
      <Bell size={20} className="text-gray-600" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        <span className="text-sm font-medium">Admin</span>
      </div>
    </div>
  </header>
);

export default Header
