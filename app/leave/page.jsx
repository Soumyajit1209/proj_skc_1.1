"use client";
import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ErrorAlert from '@/components/ui/ErrorAlert';
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LeaveFilters from '@/components/LeaveFilters';
import SummaryStats from '@/components/SummaryStats';
import LeaveTable from '@/components/LeaveTable';
import LeaveDetailsModal from '@/components/LeaveDetailsModal';
import { Download, X, Filter } from 'lucide-react';

const LeaveReport = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leaveData, setLeaveData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDateRange, setFilterDateRange] = useState({ from: '', to: '' });
  const [showFilters, setShowFilters] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.0.111:3001';

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Debug user object
  useEffect(() => {
    console.log("LeaveReport: User object:", user);
  }, [user]);

  // Check if user is admin and has branch_id
  useEffect(() => {
    if (isAuthenticated && user?.role !== 'admin') {
      setError('Access denied. Admin role required.');
      toast.error('Access denied. Admin role required.', { toastId: 'auth-error' });
      logout();
      router.push('/login');
    } else if (isAuthenticated && !user?.branch_id) {
      setError('Branch information missing. Please contact support.');
      toast.error('Branch information missing. Please contact support.', { toastId: 'missing-branch-id' });
      logout();
      router.push('/login');
    }
  }, [isAuthenticated, user, logout, router]);

  // Fetch leave data
  const fetchLeaves = async () => {
    if (!isAuthenticated || user?.role !== 'admin' || !user?.branch_id) {
      toast.error('Access denied or branch information missing.', { toastId: 'auth-error-fetch' });
      logout();
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/leaves`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        params: { branch_id: user.branch_id }
      });

      if (response.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired-fetch' });
        logout();
        router.push('/login');
        return;
      }

      setLeaveData(response.data);
      setFilteredData(response.data);
      setLoading(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch leave applications';
      toast.error(errorMessage, { toastId: 'fetch-leaves-error' });
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin' && user?.branch_id) {
      fetchLeaves();
    }
  }, [isAuthenticated, user]);

  // Filter leaves
  useEffect(() => {
    const filtered = leaveData.filter(leave => {
      if (!leave || !leave.leave_id) return false; // Ensure leave_id exists
      if (filterStatus !== 'ALL' && leave.status !== filterStatus) return false;
      if (filterDateRange.from && leave.application_datetime < filterDateRange.from) return false;
      if (filterDateRange.to && leave.application_datetime > filterDateRange.to) return false;
      return true;
    });
    setFilteredData(filtered);
  }, [leaveData, filterStatus, filterDateRange]);

  const handleDelete = async (leaveId) => {
    if (!isAuthenticated || user?.role !== 'admin' || !user?.branch_id) {
      toast.error('Access denied or branch information missing.', { toastId: 'auth-error-delete' });
      logout();
      router.push('/login');
      return;
    }

    if (!leaveId) {
      toast.error('Invalid leave ID.', { toastId: 'invalid-leave-id' });
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/admin/leaves/${leaveId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        data: { branch_id: user.branch_id }
      });

      if (response.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired-delete' });
        logout();
        router.push('/login');
        return;
      }

      // Update both leaveData and filteredData
      setLeaveData(leaveData.filter(leave => leave.leave_id !== leaveId));
      setFilteredData(filteredData.filter(leave => leave.leave_id !== leaveId));
      toast.success('Leave application deleted successfully', { toastId: 'delete-leave-success' });
      setShowDetailModal(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete leave application';
      toast.error(errorMessage, { toastId: 'delete-leave-error' });
    }
  };

  const handleStatusChange = async (leaveId, newStatus) => {
    if (!isAuthenticated || user?.role !== 'admin' || !user?.branch_id) {
      toast.error('Access denied or branch information missing.', { toastId: 'auth-error-update' });
      logout();
      router.push('/login');
      return;
    }

    if (!leaveId) {
      toast.error('Invalid leave ID.', { toastId: 'invalid-leave-id-update' });
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/leaves/${leaveId}`,
        { status: newStatus, branch_id: user.branch_id },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired-update' });
        logout();
        router.push('/login');
        return;
      }

      setLeaveData(leaveData.map(leave =>
        leave.leave_id === leaveId
          ? {
              ...leave,
              status: newStatus,
              approved_by: user.id || 1,
              approved_on: new Date().toISOString().slice(0, 19).replace('T', ' '),
              approved_by_username: user.username || 'adminuser'
            }
          : leave
      ));
      setFilteredData(filteredData.map(leave =>
        leave.leave_id === leaveId
          ? {
              ...leave,
              status: newStatus,
              approved_by: user.id || 1,
              approved_on: new Date().toISOString().slice(0, 19).replace('T', ' '),
              approved_by_username: user.username || 'adminuser'
            }
          : leave
      ));
      setShowDetailModal(false);
      toast.success(`Leave ${newStatus.toLowerCase()} successfully`, { toastId: 'update-leave-success' });
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update leave status';
      toast.error(errorMessage, { toastId: 'update-leave-error' });
    }
  };

  const handleViewDetails = async (leave) => {
    if (!isAuthenticated || user?.role !== 'admin' || !user?.branch_id) {
      toast.error('Access denied or branch information missing.', { toastId: 'auth-error-view' });
      logout();
      router.push('/login');
      return;
    }

    if (!leave?.leave_id) {
      toast.error('Invalid leave ID.', { toastId: 'invalid-leave-id-view' });
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/leaves/employee/${leave.emp_id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        params: { branch_id: user.branch_id }
      });

      if (response.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired-view' });
        logout();
        router.push('/login');
        return;
      }

      const detailedLeave = response.data.find(l => l.leave_id === leave.leave_id) || leave;
      setSelectedLeave(detailedLeave);
      setShowDetailModal(true);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch leave details';
      toast.error(errorMessage, { toastId: 'view-leave-error' });
      setSelectedLeave(leave);
      setShowDetailModal(true);
    }
  };

  const handleDownloadReport = async () => {
    if (!isAuthenticated || user?.role !== 'admin' || !user?.branch_id) {
      toast.error('Access denied or branch information missing.', { toastId: 'auth-error-download' });
      logout();
      router.push('/login');
      return;
    }

    try {
      // Build query parameters based on current filters
      const queryParams = new URLSearchParams();
      if (filterStatus && filterStatus !== 'ALL') {
        queryParams.append('status', filterStatus);
      }
      if (filterDateRange.from) {
        queryParams.append('fromDate', filterDateRange.from);
      }
      if (filterDateRange.to) {
        queryParams.append('toDate', filterDateRange.to);
      }
      queryParams.append('branch_id', user.branch_id);

      // Construct the URL with query parameters
      const url = `${API_BASE_URL}/api/admin/leaves/download${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        responseType: 'blob',
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

      // Generate filename with filter information
      let filename = `leave_report_branch_${user.branch_id}`;
      if (filterStatus && filterStatus !== 'ALL') {
        filename += `_${filterStatus.toLowerCase()}`;
      }
      if (filterDateRange.from || filterDateRange.to) {
        filename += '_filtered';
        if (filterDateRange.from) {
          filename += `_from_${filterDateRange.from}`;
        }
        if (filterDateRange.to) {
          filename += `_to_${filterDateRange.to}`;
        }
      }
      filename += '.xlsx';

      const url_blob = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url_blob;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url_blob);

      // Show success message with filter information
      let successMessage = 'Excel report downloaded successfully';
      if (filterStatus !== 'ALL' || filterDateRange.from || filterDateRange.to) {
        successMessage += ' (filtered data)';
      }
      toast.success(successMessage, { toastId: 'download-report-success' });
    } catch (err) {
      const errorMessage = err.message || 'Failed to download report';
      toast.error(errorMessage, { toastId: 'download-report-error' });
    }
  };

  const getSummaryStats = () => {
    if (!filteredData || !Array.isArray(filteredData)) {
      return { pending: 0, approved: 0, rejected: 0, totalDays: 0 };
    }
    return {
      pending: filteredData.filter(l => l.status === 'PENDING').length,
      approved: filteredData.filter(l => l.status === 'APPROVED').length,
      rejected: filteredData.filter(l => l.status === 'REJECTED').length,
      totalDays: filteredData.reduce((sum, l) => sum + (l.total_days || 0), 0),
    };
  };

  if (!isAuthenticated || user?.role !== 'admin' || !user?.branch_id) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <X className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin role and valid branch information required to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leave applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row sm:overflow-auto">
      {/* <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} /> */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* <Header toggleSidebar={toggleSidebar} /> */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto flex flex-col">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Leave Management</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Manage and track employee leave applications for Branch ID: {user.branch_id}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm sm:text-base"
                >
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Filters</span>
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm sm:text-base"
                >
                  <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>

            {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

            <LeaveFilters
              showFilters={showFilters}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterDateRange={filterDateRange}
              setFilterDateRange={setFilterDateRange}
              stats={getSummaryStats()}
            />

            <SummaryStats stats={getSummaryStats()} />

            <div className="flex-1">
              <LeaveTable
                filteredData={filteredData}
                handleViewDetails={handleViewDetails}
                handleStatusChange={handleStatusChange}
              />
            </div>

            <LeaveDetailsModal
              showDetailModal={showDetailModal}
              setShowDetailModal={setShowDetailModal}
              selectedLeave={selectedLeave}
              handleStatusChange={handleStatusChange}
              handleDelete={handleDelete}
            />

            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default LeaveReport;