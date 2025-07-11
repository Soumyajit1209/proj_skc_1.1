"use client"
import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Employee = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: 'John Doe',
      position: 'Manager',
      department: 'Sales',
      email: 'john.doe@company.com',
      phone: '+1 234 567 8900',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      position: 'Developer',
      department: 'IT',
      email: 'jane.smith@company.com',
      phone: '+1 234 567 8901',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      position: 'Analyst',
      department: 'Finance',
      email: 'mike.johnson@company.com',
      phone: '+1 234 567 8902',
      status: 'Inactive'
    }
  ]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleDeleteEmployee = (id) => {
    setEmployees(employees.filter(emp => emp.id !== id));
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
                <h1 className="text-2xl font-bold text-gray-800">Employee Management</h1>
                <p className="text-gray-600 mt-2">Manage your employee information</p>
              </div>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <Plus size={16} />
                <span>Add Employee</span>
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
              <div className="px-4 sm:px-6 py-4 border-b">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">Employee List</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                  <thead className="bg-blue-400">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Phone
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
                    {employees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-900 font-medium">{employee.name}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-600">{employee.position}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-600">{employee.department}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-600">{employee.email}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-600">{employee.phone}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            employee.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {employee.status}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800 p-1 rounded">
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteEmployee(employee.id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
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

export default Employee;