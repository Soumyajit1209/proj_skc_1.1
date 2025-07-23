"use client"
import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import Image from 'next/image';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 3) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login`, {
        username: formData.username,
        password: formData.password,
        role: 'admin'
      });

      const data = response.data;
      login(data.token, data.role);
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.error === 'error in username') {
          setErrors({ username: 'Username not found' });
        } else if (errorData.error === 'error in password') {
          setErrors({ password: 'Incorrect password' });
        } else if (errorData.error?.includes('password is not hashed')) {
          setErrors({ password: 'Please contact administrator to reset your password' });
        } else {
          setErrors({ general: errorData.error || 'Login failed' });
        }
      } else {
        setErrors({ general: 'Network error. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 overflow-hidden">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto h-16 w-40 sm:h-20 sm:w-48 lg:h-24 lg:w-56 relative mb-3">
            <Image
              src="/logo.png"
              alt="SADANA Logo"
              fill
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-1">
            Welcome Back
          </h1>
          <p className="text-slate-600 font-medium text-sm">
            Sign in to continue to your account
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
          <style jsx>{`
            input:-webkit-autofill,
            input:-webkit-autofill:hover,
            input:-webkit-autofill:focus,
            input:-webkit-autofill:active {
              -webkit-box-shadow: 0 0 0 30px white inset !important;
              -webkit-text-fill-color: #1e293b !important;
              background-color: white !important;
            }
            input[type="password"]:-webkit-autofill {
              -webkit-box-shadow: 0 0 0 30px white inset !important;
              -webkit-text-fill-color: #1e293b !important;
            }
          `}</style>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl p-4">
                <p className="text-sm text-red-600 font-medium">{errors.general}</p>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  autoComplete="username"
                  className={`block w-full pl-12 pr-4 py-3 bg-white border-2 rounded-xl focus:ring-0 focus:bg-white transition-all duration-200 placeholder:text-slate-400 text-slate-800 font-medium ${
                    errors.username 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-slate-200 focus:border-blue-500 hover:border-slate-300'
                  }`}
                  placeholder="Enter your username"
                  style={{ 
                    color: '#1e293b !important',
                    backgroundColor: 'white !important'
                  }}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-red-600 font-medium">{errors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="current-password"
                  className={`block w-full pl-12 pr-12 py-3 bg-white border-2 rounded-xl focus:ring-0 focus:bg-white transition-all duration-200 placeholder:text-slate-400 text-slate-800 font-medium ${
                    errors.password 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-slate-200 focus:border-blue-500 hover:border-slate-300'
                  }`}
                  placeholder="Enter your password"
                  style={{ 
                    color: '#1e293b !important',
                    backgroundColor: 'white !important'
                  }}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-slate-100 rounded-r-xl transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Forgot your password?{' '}
              <a href="#" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Contact Administrator
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;