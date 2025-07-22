"use client"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import EmployeeTable from "@/components/EmployeeTable"
import EmployeeModal from "@/components/EmployeeModal"
import AddEmployeeModal from "@/components/AddEmployeeModal"
import ErrorAlert from "@/components/ui/ErrorAlert"
import { Plus, X, Filter } from "lucide-react"
import { useAuth } from "../../../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'

const EmployeeManagement = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'active', 'inactive'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is admin
  useEffect(() => {
    if (isAuthenticated && user?.role !== "admin") {
      setError("Access denied. Admin role required.")
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  // Filter employees based on is_active status
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredEmployees(employees)
    } else if (statusFilter === 'active') {
      setFilteredEmployees(employees.filter(emp => emp.is_active === 1))
    } else if (statusFilter === 'inactive') {
      setFilteredEmployees(employees.filter(emp => emp.is_active === 0))
    }
  }, [employees, statusFilter])

  // Fetch employees with JWT token from AuthContext
  const fetchEmployees = async () => {
    if (!isAuthenticated || user?.role !== "admin") {
      toast.error("Access denied. Admin role required.", { toastId: "auth-error" })
      logout()
      return
    }

     try {
      setLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/all-employees`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.status === 401) {
        toast.error("Session expired. Please login again.", { toastId: "session-expired" })
        logout()
        return
      }

      setEmployees(response.data)
      setLoading(false)
      // toast.success("Employees loaded successfully", { toastId: "fetch-employees-success" })
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to fetch employees"
      toast.error(errorMessage, { toastId: "fetch-employees-error" })
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchEmployees()
    }
  }, [isAuthenticated, user])

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee)
    setIsModalOpen(true)
  }

  const handleUpdateEmployee = async (updatedEmployee) => {
    if (!isAuthenticated || user?.role !== "admin") {
      toast.error("Access denied. Admin role required.", { toastId: "auth-error-update" })
      logout()
      return
    }

     try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/employee/${updatedEmployee.get('emp_id')}`,
        updatedEmployee,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )

      if (response.status === 401) {
        toast.error("Session expired. Please login again.", { toastId: "session-expired-update" })
        logout()
        return 
      }

      setIsModalOpen(false)
      fetchEmployees()
      toast.success("Employee updated successfully", { toastId: "update-employee-success" })
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to update employee"
      toast.error(errorMessage, { toastId: "update-employee-error" })
    }
  }

  const handleAddEmployee = async (newEmployee) => {
    if (!isAuthenticated || user?.role !== "admin") {
      toast.error("Access denied. Admin role required.", { toastId: "auth-error-add" })
      logout()
      return
    }

    try {
      const formData = new FormData();
      formData.append('full_name', newEmployee.full_name);
      formData.append('phone_no', newEmployee.phone_no);
      formData.append('email_id', newEmployee.email_id);
      formData.append('aadhaar_no', newEmployee.aadhaar_no);
      formData.append('username', newEmployee.username);
      formData.append('password', newEmployee.password);
      formData.append('is_active', newEmployee.is_active);
      if (newEmployee.profilePictureFile) {
        formData.append('profile_picture', newEmployee.profilePictureFile);
      }

        const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/employee`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.status === 401) {
        toast.error("Session expired. Please login again.", { toastId: "session-expired-add" })
        logout()
        return
      }

      setIsAddModalOpen(false)
      fetchEmployees()
      toast.success("Employee added successfully", { toastId: "add-employee-success" })
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to add employee"
      toast.error(errorMessage, { toastId: "add-employee-error" })
    }
  }

  const handleDeleteEmployee = async (emp_id) => {
    if (!isAuthenticated || user?.role !== "admin") {
      toast.error("Access denied. Admin role required.", { toastId: "auth-error-delete" })
      logout()
      return
    }

     try {
      console.log("Deleting employee ID:", emp_id) // Debug log
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/employee/${emp_id}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      )
      if (response.status === 401) {
        toast.error("Session expired. Please login again.", { toastId: "session-expired-delete" })
        logout()
        return
      }

      if (response.status === 404) {
        toast.error("Employee not found. They may have already been deleted.", { toastId: "delete-employee-404" })
        return
      }

      fetchEmployees()
      toast.success("Employee deleted successfully", { toastId: "delete-employee-success" })
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to delete employee"
      toast.error(errorMessage, { toastId: "delete-employee-error" })
    } finally {
      setIsDeleteModalOpen(false)
      setEmployeeToDelete(null)
    }
  }

  const handleRequestDelete = (employee) => {
    if (!employee || !employee.emp_id) {
      toast.error("Invalid employee selected for deletion", { toastId: "invalid-employee-delete" })
      return
    }
    setEmployeeToDelete(employee)
    setIsDeleteModalOpen(true)
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Get is_active status counts
  const statusCounts = {
    all: employees.length,
    active: employees.filter(emp => emp.is_active === 1).length,
    inactive: employees.filter(emp => emp.is_active === 0).length
  }

  // Status Filter Component
  const StatusFilter = () => (
    <div className="flex items-center gap-2 mb-4">
      <Filter size={16} className="text-gray-500" />
      <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
      <div className="flex gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({statusCounts.all})
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            statusFilter === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Active ({statusCounts.active})
        </button>
        <button
          onClick={() => setStatusFilter('inactive')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            statusFilter === 'inactive'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Inactive ({statusCounts.inactive})
        </button>
      </div>
    </div>
  )

  // Delete Confirmation Modal Component
  const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, employee }) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium text-gray-900">Confirm Deletion</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete {employee?.full_name || employee?.name || 'this employee'}? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(employee.emp_id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render access denied message if not admin
  // if (!isAuthenticated || user?.role !== "admin") {
  //   return (
  //     <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
  //       <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
  //         <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
  //           <X className="w-6 h-6 text-red-600" />
  //         </div>
  //         <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
  //         <p className="text-gray-600">Admin role required to access this page.</p>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Employee Management</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your team members</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-sky-600 hover:bg-sky-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                <Plus size={16} />
                <span className="sm:inline">Add Employee</span>
              </button>
            </div>
            
            {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
            
            <StatusFilter />
            
            <EmployeeTable
              employees={filteredEmployees}
              loading={loading}
              onViewEmployee={handleViewEmployee}
              onDeleteEmployee={handleRequestDelete}
            />
            
            {isModalOpen && selectedEmployee && (
              <EmployeeModal
                employee={selectedEmployee}
                onClose={() => setIsModalOpen(false)}
                onUpdate={handleUpdateEmployee}
              />
            )}
            
            {isAddModalOpen && (
              <AddEmployeeModal
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddEmployee}
              />
            )}
            
            {isDeleteModalOpen && employeeToDelete && (
              <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteEmployee}
                employee={employeeToDelete}
              />
            )}
            
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </main>
      </div>
    </div>
  )
}

export default EmployeeManagement