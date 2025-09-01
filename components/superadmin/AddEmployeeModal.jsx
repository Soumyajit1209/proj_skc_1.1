import React from 'react';

const AddEmployeeModal = ({ show, setShow, formData, setFormData, error, setError, submitting, setSubmitting, branches, fetchEmployees, fetchStats, token }) => {
  if (!show) return null;

  const handleAddEmployee = async () => {
    if (!formData.employee_name.trim() || !formData.employee_phone.trim() || !formData.employee_username.trim() || !formData.employee_password.trim()) {
      setError('Full name, phone number, username, and password are required');
      return;
    }
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('full_name', formData.employee_name.trim());
      formDataToSend.append('phone_no', formData.employee_phone.trim());
      if (formData.employee_email.trim()) formDataToSend.append('email_id', formData.employee_email.trim());
      if (formData.employee_aadhaar.trim()) formDataToSend.append('aadhaar_no', formData.employee_aadhaar.trim());
      formDataToSend.append('username', formData.employee_username.trim());
      formDataToSend.append('password', formData.employee_password);
      if (formData.employee_branch_id) formDataToSend.append('branch_id', formData.employee_branch_id);
      if (formData.profile_picture) formDataToSend.append('profile_picture', formData.profile_picture);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/superadmin/employees`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend,
      });
      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          employee_name: '',
          employee_phone: '',
          employee_email: '',
          employee_aadhaar: '',
          employee_username: '',
          employee_password: '',
          employee_branch_id: '',
          profile_picture: null,
        }));
        setShow(false);
        await fetchEmployees();
        await fetchStats();
        alert('Employee added successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add employee');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShow(false);
    setError('');
    setFormData(prev => ({
      ...prev,
      employee_name: '',
      employee_phone: '',
      employee_email: '',
      employee_aadhaar: '',
      employee_username: '',
      employee_password: '',
      employee_branch_id: '',
      profile_picture: null,
    }));
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4">
          <h3 className="text-lg font-semibold text-gray-900">Add New Employee</h3>
        </div>
        
        <div className="p-4">
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="employee_name" className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                id="employee_name"
                name="employee_name"
                value={formData.employee_name}
                onChange={(e) => setFormData(prev => ({ ...prev, employee_name: e.target.value }))}
                disabled={submitting}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-green-500"
                placeholder="Enter full name"
              />
            </div>
            
            <div>
              <label htmlFor="employee_phone" className="block text-xs font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                id="employee_phone"
                name="employee_phone"
                value={formData.employee_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, employee_phone: e.target.value }))}
                disabled={submitting}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-green-500"
                placeholder="Enter phone number"
              />
            </div>
            
            <div>
              <label htmlFor="employee_email" className="block text-xs font-medium text-gray-700 mb-1">Email (Optional)</label>
              <input
                type="email"
                id="employee_email"
                name="employee_email"
                value={formData.employee_email}
                onChange={(e) => setFormData(prev => ({ ...prev, employee_email: e.target.value }))}
                disabled={submitting}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-green-500"
                placeholder="Enter email address"
              />
            </div>
            
            <div>
              <label htmlFor="employee_aadhaar" className="block text-xs font-medium text-gray-700 mb-1">Aadhaar Number (Optional)</label>
              <input
                type="text"
                id="employee_aadhaar"
                name="employee_aadhaar"
                value={formData.employee_aadhaar}
                onChange={(e) => setFormData(prev => ({ ...prev, employee_aadhaar: e.target.value }))}
                disabled={submitting}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-green-500"
                placeholder="Enter Aadhaar number"
              />
            </div>
            
            <div>
              <label htmlFor="employee_username" className="block text-xs font-medium text-gray-700 mb-1">Username *</label>
              <input
                type="text"
                id="employee_username"
                name="employee_username"
                value={formData.employee_username}
                onChange={(e) => setFormData(prev => ({ ...prev, employee_username: e.target.value }))}
                disabled={submitting}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-green-500"
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label htmlFor="employee_password" className="block text-xs font-medium text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                id="employee_password"
                name="employee_password"
                value={formData.employee_password}
                onChange={(e) => setFormData(prev => ({ ...prev, employee_password: e.target.value }))}
                disabled={submitting}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-green-500"
                placeholder="Enter password"
              />
            </div>
            
            <div>
              <label htmlFor="employee_branch_id" className="block text-xs font-medium text-gray-700 mb-1">Assign Branch (Optional)</label>
              <select
                id="employee_branch_id"
                name="employee_branch_id"
                value={formData.employee_branch_id}
                onChange={(e) => setFormData(prev => ({ ...prev, employee_branch_id: e.target.value }))}
                disabled={submitting}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-green-500"
              >
                <option value="">No Branch Assignment</option>
                {branches.map((branch) => (
                  <option key={branch.branch_id} value={branch.branch_id}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="profile_picture" className="block text-xs font-medium text-gray-700 mb-1">Profile Picture (Optional)</label>
              <input
                type="file"
                id="profile_picture"
                name="profile_picture"
                accept="image/*"
                onChange={(e) => setFormData(prev => ({ ...prev, profile_picture: e.target.files[0] }))}
                disabled={submitting}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-green-500"
              />
            </div>
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end space-x-2">
          <button
            onClick={closeModal}
            disabled={submitting}
            className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAddEmployee}
            disabled={submitting}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Add Employee'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;