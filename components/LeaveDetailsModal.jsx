import React, { useState } from 'react'
import { X, FileText, Check, Eye, Download, Image, FileIcon } from 'lucide-react';
import { getStatusColor } from '@/utils/getStatusColor';
import { getLeaveTypeColor } from '@/utils/getLeaveTypeColor';

const AttachmentModal = ({ isOpen, onClose, attachmentUrl, fileName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  const isImage = (filename) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imageExtensions.includes(getFileExtension(filename));
  };

  const isPDF = (filename) => {
    return getFileExtension(filename) === 'pdf';
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachmentUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">Attachment Preview</h3>
            <span className="text-sm text-gray-500">({fileName})</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4 overflow-auto max-h-[calc(90vh-100px)]">
          {isImage(fileName) ? (
            <div className="text-center">
              <img
                src={attachmentUrl}
                alt={fileName}
                className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                onLoad={() => setLoading(false)}
                onError={() => {
                  setError('Failed to load image');
                  setLoading(false);
                }}
              />
              {loading && (
                <div className="py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading image...</p>
                </div>
              )}
              {error && (
                <div className="py-8 text-red-500">
                  <FileIcon className="h-12 w-12 mx-auto mb-2" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          ) : isPDF(fileName) ? (
            <div className="w-full h-96">
              <iframe
                src={attachmentUrl}
                className="w-full h-full border rounded-lg"
                title={fileName}
                onLoad={() => setLoading(false)}
                onError={() => {
                  setError('Failed to load PDF');
                  setLoading(false);
                }}
              />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading PDF...</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                  <div className="text-center text-red-500">
                    <FileIcon className="h-12 w-12 mx-auto mb-2" />
                    <p>{error}</p>
                    <button
                      onClick={handleDownload}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Download to view
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Preview not available for this file type</p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-2 mx-auto"
              >
                <Download className="h-4 w-4" />
                <span>Download File</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LeaveDetailsModal = ({ showDetailModal, setShowDetailModal, selectedLeave, handleStatusChange }) => {
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);

  if (!showDetailModal || !selectedLeave) return null;

  const getAttachmentUrl = (attachmentPath) => {
    // Construct the full URL to the attachment
    // Adjust this based on your backend URL structure
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${attachmentPath}`;
  };

  const handleAttachmentClick = (e) => {
    e.preventDefault();
    setShowAttachmentModal(true);
  };

  return (
    <>
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
                <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{selectedLeave.leave_attachment}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={handleAttachmentClick}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title="Preview attachment"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <a
                      href={getAttachmentUrl(selectedLeave.leave_attachment)}
                      download={selectedLeave.leave_attachment}
                      className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                      title="Download attachment"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
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

      {/* Attachment Preview Modal */}
      {selectedLeave.leave_attachment && (
        <AttachmentModal
          isOpen={showAttachmentModal}
          onClose={() => setShowAttachmentModal(false)}
          attachmentUrl={getAttachmentUrl(selectedLeave.leave_attachment)}
          fileName={selectedLeave.leave_attachment}
        />
      )}
    </>
  );
};

export default LeaveDetailsModal