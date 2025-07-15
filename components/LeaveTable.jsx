import React from 'react'
import { User, Eye, Check, X } from 'lucide-react';
import { getStatusColor } from '@/utils/getStatusColor';
import { getLeaveTypeColor } from '@/utils/getLeaveTypeColor';

const LeaveTable = ({ filteredData, handleViewDetails, handleStatusChange }) => {
  // Function to format date without time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Leave Applications</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((leave) => (
              <tr key={leave.leave_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{leave.full_name}</div>
                      <div className="text-xs text-gray-500">ID: {leave.emp_id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getLeaveTypeColor(leave.leave_type)}`}>
                    {leave.leave_type}
                  </span>
                </td>
                <td className="px-3 py-2 text-sm text-gray-900">
                  <div className="font-medium">{formatDate(leave.start_date)}</div>
                  <div className="text-gray-500 text-xs">to {formatDate(leave.end_date)}</div>
                </td>
                <td className="px-3 py-2">
                  <div className="text-sm font-medium text-gray-900">{leave.total_days}</div>
                  <div className="text-xs text-gray-500">days</div>
                </td>
                <td className="px-3 py-2 text-sm text-gray-500">
                  {formatDate(leave.application_datetime)}
                </td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(leave.status)}`}>
                    {leave.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleViewDetails(leave)}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                      title="View Details"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                    {leave.status === 'PENDING' && (
                      <React.Fragment>
                        <button
                          onClick={() => handleStatusChange(leave.leave_id, 'APPROVED')}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 hover:border-green-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                          title="Accept"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Accept</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(leave.leave_id, 'REJECTED')}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                          title="Reject"
                        >
                          <X className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Reject</span>
                        </button>
                      </React.Fragment>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Mobile-friendly responsive message */}
      <div className="sm:hidden px-4 py-2 text-xs text-gray-500 border-t border-gray-200">
        <p>Scroll horizontally to view all columns</p>
      </div>
    </div>
  );
};

export default LeaveTable