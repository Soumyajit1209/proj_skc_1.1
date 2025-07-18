import React from 'react';
import { User, Eye, X } from 'lucide-react';

const AttendanceTable = ({ data, onView, onReject, getStatusColor, calculateWorkingHours }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="px-4 py-3 border-b">
      <h2 className="text-lg font-semibold text-gray-800">Daily Attendance Report</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-blue-400">
          <tr>
            {['Employee', 'Date', 'Check In', 'Check Out', 'Working Hours', 'Status', 'Actions'].map((header) => (
              <th key={header} className="px-4 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((record) => (
            <tr key={record.attendance_id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center bg-blue-500">
                    {record.profile_picture ? (
                      <img
                        src={record.profile_picture}
                        alt={`${record.full_name}'s profile`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={record.profile_picture ? 'hidden' : 'flex items-center justify-center h-full w-full'}>
                      <User size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="ml-2">
                    <div className="text-sm font-medium text-gray-900">{record.full_name}</div>
                    <div className="text-sm text-gray-500">ID: {record.emp_id}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{record.attendance_date}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{record.in_time || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{record.out_time || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{calculateWorkingHours(record.in_time, record.out_time)}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.in_status)}`}>
                  {record.in_status}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex space-x-2">
                  <button onClick={() => onView(record)} className="text-blue-600 hover:text-blue-800">
                    <Eye size={16} />
                  </button>
                  {record.in_status === 'APPROVED' && (
                    <button onClick={() => onReject(record)} className="text-red-600 hover:text-red-800">
                      <X size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AttendanceTable;