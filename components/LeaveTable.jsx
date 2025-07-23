import React, { useState } from 'react';
import { User, Eye, Check, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { getStatusColor } from '@/utils/getStatusColor';
import { getLeaveTypeColor } from '@/utils/getLeaveTypeColor';

const LeaveTable = ({ filteredData, handleViewDetails, handleStatusChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const searchedData = filteredData.filter((leave) =>
    leave.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    leave.emp_id.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedData = [...searchedData].sort((a, b) =>
    new Date(b.application_datetime) - new Date(a.application_datetime)
  );

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full min-h-0">
      <div className="px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Leave Applications</h2>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>
      <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-2 py-1 sm:px-3 sm:py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-2 py-1 sm:px-3 sm:py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
              <th className="px-2 py-1 sm:px-3 sm:py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-2 py-1 sm:px-3 sm:py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
              <th className="hidden sm:table-cell px-2 py-1 sm:px-3 sm:py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
              <th className="px-2 py-1 sm:px-3 sm:py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-2 py-1 sm:px-3 sm:py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((leave) => (
              <tr key={leave.leave_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-2 py-1 sm:px-3 sm:py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8">
                      <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-2 sm:ml-3">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">{leave.full_name}</div>
                      <div className="text-xs text-gray-500">ID: {leave.emp_id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-1 sm:px-3 sm:py-2 whitespace-nowrap">
                  <span className={'px-1.5 py-0.5 sm:px-2 sm:py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ' + getLeaveTypeColor(leave.leave_type)}>
                    {leave.leave_type}
                  </span>
                </td>
                <td className="px-2 py-1 sm:px-3 sm:py-2 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                  <div className="font-medium">{formatDate(leave.start_date)}</div>
                  <div className="text-gray-500 text-xs">to {formatDate(leave.end_date)}</div>
                </td>
                <td className="px-2 py-1 sm:px-3 sm:py-2 whitespace-nowrap">
                  <div className="text-xs sm:text-sm font-medium text-gray-900">{leave.total_days}</div>
                  <div className="text-xs text-gray-500">days</div>
                </td>
                <td className="hidden sm:table-cell px-2 py-1 sm:px-3 sm:py-2 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                  {formatDate(leave.application_datetime)}
                </td>
                <td className="px-2 py-1 sm:px-3 sm:py-2 whitespace-nowrap">
                  <span className={'px-1.5 py-0.5 sm:px-2 sm:py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ' + getStatusColor(leave.status)}>
                    {leave.status}
                  </span>
                </td>
                <td className="px-2 py-1 sm:px-3 sm:py-2 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleViewDetails(leave)}
                      className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-md text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                      title="View Details"
                    >
                      <Eye className="h-3 w-3 sm:mr-1" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                    {leave.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(leave.leave_id, 'APPROVED')}
                          className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-md text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 hover:border-green-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                          title="Accept"
                        >
                          <Check className="h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">Accept</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(leave.leave_id, 'REJECTED')}
                          className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-md text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                          title="Reject"
                        >
                          <X className="h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">Reject</span>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="px-3 py-2 sm:px-4 sm:py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs sm:text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, sortedData.length)} of {sortedData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={'p-1 rounded-md ' + (currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50')}
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <span className="text-xs sm:text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={'p-1 rounded-md ' + (currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50')}
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      )}
      <div className="sm:hidden px-3 py-2 text-xs text-gray-500 border-t border-gray-200">
        <p>Scroll horizontally to view all columns.</p>
      </div>
    </div>
  );
};

export default LeaveTable;