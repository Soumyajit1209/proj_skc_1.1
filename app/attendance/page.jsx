"use client";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import { Calendar, Download, User, Printer, Clock, Filter, Search, XCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import ErrorAlert from '@/components/ui/ErrorAlert';
import SummaryCard from '@/components/SummaryCard';
import AttendanceTable from '@/components/AttendanceTable';
import ViewModal from '@/components/ViewModal';
import RejectModal from '@/components/RejectModal';
import DateRangeModal from '@/components/DateRangeModal';
import { X } from 'lucide-react';

// Enhanced Pending Attendance Table Component
const PendingAttendanceTable = ({ data, onView, onDirectClose, getStatusColor, calculateWorkingHours }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-red-50">
            <tr>
              {['Employee ID', 'Employee Name', 'Date', 'Check In', 'Hours Worked', 'Status', 'Actions'].map((header) => (
                <th key={header} className="px-4 py-3 text-left text-xs font-bold text-red-800 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <CheckCircle size={48} className="text-green-500 mb-2" />
                    <p className="text-lg font-medium">No pending verifications found</p>
                    <p className="text-sm">All employees have completed their attendance properly</p>
                  </div>
                </td> 
              </tr>
            ) : (
              data.map((record) => (
                <tr key={record.attendance_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{record.emp_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.full_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.attendance_date}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.in_time || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {record.in_time ? calculateWorkingHours(record.in_time, new Date().toTimeString().slice(0, 5)) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.in_status)}`}>
                      {record.in_status}
                    </span>
                    <div className="flex items-center mt-1">
                      <AlertTriangle size={12} className="text-orange-500 mr-1" />
                      <span className="text-xs text-orange-600">Missing out-time</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onView(record)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onDirectClose(record)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <CheckCircle size={12} />
                        Close
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Enhanced Filter Component for Pending Attendance
const PendingAttendanceFilters = ({ 
  nameFilter, 
  setNameFilter, 
  dateFilter, 
  setDateFilter, 
  statusFilter, 
  setStatusFilter,
  onClearFilters,
  totalRecords,
  filteredRecords
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-gray-600" />
            <input
              type="text"
              placeholder="Search by name or employee ID..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full min-w-[250px]"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-600" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing {filteredRecords} of {totalRecords} records
          </div>
          <button
            onClick={onClearFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            <XCircle size={16} />
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

const EmployeeAttendanceModal = ({ onClose, onSubmit, employees, onBackdropClick }) => {
  const [filterText, setFilterText] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Filter employees based on input
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.full_name.toLowerCase().includes(filterText.toLowerCase()) ||
      employee.emp_id.toString().includes(filterText)
  );

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle employee selection
  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setFilterText(`${employee.full_name} (ID: ${employee.emp_id})`);
    setIsDropdownOpen(false);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmployee || !dateRange.from || !dateRange.to) {
      toast.error('Please select an employee and date range', { toastId: 'employee-modal-error' });
      return;
    }
    onSubmit(selectedEmployee.emp_id, dateRange);
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      onClick={onBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Select Employee & Date Range</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <input
              type="text"
              placeholder="Type name or ID..."
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
                setSelectedEmployee(null);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <div
                      key={employee.emp_id}
                      onClick={() => handleEmployeeSelect(employee)}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                    >
                      {employee.full_name} (ID: {employee.emp_id})
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-600">
                    {filterText.trim() ? 'No employees found matching your input.' : 'Start typing to filter employees.'}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EmployeeAttendanceReportModal = ({ data, onClose, onBackdropClick, calculateWorkingHours }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      onClick={onBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Employee Attendance Report</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
            >
              <Printer size={16} />
              <span>Print</span>
            </button>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-700">Employee: {data.employee.full_name} (ID: {data.employee.emp_id})</h3>
          <p className="text-sm text-gray-600">Total Days: {data.summary.totalDays}</p>
          <p className="text-sm text-green-600">Present: {data.summary.presentDays}</p>
          <p className="text-sm text-red-600">Absent: {data.summary.absentDays}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-400">
              <tr>
                {['Date', 'Check In', 'Check Out', 'Working Hours', 'Status'].map((header) => (
                  <th key={header} className="px-4 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.attendance.map((record) => (
                <tr key={record.attendance_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{record.attendance_date}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.in_time || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.out_time || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{calculateWorkingHours(record.in_time, record.out_time)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${data.getStatusColor(record.in_status)}`}>
                      {record.in_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AttendanceReport = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [pendingAttendanceData, setPendingAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [employeeModal, setEmployeeModal] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [employeeReport, setEmployeeReport] = useState(null);
  const [activeTab, setActiveTab] = useState('daily');

  // Enhanced filter states for pending attendance
  const [pendingNameFilter, setPendingNameFilter] = useState('');
  const [pendingDateFilter, setPendingDateFilter] = useState('');
  const [pendingStatusFilter, setPendingStatusFilter] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.0.111:3001';

  useEffect(() => {
    if (isAuthenticated && user?.role !== 'admin') {
      setError('Access denied. Admin role required.');
      toast.error('Access denied. Admin role required.', { toastId: 'auth-error' });
      logout();
      router.push('/login');
    }
  }, [isAuthenticated, user, logout, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchDailyAttendance();
      fetchPendingOutAttendances();
      fetchEmployees();
    }
  }, [isAuthenticated, user]);

  const fetchDailyAttendance = async () => {
    if (!isAuthenticated || user?.role !== 'admin' || !user?.branch_id) {
      toast.error('Access denied or branch information missing.', { toastId: 'auth-error-fetch' });
      logout();
      router.push('/login');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/attendance/daily`, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' },
        params: { branch_id: user.branch_id }
      });
      if (response.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired-fetch' });
        logout();
        router.push('/login');
        return;
      }
      setAttendanceData(response.data);
      setError(null);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch attendance data';
      setError(errorMessage);
      toast.error(errorMessage, { toastId: 'fetch-attendance-error' });
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired' });
        logout();
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingOutAttendances = async () => {
    if (!isAuthenticated || user?.role !== 'admin' || !user?.branch_id) {
      toast.error('Access denied or branch information missing.', { toastId: 'auth-error-pending' });
      logout();
      router.push('/login');
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/attendance/pending-out`, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' },
        params: { branch_id: user.branch_id }
      });
      if (response.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired-pending' });
        logout();
        router.push('/login');
        return;
      }
      setPendingAttendanceData(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch pending out attendances';
      toast.error(errorMessage, { toastId: 'fetch-pending-error' });
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired-pending-error' });
        logout();
        router.push('/login');
      }
    }
  };

  const fetchEmployees = async () => {
    if (!isAuthenticated || user?.role !== 'admin' || !user?.branch_id) {
      toast.error('Access denied or branch information missing.', { toastId: 'auth-error-employees' });
      logout();
      router.push('/login');
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/all-employees`, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' },
        params: { branch_id: user.branch_id }
      });
      if (response.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired-employees' });
        logout();
        router.push('/login');
        return;
      }
      setEmployees(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch employees';
      toast.error(errorMessage, { toastId: 'fetch-employees-error' });
    }
  };

  const fetchEmployeeAttendanceReport = async (emp_id, dateRange) => {
    if (!isAuthenticated || user?.role !== 'admin' || !user?.branch_id) {
      toast.error('Access denied or branch information missing.', { toastId: 'auth-error-report' });
      logout();
      router.push('/login');
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/attendance/employee/${emp_id}`, {
        params: { from_date: dateRange.from, to_date: dateRange.to, branch_id: user.branch_id },
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' }
      });
      if (response.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired-report' });
        logout();
        router.push('/login');
        return;
      }
      setEmployeeReport({
        ...response.data,
        getStatusColor
      });
      setReportModal(true);
      setEmployeeModal(false);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch employee attendance report';
      toast.error(errorMessage, { toastId: 'fetch-report-error' });
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired-report-error' });
        logout();
        router.push('/login');
      }
    }
  };

  const handleRejectAttendance = async () => {
    if (!isAuthenticated || user?.role !== 'admin' || !user?.branch_id) {
      toast.error('Access denied or branch information missing.', { toastId: 'auth-error-reject' });
      logout();
      router.push('/login');
      return;
    }
    if (!rejectRemarks.trim()) {
      toast.error('Please enter remarks for rejection', { toastId: 'remarks-required' });
      return;
    }
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/attendance/${selectedRecord.attendance_id}/reject`,
        { remarks: rejectRemarks, branch_id: user.branch_id },
        { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' } }
      );
      if (response.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired-reject' });
        logout();
        router.push('/login');
        return;
      }
      setAttendanceData((prev) =>
        prev.map((record) =>
          record.attendance_id === selectedRecord.attendance_id
            ? { ...record, in_status: 'REJECTED', remarks: rejectRemarks }
            : record
        )
      );
      toast.success('Attendance rejected successfully', { toastId: 'reject-success' });
      closeModal();
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to reject attendance';
      toast.error(errorMessage, { toastId: 'reject-attendance-error' });
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired-reject-error' });
        logout();
        router.push('/login');
      }
    }
  };

  const handleCloseAttendance = async (record) => {
    if (!isAuthenticated || user?.role !== 'admin' || !user?.branch_id) {
      toast.error('Access denied or branch information missing.', { toastId: 'auth-error-close' });
      logout();
      router.push('/login');
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/attendance/${record.attendance_id}/close`,
        { remarks: 'ADMIN_VERIFIED', branch_id: user.branch_id },
        { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' } }
      );
      
      if (response.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired-close' });
        logout();
        router.push('/login');
        return;
      }

      // Remove the closed attendance from pending list
      setPendingAttendanceData((prev) =>
        prev.filter((item) => item.attendance_id !== record.attendance_id)
      );
      
      toast.success('Attendance closed successfully', { toastId: 'close-success' });
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to close attendance';
      toast.error(errorMessage, { toastId: 'close-attendance-error' });
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired-close-error' });
        logout();
        router.push('/login');
      }
    }
  };

  const handleDownloadDaily = async () => {
    if (!isAuthenticated || user?.role !== 'admin' || !user?.branch_id) {
      toast.error('Access denied or branch information missing.', { toastId: 'auth-error-download' });
      logout();
      router.push('/login');
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/attendance/daily/download`, {
        headers: { Authorization: `Bearer ${user.token}` },
        params: { branch_id: user.branch_id },
        responseType: 'blob'
      });
      if (response.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired-download' });
        logout();
        router.push('/login');
        return;
      }
      const contentType = response.headers['content-type'];
      if (!contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') &&
          !contentType.includes('application/vnd.ms-excel')) {
        const text = await response.data.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Invalid response format from server');
        } catch {
          throw new Error('Server returned an invalid Excel file');
        }
      }
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daily_attendance_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Daily attendance report downloaded successfully', { toastId: 'download-success' });
    } catch (error) {
      const errorMessage = error.message || 'Failed to download daily attendance report';
      toast.error(errorMessage, { toastId: 'download-daily-error' });
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired-download-error' });
        logout();
        router.push('/login');
      }
    }
  };

  const handleDownloadByRange = async () => {
    if (!isAuthenticated || user?.role !== 'admin' || !user?.branch_id) {
      toast.error('Access denied or branch information missing.', { toastId: 'auth-error-download-range' });
      logout();
      router.push('/login');
      return;
    }
    if (!dateRange.from || !dateRange.to) {
      toast.error('Please select both from and to dates', { toastId: 'date-range-required' });
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/attendance/range/download`, {
        params: { from_date: dateRange.from, to_date: dateRange.to, branch_id: user.branch_id },
        headers: { Authorization: `Bearer ${user.token}` },
        responseType: 'blob'
      });
      if (response.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired-download-range' });
        logout();
        router.push('/login');
        return;
      }
      const contentType = response.headers['content-type'];
      if (!contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') &&
          !contentType.includes('application/vnd.ms-excel')) {
        const text = await response.data.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Invalid response format from server');
        } catch {
          throw new Error('Server returned an invalid Excel file');
        }
      }
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${dateRange.from}_to_${dateRange.to}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Attendance range report downloaded successfully', { toastId: 'download-range-success' });
      closeModal();
    } catch (error) {
      const errorMessage = error.message || 'Failed to download attendance range report';
      toast.error(errorMessage, { toastId: 'download-range-error' });
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired-download-range-error' });
        logout();
        router.push('/login');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CLOSED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateWorkingHours = (inTime, outTime) => {
    if (!inTime || !outTime) return '0h 0m';
    const [inHours, inMinutes] = inTime.split(':').map(Number);
    const [outHours, outMinutes] = outTime.split(':').map(Number);
    const inTotalMinutes = inHours * 60 + inMinutes;
    const outTotalMinutes = outHours * 60 + outMinutes;
    const diffMinutes = outTotalMinutes - inTotalMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const closeModal = () => {
    setViewModal(false);
    setRejectModal(false);
    setShowDateRangeModal(false);
    setEmployeeModal(false);
    setReportModal(false);
    setSelectedRecord(null);
    setRejectRemarks('');
    setEmployeeReport(null);
  };

  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) closeModal();
  };

  const handleCheckEmployeeAttendance = () => {
    setEmployeeModal(true);
  };

  const handleDirectClose = (record) => {
    setSelectedRecord(record);
    handleCloseAttendance(record);
  };

  // Enhanced filtering logic for pending attendance
  const getFilteredPendingData = () => {
    return pendingAttendanceData.filter((record) => {
      const nameMatch = !pendingNameFilter || 
        record.full_name.toLowerCase().includes(pendingNameFilter.toLowerCase()) ||
        record.emp_id.toString().includes(pendingNameFilter);
      
      const dateMatch = !pendingDateFilter || 
        record.attendance_date === pendingDateFilter;
      
      const statusMatch = !pendingStatusFilter || 
        record.in_status === pendingStatusFilter;
      
      return nameMatch && dateMatch && statusMatch;
    });
  };

  const clearPendingFilters = () => {
    setPendingNameFilter('');
    setPendingDateFilter('');
    setPendingStatusFilter('');
  };

  const filteredPendingData = getFilteredPendingData();

  const presentCount = attendanceData.filter((r) => r.in_time).length;
  const absentCount = attendanceData.filter((r) => !r.in_time).length;
  const attendanceRate = attendanceData.length > 0 ? Math.round((presentCount / attendanceData.length) * 100) : 0;

  if (!isAuthenticated || user?.role !== 'admin' || !user?.branch_id){
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <X size={24} className="text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin role required to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      <div className={`flex-1 flex flex-col min-h-screen ${viewModal || rejectModal || showDateRangeModal || employeeModal || reportModal ? 'blur-sm' : ''}`}>
        <main className="flex-1 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Attendance Report</h1>
                <p className="text-gray-600 text-sm">Track and manage employee attendance</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDateRangeModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
                >
                  <Calendar size={16} />
                  <span>Download by Range</span>
                </button>
                <button
                  onClick={handleDownloadDaily}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
                >
                  <Download size={16} />
                  <span>Download Daily</span>
                </button>
              </div>
            </div>
            
            {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <SummaryCard title="Present Today" value={presentCount} color="text-green-600" />
              <SummaryCard title="Absent Today" value={absentCount} color="text-red-600" />
              <SummaryCard title="Attendance Rate" value={`${attendanceRate}%`} color="text-blue-600" />
              <SummaryCard 
                title="Pending Out-Times" 
                value={pendingAttendanceData.length} 
                color="text-orange-600"
                icon={<AlertTriangle size={20} />}
              />
            </div>
            
            <div className="mb-4">
              <div className="flex border-b border-gray-200">
                <button
                  className={`px-4 py-2 font-medium flex items-center gap-2 ${
                    activeTab === 'daily' 
                      ? 'border-b-2 border-blue-500 text-blue-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('daily')}
                >
                  <CheckCircle size={16} />
                  Daily Attendance
                </button>
                <button
                  className={`px-4 py-2 font-medium flex items-center gap-2 ${
                    activeTab === 'pending' 
                      ? 'border-b-2 border-orange-500 text-orange-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('pending')}
                >
                  <AlertTriangle size={16} />
                  Pending Out-Times
                  {pendingAttendanceData.length > 0 && (
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full ml-1">
                      {pendingAttendanceData.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {activeTab === 'daily' && (
              <AttendanceTable
                data={attendanceData}
                onView={(record) => { setSelectedRecord(record); setViewModal(true); }}
                onReject={(record) => { setSelectedRecord(record); setRejectModal(true); }}
                onCheckEmployeeAttendance={handleCheckEmployeeAttendance}
                getStatusColor={getStatusColor}
                calculateWorkingHours={calculateWorkingHours}
              />
            )}

            {activeTab === 'pending' && (
              <>
                <PendingAttendanceFilters
                  nameFilter={pendingNameFilter}
                  setNameFilter={setPendingNameFilter}
                  dateFilter={pendingDateFilter}
                  setDateFilter={setPendingDateFilter}
                  statusFilter={pendingStatusFilter}
                  setStatusFilter={setPendingStatusFilter}
                  onClearFilters={clearPendingFilters}
                  totalRecords={pendingAttendanceData.length}
                  filteredRecords={filteredPendingData.length}
                />

                <PendingAttendanceTable
                  data={filteredPendingData}
                  onView={(record) => { setSelectedRecord(record); setViewModal(true); }}
                  onDirectClose={handleDirectClose}
                  getStatusColor={getStatusColor}
                  calculateWorkingHours={calculateWorkingHours}
                />
              </>
            )}
          </div>
        </main>
      </div>

      {viewModal && selectedRecord && (
        <ViewModal
          record={selectedRecord}
          onClose={closeModal}
          getStatusColor={getStatusColor}
          calculateWorkingHours={calculateWorkingHours}
          onBackdropClick={handleModalBackdropClick}
        />
      )}

      {rejectModal && selectedRecord && (
        <RejectModal
          record={selectedRecord}
          remarks={rejectRemarks}
          setRemarks={setRejectRemarks}
          onReject={handleRejectAttendance}
          onClose={closeModal}
          onBackdropClick={handleModalBackdropClick}
        />
      )}

      {showDateRangeModal && (
        <DateRangeModal
          dateRange={dateRange}
          setDateRange={setDateRange}
          onDownload={handleDownloadByRange}
          onClose={closeModal}
          onBackdropClick={handleModalBackdropClick}
        />
      )}

      {employeeModal && (
        <EmployeeAttendanceModal
          employees={employees}
          onSubmit={fetchEmployeeAttendanceReport}
          onClose={closeModal}
          onBackdropClick={handleModalBackdropClick}
        />
      )}

      {reportModal && employeeReport && (
        <EmployeeAttendanceReportModal
          data={employeeReport}
          onClose={closeModal}
          onBackdropClick={handleModalBackdropClick}
          calculateWorkingHours={calculateWorkingHours}
        />
      )}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default AttendanceReport;