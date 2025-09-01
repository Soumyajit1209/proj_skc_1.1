import React from 'react';

const AssignBranchModal = ({ show, setShow, formData, setFormData, error, setError, submitting, setSubmitting, branches, selectedEmployee, setSelectedEmployee, fetchEmployees, fetchStats, token }) => {
  if (!show || !selectedEmployee) return null;

  const handleAssignBranch = async () => {
    if (!formData.selected_branch_id) {
      setError('Please select a branch');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/superadmin/employees/${selectedEmployee.emp_id}/assign-branch`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch_id: formData.selected_branch_id }),
      });
      if (response.ok) {
        setFormData(prev => ({ ...prev, selected_branch_id: '' }));
        setShow(false);
        setSelectedEmployee(null);
        await fetchEmployees();
        await fetchStats();
        alert('Branch assigned successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to assign branch');
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Branch</h3>
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Employee:</strong> {selectedEmployee.full_name}
          </p>
          <p className="text-sm text-blue-700">
            <strong>Current Branch:</strong> {selectedEmployee.branch_name || 'Unallocated'}
          </p>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label htmlFor="selected_branch_id" className="block text-sm font-medium text-gray-700 mb-2">Select New Branch</label>
            <select
              id="selected_branch_id"
              name="selected_branch_id"
              value={formData.selected_branch_id}
              onChange={(e) => setFormData(prev => ({ ...prev, selected_branch_id: e.target.value }))}
              disabled={submitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Choose a branch</option>
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
              setSelectedEmployee(null);
              setError('');
              setFormData(prev => ({ ...prev, selected_branch_id: '' }));
            }}
            disabled={submitting}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAssignBranch}
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Assigning...' : 'Assign Branch'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignBranchModal;