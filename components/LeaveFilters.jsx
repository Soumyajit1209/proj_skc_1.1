
import React from 'react';
import { Filter } from 'lucide-react';

const LeaveFilters = ({ showFilters, filterStatus, setFilterStatus, filterDateRange, setFilterDateRange, stats }) => {
  if (!showFilters) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
      <h3 className="text-base sm:text-lg font-semibold mb-4">Filters</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="ALL">All Status ({stats.pending + stats.approved + stats.rejected})</option>
            <option value="PENDING">Pending ({stats.pending})</option>
            <option value="APPROVED">Approved ({stats.approved})</option>
            <option value="REJECTED">Rejected ({stats.rejected})</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
          <input
            type="date"
            value={filterDateRange.from}
            onChange={(e) => setFilterDateRange({ ...filterDateRange, from: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
          <input
            type="date"
            value={filterDateRange.to}
            onChange={(e) => setFilterDateRange({ ...filterDateRange, to: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default LeaveFilters;