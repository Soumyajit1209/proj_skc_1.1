import React from 'react';
import { Printer, X } from 'lucide-react';

const EmployeeAttendanceReportModal = ({ data, onClose, onBackdropClick, calculateWorkingHours }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      onClick={onBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Employee Attendance Report</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
            >
              <Printer size={16} />
              <span>Print</span>
            </button>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-700">Employee: {data.employee.full_name} (ID: {data.employee.emp_id})</h3>
          <p className="text-sm text-gray-600">Total Days: {data.summary.totalDays}</p>
          <p className="text-sm text-green-600">Present: {data.summary.presentDays}</p>
          <p className="text-sm text-red-600">Absent: {data.summary.absentDays}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-400">
              <tr>
                {['Date', 'Check In', 'Check Out', 'Working Hours', 'Status'].map((header) => (
                  <th key={header} className="px-4 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.attendance.map((record) => (
                <tr key={record.attendance_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{record.attendance_date}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.in_time || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.out_time || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{calculateWorkingHours(record.in_time, record.out_time)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${data.getStatusColor(record.in_status)}`}>
                      {record.in_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendanceReportModal;