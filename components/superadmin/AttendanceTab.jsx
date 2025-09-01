import React from 'react';
import { Download, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const AttendanceTab = ({ branches, attendanceRecords, formData, setFormData, fetchAttendance, handleDownloadReport, handleCloseAttendance, handleRejectAttendance }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Attendance Management</h3>
        <button
          onClick={() => handleDownloadReport('attendance/daily', { branch_id: formData.branch_id })}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Download Report</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="attendance_branch" className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select
              id="attendance_branch"
              name="branch_id"
              value={formData.branch_id}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, branch_id: e.target.value }));
                fetchAttendance();
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
            <label htmlFor="attendance_date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              id="attendance_date"
              name="attendance_date"
              value={formData.attendance_date}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, attendance_date: e.target.value }));
                fetchAttendance();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFormData(prev => ({ ...prev, attendance_date: format(new Date(), 'yyyy-MM-dd'), branch_id: 'all' }));
                fetchAttendance();
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
              {['Employee', 'Date', 'In Time', 'Out Time', 'Status', 'Remarks', 'Actions'].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendanceRecords.map((record) => (
              <tr key={record.attendance_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{record.full_name}</div>
                  <div className="text-sm text-gray-500">@{record.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(record.attendance_date), 'PP')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.in_time || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.out_time || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    record.in_status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    record.in_status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {record.in_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.remarks || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCloseAttendance(record.attendance_id)}
                      className="text-green-600 hover:text-green-900"
                      title="Verify Attendance"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRejectAttendance(record.attendance_id)}
                      className="text-red-600 hover:text-red-900"
                      title="Reject Attendance"
                    >
                      <XCircle className="h-4 w-4" />
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

export default AttendanceTab;