import React from 'react';
import { Shield, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminsTab = ({ admins, branches, setShowAddAdminModal, handleDeleteAdmin }) => {
  return (
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Username', 'Email', 'Branch', 'Created Date', 'Actions'].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email_id || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.branch_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(admin.created_at), 'PP')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDeleteAdmin(admin.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete Admin"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminsTab;