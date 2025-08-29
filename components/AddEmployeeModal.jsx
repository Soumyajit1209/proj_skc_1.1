"use client";

import { useState, useEffect } from "react";
import { X, User, Upload } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const AddEmployeeModal = ({ onClose, onAdd, adminBranchId }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    full_name: "",
    phone_no: "",
    email_id: "",
    aadhaar_no: "",
    username: "",
    password: "",
    is_active: 1,
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [branchName, setBranchName] = useState("");
  const [errors, setErrors] = useState({});

  // Debug log to verify props and user
  console.log("AddEmployeeModal: Props and user:", {
    onAdd: typeof onAdd,
    adminBranchId,
    userBranchId: user?.branch_id,
  });

  // Fetch branch name for display
  useEffect(() => {
    const fetchBranchName = async () => {
      if (!adminBranchId || !user?.token) {
        setBranchName("Unknown Branch");
        return;
      }
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/branches`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const branch = response.data.find((b) => b.branch_id === adminBranchId);
        setBranchName(branch?.branch_name || "Unknown Branch");
      } catch (error) {
        console.error("Error fetching branch name:", error);
        setBranchName("Unknown Branch");
      }
    };
    fetchBranchName();
  }, [adminBranchId, user?.token]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file", { toastId: "invalid-image-type" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should not exceed 5MB", { toastId: "image-size-exceeded" });
        return;
      }

      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "is_active" ? Number.parseInt(value) : value,
    });
    // Clear error for the field being edited
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name) newErrors.full_name = "Full Name is required";
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill all required fields", { toastId: "required-fields-error" });
      return;
    }
    if (!adminBranchId) {
      toast.error("Branch information missing. Please contact support.", {
        toastId: "missing-branch-id",
      });
      return;
    }
    if (!onAdd) {
      toast.error("Add employee handler is not defined", { toastId: "onAdd-undefined" });
      console.error("AddEmployeeModal: onAdd is undefined");
      return;
    }

    const employeeData = {
      ...formData,
      profilePictureFile,
      branch_id: adminBranchId, // Set branch_id to admin's branch_id
    };

    console.log("AddEmployeeModal: Submitting employeeData:", employeeData); // Debug log
    onAdd(employeeData);
  };

  const handleClose = () => {
    setFormData({
      full_name: "",
      phone_no: "",
      email_id: "",
      aadhaar_no: "",
      username: "",
      password: "",
      is_active: 1,
    });
    setProfilePictureFile(null);
    setPreviewImage(null);
    setBranchName("");
    setErrors({});
    onClose();
  };

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
                      src={previewImage}
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
              <div className="lg:col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                  required
                />
                {errors.full_name && <p className="text-red-600 text-sm mt-1">{errors.full_name}</p>}
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
                {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username}</p>}
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
                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <input
                  type="text"
                  value={branchName}
                  disabled
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md bg-gray-100"
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
  );
};

export default AddEmployeeModal;