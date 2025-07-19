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
import { Download, X, Filter, MapPin, Calendar, Clock, User, FileText, Printer } from 'lucide-react';

// Activity Filters Component
const ActivityFilters = ({ showFilters, filterDateRange, setFilterDateRange, stats }) => {
  if (!showFilters) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
          <input
            type="date"
            value={filterDateRange.from}
            onChange={(e) => setFilterDateRange(prev => ({ ...prev, from: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
          <input
            type="date"
            value={filterDateRange.to}
            onChange={(e) => setFilterDateRange(prev => ({ ...prev, to: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Activities</label>
          <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
            <span className="text-blue-800 font-semibold">{stats.totalActivities}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Summary Stats Component
const SummaryStats = ({ stats, dateRange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-sm border p-4 border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-blue-600">{stats.totalActivities}</p>
            <p className="text-sm text-gray-600">Total Activities</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-4 border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg mr-3">
            <User className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-green-600">{stats.uniqueEmployees}</p>
            <p className="text-sm text-gray-600">Active Employees</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg mr-3">
            <MapPin className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-purple-600">{stats.locationsTracked}</p>
            <p className="text-sm text-gray-600">Locations Tracked</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-orange-100 rounded-lg mr-3">
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-orange-600">
              {dateRange.from && dateRange.to 
                ? Math.ceil((new Date(dateRange.to) - new Date(dateRange.from)) / (1000 * 60 * 60 * 24)) + 1
                : 'All'
              }
            </p>
            <p className="text-sm text-gray-600">Days Range</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Activity Table Component
const ActivityTable = ({ groupedData, searchTerm }) => {
  const [expandedDates, setExpandedDates] = useState(new Set());

  const toggleDate = (date) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const formatDateTime = (datetime) => {
    return new Date(datetime).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredGroupedData = Object.entries(groupedData).reduce((acc, [date, activities]) => {
    if (!searchTerm) {
      acc[date] = activities;
      return acc;
    }
    
    const filtered = activities.filter(activity =>
      activity.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filtered.length > 0) {
      acc[date] = filtered;
    }
    
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800">Activity Reports</h3>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {Object.keys(filteredGroupedData).length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No activities found</p>
            <p className="text-sm">Try adjusting your filters or search criteria</p>
          </div>
        ) : (
          Object.entries(filteredGroupedData)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .map(([date, activities]) => (
              <div key={date} className="border-b">
                <button
                  onClick={() => toggleDate(date)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-gray-800">{formatDate(date)}</h4>
                      <p className="text-sm text-gray-600">{activities.length} activities</p>
                    </div>
                  </div>
                  <div className={`transform transition-transform ${expandedDates.has(date) ? 'rotate-90' : ''}`}>
                    ▶
                  </div>
                </button>

                {expandedDates.has(date) && (
                  <div className="bg-gray-50">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activities.map((activity) => (
                            <tr key={activity.activity_id} className="border-t">
                              <td className="px-4 py-3 text-sm">
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span>{formatDateTime(activity.activity_datetime).split(', ')[1]}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{activity.full_name}</p>
                                    <p className="text-xs text-gray-500">ID: {activity.emp_id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {activity.customer_name || 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                <div className="max-w-xs truncate" title={activity.remarks}>
                                  {activity.remarks || 'No remarks'}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {activity.location ? (
                                  <div className="flex items-start space-x-2">
                                    <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div className="max-w-xs">
                                      <p className="text-gray-900 truncate" title={activity.location}>
                                        {activity.location}
                                      </p>
                                      {(activity.latitude && activity.longitude) && (
                                        <p className="text-xs text-gray-500">
                                          {activity.latitude}, {activity.longitude}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-500">Location not available</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))
        )}
      </div>
    </div>
  );
};

// Main Activity Report Component
const ActivityReport = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activityData, setActivityData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState({ from: '', to: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Fetch activity data
  const fetchActivities = async () => {
    if (!isAuthenticated || user?.role !== 'admin') {
      toast.error('Access denied. Admin role required.', { toastId: 'auth-error-fetch' });
      logout();
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/activity`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired-fetch' });
        logout();
        router.push('/login');
        return;
      }

      setActivityData(response.data);
      setFilteredData(response.data);
      setLoading(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch activity reports';
      toast.error(errorMessage, { toastId: 'fetch-activities-error' });
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchActivities();
    }
  }, [isAuthenticated, user]);

  // Filter activities
  useEffect(() => {
    const filtered = activityData.filter(activity => {
      const activityDate = new Date(activity.activity_datetime).toISOString().split('T')[0];
      
      if (filterDateRange.from && activityDate < filterDateRange.from) return false;
      if (filterDateRange.to && activityDate > filterDateRange.to) return false;
      
      return true;
    });
    
    setFilteredData(filtered);
  }, [activityData, filterDateRange]);

  // Group activities by date
  useEffect(() => {
    const grouped = filteredData.reduce((acc, activity) => {
      const date = new Date(activity.activity_datetime).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(activity);
      return acc;
    }, {});
    
    setGroupedData(grouped);
  }, [filteredData]);

  // Print functionality
  const handlePrint = () => {
    const printContent = document.getElementById('activity-print-content');
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Reload to restore React functionality
  };

  // Download report
  const handleDownloadReport = async () => {
    if (!isAuthenticated || user?.role !== 'admin') {
      toast.error('Access denied. Admin role required.', { toastId: 'auth-error-download' });
      logout();
      router.push('/login');
      return;
    }

    try {
      const queryParams = new URLSearchParams();
      if (filterDateRange.from) queryParams.append('from', filterDateRange.from);
      if (filterDateRange.to) queryParams.append('to', filterDateRange.to);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/activity/download?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          responseType: 'blob',
        }
      );

      if (response.status === 401) {
        toast.error('Session expired. Please login again.', { toastId: 'session-expired-download' });
        logout();
        router.push('/login');
        return;
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Activity report downloaded successfully', { toastId: 'download-report-success' });
    } catch (err) {
      const errorMessage = err.message || 'Failed to download report';
      toast.error(errorMessage, { toastId: 'download-report-error' });
    }
  };

  const getSummaryStats = () => {
    if (!filteredData || !Array.isArray(filteredData)) {
      return { totalActivities: 0, uniqueEmployees: 0, locationsTracked: 0 };
    }
    
    const uniqueEmployees = new Set(filteredData.map(a => a.emp_id)).size;
    const locationsTracked = filteredData.filter(a => a.location).length;
    
    return {
      totalActivities: filteredData.length,
      uniqueEmployees,
      locationsTracked,
    };
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
          <p className="text-gray-600">Loading activity reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row sm:overflow-auto">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto flex flex-col">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Activity Reports</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Track and monitor employee activities</p>
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
                  onClick={handlePrint}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm sm:text-base"
                >
                  <Printer className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Print</span>
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

            <ActivityFilters
              showFilters={showFilters}
              filterDateRange={filterDateRange}
              setFilterDateRange={setFilterDateRange}
              stats={getSummaryStats()}
            />

            <SummaryStats stats={getSummaryStats()} dateRange={filterDateRange} />

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by employee name, customer, remarks, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex-1">
              <ActivityTable 
                groupedData={groupedData}
                searchTerm={searchTerm}
              />
            </div>

             {/* Hidden print content */}
<div id="activity-print-content" className="hidden print:block">
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <img 
          src="/logo.png" 
          alt="Company Logo" 
          className="h-12 w-auto object-contain"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className="flex-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Activity Report</h1>
          <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
          {(filterDateRange.from || filterDateRange.to) && (
            <p className="text-gray-600">
              Period: {filterDateRange.from || 'All'} to {filterDateRange.to || 'All'}
            </p>
          )}
        </div>
      </div>
      <div className="text-right text-sm text-gray-600">
        <p>Page 1</p>
        <p>{new Date().toLocaleString()}</p>
      </div>
    </div>
    
    <div className="mb-6">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-lg font-semibold">{getSummaryStats().totalActivities}</p>
          <p className="text-sm text-gray-600">Total Activities</p>
        </div>
        <div>
          <p className="text-lg font-semibold">{getSummaryStats().uniqueEmployees}</p>
          <p className="text-sm text-gray-600">Active Employees</p>
        </div>
        <div>
          <p className="text-lg font-semibold">{getSummaryStats().locationsTracked}</p>
          <p className="text-sm text-gray-600">Locations Tracked</p>
        </div>
      </div>
    </div>

    {Object.entries(groupedData)
      .sort(([a], [b]) => new Date(b) - new Date(a))
      .map(([date, activities]) => (
        <div key={date} className="mb-8">
          <h3 className="text-lg font-semibold mb-4">
            {new Date(date).toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} ({activities.length} activities)
          </h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-1 text-left">Time</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Employee</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Customer</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Remarks</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Location</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.activity_id}>
                  <td className="border border-gray-300 px-2 py-1">
                    {new Date(activity.activity_datetime).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {activity.full_name} (ID: {activity.emp_id})
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {activity.customer_name || 'N/A'}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {activity.remarks || 'No remarks'}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {activity.location || 'Location not available'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))
    }
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

export default ActivityReport;