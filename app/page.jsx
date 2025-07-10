"use client"
import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import NotificationsTable from '@/components/NotificationsTable';


const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: 'New payment: PAY-20250707-12',
      status: 'Unread'
    },
    {
      id: 2,
      message: 'New order: PO-20250707-10',
      status: 'Unread'
    },
    {
      id: 3,
      message: 'New payment: PAY-20250707-9',
      status: 'Unread'
    }
  ]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id 
        ? { ...notification, status: 'Read' }
        : notification
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 p-3.5">
          <div className="max-w-7xl mx-auto">
            <NotificationsTable 
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;