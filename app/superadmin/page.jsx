"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Building2, Users, Shield, Settings, BarChart3, Calendar, MapPin, FileText, Edit, Trash2, Eye, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

const SuperadminDashboard = () => {
  const { user, logout } = useAuth(); // Get user and logout from AuthContext
  const router = useRouter(); // For redirection after logout
  const [activeTab, setActiveTab] = useState('overview');
  const [branches, setBranches] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [stats, setStats] = useState({
    totalBranches: 0,
    totalAdmins: 0,
    totalEmployees: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [formData, setFormData] = useState({
    branch_name: '',
    admin_username: '',
    admin_password: '',
    admin_email: '',
    selected_branch_id: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL
  const token = user?.token;

  // Handle logout
  const handleLogout = () => {
    console.log('Logging out superadmin');
    logout(); // Clear AuthContext and cookies
    router.push('/login'); // Redirect to login page
  };

  // Check if user is superadmin
  useEffect(() => {
    if (!user || user.role !== 'superadmin') {
      console.error('Access denied: Not a superadmin');
      setError('Access denied: You must be a superadmin to view this page');
      return;
    }
    fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    if (!token) {
      console.error('No token available for API requests');
      setError('Authentication error: No token available');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await Promise.all([
        fetchBranches(),
        fetchAdmins(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      console.log('Fetching branches with token:', token);
      const response = await fetch(`${API_BASE_URL}/api/admin/branches`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Branches fetched:', data);
        setBranches(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch branches');
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]);
      setError(error.message);
    }
  };

  const fetchAdmins = async () => {
    try {
      console.log('Fetching admins with token:', token);
      const response = await fetch(`${API_BASE_URL}/api/superadmin/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Admins fetched:', data);
        setAdmins(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch admins');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      setAdmins([]);
      setError(error.message);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Fetching stats with token:', token);
      const response = await fetch(`${API_BASE_URL}/api/superadmin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Stats fetched:', data);
        setStats(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalBranches: branches.length,
        totalAdmins: admins.length,
        totalEmployees: 0,
        activeUsers: 0
      });
      setError(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleAddBranch = async () => {
    if (!formData.branch_name.trim()) {
      setError('Branch name is required');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Adding branch with token:', token);
      const response = await fetch(`${API_BASE_URL}/api/superadmin/add-branch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          branch_name: formData.branch_name.trim()
        })
      });

      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({ ...prev, branch_name: '' }));
        setShowAddBranchModal(false);
        await fetchBranches();
        await fetchStats();
        alert('Branch added successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add branch');
      }
    } catch (error) {
      console.error('Error adding branch:', error);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!formData.admin_username.trim() || !formData.admin_password.trim() || !formData.selected_branch_id) {
      setError('Username, password, and branch selection are required');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Adding admin with token:', token);
      const response = await fetch(`${API_BASE_URL}/api/superadmin/add-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.admin_username.trim(),
          password: formData.admin_password,
          email_id: formData.admin_email.trim() || null,
          branch_id: parseInt(formData.selected_branch_id)
        })
      });

      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({
          ...prev,
          admin_username: '',
          admin_password: '',
          admin_email: '',
          selected_branch_id: ''
        }));
        setShowAddAdminModal(false);
        await fetchAdmins();
        await fetchStats();
        alert('Admin added successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add admin');
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBranch = async (branchId) => {
    if (!confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Deleting branch with token:', token);
      const response = await fetch(`${API_BASE_URL}/api/superadmin/branch/${branchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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
      console.error('Error deleting branch:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Deleting admin with token:', token);
      const response = await fetch(`${API_BASE_URL}/api/superadmin/admin/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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
      console.error('Error deleting admin:', error);
      alert('Network error. Please try again.');
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-blue-600">{stats.totalBranches}</p>
              <p className="text-sm text-gray-600">Total Branches</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-4">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-purple-600">{stats.totalAdmins}</p>
              <p className="text-sm text-gray-600">Branch Admins</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-green-600">{stats.totalEmployees}</p>
              <p className="text-sm text-gray-600">Total Employees</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg mr-4">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-orange-600">{stats.activeUsers}</p>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">System Health</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Database Connection</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">API Status</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Online
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Last Backup</span>
            <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBranches = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Branch Management</h3>
        <button
          onClick={() => setShowAddBranchModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Branch</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admins
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {branches.map((branch) => (
                <tr key={branch.branch_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-900">{branch.branch_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(branch.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {admins.filter(admin => admin.branch_id === branch.branch_id).length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {branch.employee_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit Branch"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBranch(branch.branch_id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Branch"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAdmins = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Admin Management</h3>
        <button
          onClick={() => setShowAddAdminModal(true)}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Branch Admin</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-900">{admin.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {admin.email_id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {admin.branch_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit Admin"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Admin"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

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
            onClick={() => window.location.href = '/login'}
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
                <p className="text-sm text-gray-500">Manage branches and administrators</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.username || 'Super Administrator'}</p>
                <p className="text-xs text-gray-500">Full System Access</p>
              </div>
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
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'branches', name: 'Branches', icon: Building2 },
              { id: 'admins', name: 'Administrators', icon: Shield }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
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
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'branches' && renderBranches()}
        {activeTab === 'admins' && renderAdmins()}
      </main>

      {showAddBranchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Branch</h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="branch_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Branch Name
                </label>
                <input
                  type="text"
                  id="branch_name"
                  name="branch_name"
                  value={formData.branch_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter branch name"
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddBranchModal(false);
                  setError('');
                  setFormData(prev => ({ ...prev, branch_name: '' }));
                }}
                disabled={submitting}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBranch}
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Add Branch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Administrator</h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="selected_branch_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Branch
                </label>
                <select
                  id="selected_branch_id"
                  name="selected_branch_id"
                  value={formData.selected_branch_id}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="">Choose a branch</option>
                  {branches
                    .filter(branch => !admins.some(admin => admin.branch_id === branch.branch_id))
                    .map((branch) => (
                      <option key={branch.branch_id} value={branch.branch_id}>
                        {branch.branch_name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label htmlFor="admin_username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="admin_username"
                  name="admin_username"
                  value={formData.admin_username}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label htmlFor="admin_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="admin_password"
                  name="admin_password"
                  value={formData.admin_password}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label htmlFor="admin_email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="admin_email"
                  name="admin_email"
                  value={formData.admin_email}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Enter email address"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddAdminModal(false);
                  setError('');
                  setFormData(prev => ({
                    ...prev,
                    admin_username: '',
                    admin_password: '',
                    admin_email: '',
                    selected_branch_id: ''
                  }));
                }}
                disabled={submitting}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAdmin}
                disabled={submitting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Add Administrator'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperadminDashboard;