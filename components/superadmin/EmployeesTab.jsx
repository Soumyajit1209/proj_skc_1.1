import React from 'react';
import { Users, UserPlus, Search, Edit, Building2, UserX, UserCheck, Key, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const EmployeesTab = ({
  employees,
  filteredEmployees,
  branches,
  filters,
  handleFilterChange,
  setShowAddEmployeeModal,
  setShowEditEmployeeModal,
  setShowAssignBranchModal,
  setShowResetPasswordModal,
  setSelectedEmployee,
  setFormData,
  handleToggleEmployeeStatus,
  handleDeleteEmployee,
}) => {
  return (
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="branch_filter" className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
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
                <option key={branch.branch_id} value={branch.branch_id}>{branch.branch_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status_filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
            <label htmlFor="search_filter" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
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
              onClick={() => handleFilterChange({ target: { name: 'search', value: '' } })}
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Employee', 'Contact', 'Branch', 'Status', 'Joined', 'Actions'].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmployees.map((employee) => (
              <tr key={employee.emp_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={employee.profile_picture || '/default-avatar.png'}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover mr-3"
                    />
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
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {employee.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(employee.created_at), 'PP')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setFormData(prev => ({
                          ...prev,
                          employee_name: employee.full_name,
                          employee_phone: employee.phone_no || '',
                          employee_email: employee.email_id || '',
                          employee_aadhaar: employee.aadhaar_no || '',
                          employee_username: employee.username,
                          employee_branch_id: employee.branch_id || '',
                          is_active: employee.is_active,
                        }));
                        setShowEditEmployeeModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit Employee"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
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
  );
};

export default EmployeesTab;