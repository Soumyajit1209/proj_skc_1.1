import React from 'react';
import { Building2, Plus, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const BranchesTab = ({ branches, admins, setShowAddBranchModal, handleDeleteBranch, setActiveTab, setFilters }) => {
  return (
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Branch Name', 'Admin', 'Employees', 'Active/Total', 'Created Date', 'Actions'].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{branch.admin_username || 'No Admin'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{branch.employee_count || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="text-green-600">{branch.active_employees || 0}</span>
                  <span className="text-gray-400">/</span>
                  <span>{branch.employee_count || 0}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(branch.created_at), 'PP')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setFilters(prev => ({ ...prev, branch_id: branch.branch_id.toString() }));
                        setActiveTab('employees');
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View Employees"
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
  );
};

export default BranchesTab;