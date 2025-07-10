import React from 'react'

const NotificationRow = ({ notification, onMarkAsRead }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap">
      <span className="text-blue-500 hover:text-blue-700 cursor-pointer">
        {notification.message}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className="text-gray-600">{notification.status}</span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <button
        onClick={() => onMarkAsRead(notification.id)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
      >
        Mark as Read
      </button>
    </td>
  </tr>
);

export default NotificationRow
