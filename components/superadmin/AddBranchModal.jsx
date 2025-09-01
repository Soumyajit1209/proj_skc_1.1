import React from 'react';

const AddBranchModal = ({ show, setShow, formData, setFormData, error, setError, submitting, setSubmitting, fetchBranches, fetchStats, token }) => {
  if (!show) return null;

  const handleAddBranch = async () => {
    if (!formData.branch_name.trim()) {
      setError('Branch name is required');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/superadmin/add-branch`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch_name: formData.branch_name.trim() }),
      });
      if (response.ok) {
        setFormData(prev => ({ ...prev, branch_name: '' }));
        setShow(false);
        await fetchBranches();
        await fetchStats();
        alert('Branch added successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add branch');
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Branch</h3>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label htmlFor="branch_name" className="block text-sm font-medium text-gray-700 mb-2">Branch Name *</label>
            <input
              type="text"
              id="branch_name"
              name="branch_name"
              value={formData.branch_name}
              onChange={(e) => setFormData(prev => ({ ...prev, branch_name: e.target.value }))}
              disabled={submitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter branch name"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => {
              setShow(false);
              setError('');
              setFormData(prev => ({ ...prev, branch_name: '' }));
            }}
            disabled={submitting}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAddBranch}
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Add Branch'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBranchModal;