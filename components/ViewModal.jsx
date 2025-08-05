import React, { useState } from 'react';
import { User, Clock, MapPin, FileText, X, Camera, Eye, EyeOff } from 'lucide-react';

const ViewModal = ({ record, onClose, getStatusColor, calculateWorkingHours, onBackdropClick }) => {
  const [showInPicture, setShowInPicture] = useState(false);
  const [showOutPicture, setShowOutPicture] = useState(false);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL
  
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Remove leading slash if present to avoid double slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  const ImageViewer = ({ imagePath, title, isVisible, onToggle }) => {
    const imageUrl = getImageUrl(imagePath);
    
    if (!imageUrl) {
      return (
        <div className="text-center py-4">
          <Camera className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-gray-500 text-sm">No {title.toLowerCase()} available</p>
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-700 text-sm">{title}</h4>
          <button
            onClick={onToggle}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
          >
            {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{isVisible ? 'Hide' : 'View'}</span>
          </button>
        </div>
        
        {isVisible && (
          <div className="border rounded-lg p-2 bg-gray-50">
            <img
              src={imageUrl}
              alt={title}
              className="w-full max-w-xs mx-auto rounded-lg shadow-md"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="text-center py-4 text-gray-500 text-sm hidden">
              <Camera size={32} className="mx-auto mb-2" />
              Failed to load image
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onBackdropClick}>
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Attendance Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
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

          {/* Attendance Pictures Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Camera className="mr-2" size={20} />
              Attendance Pictures
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ImageViewer
                imagePath={record.in_picture}
                title="Check In Picture"
                isVisible={showInPicture}
                onToggle={() => setShowInPicture(!showInPicture)}
              />
              <ImageViewer
                imagePath={record.out_picture}
                title="Check Out Picture"
                isVisible={showOutPicture}
                onToggle={() => setShowOutPicture(!showOutPicture)}
              />
            </div>
          </div>

          <div className="mb-4">
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
};

export default ViewModal;