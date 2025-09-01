import React from 'react';
import { Download, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const ActivitiesTab = ({ branches, activityReports, formData, setFormData, fetchActivityReports, handleDownloadReport, handleDeleteActivity }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Activity Reports</h3>
        <button
          onClick={() => handleDownloadReport('activities', {
            from_date: formData.activity_date,
            branch_id: formData.branch_id,
          })}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Download Report</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="activity_branch" className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select
              id="activity_branch"
              name="branch_id"
              value={formData.branch_id}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, branch_id: e.target.value }));
                fetchActivityReports();
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
            <label htmlFor="activity_date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              id="activity_date"
              name="activity_date"
              value={formData.activity_date}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, activity_date: e.target.value }));
                fetchActivityReports();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFormData(prev => ({ ...prev, activity_date: format(new Date(), 'yyyy-MM-dd'), branch_id: 'all' }));
                fetchActivityReports();
              }}
              className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Employee', 'Customer', 'Date', 'Location', 'Remarks', 'Actions'].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activityReports.map((activity) => (
              <tr key={activity.activity_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{activity.full_name}</div>
                  <div className="text-sm text-gray-500">@{activity.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.customer_name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(activity.activity_datetime), 'PPp')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.location || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.remarks || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDeleteActivity(activity.activity_id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete Activity"
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

export default ActivitiesTab;