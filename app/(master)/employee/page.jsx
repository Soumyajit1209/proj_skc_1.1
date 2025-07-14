"use client"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import EmployeeTable from "@/components/EmployeeTable"
import EmployeeModal from "@/components/EmployeeModal"
import AddEmployeeModal from "@/components/AddEmployeeModal"
import ErrorAlert from "@/components/ui/ErrorAlert"
import { Plus, X } from "lucide-react"
import { useAuth } from "../../../contexts/AuthContext"
import { useRouter } from "next/navigation"

const EmployeeManagement = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [employees, setEmployees] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is admin
  useEffect(() => {
    if (isAuthenticated && user?.role !== "admin") {
      setError("Access denied. Admin role required.")
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  // Fetch employees with JWT token from AuthContext
  const fetchEmployees = async () => {
    if (!isAuthenticated || user?.role !== "admin") {
      setError("Access denied. Admin role required.")
      logout()
      return
    }

    try {
      setLoading(true)
      const response = await fetch("http://localhost:3001/api/admin/all-employees", {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.status === 401) {
        setError("Session expired. Please login again.")
        logout()
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch employees")
      }

      const data = await response.json()
      setEmployees(data)
      setLoading(false)
    } catch (err) {
      setError(err.message || "Failed to fetch employees")
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
      setError("Access denied. Admin role required.")
      logout()
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/admin/employee/${updatedEmployee.emp_id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEmployee),
      })

      if (response.status === 401) {
        setError("Session expired. Please login again.")
        logout()
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update employee")
      }

      setIsModalOpen(false)
      fetchEmployees()
    } catch (err) {
      setError(err.message || "Failed to update employee")
    }
  }

  const handleDeleteEmployee = async (emp_id) => {
    if (!isAuthenticated || user?.role !== "admin") {
      setError("Access denied. Admin role required.")
      logout()
      return
    }

    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const response = await fetch(`http://localhost:3001/api/admin/employee/${emp_id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.status === 401) {
          setError("Session expired. Please login again.")
          logout()
          return
        }

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to delete employee")
        }

        fetchEmployees()
      } catch (err) {
        setError(err.message || "Failed to delete employee")
      }
    }
  }

  const handleAddEmployee = async (newEmployee) => {
    if (!isAuthenticated || user?.role !== "admin") {
      setError("Access denied. Admin role required.")
      logout()
      return
    }

    try {
      const response = await fetch("http://localhost:3001/api/admin/employee", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEmployee),
      })

      if (response.status === 401) {
        setError("Session expired. Please login again.")
        logout()
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add employee")
      }

      setIsAddModalOpen(false)
      fetchEmployees()
    } catch (err) {
      setError(err.message || "Failed to add employee")
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Render access denied message if not admin
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <X className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin role required to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header toggleSidebar={toggleSidebar} />

        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
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

            {/* Error Alert */}
            {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

            {/* Employee Table */}
            <EmployeeTable
              employees={employees}
              loading={loading}
              onViewEmployee={handleViewEmployee}
              onDeleteEmployee={handleDeleteEmployee}
            />

            {/* Modals */}
            {isModalOpen && selectedEmployee && (
              <EmployeeModal
                employee={selectedEmployee}
                onClose={() => setIsModalOpen(false)}
                onUpdate={handleUpdateEmployee}
              />
            )}

            {isAddModalOpen && <AddEmployeeModal onClose={() => setIsAddModalOpen(false)} onAdd={handleAddEmployee} />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default EmployeeManagement