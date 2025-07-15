import React, { useState, useMemo } from 'react';
import { Eye, Trash2, User, Phone, Mail, MoreVertical, Search, X } from 'lucide-react';

const EmployeeTable = ({ employees, loading, onViewEmployee, onDeleteEmployee }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = useMemo(() => {
    let result = employees;
    
    if (searchTerm) {
      result = employees.filter(employee =>
        employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phone_no?.includes(searchTerm) ||
        employee.emp_id.toString().includes(searchTerm)
      );
    }

    // Sort employees alphabetically by full_name
    return [...result].sort((a, b) => 
      a.full_name.localeCompare(b.full_name)
    );
  }, [employees, searchTerm]);

  const toggleDropdown = (empId) => {
    setActiveDropdown(activeDropdown === empId ? null : empId);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Status Badge Component
  const StatusBadge = ({ is_active }) => {
    const isActive = is_active === 1;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
          isActive ? 'bg-green-500' : 'bg-red-500'
        }`} />
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  // Mobile Card Component
  const EmployeeCard = ({ employee }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {employee.profile_picture ? (
              <img
                src={`http://localhost:3001${employee.profile_picture}`}
                alt={employee.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">{employee.full_name}</h3>
            <p className="text-xs text-gray-500">ID: {employee.emp_id}</p>
            <p className="text-xs text-gray-500 truncate">@{employee.username}</p>
            <div className="mt-1">
              <StatusBadge is_active={employee.is_active} />
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => toggleDropdown(employee.emp_id)}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <MoreVertical size={16} />
          </button>

          {activeDropdown === employee.emp_id && (
            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <button
                onClick={() => {
                  onViewEmployee(employee);
                  setActiveDropdown(null);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <Eye size={14} className="mr-2" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDeleteEmployee(employee);
                  setActiveDropdown(null);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <Trash2 size={14} className="mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 space-y-1">
        <div className="flex items-center text-xs text-gray-600">
          <Phone className="w-3 h-3 mr-1" />
          <span className="truncate">{employee.phone_no || "No phone"}</span>
        </div>
        <div className="flex items-center text-xs text-gray-600">
          <Mail className="w-3 h-3 mr-1" />
          <span className="truncate">{employee.email_id || "No email"}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-3 sm:px-4 py-2 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-sm sm:text-base font-medium text-gray-900">
            Employee Directory ({filteredEmployees.length})
          </h2>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full sm:w-64 pl-10 pr-8 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 placeholder-gray-400"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="block sm:hidden">
        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-600"></div>
              <span className="ml-2 text-sm text-gray-600">Loading...</span>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-4">
              <User className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">
                {searchTerm ? 'No employees found matching your search' : 'No employees found'}
              </p>
            </div>
          ) : (
            filteredEmployees.map((employee) => (
              <EmployeeCard key={employee.emp_id} employee={employee} />
            ))
          )}
        </div>
      </div>

      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-3 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="hidden md:table-cell px-3 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-3 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 lg:px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-3 lg:px-4 py-6 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-600"></div>
                    <span className="ml-2 text-gray-600">Loading employees...</span>
                  </div>
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 lg:px-4 py-6 text-center">
                  <User className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">
                    {searchTerm ? 'No employees found matching your search' : 'No employees found'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => (
                <tr key={employee.emp_id} className="hover:bg-gray-50">
                  <td className="px-3 lg:px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 mr-3-">
                        {employee.profile_picture ? (
                          <img
                            src={`http://localhost:3001${employee.profile_picture}`}
                            alt={employee.full_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 wokół flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">{employee.full_name}</div>
                        <div className="text-xs text-gray-500">ID: {employee.emp_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 lg:px-4 py-2">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Phone className="w-3 h-3 mr-1 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{employee.phone_no || "N/A"}</span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center mt-0.5">
                      <Mail className="w-3 h-3 mr-1 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{employee.email_id || "N/A"}</span>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-3 lg:px-4 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-900">@{employee.username}</span>
                  </td>
                  <td className="px-3 lg:px-4 py-2 whitespace-nowrap">
                    <StatusBadge is_active={employee.is_active} />
                  </td>
                  <td className="px-3 lg:px-4 py-2 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-1">
                      <button
                        onClick={() => onViewEmployee(employee)}
                        className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                        title="View/Edit Employee"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteEmployee(employee)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Employee"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;