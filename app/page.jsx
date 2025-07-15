"use client"
import React, { useState } from 'react';
import LayoutWrapper from '@/components/LayoutWrapper';
import NotificationsTable from '@/components/NotificationsTable';

const Dashboard = () => {
  const [notifications, setNotifications] = useState([
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