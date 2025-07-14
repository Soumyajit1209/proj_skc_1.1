"use client"

import React from "react"
import { X, AlertCircle } from "lucide-react"



const ErrorAlert = ({ message, onClose }) => {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-center justify-between">
      <div className="flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="text-red-500 hover:text-red-700 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export default ErrorAlert
