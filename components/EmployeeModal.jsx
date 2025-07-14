"use client"

import { useState } from "react"
import { X, User, Upload, Edit2, Check, X as XIcon } from "lucide-react"

const EmployeeModal = ({ employee, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    ...employee,
    is_active: Number(employee.is_active), // Ensure is_active is a number
  });
  const [previewImage, setPreviewImage] = useState(employee.profile_picture || null);
  const [isEditing, setIsEditing] = useState(false);

  // Add CSS to hide scrollbar for webkit browsers
  const hideScrollbarStyle = `
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
  `

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should not exceed 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setFormData({ ...formData, profile_picture: result });
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting formData:', formData, 'is_active type:', typeof formData.is_active);
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = name === "is_active" ? Number.parseInt(value) : value;
    console.log(`Changing ${name} to:`, updatedValue, typeof updatedValue);
    setFormData({
      ...formData,
      [name]: updatedValue,
    });
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    setFormData({
      ...employee,
      is_active: Number(employee.is_active),
    });
    setPreviewImage(employee.profile_picture || null);
    setIsEditing(false);
  };

  const renderField = (fieldName, label, type = "text", required = false, options = null) => {
    const value = formData[fieldName] !== undefined ? formData[fieldName] : "";

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        
        {isEditing ? (
          options ? (
            <select
              name={fieldName}
              value={value.toString()}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
              required={required}
            >
              {options.map(option => (
                <option key={option.value} value={option.value.toString()}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              name={fieldName}
              value={value}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
              required={required}
              placeholder={type === "password" ? "Leave blank to keep current" : ""}
            />
          )
        ) : (
          <div className="w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-md bg-gray-50 min-h-[38px] flex items-center">
            {fieldName === "is_active" ? (
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                value === 1 || value === "1" ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {value === 1 || value === "1" ? 'Active' : 'Inactive'}
              </span>
            ) : type === "password" ? (
              <span className="text-gray-500">••••••••</span>
            ) : (
              <span className="text-gray-900">{value || "Not specified"}</span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: hideScrollbarStyle }} />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-0 hide-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Employee Details</h2>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <button
                  type="button"
                  onClick={toggleEdit}
                  className="flex items-center px-3 py-2 text-sm bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors"
                >
                  <Edit2 size={16} className="mr-2" />
                  Edit
                </button>
              )}
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">Profile Picture</label>
                
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="relative mx-auto sm:mx-0">
                    {previewImage ? (
                      <img
                        src={previewImage || "/placeholder.svg"}
                        alt="Profile Preview"
                        className="w-16 h-16 object-cover rounded-full border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {isEditing && (
                    <label className="cursor-pointer inline-flex items-center justify-center px-3 py-2 bg-sky-50 text-sky-700 rounded-md hover:bg-sky-100 transition-colors text-sm w-full sm:w-auto">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="lg:col-span-2 sm:col-span-1">
                  {renderField("full_name", "Full Name", "text", true)}
                </div>

                <div>
                  {renderField("phone_no", "Phone Number", "text")}
                </div>

                <div className="sm:col-span-2">
                  {renderField("email_id", "Email Address", "email")}
                </div>

                <div>
                  {renderField("aadhaar_no", "Aadhaar Number", "text")}
                </div>

                <div>
                  {renderField("username", "Username", "text", true)}
                </div>

                <div className="sm:col-span-2">
                  {renderField("password", "Password", "password")}
                </div>

                <div className="sm:col-span-2">
                  {renderField("is_active", "Status", "select", false, [
                    { value: 1, label: "Active" },
                    { value: 0, label: "Inactive" }
                  ])}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6 pt-4 sm:pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-sm sm:text-base"
              >
                Close
              </button>
              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md transition-colors text-sm sm:text-base"
                  >
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EmployeeModal;