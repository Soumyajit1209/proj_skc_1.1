"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Calendar, Download } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ErrorAlert from '@/components/ui/ErrorAlert';
import SummaryCard from '@/components/SummaryCard';
import AttendanceTable from '@/components/AttendanceTable';
import ViewModal from '@/components/ViewModal';
import RejectModal from '@/components/RejectModal';
import DateRangeModal from '@/components/DateRangeModal';
import {X} from 'lucide-react';

const AttendanceReport = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  // Note: attendanceData should include a profile_picture field (URL to employee's image)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);

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
    setSelectedRecord(null);
    setRejectRemarks('');
  };

  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) closeModal();
  };

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
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`flex-1 flex flex-col min-h-screen ${viewModal || rejectModal || showDateRangeModal ? 'blur-sm' : ''}`}>
        <Header toggleSidebar={toggleSidebar} />
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
            <AttendanceTable
              data={attendanceData}
              onView={(record) => { setSelectedRecord(record); setViewModal(true); }}
              onReject={(record) => { setSelectedRecord(record); setRejectModal(true); }}
              getStatusColor={getStatusColor}
              calculateWorkingHours={calculateWorkingHours}
            />
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