"use client";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import { Calendar, Download, User, Printer, Clock, Filter } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ErrorAlert from '@/components/ui/ErrorAlert';
import SummaryCard from '@/components/SummaryCard';
import AttendanceTable from '@/components/AttendanceTable';
import ViewModal from '@/components/ViewModal';
import RejectModal from '@/components/RejectModal';
import DateRangeModal from '@/components/DateRangeModal';
import { X } from 'lucide-react';

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

const CloseModal = ({ record, remarks, setRemarks, onClose, onBackdropClick, onCloseAttendance }) => {
  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      onClick={onBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Close Attendance</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        <p className="mb-4 text-gray-600">
          Are you sure you want to close this attendance for {record.full_name} on {record.attendance_date}?
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (optional)</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onCloseAttendance}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Close Attendance
          </button>
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
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [employeeModal, setEmployeeModal] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [closeRemarks, setCloseRemarks] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [employeeReport, setEmployeeReport] = useState(null);
  const [pendingFilterText, setPendingFilterText] = useState('');
  const [activeTab, setActiveTab] = useState('daily');

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
    if (!isAuthenticated || user?.role !== 'admin') {
      toast.error('Access denied. Admin role required.', { toastId: 'auth-error-fetch' });
      logout();
      router.push('/login');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/attendance/daily`, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' }
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
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/attendance/pending-out`, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' }
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
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/all-employees`, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' }
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
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/attendance/employee/${emp_id}`, {
        params: { from_date: dateRange.from, to_date: dateRange.to },
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
    if (!isAuthenticated || user?.role !== 'admin') {
      toast.error('Access denied. Admin role required.', { toastId: 'auth-error-reject' });
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
        { remarks: rejectRemarks },
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

  const handleCloseAttendance = async () => {
    if (!isAuthenticated || user?.role !== 'admin') {
      toast.error('Access denied. Admin role required.', { toastId: 'auth-error-close' });
      logout();
      router.push('/login');
      return;
    }
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/attendance/${selectedRecord.attendance_id}/close`,
        { remarks: closeRemarks },
        { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' } }
      );
      if (response.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired-close' });
        logout();
        router.push('/login');
        return;
      }
      setPendingAttendanceData((prev) =>
        prev.map((record) =>
          record.attendance_id === selectedRecord.attendance_id
            ? { ...record, in_status: 'CLOSED', remarks: closeRemarks }
            : record
        )
      );
      toast.success('Attendance closed successfully', { toastId: 'close-success' });
      closeModal();
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
    if (!isAuthenticated || user?.role !== 'admin') {
      toast.error('Access denied. Admin role required.', { toastId: 'auth-error-download' });
      logout();
      router.push('/login');
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/attendance/daily/download`, {
        headers: { Authorization: `Bearer ${user.token}` },
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
    if (!isAuthenticated || user?.role !== 'admin') {
      toast.error('Access denied. Admin role required.', { toastId: 'auth-error-download-range' });
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
        params: { from_date: dateRange.from, to_date: dateRange.to },
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
    setCloseModalOpen(false);
    setShowDateRangeModal(false);
    setEmployeeModal(false);
    setReportModal(false);
    setSelectedRecord(null);
    setRejectRemarks('');
    setCloseRemarks('');
    setEmployeeReport(null);
  };

  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) closeModal();
  };

  const handleCheckEmployeeAttendance = () => {
    setEmployeeModal(true);
  };

  const handleClose = (record) => {
    setSelectedRecord(record);
    setCloseRemarks('');
    setCloseModalOpen(true);
  };

  const filteredPendingData = pendingAttendanceData.filter(
    (record) =>
      record.full_name.toLowerCase().includes(pendingFilterText.toLowerCase()) ||
      record.emp_id.toString().includes(pendingFilterText)
  );

  const presentCount = attendanceData.filter((r) => r.in_time).length;
  const absentCount = attendanceData.filter((r) => !r.in_time).length;
  const attendanceRate = attendanceData.length > 0 ? Math.round((presentCount / attendanceData.length) * 100) : 0;

  if (!isAuthenticated || user?.role !== 'admin') {
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
      {/* <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} /> */}
      <div className={`flex-1 flex flex-col min-h-screen ${viewModal || rejectModal || showDateRangeModal || employeeModal || reportModal || closeModalOpen ? 'blur-sm' : ''}`}>
        {/* <Header toggleSidebar={toggleSidebar} /> */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <SummaryCard title="Present Today" value={presentCount} color="text-green-600" />
              <SummaryCard title="Absent Today" value={absentCount} color="text-red-600" />
              <SummaryCard title="Attendance Rate" value={`${attendanceRate}%`} color="text-blue-600" />
            </div>
            <div className="mb-4">
              <div className="flex border-b border-gray-200">
                <button
                  className={`px-4 py-2 font-medium ${activeTab === 'daily' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('daily')}
                >
                  Daily Attendance
                </button>
                <button
                  className={`px-4 py-2 font-medium ${activeTab === 'pending' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('pending')}
                >
                  Pending Out Attendances
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
                <div className="mb-4 flex items-center gap-2">
                  <Filter size={16} className="text-gray-600" />
                  <input
                    type="text"
                    placeholder="Filter by name or ID..."
                    value={pendingFilterText}
                    onChange={(e) => setPendingFilterText(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full max-w-md"
                  />
                </div>
                <AttendanceTable
                  data={filteredPendingData}
                  onView={(record) => { setSelectedRecord(record); setViewModal(true); }}
                  onReject={(record) => { setSelectedRecord(record); setRejectModal(true); }}
                  onClose={handleClose}
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
      {closeModalOpen && selectedRecord && (
        <CloseModal
          record={selectedRecord}
          remarks={closeRemarks}
          setRemarks={setCloseRemarks}
          onCloseAttendance={handleCloseAttendance}
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