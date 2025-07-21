"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ErrorAlert from '@/components/ui/ErrorAlert';
import { Users, Calendar, MapPin, Clock, FileText , X } from 'lucide-react';

const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState({
    employees: { total: 0, active: 0, inactive: 0 },
    attendance: { presentToday: 0, absentToday: 0, attendanceRate: 0 },
    activities: { totalActivities: 0, uniqueEmployees: 0, locationsTracked: 0 },
    leaves: { pending: 0, approved: 0, rejected: 0, totalDays: 0 },
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.0.111:3001';

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Check if user is admin
  useEffect(() => {
    if (isAuthenticated && user?.role !== 'admin') {
      setError('Access denied. Admin role required.');
      toast.error('Access denied. Admin role required.', { toastId: 'auth-error' });
      logout();
      router.push('/login');
    }
  }, [isAuthenticated, user, logout, router]);

  // Fetch all summary data
  const fetchSummaryData = async () => {
    if (!isAuthenticated || user?.role !== 'admin') {
      toast.error('Access denied. Admin role required.', { toastId: 'auth-error-fetch' });
      logout();
      router.push('/login');
      return;
    }

    try {
      setLoading(true);

      // Fetch employees
      const employeesResponse = await axios.get(`${API_BASE_URL}/api/admin/all-employees`, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' },
      });

      // Fetch daily attendance
      const attendanceResponse = await axios.get(`${API_BASE_URL}/api/admin/attendance/daily`, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' },
      });

      // Fetch activities
      const activitiesResponse = await axios.get(`${API_BASE_URL}/api/admin/activity`, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' },
      });

      // Fetch leaves
      const leavesResponse = await axios.get(`${API_BASE_URL}/api/admin/leaves`, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' },
      });

      // Process employee data
      const employees = employeesResponse.data;
      const activeEmployees = employees.filter(emp => emp.is_active === 1).length;
      const inactiveEmployees = employees.filter(emp => emp.is_active === 0).length;

      // Process attendance data
      const attendanceData = attendanceResponse.data;
      const presentCount = attendanceData.filter(r => r.in_time).length;
      const absentCount = attendanceData.filter(r => !r.in_time).length;
      const attendanceRate = attendanceData.length > 0 ? Math.round((presentCount / attendanceData.length) * 100) : 0;

      // Process activity data
      const activityData = activitiesResponse.data;
      const uniqueEmployees = new Set(activityData.map(a => a.emp_id)).size;
      const locationsTracked = activityData.filter(a => a.location).length;

      // Process leave data
      const leaveData = leavesResponse.data;
      const pendingLeaves = leaveData.filter(l => l.status === 'PENDING').length;
      const approvedLeaves = leaveData.filter(l => l.status === 'APPROVED').length;
      const rejectedLeaves = leaveData.filter(l => l.status === 'REJECTED').length;
      const totalLeaveDays = leaveData.reduce((sum, l) => sum + (l.total_days || 0), 0);

      setSummaryData({
        employees: { total: employees.length, active: activeEmployees, inactive: inactiveEmployees },
        attendance: { presentToday: presentCount, absentToday: absentCount, attendanceRate },
        activities: { totalActivities: activityData.length, uniqueEmployees, locationsTracked },
        leaves: { pending: pendingLeaves, approved: approvedLeaves, rejected: rejectedLeaves, totalDays: totalLeaveDays },
      });

      setLoading(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch dashboard data';
      toast.error(errorMessage, { toastId: 'fetch-dashboard-error' });
      setError(errorMessage);
      setLoading(false);
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired' });
        logout();
        router.push('/login');
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchSummaryData();
    }
  }, [isAuthenticated, user]);

  // Handle navigation to specific pages
  const navigateToPage = (path) => {
    router.push(path);
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <X className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin role required to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Overview of employee management, attendance, activities, and leaves</p>
            </div>

            {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

            {/* Employee Summary */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Employee Overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  className="bg-white rounded-lg shadow-sm border p-4 border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigateToPage('/employee')}
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-blue-600">{summaryData.employees.total}</p>
                      <p className="text-sm text-gray-600">Total Employees</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4 border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-green-600">{summaryData.employees.active}</p>
                      <p className="text-sm text-gray-600">Active Employees</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4 border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg mr-3">
                      <Users className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-red-600">{summaryData.employees.inactive}</p>
                      <p className="text-sm text-gray-600">Inactive Employees</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Attendance Overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  className="bg-white rounded-lg shadow-sm border p-4 border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigateToPage('/attendance')}
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-green-600">{summaryData.attendance.presentToday}</p>
                      <p className="text-sm text-gray-600">Present Today</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4 border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg mr-3">
                      <Calendar className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-red-600">{summaryData.attendance.absentToday}</p>
                      <p className="text-sm text-gray-600">Absent Today</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4 border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-blue-600">{summaryData.attendance.attendanceRate}%</p>
                      <p className="text-sm text-gray-600">Attendance Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Activity Overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  className="bg-white rounded-lg shadow-sm border p-4 border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigateToPage('/activity-report')}
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-blue-600">{summaryData.activities.totalActivities}</p>
                      <p className="text-sm text-gray-600">Total Activities</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4 border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-purple-600">{summaryData.activities.uniqueEmployees}</p>
                      <p className="text-sm text-gray-600">Active Employees</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4 border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg mr-3">
                      <MapPin className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-orange-600">{summaryData.activities.locationsTracked}</p>
                      <p className="text-sm text-gray-600">Locations Tracked</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leave Summary */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Leave Overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  className="bg-white rounded-lg shadow-sm border p-4 border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigateToPage('/leave')}
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                      <FileText className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-yellow-600">{summaryData.leaves.pending}</p>
                      <p className="text-sm text-gray-600">Pending Leaves</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4 border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-green-600">{summaryData.leaves.approved}</p>
                      <p className="text-sm text-gray-600">Approved Leaves</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4 border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg mr-3">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-red-600">{summaryData.leaves.rejected}</p>
                      <p className="text-sm text-gray-600">Rejected Leaves</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4 border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-blue-600">{summaryData.leaves.totalDays}</p>
                      <p className="text-sm text-gray-600">Total Leave Days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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

export default Dashboard;