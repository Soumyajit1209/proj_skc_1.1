import React from 'react';
import { Download, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const LeavesTab = ({ branches, leaveApplications, formData, setFormData, fetchLeaveApplications, handleDownloadReport, handleUpdateLeaveStatus, handleDeleteLeave }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Leave Applications</h3>
        <button
          onClick={() => handleDownloadReport('leaves', {
            status: formData.leave_status,
            from_date: formData.leave_from_date,
            to_date: formData.leave_to_date,
            branch_id: formData.branch_id,
          })}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Download Report</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="leave_branch" className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select
              id="leave_branch"
              name="branch_id"
              value={formData.branch_id}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, branch_id: e.target.value }));
                fetchLeaveApplications();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="all">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.branch_id} value={branch.branch_id}>{branch.branch_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="leave_status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="leave_status"
              name="leave_status"
              value={formData.leave_status}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, leave_status: e.target.value }));
                fetchLeaveApplications();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div>
            <label htmlFor="leave_from_date" className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              id="leave_from_date"
              name="leave_from_date"
              value={formData.leave_from_date}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, leave_from_date: e.target.value }));
                fetchLeaveApplications();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
          <div>
            <label htmlFor="leave_to_date" className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              id="leave_to_date"
              name="leave_to_date"
              value={formData.leave_to_date}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, leave_to_date: e.target.value }));
                fetchLeaveApplications();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Employee', 'Leave Type', 'Dates', 'Total Days', 'Status', 'Actions'].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaveApplications.map((leave) => (
              <tr key={leave.leave_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{leave.full_name}</div>
                  <div className="text-sm text-gray-500">@{leave.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.leave_type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(leave.start_date), 'PP')} - {format(new Date(leave.end_date), 'PP')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.total_days}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    leave.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {leave.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateLeaveStatus(leave.leave_id, 'APPROVED')}
                      className="text-green-600 hover:text-green-900"
                      title="Approve Leave"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleUpdateLeaveStatus(leave.leave_id, 'REJECTED')}
                      className="text-red-600 hover:text-red-900"
                      title="Reject Leave"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLeave(leave.leave_id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Leave"
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

export default LeavesTab;