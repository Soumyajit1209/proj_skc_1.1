import React from 'react'
import NotificationRow from './NotificationRow';


const NotificationsTable = ({ notifications, onMarkAsRead }) => (
  <div className="bg-white rounded-b-lg shadow-xs border border-gray-200 w-full">
    <div className="px-4 sm:px-6 py-4 border-b">
      <h2 className="text-base sm:text-lg font-semibold text-gray-800">Recent Notifications</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
        <thead className="bg-blue-400">
          <tr>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider ">
              Notification
            </th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
              Status
            </th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {notifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
            />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default NotificationsTable
