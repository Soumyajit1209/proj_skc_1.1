import React from 'react';

const AddAdminModal = ({ show, setShow, formData, setFormData, error, setError, submitting, setSubmitting, branches, fetchAdmins, fetchStats, token }) => {
  if (!show) return null;

  const handleAddAdmin = async () => {
    if (!formData.admin_username.trim() || !formData.admin_password.trim() || !formData.selected_branch_id) {
      setError('Username, password, and branch are required');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/superadmin/add-admin`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.admin_username.trim(),
          password: formData.admin_password,
          email_id: formData.admin_email.trim() || undefined,
          branch_id: formData.selected_branch_id,
        }),
      });
      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          admin_username: '',
          admin_password: '',
          admin_email: '',
          selected_branch_id: '',
        }));
        setShow(false);
        await fetchAdmins();
        await fetchStats();
        alert('Admin added successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add admin');
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Branch Admin</h3>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label htmlFor="admin_username" className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
            <input
              type="text"
              id="admin_username"
              name="admin_username"
              value={formData.admin_username}
              onChange={(e) => setFormData(prev => ({ ...prev, admin_username: e.target.value }))}
              disabled={submitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label htmlFor="admin_password" className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
            <input
              type="password"
              id="admin_password"
              name="admin_password"
              value={formData.admin_password}
              onChange={(e) => setFormData(prev => ({ ...prev, admin_password: e.target.value }))}
              disabled={submitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              placeholder="Enter password"
            />
          </div>
          <div>
            <label htmlFor="admin_email" className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
            <input
              type="email"
              id="admin_email"
              name="admin_email"
              value={formData.admin_email}
              onChange={(e) => setFormData(prev => ({ ...prev, admin_email: e.target.value }))}
              disabled={submitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label htmlFor="selected_branch_id" className="block text-sm font-medium text-gray-700 mb-2">Assign Branch *</label>
            <select
              id="selected_branch_id"
              name="selected_branch_id"
              value={formData.selected_branch_id}
              onChange={(e) => setFormData(prev => ({ ...prev, selected_branch_id: e.target.value }))}
              disabled={submitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            >
              <option value="">Select a branch</option>
              {branches.map((branch) => (
                <option key={branch.branch_id} value={branch.branch_id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => {
              setShow(false);
              setError('');
              setFormData(prev => ({
                ...prev,
                admin_username: '',
                admin_password: '',
                admin_email: '',
                selected_branch_id: '',
              }));
            }}
            disabled={submitting}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAddAdmin}
            disabled={submitting}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Add Admin'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAdminModal;