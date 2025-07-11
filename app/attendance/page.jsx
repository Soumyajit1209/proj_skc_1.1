"use client"
import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Calendar, Download, Filter } from 'lucide-react';

const AttendanceReport = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState([
    {
      id: 1,
      employeeName: 'John Doe',
      date: '2025-07-11',
      checkIn: '09:00 AM',
      checkOut: '05:30 PM',
      workingHours: '8h 30m',
      status: 'Present',
      overtime: '0h 30m'
    },
    {
      id: 2,
      employeeName: 'Jane Smith',
      date: '2025-07-11',
      checkIn: '08:45 AM',
      checkOut: '05:15 PM',
      workingHours: '8h 30m',
      status: 'Present',
      overtime: '0h 30m'
    },
    {
      id: 3,
      employeeName: 'Mike Johnson',
      date: '2025-07-11',
      checkIn: '-',
      checkOut: '-',
      workingHours: '0h',
      status: 'Absent',
      overtime: '0h'
    },
    {
      id: 4,
      employeeName: 'Sarah Wilson',
      date: '2025-07-11',
      checkIn: '09:30 AM',
      checkOut: '02:00 PM',
      workingHours: '4h 30m',
      status: 'Half Day',
      overtime: '0h'
    }
  ]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Half Day':
        return 'bg-yellow-100 text-yellow-800';
      case 'Late':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
                <h1 className="text-2xl font-bold text-gray-800">Attendance Report</h1>
                <p className="text-gray-600 mt-2">Track and manage employee attendance</p>
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
                <div className="text-2xl font-bold text-green-600">3</div>
                <div className="text-sm text-gray-600">Present Today</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-red-600">1</div>
                <div className="text-sm text-gray-600">Absent Today</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-yellow-600">1</div>
                <div className="text-sm text-gray-600">Half Day</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-blue-600">75%</div>
                <div className="text-sm text-gray-600">Attendance Rate</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
              <div className="px-4 sm:px-6 py-4 border-b">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">Daily Attendance Report</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                  <thead className="bg-blue-400">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Check In
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Check Out
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Working Hours
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Overtime
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceData.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-900 font-medium">{record.employeeName}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-600">{record.date}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-600">{record.checkIn}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-600">{record.checkOut}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-600">{record.workingHours}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-600">{record.overtime}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
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

export default AttendanceReport;