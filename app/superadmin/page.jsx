"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Building2, Users, Shield, Settings, BarChart3, Calendar, MapPin, FileText, Edit, Trash2, Eye, LogOut, UserPlus, UserX, UserCheck, Search, Filter, Download, Key, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

const SuperadminDashboard = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [branches, setBranches] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [stats, setStats] = useState({
    totalBranches: 0,
    totalAdmins: 0,
    totalEmployees: 0,
    activeUsers: 0,
    unallocatedEmployees: 0
  });
  const [loading, setLoading] = useState(true);
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
    new_password: ''
  });
  const [filters, setFilters] = useState({
    branch_id: 'all',
    status: 'all',
    search: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = user?.token;

  // Handle logout
  const handleLogout = () => {
    console.log('Logging out superadmin');
    logout();
    router.push('/login');
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

  // Filter employees when filters change
  useEffect(() => {
    filterEmployees();
  }, [employees, filters]);

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
        fetchEmployees(),
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
      const response = await fetch(`${API_BASE_URL}/api/superadmin/branches-info`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
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
      const response = await fetch(`${API_BASE_URL}/api/superadmin/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
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

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/superadmin/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
      setError(error.message);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/superadmin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
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
        totalEmployees: employees.length,
        activeUsers: employees.filter(emp => emp.is_active).length,
        unallocatedEmployees: employees.filter(emp => !emp.branch_id).length
      });
      setError(error.message);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    if (filters.branch_id !== 'all') {
      if (filters.branch_id === 'unallocated') {
        filtered = filtered.filter(emp => !emp.branch_id);
      } else {
        filtered = filtered.filter(emp => emp.branch_id == filters.branch_id);
      }
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(emp => 
        filters.status === 'active' ? emp.is_active : !emp.is_active
      );
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddBranch = async () => {
    if (!formData.branch_name.trim()) {
      setError('Branch name is required');
      return;
    }

    setSubmitting(true);
    try {
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

  const handleAddEmployee = async () => {
    if (!formData.employee_name.trim() || !formData.employee_phone.trim() || 
        !formData.employee_username.trim() || !formData.employee_password.trim()) {
      setError('Name, phone, username, and password are required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/superadmin/employees`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: formData.employee_name.trim(),
          phone_no: formData.employee_phone.trim(),
          email_id: formData.employee_email.trim() || null,
          aadhaar_no: formData.employee_aadhaar.trim() || null,
          username: formData.employee_username.trim(),
          password: formData.employee_password,
          branch_id: formData.employee_branch_id || null
        })
      });

      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({
          ...prev,
          employee_name: '',
          employee_phone: '',
          employee_email: '',
          employee_aadhaar: '',
          employee_username: '',
          employee_password: '',
          employee_branch_id: ''
        }));
        setShowAddEmployeeModal(false);
        await fetchEmployees();
        await fetchStats();
        alert('Employee added successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add employee');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignBranch = async () => {
    if (!selectedEmployee || !formData.selected_branch_id) {
      setError('Please select a branch');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/superadmin/employees/${selectedEmployee.emp_id}/assign-branch`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emp_id: selectedEmployee.emp_id,
          branch_id: parseInt(formData.selected_branch_id)
        })
      });

      if (response.ok) {
        const result = await response.json();
        setShowAssignBranchModal(false);
        setSelectedEmployee(null);
        setFormData(prev => ({ ...prev, selected_branch_id: '' }));
        await fetchEmployees();
        await fetchStats();
        alert('Employee assigned to branch successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to assign employee to branch');
      }
    } catch (error) {
      console.error('Error assigning employee to branch:', error);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleEmployeeStatus = async (emp_id, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this employee?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/superadmin/employees/${emp_id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_active: !currentStatus
        })
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
      console.error('Error updating employee status:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedEmployee || !formData.new_password.trim()) {
      setError('New password is required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/superadmin/employees/${selectedEmployee.emp_id}/reset-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          new_password: formData.new_password
        })
      });

      if (response.ok) {
        const result = await response.json();
        setShowResetPasswordModal(false);
        setSelectedEmployee(null);
        setFormData(prev => ({ ...prev, new_password: '' }));
        alert('Password reset successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
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

  const handleDeleteEmployee = async (empId, empName) => {
    if (!confirm(`Are you sure you want to delete employee "${empName}"? This action cannot be undone and will remove all associated data.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/superadmin/employees/${empId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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
      console.error('Error deleting employee:', error);
      alert('Network error. Please try again.');
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
              <UserCheck className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-orange-600">{stats.activeUsers}</p>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg mr-4">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-red-600">{stats.unallocatedEmployees}</p>
              <p className="text-sm text-gray-600">Unallocated</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Branch Overview</h3>
          <div className="space-y-3">
            {branches.slice(0, 5).map((branch) => (
              <div key={branch.branch_id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">{branch.branch_name}</span>
                </div>
                <div className="flex space-x-4 text-xs text-gray-500">
                  <span>{branch.active_employees} active</span>
                  <span>{branch.employee_count} total</span>
                </div>
              </div>
            ))}
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
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active/Total
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
              {branches.map((branch) => (
                <tr key={branch.branch_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-900">{branch.branch_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {branch.admin_username || 'No Admin'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {branch.employee_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="text-green-600">{branch.active_employees || 0}</span>
                    <span className="text-gray-400">/</span>
                    <span>{branch.employee_count || 0}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(branch.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View Details"
                        onClick={() => {
                          setFilters(prev => ({ ...prev, branch_id: branch.branch_id.toString() }));
                          setActiveTab('employees');
                        }}
                      >
                        <Eye className="h-4 w-4" />
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

  const renderEmployees = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Employee Management</h3>
        <button
          onClick={() => setShowAddEmployeeModal(true)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="branch_filter" className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <select
              id="branch_filter"
              name="branch_id"
              value={filters.branch_id}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="all">All Branches</option>
              <option value="unallocated">Unallocated</option>
              {branches.map((branch) => (
                <option key={branch.branch_id} value={branch.branch_id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status_filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status_filter"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label htmlFor="search_filter" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                id="search_filter"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search employees..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ branch_id: 'all', status: 'all', search: '' })}
              className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredEmployees.length} of {employees.length} employees
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.emp_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <Users className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{employee.full_name}</div>
                        <div className="text-sm text-gray-500">@{employee.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.phone_no}</div>
                    <div className="text-sm text-gray-500">{employee.email_id || 'No email'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.branch_name || (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Unallocated
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      employee.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(employee.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setShowAssignBranchModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Assign Branch"
                      >
                        <Building2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleEmployeeStatus(employee.emp_id, employee.is_active)}
                        className={`${employee.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        title={employee.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {employee.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setShowResetPasswordModal(true);
                        }}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Reset Password"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.emp_id, employee.full_name)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Employee"
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
                <p className="text-sm text-gray-500">Manage branches, administrators, and employees</p>
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
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'branches', name: 'Branches', icon: Building2 },
              { id: 'admins', name: 'Administrators', icon: Shield },
              { id: 'employees', name: 'Employees', icon: Users }
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
        {activeTab === 'employees' && renderEmployees()}
      </main>

      {/* Add Branch Modal */}
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

      {/* Add Admin Modal */}
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

      {/* Add Employee Modal */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Employee</h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="employee_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="employee_name"
                  name="employee_name"
                  value={formData.employee_name}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label htmlFor="employee_phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="employee_phone"
                  name="employee_phone"
                  value={formData.employee_phone}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label htmlFor="employee_email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="employee_email"
                  name="employee_email"
                  value={formData.employee_email}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label htmlFor="employee_aadhaar" className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhaar Number (Optional)
                </label>
                <input
                  type="text"
                  id="employee_aadhaar"
                  name="employee_aadhaar"
                  value={formData.employee_aadhaar}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  placeholder="Enter Aadhaar number"
                />
              </div>
              <div>
                <label htmlFor="employee_username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  id="employee_username"
                  name="employee_username"
                  value={formData.employee_username}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label htmlFor="employee_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  id="employee_password"
                  name="employee_password"
                  value={formData.employee_password}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label htmlFor="employee_branch_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Branch (Optional)
                </label>
                <select
                  id="employee_branch_id"
                  name="employee_branch_id"
                  value={formData.employee_branch_id}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                >
                  <option value="">No Branch Assignment</option>
                  {branches.map((branch) => (
                    <option key={branch.branch_id} value={branch.branch_id}>
                      {branch.branch_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddEmployeeModal(false);
                  setError('');
                  setFormData(prev => ({
                    ...prev,
                    employee_name: '',
                    employee_phone: '',
                    employee_email: '',
                    employee_aadhaar: '',
                    employee_username: '',
                    employee_password: '',
                    employee_branch_id: ''
                  }));
                }}
                disabled={submitting}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEmployee}
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Add Employee'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Branch Modal */}
      {showAssignBranchModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Branch</h3>
            
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Employee:</strong> {selectedEmployee.full_name}
              </p>
              <p className="text-sm text-blue-700">
                <strong>Current Branch:</strong> {selectedEmployee.branch_name || 'Unallocated'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="assign_branch_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Branch
                </label>
                <select
                  id="assign_branch_id"
                  name="selected_branch_id"
                  value={formData.selected_branch_id}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Choose a branch</option>
                  {branches.map((branch) => (
                    <option key={branch.branch_id} value={branch.branch_id}>
                      {branch.branch_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignBranchModal(false);
                  setSelectedEmployee(null);
                  setError('');
                  setFormData(prev => ({ ...prev, selected_branch_id: '' }));
                }}
                disabled={submitting}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignBranch}
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Assigning...' : 'Assign Branch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reset Password</h3>
            
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                <strong>Employee:</strong> {selectedEmployee.full_name}
              </p>
              <p className="text-sm text-yellow-700">
                <strong>Username:</strong> {selectedEmployee.username}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500"
                  placeholder="Enter new password"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setSelectedEmployee(null);
                  setError('');
                  setFormData(prev => ({ ...prev, new_password: '' }));
                }}
                disabled={submitting}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={submitting}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperadminDashboard;