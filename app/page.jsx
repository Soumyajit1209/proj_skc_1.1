"use client"
import React, { useState } from 'react';
import LayoutWrapper from '@/components/LayoutWrapper';
import NotificationsTable from '@/components/NotificationsTable';

const Dashboard = () => {
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

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id 
        ? { ...notification, status: 'Read' }
        : notification
    ));
  };

  return (
    <LayoutWrapper 
      title="Dashboard" 
      subtitle="Welcome to your admin dashboard"
    >
      <NotificationsTable 
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
      />
    </LayoutWrapper>
  );
};

export default Dashboard;