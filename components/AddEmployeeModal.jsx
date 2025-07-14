"use client"

import { useState } from "react"
import { X, User, Upload } from "lucide-react"
import { toast } from 'react-toastify'

const AddEmployeeModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    phone_no: "",
    email_id: "",
    aadhaar_no: "",
    username: "",
    password: "",
    profile_picture: "",
    is_active: 1,
  })
  const [previewImage, setPreviewImage] = useState(null)

  // Debug log to verify onAdd prop
  console.log("AddEmployeeModal: onAdd prop received:", typeof onAdd)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file", { toastId: "invalid-image-type" })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should not exceed 5MB", { toastId: "image-size-exceeded" })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result
        setFormData({ ...formData, profile_picture: result })
        setPreviewImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Validate required fields
    if (!formData.full_name || !formData.username || !formData.password) {
      toast.error("Full Name, Username, and Password are required", { toastId: "required-fields-error" })
      return
    }
    if (!onAdd) {
      toast.error("Add employee handler is not defined", { toastId: "onAdd-undefined" })
      console.error("AddEmployeeModal: onAdd is undefined")
      return
    }
    console.log("AddEmployeeModal: Submitting formData:", formData) // Debug log
    onAdd(formData)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "is_active" ? Number.parseInt(value) : value,
    })
  }

  const handleClose = () => {
    setFormData({
      full_name: "",
      phone_no: "",
      email_id: "",
      aadhaar_no: "",
      username: "",
      password: "",
      profile_picture: "",
      is_active: 1,
    })
    setPreviewImage(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add New Employee</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
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
                <label className="cursor-pointer inline-flex items-center justify-center px-3 py-2 bg-sky-50 text-sky-700 rounded-md hover:bg-sky-100 transition-colors text-sm w-full sm:w-auto">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="sm:col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone_no"
                  value={formData.phone_no}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email_id"
                  value={formData.email_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
                <input
                  type="text"
                  name="aadhaar_no"
                  value={formData.aadhaar_no}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="is_active"
                  value={formData.is_active}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md transition-colors text-sm sm:text-base"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEmployeeModal