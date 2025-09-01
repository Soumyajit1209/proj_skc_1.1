"use client";
import React, { useState, useEffect } from 'react';
import { Shield, Settings, LogOut, RefreshCw, BarChart3, Building2, Users, Calendar, FileText, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import OverviewTab from '@/components/superadmin/OverviewTab';
import BranchesTab from '@/components/superadmin/BranchesTab';
import AdminsTab from '@/components/superadmin/AdminsTab';
import EmployeesTab from '@/components/superadmin/EmployeesTab';
import AttendanceTab from '@/components/superadmin/AttendanceTab';
import LeavesTab from '@/components/superadmin/LeavesTab';
import ActivitiesTab from '@/components/superadmin/ActivitiesTab';
import AddBranchModal from '@/components/superadmin/AddBranchModal';
import AddAdminModal from '@/components/superadmin/AddAdminModal';
import AddEmployeeModal from '@/components/superadmin/AddEmployeeModal';
import EditEmployeeModal from '@/components/superadmin/EditEmployeeModal';
import AssignBranchModal from '@/components/superadmin/AssignBranchModal';
import ResetPasswordModal from '@/components/superadmin/ResetPasswordModal';

const SuperadminDashboard = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [branches, setBranches] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [activityReports, setActivityReports] = useState([]);
  const [stats, setStats] = useState({
    totalBranches: 0,
    totalAdmins: 0,
    totalEmployees: 0,
    activeUsers: 0,
    unallocatedEmployees: 0,
  });
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showAssignBranchModal, setShowAssignBranchModal] = useState(false);
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    branch_name: '',
    admin_username: '',
    admin_password: '',
    admin_email: '',
    selected_branch_id: '',
    employee_name: '',
    employee_phone: '',
    employee_email: '',
    employee_aadhaar: '',
    employee_username: '',
    employee_password: '',
    employee_branch_id: '',
    new_password: '',
    attendance_date: format(new Date(), 'yyyy-MM-dd'),
    leave_status: 'all',
    leave_from_date: '',
    leave_to_date: '',
    activity_date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [filters, setFilters] = useState({
    branch_id: 'all',
    status: 'all',
    search: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = user?.token;

  // Handle logout
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Check if user is superadmin and fetch core data
  useEffect(() => {
    if (!user || user.role !== 'superadmin') {
      setError('Access denied: You must be a superadmin to view this page');
      setLoading(false);
      return;
    }
    fetchCoreData();
  }, [user]);

  // Fetch tab-specific data when tab changes or filters change
  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchAttendance();
    } else if (activeTab === 'leaves') {
      fetchLeaveApplications();
    } else if (activeTab === 'activities') {
      fetchActivityReports();
    }
  }, [activeTab, formData.branch_id, formData.attendance_date, formData.leave_status, formData.leave_from_date, formData.leave_to_date, formData.activity_date]);

  // Filter employees when filters or employees change
  useEffect(() => {
    filterEmployees();
  }, [employees, filters]);

  const fetchCoreData = async () => {
    if (!token) {
      setError('Authentication error: No token available');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await Promise.all([
        fetchBranches(),
        fetchAdmins(),
        fetchEmployees(),
        fetchStats(),
      ]);
    } catch (error) {
      setError('Failed to load core dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/superadmin/branches-info`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setBranches(data);
      } else {
        throw new Error('Failed to fetch branches');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/superadmin/admins`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      } else {
        throw new Error('Failed to fetch admins');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/superadmin/employees`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else {
        throw new Error('Failed to fetch employees');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/superadmin/stats`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        throw new Error('Failed to fetch stats');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchAttendance = async () => {
    setTabLoading(true);
    try {
      const query = new URLSearchParams();
      if (formData.branch_id !== 'all') query.append('branch_id', formData.branch_id);
      if (formData.attendance_date) query.append('date', formData.attendance_date); // Assume backend supports ?date= for date filter
      const response = await fetch(`${API_BASE_URL}/api/superadmin/attendance/daily?${query.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data);
      } else {
        throw new Error('Failed to fetch attendance');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setTabLoading(false);
    }
  };

  const fetchLeaveApplications = async () => {
    setTabLoading(true);
    try {
      const query = new URLSearchParams();
      if (formData.branch_id !== 'all') query.append('branch_id', formData.branch_id);
      if (formData.leave_status !== 'all') query.append('status', formData.leave_status);
      if (formData.leave_from_date) query.append('from_date', formData.leave_from_date);
      if (formData.leave_to_date) query.append('to_date', formData.leave_to_date);
      const response = await fetch(`${API_BASE_URL}/api/superadmin/leaves?${query.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setLeaveApplications(data);
      } else {
        throw new Error('Failed to fetch leave applications');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setTabLoading(false);
    }
  };

  const fetchActivityReports = async () => {
    setTabLoading(true);
    try {
      const query = new URLSearchParams();
      if (formData.branch_id !== 'all') query.append('branch_id', formData.branch_id);
      if (formData.activity_date) query.append('date', formData.activity_date);
      const response = await fetch(`${API_BASE_URL}/api/superadmin/activities?${query.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setActivityReports(data);
      } else {
        throw new Error('Failed to fetch activity reports');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setTabLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];
    if (filters.branch_id !== 'all') {
      filtered = filtered.filter(emp => filters.branch_id === 'unallocated' ? !emp.branch_id : emp.branch_id == filters.branch_id);
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter(emp => filters.status === 'active' ? emp.is_active : !emp.is_active);
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.full_name?.toLowerCase().includes(searchTerm) ||
        emp.username?.toLowerCase().includes(searchTerm) ||
        emp.email_id?.toLowerCase().includes(searchTerm) ||
        emp.phone_no?.includes(searchTerm)
      );
    }
    setFilteredEmployees(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDownloadReport = async (type, params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/api/superadmin/${type}/download?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        alert(errorData.error || `Failed to download ${type} report`);
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  if (!user || user.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage branches, administrators, employees, and reports</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.username || 'Super Administrator'}</p>
                <p className="text-xs text-gray-500">Full System Access</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="text-gray-400 hover:text-gray-600"
                title="Refresh"
              >
                <RefreshCw className="h-6 w-6" />
              </button>
              <button
                className="text-gray-400 hover:text-gray-600"
                title="Settings"
              >
                <Settings className="h-6 w-6" />
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-600 flex items-center space-x-2"
                title="Logout"
              >
                <LogOut className="h-6 w-6" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'branches', name: 'Branches', icon: Building2 },
              { id: 'admins', name: 'Administrators', icon: Shield },
              { id: 'employees', name: 'Employees', icon: Users },
              { id: 'attendance', name: 'Attendance', icon: Calendar },
              { id: 'leaves', name: 'Leaves', icon: FileText },
              { id: 'activities', name: 'Activities', icon: MapPin },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {tabLoading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-600">Loading tab data...</p>
          </div>
        )}
        {activeTab === 'overview' && (
          <OverviewTab stats={stats} activityReports={activityReports} leaveApplications={leaveApplications} />
        )}
        {activeTab === 'branches' && (
          <BranchesTab
            branches={branches}
            admins={admins}
            setShowAddBranchModal={setShowAddBranchModal}
            handleDeleteBranch={async (branchId) => {
              if (!confirm('Are you sure you want to delete this branch? This action cannot be undone.')) return;
              try {
                const response = await fetch(`${API_BASE_URL}/api/superadmin/branch/${branchId}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                });
                if (response.ok) {
                  await fetchBranches();
                  await fetchAdmins();
                  await fetchStats();
                  alert('Branch deleted successfully!');
                } else {
                  const errorData = await response.json();
                  alert(errorData.error || 'Failed to delete branch');
                }
              } catch (error) {
                alert('Network error. Please try again.');
              }
            }}
            setActiveTab={setActiveTab}
            setFilters={setFilters}
          />
        )}
        {activeTab === 'admins' && (
          <AdminsTab
            admins={admins}
            branches={branches}
            setShowAddAdminModal={setShowAddAdminModal}
            handleDeleteAdmin={async (adminId) => {
              if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.')) return;
              try {
                const response = await fetch(`${API_BASE_URL}/api/superadmin/admin/${adminId}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                });
                if (response.ok) {
                  await fetchAdmins();
                  await fetchStats();
                  alert('Admin deleted successfully!');
                } else {
                  const errorData = await response.json();
                  alert(errorData.error || 'Failed to delete admin');
                }
              } catch (error) {
                alert('Network error. Please try again.');
              }
            }}
          />
        )}
        {activeTab === 'employees' && (
          <EmployeesTab
            employees={employees}
            filteredEmployees={filteredEmployees}
            branches={branches}
            filters={filters}
            handleFilterChange={handleFilterChange}
            setShowAddEmployeeModal={setShowAddEmployeeModal}
            setShowEditEmployeeModal={setShowEditEmployeeModal}
            setShowAssignBranchModal={setShowAssignBranchModal}
            setShowResetPasswordModal={setShowResetPasswordModal}
            setSelectedEmployee={setSelectedEmployee}
            setFormData={setFormData}
            handleToggleEmployeeStatus={async (emp_id, currentStatus) => {
              if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this employee?`)) return;
              try {
                const response = await fetch(`${API_BASE_URL}/api/superadmin/employees/${emp_id}/status`, {
                  method: 'PUT',
                  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ is_active: !currentStatus }),
                });
                if (response.ok) {
                  await fetchEmployees();
                  await fetchStats();
                  alert(`Employee ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
                } else {
                  const errorData = await response.json();
                  alert(errorData.error || 'Failed to update employee status');
                }
              } catch (error) {
                alert('Network error. Please try again.');
              }
            }}
            handleDeleteEmployee={async (empId, empName) => {
              if (!confirm(`Are you sure you want to delete employee "${empName}"? This action cannot be undone and will remove all associated data.`)) return;
              try {
                const response = await fetch(`${API_BASE_URL}/api/superadmin/employees/${empId}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                });
                if (response.ok) {
                  await fetchEmployees();
                  await fetchStats();
                  alert('Employee deleted successfully!');
                } else {
                  const errorData = await response.json();
                  alert(errorData.error || 'Failed to delete employee');
                }
              } catch (error) {
                alert('Network error. Please try again.');
              }
            }}
          />
        )}
        {activeTab === 'attendance' && (
          <AttendanceTab
            branches={branches}
            attendanceRecords={attendanceRecords}
            formData={formData}
            setFormData={setFormData}
            fetchAttendance={fetchAttendance}
            handleDownloadReport={handleDownloadReport}
            handleCloseAttendance={async (attendanceId) => {
              if (!confirm('Are you sure you want to verify this attendance record?')) return;
              try {
                const response = await fetch(`${API_BASE_URL}/api/superadmin/attendance/${attendanceId}/close`, {
                  method: 'PUT',
                  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ remarks: 'ADMIN_VERIFIED' }),
                });
                if (response.ok) {
                  await fetchAttendance();
                  alert('Attendance verified successfully!');
                } else {
                  const errorData = await response.json();
                  alert(errorData.error || 'Failed to verify attendance');
                }
              } catch (error) {
                alert('Network error. Please try again.');
              }
            }}
            handleRejectAttendance={async (attendanceId) => {
              if (!confirm('Are you sure you want to reject this attendance record?')) return;
              try {
                const response = await fetch(`${API_BASE_URL}/api/superadmin/attendance/${attendanceId}/reject`, {
                  method: 'PUT',
                  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ remarks: 'Rejected by Superadmin' }),
                });
                if (response.ok) {
                  await fetchAttendance();
                  alert('Attendance rejected successfully!');
                } else {
                  const errorData = await response.json();
                  alert(errorData.error || 'Failed to reject attendance');
                }
              } catch (error) {
                alert('Network error. Please try again.');
              }
            }}
          />
        )}
        {activeTab === 'leaves' && (
          <LeavesTab
            branches={branches}
            leaveApplications={leaveApplications}
            formData={formData}
            setFormData={setFormData}
            fetchLeaveApplications={fetchLeaveApplications}
            handleDownloadReport={handleDownloadReport}
            handleUpdateLeaveStatus={async (leaveId, status) => {
              if (!confirm(`Are you sure you want to ${status.toLowerCase()} this leave application?`)) return;
              try {
                const response = await fetch(`${API_BASE_URL}/api/superadmin/leaves/${leaveId}/status`, {
                  method: 'PUT',
                  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status }),
                });
                if (response.ok) {
                  await fetchLeaveApplications();
                  alert(`Leave application ${status.toLowerCase()} successfully!`);
                } else {
                  const errorData = await response.json();
                  alert(errorData.error || `Failed to ${status.toLowerCase()} leave`);
                }
              } catch (error) {
                alert('Network error. Please try again.');
              }
            }}
            handleDeleteLeave={async (leaveId) => {
              if (!confirm('Are you sure you want to delete this leave application?')) return;
              try {
                const response = await fetch(`${API_BASE_URL}/api/superadmin/leaves/${leaveId}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                });
                if (response.ok) {
                  await fetchLeaveApplications();
                  alert('Leave application deleted successfully!');
                } else {
                  const errorData = await response.json();
                  alert(errorData.error || 'Failed to delete leave application');
                }
              } catch (error) {
                alert('Network error. Please try again.');
              }
            }}
          />
        )}
        {activeTab === 'activities' && (
          <ActivitiesTab
            branches={branches}
            activityReports={activityReports}
            formData={formData}
            setFormData={setFormData}
            fetchActivityReports={fetchActivityReports}
            handleDownloadReport={handleDownloadReport}
            handleDeleteActivity={async (activityId) => {
              if (!confirm('Are you sure you want to delete this activity report?')) return;
              try {
                const response = await fetch(`${API_BASE_URL}/api/superadmin/activities/${activityId}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                });
                if (response.ok) {
                  await fetchActivityReports();
                  alert('Activity report deleted successfully!');
                } else {
                  const errorData = await response.json();
                  alert(errorData.error || 'Failed to delete activity report');
                }
              } catch (error) {
                alert('Network error. Please try again.');
              }
            }}
          />
        )}
      </main>

      <AddBranchModal
        show={showAddBranchModal}
        setShow={setShowAddBranchModal}
        formData={formData}
        setFormData={setFormData}
        error={error}
        setError={setError}
        submitting={submitting}
        setSubmitting={setSubmitting}
        fetchBranches={fetchBranches}
        fetchStats={fetchStats}
        token={token}
      />
      <AddAdminModal
        show={showAddAdminModal}
        setShow={setShowAddAdminModal}
        formData={formData}
        setFormData={setFormData}
        error={error}
        setError={setError}
        submitting={submitting}
        setSubmitting={setSubmitting}
        branches={branches}
        admins={admins}
        fetchAdmins={fetchAdmins}
        fetchStats={fetchStats}
        token={token}
      />
      <AddEmployeeModal
        show={showAddEmployeeModal}
        setShow={setShowAddEmployeeModal}
        formData={formData}
        setFormData={setFormData}
        error={error}
        setError={setError}
        submitting={submitting}
        setSubmitting={setSubmitting}
        branches={branches}
        fetchEmployees={fetchEmployees}
        fetchStats={fetchStats}
        token={token}
      />
      <EditEmployeeModal
        show={showEditEmployeeModal}
        setShow={setShowEditEmployeeModal}
        formData={formData}
        setFormData={setFormData}
        error={error}
        setError={setError}
        submitting={submitting}
        setSubmitting={setSubmitting}
        branches={branches}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        fetchEmployees={fetchEmployees}
        fetchStats={fetchStats}
        token={token}
      />
      <AssignBranchModal
        show={showAssignBranchModal}
        setShow={setShowAssignBranchModal}
        formData={formData}
        setFormData={setFormData}
        error={error}
        setError={setError}
        submitting={submitting}
        setSubmitting={setSubmitting}
        branches={branches}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        fetchEmployees={fetchEmployees}
        fetchStats={fetchStats}
        token={token}
      />
      <ResetPasswordModal
        show={showResetPasswordModal}
        setShow={setShowResetPasswordModal}
        formData={formData}
        setFormData={setFormData}
        error={error}
        setError={setError}
        submitting={submitting}
        setSubmitting={setSubmitting}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        token={token}
      />
    </div>
  );
};

export default SuperadminDashboard;