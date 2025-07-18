import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const RejectModal = ({ record, remarks, setRemarks, onReject, onClose, onBackdropClick }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onBackdropClick}>
    <div className="bg-white rounded-lg w-full max-w-md">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <AlertCircle className="mr-2 text-red-600" size={20} />
          Reject Attendance
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>
      <div className="p-4">
        <p className="text-gray-600 mb-3 text-sm">
          Are you sure you want to reject attendance for <strong>{record.full_name}</strong> on {record.attendance_date}?
        </p>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Required)</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Enter reason for rejection..."
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={onReject} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
            Reject
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default RejectModal;