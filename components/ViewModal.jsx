import React from 'react';
import { User, Clock, MapPin, FileText, X } from 'lucide-react';

const ViewModal = ({ record, onClose, getStatusColor, calculateWorkingHours, onBackdropClick }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onBackdropClick}>
    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Attendance Details</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <User className="mr-2" size={20} />
              Employee Information
            </h3>
            <div className="space-y-2">
              <div>
                <label className="font-medium text-gray-700 text-sm">Name:</label>
                <p className="text-gray-600 text-sm">{record.full_name}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700 text-sm">Employee ID:</label>
                <p className="text-gray-600 text-sm">{record.emp_id}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700 text-sm">Date:</label>
                <p className="text-gray-600 text-sm">{record.attendance_date}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700 text-sm">Status:</label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.in_status)}`}>
                  {record.in_status}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Clock className="mr-2" size={20} />
              Time Information
            </h3>
            <div className="space-y-2">
              <div>
                <label className="font-medium text-gray-700 text-sm">Check In:</label>
                <p className="text-gray-600 text-sm">{record.in_time || 'N/A'}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700 text-sm">Check Out:</label>
                <p className="text-gray-600 text-sm">{record.out_time || 'N/A'}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700 text-sm">Working Hours:</label>
                <p className="text-gray-600 text-sm">{calculateWorkingHours(record.in_time, record.out_time)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <MapPin className="mr-2" size={20} />
            Location Information
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 text-sm mb-1">Check In Location</h4>
              <p className="text-gray-600 text-sm">{record.in_location || 'N/A'}</p>
              {record.in_latitude && record.in_longitude && (
                <p className="text-xs text-gray-500 mt-1">Lat: {record.in_latitude}, Long: {record.in_longitude}</p>
              )}
            </div>
            <div>
              <h4 className="font-medium text-gray-700 text-sm mb-1">Check Out Location</h4>
              <p className="text-gray-600 text-sm">{record.out_location || 'N/A'}</p>
              {record.out_latitude && record.out_longitude && (
                <p className="text-xs text-gray-500 mt-1">Lat: {record.out_latitude}, Long: {record.out_longitude}</p>
              )}
            </div>
          </div>
        </div>
        {record.remarks && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <FileText className="mr-2" size={20} />
              Remarks
            </h3>
            <p className="text-gray-600 bg-gray-50 p-2 rounded-lg text-sm">{record.remarks}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default ViewModal;