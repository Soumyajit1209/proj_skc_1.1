import { useState } from 'react';
import { User, Eye, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const AttendanceTable = ({ data, onView, onReject, onCheckEmployeeAttendance, getStatusColor, calculateWorkingHours }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of records per page

  // Filter data based on search query
  const filteredData = data.filter((record) =>
    record.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.emp_id.toString().includes(searchQuery)
  );

  // Calculate pagination variables
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Determine if "No employees found" message should be shown
  const showNoResults = searchQuery.trim() !== '' && filteredData.length === 0;

  // Handle page navigation
  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  // Generate page numbers for display (e.g., show up to 5 pages around current page)
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-4 py-3 border-b flex justify-between items-center flex-col sm:flex-row gap-2">
        <h2 className="text-lg font-semibold text-gray-800">Daily Attendance Report</h2>
        <div className="flex gap-3 items-center flex-col sm:flex-row">
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-56"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={onCheckEmployeeAttendance}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm w-full sm:w-auto"
          >
            <User size={16} />
            <span>Check Employee Attendance</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto sm:overflow-x-visible">
        {/* Table view for larger screens */}
        <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
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
            {showNoResults ? (
              <tr>
                <td colSpan="7" className="px-4 py-3 text-center text-gray-600">
                  No employees found matching your search.
                </td>
              </tr>
            ) : (
              paginatedData.map((record) => (
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
                      <button
                        onClick={() => onView(record)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        aria-label={`View ${record.full_name}'s attendance`}
                      >
                        <Eye size={20} />
                      </button>
                      {record.in_status === 'APPROVED' && (
                        <button
                          onClick={() => onReject(record)}
                          className="text-red-600 hover:text-red-800 p-2"
                          aria-label={`Reject ${record.full_name}'s attendance`}
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Mobile view */}
        <div className="sm:hidden">
          {showNoResults ? (
            <div className="px-4 py-3 text-center text-gray-600">
              No employees found matching your search.
            </div>
          ) : (
            paginatedData.map((record) => (
              <div key={record.attendance_id} className="table-row border-b border-gray-200 p-4">
                <div className="table-cell">
                  <span className="table-cell-label">Employee</span>
                  <div className="table-cell-content flex items-center">
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
                </div>
                <div className="table-cell">
                  <span className="table-cell-label">Date</span>
                  <span className="table-cell-content">{record.attendance_date}</span>
                </div>
                <div className="table-cell">
                  <span className="table-cell-label">Check In</span>
                  <span className="table-cell-content">{record.in_time || '-'}</span>
                </div>
                <div className="table-cell">
                  <span className="table-cell-label">Check Out</span>
                  <span className="table-cell-content">{record.out_time || '-'}</span>
                </div>
                <div className="table-cell">
                  <span className="table-cell-label">Working Hours</span>
                  <span className="table-cell-content">{calculateWorkingHours(record.in_time, record.out_time)}</span>
                </div>
                <div className="table-cell">
                  <span className="table-cell-label">Status</span>
                  <span className={`table-cell-content px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.in_status)}`}>
                    {record.in_status}
                  </span>
                </div>
                <div className="table-cell">
                  <span className="table-cell-label">Actions</span>
                  <div className="table-actions">
                    <button
                      onClick={() => onView(record)}
                      className="text-blue-600 hover:text-blue-800 p-2"
                      aria-label={`View ${record.full_name}'s attendance`}
                    >
                      <Eye size={20} />
                    </button>
                    {record.in_status === 'APPROVED' && (
                      <button
                        onClick={() => onReject(record)}
                        className="text-red-600 hover:text-red-800 p-2"
                        aria-label={`Reject ${record.full_name}'s attendance`}
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between sm:justify-end gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft size={20} />
            </button>
            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                aria-label={`Go to page ${page}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} records
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTable;