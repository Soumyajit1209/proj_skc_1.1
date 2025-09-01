import React from 'react';

const ResetPasswordModal = ({ show, setShow, formData, setFormData, error, setError, submitting, setSubmitting, selectedEmployee, setSelectedEmployee, token }) => {
  if (!show || !selectedEmployee) return null;

  const handleResetPassword = async () => {
    if (!formData.new_password.trim()) {
      setError('New password is required');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/superadmin/employees/${selectedEmployee.emp_id}/reset-password`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: formData.new_password }),
      });
      if (response.ok) {
        setFormData(prev => ({ ...prev, new_password: '' }));
        setShow(false);
        setSelectedEmployee(null);
        alert('Password reset successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to reset password');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reset Password</h3>
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            <strong>Employee:</strong> {selectedEmployee.full_name}
          </p>
          <p className="text-sm text-yellow-700">
            <strong>Username:</strong> {selectedEmployee.username}
          </p>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              value={formData.new_password}
              onChange={(e) => setFormData(prev => ({ ...prev, new_password: e.target.value }))}
              disabled={submitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500"
              placeholder="Enter new password"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => {
              setShow(false);
              setSelectedEmployee(null);
              setError('');
              setFormData(prev => ({ ...prev, new_password: '' }));
            }}
            disabled={submitting}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleResetPassword}
            disabled={submitting}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;