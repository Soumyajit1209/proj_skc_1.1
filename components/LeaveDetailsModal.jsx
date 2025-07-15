import React from 'react'
import { X, FileText , Check } from 'lucide-react';
import { getStatusColor } from '@/utils/getStatusColor';
import { getLeaveTypeColor } from '@/utils/getLeaveTypeColor';

const LeaveDetailsModal = ({ showDetailModal, setShowDetailModal, selectedLeave, handleStatusChange }) => {
  if (!showDetailModal || !selectedLeave) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Leave Application Details</h2>
            <button
              onClick={() => setShowDetailModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave ID</label>
              <p className="text-sm text-gray-900">{selectedLeave.leave_id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
              <p className="text-sm text-gray-900">{selectedLeave.emp_id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
              <p className="text-sm text-gray-900">{selectedLeave.full_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Date</label>
              <p className="text-sm text-gray-900">{new Date(selectedLeave.application_datetime).toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getLeaveTypeColor(selectedLeave.leave_type)}`}>
                {selectedLeave.leave_type}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(selectedLeave.status)}`}>
                {selectedLeave.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <p className="text-sm text-gray-900">{selectedLeave.start_date}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <p className="text-sm text-gray-900">{selectedLeave.end_date}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Days</label>
              <p className="text-sm text-gray-900">{selectedLeave.total_days} days</p>
            </div>
            {selectedLeave.approved_by && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approved By</label>
                  <p className="text-sm text-gray-900">{selectedLeave.approved_by_username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approved On</label>
                  <p className="text-sm text-gray-900">{new Date(selectedLeave.approved_on).toLocaleString()}</p>
                </div>
              </>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedLeave.reason}</p>
          </div>
          {selectedLeave.leave_attachment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <a href="#" className="text-blue-600 hover:text-blue-800 text-sm underline">
                  {selectedLeave.leave_attachment}
                </a>
              </div>
            </div>
          )}
        </div>
        {selectedLeave.status === 'PENDING' && (
          <div className="p-4 sm:p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => {
                handleStatusChange(selectedLeave.leave_id, 'REJECTED');
                setShowDetailModal(false);
              }}
              className="px-3 sm:px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 inline mr-1" />
              Reject
            </button>
            <button
              onClick={() => {
                handleStatusChange(selectedLeave.leave_id, 'APPROVED');
                setShowDetailModal(false);
              }}
              className="px-3 sm:px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              <Check className="h-4 w-4 sm:h-5 sm:w-5 inline mr-1" />
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveDetailsModal
