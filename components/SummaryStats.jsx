import React from 'react';
import { Calendar, Check, Clock, X } from 'lucide-react';

const SummaryStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-1.5 rounded-lg bg-yellow-100">
            <Clock className="h-4 w-4 text-yellow-600" />
          </div>
          <div className="ml-2">
            <div className="text-lg font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-gray-600">Pending Requests</div>
          </div>
        </div>
      </div>
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-1.5 rounded-lg bg-green-100">
            <Check className="h-4 w-4 text-green-600" />
          </div>
          <div className="ml-2">
            <div className="text-lg font-bold text-green-600">{stats.approved}</div>
            <div className="text-xs text-gray-600">Approved Leaves</div>
          </div>
        </div>
      </div>
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-1.5 rounded-lg bg-red-100">
            <X className="h-4 w-4 text-red-600" />
          </div>
          <div className="ml-2">
            <div className="text-lg font-bold text-red-600">{stats.rejected}</div>
            <div className="text-xs text-gray-600">Rejected Requests</div>
          </div>
        </div>
      </div>
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-1.5 rounded-lg bg-blue-100">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div className="ml-2">
            <div className="text-lg font-bold text-blue-600">{stats.totalDays}</div>
            <div className="text-xs text-gray-600">Total Leave Days</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryStats;