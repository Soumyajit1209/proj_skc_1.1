"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { Building2, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'admin',
    branch_name: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.role === 'admin' && !formData.branch_name) newErrors.branch_name = 'Branch is required for admin';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchBranches = useCallback(async () => {
    try {
      setLoadingBranches(true);
      const response = await fetch(`${API_BASE_URL}/api/branches`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched branches:', data);
        setBranches(data);
      } else {
        console.error('Failed to fetch branches:', response.status);
        setBranches([]);
        setErrors({ branch_name: 'Unable to load branches. Please try again.' });
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]);
      setErrors({ branch_name: 'Network error. Unable to load branches.' });
    } finally {
      setLoadingBranches(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    if (formData.role === 'admin') {
      fetchBranches();
    } else {
      setBranches([]);
      setFormData((prev) => ({ ...prev, branch_name: '' }));
    }
  }, [formData.role, fetchBranches]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const url = formData.role === 'superadmin' 
        ? `${API_BASE_URL}/api/superadmin-login`
        : `${API_BASE_URL}/api/login`;

      const requestBody = formData.role === 'superadmin'
        ? {
            username: formData.username.trim(),
            password: formData.password,
            role: 'superadmin',
          }
        : {
            username: formData.username.trim(),
            password: formData.password,
            role: 'admin',
            branch_name: formData.branch_name.trim(),
          };

      console.log('API Request:', { url, body: requestBody });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('API Response:', { status: response.status, statusText: response.statusText });
      const responseData = await response.json();
      console.log('API Response Data:', responseData);

      if (response.ok) {
        const { token, role, user } = responseData;
        login(token, role, user);
        
      } else {
        if (responseData.error === 'Invalid username') {
          setErrors({ username: `Username not found for ${formData.role === 'superadmin' ? 'Super Admin' : 'Admin'} role` });
        } else if (responseData.error === 'Invalid username or branch mismatch') {
          setErrors({
            username: 'Username not found or does not match the selected branch',
            branch_name: 'Please verify the branch selection',
          });
        } else if (responseData.error === 'Invalid password') {
          setErrors({ password: 'Incorrect password' });
        } else if (responseData.error === 'Invalid branch name') {
          setErrors({ branch_name: 'Invalid branch selected' });
        } else {
          setErrors({ general: responseData.error || 'An unexpected error occurred. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Network error. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27 width=%2732%27 height=%2732%27 fill=%27none%27 stroke=%27rgb(59 130 246 / 0.05)%27%3e%3cpath d=%27m0 .5 32 32M31.5 0 0 31.5%27/%3e%3c/svg%3e')] opacity-100"></div>
      
      <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-white/30 p-6 max-w-sm w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-3">
            <User className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Welcome Back</h1>
          <p className="text-gray-600 text-sm">Sign in to your account</p>
        </div>

        {/* Error Alert */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 text-sm font-medium">Authentication Error</p>
              <p className="text-red-700 text-sm mt-1">{errors.general}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-1.5">
            <label htmlFor="role" className="block text-xs font-semibold text-gray-700">
              Account Type
            </label>
            <div className="relative">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="block w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-900 font-medium appearance-none cursor-pointer text-sm"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.25em 1.25em',
                  paddingRight: '2rem'
                }}
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label htmlFor="username" className="block text-xs font-semibold text-gray-700">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`block w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-gray-900 font-medium placeholder-gray-400 text-sm ${
                  errors.username
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-200 focus:border-blue-500'
                }`}
                placeholder="Enter username"
              />
            </div>
            {errors.username && (
              <div className="flex items-center gap-1.5 mt-1">
                <AlertCircle className="h-3 w-3 text-red-500" />
                <p className="text-xs text-red-600 font-medium">{errors.username}</p>
              </div>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`block w-full pl-9 pr-10 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-gray-900 font-medium placeholder-gray-400 text-sm ${
                  errors.password
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-200 focus:border-blue-500'
                }`}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <div className="flex items-center gap-1.5 mt-1">
                <AlertCircle className="h-3 w-3 text-red-500" />
                <p className="text-xs text-red-600 font-medium">{errors.password}</p>
              </div>
            )}
          </div>

          {/* Branch Selection for Admin */}
          {formData.role === 'admin' && (
            <div className="space-y-1.5">
              <label htmlFor="branch_name" className="block text-xs font-semibold text-gray-700">
                Branch Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  id="branch_name"
                  name="branch_name"
                  value={formData.branch_name}
                  onChange={handleInputChange}
                  disabled={loadingBranches}
                  className={`block w-full pl-9 pr-8 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-gray-900 font-medium appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                    errors.branch_name
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.25em 1.25em',
                  }}
                >
                  <option value="">
                    {loadingBranches ? 'Loading...' : 'Select branch'}
                  </option>
                  {branches.map((branch) => (
                    <option key={branch.branch_id} value={branch.branch_name}>
                      {branch.branch_name}
                    </option>
                  ))}
                </select>
                {loadingBranches && (
                  <div className="absolute inset-y-0 right-6 flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-300 border-t-blue-600"></div>
                  </div>
                )}
              </div>
              {errors.branch_name && (
                <div className="flex items-center gap-1.5 mt-1">
                  <AlertCircle className="h-3 w-3 text-red-500" />
                  <p className="text-xs text-red-600 font-medium">{errors.branch_name}</p>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:shadow-sm text-sm"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-4 text-center">
          <a 
            href="/forgot-password" 
            className="text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors inline-flex items-center gap-1 group"
          >
            Forgot password?
            <span className="group-hover:translate-x-0.5 transition-transform text-xs">→</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;