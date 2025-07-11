"use client"
import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Calendar, Download, Filter, Plus } from 'lucide-react';

const LeaveReport = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leaveData, setLeaveData] = useState([
    {
      id: 1,
      employeeName: 'John Doe',
      leaveType: 'Casual Leave',
      fromDate: '2025-07-15',
      toDate: '2025-07-17',
      days: 3,
      reason: 'Personal work',
      status: 'Approved',
      appliedDate: '2025-07-10'
    },
    {
      id: 2,
      employeeName: 'Jane Smith',
      leaveType: 'Sick Leave',
      fromDate: '2025-07-12',
      toDate: '2025-07-12',
      days: 1,
      reason: 'Fever',
      status: 'Approved',
      appliedDate: '2025-07-11'
    },
    {
      id: 3,
      employeeName: 'Mike Johnson',
      leaveType: 'Annual Leave',
      fromDate: '2025-07-20',
      toDate: '2025-07-25',
      days: 6,
      reason: 'Family vacation',
      status: 'Pending',
      appliedDate: '2025-07-09'
    },
    {
      id: 4,
      employeeName: 'Sarah Wilson',
      leaveType: 'Maternity Leave',
      fromDate: '2025-08-01',
      toDate: '2025-11-30',
      days: 90,
      reason: 'Maternity leave',
      status: 'Approved',
      appliedDate: '2025-07-01'
    }
  ]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'Casual Leave':
        return 'bg-blue-100 text-blue-800';
      case 'Sick Leave':
        return 'bg-orange-100 text-orange-800';
      case 'Annual Leave':
        return 'bg-purple-100 text-purple-800';
      case 'Maternity Leave':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setLeaveData(leaveData.map(leave => 
      leave.id === id 
        ? { ...leave, status: newStatus }
        : leave
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 p-2 sm:p-3.5">
          <div className="w-full max-w-7xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Leave Report</h1>
                <p className="text-gray-600 mt-2">Manage employee leave requests and history</p>
              </div>
              <div className="flex space-x-3">
                <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                  <Filter size={16} />
                  <span>Filter</span>
                </button>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                  <Download size={16} />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-yellow-600">1</div>
                <div className="text-sm text-gray-600">Pending Requests</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-green-600">3</div>
                <div className="text-sm text-gray-600">Approved Leaves</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-red-600">0</div>
                <div className="text-sm text-gray-600">Rejected Requests</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-blue-600">100</div>
                <div className="text-sm text-gray-600">Total Leave Days</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
              <div className="px-4 sm:px-6 py-4 border-b">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">Leave Applications</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                  <thead className="bg-blue-400">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Leave Type
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        From Date
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        To Date
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Days
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaveData.map((leave) => (
                      <tr key={leave.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-900 font-medium">{leave.employeeName}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(leave.leaveType)}`}>
                            {leave.leaveType}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-600">{leave.fromDate}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-600">{leave.toDate}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-600 font-medium">{leave.days}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap max-w-xs">
                          <span className="text-gray-600 truncate block">{leave.reason}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                            {leave.status}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          {leave.status === 'Pending' && (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleStatusChange(leave.id, 'Rejected')}
                                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LeaveReport;